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

/** Renders HTML sanitized on the server (see project detail loader). */
export function HtmlContent({ html, className = "" }: HtmlContentProps) {
  return (
    <div
      className={`prose-portfolio ${className}`}
      dangerouslySetInnerHTML={{ __html: fixAssetUrls(html) }}
    />
  );
}
