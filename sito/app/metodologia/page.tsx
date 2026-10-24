import Link from "next/link";
import JsonLd from "@/app/JsonLd";
import ScaricaCsv from "@/app/ScaricaCsv";
import { centri } from "@/lib/centri";
import { breadcrumb } from "@/lib/jsonld";
import { totale, anni, serieAnni, euro, province, nItal } from "@/lib/dati";

export const metadata = { title: "Metodologia e limiti · Osservatorio Accoglienza" };

export default function Metodologia() {
  const primo = anni[0], ultimo = anni[anni.length - 1];
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
          mantenute come nella fonte. Per il SAI si usa il file dei progetti, completo per tutti
          gli anni: nel {centri.sai_ultimo_anno.anno} le presenze risultano{" "}
          {nItal(centri.sai_ultimo_anno.presenze_progetti)}, contro{" "}
          {nItal(centri.sai_ultimo_anno.presenze_strutture)} nel totale pubblicato, calcolato sul
          file delle strutture.
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
          {" "}{totale.copertura_vincitore}% dei casi, ma prima del 2024 mancava per la
          maggioranza. Le comunicazioni arrivano anche con anni di ritardo, quindi gli anni più
          recenti sono ancora provvisori.
        </p>
        <p>
          Dei {nItal(totale.affidamenti)} contratti dell&apos;archivio, {nItal(senzaProvincia)} non
          indicano la provincia nei dati ANAC: compaiono nei totali nazionali, nei file CSV e
          nelle pagine degli enti, ma non nelle pagine delle province.
        </p>
        <p>
          Le regole su cosa vada registrato sono cambiate. Dal 2024 entrano nell&apos;archivio
          anche i contratti di piccolo importo, prima quasi assenti. Poiché questi sono quasi
          sempre affidati senza gara, il loro ingresso fa salire la quota di affidamenti
          diretti: sembra una crescita, ma è cambiato solo cosa viene contato. La tabella tiene
          separate le due letture — tutti i contratti, e i soli sopra i 40.000 euro, presenti
          in archivio anche prima e quindi confrontabili nel tempo.
        </p>
        <table className="tabella">
          <caption className="sr-only">Confronto anno per anno tra tutti i contratti e i soli contratti sopra i 40.000 euro</caption>
          <thead>
            <tr>
              <th>Anno</th>
              <th className="num">Contratti</th><th className="num">Senza gara</th>
              <th className="num">Da 40.000 €</th><th className="num">Senza gara</th>
            </tr>
          </thead>
          <tbody>
            {serieAnni.map((a) => (
              <tr key={a.anno}>
                <td>{a.anno}</td>
                <td className="num">{nItal(a.affidamenti)}</td>
                <td className="num">{a.quota_diretti}%</td>
                <td className="num">{nItal(a.affidamenti_40k)}</td>
                <td className="num">{a.quota_diretti_40k !== null ? `${a.quota_diretti_40k}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">I dati</h2>
        <p className="nota-tabella">
          Tutti i contratti dell&apos;archivio in un unico file. Ogni provincia ha anche il suo
          file, nella pagina della provincia.
        </p>
        <ScaricaCsv percorso="/dati/contratti.csv" />
      </section>
    </main>
  );
}
