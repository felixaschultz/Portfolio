import { redirect } from "react-router";
import type { Route } from "./+types/_index";
import { resolveEntryLocale } from "../lib/site-domains";

export function loader({ request }: Route.LoaderArgs) {
  const hostname = new URL(request.url).hostname;
  return redirect(`/${resolveEntryLocale(hostname)}`);
}
