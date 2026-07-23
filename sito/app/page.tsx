import Link from "next/link";
import TabellaProvince from "./TabellaProvince";
import { anni, province } from "@/lib/dati";

export const metadata = {
  title: "Osservatorio Accoglienza",
  description:
    "Contratti pubblici per l'accoglienza dei migranti, provincia per provincia: numero di affidamenti, importi ed enti gestori.",
};

const datasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "Osservatorio Accoglienza",
  description:
    "Contratti pubblici per l'accoglienza dei migranti, provincia per provincia: numero di affidamenti, importi ed enti gestori.",
  license: "https://creativecommons.org/licenses/by/4.0/",
  temporalCoverage: "2015/2025",
  spatialCoverage: "Italia",
  url: "https://osservatorioaccoglienza.org",
  isBasedOn: "https://dati.anticorruzione.it",
};

export default function Home() {
  const primo = anni[0], ultimo = anni[anni.length - 1];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetJsonLd) }}
      />
      <p className="occhiello">Contratti pubblici · {primo}–{ultimo}</p>
      <h1 className="tesi">Chi accoglie, <em>e a quali condizioni</em>.</h1>
      <p className="sommario">
        Lo Stato non gestisce da sé l&apos;accoglienza di chi chiede asilo: la affida a
        cooperative e associazioni, con contratti pubblici. Questo archivio raccoglie quei
        contratti, provincia per provincia: quanti sono, quanto valgono, chi li ha ricevuti,
        e se sono stati assegnati con una gara o scegliendo direttamente.{" "}
        <Link href="/che-cose" className="link-interno">Come funziona →</Link>
      </p>

      <section className="sezione">
        <h2 className="titolo-sezione">Cerca la tua provincia</h2>
        <p className="nota-tabella">
          Scegli l&apos;anno, clicca il titolo di una colonna per riordinare. Le province senza
          contratti nell&apos;anno scelto non compaiono: non vuol dire che lì manchi
          l&apos;accoglienza, ma che quell&apos;anno non è stato firmato nulla di nuovo. Gli
          anni non sono confrontabili tra loro — la{" "}
          <Link href="/metodologia">Metodologia</Link> spiega perché.
        </p>
        <TabellaProvince province={province} />
      </section>
    </main>
  );
}
