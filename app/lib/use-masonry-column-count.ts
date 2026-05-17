import { useEffect, useState } from "react";

/** Match gallery-mosaic breakpoints: 1 / 2 / 3 columns. */
export function useMasonryColumnCount(): number {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const lg = window.matchMedia("(min-width: 1024px)");
    const md = window.matchMedia("(min-width: 640px)");

    const update = () => {
      if (lg.matches) setColumns(3);
      else if (md.matches) setColumns(2);
      else setColumns(1);
    };

    update();
    lg.addEventListener("change", update);
    md.addEventListener("change", update);
    return () => {
      lg.removeEventListener("change", update);
      md.removeEventListener("change", update);
    };
  }, []);

  return columns;
}
