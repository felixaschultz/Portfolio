import { Box, Card, Flex, Stack, Text } from "@sanity/ui";
import type { HomeFavoriteStackPreviewCard } from "./HomeFavoriteStackPreview";
import { stackPoseTransform } from "../lib/home-favorite-stack";

export type { HomeFavoriteStackPreviewCard };

type HomeFavoriteStackPreviewProps = {
  cards: HomeFavoriteStackPreviewCard[];
};

const PREVIEW_MAX_WIDTH = 300;
const STACK_HEIGHT = 280;
const CARD_WIDTH = PREVIEW_MAX_WIDTH * 0.78;

const previewShell: React.CSSProperties = {
  maxWidth: PREVIEW_MAX_WIDTH,
  marginInline: "auto",
  padding: "1.25rem 1rem 1rem",
  borderRadius: 10,
  background: "#0f0f0f",
  border: "1px solid rgba(255, 255, 255, 0.1)",
};

const stackStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: STACK_HEIGHT,
  margin: "0 auto",
  overflow: "visible",
};

const cardStyle: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: CARD_WIDTH,
  aspectRatio: "4 / 5",
  overflow: "hidden",
  borderRadius: "0.65rem",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: "0 18px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.2)",
  transformOrigin: "center center",
  transition: "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
};

const imageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  display: "block",
};

const shadeStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 38%)",
  pointerEvents: "none",
};

const metaStyle: React.CSSProperties = {
  position: "absolute",
  left: "0.6rem",
  right: "0.6rem",
  bottom: "0.55rem",
  zIndex: 1,
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  color: "#fff",
  fontSize: "0.625rem",
  lineHeight: 1.25,
};

export function HomeFavoriteStackPreview({ cards }: HomeFavoriteStackPreviewProps) {
  if (cards.length === 0) return null;

  return (
    <Card padding={3} radius={2} tone="transparent" border>
      <Stack space={3}>
        <Text size={1} weight="semibold">
          Home page preview
        </Text>
        <Text size={1} muted>
          Live preview of stack order, fold, and crop — matches the favorite photos block on your site.
        </Text>
        <Box style={previewShell}>
          <div style={stackStyle}>
            {cards.map((card, index) => (
              <div
                key={card.key}
                style={{
                  ...cardStyle,
                  zIndex: index + 1,
                  transform: stackPoseTransform(card.pose),
                }}
              >
                {card.imageUrl ? (
                  <img
                    src={card.imageUrl}
                    alt=""
                    decoding="async"
                    style={{ ...imageStyle, objectPosition: card.objectPosition }}
                  />
                ) : (
                  <Flex
                    align="center"
                    justify="center"
                    style={{ width: "100%", height: "100%", background: "rgba(255,255,255,0.06)" }}
                  >
                    <Text size={1} muted>
                      …
                    </Text>
                  </Flex>
                )}
                <div style={shadeStyle} aria-hidden />
                <div style={metaStyle}>
                  <span style={{ fontFamily: "monospace", opacity: 0.85, letterSpacing: "0.12em" }}>
                    {index + 1}
                  </span>
                  <span style={{ fontWeight: 500 }}>{card.caption}</span>
                </div>
              </div>
            ))}
          </div>
        </Box>
      </Stack>
    </Card>
  );
}
