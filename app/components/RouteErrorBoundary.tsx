import { useLocation } from "react-router";
import {
  localeFromPathname,
  resolveErrorPageContent,
  type ErrorPageContext,
} from "../lib/error-page";
import { ErrorPage } from "./ErrorPage";

type RouteErrorBoundaryProps = {
  error: unknown;
  context?: ErrorPageContext;
  showBrand?: boolean;
  className?: string;
};

function inferContext(pathname: string): ErrorPageContext {
  if (pathname.startsWith("/shop/download")) return "download";
  if (pathname.startsWith("/download")) return "download";
  if (pathname.startsWith("/shop")) return "shop";
  return "site";
}

export function RouteErrorBoundary({
  error,
  context,
  showBrand = false,
  className,
}: RouteErrorBoundaryProps) {
  const { pathname } = useLocation();
  const resolvedContext = context ?? inferContext(pathname);
  const content = resolveErrorPageContent(error, {
    context: resolvedContext,
    locale: localeFromPathname(pathname),
  });

  return (
    <ErrorPage content={content} showBrand={showBrand} className={className} />
  );
}
