import { sanitizePortfolioHtml } from "../lib/sanitize-html";

type HtmlContentProps = {
  html: string;
  className?: string;
};

/** Encode spaces in img src paths so browsers request the full filename. */
function fixAssetUrls(html: string): string {
  return html.replace(
    /<img([^>]*?)\ssrc=(["'])([^"']+)\2/gi,
    (_match, attrs: string, quote: string, src: string) => {
      const fixed = src.startsWith("/")
        ? src
            .split("/")
            .map((part, i) => (i === 0 ? part : encodeURIComponent(part)))
            .join("/")
        : encodeURI(src);
      return `<img${attrs} src=${quote}${fixed}${quote}`;
    },
  );
}

export function HtmlContent({ html, className = "" }: HtmlContentProps) {
  const clean = sanitizePortfolioHtml(html);

  return (
    <div
      className={`prose-portfolio ${className}`}
      dangerouslySetInnerHTML={{ __html: fixAssetUrls(clean) }}
    />
  );
}
