import { CreditCardIcon, DownloadIcon } from "@sanity/icons";
import { Card, Flex, Label, Stack, Switch, Text, TextInput, useToast } from "@sanity/ui";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useClient, useCurrentUser } from "sanity";
import { resolveStudioPatchId } from "../lib/document-patch-id";
import { SecretLinkCard } from "./SecretLinkCard";

type GalleryShopDoc = {
  shopToken?: string;
  shopPublicEnabled?: boolean;
  shopPricePersonalDkk?: number;
  shopPriceCommercialDkk?: number;
  downloadToken?: string;
};

const DEFAULT_PERSONAL_DKK = 149;
const DEFAULT_COMMERCIAL_DKK = 799;
const MIN_PRICE_DKK = 1;
const MAX_PRICE_DKK = 100_000;

type ShopPatchFields = {
  shopToken?: string | null;
  shopPublicEnabled?: boolean;
  shopPricePersonalDkk?: number | null;
  shopPriceCommercialDkk?: number | null;
  downloadToken?: string | null;
};

type GalleryShopControlsProps = {
  document: Parameters<typeof resolveStudioPatchId>[0];
};

function parsePriceInput(raw: string): number | null | "invalid" {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return "invalid";
  if (n < MIN_PRICE_DKK || n > MAX_PRICE_DKK) return "invalid";
  return n;
}

export function GalleryShopControls({ document }: GalleryShopControlsProps) {
  const toast = useToast();
  const user = useCurrentUser();
  const writeToken = import.meta.env.SANITY_STUDIO_API_TOKEN as string | undefined;
  const client = useClient({ apiVersion: "2024-05-16" }).withConfig({
    useCdn: false,
    ...(!user && writeToken ? { token: writeToken } : {}),
  });

  const patchId = useMemo(() => resolveStudioPatchId(document), [document]);
  const doc = (document.displayed ?? {}) as GalleryShopDoc;
  const shopToken = doc.shopToken?.trim() || null;
  const shopPublicEnabled = Boolean(doc.shopPublicEnabled);
  const downloadToken = doc.downloadToken?.trim() || null;
  const canWrite = Boolean(patchId && (user || writeToken));

  const [personalInput, setPersonalInput] = useState("");
  const [commercialInput, setCommercialInput] = useState("");

  useEffect(() => {
    setPersonalInput(
      doc.shopPricePersonalDkk != null ? String(doc.shopPricePersonalDkk) : "",
    );
  }, [doc.shopPricePersonalDkk]);

  useEffect(() => {
    setCommercialInput(
      doc.shopPriceCommercialDkk != null ? String(doc.shopPriceCommercialDkk) : "",
    );
  }, [doc.shopPriceCommercialDkk]);

  const patchFields = useCallback(
    async (fields: ShopPatchFields) => {
      if (!patchId) {
        toast.push({ status: "error", title: "Save the gallery first" });
        return false;
      }
      try {
        let patch = client.patch(patchId);

        if (fields.shopPublicEnabled !== undefined) {
          patch = patch.set({ shopPublicEnabled: fields.shopPublicEnabled });
        }

        if (fields.shopToken === null) {
          patch = patch.unset(["shopToken"]);
        } else if (fields.shopToken !== undefined) {
          patch = patch.set({ shopToken: fields.shopToken });
        }

        if (fields.shopPricePersonalDkk === null) {
          patch = patch.unset(["shopPricePersonalDkk"]);
        } else if (fields.shopPricePersonalDkk !== undefined) {
          patch = patch.set({ shopPricePersonalDkk: fields.shopPricePersonalDkk });
        }

        if (fields.shopPriceCommercialDkk === null) {
          patch = patch.unset(["shopPriceCommercialDkk"]);
        } else if (fields.shopPriceCommercialDkk !== undefined) {
          patch = patch.set({ shopPriceCommercialDkk: fields.shopPriceCommercialDkk });
        }

        if (fields.downloadToken === null) {
          patch = patch.unset(["downloadToken"]);
        } else if (fields.downloadToken !== undefined) {
          patch = patch.set({ downloadToken: fields.downloadToken });
        }

        await patch.commit();
        return true;
      } catch (err) {
        console.error("[studio] gallery shop patch failed:", err);
        toast.push({ status: "error", title: "Could not save shop settings" });
        return false;
      }
    },
    [client, patchId, toast],
  );

  const savePrice = useCallback(
    async (field: "shopPricePersonalDkk" | "shopPriceCommercialDkk", raw: string) => {
      const parsed = parsePriceInput(raw);
      if (parsed === "invalid") {
        toast.push({
          status: "error",
          title: `Enter a whole number between ${MIN_PRICE_DKK} and ${MAX_PRICE_DKK}, or leave empty for default`,
        });
        return;
      }
      const current =
        field === "shopPricePersonalDkk"
          ? doc.shopPricePersonalDkk
          : doc.shopPriceCommercialDkk;
      if (parsed === current || (parsed === null && current == null)) return;

      const ok = await patchFields({ [field]: parsed });
      if (ok && parsed !== null) {
        toast.push({ status: "success", title: "Price saved" });
      }
    },
    [doc.shopPriceCommercialDkk, doc.shopPricePersonalDkk, patchFields, toast],
  );

  const onPublicToggle = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      void patchFields({ shopPublicEnabled: event.currentTarget.checked });
    },
    [patchFields],
  );

  const onShopTokenChange = useCallback(
    (token: string | null) => {
      void patchFields({ shopToken: token });
    },
    [patchFields],
  );

  const onDownloadTokenChange = useCallback(
    (token: string | null) => {
      void patchFields({ downloadToken: token });
    },
    [patchFields],
  );

  return (
    <Stack space={4}>
      <Card padding={3} radius={2} border>
        <Stack space={4}>
          <Flex align="center" gap={2}>
            <CreditCardIcon />
            <Text size={1} weight="semibold">
              Prices (DKK per photo)
            </Text>
          </Flex>
          <Text size={1} muted>
            Leave empty to use defaults: personal {DEFAULT_PERSONAL_DKK} DKK, commercial{" "}
            {DEFAULT_COMMERCIAL_DKK} DKK. Customers get 10% off when buying 5 or more photos.
          </Text>
          <Stack space={3}>
            <Stack space={2}>
              <Label size={1}>Personal download</Label>
              <TextInput
                type="number"
                inputMode="numeric"
                placeholder={String(DEFAULT_PERSONAL_DKK)}
                value={personalInput}
                disabled={!canWrite}
                onChange={(event) => setPersonalInput(event.currentTarget.value)}
                onBlur={() => void savePrice("shopPricePersonalDkk", personalInput)}
              />
            </Stack>
            <Stack space={2}>
              <Label size={1}>Commercial license</Label>
              <TextInput
                type="number"
                inputMode="numeric"
                placeholder={String(DEFAULT_COMMERCIAL_DKK)}
                value={commercialInput}
                disabled={!canWrite}
                onChange={(event) => setCommercialInput(event.currentTarget.value)}
                onBlur={() => void savePrice("shopPriceCommercialDkk", commercialInput)}
              />
            </Stack>
          </Stack>
        </Stack>
      </Card>

      <Card padding={3} radius={2} border>
        <Stack space={4}>
          <Text size={1} weight="semibold">
            Shop link
          </Text>
          <Text size={1} muted>
            Private checkout: customers pick photos, choose personal or commercial license, and pay
            via Stripe (card, Apple Pay, Google Pay).
          </Text>
          <SecretLinkCard
            urlPath="shop/gallery"
            token={shopToken}
            onTokenChange={onShopTokenChange}
            emptyHint="Generate a link so customers can select photos and pay online."
            generateLabel="Generate shop link"
            disabled={!canWrite}
          />
        </Stack>
      </Card>

      <Card padding={3} radius={2} border>
        <Stack space={3}>
          <Text size={1} weight="semibold">
            Public gallery
          </Text>
          <Flex align="center" gap={3}>
            <Switch
              checked={shopPublicEnabled}
              disabled={!canWrite || !shopToken}
              onChange={onPublicToggle}
            />
            <Stack space={2}>
              <Text size={1}>Show buy button on published gallery</Text>
              <Text size={1} muted>
                {shopToken
                  ? shopPublicEnabled
                    ? "Visitors see “Buy & license photos” on the public album."
                    : "Only people with the shop link can purchase."
                  : "Generate a shop link first."}
              </Text>
            </Stack>
          </Flex>
        </Stack>
      </Card>

      <Card padding={3} radius={2} border>
        <Stack space={4}>
          <Flex align="center" gap={2}>
            <DownloadIcon />
            <Text size={1} weight="semibold">
              Customer download (ZIP)
            </Text>
          </Flex>
          <Text size={1} muted>
            Full-size ZIP for clients. Not shown on the public gallery — share this link separately
            (e.g. after purchase or delivery).
          </Text>
          <SecretLinkCard
            urlPath="download/gallery"
            token={downloadToken}
            onTokenChange={onDownloadTokenChange}
            emptyHint="Generate when the full set is ready to hand off."
            generateLabel="Generate download link"
            disabled={!canWrite}
          />
        </Stack>
      </Card>
    </Stack>
  );
}
