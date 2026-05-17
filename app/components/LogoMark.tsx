type LogoMarkProps = {
  className?: string;
};

/** “F” monogram — matches `/assets/logo-mark.svg` (favicon). */
export function LogoMark({ className = "" }: LogoMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M10 8h14M10 16h10M10 24V8"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
