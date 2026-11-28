import Link from "next/link";
import { anni } from "@/lib/dati";

const PAGINE: Record<string, { titolo: string; riga: string }> = {
  "/che-cose": { titolo: "Che cos'è", riga: "Come funziona l'affidamento dei servizi di accoglienza e cosa raccoglie questo archivio." },
  "/quanto-costa": { titolo: "Quanto costa", riga: "Il costo giornaliero per persona nei centri, anno per anno e provincia per provincia." },
  "/dieci-anni": { titolo: "Leggi e numeri", riga: `Le leggi sull'accoglienza e i numeri dal ${anni[0]} al ${anni[anni.length - 1]}, anno per anno.` },
  "/paesi": { titolo: "Da dove arrivano", riga: "I richiedenti asilo in Italia per paese di cittadinanza." },
  "/minori": { titolo: "Minori non accompagnati", riga: "I minori stranieri non accompagnati presenti in Italia, regione per regione." },
  "/metodologia": { titolo: "Metodologia e limiti", riga: "Le fonti, i criteri di selezione, cosa viene contato e cosa no." },
};

/** Blocco di fine pagina con tre rinvii ad altre pagine del sito. */
export default function ContinuaALeggere({ pagine }: { pagine: (keyof typeof PAGINE)[] }) {
  return (
    <section className="sezione continua" aria-labelledby="continua-titolo">
      <h2 className="titolo-sezione" id="continua-titolo">Continua a leggere</h2>
      <ul>
        {pagine.map((p) => (
          <li key={p}>
            <Link href={p}>{PAGINE[p].titolo} →</Link>
            <span>{PAGINE[p].riga}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
