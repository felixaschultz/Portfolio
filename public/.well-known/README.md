# Apple Pay domain verification

For Apple Pay on the shop checkout, Stripe must verify your domain.

1. Open [Stripe Dashboard → Settings → Payment methods → Payment method domains](https://dashboard.stripe.com/settings/payment_method_domains).
2. Add `www.felix-schultz.net` (and your Vercel preview domain if you test there).
3. Download the file Stripe provides.
4. Save it in this folder as **`apple-developer-merchantid-domain-association`** (no file extension).

It must be served at:

`https://www.felix-schultz.net/.well-known/apple-developer-merchantid-domain-association`

Files in `public/.well-known/` are deployed automatically with the site.

Google Pay uses the Payment Element and does not need a domain file (Safari/Chrome + supported card).

## MobilePay

1. Enable **MobilePay** under [Stripe → Payment methods](https://dashboard.stripe.com/settings/payment_methods).
2. Currency must be **DKK** (already set for the shop).
3. MobilePay is **redirect-based** — it usually does **not** appear on `http://localhost:5173`. Test on your deployed HTTPS domain (or Stripe test mode on staging).
