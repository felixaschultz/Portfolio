import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ImagesIcon,
  ResetIcon,
  SearchIcon,
  TrashIcon,
} from "@sanity/icons";
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
  DEFAULT_HOME_FAVORITE_FRAMING,
  type HomeFavoriteFraming,
  applyHomeFavoriteFraming,
  framingFromImageSource,
} from "../lib/home-favorite-framing";
import { HomeFavoriteFramingEditor } from "./HomeFavoriteFramingEditor";
import { HomeFavoriteStackPoseEditor } from "./HomeFavoriteStackPoseEditor";
import {
  HomeFavoriteStackPreview,
  type HomeFavoriteStackPreviewCard,
} from "./HomeFavoriteStackPreview";
import {
  type HomeFavoriteStackPose,
  defaultStackPose,
  resolveStackPose,
} from "../lib/home-favorite-stack";

const MAX_FAVORITES = 5;
const MAX_SPOTLIGHT = 8;

function fieldMode(props: ArrayInputProps): "favorites" | "spotlight" {
  const segment = props.path?.[props.path.length - 1];
  return segment === "spotlightSlides" ? "spotlight" : "favorites";
}

const GALLERY_LIST_QUERY = `*[_type == "gallery" && defined(slug.current) && defined(images[0])] | order(title.en asc) {
  _id,
  title,
  "slug": slug.current,
  "imageCount": count(images)
}`;

const FLICKR_ALBUM_LIST_QUERY = `*[_type == "flickrAlbumMeta" && defined(flickrAlbumId)] | order(albumTitle asc) {
  _id,
  flickrAlbumId,
  albumTitle
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
  stackPose?: HomeFavoriteStackPose;
  flickrAlbumId?: string;
  flickrPhotoId?: string;
  flickrServer?: string;
  flickrSecret?: string;
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

type FlickrAlbumItem = {
  _id: string;
  flickrAlbumId: string;
  albumTitle?: string;
};

type FlickrPhotoItem = {
  id: string;
  server: string;
  secret: string;
  title: string;
  thumbUrl: string;
};

function buildThumbUrl(
  client: ReturnType<typeof useClient>,
  source: SanityImageSource | undefined,
  framing: HomeFavoriteFraming | null | undefined,
  width: number,
  height: number,
) {
  if (!source) return null;
  try {
    const imageSource = framing ? applyHomeFavoriteFraming(source, framing) : source;
    return createImageUrlBuilder(client)
      .image(imageSource)
      .width(width)
      .height(height)
      .fit("crop")
      .auto("format")
      .quality(width >= 200 ? 82 : 75)
      .url();
  } catch {
    return null;
  }
}

function thumbUrl(
  client: ReturnType<typeof useClient>,
  source: SanityImageSource | undefined,
  framing?: HomeFavoriteFraming | null,
) {
  return buildThumbUrl(client, source, framing, 120, 150);
}

function flickrThumbFromPick(pick: PickValue): string | null {
  if (!pick.flickrServer || !pick.flickrPhotoId || !pick.flickrSecret) return null;
  return `https://live.staticflickr.com/${pick.flickrServer}/${pick.flickrPhotoId}_${pick.flickrSecret}_q.jpg`;
}

function galleryLabel(g: { title?: GalleryListItem["title"]; slug?: string }): string {
  return g.title?.en || g.title?.da || g.slug || "Gallery";
}

function flickrAlbumLabel(a: FlickrAlbumItem): string {
  return a.albumTitle || a.flickrAlbumId;
}

export function HomeFavoritePhotosInput(props: ArrayInputProps) {
  const mode = fieldMode(props);
  const isSpotlight = mode === "spotlight";
  const max = isSpotlight ? MAX_SPOTLIGHT : MAX_FAVORITES;
  const thumbAspect = isSpotlight ? "16/9" : "4/5";
  const thumbW = isSpotlight ? 160 : 120;
  const thumbH = isSpotlight ? 90 : 150;

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

  // ── Sanity gallery state ────────────────────────────────────────────────────
  const [galleryList, setGalleryList] = useState<GalleryListItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [activeGalleryId, setActiveGalleryId] = useState<string | null>(null);
  const [activeGallery, setActiveGallery] = useState<GalleryWithImages | null>(null);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imagesError, setImagesError] = useState<string | null>(null);
  const [pickGalleries, setPickGalleries] = useState<GalleryWithImages[]>([]);

  // ── Flickr album state ──────────────────────────────────────────────────────
  const [flickrAlbumList, setFlickrAlbumList] = useState<FlickrAlbumItem[]>([]);
  const [flickrAlbumsLoading, setFlickrAlbumsLoading] = useState(true);
  const [activeFlickrAlbumId, setActiveFlickrAlbumId] = useState<string | null>(null);
  const [flickrPhotos, setFlickrPhotos] = useState<FlickrPhotoItem[]>([]);
  const [flickrPhotosLoading, setFlickrPhotosLoading] = useState(false);
  const [flickrPhotosError, setFlickrPhotosError] = useState<string | null>(null);

  // ── Picks ──────────────────────────────────────────────────────────────────
  const picks = useMemo(() => {
    const raw = props.value;
    if (!Array.isArray(raw)) return [] as PickValue[];
    return raw.filter(
      (row): row is PickValue =>
        Boolean(row && typeof row === "object" && row._key) &&
        (Boolean(row.gallery?._ref && row.imageKey) ||
          Boolean(row.flickrPhotoId && row.flickrServer && row.flickrSecret)),
    );
  }, [props.value]);

  const selectedSet = useMemo(() => {
    const keys = new Set<string>();
    for (const p of picks) {
      if (p.flickrPhotoId) {
        keys.add(`flickr:${p.flickrPhotoId}`);
      } else if (p.gallery?._ref && p.imageKey) {
        keys.add(`${p.gallery._ref}:${p.imageKey}`);
      }
    }
    return keys;
  }, [picks]);

  const pickGalleryIds = useMemo(
    () =>
      [
        ...new Set(
          picks.filter((p) => !p.flickrPhotoId).map((p) => p.gallery?._ref).filter(Boolean),
        ),
      ] as string[],
    [picks],
  );

  // ── Effects ────────────────────────────────────────────────────────────────
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
    return () => { cancelled = true; };
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    setFlickrAlbumsLoading(true);
    void client
      .fetch<FlickrAlbumItem[]>(FLICKR_ALBUM_LIST_QUERY)
      .then((rows) => {
        if (!cancelled) setFlickrAlbumList(rows ?? []);
      })
      .catch(() => {
        if (!cancelled) setFlickrAlbumList([]);
      })
      .finally(() => {
        if (!cancelled) setFlickrAlbumsLoading(false);
      });
    return () => { cancelled = true; };
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
    return () => { cancelled = true; };
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
    return () => { cancelled = true; };
  }, [client, activeGalleryId]);

  useEffect(() => {
    if (!activeFlickrAlbumId) {
      setFlickrPhotos([]);
      setFlickrPhotosError(null);
      return;
    }
    const albumId = activeFlickrAlbumId;
    let cancelled = false;
    setFlickrPhotosLoading(true);
    setFlickrPhotosError(null);
    setFlickrPhotos([]);
    fetch(`/api/studio/flickr-photos/${albumId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<FlickrPhotoItem[]>;
      })
      .then((photos) => {
        if (!cancelled) setFlickrPhotos(photos);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setFlickrPhotosError(err instanceof Error ? err.message : "Failed to load Flickr photos.");
      })
      .finally(() => {
        if (!cancelled) setFlickrPhotosLoading(false);
      });
    return () => { cancelled = true; };
  }, [activeFlickrAlbumId]);

  // ── Write helpers ──────────────────────────────────────────────────────────
  const writePicks = useCallback(
    (next: PickValue[]) => { props.onChange(PatchEvent.from(set(next))); },
    [props],
  );

  const updatePickFraming = useCallback(
    (pickKey: string, framing: HomeFavoriteFraming) => {
      writePicks(picks.map((p) => (p._key === pickKey ? { ...p, framing } : p)));
    },
    [picks, writePicks],
  );

  const updatePickStackPose = useCallback(
    (pickKey: string, stackPose: HomeFavoriteStackPose) => {
      writePicks(picks.map((p) => (p._key === pickKey ? { ...p, stackPose } : p)));
    },
    [picks, writePicks],
  );

  const movePick = useCallback(
    (pickKey: string, direction: -1 | 1) => {
      const index = picks.findIndex((p) => p._key === pickKey);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= picks.length) return;
      const next = [...picks];
      [next[index], next[target]] = [next[target]!, next[index]!];
      writePicks(next);
    },
    [picks, writePicks],
  );

  const removePick = useCallback(
    (pickKey: string) => { writePicks(picks.filter((p) => p._key !== pickKey)); },
    [picks, writePicks],
  );

  const rebalanceStackPoses = useCallback(() => {
    writePicks(
      picks.map((pick, index) => ({ ...pick, stackPose: defaultStackPose(index, picks.length) })),
    );
  }, [picks, writePicks]);

  const resetPickFraming = useCallback(
    (pick: PickValue) => {
      if (pick.flickrPhotoId) return;
      const gallery = pickGalleries.find((g) => g._id === pick.gallery?._ref);
      const image = gallery?.images?.find((img) => img._key === pick.imageKey)?.image;
      updatePickFraming(pick._key, framingFromImageSource(image));
    },
    [pickGalleries, picks, updatePickFraming],
  );

  // ── Toggle picks ───────────────────────────────────────────────────────────
  const toggle = useCallback(
    (galleryId: string, imageKey: string, image?: SanityImageSource) => {
      const id = `${galleryId}:${imageKey}`;
      if (selectedSet.has(id)) {
        writePicks(picks.filter((p) => `${p.gallery?._ref}:${p.imageKey}` !== id));
        return;
      }
      if (picks.length >= max) return;
      const nextIndex = picks.length;
      const nextTotal = nextIndex + 1;
      writePicks([
        ...picks,
        {
          _key: crypto.randomUUID(),
          gallery: { _ref: galleryId, _type: "reference" },
          imageKey,
          framing: framingFromImageSource(image),
          ...(isSpotlight ? {} : { stackPose: defaultStackPose(nextIndex, nextTotal) }),
        },
      ]);
    },
    [isSpotlight, max, picks, selectedSet, writePicks],
  );

  const toggleFlickr = useCallback(
    (albumId: string, photoId: string, server: string, secret: string) => {
      const id = `flickr:${photoId}`;
      if (selectedSet.has(id)) {
        writePicks(picks.filter((p) => p.flickrPhotoId !== photoId));
        return;
      }
      if (picks.length >= max) return;
      const nextIndex = picks.length;
      const nextTotal = nextIndex + 1;
      writePicks([
        ...picks,
        {
          _key: crypto.randomUUID(),
          flickrAlbumId: albumId,
          flickrPhotoId: photoId,
          flickrServer: server,
          flickrSecret: secret,
          ...(isSpotlight ? {} : { stackPose: defaultStackPose(nextIndex, nextTotal) }),
        },
      ]);
    },
    [isSpotlight, max, picks, selectedSet, writePicks],
  );

  // ── Filtered lists ─────────────────────────────────────────────────────────
  const filteredGalleryList = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return galleryList;
    return galleryList.filter(
      (g) => galleryLabel(g).toLowerCase().includes(q) || g.slug?.toLowerCase().includes(q),
    );
  }, [filter, galleryList]);

  const filteredFlickrAlbumList = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return flickrAlbumList;
    return flickrAlbumList.filter(
      (a) =>
        (a.albumTitle ?? "").toLowerCase().includes(q) ||
        a.flickrAlbumId.toLowerCase().includes(q),
    );
  }, [filter, flickrAlbumList]);

  const activeImages = useMemo(
    () => (activeGallery?.images ?? []).filter((row) => row?._key && row.image),
    [activeGallery],
  );

  // ── Resolve helpers ────────────────────────────────────────────────────────
  function resolvePickImage(pick: PickValue): SanityImageSource | undefined {
    if (pick.flickrPhotoId) return undefined;
    const gallery = pickGalleries.find((g) => g._id === pick.gallery?._ref);
    return gallery?.images?.find((img) => img._key === pick.imageKey)?.image;
  }

  function resolvePickThumb(pick: PickValue): string | null {
    if (pick.flickrPhotoId) return flickrThumbFromPick(pick);
    return buildThumbUrl(client, resolvePickImage(pick), pick.framing ?? null, thumbW, thumbH);
  }

  function resolvePickLabel(pick: PickValue, index: number): string {
    const prefix = `#${index + 1}`;
    if (pick.flickrPhotoId) {
      const album = flickrAlbumList.find((a) => a.flickrAlbumId === pick.flickrAlbumId);
      return `${prefix} · Flickr: ${album ? flickrAlbumLabel(album) : pick.flickrAlbumId ?? "photo"}`;
    }
    const gallery = pickGalleries.find((g) => g._id === pick.gallery?._ref);
    return `${prefix}${gallery ? ` · ${galleryLabel(gallery)}` : ""}`;
  }

  function pickFraming(pick: PickValue): HomeFavoriteFraming {
    if (pick.framing) return pick.framing;
    if (pick.flickrPhotoId) return DEFAULT_HOME_FAVORITE_FRAMING;
    return framingFromImageSource(resolvePickImage(pick));
  }

  function pickStackPose(pick: PickValue, index: number): HomeFavoriteStackPose {
    return resolveStackPose(pick.stackPose, index, picks.length);
  }

  // ── Stack preview cards ────────────────────────────────────────────────────
  const stackPreviewCards = useMemo((): HomeFavoriteStackPreviewCard[] => {
    return picks.map((pick, index) => {
      const framing = pickFraming(pick);
      const imageUrl = pick.flickrPhotoId
        ? flickrThumbFromPick(pick)
        : buildThumbUrl(client, resolvePickImage(pick), pick.framing, 296, 370);
      const caption = pick.flickrPhotoId
        ? (() => {
            const album = flickrAlbumList.find((a) => a.flickrAlbumId === pick.flickrAlbumId);
            return `Flickr: ${album ? flickrAlbumLabel(album) : (pick.flickrAlbumId ?? "photo")}`;
          })()
        : (() => {
            const gallery = pickGalleries.find((g) => g._id === pick.gallery?._ref);
            return gallery ? galleryLabel(gallery) : "Gallery";
          })();
      return {
        key: pick._key,
        imageUrl,
        caption,
        pose: resolveStackPose(pick.stackPose, index, picks.length),
        objectPosition: `${Math.round(framing.x * 100)}% ${Math.round(framing.y * 100)}%`,
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picks, pickGalleries, flickrAlbumList, client]);

  // ── Render photo grids ─────────────────────────────────────────────────────
  function renderGalleryPhotoGrid(galleryId: string) {
    const ready = activeGallery?._id === galleryId;
    if (imagesLoading || !ready) {
      return (
        <Flex align="center" gap={2} padding={3}>
          <Spinner muted />
          <Text size={1} muted>Loading photos…</Text>
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
      return <Text size={1} muted>No photos in this gallery.</Text>;
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
            const atMax = picks.length >= max && !selected;
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
                    <Box style={{ aspectRatio: thumbAspect, position: "relative" }}>
                      <img
                        src={url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      {selected ? (
                        <Box
                          style={{
                            position: "absolute", top: 4, right: 4,
                            width: 20, height: 20, borderRadius: 999,
                            background: "var(--card-positive-fg-color)",
                            color: "white", fontSize: 10, fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          {order + 1}
                        </Box>
                      ) : null}
                    </Box>
                  ) : (
                    <Flex padding={3} align="center" justify="center">
                      <Text muted><ImagesIcon /></Text>
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

  function renderFlickrPhotoGrid(albumId: string) {
    const ready = activeFlickrAlbumId === albumId;
    if (flickrPhotosLoading || !ready) {
      return (
        <Flex align="center" gap={2} padding={3}>
          <Spinner muted />
          <Text size={1} muted>Loading Flickr photos…</Text>
        </Flex>
      );
    }
    if (flickrPhotosError) {
      return (
        <Card padding={3} radius={2} tone="critical">
          <Text size={1}>{flickrPhotosError}</Text>
        </Card>
      );
    }
    if (flickrPhotos.length === 0) {
      return <Text size={1} muted>No photos in this album.</Text>;
    }
    return (
      <Grid columns={[4, 5, 6]} gap={2}>
        {flickrPhotos.map((photo) => {
          const id = `flickr:${photo.id}`;
          const selected = selectedSet.has(id);
          const order = picks.findIndex((p) => p.flickrPhotoId === photo.id);
          const atMax = picks.length >= max && !selected;
          return (
            <button
              key={photo.id}
              type="button"
              disabled={atMax}
              onClick={() => toggleFlickr(albumId, photo.id, photo.server, photo.secret)}
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
              title={photo.title || undefined}
            >
              <Card padding={0} radius={2} tone={selected ? "positive" : "default"}>
                <Box style={{ aspectRatio: thumbAspect, position: "relative" }}>
                  <img
                    src={photo.thumbUrl}
                    alt={photo.title || ""}
                    loading="lazy"
                    decoding="async"
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  {selected ? (
                    <Box
                      style={{
                        position: "absolute", top: 4, right: 4,
                        width: 20, height: 20, borderRadius: 999,
                        background: "var(--card-positive-fg-color)",
                        color: "white", fontSize: 10, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {order + 1}
                    </Box>
                  ) : null}
                </Box>
              </Card>
            </button>
          );
        })}
      </Grid>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Stack space={4}>
      <Text size={1} muted>
        {isSpotlight
          ? `Choose a gallery or Flickr album, then pick slides for the home page slider (${picks.length} / ${max}).`
          : `Choose a gallery or Flickr album, then pick photos (${picks.length} / ${max}). Only one source loads at a time.`}
      </Text>

      {picks.length > 0 ? (
        <Stack space={4}>
          {!isSpotlight ? <HomeFavoriteStackPreview cards={stackPreviewCards} /> : null}

          {!isSpotlight ? (
            <Stack space={3}>
              <Flex align="center" justify="space-between" gap={2}>
                <Text size={1} weight="semibold">Stack order &amp; fold</Text>
                <Button
                  icon={ResetIcon}
                  mode="bleed"
                  fontSize={1}
                  text="Reset all folds"
                  onClick={rebalanceStackPoses}
                />
              </Flex>
              <Text size={1} muted>
                #1 is the back of the deck; higher numbers sit in front on the home page. Use arrows to reorder.
              </Text>
              {picks.map((pick, index) => {
                const url = resolvePickThumb(pick);
                const label = resolvePickLabel(pick, index);
                const pose = pickStackPose(pick, index);
                return (
                  <Card key={pick._key} padding={3} radius={2} border tone="transparent">
                    <Flex gap={3} align="flex-start">
                      <Box style={{ width: 72, flexShrink: 0 }}>
                        {url ? (
                          <img
                            src={url}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", borderRadius: 4 }}
                          />
                        ) : (
                          <Flex align="center" justify="center" style={{ aspectRatio: "4/5" }}>
                            <Spinner muted />
                          </Flex>
                        )}
                      </Box>
                      <Box flex={1}>
                        <Stack space={3}>
                          <Flex align="center" justify="space-between" gap={2}>
                            <Text size={1} weight="medium">{label}</Text>
                            <Flex gap={1}>
                              <Button
                                icon={ArrowUpIcon}
                                mode="bleed"
                                disabled={index === 0}
                                aria-label="Move earlier in stack (back)"
                                onClick={() => movePick(pick._key, -1)}
                              />
                              <Button
                                icon={ArrowDownIcon}
                                mode="bleed"
                                disabled={index === picks.length - 1}
                                aria-label="Move later in stack (front)"
                                onClick={() => movePick(pick._key, 1)}
                              />
                              <Button
                                icon={TrashIcon}
                                mode="bleed"
                                tone="critical"
                                aria-label="Remove from favorites"
                                onClick={() => removePick(pick._key)}
                              />
                            </Flex>
                          </Flex>
                          <HomeFavoriteStackPoseEditor
                            pose={pose}
                            label="Fold"
                            onChange={(stackPose) => updatePickStackPose(pick._key, stackPose)}
                            onReset={() => updatePickStackPose(pick._key, defaultStackPose(index, picks.length))}
                          />
                        </Stack>
                      </Box>
                    </Flex>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <Stack space={3}>
              <Text size={1} weight="semibold">Slide order</Text>
              <Text size={1} muted>First slide shows first on the home page. Use arrows to reorder.</Text>
              {picks.map((pick, index) => {
                const url = resolvePickThumb(pick);
                const label = resolvePickLabel(pick, index);
                return (
                  <Card key={pick._key} padding={3} radius={2} border tone="transparent">
                    <Flex gap={3} align="center">
                      {url ? (
                        <img
                          src={url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          style={{ width: 96, aspectRatio: "16/9", objectFit: "cover", borderRadius: 4, flexShrink: 0 }}
                        />
                      ) : null}
                      <Text size={1} weight="medium" style={{ flex: 1 }}>{label}</Text>
                      <Flex gap={1}>
                        <Button
                          icon={ArrowUpIcon}
                          mode="bleed"
                          disabled={index === 0}
                          aria-label="Move earlier"
                          onClick={() => movePick(pick._key, -1)}
                        />
                        <Button
                          icon={ArrowDownIcon}
                          mode="bleed"
                          disabled={index === picks.length - 1}
                          aria-label="Move later"
                          onClick={() => movePick(pick._key, 1)}
                        />
                        <Button
                          icon={TrashIcon}
                          mode="bleed"
                          tone="critical"
                          aria-label="Remove slide"
                          onClick={() => removePick(pick._key)}
                        />
                      </Flex>
                    </Flex>
                  </Card>
                );
              })}
            </Stack>
          )}

          {/* Crop editors — only for Sanity picks */}
          {picks.some((p) => !p.flickrPhotoId) ? (
            <Stack space={4}>
              <Text size={1} weight="semibold">
                {isSpotlight ? "Slide crops (16:9)" : "Card crops"}
              </Text>
              {picks.map((pick, index) => {
                if (pick.flickrPhotoId) return null;
                const gallery = pickGalleries.find((g) => g._id === pick.gallery?._ref);
                const image = resolvePickImage(pick);
                return (
                  <Card key={`crop-${pick._key}`} padding={3} radius={2} border tone="transparent">
                    <HomeFavoriteFramingEditor
                      client={client}
                      image={image}
                      framing={pickFraming(pick)}
                      label={`#${index + 1}${gallery ? ` · ${galleryLabel(gallery)}` : ""}`}
                      aspectRatio={isSpotlight ? "16 / 9" : "4 / 5"}
                      onChange={(framing) => updatePickFraming(pick._key, framing)}
                      onReset={() => resetPickFraming(pick)}
                    />
                  </Card>
                );
              })}
            </Stack>
          ) : null}
        </Stack>
      ) : null}

      <TextInput
        icon={SearchIcon}
        placeholder="Search galleries and Flickr albums…"
        value={filter}
        onChange={(e) => setFilter(e.currentTarget.value)}
      />

      {listError ? (
        <Card padding={3} radius={2} tone="critical">
          <Text size={1}>{listError}</Text>
        </Card>
      ) : null}

      {/* Sanity galleries */}
      {listLoading ? (
        <Flex align="center" gap={2}>
          <Spinner muted />
          <Text size={1} muted>Loading gallery list…</Text>
        </Flex>
      ) : listError ? null : filteredGalleryList.length > 0 ? (
        <Stack space={1}>
          <Text size={0} muted weight="semibold" style={{ paddingLeft: 4, paddingBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Sanity galleries
          </Text>
          <Card padding={2} radius={2} border tone="transparent">
            <Stack space={1}>
              {filteredGalleryList.map((gallery) => {
                const open = activeGalleryId === gallery._id;
                return (
                  <Box key={gallery._id}>
                    <Button
                      mode="bleed"
                      tone={open ? "primary" : "default"}
                      onClick={() => {
                        setActiveGalleryId(open ? null : gallery._id);
                        setActiveFlickrAlbumId(null);
                      }}
                      style={{ width: "100%", justifyContent: "flex-start" }}
                    >
                      <Flex align="center" gap={2} style={{ width: "100%" }}>
                        <Text muted>{open ? <ChevronDownIcon /> : <ChevronRightIcon />}</Text>
                        <Text size={1} weight="medium">{galleryLabel(gallery)}</Text>
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
              })}
            </Stack>
          </Card>
        </Stack>
      ) : null}

      {/* Flickr albums */}
      {flickrAlbumsLoading ? (
        <Flex align="center" gap={2}>
          <Spinner muted />
          <Text size={1} muted>Loading Flickr albums…</Text>
        </Flex>
      ) : filteredFlickrAlbumList.length > 0 ? (
        <Stack space={1}>
          <Text size={0} muted weight="semibold" style={{ paddingLeft: 4, paddingBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Flickr albums
          </Text>
          <Card padding={2} radius={2} border tone="transparent">
            <Stack space={1}>
              {filteredFlickrAlbumList.map((album) => {
                const open = activeFlickrAlbumId === album.flickrAlbumId;
                return (
                  <Box key={album._id}>
                    <Button
                      mode="bleed"
                      tone={open ? "primary" : "default"}
                      onClick={() => {
                        setActiveFlickrAlbumId(open ? null : album.flickrAlbumId);
                        setActiveGalleryId(null);
                      }}
                      style={{ width: "100%", justifyContent: "flex-start" }}
                    >
                      <Flex align="center" gap={2} style={{ width: "100%" }}>
                        <Text muted>{open ? <ChevronDownIcon /> : <ChevronRightIcon />}</Text>
                        <Text size={1} weight="medium">{flickrAlbumLabel(album)}</Text>
                        <Text size={0} muted style={{ marginLeft: "auto" }}>Flickr</Text>
                      </Flex>
                    </Button>
                    {open ? (
                      <Box paddingLeft={3} paddingTop={2} paddingBottom={3}>
                        {renderFlickrPhotoGrid(album.flickrAlbumId)}
                      </Box>
                    ) : null}
                  </Box>
                );
              })}
            </Stack>
          </Card>
        </Stack>
      ) : null}

      {!activeGalleryId && !activeFlickrAlbumId ? (
        <Text size={1} muted>Expand a gallery or Flickr album above to browse and select photos.</Text>
      ) : null}
    </Stack>
  );
}
