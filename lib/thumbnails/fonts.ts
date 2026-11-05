export type ThumbnailFont = {
  id: string
  label: string
  /** Nom CSS réel */
  family: string
  /** Stack fallback canvas */
  stack: string
  weight: number
  /** Google Fonts family query (omit for local/CDN custom) */
  google?: string
  /** CSS @font-face custom (Geist Black) */
  customCss?: string
  /** Aperçu UI */
  sample?: string
  vibe: string
}

export const THUMBNAIL_FONTS: ThumbnailFont[] = [
  {
    id: "lecalme",
    label: "Le Calme",
    family: "Geist Black",
    stack: '"Geist Black", "Geist", system-ui, sans-serif',
    weight: 900,
    customCss: `
      @font-face {
        font-family: "Geist Black";
        src: url("https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/Geist-Black.woff2") format("woff2");
        font-weight: 900;
        font-style: normal;
        font-display: swap;
      }
    `,
    sample: "LE CALME",
    vibe: "Intro / chat",
  },
  {
    id: "anton",
    label: "Anton",
    family: "Anton",
    stack: '"Anton", Impact, sans-serif',
    weight: 400,
    google: "Anton",
    sample: "IMPACT",
    vibe: "YouTube classique",
  },
  {
    id: "bebas",
    label: "Bebas Neue",
    family: "Bebas Neue",
    stack: '"Bebas Neue", "Arial Narrow", sans-serif',
    weight: 400,
    google: "Bebas+Neue",
    sample: "STREAM",
    vibe: "Condensé bold",
  },
  {
    id: "oswald",
    label: "Oswald",
    family: "Oswald",
    stack: '"Oswald", "Arial Narrow", sans-serif',
    weight: 700,
    google: "Oswald:wght@700",
    sample: "RAID",
    vibe: "Titre gaming",
  },
  {
    id: "archivo",
    label: "Archivo Black",
    family: "Archivo Black",
    stack: '"Archivo Black", Impact, sans-serif',
    weight: 400,
    google: "Archivo+Black",
    sample: "BOSS",
    vibe: "Très épais",
  },
  {
    id: "montserrat",
    label: "Montserrat",
    family: "Montserrat",
    stack: '"Montserrat", system-ui, sans-serif',
    weight: 900,
    google: "Montserrat:wght@900",
    sample: "EPIC",
    vibe: "Clean moderne",
  },
  {
    id: "russo",
    label: "Russo One",
    family: "Russo One",
    stack: '"Russo One", Impact, sans-serif',
    weight: 400,
    google: "Russo+One",
    sample: "GO",
    vibe: "Sport / punch",
  },
  {
    id: "bangers",
    label: "Bangers",
    family: "Bangers",
    stack: '"Bangers", "Comic Sans MS", cursive',
    weight: 400,
    google: "Bangers",
    sample: "WTF",
    vibe: "Fun / comic",
  },
  {
    id: "blackops",
    label: "Black Ops One",
    family: "Black Ops One",
    stack: '"Black Ops One", Impact, sans-serif',
    weight: 400,
    google: "Black+Ops+One",
    sample: "OPS",
    vibe: "Militaire",
  },
  {
    id: "playfair",
    label: "Playfair",
    family: "Playfair Display",
    stack: '"Playfair Display", Georgia, serif',
    weight: 900,
    google: "Playfair+Display:ital,wght@0,900;1,900",
    sample: "CINÉ",
    vibe: "Ciné / luxe",
  },
  {
    id: "minercraftory", label: "Minercraftory", family: "Minercraftory",
    stack: '"Minercraftory", monospace', weight: 400,
    customCss: `@font-face { font-family: "Minercraftory"; src: url("/fonts/minercraftory/Minercraftory.ttf") format("truetype"); font-weight: 400; font-style: normal; font-display: swap; }`,
    sample: "RESET", vibe: "Minecraft / Duclems",
  },
]

export function getThumbnailFont(id: string): ThumbnailFont {
  return THUMBNAIL_FONTS.find((f) => f.id === id) ?? THUMBNAIL_FONTS[0]!
}

const loaded = new Set<string>()
const loadPromises = new Map<string, Promise<void>>()

function injectGoogleFont(google: string) {
  const id = `thumb-gf-${google.replace(/[^a-z0-9]+/gi, "-")}`
  if (document.getElementById(id)) return
  const link = document.createElement("link")
  link.id = id
  link.rel = "stylesheet"
  link.href = `https://fonts.googleapis.com/css2?family=${google}&display=swap`
  document.head.appendChild(link)
}

function injectCustomCss(fontId: string, css: string) {
  const id = `thumb-font-${fontId}`
  if (document.getElementById(id)) return
  const style = document.createElement("style")
  style.id = id
  style.textContent = css
  document.head.appendChild(style)
}

/** Précharge une police pour canvas + UI. */
export function ensureThumbnailFont(fontId: string): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve()
  if (loaded.has(fontId)) return Promise.resolve()
  const existing = loadPromises.get(fontId)
  if (existing) return existing

  const font = getThumbnailFont(fontId)
  const promise = (async () => {
    if (font.customCss) injectCustomCss(font.id, font.customCss)
    if (font.google) injectGoogleFont(font.google)
    try {
      await document.fonts.load(
        `${font.weight} 64px "${font.family}"`,
      )
      await document.fonts.load(
        `italic ${font.weight} 64px "${font.family}"`,
      )
      await document.fonts.ready
    } catch {
      // fallback stack
    }
    loaded.add(fontId)
  })()

  loadPromises.set(fontId, promise)
  return promise
}

/** Précharge le set utile pour le picker UI. */
export function ensureAllThumbnailFonts(): Promise<void> {
  return Promise.all(THUMBNAIL_FONTS.map((f) => ensureThumbnailFont(f.id))).then(
    () => undefined,
  )
}
