import Link from "next/link";
import { notFound } from "next/navigation";
import ElencoContratti from "@/app/ElencoContratti";
import { province, trovaProvincia, slug as mkSlug, euro, anni, nItal } from "@/lib/dati";

const NOMI_MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
function formatPeriodo(periodo: string) {
  const [anno, mese] = periodo.split("-");
  return `${NOMI_MESI[+mese - 1]} ${anno}`;
}

export function generateStaticParams() {
  return province.map((p) => ({ slug: mkSlug(p.provincia) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = trovaProvincia(slug);
  if (!p) return {};
  return { title: `${p.provincia} · Osservatorio Accoglienza` };
}

export default async function Provincia({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = trovaProvincia(slug);
  if (!p) notFound();
  const t = p.totale;
  const mesiDati = Object.entries(p.per_mese)
    .filter((voce): voce is [string, NonNullable<(typeof voce)[1]>] => voce[1] !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  const maxMese = Math.max(...mesiDati.map(([, m]) => m.affidamenti), 1);

  return (
    <main>
      <Link href="/" className="indietro">← tutte le province</Link>
      <p className="occhiello">Provincia · {anni[0]}–{anni[anni.length - 1]}</p>
      <h1 className="tesi">{p.provincia}</h1>

      <section className="sezione">
        <h2 className="titolo-sezione">Totale {anni[0]}–{anni[anni.length - 1]}</h2>
        <div className="cifre">
          <div className="cifra"><b>{t.affidamenti}</b><span>contratti firmati</span></div>
          <div className="cifra"><b>{t.diretti}</b><span>assegnati senza gara ({t.quota_diretti}%)</span></div>
          <div className="cifra"><b>{euro(t.importo_mediano)}</b><span>importo mediano</span></div>
          <div className="cifra"><b>{t.canale_prefettura}</b><span>firmati dalla Prefettura</span></div>
          <div className="cifra"><b>{t.canale_ente_locale}</b><span>firmati da comuni o enti locali</span></div>
          <div className="cifra"><b>{t.prosecuzioni}</b><span>rinnovi di contratti già in corso</span></div>
        </div>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Anno per anno</h2>
        <table className="tabella">
          <caption className="sr-only">Andamento anno per anno di contratti, quota senza gara, valore tipico ed enti diversi</caption>
          <thead>
            <tr><th>Anno</th><th className="num">Contratti</th><th className="num">Senza gara</th>
            <th className="num">Valore tipico</th><th className="num">Enti diversi</th></tr>
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
          Gli anni non sono confrontabili tra loro. Fino al 2023 molti contratti di piccolo
          importo non venivano registrati nell&apos;archivio pubblico, e i contratti
          pluriennali compaiono solo nell&apos;anno in cui vengono firmati. Un anno con pochi
          contratti non significa poca accoglienza: la <Link href="/metodologia">Metodologia</Link>{" "}spiega perché.
        </p>
      </section>

      {mesiDati.length > 0 && (
        <section className="sezione">
          <h2 className="titolo-sezione">Mese per mese</h2>
          <p className="nota-tabella">
            Ogni barra è un mese: la parte piena indica i contratti assegnati senza gara.
          </p>
          <div className="mesi" role="img"
            aria-label={`Contratti mese per mese a ${p.provincia}, da ${formatPeriodo(mesiDati[0][0])} a ${formatPeriodo(mesiDati[mesiDati.length - 1][0])}: massimo ${nItal(maxMese)} in un mese`}>
            {mesiDati.map(([periodo, m]) => (
              <div key={periodo} className="mese" style={{ height: `${(m.affidamenti / maxMese) * 100}%` }}>
                <i style={{ height: `${m.quota_diretti}%` }} />
              </div>
            ))}
          </div>
          <div className="assi-mesi">
            <span>{formatPeriodo(mesiDati[0][0])}</span>
            <span>{nItal(maxMese)} in un mese</span>
            <span>{formatPeriodo(mesiDati[mesiDati.length - 1][0])}</span>
          </div>
        </section>
      )}

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
          <h2 className="titolo-sezione">Enti gestori · {p.anni_enti.join(" e ")}</h2>
          <table className="tabella">
            <caption className="sr-only">Enti gestori e numero di contratti ricevuti</caption>
            <thead><tr><th>Ente</th><th className="num">Contratti</th></tr></thead>
            <tbody>{p.top_enti.map((e) => (
              <tr key={e.nome}><td>{e.nome}</td><td className="num">{e.affidamenti}</td></tr>
            ))}</tbody>
          </table>
        </section>
      )}

      {p.rapporti_ricorrenti.length > 0 && (
        <section className="sezione">
          <h2 className="titolo-sezione">Assegnazioni ripetute allo stesso ente</h2>
          <table className="tabella">
            <caption className="sr-only">Amministrazioni ed enti con assegnazioni dirette ripetute</caption>
            <thead><tr><th>Amministrazione</th><th>Ente</th><th className="num">Volte</th></tr></thead>
            <tbody>{p.rapporti_ricorrenti.map((r, i) => (
              <tr key={i}><td>{r.amministrazione}</td><td>{r.ente}</td>
              <td className="num">{r.affidamenti_diretti}</td></tr>
            ))}</tbody>
          </table>
          <p className="avviso">
            Ogni riga conta quante volte lo stesso ufficio ha assegnato un contratto allo
            stesso ente senza gara, nel {p.anni_enti.join(" e ")}. Assegnare direttamente sotto
            una certa cifra è una procedura prevista dalla legge.
          </p>
        </section>
      )}
    </main>
  );
}
