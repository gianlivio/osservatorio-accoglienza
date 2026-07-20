import Link from "next/link";

export const metadata = { title: "Che cos'è · Osservatorio Accoglienza" };

export default function CheCose() {
  return (
    <main>
      <Link href="/" className="indietro">← vai ai dati</Link>
      <p className="occhiello">In parole semplici</p>
      <h1 className="tesi">Che cos&apos;è <em>questo sito</em>.</h1>

      <div className="prosa">
        <p>
          Quando in Italia arriva una persona che chiede asilo, qualcuno deve darle un posto
          dove dormire, da mangiare, qualcuno che la segua. Lo Stato questo lavoro non lo fa
          da sé: lo compra da cooperative e associazioni.
        </p>
        <p>
          Funziona come quando il Comune deve rifare una strada e chiama un&apos;impresa. Si fa
          un contratto, si stabilisce un prezzo, si firma. Ogni contratto di questo tipo è
          pubblico: chiunque potrebbe andare a vederlo.
        </p>
        <p>
          Il problema è che &laquo;chiunque potrebbe&raquo; non vuol dire &laquo;qualcuno lo
          fa&raquo;. Quei contratti sono migliaia, scritti in un linguaggio che capiscono solo
          gli addetti ai lavori, sparsi in archivi diversi. Per sapere chi si occupa
          dell&apos;accoglienza nella tua provincia, e a quali condizioni, oggi servono
          settimane di richieste agli uffici.
        </p>
        <p>
          Questo sito prende quei contratti, li mette in ordine e li scrive in modo leggibile.
          Provincia per provincia: quanti sono, quanto valgono, chi li ha ricevuti, se sono
          stati assegnati con una gara oppure scegliendo direttamente.
        </p>
        <p>
          Non dice se le cose vanno bene o male. Non accusa nessuno. Mostra i numeri e lascia
          che ognuno se ne faccia un&apos;idea: un giornalista che vuole scrivere sulla propria
          città, un operatore che vuole capire perché nel suo centro mancano le risorse, un
          cittadino che vuole sapere dove finiscono i soldi pubblici.
        </p>
        <p>
          Tutto quello che c&apos;è dentro viene da archivi ufficiali. Chiunque può controllare
          che i conti tornino.
        </p>
      </div>

      <section className="sezione">
        <h2 className="titolo-sezione">Due parole che ricorrono</h2>
        <dl className="glossario">
          <dt>Affidamento</dt>
          <dd>
            Il contratto con cui un ufficio pubblico incarica qualcuno di svolgere un servizio.
            Qui: gestire un centro, seguire un minore, trovare un alloggio.
          </dd>
          <dt>Con gara</dt>
          <dd>
            L&apos;ufficio pubblica un bando, più soggetti si candidano, vince chi presenta
            l&apos;offerta migliore.
          </dd>
          <dt>Affidamento diretto</dt>
          <dd>
            L&apos;ufficio sceglie direttamente a chi dare il lavoro, senza bando. Sotto una
            certa cifra la legge lo permette: serve a fare presto quando la somma è piccola.
          </dd>
          <dt>Ente gestore</dt>
          <dd>
            Chi riceve l&apos;incarico e svolge il servizio: quasi sempre una cooperativa
            sociale, un&apos;associazione o una fondazione.
          </dd>
        </dl>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Cosa non troverai qui</h2>
        <p className="avviso">
          Nomi di persone accolte, indirizzi di strutture, denunce, opinioni. Solo contratti
          pubblici e cifre, con l&apos;indicazione di dove ciascuna è stata presa. Se un numero
          sembra strano, la pagina <Link href="/metodologia">Metodologia e limiti</Link> spiega
          perché può esserlo.
        </p>
      </section>
    </main>
  );
}
