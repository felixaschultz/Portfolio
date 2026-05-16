import { redirect } from "react-router";
import { defaultLocale } from "../lib/i18n";

export function loader() {
  return redirect(`/${defaultLocale}/photography`);
}
