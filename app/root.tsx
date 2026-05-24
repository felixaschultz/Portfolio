import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import {
  GoogleTagManagerHead,
  GoogleTagManagerNoScript,
  GoogleTagManagerRouteTracker,
} from "./components/GoogleTagManager";
import { RouteErrorBoundary } from "./components/RouteErrorBoundary";
import { getGtmId } from "./lib/gtm";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://cdn.sanity.io" },
  { rel: "dns-prefetch", href: "https://cdn.sanity.io" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap",
  },
  { rel: "icon", href: "/assets/logo-mark.svg", type: "image/svg+xml" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const gtmId = getGtmId();

  return (
    <html lang="da" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {gtmId ? <GoogleTagManagerHead containerId={gtmId} /> : null}
        <Meta />
        <Links />
      </head>
      <body>
        {gtmId ? <GoogleTagManagerNoScript containerId={gtmId} /> : null}
        <div id="root-app">{children}</div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <GoogleTagManagerRouteTracker />
      <Outlet />
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <RouteErrorBoundary error={error} showBrand className="error-page--standalone" />;
}
