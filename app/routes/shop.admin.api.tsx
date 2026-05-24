import type { Route } from "./+types/shop.admin.api";
import {
  createAdminSessionCookie,
  getAdminUserFromRequest,
} from "../lib/admin-auth.server";
import {
  getPasskeyAuthenticationOptions,
  getPasskeyRegistrationOptions,
  verifyPasskeyAuthentication,
  verifyPasskeyRegistration,
} from "../lib/admin-passkey.server";
import type {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from "@simplewebauthn/server";

export async function action({ request, params }: Route.ActionArgs) {
  const actionName = params.action?.trim();
  if (!actionName) {
    return Response.json({ error: "Missing action." }, { status: 400 });
  }

  let body: Record<string, unknown> = {};
  const contentType = request.headers.get("Content-Type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return Response.json({ error: "Invalid JSON." }, { status: 400 });
    }
  }

  if (actionName === "passkey-login-options") {
    const email = String(body.email ?? "");
    const result = await getPasskeyAuthenticationOptions(email);
    if ("error" in result) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    return Response.json(result.options);
  }

  if (actionName === "passkey-login-verify") {
    const email = String(body.email ?? "");
    const authResult = await verifyPasskeyAuthentication(
      email,
      body.response as AuthenticationResponseJSON,
    );
    if ("error" in authResult) {
      return Response.json({ error: authResult.error }, { status: 401 });
    }

    const cookie = await createAdminSessionCookie(authResult.user.id);
    if (!cookie) {
      return Response.json({ error: "Session is not configured." }, { status: 500 });
    }

    return Response.json(
      { ok: true },
      { headers: { "Set-Cookie": cookie } },
    );
  }

  if (actionName === "passkey-register-options") {
    const user = await getAdminUserFromRequest(request);
    if (!user) {
      return Response.json({ error: "Not signed in." }, { status: 401 });
    }

    const result = await getPasskeyRegistrationOptions(user);
    if ("error" in result) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    return Response.json(result.options);
  }

  if (actionName === "passkey-register-verify") {
    const user = await getAdminUserFromRequest(request);
    if (!user) {
      return Response.json({ error: "Not signed in." }, { status: 401 });
    }

    const result = await verifyPasskeyRegistration(
      user,
      body.response as RegistrationResponseJSON,
      typeof body.deviceName === "string" ? body.deviceName : undefined,
    );
    if ("error" in result) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    return Response.json({ ok: true });
  }

  return Response.json({ error: "Unknown action." }, { status: 404 });
}
