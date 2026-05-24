import { data, Outlet, useMatches, useRouteLoaderData } from "react-router";
import type { Route } from "./+types/shop";
import { LocaleProvider } from "../components/LocaleProvider";
import type { Locale } from "../lib/i18n";
import { RouteErrorBoundary } from "../components/RouteErrorBoundary";
import { ShopPortalShell } from "../components/ShopPortalShell";
import { resolveSiteUrl } from "../lib/seo";
import { localeCookieHeader, resolveShopLocale } from "../lib/shop-locale";

type ShopRouteHandle = {
  shopWide?: boolean;
};

export function loader({ request }: Route.LoaderArgs) {
  const locale = resolveShopLocale(request);
  return data(
    { locale, siteUrl: resolveSiteUrl(request) },
    { headers: { "Set-Cookie": localeCookieHeader(locale) } },
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <RouteErrorBoundary error={error} />;
}

export default function ShopLayoutRoute() {
  const { locale } = useRouteLoaderData("routes/shop") as { locale: Locale };
  const matches = useMatches();
  const shopWide = matches.some((m) => (m.handle as ShopRouteHandle | undefined)?.shopWide);

  return (
    <LocaleProvider locale={locale}>
      <ShopPortalShell
        locale={locale}
        mainClassName={shopWide ? "customer-portal__main--wide shop-gallery" : ""}
      >
        <Outlet />
      </ShopPortalShell>
    </LocaleProvider>
  );
}
