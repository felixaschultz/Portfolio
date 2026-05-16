import { useEffect } from "react";

/** Load analytics/consent scripts after hydration so they don't break React event handlers. */
export function ThirdPartyScripts() {
  useEffect(() => {
    const gtagScript = document.createElement("script");
    gtagScript.async = true;
    gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-ZTLK2LKHCH";
    document.head.appendChild(gtagScript);

    const gtagInit = document.createElement("script");
    gtagInit.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-ZTLK2LKHCH');
    `;
    document.head.appendChild(gtagInit);

    const cookieScript = document.createElement("script");
    cookieScript.async = true;
    cookieScript.src =
      "https://downloads.intastellarsolutions.com/cookieconsents/assets/v1.0.0/cookieconsent.min.js";
    document.head.appendChild(cookieScript);

    const loginScript = document.createElement("script");
    loginScript.async = true;
    loginScript.src = "https://accounts.intastellar.com/v1/login.js";
    document.body.appendChild(loginScript);
  }, []);

  return null;
}
