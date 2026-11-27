// Geometria della figura 3D della home: province di mappa.json come prismi, alti in proporzione al numero di contratti.
// Matematica comune all'SVG generato al build e al canvas. Non importa dati: finisce anche nel pacchetto del browser.

export type DatiProvincia = {
  nome: string; slug: string; d: string; contratti: number; classe: number;
  /** testi del riquadro, già formattati al build */
  testoContratti: string; testoQuota: string;
};
export type DatiItalia = { descrizione: string; province: DatiProvincia[] };

export type Punto = [number, number];
export type Anello = { provincia: number; punti: Punto[]; centro: Punto };

/** Riquadro della figura (stesse proporzioni in globals.css, .italia3d). */
export const LARGHEZZA = 1000, ALTEZZA = 1000;
export const GRADI_ROTAZIONE = 15;   // rotazione automatica, avanti e indietro
export const GRADI_MASSIMI = 25;     // limite del trascinamento
const INCLINAZIONE = (50 * Math.PI) / 180; // altezza della vista sopra il piano
const DISTANZA = 1900;               // distanza della camera: prospettiva leggera
const ALTEZZA_MASSIMA = 150;         // prisma della provincia con più contratti, in unità di mappa.json
const MARGINE = 8;
const PASSO_GRADI = 5;

/** Anelli di un tracciato di script/mappa.py: «M x y l dx dy … z», ripetuto. */
export function leggiTracciato(d: string): Punto[][] {
  return d.split("z").filter(Boolean).map((pezzo) => {
    const n = pezzo.match(/-?\d+/g)!.map(Number);
    let x = n[0], y = n[1];
    const punti: Punto[] = [[x, y]];
    for (let i = 2; i + 1 < n.length; i += 2) {
      x += n[i]; y += n[i + 1];
      const [px, py] = punti[punti.length - 1];
      if (x !== px || y !== py) punti.push([x, y]);
    }
    const [ux, uy] = punti[punti.length - 1];
    if (punti.length > 1 && ux === punti[0][0] && uy === punti[0][1]) punti.pop();
    return punti;
  });
}

const area = (p: Punto[]) => p.reduce((s, [x, y], i) => { const [u, v] = p[(i + 1) % p.length]; return s + x * v - u * y; }, 0) / 2;

/** Douglas-Peucker: contorni più leggeri per l'SVG statico. */
function semplifica(p: Punto[], tolleranza: number): Punto[] {
  const chiuso = [...p, p[0]];
  const tieni = new Set([0, chiuso.length - 1]);
  const pila: [number, number][] = [[0, chiuso.length - 1]];
  while (pila.length) {
    const [a, b] = pila.pop()!;
    const [ax, ay] = chiuso[a], dx = chiuso[b][0] - ax, dy = chiuso[b][1] - ay, l = Math.hypot(dx, dy);
    let max = -1, k = -1;
    for (let i = a + 1; i < b; i++) {
      const [x, y] = chiuso[i];
      const dist = l ? Math.abs(dy * (x - ax) - dx * (y - ay)) / l : Math.hypot(x - ax, y - ay);
      if (dist > max) { max = dist; k = i; }
    }
    if (max > tolleranza) { tieni.add(k); pila.push([a, k], [k, b]); }
  }
  return [...tieni].sort((a, b) => a - b).slice(0, -1).map((i) => chiuso[i]);
}

export function preparaScena(province: DatiProvincia[]) {
  const anelli: Anello[] = [];
  province.forEach((p, provincia) => {
    for (const punti of leggiTracciato(p.d)) {
      if (punti.length < 3 || area(punti) === 0) continue;
      const centro: Punto = [
        punti.reduce((s, q) => s + q[0], 0) / punti.length,
        punti.reduce((s, q) => s + q[1], 0) / punti.length,
      ];
      anelli.push({ provincia, punti, centro });
    }
  });
  const xs = anelli.flatMap((a) => a.punti.map((q) => q[0])), ys = anelli.flatMap((a) => a.punti.map((q) => q[1]));
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const max = Math.max(...province.map((p) => p.contratti));
  const altezze = province.map((p) => (p.contratti / max) * ALTEZZA_MASSIMA);

  // Una sola scala per tutte le rotazioni possibili; il centro orizzontale è calcolato ogni 5 gradi.
  const ingombri: { x0: number; x1: number; y0: number; y1: number }[] = [];
  for (let g = -GRADI_MASSIMI; g <= GRADI_MASSIMI; g += PASSO_GRADI) {
    const proietta = proiezione(g, cx, cy);
    const q = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
    for (const a of anelli) for (const [x, y] of a.punti) for (const z of [0, altezze[a.provincia]]) {
      const [u, v] = proietta(x, y, z);
      if (u < q.x0) q.x0 = u; if (u > q.x1) q.x1 = u; if (v < q.y0) q.y0 = v; if (v > q.y1) q.y1 = v;
    }
    ingombri.push(q);
  }
  const y0 = Math.min(...ingombri.map((q) => q.y0)), y1 = Math.max(...ingombri.map((q) => q.y1));
  const scala = Math.min((LARGHEZZA - 2 * MARGINE) / Math.max(...ingombri.map((q) => q.x1 - q.x0)), (ALTEZZA - 2 * MARGINE) / (y1 - y0));
  const centri = ingombri.map((q) => (q.x0 + q.x1) / 2);
  const dy = ALTEZZA / 2 - (scala * (y0 + y1)) / 2;
  return { anelli, altezze, cx, cy, scala, dy, centri };
}
export type Scena = ReturnType<typeof preparaScena>;

/** Gli stessi anelli, semplificati; i pezzi molto piccoli si omettono, tranne il maggiore di ogni provincia. */
export function alleggerisci(scena: Scena, tolleranza: number, areaMinima: number): Scena {
  const maggiore = new Map<number, Anello>();
  for (const a of scena.anelli) {
    const m = maggiore.get(a.provincia);
    if (!m || Math.abs(area(a.punti)) > Math.abs(area(m.punti))) maggiore.set(a.provincia, a);
  }
  const anelli = scena.anelli
    .filter((a) => maggiore.get(a.provincia) === a || Math.abs(area(a.punti)) >= areaMinima)
    .map((a) => { const p = semplifica(a.punti, tolleranza); return { ...a, punti: p.length < 3 ? a.punti : p }; });
  return { ...scena, anelli };
}

/** Rotazione di `gradi` attorno all'asse verticale, poi vista inclinata con prospettiva. */
function proiezione(gradi: number, cx: number, cy: number) {
  const t = (gradi * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t);
  const ci = Math.cos(INCLINAZIONE), si = Math.sin(INCLINAZIONE);
  return (x: number, y: number, z: number): Punto => {
    const X = (x - cx) * c - (y - cy) * s, Y = (x - cx) * s + (y - cy) * c;
    const k = DISTANZA / (DISTANZA - (Y * ci + z * si));
    return [X * k, (Y * si - z * ci) * k];
  };
}

export type Prisma = {
  provincia: number;
  /** facce laterali visibili, in due toni di luce; ogni poligono è una striscia di lati consecutivi */
  lati: [Punto[][], Punto[][]];
  cima: Punto[];
};

/** Prismi in ordine di disegno, dal più lontano al più vicino; per ciascuno prima i lati, poi la faccia superiore. */
export function prismi(scena: Scena, gradi: number, altezza: (provincia: number) => number): Prisma[] {
  const { cx, cy, scala, dy, centri } = scena;
  const posto = (gradi + GRADI_MASSIMI) / PASSO_GRADI, prima = Math.max(0, Math.min(centri.length - 2, Math.floor(posto)));
  const dx = LARGHEZZA / 2 - scala * (centri[prima] + (centri[prima + 1] - centri[prima]) * (posto - prima));
  const p = proiezione(gradi, cx, cy);
  const schermo = (x: number, y: number, z: number): Punto => { const [u, v] = p(x, y, z); return [u * scala + dx, v * scala + dy]; };
  const t = (gradi * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t);
  const occhio = DISTANZA * Math.cos(INCLINAZIONE);
  return scena.anelli
    .map((a) => ({ a, profondita: (a.centro[0] - cx) * s + (a.centro[1] - cy) * c }))
    .sort((m, n) => m.profondita - n.profondita)
    .map(({ a }) => {
      const h = altezza(a.provincia), n = a.punti.length;
      const cima = a.punti.map(([x, y]) => schermo(x, y, h));
      const lati: [Punto[][], Punto[][]] = [[], []];
      if (h > 0) {
        const base = a.punti.map(([x, y]) => schermo(x, y, 0));
        // tono di ogni lato: -1 se rivolto dalla parte opposta alla camera
        const toni = a.punti.map(([x, y], i) => {
          const [u, v] = a.punti[(i + 1) % n];
          const ex = (u - x) * c - (v - y) * s, ey = (u - x) * s + (v - y) * c;
          const X = (x - cx) * c - (y - cy) * s, Y = (x - cx) * s + (y - cy) * c;
          const nx = ey, ny = -ex; // normale esterna (anelli in senso orario sullo schermo)
          if (-nx * X + ny * (occhio - Y) <= 0) return -1;
          return nx < 0 ? 0 : 1;
        });
        const inizio = Math.max(0, toni.findIndex((v, i) => v !== toni[(i + n - 1) % n]));
        for (let k = 0; k < n; ) {
          const tono = toni[(inizio + k) % n];
          let j = k + 1;
          while (j < n && toni[(inizio + j) % n] === tono) j++;
          if (tono >= 0) {
            const indici = Array.from({ length: j - k + 1 }, (_, m) => (inizio + k + m) % n);
            lati[tono as 0 | 1].push([...indici.map((i) => cima[i]), ...indici.reverse().map((i) => base[i])]);
          }
          k = j;
        }
      }
      return { provincia: a.provincia, lati, cima };
    });
}
