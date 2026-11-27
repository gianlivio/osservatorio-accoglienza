import Link from "next/link";
import Intestazione from "@/app/Intestazione";
import JsonLd from "@/app/JsonLd";
import ScaricaCsv from "@/app/ScaricaCsv";
import { centri } from "@/lib/centri";
import { ATTO_AVELLINO, ATTO_CAPITOLATO, POCKET_MONEY } from "@/lib/capitolato";
import { breadcrumb } from "@/lib/jsonld";
import { metadatiPagina } from "@/lib/metadati";
import { sicuri, dalData } from "@/lib/paesiSicuri";
import { dati as datiPaesi, paesi as elencoPaesi, periodoPaesi } from "@/lib/paesi";
import msnaAttesi from "@/data/msna-attesi.json";
import { ingressi, cifreApprossimate, totale2024Implicato } from "@/lib/msnaIngressi";
import { msnaData, totale, anni, serieAnni, euro, euroCent, province, nItal, esclusiAMano, pct, dataLunga } from "@/lib/dati";

export const metadata = metadatiPagina(
  "Metodologia e limiti · Osservatorio Accoglienza",
  "Come è costruito l'archivio: le fonti (ANAC, Centri d'Italia), i criteri di selezione, cosa viene contato e cosa no, i limiti.",
);

const REPO = "https://github.com/gianlivio/osservatorio-accoglienza";
const PORTALE = "https://dati.anticorruzione.it/opendata/dataset";
// Cifre che non stanno nei dati del sito, riportate dalla fonte o dal vecchio errore e dichiarate nel testo.
const SEMESTRALE_2022 = 20287; // rapporto semestrale del Ministero al 30 giugno 2023, p. 13, riga del 31 dicembre 2022
const ERRORE_2016_12 = 1165, ERRORE_2021_12 = 333; // totali delle sole minori, letti per errore

export default function Metodologia() {
  const primo = anni[0], ultimo = anni[anni.length - 1];
  const ue = datiPaesi.fonti.eurostat, uc = datiPaesi.fonti.ucdp, cu = datiPaesi.confronto_unhcr;
  const senzaProvincia = totale.affidamenti - province.reduce((n, p) => n + p.totale.affidamenti, 0);
  const anniIngressi = Object.keys(ingressi.anni).sort();
  const costa = ingressi.anni[anniIngressi[0]].cittadinanze.find((c) => c.nome === "Costa d'Avorio")!;
  const mensile = (periodo: string) => msnaData.nazionale.find((p) => p.periodo === periodo)!.presenti;
  return (
    <main>
      <JsonLd dati={breadcrumb([{ nome: "Metodologia e limiti", percorso: "/metodologia" }])} />
      <Intestazione ritorno="torna all'archivio">Come è fatto questo archivio</Intestazione>
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
          I tre dataset usati — <a href={`${PORTALE}/cig`} target="_blank" rel="noopener" className="link-interno">CIG</a>,{" "}
          <a href={`${PORTALE}/aggiudicazioni`} target="_blank" rel="noopener" className="link-interno">aggiudicazioni</a> e{" "}
          <a href={`${PORTALE}/aggiudicatari`} target="_blank" rel="noopener" className="link-interno">aggiudicatari</a> — sono pubblicati
          dal portale dei dati aperti dell&apos;ANAC con licenza{" "}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener" className="link-interno">Creative Commons Attribution Share-Alike 4.0</a>{" "}
          (CC BY-SA 4.0), come indicato nella pagina di ciascun dataset; verificato il {dataLunga("2026-11-25")}. I dati derivati di questo sito hanno la stessa licenza.
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
          I confini di province e regioni nelle figure in rilievo (home, Quanto costa, Minori) sono quelli dell&apos;ISTAT: confini delle
          unità amministrative a fini statistici, versione generalizzata al 1° gennaio 2025
          (licenza{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/deed.it" target="_blank" rel="noopener" className="link-interno">CC BY 4.0</a>), semplificati per il sito con lo script script/mappa.py.
        </p>
        <p>
          Nella pagina <Link href="/quanto-costa">Quanto costa l&apos;accoglienza</Link> e nel sottopancia di <Link href="/che-cose">Che cos&apos;è</Link> la cifra di{" "}
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
        <p>
          La quota di affidamento diretto conta solo i contratti che nel campo <code>tipo_scelta_contraente</code> della banca dati ANAC riportano
          «AFFIDAMENTO DIRETTO»: non comprende la procedura negoziata, il cottimo fiduciario né l&apos;affidamento riservato. Lo stesso criterio vale per l&apos;etichetta
          «affidamento diretto» nell&apos;elenco dei contratti delle pagine delle province e degli enti, nel feed RSS e nel file CSV: cottimo fiduciario e affidamento
          riservato hanno ciascuno la propria etichetta, uguale al valore ANAC. Per ogni provincia e per ogni ente i contratti con l&apos;etichetta «affidamento diretto» sono
          quelli del numeratore della quota: se non coincidono, la build si ferma.
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
          in archivio anche prima e quindi confrontabili nel tempo. Le pagine delle province hanno la stessa lettura: la tabella «Anno per anno» ha la colonna «Da 40.000 € in su».
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

      <section className="sezione" id="minori">
        <h2 className="titolo-sezione">Minori non accompagnati</h2>
        <p>
          I dati sui minori stranieri non accompagnati presenti in Italia vengono dal Ministero del Lavoro e delle Politiche Sociali e sono usati nella pagina{" "}
          <Link href="/minori" className="link-interno">Minori non accompagnati</Link>. Le fonti sono due. Fino a dicembre 2022 i report mensili danno i presenti per
          regione ({nItal(msnaData.regioni.length)} regioni e province autonome) e il totale nazionale; dal 2023 i rapporti semestrali danno il totale nazionale e le
          cittadinanze citate nel testo, senza il dettaglio per regione.
        </p>
        <p>
          Le due serie non coincidono per la stessa data e non vanno mescolate: al 31 dicembre 2022 il report mensile indica {nItal(mensile("2022-12"))} minori presenti, il rapporto
          semestrale {nItal(SEMESTRALE_2022)} (rapporto al 30 giugno 2023, p. 13). Nel grafico e nelle tabelle le due serie sono tenute separate.
        </p>
        <p>
          <b>Cittadinanze.</b> Per il 2016–2022 si usa la tabella completa del report di dicembre. Per il 2023–2025 solo le cittadinanze citate nel testo del rapporto di dicembre,
          che sono le prime: le altre non sono pubblicate.
        </p>
        <p>
          <b>Controlli.</b> Se uno non torna, lo script <code>script/estrai_msna.py</code> si ferma e la build fallisce. {nItal(msnaAttesi.length)} totali nazionali sono letti a mano dai report
          e conservati in <code>sito/data/msna-attesi.json</code>: il valore estratto deve coincidere. Per ogni mese la somma delle regioni deve essere uguale al totale nazionale.
          Per le cittadinanze, il totale della tabella e la somma delle cittadinanze (con la riga delle altre, dove c&apos;è) devono essere uguali al totale nazionale di dicembre; le
          percentuali devono corrispondere ai numeri; per i rapporti semestrali le cittadinanze devono essere in ordine decrescente, con somma non oltre il totale, e la percentuale delle
          prime cittadinanze citate nel testo uguale a quella calcolata.
        </p>
        <p id="ingressi-minori">
          <b>Come sono entrati.</b> La sezione «Come sono entrati» di <Link href="/minori#come-sono-entrati" className="link-interno">Minori non accompagnati</Link> usa solo i rapporti semestrali del Ministero del Lavoro
          al 31 dicembre {anniIngressi.join(", ")}, paragrafo «Dati di flusso – Ingressi e uscite di competenza», che riferiscono le cifre all&apos;intero anno solare. I rapporti di giugno sono esclusi perché danno
          solo il primo semestre. Il Ministero divide gli ingressi in «eventi di sbarco» e «ritrovamenti nel territorio italiano, compresi quelli effettuati negli scali aeroportuali e marittimi e nei valichi terrestri»;
          non distingue tra arrivi via terra e via aerea. Per ogni cifra il file <code>sito/data/msna-ingressi.json</code> riporta il testo del rapporto e la pagina. Le cittadinanze sono quelle che il rapporto cita,
          nel suo ordine; la quota via mare è quella scritta nel rapporto (per l&apos;Afghanistan nel 2023 il rapporto dà solo la quota per rotte terrestri). Il rapporto non dà il numero di minori via mare per cittadinanza.
        </p>
        <p>
          <b>Cifre approssimate.</b> Sono riportate come nel testo del rapporto: {cifreApprossimate().map((c, i) => (
            <span key={i}>{i > 0 && "; "}{c.anno}, {c.voce}: {c.testo}</span>
          ))}. Nelle tabelle la barra usa il valore numerico.
        </p>
        <p>
          <b>Controlli degli ingressi.</b> La build si ferma se una quota non è tra 0 e 100, se in un anno gli ingressi via mare superano gli ingressi totali o se la somma degli ingressi per cittadinanza supera il totale.
          Numero e percentuale scritti insieme devono essere coerenti: scarto al più 0,1 punti, 0,5 punti se la percentuale è scritta senza decimali (arrotondamento), più l&apos;incertezza del numero se è «oltre» o
          «quasi» un numero di migliaia. Un&apos;incoerenza del rapporto è ammessa solo se dichiarata e se l&apos;altra cifra del rapporto torna.
        </p>
        <p>
          <b>Incoerenze nei rapporti del Ministero.</b> Costa d&apos;Avorio, {anniIngressi[0]}: a p. {costa.pagina} il rapporto scrive {nItal(costa.ingressi)} minori e {costa.quota_ingressi.valore.toLocaleString("it-IT")}%; a p. {costa.incoerenza!.altra_pagina} scrive
          {" "}{nItal(costa.incoerenza!.altro_valore)} minori. {nItal(costa.incoerenza!.altro_valore)} corrisponde al {costa.quota_ingressi.valore.toLocaleString("it-IT")}% del totale degli ingressi, {nItal(costa.ingressi)} no. Totale 2024: {nItal(ingressi.anni["2024"].ingressi_totali.valore)} nel
          rapporto 2024; il rapporto 2025 scrive che gli ingressi 2025 sono +{nItal(ingressi.confronto_2024_nel_rapporto_2025.differenza)} unità rispetto al 2024, cioè {nItal(totale2024Implicato)} per il 2024. Il sito usa per ogni anno la cifra del proprio rapporto.
        </p>
        <p id="correzione-minori">
          <b>Correzione del 25 novembre 2026.</b> Fino a quella data il grafico e le linee per regione da giugno 2016 a dicembre 2021 mostravano i totali delle sole minori di genere
          femminile, letti per errore da una seconda tabella con lo stesso titolo: dicembre 2016 era {nItal(ERRORE_2016_12)} invece di {nItal(mensile("2016-12"))}, dicembre 2021 {nItal(ERRORE_2021_12)} invece
          di {nItal(mensile("2021-12"))}. Lo script è stato corretto (
          <a href={`${REPO}/commit/c296664040461ed6ffd188d1f41fb85f819f48de`} target="_blank" rel="noopener" className="link-interno">commit della correzione</a>) e i controlli
          sopra (<a href={`${REPO}/commit/484afd2bcd0d9289dceac78b60e11761513c1992`} target="_blank" rel="noopener" className="link-interno">commit dei controlli</a>) impediscono che si ripeta.
        </p>
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
          <b>Confronto con UNHCR.</b> Eurostat è stato confrontato con i dati UNHCR (Refugee Data Finder, API pubblica) sull&apos;Italia, per domande, decisioni totali e decisioni positive
          (riconosciute e altre), nelle celle con almeno una cifra di {nItal(cu.soglia)}. La mediana dello scarto assoluto è {pct(cu.misure.domande.mediana_pct)} per le domande,{" "}
          {pct(cu.misure.decisioni.mediana_pct)} per le decisioni totali, {pct(cu.misure["decisioni positive"].mediana_pct)} per le decisioni positive; gli scarti oltre il 20% sono
          {" "}{nItal(cu.misure.domande.oltre_20_pct)} su {nItal(cu.misure.domande.celle)}, {nItal(cu.misure.decisioni.oltre_20_pct)} su {nItal(cu.misure.decisioni.celle)} e{" "}
          {nItal(cu.misure["decisioni positive"].oltre_20_pct)} su {nItal(cu.misure["decisioni positive"].celle)}. I cinque scarti maggiori:{" "}
          {cu.maggiori.map((m, i) => (
            <span key={i}>{i > 0 && "; "}{m.paese} {m.anno}, {m.misura}, Eurostat {nItal(m.eurostat)} e UNHCR {nItal(m.unhcr)}</span>
          ))}.
          Per le decisioni positive, nei casi più grandi la cifra UNHCR è vicina a quella di Eurostat senza i motivi umanitari. È un&apos;ipotesi, non verificata: la definizione UNHCR di decisione positiva non è stata letta,
          e le pagine di metodologia e di licenza del sito UNHCR non erano raggiungibili. Per questo le cifre UNHCR non sono usate nelle pagine dei paesi.
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
        <p>
          <b>Globo.</b> I contorni sono quelli di world-atlas {datiPaesi.contorni.versione} (countries-110m, derivato da Natural Earth, pubblico dominio). Il punto di partenza di ogni
          arco è il centroide del poligono principale del paese, o, se cade fuori dal territorio, il punto interno più vicino
          (<code>script/coordinate.mjs</code>). L&apos;arco è un cerchio massimo, sollevato sopra la superficie per essere leggibile: non rappresenta il percorso del
          viaggio. Lo spessore è proporzionale alla radice quadrata dei richiedenti asilo dell&apos;anno (Eurostat), con la stessa scala per tutti gli anni.
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
