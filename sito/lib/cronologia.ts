import dati from "@/data/cronologia.json";

export type Atto = {
  anno: string; atto: string; data: string; gu: string; data_conversione?: string;
  noto_come: string[]; sigla?: string; titolo: string; urn: string; url: string; urn_conversione?: string;
  url_conversione?: string; cosa_cambia: string; nota?: string;
};
export type Presenze = { cas: number; prima_accoglienza: number; sai: number };

export const cronologia = dati as unknown as {
  anni: string[];
  rapporti: Record<string, { numero: string; titolo: string; url: string }>;
  prime_pagine: {
    testate: string[];
    per_anno: Record<string, { totale_5_testate: number }>;
    rapporto_per_anno: Record<string, string>;
  };
  telegiornali: {
    reti: string[];
    periodo: Record<string, string>;
    notizie: Record<string, number>;
    rapporto: string;
    esempio_differenza: { anno: string; gennaio_ottobre_rapporto_2018: number; serie_ricalcolata: number; fonte: string };
  };
  leggi: Atto[];
  origine: Atto[];
  contratti_40k: { affidamenti_40k: Record<string, number>; aggiornato: string };
  centri: {
    anni: string[];
    presenze: Record<string, Presenze>;
    rilevazioni_sai: Record<string, string>;
    costo_cas_adulti: Record<string, { mediana: number | null }>;
  };
};

/** "decreto sicurezza" o "decreto Salvini" */
export const notoCome = (nomi: string[]) =>
  nomi.length === 0 ? null : nomi.map((n) => `«${n}»`).join(" o ");
