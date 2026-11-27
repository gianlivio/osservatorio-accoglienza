import Link from "next/link";
import JsonLd from "@/app/JsonLd";
import Ricerca from "@/app/Ricerca";
import GraficoCosto from "@/app/GraficoCosto";
import Figura3D from "@/app/Figura3D";
import { slug, nomeProvincia, nItal, nItal2, euroCent, dataLunga } from "@/lib/dati";
import { centri, type Tipo } from "@/lib/centri";
import { regioni } from "@/lib/regioni";
import { breadcrumb, creatore, dominio, fonteCentri, licenza } from "@/lib/jsonld";
import { metadatiPagina } from "@/lib/metadati";
import { ANNO_CAPITOLATO, ATTO_AVELLINO, ATTO_CAPITOLATO, POCKET_MONEY } from "@/lib/capitolato";

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

// Province con almeno SOGLIA_CENTRI CAS per adulti con il costo nell'ultimo anno: estremi e valore centrale delle mediane provinciali.
const province = Object.entries(centri.province)
  .map(([nome, per]) => ({ nome, cas: per[ultimo]?.cas }))
  .filter((p): p is { nome: string; cas: NonNullable<typeof p.cas> } => !!p.cas && p.cas.costo_mediano !== null);
const incluse = province.filter((p) => p.cas.costo_centri >= SOGLIA_CENTRI).sort((a, b) => a.cas.costo_mediano! - b.cas.costo_mediano!);
const conCas = Object.values(centri.province).filter((per) => per[ultimo]?.cas).length;
const escluse = conCas - incluse.length;
const minima = incluse[0], massima = incluse[incluse.length - 1];

const anniDoppioni = anni.filter((a) => adulti(a).valori > adulti(a).centri_con_costo);
const elencoAnni = anniDoppioni.map((a) => `nel ${a}`).join(" e ");
const minoriSenzaCosto = anni.filter((a) => costi[a].cas_minori && costi[a].cas_minori!.centri_con_costo === 0);
const minoriAnno = (a: string) => costi[a].cas_minori!;
// Fra gli anni non mostrati con almeno un costo, quello con meno centri con il dato.
const minoriPochi = anni
  .filter((a) => !minoriSenzaCosto.includes(a) && a < anni[anni.length - 2] && (costi[a].cas_minori?.centri_con_costo ?? 0) > 0)
  .sort((a, b) => minoriAnno(a).centri_con_costo - minoriAnno(b).centri_con_costo)[0];
const pres = centri.nazionale.presenze[ultimo];
const casPrimoAnnoMinori = anni[anni.length - 2];

const elencoRegioni = Object.entries(regioni).map(([regione, nomi]) => ({
  regione,
  righe: nomi.map((nome) => ({ nome, costo: centri.province[nome]?.[ultimo]?.cas?.costo_mediano ?? null })),
}));

export default function QuantoCosta() {
  const cell = (n: number | null) => (n === null ? "n.d." : `${nItal2(n)} €`);
  return (
    <main className="pagina-costo">
      <JsonLd dati={datasetJsonLd} />
      <JsonLd dati={breadcrumb([{ nome: "Quanto costa l'accoglienza", percorso: "/quanto-costa" }])} />
      <Link href="/" className="indietro">← vai ai dati</Link>
      <div className="apertura-figura">
        <div>
          <p className="occhiello">Centri d&apos;Italia · {primo}–{ultimo}</p>
          <h1 className="tesi">Quanto costa <em>l&apos;accoglienza al giorno</em>.</h1>
          <div className="prosa">
            <p>
              Nel {ultimo} il costo giornaliero per ospite nei centri di accoglienza straordinaria (CAS) per adulti è di{" "}
              {nItal2(adulti(ultimo).mediana!)} €: metà dei centri sta sopra questa cifra, metà sotto. Nel {primo} era{" "}
              {nItal2(adulti(primo).mediana!)} €.
            </p>
            <p>
              La somma va all&apos;ente che gestisce il centro, non alla persona accolta. Alla persona va il pocket money:{" "}
              {euroCent(POCKET_MONEY)} al giorno.
            </p>
          </div>
          <p className="vai-a">
            <a href="#provincia" className="link-interno">Nella tua provincia</a> ·{" "}
            <a href="#tipo" className="link-interno">Per tipo di centro</a> ·{" "}
            <a href="#cosa-non-sappiamo" className="link-interno">Cosa non sappiamo</a>
          </p>
        </div>
        <Figura3D nome="quanto-costa">
          <p className="mappa-didascalia">
            Altezza: costo giornaliero per ospite nei CAS per adulti, {ultimo}: metà dei centri sta sopra, metà sotto (Centri d&apos;Italia). Province in
            grigio: nessun CAS per adulti con il dato.
          </p>
        </Figura3D>
      </div>

      <section className="sezione" id="soldi">
        <h2 className="titolo-sezione">A chi vanno i soldi</h2>
        <p>
          Il prezzo giornaliero non va alla persona accolta: va all&apos;ente che gestisce il centro, per
          ogni persona e per ogni giorno di presenza. Alla persona va il pocket money, una piccola
          somma per le spese di ogni giorno: {euroCent(POCKET_MONEY)} al giorno, che il gestore deve versare
          in denaro e che la Prefettura gli rimborsa a parte.
        </p>
        <p>
          La cifra di {euroCent(POCKET_MONEY)} viene dallo schema di capitolato del Ministero dell&apos;Interno del {ANNO_CAPITOLATO}, non dai dati
          di questo sito. Il capitolato è lo schema di contratto con cui le Prefetture affidano i centri.
        </p>
        <details className="chiuso">
          <summary>Gli atti</summary>
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
          <p>
            L&apos;obbligo per il gestore di versare il pocket money in denaro risulta dalla{" "}
            <a href={ATTO_AVELLINO} target="_blank" rel="noopener" className="link-interno">determinazione a contrarre della
            Prefettura di Avellino</a> (protocollo interno n. 36387 del 22 aprile 2024), che tra le
            novità dello schema di capitolato approvato con il decreto del Ministro dell&apos;Interno
            del 4 marzo 2024 indica l&apos;«obbligo per il gestore di erogare il pocket money unicamente
            sotto forma di denaro».
          </p>
          <p className="avviso">
            La cifra di {euroCent(POCKET_MONEY)} e i riferimenti ai due atti di Prefettura (Chieti e Avellino) vengono da
            fonti esterne, non dai dati di questo sito: è l&apos;unica cifra della pagina che non viene dai nostri dati. Il costo mostrato
            sopra è il valore che Centri d&apos;Italia pubblica con il nome «costo giornaliero per ospite»:
            i dati non dicono se coincida con il prezzo previsto dal capitolato. Gli atti citati sono del
            2024 e non descrivono gli anni precedenti.
          </p>
        </details>
      </section>

      <section className="sezione" id="grafico">
        <h2 className="titolo-sezione">Dal {primo} al {ultimo}</h2>
        <GraficoCosto punti={anni.map((a) => ({ anno: a, valore: adulti(a).mediana!, centri: adulti(a).centri_con_costo }))} />
        <details className="chiuso">
          <summary>La tabella, con i quartili</summary>
          <p className="nota-tabella">
            Nei CAS per adulti il costo giornaliero per ospite, al valore centrale (mediana), è stato di {nItal2(adulti(ultimo).mediana!)} € nel
            {" "}{ultimo}. La mediana è la cifra sopra e sotto cui sta metà dei centri; il primo e il terzo quartile sono le cifre sotto cui
            sta un quarto e tre quarti dei centri, e tra i due cade la metà dei valori. Nella tabella, per ogni anno: la mediana, il primo e
            il terzo quartile e il numero di centri con il dato.
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
        </details>
      </section>

      <section className="sezione sezione-ricerca" id="provincia">
        <h2 className="titolo-sezione">Quanto costa nella tua provincia</h2>
        <p>
          Nel {ultimo} il costo va da {nItal2(minima.cas.costo_mediano!)} € a{" "}
          <Link href={`/provincia/${slug(minima.nome)}`} className="link-interno">{nomeProvincia(minima.nome)}</Link> a{" "}
          {nItal2(massima.cas.costo_mediano!)} € a{" "}
          <Link href={`/provincia/${slug(massima.nome)}`} className="link-interno">{nomeProvincia(massima.nome)}</Link>, tra le{" "}
          {nItal(incluse.length)} province con almeno {SOGLIA_CENTRI} CAS per adulti con il dato.
        </p>
        <Ricerca solo="province" />
        <details className="elenco-province">
          <summary>Tutte le province</summary>
          <p className="nota-tabella">
            Costo giornaliero per ospite nei CAS per adulti, {ultimo}, provincia per provincia: metà dei CAS della provincia sta sopra la
            cifra, metà sotto. n.d.: nessun CAS per adulti della provincia ha il dato.
          </p>
          {elencoRegioni.map(({ regione, righe }) => (
            <div key={regione}>
              <h3 className="titolo-regione">{regione}</h3>
              <table className="tabella">
                <caption className="sr-only">{regione}: costo giornaliero mediano per ospite per provincia, {ultimo}</caption>
                <tbody>
                  {righe.map((r) => (
                    <tr key={r.nome}>
                      <td><Link href={`/provincia/${slug(r.nome)}`} prefetch={false} className="link-interno">{nomeProvincia(r.nome)}</Link></td>
                      <td className="num">{cell(r.costo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </details>
        <p className="nota-tabella nota-province">
          Le province escluse perché hanno meno di {SOGLIA_CENTRI} CAS per adulti con il costo sono {nItal(escluse)}. Il valore di ogni
          provincia è quello al centro dei suoi CAS per adulti (metà sopra, metà sotto), come nella serie nazionale, e non è pesato per
          numero di centri o di posti.
        </p>
      </section>

      <section className="sezione" id="tipo">
        <h2 className="titolo-sezione">Per tipo di centro</h2>
        <p className="nota-tabella">
          Costo giornaliero per ospite: metà dei centri sta sopra la cifra indicata, metà sotto. Per i CAS per minori sono mostrati solo
          {" "}il {casPrimoAnnoMinori} e il {ultimo}: nel {minoriSenzaCosto[0]} il file non riporta alcun costo
          ({nItal(minoriAnno(minoriSenzaCosto[0]).centri_con_costo)} centri su {nItal(minoriAnno(minoriSenzaCosto[0]).centri)}) e
          {" "}nel {minoriPochi} i centri con il dato sono {nItal(minoriAnno(minoriPochi).centri_con_costo)}. Per i centri di prima accoglienza (CPA) e per gli
          hotspot, i centri di primo arrivo dove avviene l&apos;identificazione, è mostrato solo l&apos;ultimo anno.
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
          {nItal(pres.prima_accoglienza)} nei centri di prima accoglienza (CPA e hotspot). Nel SAI, la rete di accoglienza dei Comuni,
          al {dataLunga(centri.rilevazioni_sai[ultimo])}, sono {nItal(pres.sai)}.
        </p>
        <p className="nota-tabella">
          Il totale SAI è calcolato sul file dei progetti. Centri d&apos;Italia pubblica
          {" "}{nItal(centri.sai_ultimo_anno.presenze_strutture)}, calcolato sul file delle strutture.
        </p>
      </section>

      <section className="sezione" id="cosa-non-sappiamo">
        <h2 className="titolo-sezione">Cosa non sappiamo</h2>
        <p>I dati non dicono quanto resta ai gestori dopo i costi: i margini non sono nelle fonti.</p>
        <p>Nessuno dei file di Centri d&apos;Italia riporta un costo per il SAI.</p>
        <p>
          Il costo di ogni centro conta una volta, qualunque sia il numero di posti: la cifra indicata mescola
          centri di dimensioni molto diverse.
        </p>
        <p>
          I dati non misurano quanto arriva alla persona accolta. Il pocket money di {euroCent(POCKET_MONEY)} è la
          cifra degli atti citati sopra, non un dato di questo archivio.
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
        <p>
          Presenze nei centri, costo dei CAS e contratti, anno per anno e accanto alle leggi, sono nella pagina{" "}
          <Link href="/dieci-anni" className="link-interno">Leggi e numeri dell&apos;accoglienza</Link>.
        </p>
      </section>

      <section className="sezione" id="fonte">
        <h2 className="titolo-sezione">Fonte dei dati</h2>
        <p className="nota-tabella">
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
