import raw from "@/data/paesi-sicuri.json";
import { dataLunga } from "@/lib/dati";
import { paesi } from "@/lib/paesi";

type Transitoria = { riferimento: string; testo: string };
export type Atto = {
  id: string; titolo: string; breve: string; pubblicazione: { fonte: string; data: string; codice: string };
  in_applicazione_dal: string; regola_inizio: string; url: string; elenco: string[];
  norma_transitoria: (Transitoria & { paesi: string[] }) | null; premessa: string | null;
};
export type Eccezioni = { testo: string; fonte: string; pagina: string; per_paese: boolean };
export type Intervallo = {
  dal: string; al: string | null; atto: string; atti: string[]; norma_transitoria?: Transitoria & { atto: string };
  eccezioni: Eccezioni | "non indicate nella fonte"; uscita?: { testo: string; fonte: string; pagina: string };
};
type Dati = {
  controllato: string; primo_elenco_dal: string; eccezioni_atti: string;
  relazione: { titolo: string; breve: string; url: string; pagina: string; letto: string };
  norma_eccezioni: { dal: string; riferimento: string; testo: string; soppresso: string };
  effetto: { riferimento: string; testo: string; url: string };
  atti: Atto[]; paesi: Record<string, { nome: string; intervalli: Intervallo[] }>;
};
export const sicuri = raw as unknown as Dati;
export const attoPerId = (id: string) => sicuri.atti.find((a) => a.id === id)!;

// Controlli (la build si ferma se non tornano): tutti i paesi della sezione hanno una voce; gli intervalli sono in ordine,
// non si sovrappongono e iniziano alla data di applicazione di un atto; ogni atto ha le date e un link.
(function verifica(d: Dati) {
  const errori: string[] = [];
  const iso = /^\d{4}-\d{2}-\d{2}$/;
  for (const p of paesi) {
    const v = d.paesi[p.slug];
    if (!v) { errori.push(`${p.nome}: manca`); continue; }
    let prec = "";
    for (const i of v.intervalli) {
      if (!iso.test(i.dal) || (i.al !== null && !iso.test(i.al))) errori.push(`${p.nome}: date non valide`);
      if (i.dal <= prec || (i.al !== null && i.al < i.dal)) errori.push(`${p.nome}: intervalli fuori ordine`);
      if (!d.atti.some((a) => a.id === i.atto && a.in_applicazione_dal === i.dal)) errori.push(`${p.nome}: l'intervallo non inizia con la data di un atto`);
      prec = i.al ?? "9999-12-31";
    }
    if (v.intervalli.some((i) => !i.eccezioni)) errori.push(`${p.nome}: eccezioni non valorizzate`);
    if (v.intervalli.slice(0, -1).some((i) => i.al === null)) errori.push(`${p.nome}: intervallo aperto non ultimo`);
  }
  for (const a of d.atti) if (!iso.test(a.in_applicazione_dal) || !a.url.startsWith("https://")) errori.push(`${a.id}: data o link`);
  if (errori.length) throw new Error(`Dati sui paesi di origine sicuri non coerenti: ${errori.join("; ")}`);
})(sicuri);

/** true/false al 31 dicembre dell'anno; null prima del primo elenco (non esisteva un elenco). */
export function sicuroAl31Dicembre(slug: string, anno: string): boolean | null {
  const data = `${anno}-12-31`;
  if (data < sicuri.primo_elenco_dal) return null;
  return sicuri.paesi[slug].intervalli.some((i) => i.dal <= data && (i.al === null || i.al >= data));
}
const apostrofo = (iso: string) => [8, 11].includes(+iso.split("-")[2]);
/** «dal 22 maggio 2024», «dall'11 dicembre 2024» */
export const dalData = (iso: string) => `${apostrofo(iso) ? "dall'" : "dal "}${dataLunga(iso)}`;
/** «al 23 ottobre 2024», «all'8 aprile 2023» */
export const alData = (iso: string) => `${apostrofo(iso) ? "all'" : "al "}${dataLunga(iso)}`;
export const testoSicuro = (v: boolean | null) => (v === null ? "—" : v ? "sì" : "no");

export function frasiSicuro(slug: string) {
  const v = sicuri.paesi[slug];
  const nome = v.nome;
  const ultimo = v.intervalli[v.intervalli.length - 1];
  const inElenco = !!ultimo && ultimo.al === null;
  const passati = v.intervalli.filter((i) => i.al !== null);
  const prima = inElenco
    ? `${nome} è nell'elenco italiano dei paesi di origine sicuri ${dalData(ultimo.dal)} (${attoPerId(ultimo.atto).breve}).`
    : `${nome} non è nell'elenco italiano dei paesi di origine sicuri.`;
  const stato = passati.map((i) => `Era nell'elenco ${dalData(i.dal)} ${alData(i.al!)} (${attoPerId(i.atto).breve}).`);
  return { inElenco, prima, passati: stato, intervalli: v.intervalli };
}
export { dataLunga };
