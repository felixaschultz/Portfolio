import { useEffect, useState } from "react";
import { Box, Card, Flex, Grid, Spinner, Stack, Text } from "@sanity/ui";
import type { StringInputProps } from "sanity";
import { fetchAlbumPhotos, type FlickrPhoto } from "../lib/flickr";

function PhotoThumb({ photo }: { photo: FlickrPhoto }) {
  const src = photo.url_n ?? photo.url_z ?? photo.url_s;
  if (!src) return null;
  return (
    <Box
      style={{
        aspectRatio: "3 / 2",
        overflow: "hidden",
        borderRadius: 4,
        background: "var(--card-muted-bg-color)",
      }}
    >
      <img
        src={src}
        alt={photo.title}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </Box>
  );
}

export function FlickrAlbumIdInput(props: StringInputProps) {
  const albumId = props.value?.trim() ?? "";
  const [photos, setPhotos] = useState<FlickrPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!albumId) {
      setPhotos([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetchAlbumPhotos(albumId)
      .then((items) => setPhotos(items.slice(0, 12)))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load photos"))
      .finally(() => setLoading(false));
  }, [albumId]);

  return (
    <Stack space={3}>
      {props.renderDefault(props)}

      {albumId ? (
        loading ? (
          <Flex align="center" gap={2} paddingY={2}>
            <Spinner muted />
            <Text size={1} muted>Loading preview…</Text>
          </Flex>
        ) : error ? (
          <Card tone="critical" padding={3} radius={2} border>
            <Text size={1}>{error}</Text>
          </Card>
        ) : photos.length > 0 ? (
          <Stack space={2}>
            <Text size={0} muted>
              Showing first {photos.length} photos from this album
            </Text>
            <Grid columns={[3, 4, 6]} gap={2}>
              {photos.map((photo) => (
                <PhotoThumb key={photo.id} photo={photo} />
              ))}
            </Grid>
          </Stack>
        ) : null
      ) : null}
    </Stack>
  );
}
