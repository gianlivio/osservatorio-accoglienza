import raw from "@/data/msna-ingressi.json";

type Cifra = { valore: number; approssimazione: string | null; testo: string; pagina: number; decimali?: number };
export type CittadinanzaIngressi = {
  nome: string; ingressi: number; quota_ingressi: Cifra; testo: string; pagina: number; sbarco: Cifra | null;
  incoerenza?: { altro_valore: number; altro_testo: string; altra_pagina: number; nota: string };
  nota?: { testo: string; pagina: number; avviso: string; rotte_terrestri?: number };
};
export type AnnoIngressi = {
  rapporto: string; titolo: string; url: string; data: string; periodo: string; ingressi_totali: Cifra;
  sbarchi: { numero: Cifra; percentuale: Cifra }; cittadinanze: CittadinanzaIngressi[];
};
export const ingressi = raw as unknown as {
  estratto: string; fonte: string; periodo: string; non_usati: string[]; note: string[]; anni: Record<string, AnnoIngressi>;
  confronto_2024_nel_rapporto_2025: { differenza: number; testo: string; pagina: number; rapporto: string };
};

// Controlli (se uno non torna la build fallisce):
// - ogni cifra ha testo e pagina del rapporto; ogni quota è tra 0 e 100;
// - numero e percentuale scritti insieme sono coerenti: scarto non oltre 0,1 punti (0,5 se la percentuale è scritta senza decimali,
//   per l'arrotondamento; più l'incertezza del numero se è «oltre» o «quasi» un numero di migliaia);
// - una incoerenza nel rapporto è ammessa solo se dichiarata (campo incoerenza) e se l'altra cifra del rapporto è coerente;
// - per ogni anno, ingressi via mare ≤ ingressi totali e somma degli ingressi per cittadinanza ≤ ingressi totali.
function verifica(d: typeof ingressi) {
  const errori: string[] = [];
  const scarto = (n: number, tot: number, q: Cifra, incertezza = 0) => Math.abs((n / tot) * 100 - q.valore) - Math.max(0.1, 0.5 * 10 ** -(q.decimali ?? 0)) - incertezza;
  for (const [anno, a] of Object.entries(d.anni)) {
    const tot = a.ingressi_totali.valore;
    const cifre: [string, Cifra][] = [["ingressi totali", a.ingressi_totali], ["sbarchi numero", a.sbarchi.numero], ["sbarchi percentuale", a.sbarchi.percentuale]];
    for (const c of a.cittadinanze) {
      cifre.push([`${c.nome} quota ingressi`, c.quota_ingressi]);
      if (c.sbarco) cifre.push([`${c.nome} sbarco`, c.sbarco]);
    }
    for (const [nome, c] of cifre) {
      if (!c.testo && !nome.endsWith("quota ingressi")) errori.push(`${anno} ${nome}: manca il testo`);
      if (!Number.isInteger(c.pagina) && !nome.endsWith("quota ingressi")) errori.push(`${anno} ${nome}: manca la pagina`);
      if (nome.includes("percentuale") || nome.includes("quota") || nome.endsWith("sbarco")) {
        if (!(c.valore >= 0 && c.valore <= 100)) errori.push(`${anno} ${nome}: ${c.valore} fuori da 0–100`);
      }
    }
    const incertezza = (a.sbarchi.numero.valore % 1000 === 0 ? 1000 : 100) / tot * 100;
    if (scarto(a.sbarchi.numero.valore, tot, a.sbarchi.percentuale, incertezza) > 0)
      errori.push(`${anno}: ingressi via mare ${a.sbarchi.numero.valore} su ${tot} non coerenti con il ${a.sbarchi.percentuale.valore}%`);
    if (a.sbarchi.numero.valore > tot) errori.push(`${anno}: ingressi via mare ${a.sbarchi.numero.valore} oltre il totale ${tot}`);
    let somma = 0;
    for (const c of a.cittadinanze) {
      somma += c.ingressi;
      const male = scarto(c.ingressi, tot, c.quota_ingressi) > 0;
      if (c.incoerenza) {
        if (!male) errori.push(`${anno} ${c.nome}: incoerenza dichiarata ma la cifra torna`);
        else if (scarto(c.incoerenza.altro_valore, tot, c.quota_ingressi) > 0) errori.push(`${anno} ${c.nome}: anche l'altra cifra (${c.incoerenza.altro_valore}) non torna con il ${c.quota_ingressi.valore}%`);
      } else if (male) errori.push(`${anno} ${c.nome}: ${c.ingressi} su ${tot} non coerente con il ${c.quota_ingressi.valore}%`);
    }
    if (somma > tot) errori.push(`${anno}: somma degli ingressi per cittadinanza ${somma} oltre il totale ${tot}`);
  }
  if (errori.length) throw new Error(`Dati sugli ingressi dei minori non coerenti: ${errori.join("; ")}`);
}
verifica(ingressi);

// ---- testi generati dai dati ----

const num = (v: number, dec: number) => v.toLocaleString("it-IT", { minimumFractionDigits: dec, maximumFractionDigits: dec });
/** Una percentuale come scritta nel rapporto: «62%», «87,6%», «quasi 65%», «oltre 63%». */
export const testoPercentuale = (c: Cifra) => `${c.approssimazione ? c.approssimazione + " " : ""}${num(c.valore, c.decimali ?? 0)}%`;
const migliaia = (c: Cifra) => `${c.approssimazione ? c.approssimazione + " " : ""}${num(c.valore / 1000, 0)}mila`;
export const testoSbarchiNumero = migliaia;
export const anniIngressi = Object.keys(ingressi.anni).sort();
/** Totale del 2024 implicato dal rapporto 2025: totale 2025 meno la differenza scritta nel rapporto. */
export const totale2024Implicato = ingressi.anni["2025"].ingressi_totali.valore - ingressi.confronto_2024_nel_rapporto_2025.differenza;

const pagine = (n: number[]) => {
  const u = [...new Set(n)].sort((a, b) => a - b);
  return `${u.length > 1 ? "pp." : "p."} ${u.length > 1 ? u.slice(0, -1).join(", ") + " e " + u[u.length - 1] : u[0]}`;
};

export type RigaIngressi = { nome: string; testo: string | null; valore: number | null; nota: string | null };
export type FonteRapporto = { titolo: string; url: string | null; pagine: string };
export type AnnoComeEntrati = { anno: string; totale: number; percentuale: string; righe: RigaIngressi[]; fonte: FonteRapporto };

/** Per /minori: per ogni anno totale, percentuale via mare e righe nell'ordine del rapporto. */
export function comeSonoEntrati(): AnnoComeEntrati[] {
  return anniIngressi.map((anno) => {
    const a = ingressi.anni[anno];
    const righe = a.cittadinanze.map((c) => ({
      nome: c.nome,
      testo: c.sbarco ? testoPercentuale(c.sbarco) : null,
      valore: c.sbarco ? c.sbarco.valore : null,
      nota: !c.sbarco && c.nota?.rotte_terrestri !== undefined ? `Il rapporto indica il ${num(c.nota.rotte_terrestri, 1)}% entrato per rotte terrestri.` : null,
    }));
    const pp = [a.ingressi_totali.pagina, a.sbarchi.percentuale.pagina, ...a.cittadinanze.flatMap((c) => [c.pagina, ...(c.sbarco ? [c.sbarco.pagina] : [])])];
    return { anno, totale: a.ingressi_totali.valore, percentuale: testoPercentuale(a.sbarchi.percentuale), righe,
      fonte: { titolo: a.titolo, url: a.url, pagine: pagine(pp) } };
  });
}

/** Per /paesi/[slug]: quota via mare di ogni anno in cui il rapporto la riporta per quel paese. */
export function sbarcoPaese(nome: string) {
  return anniIngressi.flatMap((anno) => {
    const c = ingressi.anni[anno].cittadinanze.find((x) => x.nome === nome);
    return c?.sbarco ? [{ anno, testo: testoPercentuale(c.sbarco), pagina: c.sbarco.pagina, rapporto: ingressi.anni[anno].titolo }] : [];
  });
}

/** Cifre approssimate come scritte nel rapporto, per /metodologia. */
export function cifreApprossimate() {
  const out: { anno: string; voce: string; testo: string }[] = [];
  for (const anno of anniIngressi) {
    const a = ingressi.anni[anno];
    if (a.sbarchi.numero.approssimazione) out.push({ anno, voce: "ingressi via mare", testo: testoSbarchiNumero(a.sbarchi.numero) });
    for (const c of a.cittadinanze) {
      if (c.quota_ingressi.approssimazione) out.push({ anno, voce: `${c.nome}, quota sul totale degli ingressi`, testo: testoPercentuale(c.quota_ingressi) });
      if (c.sbarco?.approssimazione) out.push({ anno, voce: `${c.nome}, quota via mare`, testo: testoPercentuale(c.sbarco) });
    }
  }
  return out;
}

/** Nome per esteso e link del rapporto del Ministero del Lavoro da cui viene un file (es. «sem-2025-12.pdf», «Report-MSNA-mese-dicembre-2021.pdf»). */
export function nomeRapporto(file: string, data: string): { titolo: string; url: string | null } {
  const anno = data.slice(0, 4);
  if (/^sem-\d{4}-12\.pdf$/.test(file)) {
    const a = ingressi.anni[anno];
    return { titolo: a?.titolo ?? `Rapporto semestrale al 31 dicembre ${anno}`, url: a?.url ?? null };
  }
  return { titolo: `Report mensile al 31 dicembre ${anno}`, url: null };
}
