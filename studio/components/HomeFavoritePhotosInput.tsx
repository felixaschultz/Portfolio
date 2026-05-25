import { ChevronDownIcon, ChevronRightIcon, ImagesIcon, SearchIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Grid, Spinner, Stack, Text, TextInput } from "@sanity/ui";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PatchEvent,
  type ArrayInputProps,
  set,
  useClient,
  useCurrentUser,
} from "sanity";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import {
  type HomeFavoriteFraming,
  applyHomeFavoriteFraming,
  framingFromImageSource,
} from "../lib/home-favorite-framing";
import { HomeFavoriteFramingEditor } from "./HomeFavoriteFramingEditor";

const MAX = 5;
const GALLERY_LIST_QUERY = `*[_type == "gallery" && defined(slug.current) && defined(images[0])] | order(title.en asc) {
  _id,
  title,
  "slug": slug.current,
  "imageCount": count(images)
}`;

const GALLERY_IMAGES_PAGE = 80;

const GALLERY_IMAGES_QUERY = `*[_type == "gallery" && _id == $id][0] {
  _id,
  title,
  "imageCount": count(images),
  "images": images[0...${GALLERY_IMAGES_PAGE}] {
    _key,
    alt,
    image {
      ...,
      asset-> {
        _id,
        url
      }
    }
  }
}`;

const PICK_THUMBS_QUERY = `*[_type == "gallery" && _id in $ids] {
  _id,
  title,
  images[] { _key, alt, image }
}`;

type PickValue = {
  _key: string;
  gallery?: { _ref?: string; _type?: string };
  imageKey?: string;
  framing?: HomeFavoriteFraming;
};

type GalleryListItem = {
  _id: string;
  title?: { en?: string; da?: string; de?: string };
  slug?: string;
  imageCount?: number;
};

type GalleryWithImages = GalleryListItem & {
  imageCount?: number;
  images?: { _key?: string; alt?: string; image?: SanityImageSource }[];
};

function thumbUrl(
  client: ReturnType<typeof useClient>,
  source: SanityImageSource | undefined,
  framing?: HomeFavoriteFraming | null,
) {
  if (!source) return null;
  try {
    const imageSource = framing ? applyHomeFavoriteFraming(source, framing) : source;
    return createImageUrlBuilder(client)
      .image(imageSource)
      .width(120)
      .height(150)
      .fit("crop")
      .auto("format")
      .quality(75)
      .url();
  } catch {
    return null;
  }
}

function galleryLabel(g: { title?: GalleryListItem["title"]; slug?: string }): string {
  return g.title?.en || g.title?.da || g.slug || "Gallery";
}

export function HomeFavoritePhotosInput(props: ArrayInputProps) {
  const baseClient = useClient({ apiVersion: "2024-05-16" });
  const user = useCurrentUser();
  const writeToken = import.meta.env.SANITY_STUDIO_API_TOKEN as string | undefined;
  const userId = user?.id;
  const client = useMemo(
    () =>
      baseClient.withConfig({
        useCdn: false,
        ...(!userId && writeToken ? { token: writeToken } : {}),
      }),
    [baseClient, userId, writeToken],
  );
  const [galleryList, setGalleryList] = useState<GalleryListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(null);
  const [activeGallery, setActiveGallery] = useState<GalleryWithImages | null>(null);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [pickGalleries, setPickGalleries] = useState<GalleryWithImages[]>([]);

  const picks = useMemo(() => {
    const raw = props.value;
    if (!Array.isArray(raw)) return [] as PickValue[];
    return raw.filter(
      (row): row is PickValue =>
        Boolean(row && typeof row === "object" && row._key && row.gallery?._ref && row.imageKey),
    );
  }, [props.value]);

  const selectedSet = useMemo(() => {
    const keys = new Set<string>();
    for (const p of picks) {
      keys.add(`${p.gallery!._ref}:${p.imageKey}`);
    }
    return keys;
  }, [picks]);

  const pickGalleryIds = useMemo(
    () => [...new Set(picks.map((p) => p.gallery?._ref).filter(Boolean))] as string[],
    [picks],
  );

  useEffect(() => {
    let cancelled = false;
    setListLoading(true);
    setListError(null);
    void client
      .fetch<GalleryListItem[]>(GALLERY_LIST_QUERY)
      .then((rows) => {
        if (cancelled) return;
        setGalleryList(rows ?? []);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setGalleryList([]);
        setListError(err instanceof Error ? err.message : "Failed to load galleries.");
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [client]);

  useEffect(() => {
    if (pickGalleryIds.length === 0) {
      setPickGalleries([]);
      return;
    }

    let cancelled = false;
    void client.fetch<GalleryWithImages[]>(PICK_THUMBS_QUERY, { ids: pickGalleryIds }).then((rows) => {
      if (!cancelled) setPickGalleries(rows ?? []);
    });

    return () => {
      cancelled = true;
    };
  }, [client, pickGalleryIds.join("|")]);

  useEffect(() => {
    if (!activeGalleryId) {
      setActiveGallery(null);
      setImagesError(null);
      return;
    }

    const galleryId = activeGalleryId;
    let cancelled = false;
    setImagesLoading(true);
    setImagesError(null);
    setActiveGallery(null);

    void client
      .fetch<GalleryWithImages | null>(GALLERY_IMAGES_QUERY, { id: galleryId })
      .then((row) => {
        if (cancelled) return;
        if (!row?._id) {
          setActiveGallery(null);
          setImagesError("Could not load photos for this gallery.");
          return;
        }
        setActiveGallery(row);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setActiveGallery(null);
        setImagesError(err instanceof Error ? err.message : "Failed to load gallery photos.");
      })
      .finally(() => {
        if (!cancelled) setImagesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [client, activeGalleryId]);

  const writePicks = useCallback(
    (next: PickValue[]) => {
      props.onChange(PatchEvent.from(set(next)));
    },
    [props],
  );

  const updatePickFraming = useCallback(
    (pickKey: string, framing: HomeFavoriteFraming) => {
      writePicks(
        picks.map((p) => (p._key === pickKey ? { ...p, framing } : p)),
      );
    },
    [picks, writePicks],
  );

  const resetPickFraming = useCallback(
    (pick: PickValue) => {
      const gallery = pickGalleries.find((g) => g._id === pick.gallery?._ref);
      const image = gallery?.images?.find((img) => img._key === pick.imageKey)?.image;
      updatePickFraming(pick._key, framingFromImageSource(image));
    },
    [pickGalleries, picks, updatePickFraming],
  );

  const toggle = useCallback(
    (galleryId: string, imageKey: string, image?: SanityImageSource) => {
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
          framing: framingFromImageSource(image),
        },
      ]);
    },
    [picks, selectedSet, writePicks],
  );

  const filteredList = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return galleryList;
    return galleryList.filter(
      (g) => galleryLabel(g).toLowerCase().includes(q) || g.slug?.toLowerCase().includes(q),
    );
  }, [filter, galleryList]);

  const activeImages = useMemo(
    () => (activeGallery?.images ?? []).filter((row) => row?._key && row.image),
    [activeGallery],
  );

  function resolvePickImage(pick: PickValue): SanityImageSource | undefined {
    const gallery = pickGalleries.find((g) => g._id === pick.gallery?._ref);
    return gallery?.images?.find((img) => img._key === pick.imageKey)?.image;
  }

  function resolvePickThumb(pick: PickValue): string | null {
    return thumbUrl(client, resolvePickImage(pick), pick.framing ?? null);
  }

  function renderGalleryPhotoGrid(galleryId: string) {
    const ready = activeGallery?._id === galleryId;
    if (imagesLoading || !ready) {
      return (
        <Flex align="center" gap={2} padding={3}>
          <Spinner muted />
          <Text size={1} muted>
            Loading photos…
          </Text>
        </Flex>
      );
    }

    if (imagesError) {
      return (
        <Card padding={3} radius={2} tone="critical">
          <Text size={1}>{imagesError}</Text>
        </Card>
      );
    }

    if (activeImages.length === 0) {
      return (
        <Text size={1} muted>
          No photos in this gallery.
        </Text>
      );
    }

    return (
      <Stack space={2}>
        {(activeGallery?.imageCount ?? 0) > GALLERY_IMAGES_PAGE ? (
          <Text size={1} muted>
            Showing first {GALLERY_IMAGES_PAGE} of {activeGallery?.imageCount} photos.
          </Text>
        ) : null}
        <Grid columns={[4, 5, 6]} gap={2}>
          {activeImages.map((row) => {
            const id = `${galleryId}:${row._key}`;
            const selected = selectedSet.has(id);
            const order = picks.findIndex(
              (p) => p.gallery?._ref === galleryId && p.imageKey === row._key,
            );
            const atMax = picks.length >= MAX && !selected;
            const url = thumbUrl(client, row.image);
            return (
              <button
                key={row._key}
                type="button"
                disabled={atMax}
                onClick={() => toggle(galleryId, row._key!, row.image)}
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
                        loading="lazy"
                        decoding="async"
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
                            top: 4,
                            right: 4,
                            width: 20,
                            height: 20,
                            borderRadius: 999,
                            background: "var(--card-positive-fg-color)",
                            color: "white",
                            fontSize: 10,
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
                    <Flex padding={3} align="center" justify="center">
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
  }

  function pickFraming(pick: PickValue): HomeFavoriteFraming {
    if (pick.framing) return pick.framing;
    return framingFromImageSource(resolvePickImage(pick));
  }

  return (
    <Stack space={4}>
      <Text size={1} muted>
        Choose a gallery, then pick photos ({picks.length} / {MAX}). Only one gallery loads at a time.
      </Text>

      {picks.length > 0 ? (
        <Stack space={4}>
          <Flex gap={2} wrap="wrap">
            {picks.map((pick, index) => {
              const url = resolvePickThumb(pick);
              const gallery = pickGalleries.find((g) => g._id === pick.gallery?._ref);
              return (
                <Card key={pick._key} padding={2} radius={2} tone="positive" style={{ width: 80 }}>
                  {url ? (
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      style={{
                        width: "100%",
                        aspectRatio: "4/5",
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    <Flex align="center" justify="center" style={{ aspectRatio: "4/5" }}>
                      <Spinner muted />
                    </Flex>
                  )}
                  <Text size={0} muted align="center" style={{ marginTop: 4 }}>
                    #{index + 1} {gallery ? galleryLabel(gallery) : ""}
                  </Text>
                </Card>
              );
            })}
          </Flex>

          <Stack space={4}>
            <Text size={1} weight="semibold">
              Card crops
            </Text>
            {picks.map((pick, index) => {
              const gallery = pickGalleries.find((g) => g._id === pick.gallery?._ref);
              const image = resolvePickImage(pick);
              return (
                <Card key={`crop-${pick._key}`} padding={3} radius={2} border tone="transparent">
                  <HomeFavoriteFramingEditor
                    client={client}
                    image={image}
                    framing={pickFraming(pick)}
                    label={`#${index + 1}${gallery ? ` · ${galleryLabel(gallery)}` : ""}`}
                    onChange={(framing) => updatePickFraming(pick._key, framing)}
                    onReset={() => resetPickFraming(pick)}
                  />
                </Card>
              );
            })}
          </Stack>
        </Stack>
      ) : null}

      <TextInput
        icon={SearchIcon}
        placeholder="Search galleries…"
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
      />

      {listError ? (
        <Card padding={3} radius={2} tone="critical">
          <Text size={1}>{listError}</Text>
        </Card>
      ) : null}

      {listLoading ? (
        <Flex align="center" gap={2}>
          <Spinner muted />
          <Text size={1} muted>
            Loading gallery list…
          </Text>
        </Flex>
      ) : listError ? null : (
        <Card padding={2} radius={2} border tone="transparent">
          <Stack space={1}>
            {filteredList.length === 0 ? (
              <Text size={1} muted>
                No galleries match.
              </Text>
            ) : (
              filteredList.map((gallery) => {
                const open = activeGalleryId === gallery._id;
                return (
                  <Box key={gallery._id}>
                    <Button
                      mode="bleed"
                      tone={open ? "primary" : "default"}
                      onClick={() => setActiveGalleryId(open ? null : gallery._id)}
                      style={{ width: "100%", justifyContent: "flex-start" }}
                    >
                      <Flex align="center" gap={2} style={{ width: "100%" }}>
                        <Text muted>{open ? <ChevronDownIcon /> : <ChevronRightIcon />}</Text>
                        <Text size={1} weight="medium">
                          {galleryLabel(gallery)}
                        </Text>
                        <Text size={0} muted style={{ marginLeft: "auto" }}>
                          {gallery.imageCount ?? 0} photos
                        </Text>
                      </Flex>
                    </Button>
                    {open ? (
                      <Box paddingLeft={3} paddingTop={2} paddingBottom={3}>
                        {renderGalleryPhotoGrid(gallery._id)}
                      </Box>
                    ) : null}
                  </Box>
                );
              })
            )}
          </Stack>
        </Card>
      )}

      {!activeGalleryId ? (
        <Text size={1} muted>
          Expand a gallery above to browse and select photos.
        </Text>
      ) : null}
    </Stack>
  );
}
