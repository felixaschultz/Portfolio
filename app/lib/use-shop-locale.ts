import { useSearchParams, useOutletContext, useRouteLoaderData } from "react-router";
import { readLangFromSearchParams } from "./shop-locale";
import { defaultLocale, type Locale } from "./i18n";

export type ShopOutletContext = {
  locale: Locale;
};

/**
 * Shop UI locale — `?lang=` in the URL wins so the language switcher and i18n
 * stay aligned even when a child route loader is briefly stale.
 */
export function useShopLocale(): Locale {
  const [searchParams] = useSearchParams();
  const fromUrl = readLangFromSearchParams(searchParams);
  if (fromUrl) return fromUrl;

  const outlet = useOutletContext<ShopOutletContext | undefined>();
  if (outlet?.locale) return outlet.locale;

  const shop = useRouteLoaderData("routes/shop") as { locale?: Locale } | undefined;
  return shop?.locale ?? defaultLocale;
}
