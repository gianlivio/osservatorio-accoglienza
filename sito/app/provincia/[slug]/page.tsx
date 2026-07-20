import Link from "next/link";
import { notFound } from "next/navigation";
import ElencoContratti from "@/app/ElencoContratti";
import ElencoContratti from "@/app/ElencoContratti";
import { province, trovaProvincia, slug as mkSlug, euro, anni } from "@/lib/dati";

export function generateStaticParams() {
  return province.map((p) => ({ slug: mkSlug(p.provincia) }));
}

export default async function Provincia({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = trovaProvincia(slug);
  if (!p) notFound();
  const t = p.totale;

  return (
    <main>
      <Link href="/" className="indietro">← tutte le province</Link>
      <p className="occhiello">Provincia · {anni[0]}–{anni[anni.length - 1]}</p>
      <h1 className="tesi">{p.provincia}</h1>

      <section className="sezione">
        <h2 className="titolo-sezione">Totale {anni[0]}–{anni[anni.length - 1]}</h2>
        <div className="cifre">
          <div className="cifra"><b>{t.affidamenti}</b><span>affidamenti registrati</span></div>
          <div className="cifra"><b>{t.diretti}</b><span>diretti ({t.quota_diretti}%)</span></div>
          <div className="cifra"><b>{euro(t.importo_mediano)}</b><span>importo mediano</span></div>
          <div className="cifra"><b>{t.canale_prefettura}</b><span>dal canale prefettizio</span></div>
          <div className="cifra"><b>{t.canale_ente_locale}</b><span>da comuni ed enti locali</span></div>
          <div className="cifra"><b>{t.prosecuzioni}</b><span>proroghe o prosecuzioni</span></div>
        </div>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Anno per anno</h2>
        <table className="tabella">
          <thead>
            <tr><th>Anno</th><th className="num">Affidamenti</th><th className="num">Diretti</th>
            <th className="num">Importo mediano</th><th className="num">Enti</th></tr>
          </thead>
          <tbody>
            {anni.map((a) => {
              const b = p.per_anno[a];
              return (
                <tr key={a}>
                  <td>{a}</td>
                  <td className="num">{b ? b.affidamenti : "—"}</td>
                  <td className="num">{b ? `${b.quota_diretti}%` : "—"}</td>
                  <td className="num">{b ? euro(b.importo_mediano) : "—"}</td>
                  <td className="num">{b ? b.enti_gestori : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="avviso">
          Un anno con pochi affidamenti non indica poca accoglienza: i contratti pluriennali
          compaiono solo nell&apos;anno in cui vengono stipulati.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">I contratti, uno per uno</h2>
        <p className="nota-tabella">
          In ordine dal più recente. Ogni voce riporta quanto risulta nell&apos;archivio
          pubblico: dove il dato non è stato comunicato, la riga non compare.
        </p>
        <ElencoContratti contratti={p.contratti} />
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">I contratti, uno per uno</h2>
        <p className="nota-tabella">
          In ordine dal più recente. Ogni voce riporta quanto risulta nell&apos;archivio
          pubblico: dove il dato non è stato comunicato, la riga non compare.
        </p>
        <ElencoContratti contratti={p.contratti} />
      </section>

      {p.top_enti.length > 0 && (
        <section className="sezione">
          <h2 className="titolo-sezione">Enti gestori · {t.enti_gestori} soggetti nei tre anni</h2>
          <table className="tabella">
            <thead><tr><th>Ente</th><th className="num">Affidamenti</th></tr></thead>
            <tbody>{p.top_enti.map((e) => (
              <tr key={e.nome}><td>{e.nome}</td><td className="num">{e.affidamenti}</td></tr>
            ))}</tbody>
          </table>
        </section>
      )}

      {p.rapporti_ricorrenti.length > 0 && (
        <section className="sezione">
          <h2 className="titolo-sezione">Affidamenti diretti ripetuti</h2>
          <table className="tabella">
            <thead><tr><th>Amministrazione</th><th>Ente</th><th className="num">Volte</th></tr></thead>
            <tbody>{p.rapporti_ricorrenti.map((r, i) => (
              <tr key={i}><td>{r.amministrazione}</td><td>{r.ente}</td>
              <td className="num">{r.affidamenti_diretti}</td></tr>
            ))}</tbody>
          </table>
          <p className="avviso">
            Ogni riga conta quante volte, nel periodo, la stessa amministrazione ha disposto
            un affidamento diretto verso lo stesso ente. L&apos;affidamento diretto sotto
            soglia è una procedura prevista dal codice dei contratti pubblici.
          </p>
        </section>
      )}
    </main>
  );
}
