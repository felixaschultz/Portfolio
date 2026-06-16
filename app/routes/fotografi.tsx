import { redirect } from "react-router";
import type { Route } from "./+types/fotografi";
import { isNetHost, resolveEntryLocale } from "../lib/site-domains";

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  if (isNetHost(url.hostname)) {
    throw redirect("https://www.felix-schultz.dk/da/photography");
  }
  const locale = resolveEntryLocale(url.hostname);
  return redirect(`/${locale}/photography`);
}
