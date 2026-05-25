import { ImagesIcon, SearchIcon } from "@sanity/icons";
import { Box, Card, Flex, Grid, Stack, Text, TextInput } from "@sanity/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PatchEvent,
  type ArrayInputProps,
  set,
  useClient,
} from "sanity";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

const MAX = 5;

type PickValue = {
  _key: string;
  gallery?: { _ref?: string };
  imageKey?: string;
};

type GalleryRow = {
  _id: string;
  title?: { en?: string; da?: string; de?: string };
  slug?: string;
  images?: { _key?: string; alt?: string; image?: SanityImageSource }[];
};

function thumbUrl(client: ReturnType<typeof useClient>, source: SanityImageSource | undefined) {
  if (!source) return null;
  try {
    return createImageUrlBuilder(client).image(source).width(200).height(260).fit("crop").auto("format").url();
  } catch {
    return null;
  }
}

function galleryLabel(g: GalleryRow): string {
  return g.title?.en || g.title?.da || g.slug || "Gallery";
}

export function HomeFavoritePhotosInput(props: ArrayInputProps) {
  const client = useClient({ apiVersion: "2024-05-16" });
  const [galleries, setGalleries] = useState<GalleryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const picks = useMemo(() => {
    const raw = props.value;
    if (!Array.isArray(raw)) return [] as PickValue[];
    return raw.filter(
      (row): row is PickValue =>
        Boolean(row && typeof row === "object" && row._key && row.gallery?._ref && row.imageKey),
    );
  }, [props.value]);

  const selectedSet = useMemo(() => {
    const setKeys = new Set<string>();
    for (const p of picks) {
      setKeys.add(`${p.gallery!._ref}:${p.imageKey}`);
    }
    return setKeys;
  }, [picks]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void client
      .fetch<GalleryRow[]>(
        `*[_type == "gallery" && defined(slug.current) && count(images) > 0] | order(title.en asc) {
          _id,
          title,
          "slug": slug.current,
          images[] { _key, alt, image }
        }`,
      )
      .then((rows) => {
        if (!cancelled) setGalleries(rows ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const writePicks = useCallback(
    (next: PickValue[]) => {
      props.onChange(PatchEvent.from(set(next)));
    },
    [props],
  );

  const toggle = useCallback(
    (galleryId: string, imageKey: string) => {
      const id = `${galleryId}:${imageKey}`;
      if (selectedSet.has(id)) {
        writePicks(picks.filter((p) => `${p.gallery?._ref}:${p.imageKey}` !== id));
        return;
      }
      if (picks.length >= MAX) return;
      writePicks([
        ...picks,
        {
          _key: crypto.randomUUID(),
          gallery: { _ref: galleryId, _type: "reference" },
          imageKey,
        },
      ]);
    },
    [picks, selectedSet, writePicks],
  );

  const filteredGalleries = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return galleries;
    return galleries.filter((g) => galleryLabel(g).toLowerCase().includes(q) || g.slug?.includes(q));
  }, [filter, galleries]);

  return (
    <Stack space={4}>
      <Text size={1} muted>
        Click photos to add them to the home page stack ({picks.length} / {MAX}). Order follows selection
        order.
      </Text>

      {picks.length > 0 ? (
        <Flex gap={2} wrap="wrap">
          {picks.map((pick, index) => {
            const gallery = galleries.find((g) => g._id === pick.gallery?._ref);
            const image = gallery?.images?.find((img) => img._key === pick.imageKey);
            const url = thumbUrl(client, image?.image);
            return (
              <Card key={pick._key} padding={2} radius={2} tone="positive" style={{ width: 88 }}>
                {url ? (
                  <img
                    src={url}
                    alt=""
                    style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: 4 }}
                  />
                ) : null}
                <Text size={0} muted align="center" style={{ marginTop: 4 }}>
                  #{index + 1}
                </Text>
              </Card>
            );
          })}
        </Flex>
      ) : null}

      <TextInput
        icon={SearchIcon}
        placeholder="Filter galleries…"
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
      />

      {loading ? (
        <Text size={1} muted>
          Loading galleries…
        </Text>
      ) : (
        <Stack space={4}>
          {filteredGalleries.map((gallery) => {
            const images = (gallery.images ?? []).filter((row) => row?._key && row.image);
            if (images.length === 0) return null;
            return (
              <Stack key={gallery._id} space={2}>
                <Text size={1} weight="semibold">
                  {galleryLabel(gallery)}
                </Text>
                <Grid columns={[3, 4, 5]} gap={2}>
                  {images.map((row) => {
                    const id = `${gallery._id}:${row._key}`;
                    const selected = selectedSet.has(id);
                    const order = picks.findIndex(
                      (p) => p.gallery?._ref === gallery._id && p.imageKey === row._key,
                    );
                    const atMax = picks.length >= MAX && !selected;
                    const url = thumbUrl(client, row.image);
                    return (
                      <button
                        key={row._key}
                        type="button"
                        disabled={atMax}
                        onClick={() => toggle(gallery._id, row._key!)}
                        style={{
                          padding: 0,
                          border: "none",
                          background: "none",
                          cursor: atMax ? "not-allowed" : "pointer",
                          opacity: atMax ? 0.4 : 1,
                          borderRadius: 6,
                          overflow: "hidden",
                        }}
                        aria-pressed={selected}
                      >
                        <Card padding={0} radius={2} tone={selected ? "positive" : "default"}>
                          {url ? (
                            <Box style={{ aspectRatio: "4/5", position: "relative" }}>
                              <img
                                src={url}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                              />
                              {selected ? (
                                <Box
                                  style={{
                                    position: "absolute",
                                    top: 6,
                                    right: 6,
                                    width: 22,
                                    height: 22,
                                    borderRadius: 999,
                                    background: "var(--card-positive-fg-color)",
                                    color: "white",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {order + 1}
                                </Box>
                              ) : null}
                            </Box>
                          ) : (
                            <Flex padding={3} align="center" gap={2}>
                              <Text muted>
                                <ImagesIcon />
                              </Text>
                            </Flex>
                          )}
                        </Card>
                      </button>
                    );
                  })}
                </Grid>
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
