import DOMPurify from "isomorphic-dompurify";

type HtmlContentProps = {
  html: string;
  className?: string;
};

export function HtmlContent({ html, className = "" }: HtmlContentProps) {
  const clean = DOMPurify.sanitize(html, {
    ADD_TAGS: ["video", "source"],
    ADD_ATTR: ["target", "rel", "playsinline", "muted", "autoplay", "loop", "controls"],
  });

  return (
    <div
      className={`prose-portfolio ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
