import Link from "next/link";
import TabellaProvince from "./TabellaProvince";
import { anni, province } from "@/lib/dati";

export default function Home() {
  const primo = anni[0], ultimo = anni[anni.length - 1];

  return (
    <main>
      <p className="occhiello">Contratti pubblici · {primo}–{ultimo}</p>
      <h1 className="tesi">Chi accoglie, <em>e a quali condizioni</em>.</h1>
      <p className="sommario">
        Lo Stato non gestisce da sé l&apos;accoglienza di chi chiede asilo: la affida a
        cooperative e associazioni, con contratti pubblici. Questo archivio raccoglie quei
        contratti, provincia per provincia: quanti sono, quanto valgono, chi li ha ricevuti,
        e se sono stati assegnati con una gara o scegliendo direttamente.{" "}
        <Link href="/che-cose" className="link-interno">Come funziona, spiegato semplice →</Link>
      </p>

      <section className="sezione">
        <h2 className="titolo-sezione">Prima di leggere i numeri</h2>
        <p className="avviso">
          Questo archivio conta i contratti firmati in un anno, non l&apos;accoglienza
          effettivamente attiva. Le regole su cosa vada registrato sono cambiate nel tempo, e
          confrontare anni diversi può portare a conclusioni sbagliate. La pagina{" "}
          <Link href="/metodologia">Metodologia e limiti</Link> spiega quali dati sono
          affidabili, per quali anni, e cosa non si può dedurre da qui.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Cerca la tua provincia</h2>
        <p className="nota-tabella">
          Scegli l&apos;anno e clicca il titolo di una colonna per riordinare l&apos;elenco.
          Le province in cui non risulta nessun contratto nell&apos;anno scelto non compaiono:
          non significa che lì non ci sia accoglienza, ma che quell&apos;anno non è stato
          firmato nessun contratto nuovo.
        </p>
        <TabellaProvince province={province} />
      </section>
    </main>
  );
}
