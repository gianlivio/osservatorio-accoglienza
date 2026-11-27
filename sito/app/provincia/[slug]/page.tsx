import Link from "next/link";
import Intestazione from "@/app/Intestazione";
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
import { province, trovaProvincia, caricaDettaglioProvincia, slug as mkSlug, euro, anni, nItal, euroCent, nomeProvincia, nProvincia, descrizioneProvincia, pct, verificaSommeProvince, senzaProvincia, totale as totaleNazionale } from "@/lib/dati";

const NOMI_MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
const MESI_LUNGHI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto",
  "settembre", "ottobre", "novembre", "dicembre"];
function formatPeriodo(periodo: string) {
  const [anno, mese] = periodo.split("-");
  return `${NOMI_MESI[+mese - 1]} ${anno}`;
}

export async function generateStaticParams() {
  await verificaSommeProvince();
  return province.map((p) => ({ slug: mkSlug(p.provincia) }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = trovaProvincia(slug);
  if (!p) return {};
  const title = `${nomeProvincia(p.provincia)}: contratti per l'accoglienza dei migranti ${anni[0]}–${anni[anni.length - 1]} · Osservatorio Accoglienza`;
  const description = descrizioneProvincia(p);
  return {
    ...metadatiPagina(title, description),
    alternates: {
      canonical: "./",
      types: { "application/rss+xml": [{ url: `/provincia/${slug}/feed.xml`, title: `Contratti ${nProvincia(p.provincia)}` }] },
    },
  };
}

export default async function Provincia({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = trovaProvincia(slug);
  if (!p) notFound();
  const d = await caricaDettaglioProvincia(slug);
  const t = p.totale;
  const senzaEnti = anni.filter((a) => { const b = p.per_anno[a]; return !!b && b.affidamenti > 0 && b.enti_gestori === 0; });
  const elencoSenzaEnti = senzaEnti.length > 1 ? `${senzaEnti.slice(0, -1).join(", ")} e ${senzaEnti[senzaEnti.length - 1]}` : senzaEnti[0];
  const mesiDati = Object.entries(d.per_mese)
    .filter((voce): voce is [string, NonNullable<(typeof voce)[1]>] => voce[1] !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));
  const maxMese = Math.max(...mesiDati.map(([, m]) => m.affidamenti), 1);
  const c = centri.province[p.provincia] ?? {};
  const annoCosto = centri.anni[centri.anni.length - 1];
  const costoUltimo = c[annoCosto]?.cas?.costo_mediano ?? null;
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
      <Intestazione ritorno="tutte le province">Provincia · {anni[0]}–{anni[anni.length - 1]}</Intestazione>
      <h1 className="tesi">{nomeProvincia(p.provincia)}</h1>
      <p className="frase-provincia">
        {nomeProvincia(p.provincia)}, {anni[0]}–{anni[anni.length - 1]}: {nItal(t.affidamenti)} {t.affidamenti === 1 ? "contratto" : "contratti"} per
        l&apos;accoglienza nell&apos;archivio ANAC; {nItal(t.diretti)} ({pct(t.quota_diretti)}) {t.diretti === 1 ? "assegnato" : "assegnati"} con affidamento
        diretto. {nItal(t.canale_prefettura)} {t.canale_prefettura === 1 ? "firmato" : "firmati"} dalla Prefettura, {nItal(t.canale_ente_locale)} da comuni o enti
        locali.
      </p>

      <section className="sezione">
        <h2 className="titolo-sezione">Totale {anni[0]}–{anni[anni.length - 1]}</h2>
        <div className="cifre cifre-riga">
          <div className="cifra"><b>{euro(t.importo_mediano)}</b><span>importo mediano<small>metà dei contratti vale meno, metà di più</small></span></div>
          <div className="cifra"><b>{nItal(t.prosecuzioni)}</b><span>rinnovi di contratti già in corso</span></div>
          {costoUltimo !== null && (
            <div className="cifra"><b>{euroCent(costoUltimo)}</b><span><a href="#posti-e-presenze" className="link-interno">costo mediano dei CAS per adulti, {annoCosto}</a><small>fonte: Centri d&apos;Italia</small></span></div>
          )}
        </div>
      </section>

      {d.top_enti.length > 0 && (
        <section className="sezione">
          <h2 className="titolo-sezione">Enti gestori · {p.anni_enti.join(" e ")}</h2>
          <table className="tabella">
            <caption className="sr-only">Enti gestori e numero di contratti ricevuti</caption>
            <thead><tr><th>Ente</th><th className="num">Contratti</th></tr></thead>
            <tbody>{d.top_enti.map((e) => (
              <tr key={e.nome}><td>{e.cf && slugEnteDaCf.has(e.cf)
                ? <Link href={`/ente/${slugEnteDaCf.get(e.cf)}`} prefetch={false} className="link-ente">{nomeEnte(e.nome)}</Link>
                : nomeEnte(e.nome)}</td><td className="num">{nItal(e.affidamenti)}</td></tr>
            ))}</tbody>
          </table>
        </section>
      )}

      <section className="sezione">
        <h2 className="titolo-sezione">Anno per anno</h2>
        <table className="tabella">
          <caption className="sr-only">Andamento anno per anno di contratti, contratti da 40.000 € in su, quota con affidamento diretto, importo mediano ed enti che hanno ricevuto contratti</caption>
          <thead>
            <tr><th>Anno</th><th className="num">Contratti</th><th className="num">Da 40.000 € in su</th><th className="num">Affidamento diretto</th>
            <th className="num col-mediano">Importo mediano</th><th className="num">Enti che hanno ricevuto contratti</th></tr>
          </thead>
          <tbody>
            {anni.map((a) => {
              const b = p.per_anno[a];
              return (
                <tr key={a}>
                  <td>{a}</td>
                  <td className="num">{b ? nItal(b.affidamenti) : "—"}</td>
                  <td className="num">{b ? nItal(d.per_anno[a]?.affidamenti_40k ?? 0) : "—"}</td>
                  <td className="num">{b ? pct(b.quota_diretti) : "—"}</td>
                  <td className="num col-mediano">{b ? euro(b.importo_mediano) : "—"}</td>
                  <td className="num">{b ? nItal(b.enti_gestori) : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {senzaEnti.length > 0 && (
          <p className="nota-tabella nota-enti">
            Enti che hanno ricevuto contratti: conta gli aggiudicatari presenti nei dati ANAC. {senzaEnti.length === 1 ? "Nel" : "Negli anni"} {elencoSenzaEnti} i contratti
            non hanno l&apos;aggiudicatario nei dati: lo 0 non vuol dire che nessun ente li abbia ricevuti.
          </p>
        )}
        <p className="avviso">
          Dal 2024 entrano nell&apos;archivio anche contratti di piccolo importo: per confrontare gli anni, usa la colonna Da 40.000 € in su.{" "}
          <Link href="/metodologia">Metodologia</Link>
        </p>
        <p className="avviso">
          I contratti pluriennali compaiono solo nell&apos;anno in cui vengono firmati.
        </p>
        <p className="nota-tabella">
          In tutta Italia, {nItal(Object.values(senzaProvincia).reduce((n, v) => n + v.affidamenti, 0))} contratti su {nItal(totaleNazionale.affidamenti)} dell&apos;archivio
          non indicano la provincia: non sono in questa pagina. <Link href="/metodologia#senza-provincia">Come sono trattati</Link>
        </p>
      </section>

      {mesiDati.length > 0 && (
        <section className="sezione">
          <h2 className="titolo-sezione">Mese per mese</h2>
          <p className="nota-tabella">
            Ogni barra è un mese: la parte piena indica i contratti assegnati con affidamento diretto.
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
        <ScaricaCsv percorso={`/dati/provincia/${slug}.csv`} rss={`/provincia/${slug}/feed.xml`} />
        <ElencoContratti contratti={d.contratti} />
      </section>

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
            stesso ente con affidamento diretto, nel {p.anni_enti.join(" e ")}. Assegnare direttamente sotto
            una certa cifra è una procedura prevista dalla legge.
          </p>
        </section>
      )}

      <section className="sezione" id="posti-e-presenze">
        <h2 className="titolo-sezione">Posti e presenze nei centri</h2>
        <p className="nota-tabella">
          CAS, centri di prima accoglienza e hotspot, un anno per volta.
        </p>
        <table className="tabella tabella-centri">
          <caption className="sr-only">Centri di accoglienza straordinaria e di prima accoglienza: centri, posti, presenze e costo mediano dei CAS per adulti</caption>
          <thead>
            <tr><th>Anno</th><th className="num">Centri</th><th className="num">Capienza</th>
            <th className="num">Presenze</th><th className="num">Costo mediano dei CAS per adulti (€/giorno)</th></tr>
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
        <p className="nota-tabella">
          <Link href="/quanto-costa" className="link-interno">Il costo nelle altre province e a livello nazionale →</Link>
        </p>

        <p className="nota-tabella nota-sai">
          Progetti SAI, sistema di accoglienza e integrazione dei Comuni, un anno per volta.
        </p>
        <table className="tabella tabella-centri">
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
                    {b.senza_presenze > 0 && <small>{nItal(b.senza_presenze)} senza dato</small>}
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
          . n.d.: il valore non compare nel file della fonte. Nella colonna Presenze, sotto il valore, i progetti senza il dato. Costo mediano dei CAS per adulti: valore centrale del costo giornaliero per ospite fra i CAS per adulti della provincia; n.d. se nessuno ha il dato.
        </p>
      </section>

      {altre.length > 0 && (
        <section className="sezione">
          <h2 className="titolo-sezione">Altre province della regione · {regione}</h2>
          <p>
            {altre.map((n, i) => (
              <span key={n}>
                {i > 0 && " · "}
                <Link href={`/provincia/${mkSlug(n)}`} prefetch={false} className="link-interno">{nomeProvincia(n)}</Link>
              </span>
            ))}
          </p>
        </section>
      )}
    </main>
  );
}
