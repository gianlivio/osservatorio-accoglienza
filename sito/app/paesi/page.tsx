import Link from "next/link";
import Intestazione from "@/app/Intestazione";
import JsonLd from "@/app/JsonLd";
import { breadcrumb } from "@/lib/jsonld";
import { metadatiPagina } from "@/lib/metadati";
import { dataLunga } from "@/lib/dati";
import { dati, paesi, anniPaesi, periodoPaesi, aperturaPaesi, descrizionePaesi, datiGlobo } from "@/lib/paesi";
import { sicuroAl31Dicembre, testoSicuro, sicuri } from "@/lib/paesiSicuri";
import TabellaPaesi from "./TabellaPaesi";
import GloboLoader from "./GloboLoader";
import GloboStatico from "./GloboStatico";

export const metadata = {
  ...metadatiPagina("Da dove arrivano: richiedenti asilo in Italia per paese di cittadinanza · Osservatorio Accoglienza", descrizionePaesi()),
  alternates: { canonical: "./" },
};

export default function Paesi() {
  const e = dati.fonti.eurostat;
  const sicuro: Record<string, Record<string, string>> = Object.fromEntries(
    paesi.map((p) => [p.slug, Object.fromEntries(anniPaesi.map((a) => [a, testoSicuro(sicuroAl31Dicembre(p.slug, a))]))]));
  const globo = datiGlobo();
  return (
    <main>
      <JsonLd dati={breadcrumb([{ nome: "Da dove arrivano", percorso: "/paesi" }])} />
      <Intestazione ritorno="vai ai dati">Paesi di cittadinanza · {periodoPaesi}</Intestazione>
      <div className="apertura-globo">
        <h1 className="tesi">Da dove arrivano.</h1>
        <GloboLoader {...globo}><GloboStatico {...globo} /></GloboLoader>
        <div className="apertura-testo">
          <p className="frase-provincia">{aperturaPaesi()}</p>
        </div>
      </div>

      <section className="sezione">
        <h2 className="titolo-sezione">I {paesi.length} paesi</h2>
        <TabellaPaesi paesi={paesi} anni={anniPaesi} sicuro={sicuro} />
        <p className="nota-tabella">
          I paesi sono quelli comparsi tra le prime dieci cittadinanze dei minori presenti o degli sbarcati dal 2016, o dei richiedenti asilo in Italia in un anno dal 2015. Richiedenti: richiedenti asilo. Rifugiato: status di rifugiato; Sussidiaria: protezione sussidiaria; Umanitaria: motivi umanitari; Rifiutate. Paese sicuro: se il paese è nell&apos;elenco italiano dei paesi di origine sicuri al 31 dicembre dell&apos;anno; — : prima del {dataLunga(sicuri.primo_elenco_dal)} non c&apos;era un elenco. Quota: sul totale delle decisioni di prima istanza di quel paese
          e di quell&apos;anno. Eurostat arrotonda i valori a multipli di {e.arrotondamento}. Fonte: Eurostat, dati per l&apos;Italia, estratti il {dataLunga(dati.estratto)}.{" "}
          <Link href="/metodologia#paesi" className="link-interno">Metodologia</Link>
        </p>
      </section>
    </main>
  );
}
