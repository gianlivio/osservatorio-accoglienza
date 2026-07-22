import dati from "@/data/province.json";

export type Blocco = {
  affidamenti: number; certi: number; diretti: number; quota_diretti: number;
  quota_diretti_per_importo: number; sotto_soglia: number;
  quota_diretti_sotto_soglia: number | null; importo_mediano: number | null;
  prosecuzioni: number; canale_prefettura: number; canale_ente_locale: number;
  enti_gestori: number; copertura_vincitore: number;
};
export type Mese = { affidamenti: number; diretti: number; quota_diretti: number; importo_mediano: number | null };
export type Contratto = { cig: string; data: string; oggetto: string;
  amministrazione: string; ente: string | null; procedura: string; diretto: boolean; modalita: string;
  base: number | null; aggiudicato: number | null; durata_gg: number | null;
  da_accordo: boolean; confidenza: string };

export type Provincia = {
  provincia: string; totale: Blocco; per_anno: Record<string, Blocco | null>;
  per_mese: Record<string, Mese | undefined>;
  contratti: Contratto[];
  anni_enti: string[];
  top_enti: { nome: string; affidamenti: number }[];
  rapporti_ricorrenti: { amministrazione: string; ente: string; affidamenti_diretti: number }[];
};

export const anni = dati.anni as string[];
export const fonte = dati.fonte;
export const totale = dati.totale as unknown as Blocco;
export const perAnno = dati.per_anno as unknown as Record<string, Blocco>;
export type AnnoSerie = { anno: string; affidamenti: number; quota_diretti: number;
  affidamenti_40k: number; quota_diretti_40k: number | null;
  importo_mediano: number; copertura_esito: number };
export const serieAnni = (dati as unknown as { serie_anni: AnnoSerie[] }).serie_anni;
export const perMese = dati.per_mese as unknown as Record<string, Mese | undefined>;
export const amministrazioni = dati.amministrazioni;
export const province = dati.province as unknown as Provincia[];

export function slug(nome: string) {
  return nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
export const trovaProvincia = (s: string) => province.find((p) => slug(p.provincia) === s);
export const euro = (n: number | null) =>
  n === null ? "n.d." : new Intl.NumberFormat("it-IT",
    { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
export const nItal = (n: number) => n.toLocaleString("it-IT");
