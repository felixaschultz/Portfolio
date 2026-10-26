export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  /** Rendered after the list, for a closing note that follows the bullet points. */
  trailing?: string[];
};

type LegalPageProps = {
  title: string;
  updated?: string;
  intro?: string[];
  sections: LegalSection[];
  children?: React.ReactNode;
};

export function LegalPage({ title, updated, intro, sections, children }: LegalPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
      <header>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{title}</h1>
        {updated && <p className="mt-2 text-sm text-[var(--color-muted)]">{updated}</p>}
      </header>

      {intro && intro.length > 0 && (
        <div className="mt-6">
          {intro.map((p, i) => (
            <p key={i} className="mt-3 leading-relaxed text-[var(--color-muted)]">
              {p}
            </p>
          ))}
        </div>
      )}

      {sections.map((section, i) => (
        <section key={i} className="mt-10">
          <h2 className="font-display text-xl font-semibold">{section.heading}</h2>
          {section.paragraphs?.map((p, j) => (
            <p key={j} className="mt-3 leading-relaxed text-[var(--color-muted)]">
              {p}
            </p>
          ))}
          {section.list && section.list.length > 0 && (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[var(--color-muted)]">
              {section.list.map((item, k) => (
                <li key={k} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          )}
          {section.trailing?.map((p, j) => (
            <p key={j} className="mt-3 leading-relaxed text-[var(--color-muted)]">
              {p}
            </p>
          ))}
        </section>
      ))}

      {children}
    </div>
  );
}
