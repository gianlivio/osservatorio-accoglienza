import Link from "next/link";
import Figura3D from "./Figura3D";
import { anni, senzaProvincia, slug, nomeProvincia, nItal, pct } from "@/lib/dati";
import { intervalli, minima, massima } from "@/lib/italiaDati";

const nSenzaProvincia = Object.values(senzaProvincia).reduce((n, a) => n + a.affidamenti, 0);

// Figura della home: province in tre dimensioni, con la didascalia.
export default function FiguraItalia() {
  return (
    <Figura3D nome="home">
        <p className="mappa-didascalia">
          Altezza: contratti per l&apos;accoglienza firmati dal {anni[0]} al {anni[anni.length - 1]} (ANAC). Colore: quota assegnata con affidamento diretto.
        </p>
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
        <p className="mappa-range">
          Le province con pochi contratti hanno quote meno stabili: il numero di contratti di ogni provincia compare{" "}
          <span className="solo-largo">passando sopra</span><span className="solo-stretto">toccando</span> la mappa.
        </p>
        <p className="mappa-range">
          Non sono compresi i {nItal(nSenzaProvincia)} contratti che nei dati ANAC non indicano la provincia.{" "}
          <Link href="/metodologia#senza-provincia" className="link-interno">Come sono trattati</Link>
        </p>
    </Figura3D>
  );
}
