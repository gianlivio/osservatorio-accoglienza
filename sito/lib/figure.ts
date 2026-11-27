// Dati delle figure in rilievo, costruiti al build: usati dall'SVG statico e da /figure/[nome].
import mappa from "@/data/mappa.json";
import { centri } from "@/lib/centri";
import { cronologia } from "@/lib/cronologia";
import { slug, nomeProvincia, nItal, nItal2, trovaProvincia } from "@/lib/dati";
import { datiItalia } from "@/lib/italiaDati";
import type { DatiFigura } from "@/lib/motori";

const tracciati = mappa.province as Record<string, { sigla: string; d: string }>;

/** Quanto costa: altezza e colore dal costo giornaliero mediano dei CAS per adulti dell'ultimo anno. */
function costo(): DatiFigura {
  const anno = centri.anni[centri.anni.length - 1];
  const righe = Object.entries(tracciati).map(([nome, { d }]) => ({ nome, d, cas: centri.province[nome]?.[anno]?.cas }));
  const valori = righe.flatMap((r) => r.cas?.costo_mediano ?? []);
  const min = Math.min(...valori), max = Math.max(...valori);
  return {
    tipo: "mappa",
    altezzaMassima: 110,
    descrizione:
      `Italia in tre dimensioni: per ogni provincia un prisma alto in proporzione al costo giornaliero per ospite nei CAS per adulti nel ${anno}, ` +
      `da ${nItal2(min)} € a ${nItal2(max)} €; più scuro dove il costo è più alto. Le province senza dato sono piatte e grigie. ` +
      `I valori di ogni provincia sono nell'elenco «Tutte le province».`,
    forme: righe.map(({ nome, d, cas }) => {
      const v = cas?.costo_mediano ?? null;
      return {
        d, valore: v, tono: v === null ? null : Math.round(20 + (80 * (v - min)) / (max - min)),
        href: trovaProvincia(slug(nome)) ? `/provincia/${slug(nome)}` : undefined,
        testi: v === null
          ? [nomeProvincia(nome), `Nessun CAS per adulti con il dato nel ${anno}`]
          : [nomeProvincia(nome), `${nItal2(v)} € al giorno per ospite, ${anno}`, `CAS per adulti con il dato: ${nItal(cas!.costo_centri)}`],
      };
    }),
  };
}

/** Leggi e numeri: una barra per anno con i contratti da 40.000 € in su, come nel grafico della pagina. */
function anniLeggi(): DatiFigura {
  const { anni, leggi, contratti_40k: k } = cronologia;
  const primo = anni[0], ultimo = anni[anni.length - 1];
  return {
    tipo: "anni",
    descrizione:
      `Grafico in rilievo, ${primo}–${ultimo}: una barra per anno con i contratti per l'accoglienza da 40.000 € in su; ` +
      `il ${ultimo} è a filo perché il dato è provvisorio. Un pannello segna l'anno di ogni legge: ` +
      `${leggi.map((l) => `${l.nome_breve} (${l.anno})`).join(", ")}. I valori di ogni anno sono nei blocchi più in basso.`,
    barre: anni.map((anno) => {
      const valore = k.affidamenti_40k[anno], legge = leggi.find((l) => l.anno === anno)?.nome_breve;
      const provvisorio = anno === ultimo;
      return {
        anno, valore, provvisorio, legge, tono: 85, href: `#anno-${anno}`,
        testi: [anno, `${nItal(valore)} contratti da 40.000 € in su`, ...(legge ? [`Legge: ${legge}`] : []), ...(provvisorio ? ["Dato provvisorio"] : [])],
      };
    }),
  };
}

export const figure = { home: () => datiItalia, "quanto-costa": costo, "dieci-anni": anniLeggi };
export type NomeFigura = keyof typeof figure;
