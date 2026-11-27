// Motore del grafico in rilievo per anno: una barra per anno, a filo se il dato è provvisorio, e un pannello
// semitrasparente nell'anno di ogni legge. La vista scorre lungo gli anni. Non importa dati: finisce anche nel browser.
import type { Faccia, Motore, Pezzo, Punto, Voce } from "@/lib/scena3d";

export type Barra = Voce & { anno: string; valore: number; provvisorio: boolean; legge?: string };
export type DatiAnni = { tipo: "anni"; descrizione: string; barre: Barra[] };

const LARGHEZZA = 1000;                      // l'altezza del riquadro segue dal contenuto
const PASSO = 96, LATO = 58;                 // distanza tra gli anni e lato della barra
const ALTA = 480;                            // barra dell'anno con più contratti
const PANNELLI = [1.14, 1.34];               // altezze dei pannelli, alternate perché i nomi non si sovrappongano
const RETRO = -LATO / 2 - 14;                // piano dei pannelli, subito dietro le barre
const INCLINAZIONE = (22 * Math.PI) / 180;
const DISTANZA = 1500;
const GIRO_BASE = -10, GIRO = 16;            // gradi: la vista va da un capo all'altro degli anni
const CORPO_ANNO = 27, CORPO_LEGGE = 28;     // come .f3-t-anno e .f3-t-legge
const MARGINE = 8;

type P3 = [number, number, number];

export function motoreAnni(dati: DatiAnni): Motore {
  const n = dati.barre.length;
  const max = Math.max(...dati.barre.map((b) => b.valore));
  const x = (i: number) => (i - (n - 1) / 2) * PASSO;
  const conLegge = dati.barre.flatMap((b, i) => (b.legge ? [i] : []));
  const altezzaPannello = (i: number) => ALTA * PANNELLI[conLegge.indexOf(i) % PANNELLI.length];
  const ci = Math.cos(INCLINAZIONE), si = Math.sin(INCLINAZIONE);

  function vista(posa: number) {
    const t = ((GIRO_BASE + posa * GIRO) * Math.PI) / 180, c = Math.cos(t), s = Math.sin(t);
    const ruota = ([X, Y, z]: P3): P3 => [X * c - Y * s, X * s + Y * c, z];
    const proietta = (p: P3): Punto => {
      const [X, Y, z] = ruota(p);
      // la prospettiva dipende solo dalla distanza sul piano: le verticali restano verticali e le altezze si confrontano
      const k = DISTANZA / (DISTANZA - Y * ci);
      return [X * k, (Y * si - z * ci) * k];
    };
    /** una faccia è rivolta alla camera se la normale punta verso di essa */
    const visibile = (normale: P3, punto: P3) => {
      const [a, b, d] = ruota(normale), [X, Y, z] = ruota(punto);
      return -a * X + b * (DISTANZA * ci - Y) + d * (DISTANZA * si - z) > 0;
    };
    return { ruota, proietta, visibile };
  }

  // Inquadratura unica per tutte le pose, nomi compresi.
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  const includi = ([u, v]: Punto, mezzo = 0, sopra = 0, sotto = 0) => {
    x0 = Math.min(x0, u - mezzo); x1 = Math.max(x1, u + mezzo); y0 = Math.min(y0, v - sopra); y1 = Math.max(y1, v + sotto);
  };
  for (let posa = -1; posa <= 1; posa += 0.25) {
    const { proietta } = vista(posa);
    dati.barre.forEach((b, i) => {
      for (const dx of [-LATO / 2, LATO / 2]) for (const y of [-LATO / 2, LATO / 2]) includi(proietta([x(i) + dx, y, 0]));
      includi(proietta([x(i), LATO / 2 + 40, 0]), CORPO_ANNO * 1.25, CORPO_ANNO, 8);
      if (b.legge) includi(proietta([x(i), RETRO, altezzaPannello(i)]), b.legge.length * CORPO_LEGGE * 0.31, CORPO_LEGGE * 1.5);
    });
  }
  const scala = (LARGHEZZA - 2 * MARGINE) / (x1 - x0);
  const altezza = Math.ceil((y1 - y0) * scala) + 2 * MARGINE;
  const dx = MARGINE - scala * x0, dy = MARGINE - scala * y0;

  function quadro(posa: number, crescita: (voce: number) => number): Pezzo[] {
    const { ruota, proietta, visibile } = vista(posa);
    const schermo = (p: P3): Punto => { const [u, v] = proietta(p); return [u * scala + dx, v * scala + dy]; };
    const perProfondita = (indici: number[]) => [...indici].sort((a, b) => ruota([x(a), 0, 0])[1] - ruota([x(b), 0, 0])[1]);

    const pannelli: Pezzo[] = perProfondita(conLegge).map((i) => {
      const h = altezzaPannello(i) * crescita(i), a = x(i) - PASSO * 0.44, b = x(i) + PASSO * 0.44;
      const [u, v] = schermo([x(i), RETRO, h]);
      return {
        voce: i,
        facce: [{ ruolo: "pannello", punti: [[[a, RETRO, 0], [b, RETRO, 0], [b, RETRO, h], [a, RETRO, h]].map((p) => schermo(p as P3))] }],
        testi: [{ ruolo: "legge", x: u, y: v - 12, testo: dati.barre[i].legge! }],
      };
    });

    const barre: Pezzo[] = perProfondita(dati.barre.map((_, i) => i)).map((i) => {
      const barra = dati.barre[i], h = (barra.valore / max) * ALTA * crescita(i);
      const a = x(i) - LATO / 2, b = x(i) + LATO / 2, m = LATO / 2;
      const facce: { ruolo: Faccia["ruolo"]; normale: P3; angoli: P3[] }[] = [
        { ruolo: "l1", normale: [-1, 0, 0], angoli: [[a, -m, 0], [a, m, 0], [a, m, h], [a, -m, h]] },
        { ruolo: "l1", normale: [1, 0, 0], angoli: [[b, m, 0], [b, -m, 0], [b, -m, h], [b, m, h]] },
        { ruolo: "l0", normale: [0, 1, 0], angoli: [[a, m, 0], [b, m, 0], [b, m, h], [a, m, h]] },
        { ruolo: "cima", normale: [0, 0, 1], angoli: [[a, -m, h], [b, -m, h], [b, m, h], [a, m, h]] },
      ];
      // a filo: si disegnano tutti gli spigoli, anche quelli dietro
      if (barra.provvisorio) facce.unshift({ ruolo: "l0", normale: [0, -1, 0], angoli: [[a, -m, 0], [b, -m, 0], [b, -m, h], [a, -m, h]] });
      const [u, v] = schermo([x(i), m + 40, 0]);
      return {
        voce: i,
        facce: facce
          .filter((f) => barra.provvisorio || visibile(f.normale, f.angoli[0]))
          .map((f) => ({ ruolo: barra.provvisorio ? "filo" : f.ruolo, punti: [f.angoli.map(schermo)] })),
        testi: [{ ruolo: "anno", x: u, y: v, testo: barra.anno }],
      };
    });
    return [...pannelli, ...barre];
  }

  return {
    larghezza: LARGHEZZA, altezza, voci: dati.barre, ritardi: dati.barre.map((_, i) => i / (n - 1)),
    ampiezza: 1, limite: 1, perPixel: 0.006, quadro,
  };
}
