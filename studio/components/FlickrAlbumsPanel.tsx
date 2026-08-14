import { useEffect, useState } from "react";
import { Box, Button, Card, Flex, Grid, Spinner, Stack, Text } from "@sanity/ui";
import { useClient } from "sanity";
import { useRouter } from "sanity/router";
import { albumCoverUrl, albumFlickrUrl, fetchAlbums, isConfigured, type FlickrAlbum } from "../lib/flickr";

function AlbumCard({ album, userId }: { album: FlickrAlbum; userId: string }) {
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const client = useClient({ apiVersion: "2024-05-16" });
  const router = useRouter();

  const docId = `flickr-meta-${album.id}`;

  const copy = async () => {
    await navigator.clipboard.writeText(album.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const editMetadata = async () => {
    setSaving(true);
    try {
      await client
        .transaction()
        .createIfNotExists({
          _id: docId,
          _type: "flickrAlbumMeta",
          flickrAlbumId: album.id,
          albumTitle: album.title,
        })
        .commit();
      router.navigateIntent("edit", { id: docId, type: "flickrAlbumMeta" });
    } catch (err) {
      console.error("[flickr] Failed to create metadata doc:", err);
    } finally {
      setSaving(false);
    }
  };

  const date = new Date(parseInt(album.dateCreate, 10) * 1000).toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Card border radius={2} padding={0} style={{ overflow: "hidden" }}>
      <Stack>
        <Box
          style={{
            aspectRatio: "4 / 3",
            overflow: "hidden",
            background: "var(--card-muted-bg-color)",
          }}
        >
          <img
            src={albumCoverUrl(album, "z")}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </Box>
        <Stack space={2} padding={3}>
          <Text size={1} weight="semibold" style={{ wordBreak: "break-word" }}>
            {album.title}
          </Text>
          <Text size={0} muted>
            {album.photoCount} photos · {date}
          </Text>
          <Flex gap={2} wrap="wrap" marginTop={1}>
            <Button
              text={saving ? "Opening…" : "Edit metadata"}
              tone="primary"
              mode="ghost"
              fontSize={0}
              padding={2}
              disabled={saving}
              onClick={editMetadata}
            />
            <Button
              text={copied ? "Copied!" : "Copy ID"}
              tone={copied ? "positive" : "default"}
              mode="ghost"
              fontSize={0}
              padding={2}
              onClick={copy}
            />
            <a href={albumFlickrUrl(album.id, userId)} target="_blank" rel="noopener noreferrer">
              <Button text="Flickr ↗" mode="ghost" fontSize={0} padding={2} />
            </a>
          </Flex>
        </Stack>
      </Stack>
    </Card>
  );
}

export function FlickrAlbumsPanel() {
  const [albums, setAlbums] = useState<FlickrAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = (import.meta.env.SANITY_STUDIO_FLICKR_USER_ID as string | undefined) ?? "";

  useEffect(() => {
    if (!isConfigured()) {
      setError("SANITY_STUDIO_FLICKR_API_KEY or SANITY_STUDIO_FLICKR_USER_ID is not set.");
      setLoading(false);
      return;
    }
    fetchAlbums()
      .then(setAlbums)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load albums"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box padding={4}>
      <Stack space={4}>
        <Text size={3} weight="semibold">
          Flickr Albums
        </Text>
        <Text size={1} muted>
          All your public Flickr albums. Click <strong>Edit metadata</strong> to add categories,
          tags, and location — the document is created automatically. Standalone albums appear on the
          site without any Studio setup.
        </Text>

        {loading ? (
          <Flex align="center" gap={3} padding={4}>
            <Spinner />
            <Text size={1} muted>Loading albums…</Text>
          </Flex>
        ) : error ? (
          <Card tone="critical" padding={3} radius={2} border>
            <Text size={1}>{error}</Text>
          </Card>
        ) : albums.length === 0 ? (
          <Text size={1} muted>No albums found.</Text>
        ) : (
          <Grid columns={[2, 3, 4]} gap={3}>
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} userId={userId} />
            ))}
          </Grid>
        )}
      </Stack>
    </Box>
  );
}
