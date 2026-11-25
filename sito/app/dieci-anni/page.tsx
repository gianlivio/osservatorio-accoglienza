import Link from "next/link";
import JsonLd from "@/app/JsonLd";
import GraficoSerie, { margineSinistro, type Serie } from "@/app/GraficoSerie";
import { cronologia as c, notoCome, type Atto } from "@/lib/cronologia";
import { centri as centriFonte } from "@/lib/centri";
import { breadcrumb } from "@/lib/jsonld";
import { metadatiPagina } from "@/lib/metadati";
import { dataLunga, euroCent, nItal } from "@/lib/dati";

export const metadata = metadatiPagina(
  "Accoglienza dei migranti 2015–2025: leggi e numeri · Osservatorio Accoglienza",
  "Le leggi sull'accoglienza e i numeri dal 2015 al 2025: contratti da 40.000 € in su, presenze nei centri e costo dei CAS, anno per anno.",
);

const PAROLE = ["zero", "una", "due", "tre", "quattro", "cinque", "sei", "sette", "otto", "nove", "dieci"];
const numero = (n: number) => PAROLE[n] ?? String(n);

const anni = c.anni;
const primo = anni[0], ultimo = anni[anni.length - 1];
const ultimoCentri = c.centri.anni[c.centri.anni.length - 1];
const leggiGrafico = c.leggi.map((l) => ({ anno: l.anno, etichetta: l.nome_breve }));
const mesi = (iso: string) => dataLunga(iso).replace(/ \d{4}$/, "");

const contratti = anni.map((a) => c.contratti_40k.affidamenti_40k[a]);
const centri = (k: "cas" | "prima_accoglienza" | "sai") => anni.map((a) => c.centri.presenze[a]?.[k] ?? null);
const parziale = [ultimo];

const serieContratti: Serie[] = [{ nome: "Contratti da 40.000 € in su", valori: contratti, tono: 1, vuoti: parziale, primaSotto: true, ultimaSotto: true, massimo: true }];
const serieCentri: Serie[] = [
  { nome: "Presenze nei CAS", valori: centri("cas"), lati: true, tono: 1, nomeFine: "CAS" },
  { nome: "Presenze nel SAI", valori: centri("sai"), lati: true, tono: 2, nomeFine: "SAI" },
];
const primoCentri = c.centri.anni[0];
const margineSx = margineSinistro([serieContratti, serieCentri]);
const margineSxStretto = margineSinistro([serieContratti, serieCentri], true);

// Prima accoglienza (CPA e hotspot): fuori dal grafico, estremi della serie per la didascalia.
const primaAcc = c.centri.anni.map((a) => ({ anno: a, v: c.centri.presenze[a].prima_accoglienza }));
const paMin = primaAcc.reduce((m, x) => (x.v < m.v ? x : m)), paMax = primaAcc.reduce((m, x) => (x.v > m.v ? x : m));
const iMaxContratti = contratti.indexOf(Math.max(...contratti.slice(0, -1)));

const altContratti =
  `Contratti per l'accoglienza da 40.000 € in su, ${primo}–${ultimo}: ${nItal(contratti[0])} nel ${primo}, al massimo ${nItal(contratti[iMaxContratti])} nel ${anni[iMaxContratti]}, ` +
  `${nItal(contratti[contratti.length - 2])} nel ${anni[anni.length - 2]}; il ${ultimo} è un punto vuoto, dato provvisorio. ` +
  `Le linee tratteggiate segnano gli anni delle leggi, con il nome breve. I valori di ogni anno sono nei blocchi sotto.`;
const altCentri =
  `Presenze nei centri, ${primoCentri}–${ultimoCentri}: CAS da ${nItal(c.centri.presenze[primoCentri].cas)} a ${nItal(c.centri.presenze[ultimoCentri].cas)}; ` +
  `SAI da ${nItal(c.centri.presenze[primoCentri].sai)} a ${nItal(c.centri.presenze[ultimoCentri].sai)}. Gli anni prima del ${primoCentri} sono in una fascia grigia: dati non disponibili. ` +
  `I valori di ogni anno sono nei blocchi sotto.`;

function RigaLegge({ a }: { a: Atto }) {
  return (
    <tr>
      <td>{a.anno}</td>
      <td>
        {a.sigla ?? a.atto}
        {a.noto_come.length > 0 && <small>noto come {notoCome(a.noto_come)}</small>}
      </td>
      <td>{a.in_breve}</td>
      <td><a href={Number(a.anno) < Number(primo) ? "#prima-del-2015" : `#anno-${a.anno}`} className="link-interno">vai →</a></td>
    </tr>
  );
}

function Atto({ a }: { a: Atto }) {
  const noto = notoCome(a.noto_come);
  return (
    <div className="legge">
      <p>
        <b>{a.atto}</b>{noto && <>, noto come {noto}</>}.{" "}
        <a href={a.url} target="_blank" rel="noopener" className="link-interno">Normattiva</a>
        {a.url_conversione && <> · <a href={a.url_conversione} target="_blank" rel="noopener" className="link-interno">legge di conversione</a></>}
      </p>
      <p className="titolo-ufficiale">Titolo ufficiale: «{a.titolo}»</p>
      <p>{a.cosa_cambia}</p>
    </div>
  );
}

export default function DieciAnni() {
  return (
    <main>
      <JsonLd dati={breadcrumb([{ nome: "Dieci anni di accoglienza", percorso: "/dieci-anni" }])} />
      <Link href="/" className="indietro">← vai ai dati</Link>
      <p className="occhiello">{primo}–{ultimo}</p>
      <h1 className="tesi">Leggi e numeri <em>dell&apos;accoglienza</em>.</h1>

      <div className="prosa">
        <p>
          Dal {primo} al {ultimo} {numero(c.leggi.length)} leggi hanno cambiato il sistema di accoglienza: chi è accolto dagli enti locali e chi nei
          centri delle Prefetture, quanto restano i minori soli in prima accoglienza. Accanto a ogni legge la pagina riporta i contratti ANAC
          da 40.000 € in su e le presenze nei centri, senza stabilire nessi tra le une e gli altri.
        </p>
      </div>

      <section className="sezione" id="leggi-in-breve">
        <h2 className="titolo-sezione">Le leggi in breve</h2>
        <table className="tabella tabella-leggi">
          <caption className="sr-only">Le leggi sul sistema di accoglienza: anno, nome, cosa cambia, link al blocco dell&apos;anno</caption>
          <thead>
            <tr><th>Anno</th><th>Nome</th><th>Cosa cambia</th><th>Blocco</th></tr>
          </thead>
          <tbody>
            {c.leggi.map((a) => <RigaLegge key={a.anno} a={a} />)}
            <tr className="gruppo"><th colSpan={4}>Prima del {primo}</th></tr>
            {c.origine.map((a) => <RigaLegge key={a.anno} a={a} />)}
          </tbody>
        </table>
      </section>

      <nav className="barra-anni" aria-label="Vai all'anno">
        {anni.map((a) => (
          <a key={a} href={`#anno-${a}`} className={c.leggi.some((l) => l.anno === a) ? "con-legge" : undefined}>{a}</a>
        ))}
      </nav>

      <section className="sezione" id="numeri">
        <h2 className="titolo-sezione">I numeri</h2>
        <figure className="dieci-grafico">
          <h3>Contratti da 40.000 € in su</h3>
          <div className="g-largo"><GraficoSerie anni={anni} serie={serieContratti} leggi={leggiGrafico} conEtichetteLeggi alt={altContratti} margineSx={margineSx} /></div>
          <div className="g-stretto"><GraficoSerie anni={anni} serie={serieContratti} leggi={leggiGrafico} conEtichetteLeggi alt={altContratti} margineSx={margineSxStretto} stretto /></div>
          <figcaption>
            <span><i className="g-sw g-sw-legge" />Anno di una legge della tabella</span>
            <span>Punto vuoto: {ultimo}, dato provvisorio.</span>
          </figcaption>
          <p className="nota-grafico">
            I contratti sono quelli da 40.000 € in su: dal 2024 entrano in archivio contratti più piccoli, e solo su questa soglia gli anni si
            confrontano.
          </p>
        </figure>
        <figure className="dieci-grafico">
          <h3>Presenze nei centri</h3>
          <div className="g-largo"><GraficoSerie anni={anni} serie={serieCentri} leggi={leggiGrafico} alt={altCentri} margineSx={margineSx} senzaDati={["dati non", "disponibili"]} /></div>
          <div className="g-stretto"><GraficoSerie anni={anni} serie={serieCentri} leggi={leggiGrafico} alt={altCentri} margineSx={margineSxStretto} stretto senzaDati={["dati non", "disponibili"]} /></div>
          <figcaption>
            <span>
              La prima accoglienza (CPA e hotspot) non è nel grafico: le presenze vanno da {nItal(paMin.v)} nel {paMin.anno} a {nItal(paMax.v)} nel {paMax.anno}.
            </span>
          </figcaption>
          <p className="nota-grafico">I dati sui centri partono dal {primoCentri}.</p>
        </figure>
      </section>

      <section className="sezione" id="prima-del-2015">
        <h2 className="titolo-sezione">Prima del {primo}</h2>
        <div className="prosa">
          {c.origine.map((a) => (
            <div key={a.anno}>
              <Atto a={a} />
            </div>
          ))}
          <p>Il D.Lgs. 142/2015 rinvia a questo sistema (art. 14).</p>
        </div>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Anno per anno</h2>
        {anni.map((a) => {
          const legge = c.leggi.find((l) => l.anno === a);
          const p = c.centri.presenze[a];
          const sai = c.centri.rilevazioni_sai[a];
          return (
            <section className="anno" id={`anno-${a}`} key={a}>
              <h3>{a}</h3>
              {legge && <Atto a={legge} />}
              <p>
                <b>Contratti.</b> {nItal(c.contratti_40k.affidamenti_40k[a])} contratti da 40.000 € in su nell&apos;archivio ANAC.
                {a === ultimo && <> Le comunicazioni ad ANAC arrivano anche con anni di ritardo: il dato è provvisorio (archivio aggiornato al {dataLunga(c.contratti_40k.aggiornato)}).</>}
              </p>
              {p ? (
                <p>
                  <b>Centri.</b> Presenze al 31 dicembre: {nItal(p.cas)} nei CAS, {nItal(p.prima_accoglienza)} nella prima accoglienza, {nItal(p.sai)} nel SAI
                  {!sai.endsWith("-12-31") && <> (al {mesi(sai)})</>}. Costo mediano dei CAS per adulti: {euroCent(c.centri.costo_cas_adulti[a].mediana!)} al giorno per ospite.
                </p>
              ) : (
                a >= ultimoCentri && <p><b>Centri.</b> I dati arrivano al {ultimoCentri}; per quest&apos;anno non ci sono ancora.</p>
              )}
            </section>
          );
        })}
      </section>

      <section className="sezione" id="fonti">
        <h2 className="titolo-sezione">Fonti</h2>
        <ul className="elenco">
          <li>Contratti: ANAC, estratti di questo sito (<Link href="/metodologia" className="link-interno">Metodologia</Link>).</li>
          <li>
            Centri: <a href={centriFonte.url} target="_blank" rel="noopener" className="link-interno">Centri d&apos;Italia</a> (ActionAid e Openpolis, {centriFonte.licenza});
            il costo dei CAS per adulti è spiegato in <Link href="/quanto-costa" className="link-interno">Quanto costa</Link>.
          </li>
          <li>
            Leggi: testi ufficiali su <a href="https://www.normattiva.it" target="_blank" rel="noopener" className="link-interno">Normattiva</a>.
          </li>
        </ul>
      </section>
    </main>
  );
}
