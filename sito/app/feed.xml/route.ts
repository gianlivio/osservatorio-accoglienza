import { readFileSync } from "node:fs";
import path from "node:path";
import { piuRecenti, rispostaRss, rss, type VoceFeed } from "@/lib/feed";
import { dominio } from "@/lib/jsonld";

export const dynamic = "force-static";
const QUANTI = 100;

// CSV con virgolette (RFC 4180), senza a capo dentro i campi.
function righeCsv(testo: string) {
  return testo.split("\n").filter(Boolean).map((riga) => {
    const campi: string[] = [];
    let corrente = "", tra = false;
    for (let i = 0; i < riga.length; i++) {
      const c = riga[i];
      if (tra) {
        if (c === '"' && riga[i + 1] === '"') { corrente += '"'; i++; }
        else if (c === '"') tra = false;
        else corrente += c;
      } else if (c === '"') tra = true;
      else if (c === ",") { campi.push(corrente); corrente = ""; }
      else corrente += c;
    }
    campi.push(corrente);
    return campi;
  });
}

const numero = (v: string) => (v === "" ? null : Number(v));

export function GET() {
  const [intestazione, ...righe] = righeCsv(readFileSync(path.join(process.cwd(), "public/dati/contratti.csv"), "utf8"));
  const col = (r: string[], nome: string) => r[intestazione.indexOf(nome)];
  const voci: VoceFeed[] = righe.map((r) => ({
    cig: col(r, "cig"), data: col(r, "data"), oggetto: col(r, "oggetto"),
    amministrazione: col(r, "amministrazione"), ente: col(r, "ente") || null,
    procedura: col(r, "procedura"), modalita: col(r, "modalita"),
    base: numero(col(r, "base")), aggiudicato: numero(col(r, "aggiudicato")),
    provincia: col(r, "provincia") || null,
  }));
  return rispostaRss(rss({
    titolo: "Affidamenti per l'accoglienza dei migranti · Osservatorio Accoglienza",
    descrizione: `Gli ultimi ${QUANTI} contratti per data in tutta Italia, anche senza provincia indicata, da dati ANAC.`,
    link: dominio,
    self: `${dominio}/feed.xml`,
    voci: piuRecenti(voci, QUANTI),
  }));
}
