import { ResetIcon } from "@sanity/icons";
import { Box, Button, Flex, Stack, Text } from "@sanity/ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { createImageUrlBuilder, type SanityImageSource } from "@sanity/image-url";
import {
  DEFAULT_HOME_FAVORITE_FRAMING,
  type HomeFavoriteFraming,
  applyHomeFavoriteFraming,
} from "../../app/lib/home-favorite-framing";

type HomeFavoriteFramingEditorProps = {
  client: ReturnType<typeof import("sanity").useClient>;
  image: SanityImageSource | undefined;
  framing: HomeFavoriteFraming;
  onChange: (next: HomeFavoriteFraming) => void;
  onReset: () => void;
  label: string;
};

function previewUrl(
  client: HomeFavoriteFramingEditorProps["client"],
  image: SanityImageSource,
  framing: HomeFavoriteFraming,
): string | null {
  try {
    return createImageUrlBuilder(client)
      .image(applyHomeFavoriteFraming(image, framing))
      .width(360)
      .height(450)
      .fit("crop")
      .format("webp")
      .quality(80)
      .url();
  } catch {
    return null;
  }
}

export function HomeFavoriteFramingEditor({
  client,
  image,
  framing,
  onChange,
  onReset,
  label,
}: HomeFavoriteFramingEditorProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; framing: HomeFavoriteFraming } | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!image) {
      setUrl(null);
      return;
    }
    setUrl(previewUrl(client, image, framing));
  }, [client, image, framing]);

  const pan = useCallback(
    (dx: number, dy: number) => {
      const sensitivity = 0.0022;
      onChange({
        ...framing,
        x: Math.min(1, Math.max(0, framing.x - dx * sensitivity)),
        y: Math.min(1, Math.max(0, framing.y - dy * sensitivity)),
      });
    },
    [framing, onChange],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!image) return;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = { x: e.clientX, y: e.clientY, framing };
    },
    [framing, image],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (dx === 0 && dy === 0) return;
      dragRef.current = { x: e.clientX, y: e.clientY, framing: drag.framing };
      pan(dx, dy);
    },
    [pan],
  );

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  const setZoom = useCallback(
    (zoom: number) => {
      const size = Math.min(1, Math.max(0.35, zoom));
      onChange({ ...framing, width: size, height: size });
    },
    [framing, onChange],
  );

  if (!image) {
    return (
      <Text size={1} muted>
        Image unavailable for crop.
      </Text>
    );
  }

  const zoomPercent = Math.round(framing.width * 100);

  return (
    <Stack space={3}>
      <Flex align="center" justify="space-between" gap={2}>
        <Text size={1} weight="medium">
          {label}
        </Text>
        <Button
          icon={ResetIcon}
          mode="bleed"
          tone="default"
          fontSize={1}
          text="Reset crop"
          onClick={onReset}
        />
      </Flex>
      <Text size={1} muted>
        Drag the preview to pan. Use zoom to tighten the crop. Matches the 4:5 cards on the home page.
      </Text>
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          touchAction: "none",
          cursor: dragRef.current ? "grabbing" : "grab",
          maxWidth: 280,
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid var(--card-border-color)",
          aspectRatio: "4 / 5",
          background: "var(--card-muted-bg-color)",
        }}
      >
        {url ? (
          <img
            src={url}
            alt=""
            draggable={false}
            style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
          />
        ) : (
          <Flex align="center" justify="center" style={{ height: "100%" }}>
            <Text size={1} muted>
              Loading preview…
            </Text>
          </Flex>
        )}
      </div>
      <Box>
        <Flex align="center" justify="space-between" marginBottom={2}>
          <Text size={1}>Zoom</Text>
          <Text size={1} muted>
            {zoomPercent}%
          </Text>
        </Flex>
        <input
          type="range"
          min={35}
          max={100}
          value={zoomPercent}
          onChange={(e) => setZoom(Number(e.currentTarget.value) / 100)}
          style={{ width: "100%", maxWidth: 280 }}
        />
      </Box>
    </Stack>
  );
}
