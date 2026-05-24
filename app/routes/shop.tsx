import { data, Outlet, useMatches, type ShouldRevalidateFunctionArgs } from "react-router";
import type { Route } from "./+types/shop";
import { LocaleProvider } from "../components/LocaleProvider";
import { RouteErrorBoundary } from "../components/RouteErrorBoundary";
import { ShopPortalShell } from "../components/ShopPortalShell";
import { resolveSiteUrl } from "../lib/seo";
import type { Locale } from "../lib/i18n";
import {
  localeCookieHeader,
  readLangFromSearchParams,
  redirectIfShopLangMissing,
  resolveShopLocale,
} from "../lib/shop-locale";
import { readPaymentIntentLocale } from "../lib/shop.server";
import { useShopLocale } from "../lib/use-shop-locale";

type ShopRouteHandle = {
  shopWide?: boolean;
};

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const paymentIntentId =
    url.searchParams.get("pi")?.trim() ||
    url.searchParams.get("payment_intent")?.trim();

  let locale = resolveShopLocale(request);
  if (!readLangFromSearchParams(url.searchParams) && paymentIntentId) {
    const fromIntent = await readPaymentIntentLocale(paymentIntentId);
    if (fromIntent) locale = fromIntent;
  }

  redirectIfShopLangMissing(request, locale);

  return data(
    { locale, siteUrl: resolveSiteUrl(request) },
    { headers: { "Set-Cookie": localeCookieHeader(locale) } },
  );
}

export function shouldRevalidate({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}: ShouldRevalidateFunctionArgs) {
  if (
    readLangFromSearchParams(currentUrl.searchParams) !==
    readLangFromSearchParams(nextUrl.searchParams)
  ) {
    return true;
  }
  return defaultShouldRevalidate();
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <RouteErrorBoundary error={error} />;
}

export default function ShopLayoutRoute() {
  const locale = useShopLocale();
  const matches = useMatches();
  const shopWide = matches.some((m) => (m.handle as ShopRouteHandle | undefined)?.shopWide);

  return (
    <LocaleProvider locale={locale}>
      <ShopPortalShell
        locale={locale}
        mainClassName={shopWide ? "customer-portal__main--wide shop-gallery" : ""}
      >
        <Outlet context={{ locale }} />
      </ShopPortalShell>
    </LocaleProvider>
  );
}
