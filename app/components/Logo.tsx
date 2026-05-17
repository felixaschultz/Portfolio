import { Link, useParams } from "react-router";

type LogoProps = {
  className?: string;
};

/** Typography-only logotype — pairs with Instrument Serif across the site. */
export function Logo({ className = "" }: LogoProps) {
  const { locale } = useParams();
  const base = `/${locale ?? "da"}`;

  return (
    <Link
      to={base}
      className={`site-logo ${className}`.trim()}
      aria-label="Felix A. Schultz — home"
    >
      <span className="site-logo__name">Felix A. Schultz</span>
    </Link>
  );
}
