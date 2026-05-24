import { useState } from "react";
import { Form } from "react-router";
import type { Route } from "./+types/shop.gallery.$token";
import { fetchShopGallery, isShopConfigured } from "../lib/shop.server";

export async function loader({ params }: Route.LoaderArgs) {
  const token = params.token?.trim();
  if (!token) {
    throw new Response("Not found", { status: 404 });
  }

  const gallery = await fetchShopGallery(token);
  if (!gallery) {
    throw new Response("Not found", { status: 404 });
  }

  return {
    shopToken: token,
    gallery,
    shopReady: isShopConfigured(),
  };
}

function formatEur(cents: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(
    cents / 100,
  );
}

export default function ShopGalleryPage({ loaderData }: Route.ComponentProps) {
  const { gallery, shopToken, shopReady } = loaderData;
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const totalCents = selected.size * gallery.priceCents;

  const toggle = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(gallery.images.map((i) => i.key)));
  const clearAll = () => setSelected(new Set());

  return (
    <div className="customer-portal">
      <main className="customer-portal__main customer-portal__main--wide">
        <header className="customer-portal__header">
          <h1 className="customer-portal__title">{gallery.title}</h1>
          <p className="customer-portal__muted">
            Select photos to buy · {formatEur(gallery.priceCents)} each · digital download
          </p>
        </header>

        {!shopReady ? (
          <p className="customer-portal__error">Online checkout is not available right now.</p>
        ) : null}

        <div className="customer-portal__toolbar">
          <button type="button" className="customer-portal__link-btn" onClick={selectAll}>
            Select all
          </button>
          <button type="button" className="customer-portal__link-btn" onClick={clearAll}>
            Clear
          </button>
          <span className="customer-portal__muted">
            {selected.size} selected · {formatEur(totalCents)}
          </span>
        </div>

        <ul className="shop-grid">
          {gallery.images.map((image) => {
            const isOn = selected.has(image.key);
            return (
              <li key={image.key}>
                <button
                  type="button"
                  className={`shop-grid__item${isOn ? " shop-grid__item--selected" : ""}`}
                  onClick={() => toggle(image.key)}
                  aria-pressed={isOn ? "true" : "false"}
                >
                  <img src={image.thumbUrl} alt={image.alt ?? ""} loading="lazy" />
                  <span className="shop-grid__check" aria-hidden>
                    {isOn ? "✓" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <footer className="customer-portal__footer">
          <Form method="post" action="/shop/checkout">
            <input type="hidden" name="shopToken" value={shopToken} />
            <input type="hidden" name="imageKeys" value={JSON.stringify([...selected])} />
            <button
              type="submit"
              className="customer-portal__button"
              disabled={!shopReady || selected.size === 0}
            >
              Continue to checkout · {formatEur(totalCents)}
            </button>
          </Form>
        </footer>
      </main>
    </div>
  );
}

export function meta({ data }: Route.MetaArgs) {
  const title = data?.gallery?.title ?? "Shop";
  return [{ title: `${title} — Shop` }, { name: "robots", content: "noindex" }];
}
