import Link from "next/link";
import JsonLd from "@/app/JsonLd";
import { breadcrumb } from "@/lib/jsonld";
import { metadatiPagina } from "@/lib/metadati";
import { dataLunga } from "@/lib/dati";
import { dati, paesi, anniPaesi, periodoPaesi, aperturaPaesi, descrizionePaesi } from "@/lib/paesi";
import TabellaPaesi from "./TabellaPaesi";

export const metadata = {
  ...metadatiPagina("Da dove arrivano: richiedenti asilo in Italia per paese di cittadinanza · Osservatorio Accoglienza", descrizionePaesi()),
  alternates: { canonical: "./" },
};

export default function Paesi() {
  const e = dati.fonti.eurostat;
  return (
    <main>
      <JsonLd dati={breadcrumb([{ nome: "Da dove arrivano", percorso: "/paesi" }])} />
      <Link href="/" className="indietro">← vai ai dati</Link>
      <p className="occhiello">Paesi di cittadinanza · {periodoPaesi}</p>
      <h1 className="tesi">Da dove arrivano.</h1>
      <p className="frase-provincia">{aperturaPaesi()}</p>

      <section className="sezione">
        <h2 className="titolo-sezione">I {paesi.length} paesi</h2>
        <TabellaPaesi paesi={paesi} anni={anniPaesi} />
        <p className="nota-tabella">
          I paesi sono quelli comparsi tra le prime dieci cittadinanze dei minori presenti o degli sbarcati dal 2016. Richiedenti: richiedenti asilo. Rifugiato: status di rifugiato; Sussidiaria: protezione sussidiaria; Umanitaria: motivi umanitari; Rifiutate. Quota: sul totale delle decisioni di prima istanza di quel paese
          e di quell&apos;anno. Eurostat arrotonda i valori a multipli di {e.arrotondamento}. Fonte: Eurostat, dati per l&apos;Italia, estratti il {dataLunga(dati.estratto)}.{" "}
          <Link href="/metodologia#paesi" className="link-interno">Metodologia</Link>
        </p>
      </section>
    </main>
  );
}
