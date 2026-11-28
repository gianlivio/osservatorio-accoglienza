import IndiceAttivo from "./IndiceAttivo";

export type Voce = { id: string; titolo: string };

/** Indice delle sezioni della pagina: chiuso in cima al contenuto su schermi stretti,
 *  aperto nella colonna a sinistra su schermi larghi (CSS); IndiceAttivo segna la sezione in lettura. */
export default function IndicePagina({ voci }: { voci: Voce[] }) {
  if (voci.length < 3) return null;
  return (
    <nav className="indice" aria-label="Sezioni della pagina">
      <details>
        <summary>In questa pagina</summary>
        <ol>
          {voci.map((v) => (
            <li key={v.id}><a href={`#${v.id}`}>{v.titolo}</a></li>
          ))}
        </ol>
      </details>
      <IndiceAttivo ids={voci.map((v) => v.id)} />
    </nav>
  );
}
