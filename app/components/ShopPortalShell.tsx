import type { ReactNode } from "react";
import { Link } from "react-router";
import { LogoMark } from "./LogoMark";
import { SITE_NAME } from "../lib/seo";

type ShopPortalShellProps = {
  children: ReactNode;
  /** e.g. "wide" for the photo grid page */
  mainClassName?: string;
};

export function ShopPortalShell({ children, mainClassName = "" }: ShopPortalShellProps) {
  return (
    <div className="customer-portal">
      <header className="shop-portal-header">
        <Link to="/da" className="shop-portal-header__brand">
          <LogoMark className="shop-portal-header__mark" />
          <span className="shop-portal-header__name">{SITE_NAME}</span>
        </Link>
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
