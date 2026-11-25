import raw from "@/data/paesi.json";
import { nItal, pct } from "@/lib/dati";

export type Decisioni = { totale: number; rifugiato: number; sussidiaria: number; umanitaria: number; rifiuti: number };
export type AnnoPaese = { richiedenti: number; minori_richiedenti: number; decisioni: Decisioni };
export type SerieUcdp = Record<"battaglia" | "unilaterale" | "non_statale", Record<string, number>>;
export type Paese = {
  slug: string; nome: string; aggettivo: string; da: string; iso3: string; prime_dieci_richiedenti: number[];
  anni: Record<string, AnnoPaese>;
  minori_presenti: Record<string, number>;
  ucdp: { morti: SerieUcdp; righe_multipaese: SerieUcdp };
  ecoi: string;
  coordinate: [number, number]; contorno: string; continente: "Africa" | "Asia" | "America" | "Europa";
};
type FonteEurostat = { dataset: string; titolo: string; aggiornamento: string; versione: string; ultimo_anno: string };
type Misura = { celle: number; mediana_pct: number; oltre_20_pct: number };
export type Confronto = {
  soglia: number; misure: Record<"domande" | "decisioni" | "decisioni positive", Misura>;
  maggiori: { paese: string; anno: number; misura: string; eurostat: number; unhcr: number; scarto_pct: number }[];
  url: string; estratto: string;
};
type Dati = {
  estratto: string; anni: string[];
  italia: Record<string, { richiedenti: number } & Decisioni>;
  coordinate_italia: [number, number];
  fonti: {
    eurostat: { richiedenti: FonteEurostat; decisioni: FonteEurostat; minori: FonteEurostat; estratto: string; arrotondamento: number; licenza: string; url: string };
    ucdp: { versione: string; estratto: string; licenza: string; url: string; soglia_morti: number };
    ecoi: { url: string; verificato: string };
  };
  confronto_unhcr: Confronto;
  paesi: Paese[];
};
export const dati = raw as unknown as Dati;
export const paesi = dati.paesi;
export const anniPaesi = dati.anni;
export const primoAnno = anniPaesi[0];
export const ultimoAnno = anniPaesi[anniPaesi.length - 1];
export const trovaPaese = (slug: string) => paesi.find((p) => p.slug === slug);
export const TIPI = ["rifugiato", "sussidiaria", "umanitaria", "rifiuti"] as const;
export const SERIE_UCDP = ["battaglia", "unilaterale", "non_statale"] as const;

const TOTALE_DECISIONI_2025 = 104560; // Asylum Information Database (AIDA), su dati Eurostat

// Controlli: se non tornano la build fallisce (gli stessi sono in script/paesi.py).
// - totale Italia delle decisioni 2025 uguale alla cifra pubblicata da AIDA su dati Eurostat;
// - per ogni paese e anno, totale delle decisioni e somma dei quattro tipi differiscono al più di 10 (Eurostat arrotonda a 5);
// - ogni paese ha tutti gli anni per le serie Eurostat;
// - per ogni anno, le prime dieci cittadinanze dei richiedenti asilo in Italia sono tutte tra i paesi (dieci per anno).
(function verifica(d: Dati) {
  const errori: string[] = [];
  if (d.italia["2025"]?.totale !== TOTALE_DECISIONI_2025)
    errori.push(`totale Italia decisioni 2025: ${d.italia["2025"]?.totale} invece di ${TOTALE_DECISIONI_2025}`);
  for (const p of d.paesi) {
    for (const a of d.anni) {
      const x = p.anni[a];
      if (!x || [x.richiedenti, x.minori_richiedenti, x.decisioni?.totale, x.decisioni?.rifugiato, x.decisioni?.sussidiaria,
        x.decisioni?.umanitaria, x.decisioni?.rifiuti].some((v) => typeof v !== "number")) {
        errori.push(`${p.nome} ${a}: dati Eurostat mancanti`); continue;
      }
      const s = x.decisioni.rifugiato + x.decisioni.sussidiaria + x.decisioni.umanitaria + x.decisioni.rifiuti;
      if (Math.abs(x.decisioni.totale - s) > 10) errori.push(`${p.nome} ${a}: totale ${x.decisioni.totale}, somma dei tipi ${s}`);
    }
  }
  for (const a of d.anni) {
    const n = d.paesi.filter((p) => p.prime_dieci_richiedenti.includes(+a)).length;
    if (n !== 10) errori.push(`${a}: ${n} paesi tra le prime dieci cittadinanze dei richiedenti, invece di 10`);
  }
  if (errori.length) throw new Error(`Dati sui paesi non coerenti: ${errori.join("; ")}`);
})(dati);

// ---- testi generati dai dati ----

export const periodoPaesi = `${primoAnno}–${ultimoAnno}`;

export function aperturaPaese(p: Paese) {
  const x = p.anni[ultimoAnno];
  const d = x.decisioni;
  const chi = x.richiedenti === 0
    ? `nessuna persona con cittadinanza ${p.aggettivo} ha chiesto asilo in Italia`
    : `${nItal(x.richiedenti)} ${x.richiedenti === 1 ? "persona" : "persone"} con cittadinanza ${p.aggettivo} ${x.richiedenti === 1 ? "ha" : "hanno"} chiesto asilo in Italia`;
  return `Nel ${ultimoAnno} ${chi}. Nello stesso anno le commissioni hanno deciso ${nItal(d.totale)} ${d.totale === 1 ? "domanda" : "domande"} in prima istanza: ` +
    `${nItal(d.rifugiato)} con lo status di rifugiato, ${nItal(d.sussidiaria)} con la protezione sussidiaria, ` +
    `${nItal(d.umanitaria)} per motivi umanitari, ${nItal(d.rifiuti)} rifiutate.`;
}

export function descrizionePaese(p: Paese) {
  const x = p.anni[ultimoAnno];
  const t = `${p.nome}: nel ${ultimoAnno} ${nItal(x.richiedenti)} richiedenti asilo in Italia e ${nItal(x.decisioni.totale)} decisioni di prima istanza. Dati Eurostat e UCDP ${periodoPaesi}.`;
  if (t.length > 155) throw new Error(`Description di ${p.nome} oltre 155 caratteri (${t.length})`);
  return t;
}

export const titoloPaese = (p: Paese) => `Migranti ${p.da} in Italia: domande d'asilo ed esiti ${periodoPaesi} · Osservatorio Accoglienza`;

/** Somma dei richiedenti dei 24 paesi nell'anno e totale Italia. */
export function quotaPaesi(anno: string) {
  const somma = paesi.reduce((n, p) => n + p.anni[anno].richiedenti, 0);
  const tot = dati.italia[anno].richiedenti;
  return { somma, tot, quota: (somma / tot) * 100 };
}

export function aperturaPaesi() {
  const { somma, tot, quota } = quotaPaesi(ultimoAnno);
  return `Nel ${ultimoAnno} ${nItal(tot)} persone hanno chiesto asilo in Italia. Quelle con la cittadinanza di uno dei ${paesi.length} paesi di questa pagina sono ${nItal(somma)}, ${pct(quota)} del totale.`;
}

export const descrizionePaesi = () => {
  const { somma, tot } = quotaPaesi(ultimoAnno);
  const t = `Richiedenti asilo in Italia per paese di cittadinanza, ${periodoPaesi}: ${paesi.length} paesi, ${nItal(somma)} su ${nItal(tot)} nel ${ultimoAnno}. Decisioni di prima istanza e conflitti armati.`;
  if (t.length > 155) throw new Error(`Description di /paesi oltre 155 caratteri (${t.length})`);
  return t;
};

/** Righe UCDP con più paesi che riguardano il paese: numero e anni. */
export function multipaese(p: Paese) {
  const anniSet = new Set<string>();
  let righe = 0;
  for (const k of SERIE_UCDP) for (const [a, n] of Object.entries(p.ucdp.righe_multipaese[k])) { anniSet.add(a); righe += n; }
  return { righe, anni: [...anniSet].sort() };
}

export const haRigheUcdp = (p: Paese) => SERIE_UCDP.some((k) => Object.keys(p.ucdp.morti[k]).length > 0);

export const elencoAnni = (anni: string[]) => {
  const out: string[] = []; let i = 0;
  while (i < anni.length) {
    let j = i;
    while (j + 1 < anni.length && +anni[j + 1] === +anni[j] + 1) j++;
    out.push(j === i ? anni[i] : `${anni[i]}–${anni[j]}`);
    i = j + 1;
  }
  return out.length > 1 ? `${out.slice(0, -1).join(", ")} e ${out[out.length - 1]}` : out[0];
};

