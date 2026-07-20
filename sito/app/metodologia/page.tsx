import Link from "next/link";
import { totale, anni, serieAnni, euro } from "@/lib/dati";

export const metadata = { title: "Metodologia e limiti · Osservatorio Accoglienza" };

export default function Metodologia() {
  return (
    <main>
      <Link href="/" className="indietro">← torna all&apos;archivio</Link>
      <p className="occhiello">Come sono costruiti questi dati</p>
      <h1 className="tesi">Metodologia <em>e limiti</em></h1>
      <p className="sommario">
        Questo archivio è ricostruito da fonti pubbliche con un metodo automatico.
        Ha errori noti e lacune note. Sono descritti qui perché chi usa i dati
        sappia cosa può e cosa non può concluderne.
      </p>

      <section className="sezione">
        <h2 className="titolo-sezione">La fonte</h2>
        <p>
          I dati provengono dai dataset aperti dell&apos;Autorità Nazionale Anticorruzione,
          Banca Dati Nazionale dei Contratti Pubblici: gli identificativi di gara (CIG),
          le aggiudicazioni e gli aggiudicatari. Sono uniti tra loro tramite il codice CIG.
          L&apos;archivio copre le procedure pubblicate dal {anni[0]} al {anni[anni.length - 1]}.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Il perimetro</h2>
        <p>
          Non esiste un codice che identifichi &laquo;accoglienza migranti&raquo;. Il perimetro
          è ricostruito combinando i codici CPV dei servizi sociali con la ricerca di
          espressioni nell&apos;oggetto della gara. Alcune espressioni valgono da sole
          (minori stranieri non accompagnati, richiedenti asilo, SPRAR, SIPROIMI); altre,
          più ambigue, richiedono anche un codice CPV compatibile. Ogni affidamento è
          marcato come <strong>certo</strong> o <strong>probabile</strong> secondo quale
          regola lo ha incluso.
        </p>
        <p className="avviso">
          Il metodo produce sia falsi positivi sia esclusioni. Parole come
          &laquo;accoglienza&raquo; ricorrono nel welfare, nel turismo e nell&apos;edilizia
          militare; sigle come SAI indicano anche impianti ferroviari. Ogni correzione
          è tracciata nel repository pubblico del progetto.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Cosa misura, e cosa no</h2>
        <p>
          L&apos;archivio conta <strong>gli affidamenti pubblicati in un anno</strong>, non
          l&apos;accoglienza attiva sul territorio. Un servizio affidato nel 2023 per un
          triennio compare nel 2023 e non negli anni successivi, pur essendo tuttora in
          corso. Una provincia con pochi affidamenti può quindi avere molta accoglienza
          gestita con contratti pluriennali stipulati prima.
        </p>
        <p>
          Per la stessa ragione il numero di affidamenti non è una misura del numero di
          persone accolte, né della spesa sostenuta. Gli importi non vanno sommati: gli
          accordi quadro riportano un tetto di spesa pluriennale, non l&apos;esborso effettivo.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Le lacune della fonte</h2>
        <p>
          La banca dati contiene ciò che le stazioni appaltanti trasmettono, e la
          trasmissione è manuale. L&apos;ANAC stessa avverte che i dati possono contenere
          errori di inserimento o dettagli mancanti. Ricognizioni indipendenti hanno
          documentato contratti per i quali mancano importo di aggiudicazione, ribasso e
          perfino l&apos;identità dell&apos;aggiudicatario. In questo archivio l&apos;aggiudicatario
          è noto per il {totale.copertura_vincitore}% degli affidamenti: per il resto
          il dato non è stato comunicato.
        </p>
        <p>
          Le comunicazioni possono arrivare con mesi o anni di ritardo rispetto alla data
          della procedura. I conteggi degli anni più recenti sono quindi destinati a
          crescere nel tempo, e vanno letti come provvisori.
        </p>
        <p>
          Anche le soglie contano. Gli affidamenti diretti sotto i 5.000 euro sono entrati
          nel regime ordinario di comunicazione solo dal 1° ottobre 2024, e alcuni canali
          di pubblicazione riguardano i soli contratti sopra i 40.000 euro. Un sistema
          fatto di micro-affidamenti ripetuti risulta perciò sottorappresentato.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Perché gli anni non sono confrontabili</h2>
        <p>
          Le regole su quali contratti debbano essere registrati sono cambiate. Dal 2024
          l&apos;uso di piattaforme certificate è obbligatorio anche per gli affidamenti di
          piccolo importo, che prima seguivano procedure semplificate e in larga parte non
          producevano una scheda consultabile. Dal 2024 entrano quindi nell&apos;archivio
          migliaia di contratti piccoli che negli anni precedenti non c&apos;erano.
        </p>
        <p>
          Poiché i contratti piccoli sono quasi sempre assegnati senza gara, il loro ingresso
          fa salire la percentuale di affidamenti diretti anche se il comportamento delle
          amministrazioni non è cambiato. La tabella mostra le due serie affiancate: a
          sinistra tutti i contratti, a destra i soli contratti da 40.000 euro in su, che
          erano registrati anche prima e sono quindi confrontabili nel tempo.
        </p>
        <table className="tabella">
          <thead>
            <tr>
              <th>Anno</th>
              <th className="num">Contratti</th><th className="num">Senza gara</th>
              <th className="num">Da 40.000 €</th><th className="num">Senza gara</th>
              <th className="num">Esiti noti</th>
            </tr>
          </thead>
          <tbody>
            {serieAnni.map((a) => (
              <tr key={a.anno}>
                <td>{a.anno}</td>
                <td className="num">{a.affidamenti}</td>
                <td className="num">{a.quota_diretti}%</td>
                <td className="num">{a.affidamenti_40k}</td>
                <td className="num">{a.quota_diretti_40k !== null ? `${a.quota_diretti_40k}%` : "—"}</td>
                <td className="num">{a.copertura_esito}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="avviso">
          Sulla colonna confrontabile la percentuale oscilla senza una direzione: era già
          oltre il 60% nel 2018, era scesa sotto il 40% nel 2020, ed è tornata intorno al 58%
          negli ultimi due anni. Chi volesse leggerci una tendenza usando la colonna di
          sinistra otterrebbe una crescita che nei fatti non c&apos;è.
        </p>
        <p>
          L&apos;ultima colonna misura per quanti contratti l&apos;archivio riporta anche
          l&apos;esito, cioè importo aggiudicato e soggetto vincitore. Prima del 2024 il dato
          manca per circa due contratti su tre: per questo gli elenchi degli enti gestori sono
          calcolati solo sugli anni {anni.slice(-2).join(" e ")}.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Come usare questi dati</h2>
        <p>
          Servono a formulare domande, non a rispondere. Un numero anomalo indica dove
          guardare: non dimostra un&apos;irregolarità. L&apos;affidamento diretto sotto soglia è
          una procedura prevista dal codice dei contratti pubblici, e la ripetizione di
          affidamenti allo stesso soggetto non è di per sé un illecito.
        </p>
        <p>
          Ogni cifra è verificabile risalendo al CIG nella banca dati dell&apos;ANAC. Il codice
          che produce questo archivio è pubblico: chi trova un errore può segnalarlo o
          correggerlo.
        </p>
      </section>
    </main>
  );
}
