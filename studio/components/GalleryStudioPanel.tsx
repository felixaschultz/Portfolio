import { EarthGlobeIcon, ImagesIcon, LaunchIcon, LinkIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Stack, Text } from "@sanity/ui";
import { useCallback, useMemo } from "react";
import { useToast } from "@sanity/ui";
import type { UserViewComponent } from "sanity/structure";
import { siteBaseUrl } from "../lib/siteBaseUrl";
import { GalleryShopControls } from "./GalleryShopControls";

type LocalizedString = { da?: string; de?: string; en?: string };

type GalleryDoc = {
  title?: LocalizedString;
  slug?: { current?: string };
  shopToken?: string;
  shopPublicEnabled?: boolean;
  downloadToken?: string;
  images?: unknown[];
};

const PUBLIC_LOCALE = "da";

function galleryTitle(doc: GalleryDoc): string {
  return doc.title?.en?.trim() || doc.title?.da?.trim() || doc.title?.de?.trim() || "Gallery";
}

function LinkRow({
  label,
  href,
  hint,
}: {
  label: string;
  href: string;
  hint?: string;
}) {
  const toast = useToast();
  const copyUrl = useCallback(() => {
    void navigator.clipboard?.writeText(href).then(
      () => toast.push({ status: "success", title: "URL copied" }),
      () => toast.push({ status: "error", title: "Could not copy URL" }),
    );
  }, [href, toast]);

  return (
    <Card padding={3} radius={2} border tone="transparent">
      <Stack space={3}>
        <Text size={1} weight="semibold">
          {label}
        </Text>
        {hint ? (
          <Text size={1} muted>
            {hint}
          </Text>
        ) : null}
        <Flex gap={2} wrap="wrap">
          <Button
            as="a"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            text="Open"
            icon={LaunchIcon}
            tone="primary"
            mode="default"
          />
          <Button text="Copy URL" icon={LinkIcon} mode="ghost" onClick={copyUrl} />
        </Flex>
      </Stack>
    </Card>
  );
}

export const GalleryStudioPanel: UserViewComponent = ({ document }) => {
  const doc = (document?.displayed ?? {}) as GalleryDoc;
  const base = siteBaseUrl();
  const slug = doc.slug?.current?.trim();
  const imageCount = Array.isArray(doc.images) ? doc.images.length : 0;
  const shopToken = doc.shopToken?.trim();

  const urls = useMemo(() => {
    return {
      publicGallery: slug
        ? `${base}/${PUBLIC_LOCALE}/photography/${encodeURIComponent(slug)}`
        : null,
      shop: shopToken ? `${base}/shop/gallery/${encodeURIComponent(shopToken)}` : null,
      download: doc.downloadToken?.trim()
        ? `${base}/download/gallery/${encodeURIComponent(doc.downloadToken.trim())}`
        : null,
    };
  }, [base, doc.downloadToken, shopToken, slug]);

  return (
    <Box padding={4} sizing="border">
      <Stack space={4}>
        <Stack space={2}>
          <Text size={2} weight="semibold">
            {galleryTitle(doc)}
          </Text>
          <Text size={1} muted>
            {imageCount} {imageCount === 1 ? "photo" : "photos"}
            {slug ? ` · /${slug}` : ""}
          </Text>
        </Stack>

        <GalleryShopControls document={document} />

        {urls.publicGallery ? (
          <LinkRow
            label="Public gallery preview"
            href={urls.publicGallery}
            hint="Published album on your site (Danish URL)."
          />
        ) : (
          <Card padding={3} radius={2} border>
            <Text size={1} muted>
              Add a slug and publish the gallery to enable the public preview link.
            </Text>
          </Card>
        )}

        {urls.shop ? (
          <LinkRow
            label="Open shop (preview)"
            href={urls.shop}
            hint="Same checkout customers use after generating the link above."
          />
        ) : null}

        {urls.download ? (
          <LinkRow
            label="Open download page (preview)"
            href={urls.download}
            hint="ZIP link you manage under Shop → Customer download."
          />
        ) : null}

        <Card padding={3} radius={2} border>
          <Flex align="flex-start" gap={2}>
            <ImagesIcon />
            <Text size={1} muted>
              Use <strong>Edit</strong> for photos, cover, categories, and publishing. Everything
              for selling and customer links lives on this tab.
            </Text>
          </Flex>
        </Card>

        <Flex align="center" gap={2}>
          <EarthGlobeIcon />
          <Text size={0} muted>
            Links use {base} (SANITY_STUDIO_SITE_URL).
          </Text>
        </Flex>
      </Stack>
    </Box>
  );
};
