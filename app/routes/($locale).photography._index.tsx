import { useLoaderData } from "react-router";
import { useTranslation } from "react-i18next";
import type { Route } from "./+types/($locale).photography._index";
import { PhotoGrid } from "../components/PhotoGrid";
import { fetchPhotosForList, isSanityConfigured } from "../lib/sanity.server";

export async function loader() {
  const photos = await fetchPhotosForList();
  return { photos, sanityConfigured: isSanityConfigured() };
}

export function meta() {
  return [{ title: "Photography | Felix A. Schultz" }];
}

export default function PhotographyIndex() {
  const { photos, sanityConfigured } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl font-bold">{t("photography.title")}</h1>
        <p className="mt-4 text-[var(--color-muted)]">{t("photography.description")}</p>
        {!sanityConfigured && (
          <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            Sanity is not configured. Set SANITY_PROJECT_ID in .env and run npm run studio to add photos.
          </p>
        )}
      </header>
      {photos.length > 0 ? (
        <div className="mt-12">
          <PhotoGrid photos={photos} />
        </div>
      ) : (
        <p className="mt-12 text-center text-[var(--color-muted)]">{t("photography.empty")}</p>
      )}
    </div>
  );
}
