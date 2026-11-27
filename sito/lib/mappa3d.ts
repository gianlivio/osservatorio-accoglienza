// Motore delle mappe in rilievo: poligoni di una mappa (province o regioni) come prismi, alti in proporzione a un valore.
// Matematica comune all'SVG generato al build e al canvas. Non importa dati: finisce anche nel pacchetto del browser.
import type { Motore, Punto, Voce } from "@/lib/scena3d";

/** Una provincia o una regione: tracciato di script/mappa.py e valore che ne fa l'altezza (null: dato assente, piatta). */
export type Forma = Voce & { d: string; valore: number | null };
export type DatiMappa = { tipo: "mappa"; descrizione: string; altezzaMassima: number; forme: Forma[] };

const LARGHEZZA = 1000, ALTEZZA = 1000;
const GRADI_ROTAZIONE = 15;   // rotazione automatica, avanti e indietro
const GRADI_MASSIMI = 25;     // limite del trascinamento
const INCLINAZIONE = (50 * Math.PI) / 180; // altezza della vista sopra il piano
const DISTANZA = 1900;               // distanza della camera: prospettiva leggera
const MARGINE = 8;
const PASSO_GRADI = 5;
// Un poligono diverso dal principale della sua provincia, con area sotto questa soglia (unità² di mappa.json,
// circa 400 km²), si disegna piatto: sono le isole minori e i piccoli pezzi staccati, che da estrusi sembrano aghi.
const AREA_PIANA = 100;

type Anello = { voce: number; punti: Punto[]; centro: Punto; piana: boolean };

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

function preparaScena(forme: Forma[], altezzaMassima: number) {
  const anelli: Anello[] = [];
  forme.forEach((p, voce) => {
    const poligoni = leggiTracciato(p.d).filter((q) => q.length >= 3 && area(q) !== 0);
    const principale = poligoni.reduce((m, q) => (Math.abs(area(q)) > Math.abs(area(m)) ? q : m));
    for (const punti of poligoni) {
      const centro: Punto = [
        punti.reduce((s, q) => s + q[0], 0) / punti.length,
        punti.reduce((s, q) => s + q[1], 0) / punti.length,
      ];
      anelli.push({ voce, punti, centro, piana: punti !== principale && Math.abs(area(punti)) < AREA_PIANA });
    }
  });
  const xs = anelli.flatMap((a) => a.punti.map((q) => q[0])), ys = anelli.flatMap((a) => a.punti.map((q) => q[1]));
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const max = Math.max(...forme.map((p) => p.valore ?? 0));
  const altezze = forme.map((p) => ((p.valore ?? 0) / max) * altezzaMassima);

  // Una sola scala per tutte le rotazioni possibili; il centro orizzontale è calcolato ogni 5 gradi.
  const ingombri: { x0: number; x1: number; y0: number; y1: number }[] = [];
  for (let g = -GRADI_MASSIMI; g <= GRADI_MASSIMI; g += PASSO_GRADI) {
    const proietta = proiezione(g, cx, cy);
    const q = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity };
    for (const a of anelli) for (const [x, y] of a.punti) for (const z of [0, a.piana ? 0 : altezze[a.voce]]) {
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
type Scena = ReturnType<typeof preparaScena>;

/** Gli stessi anelli, con i contorni semplificati; quelli piatti, già piccoli, restano come sono. */
function alleggerisci(scena: Scena, tolleranza: number): Scena {
  const anelli = scena.anelli.map((a) => {
    if (a.piana) return a;
    const p = semplifica(a.punti, tolleranza);
    return p.length < 3 ? a : { ...a, punti: p };
  });
  return { ...scena, anelli };
}

const CONTATTO = 1.5; // unità di mappa.json: lati più vicini di così sono un confine in comune

/**
 * Per ogni coppia di poligoni confinanti, la somma delle normali (lunghe come il lato) dei lati di `a` che toccano `b`:
 * ruotata con la vista, dice quale dei due sta davanti. I contorni sono semplificati uno per uno, quindi si confronta la distanza.
 */
function confini(anelli: Anello[]) {
  const lati = anelli.map((a) => a.punti.map((p, i) => [p, a.punti[(i + 1) % a.punti.length]] as const));
  const riquadri = anelli.map((a) => {
    const xs = a.punti.map((q) => q[0]), ys = a.punti.map((q) => q[1]);
    return [Math.min(...xs) - CONTATTO, Math.max(...xs) + CONTATTO, Math.min(...ys) - CONTATTO, Math.max(...ys) + CONTATTO];
  });
  const tocca = (x: number, y: number, [[ax, ay], [bx, by]]: readonly [Punto, Punto]) => {
    // scarto rapido sul riquadro del lato: questo calcolo si ripete milioni di volte
    if ((ax < x - CONTATTO && bx < x - CONTATTO) || (ax > x + CONTATTO && bx > x + CONTATTO) ||
        (ay < y - CONTATTO && by < y - CONTATTO) || (ay > y + CONTATTO && by > y + CONTATTO)) return false;
    const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
    const u = x - ax - t * dx, v = y - ay - t * dy;
    return u * u + v * v < CONTATTO * CONTATTO;
  };
  const coppie: { a: number; b: number; nx: number; ny: number }[] = [];
  anelli.forEach((_, a) => anelli.forEach((__, b) => {
    const [p, q] = [riquadri[a], riquadri[b]];
    if (a === b || p[0] > q[1] || q[0] > p[1] || p[2] > q[3] || q[2] > p[3]) return;
    let nx = 0, ny = 0;
    for (const [[x, y], [u, v]] of lati[a]) {
      const mx = (x + u) / 2, my = (y + v) / 2;
      if (mx < q[0] || mx > q[1] || my < q[2] || my > q[3] || !lati[b].some((l) => tocca(mx, my, l))) continue;
      nx += v - y; ny -= u - x;
    }
    if (nx || ny) coppie.push({ a, b, nx, ny });
  }));
  return coppie;
}

/**
 * Ordine di disegno: ogni poligono dopo i confinanti che gli stanno dietro; a parità, dal più lontano al più vicino.
 * Dove i vincoli formano un anello si riprende dal più lontano tra i rimasti.
 */
function ordina(profondita: number[], coppie: ReturnType<typeof confini>, s: number, c: number) {
  const davanti: number[][] = profondita.map(() => []);
  const attesa = profondita.map(() => 0);
  for (const { a, b, nx, ny } of coppie) {
    // la normale di `a` rivolta verso la camera: `b` sta davanti ad `a`
    if (nx * s + ny * c > 0.5) { davanti[a].push(b); attesa[b]++; }
  }
  const rimasti = new Set(profondita.keys());
  const ordine: number[] = [];
  while (rimasti.size) {
    let scelto = -1, libero = false;
    for (const i of rimasti) {
      const l = attesa[i] <= 0;
      if (scelto < 0 || (l && !libero) || (l === libero && profondita[i] < profondita[scelto])) { scelto = i; libero = l; }
    }
    rimasti.delete(scelto);
    ordine.push(scelto);
    for (const j of davanti[scelto]) attesa[j]--;
  }
  return ordine;
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

/**
 * Prismi in ordine di disegno: prima i poligoni piatti (al livello del piano non coprono nessun prisma),
 * poi gli altri dal più lontano al più vicino; per ciascuno prima i lati (due toni di luce; ogni poligono
 * è una striscia di lati consecutivi), poi la faccia superiore.
 */
function prismi(scena: Scena, coppie: ReturnType<typeof confini>, gradi: number, altezza: (voce: number) => number) {
  const { cx, cy, scala, dy, centri } = scena;
  const posto = (gradi + GRADI_MASSIMI) / PASSO_GRADI, prima = Math.max(0, Math.min(centri.length - 2, Math.floor(posto)));
  const dx = LARGHEZZA / 2 - scala * (centri[prima] + (centri[prima + 1] - centri[prima]) * (posto - prima));
  const p = proiezione(gradi, cx, cy);
  const schermo = (x: number, y: number, z: number): Punto => { const [u, v] = p(x, y, z); return [u * scala + dx, v * scala + dy]; };
  const t = (gradi * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t);
  const occhio = DISTANZA * Math.cos(INCLINAZIONE);
  const piatto = (a: Anello) => a.piana || scena.altezze[a.voce] === 0;
  // i poligoni piatti hanno profondità spostata in fondo: si disegnano per primi
  const profondita = scena.anelli.map((a) => (a.centro[0] - cx) * s + (a.centro[1] - cy) * c - (piatto(a) ? 1e6 : 0));
  return ordina(profondita, coppie.filter(({ a, b }) => !piatto(scena.anelli[a]) && !piatto(scena.anelli[b])), s, c)
    .map((i) => scena.anelli[i])
    .map((a) => {
      const h = a.piana ? 0 : altezza(a.voce), n = a.punti.length;
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
      return {
        voce: a.voce,
        facce: [
          ...lati.flatMap((strisce, t) => (strisce.length ? [{ ruolo: t ? "l1" as const : "l0" as const, punti: strisce }] : [])),
          { ruolo: a.piana ? "piana" as const : "cima" as const, punti: [cima] },
        ],
      };
    });
}

/** `leggero`: contorni semplificati, per l'SVG statico; l'inquadratura resta quella dei contorni interi. */
export function motoreMappa(dati: DatiMappa, leggero = false): Motore {
  const intera = preparaScena(dati.forme, dati.altezzaMassima);
  const scena = leggero ? alleggerisci(intera, 1.5) : intera;
  // la salita va da nord a sud, dalla posizione del primo poligono di ogni voce
  const nord = Math.min(...scena.anelli.map((a) => a.centro[1])), sud = Math.max(...scena.anelli.map((a) => a.centro[1]));
  const ritardi = dati.forme.map((_, i) => ((scena.anelli.find((a) => a.voce === i)?.centro[1] ?? nord) - nord) / (sud - nord));
  const coppie = confini(scena.anelli);
  return {
    larghezza: LARGHEZZA, altezza: ALTEZZA, voci: dati.forme, ritardi,
    ampiezza: GRADI_ROTAZIONE, limite: GRADI_MASSIMI, perPixel: 0.2,
    quadro: (gradi, crescita) => prismi(scena, coppie, gradi, (i) => scena.altezze[i] * crescita(i)),
  };
}
