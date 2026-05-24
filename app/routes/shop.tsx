import { Outlet, useMatches } from "react-router";
import type { Route } from "./+types/shop";
import { RouteErrorBoundary } from "../components/RouteErrorBoundary";
import { ShopPortalShell } from "../components/ShopPortalShell";
import { resolveSiteUrl } from "../lib/seo";

type ShopRouteHandle = {
  shopWide?: boolean;
};

export function loader({ request }: Route.LoaderArgs) {
  return { siteUrl: resolveSiteUrl(request) };
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <RouteErrorBoundary error={error} />;
}

export default function ShopLayoutRoute() {
  const matches = useMatches();
  const shopWide = matches.some((m) => (m.handle as ShopRouteHandle | undefined)?.shopWide);

  return (
    <ShopPortalShell
      mainClassName={shopWide ? "customer-portal__main--wide shop-gallery" : ""}
    >
      <Outlet />
    </ShopPortalShell>
  );
}
