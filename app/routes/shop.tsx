import { Outlet, useMatches } from "react-router";
import { ShopPortalShell } from "../components/ShopPortalShell";
type ShopRouteHandle = {
  shopWide?: boolean;
};

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
