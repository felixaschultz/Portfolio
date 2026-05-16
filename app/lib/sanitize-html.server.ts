import sanitizeHtml from "sanitize-html";

const allowedTags = sanitizeHtml.defaults.allowedTags.concat([
  "img",
  "video",
  "source",
  "section",
  "figure",
  "figcaption",
]);

const allowedAttributes: sanitizeHtml.IOptions["allowedAttributes"] = {
  ...sanitizeHtml.defaults.allowedAttributes,
  img: ["src", "alt", "width", "height", "loading"],
  video: ["src", "playsinline", "muted", "autoplay", "loop", "controls", "width", "height"],
  source: ["src", "type"],
  a: ["href", "name", "target", "rel"],
  "*": ["class"],
};

export function sanitizePortfolioHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
  });
}
