import Link from "next/link";
import { notFound } from "next/navigation";
import ElencoContratti from "@/app/ElencoContratti";
import JsonLd from "@/app/JsonLd";
import ScaricaCsv from "@/app/ScaricaCsv";
import { creatore, dominio, fonteAnac, fonteCentri, licenza, breadcrumb, distribuzioneCsv } from "@/lib/jsonld";
import { metadatiPagina } from "@/lib/metadati";
import { nomeEnte } from "@/lib/nomi";
import { slugEnteDaCf } from "@/lib/enti";
import { centri } from "@/lib/centri";
import { regioneDi, regioni } from "@/lib/regioni";
import { province, trovaProvincia, caricaDettaglioProvincia, slug as mkSlug, euro, anni, nItal, euroCent, nomeProvincia, descrizioneProvincia } from "@/lib/dati";

const NOMI_MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const MESI_LUNGHI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto",
  "settembre", "ottobre", "novembre", "dicembre"];
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
  const title = `${nomeProvincia(p.provincia)}: contratti per l'accoglienza dei migranti ${anni[0]}–${anni[anni.length - 1]} · Osservatorio Accoglienza`;
  const description = descrizioneProvincia(p);
  return metadatiPagina(title, description);
}

export default async function Provincia({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = trovaProvincia(slug);
  if (!p) notFound();
  const d = await caricaDettaglioProvincia(slug);
  const t = p.totale;
  const mesiDati = Object.entries(d.per_mese)
    .filter((voce): voce is [string, NonNullable<(typeof voce)[1]>] => voce[1] !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  const maxMese = Math.max(...mesiDati.map(([, m]) => m.affidamenti), 1);
  const c = centri.province[p.provincia] ?? {};
  const dataIt = (iso: string) => {
    const [a, m, g] = iso.split("-");
    return `${+g} ${MESI_LUNGHI[+m - 1]} ${a}`;
  };
  const sai31dic = (a: string) => centri.rilevazioni_sai[a]?.endsWith("-12-31");
  const regione = regioneDi(p.provincia);
  const altre = regione ? regioni[regione].filter((n) => n !== p.provincia) : [];

  const nome = nomeProvincia(p.provincia);
  const url = `${dominio}/provincia/${slug}`;
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Contratti per l'accoglienza dei migranti: ${nome}, ${anni[0]}–${anni[anni.length - 1]}`,
    description: descrizioneProvincia(p),
    url,
    creator: creatore,
    license: licenza,
    isAccessibleForFree: true,
    spatialCoverage: { "@type": "Place", name: `${nome}, Italia` },
    temporalCoverage: `${anni[0]}/${anni[anni.length - 1]}`,
    isBasedOn: [fonteAnac, fonteCentri],
    distribution: distribuzioneCsv(`/dati/provincia/${slug}.csv`),
    citation: "Autorità Nazionale Anticorruzione (ANAC), Banca Dati Nazionale dei Contratti Pubblici",
  };

  return (
    <main>
      <JsonLd dati={datasetJsonLd} />
      <JsonLd dati={breadcrumb([{ nome, percorso: `/provincia/${slug}` }])} />
      <Link href="/" className="indietro">← tutte le province</Link>
      <p className="occhiello">Provincia · {anni[0]}–{anni[anni.length - 1]}</p>
      <h1 className="tesi">{nomeProvincia(p.provincia)}</h1>

      <section className="sezione">
        <h2 className="titolo-sezione">Totale {anni[0]}–{anni[anni.length - 1]}</h2>
        <div className="cifre">
          <div className="cifra"><b>{nItal(t.affidamenti)}</b><span>contratti firmati</span></div>
          <div className="cifra"><b>{nItal(t.diretti)}</b><span>assegnati senza gara ({t.quota_diretti}%)</span></div>
          <div className="cifra"><b>{euro(t.importo_mediano)}</b><span>importo mediano</span></div>
          <div className="cifra"><b>{nItal(t.canale_prefettura)}</b><span>firmati dalla Prefettura</span></div>
          <div className="cifra"><b>{nItal(t.canale_ente_locale)}</b><span>firmati da comuni o enti locali</span></div>
          <div className="cifra"><b>{nItal(t.prosecuzioni)}</b><span>rinnovi di contratti già in corso</span></div>
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
                  <td className="num">{b ? nItal(b.affidamenti) : "—"}</td>
                  <td className="num">{b ? `${b.quota_diretti}%` : "—"}</td>
                  <td className="num">{b ? euro(b.importo_mediano) : "—"}</td>
                  <td className="num">{b ? nItal(b.enti_gestori) : "—"}</td>
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
            aria-label={`Contratti mese per mese a ${nomeProvincia(p.provincia)}, da ${formatPeriodo(mesiDati[0][0])} a ${formatPeriodo(mesiDati[mesiDati.length - 1][0])}: massimo ${nItal(maxMese)} in un mese`}>
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
        <ScaricaCsv percorso={`/dati/provincia/${slug}.csv`} />
        <ElencoContratti contratti={d.contratti} />
      </section>

      {d.top_enti.length > 0 && (
        <section className="sezione">
          <h2 className="titolo-sezione">Enti gestori · {p.anni_enti.join(" e ")}</h2>
          <table className="tabella">
            <caption className="sr-only">Enti gestori e numero di contratti ricevuti</caption>
            <thead><tr><th>Ente</th><th className="num">Contratti</th></tr></thead>
            <tbody>{d.top_enti.map((e) => (
              <tr key={e.nome}><td>{e.cf && slugEnteDaCf.has(e.cf)
                ? <Link href={`/ente/${slugEnteDaCf.get(e.cf)}`} className="link-ente">{nomeEnte(e.nome)}</Link>
                : nomeEnte(e.nome)}</td><td className="num">{nItal(e.affidamenti)}</td></tr>
            ))}</tbody>
          </table>
        </section>
      )}

      {d.rapporti_ricorrenti.length > 0 && (
        <section className="sezione">
          <h2 className="titolo-sezione">Assegnazioni ripetute allo stesso ente</h2>
          <table className="tabella">
            <caption className="sr-only">Amministrazioni ed enti con assegnazioni dirette ripetute</caption>
            <thead><tr><th>Amministrazione</th><th>Ente</th><th className="num">Volte</th></tr></thead>
            <tbody>{d.rapporti_ricorrenti.map((r, i) => (
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

      <section className="sezione">
        <h2 className="titolo-sezione">Posti e presenze nei centri</h2>
        <p className="nota-tabella">
          CAS, centri di prima accoglienza e hotspot, un anno per volta.
        </p>
        <table className="tabella">
          <caption className="sr-only">Centri di accoglienza straordinaria e di prima accoglienza: centri, posti, presenze e costo mediano</caption>
          <thead>
            <tr><th>Anno</th><th className="num">Centri</th><th className="num">Capienza</th>
            <th className="num">Presenze</th><th className="num">Costo mediano al giorno per ospite</th></tr>
          </thead>
          <tbody>
            {centri.anni.map((a) => {
              const b = c[a]?.cas;
              return b ? (
                <tr key={a}>
                  <td>{a}</td>
                  <td className="num">{nItal(b.centri)}</td>
                  <td className="num">{b.capienza === null ? "n.d." : nItal(b.capienza)}</td>
                  <td className="num">{b.presenze === null ? "n.d." : nItal(b.presenze)}</td>
                  <td className="num">{b.costo_mediano === null ? "n.d." : euroCent(b.costo_mediano)}</td>
                </tr>
              ) : (
                <tr key={a}><td>{a}</td><td colSpan={4}>nessun centro nei dati</td></tr>
              );
            })}
          </tbody>
        </table>

        <table className="tabella">
          <caption className="sr-only">Sistema di accoglienza e integrazione: progetti, posti e presenze</caption>
          <thead>
            <tr><th>Anno</th><th className="num">Progetti SAI</th><th className="num">Capienza</th>
            <th className="num">Presenze</th></tr>
          </thead>
          <tbody>
            {centri.anni.map((a) => {
              const b = c[a]?.sai;
              return b ? (
                <tr key={a}>
                  <td>{a}</td>
                  <td className="num">{nItal(b.progetti)}</td>
                  <td className="num">{b.capienza === null ? "n.d." : nItal(b.capienza)}</td>
                  <td className="num">
                    {b.presenze === null ? "n.d." : nItal(b.presenze)}
                    {b.senza_presenze > 0 && <small> ({nItal(b.senza_presenze)} senza dato)</small>}
                  </td>
                </tr>
              ) : (
                <tr key={a}><td>{a}</td><td colSpan={3}>nessun progetto SAI nei dati</td></tr>
              );
            })}
          </tbody>
        </table>
        <p className="avviso">
          Fonte:{" "}
          <a href={centri.url} target="_blank" rel="noopener">Centri d&apos;Italia</a>
          {" "}(ActionAid e Openpolis), licenza{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">{centri.licenza}</a>.
          {" "}Una rilevazione per anno, al 31 dicembre
          {Object.entries(centri.rilevazioni_sai).filter(([a]) => !sai31dic(a)).map(([a, d]) => (
            <span key={a}>; per il SAI {a}, al {dataIt(d)}</span>
          ))}
          . n.d.: il valore non compare nel file della fonte. Nella colonna Presenze, tra parentesi, i progetti senza il dato.
        </p>
      </section>

      {altre.length > 0 && (
        <section className="sezione">
          <h2 className="titolo-sezione">Altre province della regione · {regione}</h2>
          <p>
            {altre.map((n, i) => (
              <span key={n}>
                {i > 0 && " · "}
                <Link href={`/provincia/${mkSlug(n)}`} className="link-interno">{nomeProvincia(n)}</Link>
              </span>
            ))}
          </p>
        </section>
      )}
    </main>
  );
}
