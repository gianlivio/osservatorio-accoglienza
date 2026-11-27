import { Fragment } from "react";
import Link from "next/link";
import SchermoTv from "./SchermoTv";
import tv from "@/data/tv.json";
import { notizie } from "@/lib/tv";
import { ANNO_CAPITOLATO, ATTO_CAPITOLATO } from "@/lib/capitolato";

/** Televisore di /che-cose: foto da Wikimedia Commons e sottopancia con le cifre del sito. */
export default function Televisore() {
  const cifre = notizie();
  const prima = tv.immagini[0];
  // il secondo elenco serve solo allo scorrimento continuo
  const elenco = (copia: boolean) => (
    <ul className={copia ? "tv-copia" : undefined} aria-hidden={copia || undefined}>
      {cifre.map((c) => (
        <li key={c.href}><Link href={c.href} prefetch={false} tabIndex={copia ? -1 : undefined}>{c.testo}</Link></li>
      ))}
    </ul>
  );
  return (
    <figure className="figura-a-lato">
      <div className="tv">
        <svg className="tv-antenna" viewBox="0 0 120 36" aria-hidden="true">
          <path d="M60 36 22 4M60 36 98 4" />
          <circle cx="22" cy="4" r="3.5" /><circle cx="98" cy="4" r="3.5" />
        </svg>
        <div className="tv-mobile">
          <div className="tv-schermo">
            <SchermoTv immagini={tv.immagini.map(({ file, alt }) => ({ file, alt }))} />
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={prima.file} width={prima.larghezza} height={prima.altezza} alt={prima.alt} loading="lazy" />
            </noscript>
          </div>
          <div className="tv-sottopancia" aria-label="Cifre del sito">
            <div className="tv-nastro">{elenco(false)}{elenco(true)}</div>
          </div>
          <div className="tv-comandi" aria-hidden="true"><i /><i /><span /></div>
        </div>
      </div>
      <figcaption>
        <p className="tv-crediti">
          Immagini da Wikimedia Commons, {tv.modifiche}:{" "}
          {tv.immagini.map((i, n) => (
            <Fragment key={i.file}>
              {n > 0 && "; "}
              <a href={i.pagina} target="_blank" rel="noopener" title={i.alt}>{i.autore}</a>,{" "}
              <a href={i.licenza_url} target="_blank" rel="noopener license">{i.licenza}</a>
            </Fragment>
          ))}.
        </p>
        <p className="tv-crediti">
          Cifre: dati di questo sito. Il pocket money viene dallo schema di capitolato del Ministero dell&apos;Interno del {ANNO_CAPITOLATO}{" "}
          (<a href={ATTO_CAPITOLATO} target="_blank" rel="noopener">atto della Prefettura di Chieti</a>), non dai dati.
        </p>
      </figcaption>
    </figure>
  );
}
