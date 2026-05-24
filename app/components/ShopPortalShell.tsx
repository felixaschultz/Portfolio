import type { ReactNode } from "react";
import { LogoMark } from "./LogoMark";
import { SITE_NAME } from "../lib/seo";

type ShopPortalShellProps = {
  siteUrl: string;
  children: ReactNode;
  /** e.g. "wide" for the photo grid page */
  mainClassName?: string;
};

export function ShopPortalShell({ siteUrl, children, mainClassName = "" }: ShopPortalShellProps) {
  const homeHref = `${siteUrl.replace(/\/$/, "")}/da`;

  return (
    <div className="customer-portal">
      <header className="shop-portal-header">
        <a href={homeHref} className="shop-portal-header__brand">
          <LogoMark className="shop-portal-header__mark" />
          <span className="shop-portal-header__name">{SITE_NAME}</span>
        </a>
        <span className="shop-portal-header__badge">Photo shop</span>
      </header>
      <main
        className={`customer-portal__main${mainClassName ? ` ${mainClassName}` : ""}`.trim()}
      >
        {children}
      </main>
    </div>
  );
}
