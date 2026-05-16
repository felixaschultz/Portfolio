import { ImagesIcon } from "@sanity/icons";
import { Box, Button, Card, Flex, Grid, Stack, Text } from "@sanity/ui";
import { useCallback, useMemo } from "react";
import {
  PatchEvent,
  type StringInputProps,
  set,
  unset,
  useClient,
  useFormValue,
} from "sanity";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";

type GalleryImageRow = {
  _key: string;
  image?: SanityImageSource;
  alt?: string;
};

function thumbUrl(client: ReturnType<typeof useClient>, source: SanityImageSource | undefined) {
  if (!source) return null;
  try {
    return createImageUrlBuilder(client).image(source).width(240).height(160).fit("crop").auto("format").url();
  } catch {
    return null;
  }
}

export function CoverImageInput(props: StringInputProps) {
  const client = useClient({ apiVersion: "2024-05-16" });
  const images = useFormValue(["images"]) as GalleryImageRow[] | undefined;
  const coverKey = typeof props.value === "string" ? props.value : undefined;

  const rows = useMemo(
    () => (images ?? []).filter((row) => row?._key && row.image),
    [images],
  );

  const selectCover = useCallback(
    (key: string | null) => {
      props.onChange(PatchEvent.from(key ? set(key) : unset()));
    },
    [props],
  );

  if (rows.length === 0) {
    return (
      <Card padding={3} radius={2} tone="transparent" border>
        <Flex align="center" gap={3}>
          <Text muted>
            <ImagesIcon />
          </Text>
          <Text size={1} muted>
            Add photos above, then choose which one is the cover for the gallery list and social
            previews.
          </Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Stack space={3}>
      <Text size={1} muted>
        Pick the photo used on the photography index, home page, and link previews. If none is
        selected, the first photo is used.
      </Text>
      <Grid columns={[2, 3, 4]} gap={2}>
        {rows.map((row) => {
          const selected = coverKey === row._key;
          const url = thumbUrl(client, row.image);
          return (
            <button
              key={row._key}
              type="button"
              onClick={() => selectCover(row._key)}
              style={{
                padding: 0,
                border: "none",
                background: "none",
                cursor: "pointer",
                borderRadius: 6,
                overflow: "hidden",
              }}
              aria-pressed={selected}
              aria-label={row.alt || "Select cover photo"}
            >
              <Card
                padding={0}
                radius={2}
                shadow={selected ? 2 : 0}
                tone={selected ? "positive" : "default"}
              >
                {url ? (
                  <Box style={{ aspectRatio: "3/2", overflow: "hidden" }}>
                    <img
                      src={url}
                      alt=""
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </Box>
                ) : (
                  <Box padding={4}>
                    <Text size={1} muted>
                      No preview
                    </Text>
                  </Box>
                )}
              </Card>
            </button>
          );
        })}
      </Grid>
      {coverKey ? (
        <Button text="Use first photo (default)" mode="ghost" onClick={() => selectCover(null)} />
      ) : (
        <Text size={1} muted>
          Using the first photo as cover.
        </Text>
      )}
    </Stack>
  );
}
