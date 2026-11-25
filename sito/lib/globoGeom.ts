import { geoInterpolate, geoDistance, geoRotation } from "d3-geo";

// Geometria del globo di /paesi, condivisa tra l'SVG statico (server) e il canvas (client).
export type Punto = [number, number]; // [lon, lat]
export type Continente = "Africa" | "Asia" | "America" | "Europa";
export type PaeseGlobo = {
  slug: string; nome: string; continente: Continente; coordinate: Punto; contorno: string;
  richiedenti: Record<string, number>;
};
export type Arco = { slug: string; da: Punto; dist: number; punti: { p: Punto; h: number }[]; at: (t: number) => { p: Punto; h: number } };

// Quattro toni sobri, derivati dalla palette del sito (viola del timbro, verde-grigio del testo tenue, carta e inchiostro).
export const COLORE: Record<Continente, string> = { Africa: "#4A3B7C", Asia: "#2F6F66", America: "#9A6B24", Europa: "#3E5C8A" };

const SEGMENTI = 56;
/** Altezza dell'arco sopra la superficie (in raggi), massima a metà percorso. */
const alzata = (dist: number) => 0.04 + (0.3 * dist) / Math.PI;

export function costruisciArco(slug: string, da: Punto, a: Punto): Arco {
  const dist = geoDistance(da, a);
  const ip = geoInterpolate(da, a);
  const at = (t: number) => ({ p: ip(t) as Punto, h: alzata(dist) * Math.sin(Math.PI * t) });
  return { slug, da, dist, at, punti: Array.from({ length: SEGMENTI + 1 }, (_, i) => at(i / SEGMENTI)) };
}

/** Spessore (px) per richiedenti: proporzionale alla radice quadrata, uguale per tutti gli anni; minimo 1 px se > 0. */
export function larghezza(v: number, max: number, maxPx: number) {
  if (!(v > 0) || !(max > 0)) return 0;
  return Math.max(1, maxPx * Math.sqrt(v / max));
}

export const massimoRichiedenti = (paesi: PaeseGlobo[]) =>
  Math.max(1, ...paesi.flatMap((p) => Object.values(p.richiedenti)));

/** Proiezione ortografica di un punto (eventualmente sollevato di h raggi): coordinate in px e visibilità. */
export function proietta(rot: ReturnType<typeof geoRotation>, p: Punto, h: number, cx: number, cy: number, R: number) {
  const [l, f] = rot(p);
  const lr = (l * Math.PI) / 180, fr = (f * Math.PI) / 180;
  const x = Math.cos(fr) * Math.sin(lr), y = Math.sin(fr), z = Math.cos(fr) * Math.cos(lr);
  const r = 1 + h;
  const visibile = z >= 0 || r * Math.hypot(x, y) >= 1; // dietro il globo solo se coperto dalla sfera
  return { x: cx + R * r * x, y: cy - R * r * y, visibile };
}

/** Tratti visibili di un arco, in coordinate schermo. */
export function trattiArco(arco: Arco, rot: ReturnType<typeof geoRotation>, cx: number, cy: number, R: number) {
  const tratti: [number, number][][] = [];
  let corrente: [number, number][] | null = null;
  for (const { p, h } of arco.punti) {
    const q = proietta(rot, p, h, cx, cy, R);
    if (q.visibile) { (corrente ??= (tratti.push([]), tratti[tratti.length - 1])).push([q.x, q.y]); } else corrente = null;
  }
  return tratti;
}

export const numero = (n: number) => n.toLocaleString("it-IT", { useGrouping: "always" });
