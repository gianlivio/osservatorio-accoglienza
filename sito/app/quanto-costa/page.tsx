import Link from "next/link";
import JsonLd from "@/app/JsonLd";
import { slug, nomeProvincia, nItal, nItal2, euroCent, dataLunga } from "@/lib/dati";
import { centri, type Tipo } from "@/lib/centri";
import { breadcrumb, creatore, dominio, fonteCentri, licenza } from "@/lib/jsonld";
import { metadatiPagina } from "@/lib/metadati";
import { ATTO_CAPITOLATO, POCKET_MONEY } from "@/lib/capitolato";

const SOGLIA_CENTRI = 10;

const anni = centri.anni;
const primo = anni[0], ultimo = anni[anni.length - 1];
const costi = centri.nazionale.costo_per_tipo;
const adulti = (a: string) => costi[a].cas_adulti!;
const NOME_TIPO: Record<Tipo, string> = {
  cas_adulti: "CAS per adulti", cas_minori: "CAS per minori", cpa: "Centri di prima accoglienza (CPA)", hotspot: "Hotspot",
};

const title = "Quanto costa l'accoglienza dei migranti al giorno · Osservatorio Accoglienza";
const description =
  `Costo giornaliero per ospite nei CAS per adulti: mediana di ${nItal2(adulti(primo).mediana!)} € nel ${primo}, ` +
  `${nItal2(adulti(ultimo).mediana!)} € nel ${ultimo}. Per tipo di centro e provincia, da dati Centri d'Italia.`;

export const metadata = metadatiPagina(title, description);

const datasetJsonLd = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: `Costo giornaliero per ospite nei centri di accoglienza, ${primo}–${ultimo}`,
  description,
  url: `${dominio}/quanto-costa`,
  creator: creatore,
  license: licenza,
  isAccessibleForFree: true,
  spatialCoverage: "Italia",
  temporalCoverage: `${primo}/${ultimo}`,
  isBasedOn: fonteCentri,
};

// Province con almeno SOGLIA_CENTRI centri nell'ultimo anno: estremi e valore centrale delle mediane provinciali.
const province = Object.entries(centri.province)
  .map(([nome, per]) => ({ nome, cas: per[ultimo]?.cas }))
  .filter((p): p is { nome: string; cas: NonNullable<typeof p.cas> } => !!p.cas && p.cas.costo_mediano !== null);
const incluse = province.filter((p) => p.cas.centri >= SOGLIA_CENTRI).sort((a, b) => a.cas.costo_mediano! - b.cas.costo_mediano!);
const escluse = province.length - incluse.length;
const minima = incluse[0], massima = incluse[incluse.length - 1];
const centrale = (() => {
  const v = incluse.map((p) => p.cas.costo_mediano!);
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
})();

const anniDoppioni = anni.filter((a) => adulti(a).valori > adulti(a).centri_con_costo);
const elencoAnni = anniDoppioni.map((a) => `nel ${a}`).join(" e ");
const minoriSenzaCosto = anni.filter((a) => costi[a].cas_minori && costi[a].cas_minori!.centri_con_costo === 0);
const minoriAnno = (a: string) => costi[a].cas_minori!;
const pres = centri.nazionale.presenze[ultimo];
const casPrimoAnnoMinori = anni[anni.length - 2];

function Estremo({ p }: { p: { nome: string; cas: { centri: number; costo_mediano: number | null } } }) {
  return (
    <>
      {nItal2(p.cas.costo_mediano!)} € a{" "}
      <Link href={`/provincia/${slug(p.nome)}`} className="link-interno">{nomeProvincia(p.nome)}</Link>
      {" "}({nItal(p.cas.centri)} centri)
    </>
  );
}

export default function QuantoCosta() {
  const cell = (n: number | null) => (n === null ? "n.d." : `${nItal2(n)} €`);
  return (
    <main>
      <JsonLd dati={datasetJsonLd} />
      <JsonLd dati={breadcrumb([{ nome: "Quanto costa l'accoglienza", percorso: "/quanto-costa" }])} />
      <Link href="/" className="indietro">← vai ai dati</Link>
      <p className="occhiello">Centri d&apos;Italia · {primo}–{ultimo}</p>
      <h1 className="tesi">Quanto costa <em>l&apos;accoglienza al giorno</em>.</h1>
      <p className="sommario">
        Il costo giornaliero per ospite dei centri di accoglienza, anno per anno e per tipo di
        centro, come lo pubblica Centri d&apos;Italia. Per la quota che arriva alla persona accolta
        vale lo schema di capitolato del Ministero dell&apos;Interno, citato più sotto.
      </p>

      <section className="sezione">
        <h2 className="titolo-sezione">Il costo al giorno per ospite</h2>
        <p className="nota-tabella">
          Nei centri di accoglienza straordinaria (CAS) per adulti il costo giornaliero per
          ospite, al valore centrale (mediana), è stato di {nItal2(adulti(ultimo).mediana!)} € nel
          {" "}{ultimo}. Nella tabella, per ogni anno: la mediana, il primo e il terzo quartile (tra i
          quali cade la metà dei valori) e il numero di centri con il dato.
        </p>
        <table className="tabella">
          <caption className="sr-only">Costo giornaliero per ospite nei CAS per adulti: mediana, primo e terzo quartile, centri con il dato</caption>
          <thead>
            <tr><th>Anno</th><th className="num">Mediana</th><th className="num">1° quartile</th>
            <th className="num">3° quartile</th><th className="num">Centri con il dato</th></tr>
          </thead>
          <tbody>
            {anni.map((a) => {
              const b = adulti(a);
              return (
                <tr key={a}>
                  <td>{a}</td><td className="num">{cell(b.mediana)}</td><td className="num">{cell(b.q1)}</td>
                  <td className="num">{cell(b.q3)}</td><td className="num">{nItal(b.centri_con_costo)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="avviso">
          La mediana è calcolata sulle righe del file, come nei dati delle pagine provincia.
          {anniDoppioni.length > 0 && (
            <> {elencoAnni[0].toUpperCase() + elencoAnni.slice(1)} alcuni centri compaiono in più righe: nel {ultimo} i valori usati sono{" "}
            {nItal(adulti(ultimo).valori)} e i centri {nItal(adulti(ultimo).centri_con_costo)}.</>
          )}
          {" "}Il numero di centri è quello con almeno un valore.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Per tipo di centro</h2>
        <p className="nota-tabella">
          Costo giornaliero per ospite, mediana. Per i CAS per minori sono mostrati solo
          {" "}il {casPrimoAnnoMinori} e il {ultimo}: nel {minoriSenzaCosto[0]} il file non riporta alcun costo
          ({nItal(minoriAnno(minoriSenzaCosto[0]).centri_con_costo)} centri su {nItal(minoriAnno(minoriSenzaCosto[0]).centri)}) e
          {" "}nel 2020 i centri con il dato sono {nItal(minoriAnno("2020").centri_con_costo)}. Per CPA e hotspot
          è mostrato solo l&apos;ultimo anno.
        </p>
        <table className="tabella">
          <caption className="sr-only">Costo giornaliero per ospite per tipo di centro: mediana, quartili e centri con il dato</caption>
          <thead>
            <tr><th>Tipo di centro</th><th>Anno</th><th className="num">Mediana</th><th className="num">1° quartile</th>
            <th className="num">3° quartile</th><th className="num">Centri con il dato</th></tr>
          </thead>
          <tbody>
            {([["cas_minori", casPrimoAnnoMinori!], ["cas_minori", ultimo], ["cpa", ultimo], ["hotspot", ultimo]] as [Tipo, string][]).map(([t, a]) => {
              const b = costi[a][t]!;
              const conQuartili = t === "cas_minori";
              return (
                <tr key={t + a}>
                  <td>{NOME_TIPO[t]}</td><td>{a}</td><td className="num">{cell(b.mediana)}</td>
                  <td className="num">{conQuartili ? cell(b.q1) : "—"}</td>
                  <td className="num">{conQuartili ? cell(b.q3) : "—"}</td>
                  <td className="num">{nItal(b.centri_con_costo)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Quante persone nei centri</h2>
        <p>
          Al {dataLunga(centri.rilevazioni_cas[ultimo])} le presenze sono {nItal(pres.cas)} nei CAS e{" "}
          {nItal(pres.prima_accoglienza)} nei centri di prima accoglienza (CPA e hotspot). Nel SAI,
          al {dataLunga(centri.rilevazioni_sai[ultimo])}, sono {nItal(pres.sai)}.
        </p>
        <p className="nota-tabella">
          Il totale SAI è calcolato sul file dei progetti. Centri d&apos;Italia pubblica
          {" "}{nItal(centri.sai_ultimo_anno.presenze_strutture)}, calcolato sul file delle strutture.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">A chi vanno i soldi</h2>
        <p>
          Secondo la decisione di contrarre della{" "}
          <a href={ATTO_CAPITOLATO} target="_blank" rel="noopener" className="link-interno">Prefettura di Chieti</a>
          {" "}(protocollo n. 41889 del 10 maggio 2024), che applica lo schema di capitolato per i
          centri di accoglienza approvato con decreto del Ministro dell&apos;Interno del 4 marzo
          2024, il corrispettivo al gestore è fissato per ogni persona e per ogni giorno di
          effettiva presenza. Lo stesso atto prevede, oltre al prezzo a base d&apos;asta, un
          rimborso di {euroCent(POCKET_MONEY)} al giorno per persona per il pocket money, non soggetto a ribasso
          e riconosciuto su rendicontazione. Le voci di costo di riferimento stanno
          nell&apos;Allegato B del capitolato, che non è in quell&apos;atto.
        </p>
        <p className="avviso">
          La cifra di {euroCent(POCKET_MONEY)} e i riferimenti all&apos;atto vengono da una fonte esterna, non dai
          dati di questo sito: è l&apos;unica cifra della pagina che non viene dai nostri dati. Il costo mostrato
          sopra è il valore che Centri d&apos;Italia pubblica con il nome «costo giornaliero per ospite»:
          i dati non dicono se coincida con il prezzo previsto dal capitolato. L&apos;atto vale per i
          bandi 2024–2026; non descrive gli anni precedenti.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Differenze tra province, {ultimo}</h2>
        <p>
          Tra le {nItal(incluse.length)} province con almeno {SOGLIA_CENTRI} centri, il costo giornaliero
          mediano va da <Estremo p={minima} /> a <Estremo p={massima} />. Il valore centrale tra
          le mediane provinciali è {nItal2(centrale)} €.
        </p>
        <p className="nota-tabella">
          Le province escluse perché hanno meno di {SOGLIA_CENTRI} centri sono {nItal(escluse)}. Il valore di
          ogni provincia riunisce CAS e centri di prima accoglienza e non è pesato per numero di
          centri o di posti.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Chi riceve i contratti</h2>
        <p>
          I contratti con cui le amministrazioni affidano questi servizi sono nelle pagine di ogni
          {" "}<Link href="/" className="link-interno">provincia</Link>; quelli di ogni ente gestore, nelle pagine degli
          enti, che si raggiungono dalla ricerca nella home. Ogni pagina riporta importi,
          procedura e uffici che hanno assegnato.
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Cosa non sappiamo</h2>
        <p>I dati non dicono quanto resta ai gestori dopo i costi: i margini non sono nelle fonti.</p>
        <p>Nessuno dei file di Centri d&apos;Italia riporta un costo per il SAI.</p>
        <p>
          Il costo di ogni centro conta una volta, qualunque sia il numero di posti: la mediana mescola
          centri di dimensioni molto diverse.
        </p>
        <p>
          I dati non misurano quanto arriva alla persona accolta. Il pocket money di {euroCent(POCKET_MONEY)} è la
          cifra dell&apos;atto citato sopra, non un dato di questo archivio.
        </p>
        <p className="nota-tabella">
          Fonte dei dati:{" "}
          <a href={centri.url} target="_blank" rel="noopener">Centri d&apos;Italia</a> (ActionAid e Openpolis),
          licenza{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">{centri.licenza}</a>.
          Una rilevazione per anno, al 31 dicembre. La <Link href="/metodologia">Metodologia</Link> spiega come
          sono calcolate le cifre.
        </p>
      </section>
    </main>
  );
}
