import { studioTheme } from "@sanity/ui";

const BRAND = "#15b0ab";
const BRAND_FG = "#0a0f0e";
const BG = "#0a0f0e";
const SURFACE = "#0f1615";
const TEXT = "#e8f0ef";
const MUTED = "#8aa8a4";

type ToneNode = Record<string, unknown>;

function patchStateColors(
  states: ToneNode | undefined,
  bg: string,
  fg: string,
  border = "transparent",
) {
  if (!states || typeof states !== "object") return;
  for (const state of Object.values(states)) {
    if (!state || typeof state !== "object") continue;
    const s = state as ToneNode;
    if (typeof s.bg === "string") s.bg = bg;
    if (typeof s.fg === "string") s.fg = fg;
    if (typeof s.border === "string") s.border = border;
  }
}

function patchPrimaryTone(tone: ToneNode, bg: string, fg: string) {
  const button = tone.button as ToneNode | undefined;
  if (button) {
    for (const variant of Object.values(button)) {
      patchStateColors((variant as ToneNode)?.primary as ToneNode, bg, fg);
    }
  }
  const solid = tone.solid as ToneNode | undefined;
  if (solid?.primary) {
    patchStateColors(solid.primary as ToneNode, bg, fg);
  }
  const base = tone.base as ToneNode | undefined;
  if (base) {
    if (typeof base.focusRing === "string") base.focusRing = bg;
    if (typeof base.border === "string") base.border = `color-mix(in srgb, ${bg} 35%, transparent)`;
  }
}

function patchDefaultChrome(tone: ToneNode, bg: string, fg: string, muted: string) {
  const base = tone.base as ToneNode | undefined;
  if (base) {
    base.bg = bg;
    base.fg = fg;
    base.focusRing = BRAND;
    if (typeof base.border === "string") {
      base.border = `color-mix(in srgb, ${BRAND} 22%, ${bg})`;
    }
  }
  const mutedTone = tone.muted as ToneNode | undefined;
  if (mutedTone?.default && typeof mutedTone.default === "object") {
    const m = mutedTone.default as ToneNode;
    if (typeof m.fg === "string") m.fg = muted;
  }
}

/** Portfolio Studio theme — teal accent aligned with felix-schultz.net */
export const portfolioTheme = (() => {
  const theme = structuredClone(studioTheme) as typeof studioTheme;

  patchPrimaryTone(theme.color.dark.primary as ToneNode, BRAND, BRAND_FG);
  patchPrimaryTone(theme.color.light.primary as ToneNode, BRAND, BRAND_FG);
  patchDefaultChrome(theme.color.dark.default as ToneNode, SURFACE, TEXT, MUTED);
  patchDefaultChrome(theme.color.light.default as ToneNode, "#f4f8f7", BG, "#5a7370");

  return theme;
})();
