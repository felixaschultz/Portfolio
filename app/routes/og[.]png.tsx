import { readFile } from "node:fs/promises";
import path from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import type { Route } from "./+types/og[.]png";

const FONT_DIR = path.join(process.cwd(), "app/assets/fonts");

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

let fontsPromise: ReturnType<typeof loadFonts> | null = null;

async function loadFonts() {
  const [serif, sansRegular, sansSemiBold] = await Promise.all([
    readFile(path.join(FONT_DIR, "InstrumentSerif-Regular.ttf")),
    readFile(path.join(FONT_DIR, "DMSans-Regular.ttf")),
    readFile(path.join(FONT_DIR, "DMSans-SemiBold.ttf")),
  ]);
  return [
    { name: "Instrument Serif", data: toArrayBuffer(serif), weight: 400 as const, style: "normal" as const },
    { name: "DM Sans", data: toArrayBuffer(sansRegular), weight: 400 as const, style: "normal" as const },
    { name: "DM Sans", data: toArrayBuffer(sansSemiBold), weight: 600 as const, style: "normal" as const },
  ];
}

async function fetchImageBuffer(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

/** Dynamic Open Graph image: background photo + dark shade + overlaid text — same visual
 * language as the site's own photo heroes. Query params: title, subtitle, eyebrow, image. */
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const title = (url.searchParams.get("title") || "Felix A. Schultz").slice(0, 120);
  const subtitle = (url.searchParams.get("subtitle") || "").slice(0, 200);
  const eyebrow = (url.searchParams.get("eyebrow") || "").slice(0, 60);
  const imageUrl = url.searchParams.get("image");

  const [fonts, imageBuffer] = await Promise.all([
    fontsPromise ?? (fontsPromise = loadFonts()),
    imageUrl ? fetchImageBuffer(imageUrl) : Promise.resolve(null),
  ]);

  const svg = await satori(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "1200px",
        height: "630px",
        backgroundColor: "#0b0b0a",
      }}
    >
      {imageBuffer ? (
        <img
          src={imageBuffer as unknown as string}
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.18) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 56,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {eyebrow ? (
          <div
            style={{
              display: "flex",
              fontFamily: "DM Sans",
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#c9a876",
              marginBottom: 18,
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            fontFamily: "Instrument Serif",
            fontSize: 76,
            lineHeight: 1.05,
            color: "#ffffff",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        {subtitle ? (
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontFamily: "DM Sans",
              fontWeight: 400,
              fontSize: 28,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.82)",
              maxWidth: 820,
            }}
          >
            {subtitle}
          </div>
        ) : null}
      </div>
    </div>,
    { width: 1200, height: 630, fonts },
  );

  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } });
  const png = resvg.render().asPng();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
