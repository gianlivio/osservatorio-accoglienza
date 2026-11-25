import raw from "@/data/msna-cittadinanza.json";
import { msnaData } from "@/lib/dati";
import { nomeRapporto } from "@/lib/msnaIngressi";

type Voce = { nome: string; presenti: number; percentuale: number | null };
type Anno = {
  tipo: "tabella" | "testo"; data: string; fonte: string; pagina: number; totale: number; cittadinanze: Voce[];
  altre_nel_report?: number | null; gruppo_citato?: number; percentuale_gruppo?: number | null; percentuale_oltre?: boolean;
};
const dati = (raw as unknown as { anni: Record<string, Anno> }).anni;

export type CittadinanzaAnno = {
  anno: string; data: string; fonteTitolo: string; fonteUrl: string | null; pagina: number; totale: number; tipo: "tabella" | "testo";
  righe: { nome: string; presenti: number }[]; altre: number;
};

// Controlli (gli stessi di script/estrai_cittadinanza.py): se non tornano la build fallisce.
// Report mensili: totale della tabella e somma delle cittadinanze uguali al totale nazionale di dicembre di msna.json,
// percentuali coerenti con i numeri. Rapporti semestrali: ordine decrescente, somma non oltre il totale,
// percentuale delle prime cittadinanze citate nel testo uguale a quella calcolata.
function verifica() {
  const naz = new Map(msnaData.nazionale.map((p) => [p.periodo, p.presenti]));
  const errori: string[] = [];
  for (const [anno, d] of Object.entries(dati)) {
    const tot = naz.get(`${anno}-12`);
    const somma = d.cittadinanze.reduce((n, c) => n + c.presenti, 0);
    if (d.totale !== tot) errori.push(`${anno}: totale ${d.totale}, totale nazionale ${tot}`);
    if (d.tipo === "tabella") {
      if (somma + (d.altre_nel_report ?? 0) !== tot) errori.push(`${anno}: somma cittadinanze ${somma + (d.altre_nel_report ?? 0)} ≠ ${tot}`);
      for (const c of d.cittadinanze) {
        if (c.percentuale === null || Math.abs((c.presenti / d.totale) * 100 - c.percentuale) > 0.1) errori.push(`${anno} ${c.nome}: percentuale`);
      }
    } else {
      const v = d.cittadinanze.map((c) => c.presenti);
      if (v.some((x, i) => i > 0 && x > v[i - 1])) errori.push(`${anno}: cittadinanze non in ordine decrescente`);
      if (somma > d.totale) errori.push(`${anno}: somma ${somma} oltre il totale ${d.totale}`);
      const s = (v.slice(0, d.gruppo_citato).reduce((n, x) => n + x, 0) / d.totale) * 100, p = d.percentuale_gruppo;
      if (p == null || (d.percentuale_oltre ? !(s > p) : Math.abs(s - p) > 0.1)) errori.push(`${anno}: prime ${d.gruppo_citato} = ${s.toFixed(2)}% invece di ${p}%`);
    }
  }
  if (errori.length) throw new Error(`Dati sulla cittadinanza non coerenti: ${errori.join("; ")}`);
}

export function cittadinanzaAnni(): CittadinanzaAnno[] {
  verifica();
  return Object.entries(dati).sort(([a], [b]) => a.localeCompare(b)).map(([anno, d]) => {
    const righe = (d.tipo === "tabella" ? d.cittadinanze.slice(0, 10) : d.cittadinanze).map((c) => ({ nome: c.nome, presenti: c.presenti }));
    return { anno, data: d.data, fonteTitolo: nomeRapporto(d.fonte, d.data).titolo, fonteUrl: nomeRapporto(d.fonte, d.data).url, pagina: d.pagina, totale: d.totale, tipo: d.tipo, righe,
      altre: d.totale - righe.reduce((n, r) => n + r.presenti, 0) };
  });
}
