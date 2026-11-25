import raw from "@/data/msna-ingressi.json";

type Cifra = { valore: number; approssimazione: string | null; testo: string; pagina: number; decimali?: number };
export type CittadinanzaIngressi = {
  nome: string; ingressi: number; quota_ingressi: Cifra; testo: string; pagina: number; sbarco: Cifra | null;
  incoerenza?: { altro_valore: number; altro_testo: string; altra_pagina: number; nota: string };
  nota?: { testo: string; pagina: number; avviso: string };
};
export type AnnoIngressi = {
  rapporto: string; data: string; periodo: string; ingressi_totali: Cifra;
  sbarchi: { numero: Cifra; percentuale: Cifra }; cittadinanze: CittadinanzaIngressi[];
};
export const ingressi = raw as unknown as { estratto: string; fonte: string; periodo: string; non_usati: string[]; note: string[]; anni: Record<string, AnnoIngressi> };

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
