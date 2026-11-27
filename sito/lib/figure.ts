// Dati delle figure in rilievo, costruiti al build: usati dall'SVG statico e da /figure/[nome].
import mappa from "@/data/mappa.json";
import mappaRegioni from "@/data/mappa-regioni.json";
import { centri } from "@/lib/centri";
import { cronologia } from "@/lib/cronologia";
import { slug, nomeProvincia, nItal, nItal2, dataLunga, trovaProvincia, msnaData } from "@/lib/dati";
import { datiItalia } from "@/lib/italiaDati";
import { ALTEZZA_MASSIMA } from "@/lib/mappa3d";
import type { DatiFigura } from "@/lib/motori";

const tracciati = mappa.province as Record<string, { sigla: string; d: string }>;

/** Scala di un solo tono, dal valore minimo (più chiaro) al massimo (pieno). */
const tonoTra = (v: number, min: number, max: number) => Math.round(20 + (80 * (v - min)) / (max - min));

/** Quanto costa: altezza e colore dal costo giornaliero mediano dei CAS per adulti dell'ultimo anno. */
function costo(): DatiFigura {
  const anno = centri.anni[centri.anni.length - 1];
  const righe = Object.entries(tracciati).map(([nome, { d }]) => ({ nome, d, cas: centri.province[nome]?.[anno]?.cas }));
  const valori = righe.flatMap((r) => r.cas?.costo_mediano ?? []);
  const min = Math.min(...valori), max = Math.max(...valori);
  return {
    tipo: "mappa",
    altezzaMassima: ALTEZZA_MASSIMA,
    descrizione:
      `Italia in tre dimensioni: per ogni provincia un prisma alto in proporzione al costo giornaliero per ospite nei CAS per adulti nel ${anno}, ` +
      `da ${nItal2(min)} € a ${nItal2(max)} €; più scuro dove il costo è più alto. Le province senza dato sono piatte e grigie. ` +
      `I valori di ogni provincia sono nell'elenco «Tutte le province».`,
    forme: righe.map(({ nome, d, cas }) => {
      const v = cas?.costo_mediano ?? null;
      return {
        d, valore: v, tono: v === null ? null : tonoTra(v, min, max),
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

/** Minori: altezza dai presenti per regione all'ultimo mese con il dato regionale, come nella tabella della pagina. */
function minori(): DatiFigura {
  const confini = mappaRegioni.regioni as Record<string, { d: string }>;
  const [anno, mese] = msnaData.ultimo_periodo.split("-").map(Number);
  const giorno = dataLunga(`${msnaData.ultimo_periodo}-${new Date(Date.UTC(anno, mese, 0)).getUTCDate()}`);
  const righe = msnaData.regioni;
  const mancanti = righe.filter((r) => !confini[r.regione]).map((r) => r.regione);
  if (mancanti.length || righe.length !== Object.keys(confini).length)
    throw new Error(`Regioni dei dati sui minori e di mappa-regioni.json non coincidono: ${mancanti.join(", ")}`);
  const ordinate = [...righe].sort((a, b) => b.ultimo - a.ultimo);
  const massima = ordinate[0], minima = ordinate[ordinate.length - 1];
  return {
    tipo: "mappa",
    altezzaMassima: ALTEZZA_MASSIMA,
    descrizione:
      `Italia in tre dimensioni: per ogni regione un prisma alto in proporzione ai minori stranieri non accompagnati presenti al ${giorno}, ` +
      `da ${nItal(minima.ultimo)} (${minima.regione}) a ${nItal(massima.ultimo)} (${massima.regione}); più scuro dove sono di più. I valori di ogni regione sono nella tabella più in basso.`,
    forme: righe.map((r) => ({
      d: confini[r.regione].d, valore: r.ultimo, tono: tonoTra(r.ultimo, minima.ultimo, massima.ultimo),
      testi: [r.regione, `${nItal(r.ultimo)} minori presenti al ${giorno}`],
    })),
  };
}

export const figure = { home: () => datiItalia, "quanto-costa": costo, "dieci-anni": anniLeggi, minori };
export type NomeFigura = keyof typeof figure;
