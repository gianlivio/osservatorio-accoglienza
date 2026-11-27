import Italia3DLoader from "./Italia3DLoader";
import Italia3DStatico from "./Italia3DStatico";
import { slug, nomeProvincia, pct } from "@/lib/dati";
import { intervalli, minima, massima } from "@/lib/italiaDati";

// Figura della home: province in tre dimensioni, con la didascalia.
export default function FiguraItalia() {
  return (
    <figure className="figura-italia">
      <Italia3DLoader>
        <Italia3DStatico />
      </Italia3DLoader>
      <figcaption>
        <p className="mappa-spiega">Più la provincia è scura, più contratti sono stati assegnati con affidamento diretto.</p>
        <ul className="mappa-legenda" aria-label="Legenda: quota di contratti con affidamento diretto">
          {intervalli.map((c) => (
            <li key={c.k}><i className={`m-c${c.k}`} aria-hidden="true" />da {pct(c.da)} a {pct(c.a)}</li>
          ))}
        </ul>
        <p className="mappa-range">
          Va da {pct(minima.quota)} a <a href={`/provincia/${slug(minima.nome)}`} className="link-interno">{nomeProvincia(minima.nome)}</a> a{" "}
          {pct(massima.quota)} a <a href={`/provincia/${slug(massima.nome)}`} className="link-interno">{nomeProvincia(massima.nome)}</a>.
        </p>
      </figcaption>
    </figure>
  );
}
