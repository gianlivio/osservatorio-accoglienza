import Link from "next/link";
import { COLORE, numero, type Continente, type PaeseGlobo } from "@/lib/globoGeom";

const CONTINENTI: Continente[] = ["Africa", "Asia", "America", "Europa"];

/** Legenda del globo: tutti i paesi dell'anno con i richiedenti, in ordine decrescente. Senza stato: serve al globo e alla sua versione statica. */
export default function LegendaGlobo({ paesi, anno, attivo, onEntra, onEsce }: {
  paesi: PaeseGlobo[]; anno: string; attivo?: string | null; onEntra?: (slug: string) => void; onEsce?: () => void;
}) {
  const righe = [...paesi].sort((a, b) => b.richiedenti[anno] - a.richiedenti[anno] || a.nome.localeCompare(b.nome, "it"));
  return (
    <div className="globo-legenda">
      <p className="globo-chiave" aria-label="Colori per continente">
        {CONTINENTI.map((c) => <span key={c}><i style={{ background: COLORE[c] }} aria-hidden="true" />{c}</span>)}
      </p>
      <p className="globo-legenda-titolo">Richiedenti asilo in Italia nel {anno}</p>
      <ol>
        {righe.map((p) => (
          <li key={p.slug} className={attivo === p.slug ? "attivo" : undefined}>
            <Link href={`/paesi/${p.slug}`} prefetch={false} onMouseEnter={onEntra && (() => onEntra(p.slug))} onMouseLeave={onEsce}
              onFocus={onEntra && (() => onEntra(p.slug))} onBlur={onEsce}>
              <i style={{ background: COLORE[p.continente] }} aria-hidden="true" />
              <span className="nome">{p.nome}</span>
              <span className="n">{numero(p.richiedenti[anno])}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function DidascaliaGlobo() {
  return (
    <p className="globo-didascalia">
      Ogni arco collega il paese di cittadinanza all&apos;Italia: non è il percorso del viaggio. Spessore: richiedenti asilo in Italia nell&apos;anno (Eurostat).
      Lo spessore è proporzionale alla radice quadrata dei richiedenti, con un minimo di 1 px, e la scala è la stessa per tutti gli anni.
      Contorni: Natural Earth, tramite world-atlas.
    </p>
  );
}
