// Tipi comuni alle figure in rilievo: un motore produce, per una posa, i pezzi da disegnare in ordine;
// l'SVG generato al build e il canvas li disegnano allo stesso modo. Non importa dati: finisce anche nel browser.

export type Punto = [number, number];

/** Colore di una voce: una delle 5 classi della home, oppure quota di colore (0–100) sulla carta; null = grigio, dato assente. */
export type Colore = { classe?: number; tono: number | null };
export const CHIARI = [20, 38, 56, 77, 100]; // quota di colore delle classi, come .m-c0…4 in globals.css
export const LUCI = [72, 62];                // lati: quota del colore della voce sul colore scuro, come .f3-l0 e .f3-l1
export const coloreCss = (tono: number | null) =>
  tono === null ? "var(--linea)" : `color-mix(in srgb,var(--timbro) ${tono}%,var(--carta))`;

/** `testi`: righe del riquadro, già formattate al build; la prima è il nome. */
export type Voce = Colore & { testi: string[]; href?: string };

/** cima e lati di un solido, poligono piatto, solido a soli spigoli, pannello semitrasparente */
export type Ruolo = "cima" | "piana" | "l0" | "l1" | "filo" | "pannello";
export type Faccia = { ruolo: Ruolo; punti: Punto[][] };
export type Testo = { ruolo: "anno" | "legge"; x: number; y: number; testo: string };
export type Pezzo = { voce: number; facce: Faccia[]; testi?: Testo[] };

export type Motore = {
  larghezza: number; altezza: number;
  voci: Voce[];
  /** ordine della salita, per voce: da 0 (prima) a 1 (ultima) */
  ritardi: number[];
  /** movimento automatico (±ampiezza), limite del trascinamento (±limite) e unità di posa per pixel trascinato */
  ampiezza: number; limite: number; perPixel: number;
  /** pezzi in ordine di disegno; `crescita` va da 0 (voce al livello del piano) a 1 */
  quadro(posa: number, crescita: (voce: number) => number): Pezzo[];
};
