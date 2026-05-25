import { Link, useParams } from "react-router";
import { LogoMark } from "./LogoMark";

type LogoProps = {
  className?: string;
};

export function Logo({ className = "" }: LogoProps) {
  const { locale } = useParams();
  const base = `/${locale ?? "da"}`;

  return (
    <Link
      to={base}
      className={`site-logo ${className}`.trim()}
      aria-label="Felix A. Schultz — home"
    >
      <span className="site-logo__mark-ring" aria-hidden>
        <LogoMark className="site-logo__mark" />
      </span>
      <span className="site-logo__name">Felix A. Schultz</span>
    </Link>
  );
}
