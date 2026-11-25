import mappa from "@/data/mappa.json";
import { anni, province, slug, nomeProvincia, nItal } from "@/lib/dati";

const CLASSI = 5;
const perc = (n: number) => `${n.toLocaleString("it-IT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
const tracciati = mappa.province as Record<string, { sigla: string; d: string }>;

// Mappa a classi della quota di contratti con affidamento diretto, totale dell'archivio.
// SVG statico: ogni provincia è un link, il tracciato è già semplificato da script/mappa.py.
export default function MappaItalia() {
  const righe = province
    .map((p) => ({ nome: p.provincia, quota: p.totale.quota_diretti, n: p.totale.affidamenti }))
    .filter((r) => tracciati[r.nome]);
  const ordinate = righe.map((r) => r.quota).sort((a, b) => a - b);
  // Classi per quantili: ogni classe raccoglie circa lo stesso numero di province.
  const soglie = Array.from({ length: CLASSI - 1 }, (_, k) => ordinate[Math.ceil(((k + 1) * ordinate.length) / CLASSI) - 1]);
  const classe = (q: number) => { const i = soglie.findIndex((s) => q <= s); return i === -1 ? CLASSI - 1 : i; };
  const intervalli = Array.from({ length: CLASSI }, (_, k) => {
    const v = righe.filter((r) => classe(r.quota) === k).map((r) => r.quota);
    return { k, da: Math.min(...v), a: Math.max(...v), n: v.length };
  });
  const minima = righe.reduce((m, r) => (r.quota < m.quota ? r : m));
  const massima = righe.reduce((m, r) => (r.quota > m.quota ? r : m));
  const alt =
    `Mappa d'Italia: quota di contratti con affidamento diretto per provincia, totale dell'archivio, in ${CLASSI} classi. ` +
    `Va da ${perc(minima.quota)} a ${nomeProvincia(minima.nome)} a ${perc(massima.quota)} a ${nomeProvincia(massima.nome)}. ` +
    `Ogni provincia è un link alla sua pagina.`;
  const [w, h] = mappa.viewBox;

  return (
    <section className="sezione sezione-mappa">
      <h2 className="titolo-sezione mappa-titolo">Contratti con affidamento diretto, provincia per provincia</h2>
      <p className="nota-tabella mappa-nota">
        Quota dei contratti assegnati con affidamento diretto, sul totale dei contratti
        dell&apos;archivio ({anni[0]}–{anni[anni.length - 1]}). Cliccando una provincia si apre la sua pagina.
        Le classi hanno più o meno lo stesso numero di province.
      </p>
      <figure className="mappa">
        <svg viewBox={`0 0 ${w} ${h}`} role="group" aria-label={alt}>
          <title>{alt}</title>
          {righe.map((r) => (
            <a key={r.nome} href={`/provincia/${slug(r.nome)}`}>
              <path className={`m-c${classe(r.quota)}`} d={tracciati[r.nome].d}>
                <title>{`${nomeProvincia(r.nome)}: ${perc(r.quota)} con affidamento diretto (${nItal(r.n)} contratti)`}</title>
              </path>
            </a>
          ))}
        </svg>
      </figure>
      <p className="mappa-range">
        Va da {perc(minima.quota)} a <a href={`/provincia/${slug(minima.nome)}`} className="link-interno">{nomeProvincia(minima.nome)}</a> a{" "}
        {perc(massima.quota)} a <a href={`/provincia/${slug(massima.nome)}`} className="link-interno">{nomeProvincia(massima.nome)}</a>.
      </p>
      <p className="mappa-spiega">Più la provincia è scura, più contratti sono stati assegnati con affidamento diretto.</p>
      <ul className="mappa-legenda" aria-label="Legenda: quota di contratti con affidamento diretto">
        {intervalli.map((c) => (
          <li key={c.k}><i className={`m-c${c.k}`} aria-hidden="true" />da {perc(c.da)} a {perc(c.a)}</li>
        ))}
      </ul>
      <p className="nota-tabella mappa-avviso">
        Le province con pochi contratti hanno quote meno stabili: il numero di contratti di ogni
        provincia compare passando sopra la mappa.
      </p>
    </section>
  );
}
