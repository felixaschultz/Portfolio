import { isRouteErrorResponse } from "react-router";
import { defaultLocale, isValidLocale, type Locale } from "./i18n";

export type ErrorPageAction = {
  label: string;
  href: string;
  primary?: boolean;
};

export type ErrorPageContent = {
  statusCode: number;
  title: string;
  description: string;
  hint?: string;
  actions: ErrorPageAction[];
  devMessage?: string;
  devStack?: string;
};

export type ErrorPageContext = "site" | "shop" | "download";

type ResolveOptions = {
  context?: ErrorPageContext;
  locale?: Locale;
};

function siteActions(locale: Locale): ErrorPageAction[] {
  return [
    { label: "Forside", href: `/${locale}`, primary: true },
    { label: "Fotografi", href: `/${locale}/photography` },
    { label: "Projekter", href: `/${locale}/projects` },
  ];
}

function shopActions(locale: Locale): ErrorPageAction[] {
  return [
    { label: "Til forsiden", href: `/${locale}`, primary: true },
    { label: "Kontakt", href: `/${locale}#contact` },
  ];
}

function downloadActions(locale: Locale): ErrorPageAction[] {
  return [
    { label: "Til forsiden", href: `/${locale}`, primary: true },
    { label: "Kontakt", href: `/${locale}#contact` },
  ];
}

export function resolveErrorPageContent(
  error: unknown,
  options: ResolveOptions = {},
): ErrorPageContent {
  const locale = options.locale ?? defaultLocale;
  const context = options.context ?? "site";
  const actions =
    context === "shop"
      ? shopActions(locale)
      : context === "download"
        ? downloadActions(locale)
        : siteActions(locale);

  if (isRouteErrorResponse(error)) {
    const status = error.status;

    if (status === 404) {
      if (context === "shop") {
        return {
          statusCode: 404,
          title: "Shop-linket findes ikke",
          description:
            "Dette link kan være udløbet, forkert, eller galleriet er ikke sat op til salg endnu.",
          hint: "Bed fotografen om et nyt link, hvis du mener det burde virke.",
          actions,
        };
      }
      if (context === "download") {
        return {
          statusCode: 404,
          title: "Download-linket findes ikke",
          description:
            "Linket kan være udløbet, fjernet, eller der er en fejl i adressen.",
          hint: "Kontakt fotografen for et nyt link til dine billeder.",
          actions,
        };
      }
      return {
        statusCode: 404,
        title: "Siden findes ikke",
        description: "Adressen er forkert, eller siden er flyttet og slettet.",
        actions,
      };
    }

    if (status === 401 || status === 403) {
      if (context === "download") {
        return {
          statusCode: status,
          title: "Linket virker ikke",
          description:
            "Download-linket er udløbet eller ugyldigt. Kontakt fotografen for et nyt link.",
          actions,
        };
      }
      return {
        statusCode: status,
        title: "Adgang nægtet",
        description: "Du har ikke adgang til denne side.",
        actions,
      };
    }

    if (status >= 500) {
      return {
        statusCode: status,
        title: "Noget gik galt",
        description:
          "Serveren kunne ikke fuldføre forespørgslen. Prøv at genindlæse siden om et øjeblik.",
        hint: "Hvis problemet fortsætter, så skriv — vi finder ud af det.",
        actions,
      };
    }

    return {
      statusCode: status,
      title: `Fejl ${status}`,
      description: error.statusText || "Der opstod en fejl ved indlæsning af siden.",
      actions,
    };
  }

  const devMessage =
    import.meta.env.DEV && error instanceof Error ? error.message : error.toString();
  const devStack =
    import.meta.env.DEV && error instanceof Error ? error.stack : undefined;

  const contextHint =
    context === "shop"
      ? "Prøv at genindlæse siden. Hvis det sker igen, så kontakt fotografen."
      : "Prøv at genindlæse siden. Hvis det sker igen, så vend tilbage senere.";

  return {
    statusCode: 500,
    title: "Noget gik galt",
    description: "Der opstod en uventet fejl. Det er ikke dig — det er os.",
    hint: contextHint,
    actions,
    devMessage,
    devStack,
  };
}

export function localeFromPathname(pathname: string): Locale {
  const segment = pathname.split("/").filter(Boolean)[0];
  return segment && isValidLocale(segment) ? segment : defaultLocale;
}
