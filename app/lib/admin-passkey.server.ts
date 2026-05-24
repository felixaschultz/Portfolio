import { randomUUID } from "node:crypto";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";
import { ensureDatabaseReady, getSql } from "./db.server";
import type { AdminUser } from "./admin-auth.server";
import { getSiteUrl } from "./seo";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

function rpId(): string {
  const fromEnv = process.env.WEBAUTHN_RP_ID?.trim();
  if (fromEnv) return fromEnv;
  try {
    return new URL(getSiteUrl()).hostname;
  } catch {
    return "localhost";
  }
}

function origin(): string {
  const fromEnv = process.env.WEBAUTHN_ORIGIN?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return getSiteUrl().replace(/\/$/, "");
}

async function storeChallenge(
  challenge: string,
  type: "authentication" | "registration",
  userId: string | null,
): Promise<void> {
  const db = getSql();
  if (!db) return;

  const expires = new Date(Date.now() + CHALLENGE_TTL_MS).toISOString();
  await db`
    INSERT INTO admin_webauthn_challenges (challenge, user_id, type, expires_at)
    VALUES (${challenge}, ${userId}, ${type}, ${expires}::timestamptz)
    ON CONFLICT (challenge) DO UPDATE SET
      user_id = EXCLUDED.user_id,
      type = EXCLUDED.type,
      expires_at = EXCLUDED.expires_at
  `;
}

async function consumeChallenge(
  challenge: string,
  type: "authentication" | "registration",
  userId: string | null,
): Promise<boolean> {
  const db = getSql();
  if (!db) return false;

  const rows = await db<{ challenge: string }[]>`
    DELETE FROM admin_webauthn_challenges
    WHERE challenge = ${challenge}
      AND type = ${type}
      AND (${userId}::text IS NULL OR user_id = ${userId})
      AND expires_at > NOW()
    RETURNING challenge
  `;
  return rows.length > 0;
}

export async function getPasskeyAuthenticationOptions(email: string): Promise<
  | { options: Awaited<ReturnType<typeof generateAuthenticationOptions>> }
  | { error: string }
> {
  if (!(await ensureDatabaseReady())) return { error: "Database is not configured." };

  const db = getSql();
  if (!db) return { error: "Database is not configured." };

  const normalized = email.trim().toLowerCase();
  const users = await db<{ id: string }[]>`
    SELECT id FROM admin_users WHERE email = ${normalized} LIMIT 1
  `;
  const user = users[0];
  if (!user) return { error: "No passkeys for this account." };

  const passkeys = await db<
    { credentialId: string; transports: string | null }[]
  >`
    SELECT credential_id AS "credentialId", transports
    FROM admin_passkeys
    WHERE user_id = ${user.id}
  `;
  if (passkeys.length === 0) return { error: "No passkeys registered for this account." };

  const options = await generateAuthenticationOptions({
    rpID: rpId(),
    timeout: 60_000,
    allowCredentials: passkeys.map((pk) => ({
      id: pk.credentialId,
      transports: (pk.transports?.split(",") ?? []) as AuthenticatorTransportFuture[],
    })),
    userVerification: "preferred",
  });

  await storeChallenge(options.challenge, "authentication", user.id);
  return { options };
}

export async function verifyPasskeyAuthentication(
  email: string,
  response: AuthenticationResponseJSON,
): Promise<{ user: AdminUser } | { error: string }> {
  if (!(await ensureDatabaseReady())) return { error: "Database is not configured." };

  const db = getSql();
  if (!db) return { error: "Database is not configured." };

  const normalized = email.trim().toLowerCase();
  const users = await db<AdminUser[]>`
    SELECT id, email, display_name AS "displayName"
    FROM admin_users
    WHERE email = ${normalized}
    LIMIT 1
  `;
  const user = users[0];
  if (!user) return { error: "Authentication failed." };

  const clientData = JSON.parse(
    Buffer.from(response.response.clientDataJSON, "base64url").toString("utf8"),
  ) as { challenge?: string };
  const challenge = clientData.challenge;
  if (!challenge || !(await consumeChallenge(challenge, "authentication", user.id))) {
    return { error: "Challenge expired or invalid." };
  }

  const passkeys = await db<
    {
      credentialId: string;
      publicKey: string;
      counter: string;
      transports: string | null;
    }[]
  >`
    SELECT
      credential_id AS "credentialId",
      public_key AS "publicKey",
      counter::text AS counter,
      transports
    FROM admin_passkeys
    WHERE user_id = ${user.id}
  `;

  const credentialId = response.id;
  const passkey = passkeys.find((pk) => pk.credentialId === credentialId);
  if (!passkey) return { error: "Unknown passkey." };

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: origin(),
    expectedRPID: rpId(),
    credential: {
      id: passkey.credentialId,
      publicKey: Buffer.from(passkey.publicKey, "base64url"),
      counter: Number(passkey.counter),
      transports: (passkey.transports?.split(",") ?? []) as AuthenticatorTransportFuture[],
    },
  });

  if (!verification.verified) return { error: "Authentication failed." };

  await db`
    UPDATE admin_passkeys
    SET counter = ${verification.authenticationInfo.newCounter}
    WHERE credential_id = ${credentialId}
  `;

  return { user };
}

export async function getPasskeyRegistrationOptions(
  user: AdminUser,
): Promise<
  | { options: Awaited<ReturnType<typeof generateRegistrationOptions>> }
  | { error: string }
> {
  if (!(await ensureDatabaseReady())) return { error: "Database is not configured." };

  const db = getSql();
  if (!db) return { error: "Database is not configured." };

  const existing = await db<{ credentialId: string }[]>`
    SELECT credential_id AS "credentialId" FROM admin_passkeys WHERE user_id = ${user.id}
  `;

  const options = await generateRegistrationOptions({
    rpName: "Felix Schultz Shop Admin",
    rpID: rpId(),
    userName: user.email,
    userDisplayName: user.displayName ?? user.email,
    userID: Buffer.from(user.id, "utf8"),
    attestationType: "none",
    excludeCredentials: existing.map((pk) => ({ id: pk.credentialId })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
    },
  });

  await storeChallenge(options.challenge, "registration", user.id);
  return { options };
}

export async function verifyPasskeyRegistration(
  user: AdminUser,
  response: RegistrationResponseJSON,
  deviceName?: string,
): Promise<{ ok: true } | { error: string }> {
  if (!(await ensureDatabaseReady())) return { error: "Database is not configured." };

  const clientData = JSON.parse(
    Buffer.from(response.response.clientDataJSON, "base64url").toString("utf8"),
  ) as { challenge?: string };
  const challenge = clientData.challenge;
  if (!challenge || !(await consumeChallenge(challenge, "registration", user.id))) {
    return { error: "Challenge expired or invalid." };
  }

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: origin(),
    expectedRPID: rpId(),
  });

  if (!verification.verified || !verification.registrationInfo) {
    return { error: "Registration failed." };
  }

  const { credential, credentialDeviceType } = verification.registrationInfo;
  const db = getSql();
  if (!db) return { error: "Database is not configured." };

  await db`
    INSERT INTO admin_passkeys (
      id,
      user_id,
      credential_id,
      public_key,
      counter,
      device_name,
      transports
    ) VALUES (
      ${randomUUID()},
      ${user.id},
      ${credential.id},
      ${Buffer.from(credential.publicKey).toString("base64url")},
      ${credential.counter},
      ${deviceName?.trim() || credentialDeviceType},
      ${credential.transports?.join(",") ?? null}
    )
  `;

  return { ok: true };
}
