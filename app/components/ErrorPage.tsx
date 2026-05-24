import { Link } from "react-router";
import { LogoMark } from "./LogoMark";
import { SITE_NAME } from "../lib/seo";
import type { ErrorPageContent } from "../lib/error-page";

type ErrorPageProps = {
  content: ErrorPageContent;
  /** Show compact site branding above the card (default on root errors). */
  showBrand?: boolean;
  className?: string;
};

export function ErrorPage({ content, showBrand = true, className = "" }: ErrorPageProps) {
  const { statusCode, title, description, hint, actions, devMessage, devStack } = content;

  return (
    <div className={`error-page${className ? ` ${className}` : ""}`.trim()}>
      {showBrand ? (
        <Link to="/da" className="error-page__brand">
          <LogoMark className="error-page__mark" />
          <span className="error-page__brand-name">{SITE_NAME}</span>
        </Link>
      ) : null}

      <div className="error-page__card" role="alert">
        <p className="error-page__code" aria-hidden>
          {statusCode}
        </p>
        <h1 className="error-page__title">{title}</h1>
        <p className="error-page__description">{description}</p>
        {hint ? <p className="error-page__hint">{hint}</p> : null}

        <div className="error-page__actions">
          {actions.map((action) =>
            action.primary ? (
              <Link key={action.href + action.label} to={action.href} className="btn-primary">
                {action.label}
              </Link>
            ) : (
              <Link key={action.href + action.label} to={action.href} className="btn-ghost">
                {action.label}
              </Link>
            ),
          )}
        </div>

        {devMessage || devStack ? (
          <details className="error-page__dev">
            <summary>Tekniske detaljer (kun udvikling)</summary>
            {devMessage ? (
              <p className="error-page__dev-message">{devMessage}</p>
            ) : null}
            {devStack ? (
              <pre className="error-page__dev-stack">
                <code>{devStack}</code>
              </pre>
            ) : null}
          </details>
        ) : null}
      </div>
    </div>
  );
}
