import Link from "next/link";
import JsonLd from "@/app/JsonLd";
import ScaricaCsv from "@/app/ScaricaCsv";
import { centri } from "@/lib/centri";
import { ATTO_AVELLINO, ATTO_CAPITOLATO, POCKET_MONEY } from "@/lib/capitolato";
import { breadcrumb } from "@/lib/jsonld";
import { metadatiPagina } from "@/lib/metadati";
import { sicuri, dalData } from "@/lib/paesiSicuri";
import { dati as datiPaesi, paesi as elencoPaesi, periodoPaesi } from "@/lib/paesi";
import { totale, anni, serieAnni, euro, euroCent, province, nItal, esclusiAMano, pct, dataLunga } from "@/lib/dati";

export const metadata = metadatiPagina(
  "Metodologia e limiti · Osservatorio Accoglienza",
  "Come è costruito l'archivio: le fonti (ANAC, Centri d'Italia), i criteri di selezione, cosa viene contato e cosa no, i limiti.",
);

export default function Metodologia() {
  const primo = anni[0], ultimo = anni[anni.length - 1];
  const ue = datiPaesi.fonti.eurostat, uc = datiPaesi.fonti.ucdp, cu = datiPaesi.confronto_unhcr;
  const senzaProvincia = totale.affidamenti - province.reduce((n, p) => n + p.totale.affidamenti, 0);
  return (
    <main>
      <JsonLd dati={breadcrumb([{ nome: "Metodologia e limiti", percorso: "/metodologia" }])} />
      <Link href="/" className="indietro">← torna all&apos;archivio</Link>
      <p className="occhiello">Come è fatto questo archivio</p>
      <h1 className="tesi">Metodologia <em>e limiti</em></h1>
      <p className="sommario">
        Questi dati sono ricostruiti da fonti pubbliche con un metodo automatico. Hanno errori
        e buchi, descritti qui sotto. Chi li usa deve sapere cosa possono dire e cosa no.
      </p>

      <section className="sezione">
        <h2 className="titolo-sezione">La fonte</h2>
        <p>
          I dati vengono dalla banca dati dell&apos;Autorità Nazionale Anticorruzione, dove
          finiscono tutti i contratti pubblici italiani: le gare, le aggiudicazioni, i nomi di
          chi vince. Sono collegati tra loro dal codice di gara che accompagna ogni contratto.
          L&apos;archivio copre gli anni dal {primo} al {ultimo}.
        </p>
        <p>
          I dati su posti, presenze e costi dei centri vengono da Centri d&apos;Italia, di ActionAid
          e Openpolis, che li raccoglie con richieste di accesso agli atti a prefetture e
          ministeri, con aggiornamento annuale (licenza CC BY 4.0). I dati sui contratti vengono
          invece da ANAC e si aggiornano ogni mese. Le due fonti coprono periodi diversi e non
          vanno confrontate direttamente. Per CAS e prima accoglienza le cifre coincidono con
          quelle pubblicate da Centri d&apos;Italia; i file contengono alcune righe ripetute,
          mantenute come nella fonte. Per il SAI si usa il file dei progetti, disponibile per tutti
          gli anni: nel {centri.sai_ultimo_anno.anno} le presenze risultano{" "}
          {nItal(centri.sai_ultimo_anno.presenze_progetti)}, contro{" "}
          {nItal(centri.sai_ultimo_anno.presenze_strutture)} nel totale pubblicato, calcolato sul
          file delle strutture.
        </p>
        <p>
          I confini delle province nella mappa della home sono quelli dell&apos;ISTAT: confini delle
          unità amministrative a fini statistici, versione generalizzata al 1° gennaio 2025
          (licenza{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/deed.it" target="_blank" rel="noopener" className="link-interno">CC BY 4.0</a>), semplificati per il sito con lo script script/mappa.py.
        </p>
        <p>
          Nella pagina <Link href="/quanto-costa">Quanto costa l&apos;accoglienza</Link> la cifra di{" "}
          {euroCent(POCKET_MONEY)} al giorno per persona per il pocket money non viene dai nostri dati: è
          riportata da un atto della Prefettura di Chieti (
          <a href={ATTO_CAPITOLATO} target="_blank" rel="noopener" className="link-interno">decisione di contrarre</a>,
          protocollo n. 41889 del 10 maggio 2024). L&apos;obbligo di versarlo in denaro viene da un atto della
          Prefettura di Avellino (
          <a href={ATTO_AVELLINO} target="_blank" rel="noopener" className="link-interno">determinazione a contrarre</a>,
          protocollo n. 36387 del 22 aprile 2024). Entrambi applicano lo schema di capitolato del
          Ministero dell&apos;Interno approvato con decreto del 4 marzo 2024. Sono le uniche informazioni di
          quella pagina prese da fonti esterne; i due atti sono i documenti ufficiali linkati qui e nella pagina.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Cosa è accoglienza e cosa no</h2>
        <p>
          Nessun codice, nella banca dati, dice &laquo;questo contratto riguarda
          l&apos;accoglienza dei migranti&raquo;. Bisogna riconoscerlo. Lo facciamo incrociando
          i codici dei servizi sociali con le parole che compaiono nell&apos;oggetto del
          contratto: alcune bastano da sole, come &laquo;minori stranieri non
          accompagnati&raquo; o &laquo;richiedenti asilo&raquo;; altre contano solo se
          accompagnate dal codice giusto. Ogni contratto è segnato come <strong>certo</strong>
          {" "}o <strong>probabile</strong> a seconda della regola che lo ha fatto entrare.
        </p>
        <p>
          Il metodo sbaglia in due modi. Fa entrare contratti che non c&apos;entrano —
          &laquo;accoglienza&raquo; ricorre nel welfare e nel turismo, la sigla SAI indica
          anche impianti ferroviari — e ne lascia fuori altri, scritti in modo insolito. Ogni
          correzione è annotata nel codice pubblico del progetto.
        </p>
        <p>
          Alcuni contratti selezionati dal filtro ma estranei all&apos;accoglienza
          ({nItal(esclusiAMano)}) sono esclusi a mano: l&apos;elenco, con il motivo di ciascuno,
          è nel file{" "}
          <a href="https://github.com/gianlivio/osservatorio-accoglienza/blob/main/script/esclusi.csv"
            target="_blank" rel="noopener" className="link-interno">script/esclusi.csv</a>{" "}
          del repository.
        </p>
        <p>
          Una distinzione in particolare: i corsi di formazione professionale rivolti a
          migranti — cucina, saldatura, alfabetizzazione — non sono contati come accoglienza,
          anche quando fanno parte di un progetto SAI. L&apos;archivio raccoglie i contratti
          per ospitare le persone, non quelli per formarle. Un contratto che unisce le due
          cose resta incluso; uno che riguarda solo la formazione no.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Cosa conta, e cosa no</h2>
        <p>
          L&apos;archivio conta i contratti firmati in un anno, non l&apos;accoglienza attiva
          sul territorio. Un servizio affidato nel 2023 per tre anni compare nel 2023 e non
          più: una provincia con pochi contratti può averne molti ancora in corso, firmati
          prima.
        </p>
        <p>
          Per la stessa ragione il numero di contratti non dice quante persone sono accolte, né
          quanto si è speso. Gli importi non vanno sommati: negli accordi quadro indicano un
          tetto di spesa su più anni, non i soldi effettivamente usati.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Cosa manca</h2>
        <p>
          La banca dati contiene quello che le amministrazioni comunicano, e la comunicazione è
          manuale: l&apos;ANAC stessa avverte che i dati possono avere errori o buchi. Per una
          parte dei contratti manca il nome di chi ha vinto — oggi è noto nel
          {" "}{pct(totale.copertura_vincitore)} dei casi, ma prima del 2024 mancava per la
          maggioranza. Le comunicazioni arrivano anche con anni di ritardo, quindi gli anni più
          recenti sono ancora provvisori.
        </p>
        <p id="senza-provincia">
          Dei {nItal(totale.affidamenti)} contratti dell&apos;archivio, {nItal(senzaProvincia)} non
          indicano la provincia nei dati ANAC: compaiono nei totali nazionali, nei file CSV e
          nelle pagine degli enti, ma non nelle pagine delle province.
        </p>
        <p>
          Le regole su cosa vada registrato sono cambiate. Dal 2024 entrano nell&apos;archivio
          anche i contratti di piccolo importo, prima quasi assenti. Poiché questi sono quasi
          sempre assegnati con affidamento diretto, il loro ingresso fa salire la quota di contratti
          con affidamento diretto: sembra una crescita, ma è cambiato solo cosa viene contato. La tabella tiene
          separate le due letture — tutti i contratti, e i soli sopra i 40.000 euro, presenti
          in archivio anche prima e quindi confrontabili nel tempo.
        </p>
        <table className="tabella">
          <caption className="sr-only">Confronto anno per anno tra tutti i contratti e i soli contratti sopra i 40.000 euro</caption>
          <thead>
            <tr>
              <th>Anno</th>
              <th className="num">Contratti</th><th className="num">Affidamento diretto</th>
              <th className="num">Da 40.000 €</th><th className="num">Affidamento diretto</th>
            </tr>
          </thead>
          <tbody>
            {serieAnni.map((a) => (
              <tr key={a.anno}>
                <td>{a.anno}</td>
                <td className="num">{nItal(a.affidamenti)}</td>
                <td className="num">{pct(a.quota_diretti)}</td>
                <td className="num">{nItal(a.affidamenti_40k)}</td>
                <td className="num">{a.quota_diretti_40k !== null ? pct(a.quota_diretti_40k) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="sezione" id="paesi">
        <h2 className="titolo-sezione">Paesi di provenienza</h2>
        <p>
          Le pagine <Link href="/paesi" className="link-interno">Da dove arrivano</Link> riguardano {elencoPaesi.length} paesi: quelli comparsi tra le prime dieci
          cittadinanze dei minori presenti (Ministero del Lavoro) o degli sbarcati (Ministero dell&apos;Interno) dal 2016, o dei richiedenti asilo in Italia (Eurostat) in un anno dal 2015.
          Il terzo criterio è controllato a ogni aggiornamento: se una cittadinanza entra tra le prime dieci dei richiedenti e non è tra i paesi, lo script e la build si fermano. Gli anni sono {periodoPaesi}.
        </p>
        <p>
          <b>Richiedenti asilo e decisioni.</b> Eurostat, dati per l&apos;Italia: tabelle {ue.richiedenti.dataset} (richiedenti), {ue.decisioni.dataset} (decisioni di prima istanza per tipo)
          e {ue.minori.dataset} (minori non accompagnati richiedenti), sesso ed età totali. Estratti il {dataLunga(datiPaesi.estratto)}; ultimo aggiornamento della tabella delle decisioni:{" "}
          {dataLunga(ue.decisioni.aggiornamento)}. Eurostat arrotonda i valori a multipli di {ue.arrotondamento} e, nel file scaricato, un valore assente non ha un simbolo: qui un valore assente
          fermerebbe la build. Licenza CC BY 4.0; i dati sono rielaborati da questo sito.
        </p>
        <p>
          <b>Controlli.</b> Sono tre, e se uno non torna la build si ferma. Il totale delle decisioni dell&apos;Italia nel 2025 è {nItal(datiPaesi.italia["2025"].totale)}, la cifra pubblicata
          dall&apos;Asylum Information Database (AIDA) su dati Eurostat: l&apos;unica cifra esterna ai dati di questa sezione, usata solo per il controllo. Per ogni paese e anno, il totale delle decisioni e la
          somma dei quattro tipi (status di rifugiato, protezione sussidiaria, motivi umanitari, rifiuti) possono differire al più di 10, per l&apos;arrotondamento a {ue.arrotondamento}.
          Ogni paese ha tutti gli anni {periodoPaesi} in tutte e tre le tabelle Eurostat.
        </p>
        <p>
          <b>Confronto con UNHCR.</b> Ho confrontato Eurostat con i dati UNHCR (Refugee Data Finder, API pubblica) sull&apos;Italia, per domande, decisioni totali e decisioni positive
          (riconosciute e altre), nelle celle con almeno una cifra di {nItal(cu.soglia)}. La mediana dello scarto assoluto è {pct(cu.misure.domande.mediana_pct)} per le domande,{" "}
          {pct(cu.misure.decisioni.mediana_pct)} per le decisioni totali, {pct(cu.misure["decisioni positive"].mediana_pct)} per le decisioni positive; gli scarti oltre il 20% sono
          {" "}{nItal(cu.misure.domande.oltre_20_pct)} su {nItal(cu.misure.domande.celle)}, {nItal(cu.misure.decisioni.oltre_20_pct)} su {nItal(cu.misure.decisioni.celle)} e{" "}
          {nItal(cu.misure["decisioni positive"].oltre_20_pct)} su {nItal(cu.misure["decisioni positive"].celle)}. I cinque scarti maggiori:{" "}
          {cu.maggiori.map((m, i) => (
            <span key={i}>{i > 0 && "; "}{m.paese} {m.anno}, {m.misura}, Eurostat {nItal(m.eurostat)} e UNHCR {nItal(m.unhcr)}</span>
          ))}.
          Per le decisioni positive, nei casi più grandi la cifra UNHCR è vicina a quella di Eurostat senza i motivi umanitari. È un&apos;ipotesi, non verificata: non ho potuto leggere
          la definizione UNHCR di decisione positiva, e le pagine di metodologia e di licenza del sito UNHCR non erano raggiungibili. Per questo le cifre UNHCR non sono usate nelle pagine dei paesi.
          Il Kosovo non è confrontabile: UNHCR lo riporta insieme alla Serbia.
        </p>
        <p>
          <b>Conflitti armati.</b> Uppsala Conflict Data Program (UCDP), versione {uc.versione}, licenza {uc.licenza}: Battle-related Deaths (morti in combattimenti tra forze armate, per conflitto e anno),
          One-sided Violence (morti per violenza di un governo o di un gruppo organizzato contro civili) e Non-state Conflict (morti in conflitti tra gruppi non statali). Si usa la stima migliore.
          UCDP include un conflitto solo se causa almeno {uc.soglia_morti} morti in un anno: un anno senza riga non significa zero morti. Si sommano per paese e anno le sole righe riferite a un paese; le
          righe che riguardano più paesi insieme non si attribuiscono a nessuno e nelle pagine sono segnalate a parte.
        </p>
        <p id="paesi-sicuri">
          <b>Elenco italiano dei paesi di origine sicuri.</b> Dal {dataLunga(sicuri.primo_elenco_dal)} l&apos;elenco è stabilito da {nItal(sicuri.atti.length)} atti successivi; ogni pagina lo ricostruisce per il suo paese dai testi, non da fonti secondarie. Fino al 23 ottobre 2024 l&apos;art. 2-bis, comma 1, del d.lgs. 28 gennaio 2008, n. 25, rinviava a un decreto del Ministro degli affari esteri, di concerto con Interno e Giustizia;
          dal 24 ottobre 2024 l&apos;elenco è scritto nella legge. Gli atti, in ordine:
        </p>
        <ul className="elenco-atti">
          {sicuri.atti.map((a) => (
            <li key={a.id}>
              <a href={a.url} target="_blank" rel="noopener" className="link-interno">{a.titolo}</a>, {a.pubblicazione.fonte} del {dataLunga(a.pubblicazione.data)}, {nItal(a.elenco.length)} paesi; in applicazione {dalData(a.in_applicazione_dal)} ({a.regola_inizio}).
            </li>
          ))}
        </ul>
        <p>
          La data di inizio di ogni decreto è calcolata come il quindicesimo giorno dopo la pubblicazione in Gazzetta Ufficiale, come scritto nel decreto; la data di fine di un elenco è il giorno prima dell&apos;inizio del successivo.
          Il decreto-legge 158/2024 è stato abrogato dalla legge 9 dicembre 2024, n. 187, che ne ha fatto salvi gli effetti: dall&apos;11 dicembre 2024 la stessa lista è nell&apos;art. 12-bis del decreto-legge 145/2024, come convertito. Il testo vigente dell&apos;art. 2-bis è su Normattiva, verificato il {dataLunga(sicuri.controllato)}.
          {sicuri.atti.find((a) => a.premessa) && <> Il decreto-legge 158/2024 premette: «{sicuri.atti.find((a) => a.premessa)!.premessa}».</>}
        </p>
        <p>
          {sicuri.eccezioni_atti} Le eccezioni sono nella <a href={sicuri.relazione.url} target="_blank" rel="noopener" className="link-interno">{sicuri.relazione.breve}</a>: a {sicuri.relazione.pagina} scrive che «per taluni dei Paesi in elenco sono state applicate alla designazione» eccezioni «per categorie di persone o per parti di territorio», nel paragrafo sul decreto 17 marzo 2023.
          La Relazione non dice per quali paesi né quali eccezioni, e nessun&apos;altra sua pagina le riporta per paese: per questo le pagine dei paesi presenti nell&apos;elenco dal 9 aprile 2023 riportano la frase della Relazione e quella sola, e i paesi entrati dopo non hanno una frase («non indicate nella fonte» nel file dei dati).
          Il decreto-legge 158/2024 ha soppresso dal comma 2 dell&apos;art. 2-bis le parole «{sicuri.norma_eccezioni.soppresso}»: dal {dataLunga(sicuri.norma_eccezioni.dal)} la designazione può avere eccezioni solo per categorie di persone. La Relazione scrive che Camerun, Colombia e Nigeria sono state tolte dall&apos;elenco per le situazioni di criticità presenti in parte dei loro territori. Le norme transitorie dei decreti 2023 e 2024 (art. 4, comma 1) sono riportate nella pagina dei paesi interessati. La colonna «Paese sicuro» dà lo stato al 31 dicembre di ogni anno: «—» prima del {dataLunga(sicuri.primo_elenco_dal)}, quando non c&apos;era un elenco.
          Questo sito non pubblica l&apos;elenco dei paesi di origine sicuri dell&apos;Unione europea.
        </p>
        <p>
          <b>Minori presenti.</b> Dal file della cittadinanza dei minori (vedi <Link href="/minori" className="link-interno">Minori non accompagnati</Link>): compare solo se il paese è tra le
          cittadinanze riportate dal report del 31 dicembre; dal 2023 i report riportano solo le prime.
        </p>
        <p>
          <b>ecoi.net.</b> Ogni pagina rinvia alla pagina del paese su ecoi.net; il sito non ne riprende i testi.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">I dati</h2>
        <p className="nota-tabella">
          Tutti i contratti dell&apos;archivio in un unico file. Ogni provincia ha anche il suo
          file, nella pagina della provincia.
        </p>
        <ScaricaCsv percorso="/dati/contratti.csv" />
        <p className="nota-tabella">
          I feed RSS, <a href="/feed.xml" className="link-interno">nazionale</a> e per provincia,
          si aggiornano con i dati, una volta al mese.
        </p>
      </section>
    </main>
  );
}
