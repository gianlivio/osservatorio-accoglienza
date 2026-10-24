import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/app/JsonLd";
import { slug as mkSlug, euro, nomeProvincia, totale } from "@/lib/dati";
import { enti, trovaEnte, caricaEnte, type EnteDettaglio } from "@/lib/enti";
import { breadcrumb } from "@/lib/jsonld";
import { metadatiPagina } from "@/lib/metadati";
import { nomeEnte } from "@/lib/nomi";

export function generateStaticParams() {
  return enti.map((e) => ({ slug: e.slug }));
}

const periodo = (d: EnteDettaglio) => {
  const anni = Object.keys(d.per_anno);
  return anni.length > 1 ? `${anni[0]}–${anni[anni.length - 1]}` : anni[0];
};

function descrizione(d: EnteDettaglio) {
  const anni = Object.keys(d.per_anno);
  const quando = anni.length > 1 ? `dal ${anni[0]} al ${anni[anni.length - 1]}` : `nel ${anni[0]}`;
  const dove = d.province.length === 0 ? ""
    : d.province.length === 1 ? ` in provincia di ${nomeProvincia(d.province[0].provincia)}`
    : ` in ${d.province.length} province`;
  const n = `${d.affidamenti} ${d.affidamenti === 1 ? "contratto" : "contratti"}`;
  return `${n} ${quando}${dove}, ${d.diretti} senza gara. Importi e uffici che hanno assegnato, da dati ANAC.`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = trovaEnte(slug);
  if (!e) return {};
  const d = await caricaEnte(slug);
  return metadatiPagina(`${nomeEnte(e.nome)}: contratti per l'accoglienza dei migranti · Osservatorio Accoglienza`, descrizione(d));
}

export default async function Ente({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = trovaEnte(slug);
  if (!e) notFound();
  const d = await caricaEnte(slug);

  return (
    <main>
      <JsonLd dati={breadcrumb([{ nome: nomeEnte(e.nome), percorso: `/ente/${slug}` }])} />
      <Link href="/" className="indietro">← tutte le province</Link>
      <p className="occhiello">Ente gestore · {periodo(d)}</p>
      <h1 className="tesi">{nomeEnte(e.nome)}</h1>
      <p className="sommario">
        L&apos;aggiudicatario è noto per il {totale.copertura_vincitore.toLocaleString("it-IT")}% dei
        contratti dell&apos;archivio: questo elenco comprende solo quelli.
      </p>

      <section className="sezione">
        <h2 className="titolo-sezione">Totale</h2>
        <div className="cifre">
          <div className="cifra"><b>{d.affidamenti}</b><span>contratti firmati</span></div>
          <div className="cifra"><b>{d.diretti}</b><span>assegnati senza gara ({d.quota_diretti}%)</span></div>
          <div className="cifra"><b>{d.province.length}</b><span>{d.province.length === 1 ? "provincia" : "province"}</span></div>
        </div>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Anno per anno</h2>
        <table className="tabella">
          <caption className="sr-only">Contratti e quota senza gara dell&apos;ente, anno per anno</caption>
          <thead><tr><th>Anno</th><th className="num">Contratti</th><th className="num">Senza gara</th></tr></thead>
          <tbody>{Object.entries(d.per_anno).map(([a, b]) => (
            <tr key={a}><td>{a}</td><td className="num">{b.affidamenti}</td><td className="num">{b.quota_diretti}%</td></tr>
          ))}</tbody>
        </table>
      </section>

      {d.province.length > 0 && (
        <section className="sezione">
          <h2 className="titolo-sezione">Province</h2>
          <p>
            {d.province.map((p, i) => (
              <span key={p.provincia}>
                {i > 0 && " · "}
                <Link href={`/provincia/${mkSlug(p.provincia)}`} className="link-interno">{nomeProvincia(p.provincia)}</Link>
                {" "}({p.affidamenti})
              </span>
            ))}
          </p>
        </section>
      )}

      <section className="sezione">
        <h2 className="titolo-sezione">I contratti, uno per uno</h2>
        <p className="nota-tabella">In ordine dal più recente.</p>
        <ul className="contratti">
          {d.contratti.map((c, i) => (
            <li key={c.cig + "-" + i} className="contratto">
              <div className="riga-alta"><span className="data-c">{c.data}</span></div>
              <p className="oggetto">{c.oggetto}</p>
              <dl className="dettagli">
                {c.provincia && (
                  <div><dt>Provincia</dt><dd>
                    <Link href={`/provincia/${mkSlug(c.provincia)}`} className="link-interno">{nomeProvincia(c.provincia)}</Link>
                  </dd></div>
                )}
                <div><dt>Ufficio</dt><dd>{c.amministrazione}</dd></div>
                <div><dt>Importo a bando</dt><dd>{euro(c.base)}</dd></div>
                {c.aggiudicato !== null && <div><dt>Importo assegnato</dt><dd>{euro(c.aggiudicato)}</dd></div>}
                <div><dt>Procedura</dt><dd>{c.procedura.toLowerCase()}</dd></div>
                <div><dt>Codice gara</dt><dd className="mono">{c.cig}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
