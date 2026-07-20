import Link from "next/link";
import TabellaProvince from "./TabellaProvince";
import { anni, totale, perAnno, province, euro, nItal, amministrazioni } from "@/lib/dati";

export default function Home() {
  const primo = anni[0], ultimo = anni[anni.length - 1];

  return (
    <main>
      <p className="occhiello">{primo}–{ultimo} · {nItal(totale.affidamenti)} contratti</p>
      <h1 className="tesi">Chi accoglie, <em>e a quali condizioni</em>.</h1>
      <p className="sommario">
        Lo Stato non gestisce da sé l&apos;accoglienza di chi chiede asilo: la affida a
        cooperative e associazioni, con contratti pubblici. Qui trovi quei contratti,
        provincia per provincia: quanti sono, quanto valgono, chi li ha ricevuti, e se sono
        stati assegnati con una gara o scegliendo direttamente.{" "}
        <Link href="/che-cose" className="link-interno">Come funziona, spiegato semplice →</Link>
      </p>

      <section className="sezione">
        <h2 className="titolo-sezione">Quanti contratti vengono assegnati senza gara</h2>
        <p className="nota-tabella">
          La parte piena indica i contratti assegnati direttamente, senza bando. Sotto una
          certa cifra la legge lo consente.
        </p>
        {anni.map((a) => {
          const b = perAnno[a];
          return (
            <div className="riga-barra" key={a}>
              <div className="etichetta-barra">
                <span>{a} · {nItal(b.affidamenti)} contratti</span>
                <span>valore tipico {euro(b.importo_mediano)}</span>
              </div>
              <div className="barra">
                <div className="quota-diretta" style={{ flexBasis: `${b.quota_diretti}%` }}>
                  {b.quota_diretti}% senza gara
                </div>
                <div className="quota-gara" style={{ flexBasis: `${100 - b.quota_diretti}%` }}>
                  {(100 - b.quota_diretti).toFixed(1)}% con gara
                </div>
              </div>
            </div>
          );
        })}
        <p className="avviso">
          Nel primo semestre del 2023 i contratti assegnati senza gara erano il 52%. Nel
          secondo semestre sono diventati il 71%, e da allora la quota non è più cambiata. Lo
          scarto cade a cavallo del 1° luglio 2023, quando è entrata in vigore la nuova legge
          sugli appalti pubblici. La coincidenza di date è netta. Perché sia successo, questi
          dati da soli non lo dicono.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">I contratti senza gara sono tanti, ma piccoli</h2>
        <div className="riga-barra">
          <div className="etichetta-barra"><span>Contando i contratti</span><span>{primo}–{ultimo}</span></div>
          <div className="barra">
            <div className="quota-diretta" style={{ flexBasis: `${totale.quota_diretti}%` }}>
              {totale.quota_diretti}% senza gara
            </div>
            <div className="quota-gara" style={{ flexBasis: `${100 - totale.quota_diretti}%` }}>
              {(100 - totale.quota_diretti).toFixed(1)}% con gara
            </div>
          </div>
        </div>
        <div className="riga-barra">
          <div className="etichetta-barra"><span>Contando i soldi</span><span>gli stessi contratti</span></div>
          <div className="barra">
            <div className="quota-diretta" style={{ flexBasis: `${totale.quota_diretti_per_importo}%` }}>
              {totale.quota_diretti_per_importo}%
            </div>
            <div className="quota-gara" style={{ flexBasis: `${100 - totale.quota_diretti_per_importo}%` }}>
              {(100 - totale.quota_diretti_per_importo).toFixed(1)}% con gara
            </div>
          </div>
        </div>
        <p className="avviso">
          Le due barre misurano gli stessi contratti in due modi diversi, e non si somigliano.
          I contratti assegnati senza gara sono la maggioranza, ma valgono poco ciascuno: i
          contratti grandi passano quasi sempre da un bando. Attenzione: le cifre indicate
          sono il valore dei contratti, non i soldi effettivamente spesi, e non vanno sommate.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">In breve</h2>
        <div className="cifre">
          <div className="cifra"><b>{nItal(totale.affidamenti)}</b><span>contratti registrati in tre anni</span></div>
          <div className="cifra"><b>{euro(totale.importo_mediano)}</b><span>valore tipico di un contratto</span></div>
          <div className="cifra"><b>{amministrazioni}</b><span>uffici pubblici che affidano</span></div>
          <div className="cifra"><b>{totale.enti_gestori}</b><span>cooperative, associazioni, enti</span></div>
          <div className="cifra"><b>{totale.prosecuzioni}</b><span>rinnovi di contratti già in corso</span></div>
          <div className="cifra"><b>{totale.copertura_vincitore}%</b><span>contratti di cui si sa chi li ha ricevuti</span></div>
        </div>
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
