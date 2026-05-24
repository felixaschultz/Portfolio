import { Outlet, useMatches } from "react-router";
import type { Route } from "./+types/shop";
import { ShopPortalShell } from "../components/ShopPortalShell";
import { getSiteUrl } from "../lib/seo";

export function loader() {
  return { siteUrl: getSiteUrl() };
}

type ShopRouteHandle = {
  shopWide?: boolean;
};

export default function ShopLayoutRoute({ loaderData }: Route.ComponentProps) {
  const matches = useMatches();
  const shopWide = matches.some((m) => (m.handle as ShopRouteHandle | undefined)?.shopWide);

  return (
    <ShopPortalShell
      siteUrl={loaderData.siteUrl}
      mainClassName={shopWide ? "customer-portal__main--wide shop-gallery" : ""}
    >
      <Outlet />
    </ShopPortalShell>
  );
}
