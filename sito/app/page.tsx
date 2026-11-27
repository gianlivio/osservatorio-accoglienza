import Link from "next/link";
import Ricerca from "./Ricerca";
import TabellaProvince from "./TabellaProvince";
import JsonLd from "./JsonLd";
import MappaItalia from "./MappaItalia";
import { anni, province } from "@/lib/dati";
import { creatore, distribuzioneCsv, fonteAnac, licenza } from "@/lib/jsonld";
import { metadatiPagina } from "@/lib/metadati";

export const metadata = {
  ...metadatiPagina(
    "Osservatorio Accoglienza: contratti per l'accoglienza dei migranti in Italia, provincia per provincia",
    "Chi gestisce l'accoglienza dei migranti in Italia, con quali soldi e a quali condizioni: contratti pubblici ed enti gestori, provincia per provincia.",
  ),
  alternates: {
    canonical: "./",
    types: { "application/rss+xml": [{ url: "/feed.xml", title: "Ultimi contratti per l'accoglienza" }] },
  },
};

const datasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Osservatorio Accoglienza",
  description:
    "Contratti pubblici per l'accoglienza dei migranti, provincia per provincia: numero di affidamenti, importi ed enti gestori.",
  license: licenza,
  creator: creatore,
  temporalCoverage: `${anni[0]}/${anni[anni.length - 1]}`,
  spatialCoverage: "Italia",
  url: "https://osservatorioaccoglienza.org",
  isBasedOn: fonteAnac,
  distribution: distribuzioneCsv("/dati/contratti.csv"),
};

export default function Home() {
  const primo = anni[0], ultimo = anni[anni.length - 1];

  return (
    <main>
      <JsonLd dati={datasetJsonLd} />
      <div className="home-apertura">
        <div>
          <p className="occhiello">Contratti pubblici · {primo}–{ultimo}</p>
          <h1 className="tesi">Chi accoglie, <em>e a quali condizioni</em>.</h1>
          <p className="sommario">
            Quando si parla di immigrazione si parla, quasi sempre, di chi arriva. Si parla poco di
            chi accoglie: degli uffici che firmano i contratti, delle cooperative che li ricevono,
            dei soldi che passano dagli uni alle altre.
          </p>
          <p className="sommario">
            Lo Stato non gestisce da sé l&apos;accoglienza di chi chiede asilo: la affida a
            cooperative e associazioni, con contratti pubblici. Questo archivio raccoglie quei
            contratti, provincia per provincia: quanti sono, quanto valgono, chi li ha ricevuti,
            e se sono stati assegnati con una gara o scegliendo direttamente.{" "}
            <Link href="/che-cose" className="link-interno">Come funziona →</Link>
          </p>
          <p className="sommario">
            <Link href="/quanto-costa" className="link-interno">Quanto costa l&apos;accoglienza →</Link>
          </p>
          <p className="sommario">
            <Link href="/dieci-anni" className="link-interno">Leggi e numeri dell&apos;accoglienza →</Link>
          </p>
        </div>
        <MappaItalia />
      </div>

      <section className="sezione sezione-ricerca">
        <Ricerca />
      </section>

      <section className="sezione" aria-label="Tabella delle province">
        <TabellaProvince province={province} />
      </section>
    </main>
  );
}
