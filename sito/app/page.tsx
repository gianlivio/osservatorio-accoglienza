import Link from "next/link";
import TabellaProvince from "./TabellaProvince";
import { anni, totale, perAnno, province, slug, euro, nItal, amministrazioni } from "@/lib/dati";

export default function Home() {
  const primo = anni[0], ultimo = anni[anni.length - 1];

  return (
    <main>
      <p className="occhiello">{primo}–{ultimo} · {nItal(totale.affidamenti)} affidamenti</p>
      <h1 className="tesi">Come viene affidata <em>l&apos;accoglienza</em>.</h1>
      <p className="sommario">
        In Italia i servizi di accoglienza per migranti e richiedenti asilo sono affidati a
        soggetti esterni da prefetture, comuni ed enti locali. Questo archivio raccoglie gli
        affidamenti registrati dal {primo} al {ultimo} nella banca dati dei contratti
        pubblici: importo, procedura, territorio e soggetto affidatario.
      </p>

      <section className="sezione">
        <h2 className="titolo-sezione">Affidamenti senza gara, anno per anno</h2>
        {anni.map((a) => {
          const b = perAnno[a];
          return (
            <div className="riga-barra" key={a}>
              <div className="etichetta-barra">
                <span>{a} · {nItal(b.affidamenti)} affidamenti</span>
                <span>importo mediano {euro(b.importo_mediano)}</span>
              </div>
              <div className="barra">
                <div className="quota-diretta" style={{ flexBasis: `${b.quota_diretti}%` }}>
                  {b.quota_diretti}% diretti
                </div>
                <div className="quota-gara" style={{ flexBasis: `${100 - b.quota_diretti}%` }}>
                  {(100 - b.quota_diretti).toFixed(1)}% con gara
                </div>
              </div>
            </div>
          );
        })}
        <p className="avviso">
          La quota di affidamenti disposti senza gara passa dal 52% al 71% tra il primo e il
          secondo semestre del 2023, e da allora resta stabile. Lo stacco coincide con il
          1° luglio 2023, data di efficacia del nuovo codice dei contratti pubblici. La
          coincidenza temporale è netta; il meccanismo che la produce non è ricostruibile
          da questi dati e resta una domanda aperta.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Numero e valore non coincidono</h2>
        <div className="riga-barra">
          <div className="etichetta-barra"><span>Per numero di affidamenti</span><span>{primo}–{ultimo}</span></div>
          <div className="barra">
            <div className="quota-diretta" style={{ flexBasis: `${totale.quota_diretti}%` }}>{totale.quota_diretti}%</div>
            <div className="quota-gara" style={{ flexBasis: `${100 - totale.quota_diretti}%` }}>
              {(100 - totale.quota_diretti).toFixed(1)}% con gara
            </div>
          </div>
        </div>
        <div className="riga-barra">
          <div className="etichetta-barra"><span>Per valore dei lotti</span><span>stessi affidamenti</span></div>
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
          Sotto la soglia di legge dei 140.000 euro è diretto
          l&apos;{totale.quota_diretti_sotto_soglia}% degli affidamenti; sopra, quasi nessuno.
          Gli importi indicati sono valori dei lotti e non vanno sommati: gli accordi quadro
          riportano un tetto di spesa pluriennale.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">In sintesi</h2>
        <div className="cifre">
          <div className="cifra"><b>{nItal(totale.affidamenti)}</b><span>affidamenti registrati</span></div>
          <div className="cifra"><b>{euro(totale.importo_mediano)}</b><span>importo mediano</span></div>
          <div className="cifra"><b>{amministrazioni}</b><span>amministrazioni appaltanti</span></div>
          <div className="cifra"><b>{totale.enti_gestori}</b><span>enti gestori</span></div>
          <div className="cifra"><b>{totale.prosecuzioni}</b><span>dichiarati come proroga o prosecuzione</span></div>
          <div className="cifra"><b>{totale.copertura_vincitore}%</b><span>affidamenti con aggiudicatario noto</span></div>
        </div>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">
          Province
        </h2>
        <p className="nota-tabella">
          Scegli il periodo e clicca l&apos;intestazione di una colonna per riordinare.
          Le province senza affidamenti registrati nell&apos;anno scelto non compaiono.
          Il dettaglio mensile è nella scheda di ciascuna provincia.
        </p>
        <TabellaProvince province={province} />
      </section>
    </main>
  );
}
