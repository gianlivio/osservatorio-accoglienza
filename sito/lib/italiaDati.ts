import mappa from "@/data/mappa.json";
import { anni, province, slug, nomeProvincia, nItal, pct } from "@/lib/dati";
import type { DatiItalia } from "@/lib/italia3d";

export const CLASSI = 5;
const tracciati = mappa.province as Record<string, { sigla: string; d: string }>;

const righe = province
  .map((p) => ({ nome: p.provincia, quota: p.totale.quota_diretti, n: p.totale.affidamenti }))
  .filter((r) => tracciati[r.nome]);
const ordinate = righe.map((r) => r.quota).sort((a, b) => a - b);
// Classi per quantili: ogni classe raccoglie circa lo stesso numero di province.
const soglie = Array.from({ length: CLASSI - 1 }, (_, k) => ordinate[Math.ceil(((k + 1) * ordinate.length) / CLASSI) - 1]);
const classe = (q: number) => { const i = soglie.findIndex((s) => q <= s); return i === -1 ? CLASSI - 1 : i; };

export const intervalli = Array.from({ length: CLASSI }, (_, k) => {
  const v = righe.filter((r) => classe(r.quota) === k).map((r) => r.quota);
  return { k, da: Math.min(...v), a: Math.max(...v) };
});
export const minima = righe.reduce((m, r) => (r.quota < m.quota ? r : m));
export const massima = righe.reduce((m, r) => (r.quota > m.quota ? r : m));
export const periodo = `${anni[0]}–${anni[anni.length - 1]}`;

export const datiItalia: DatiItalia = {
  descrizione:
    `Italia in tre dimensioni: per ogni provincia un prisma alto in proporzione al numero di contratti ${periodo}, ` +
    `colorato per quota di contratti con affidamento diretto in ${CLASSI} classi. ` +
    `La quota va da ${pct(minima.quota)} a ${nomeProvincia(minima.nome)} a ${pct(massima.quota)} a ${nomeProvincia(massima.nome)}.`,
  province: righe.map((r) => ({
    nome: nomeProvincia(r.nome), slug: slug(r.nome), d: tracciati[r.nome].d, contratti: r.n, classe: classe(r.quota),
    testoContratti: `${nItal(r.n)} contratti ${periodo}`,
    testoQuota: `${pct(r.quota)} con affidamento diretto`,
  })),
};
