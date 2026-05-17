import { useEffect } from "react";
import { useLocation } from "react-router";
import { getGtmId, pushToDataLayer } from "../lib/gtm";

const GTM_SCRIPT = (id: string) =>
  `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':` +
  `new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],` +
  `j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=` +
  `'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);` +
  `})(window,document,'script','dataLayer','${id}');`;

/** Inline bootstrap — render in <head> via root Layout. */
export function GoogleTagManagerHead({ containerId }: { containerId: string }) {
  return (
    <script
      dangerouslySetInnerHTML={{ __html: GTM_SCRIPT(containerId) }}
    />
  );
}

/** Noscript fallback — first element inside <body>. */
export function GoogleTagManagerNoScript({ containerId }: { containerId: string }) {
  return (
    <noscript>
      <iframe
        title="Google Tag Manager"
        src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
        height={0}
        width={0}
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}

/** SPA page views for React Router navigations. */
export function GoogleTagManagerRouteTracker() {
  const location = useLocation();
  const containerId = getGtmId();

  useEffect(() => {
    if (!containerId) return;

    pushToDataLayer({
      event: "page_view",
      page_path: location.pathname + location.search + location.hash,
      page_title: document.title,
    });
  }, [containerId, location.pathname, location.search, location.hash]);

  return null;
}
