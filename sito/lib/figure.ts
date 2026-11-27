// Dati delle figure in rilievo, costruiti al build: usati dall'SVG statico e da /figure/[nome].
import mappa from "@/data/mappa.json";
import { centri } from "@/lib/centri";
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

export const figure = { home: () => datiItalia, "quanto-costa": costo };
export type NomeFigura = keyof typeof figure;
