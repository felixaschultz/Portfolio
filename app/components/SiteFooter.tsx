import { useTranslation } from "react-i18next";

export function SiteFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-[var(--color-muted)] sm:flex-row sm:px-6">
        <p>© {year} Felix A. Schultz. {t("footer.rights")}.</p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/felixaschultz"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--color-accent)]"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/felix-a-schultz/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--color-accent)]"
          >
            LinkedIn
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--color-accent)]"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
