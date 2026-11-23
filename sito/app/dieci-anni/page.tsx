import Link from "next/link";
import JsonLd from "@/app/JsonLd";
import GraficoSerie, { type Serie } from "@/app/GraficoSerie";
import { cronologia as c, notoCome, type Atto } from "@/lib/cronologia";
import { centri as centriFonte } from "@/lib/centri";
import { breadcrumb } from "@/lib/jsonld";
import { metadatiPagina } from "@/lib/metadati";
import { dataLunga, euroCent, nItal } from "@/lib/dati";

export const metadata = metadatiPagina(
  "Accoglienza dei migranti 2015–2025: leggi, contratti, notizie · Osservatorio Accoglienza",
  "Leggi sull'accoglienza, contratti, presenze e costo dei centri, notizie in prima pagina e nei telegiornali: i dati dal 2015 al 2025, anno per anno.",
);

const anni = c.anni;
const primo = anni[0], ultimo = anni[anni.length - 1];
const ultimoCentri = c.centri.anni[c.centri.anni.length - 1];
const leggiGrafico = c.leggi.map((l) => ({ anno: l.anno, etichetta: l.sigla?.replace(/\/\d{4}$/, "") }));
const rapporto = (anno: string) => (
  <a href={c.rapporti[anno].url} target="_blank" rel="noopener" className="link-interno">rapporto {anno}</a>
);
const mesi = (iso: string) => dataLunga(iso).replace(/ \d{4}$/, "");

const tg = anni.map((a) => c.telegiornali.notizie[a]);
const prime = anni.map((a) => c.prime_pagine.per_anno[a].totale_5_testate);
const contratti = anni.map((a) => c.contratti_40k.affidamenti_40k[a]);
const centri = (k: "cas" | "prima_accoglienza" | "sai") => anni.map((a) => c.centri.presenze[a]?.[k] ?? null);
const parziale = [ultimo];

const serieNotizie: Serie[] = [
  { nome: "Telegiornali di prima serata (anno intero)", valori: tg, tono: 1, vuoti: parziale, ultimaSotto: true },
  { nome: "Prime pagine di cinque quotidiani (gennaio–ottobre)", valori: prime, tono: 2, ultimaSotto: true },
];
const serieContratti: Serie[] = [{ nome: "Contratti da 40.000 € in su", valori: contratti, tono: 1, vuoti: parziale, primaSotto: true }];
const serieCentri: Serie[] = [
  { nome: "Presenze nei CAS", valori: centri("cas"), lati: true, tono: 1 },
  { nome: "Presenze nel SAI", valori: centri("sai"), lati: true, tono: 2 },
  { nome: "Presenze nella prima accoglienza", valori: centri("prima_accoglienza"), lati: true, tono: 3 },
];
const primoCentri = c.centri.anni[0];

const altNotizie =
  `Notizie sull'immigrazione, ${primo}–${ultimo}. Telegiornali di prima serata, anno intero: da ${nItal(tg[0])} nel ${primo} a ${nItal(c.telegiornali.notizie[anni[anni.length - 2]])} nel ${anni[anni.length - 2]}; ` +
  `il ${ultimo} è un punto vuoto, gennaio–ottobre, dato parziale. Titoli sulle prime pagine di cinque quotidiani, gennaio–ottobre: da ${nItal(prime[0])} nel ${primo} a ${nItal(prime[prime.length - 1])} nel ${ultimo}. ` +
  `Le linee tratteggiate segnano gli anni delle leggi. I valori di ogni anno sono nei blocchi sotto.`;
const altContratti =
  `Contratti per l'accoglienza da 40.000 € in su, ${primo}–${ultimo}: da ${nItal(contratti[0])} nel ${primo} a ${nItal(contratti[contratti.length - 1])} nel ${ultimo}, anno provvisorio disegnato come punto vuoto. I valori di ogni anno sono nei blocchi sotto.`;
const altCentri =
  `Presenze nei centri, ${primoCentri}–${ultimoCentri}: CAS da ${nItal(c.centri.presenze[primoCentri].cas)} a ${nItal(c.centri.presenze[ultimoCentri].cas)}; ` +
  `SAI da ${nItal(c.centri.presenze[primoCentri].sai)} a ${nItal(c.centri.presenze[ultimoCentri].sai)}; ` +
  `prima accoglienza da ${nItal(c.centri.presenze[primoCentri].prima_accoglienza)} a ${nItal(c.centri.presenze[ultimoCentri].prima_accoglienza)}. I dati partono dal ${primoCentri}. I valori di ogni anno sono nei blocchi sotto.`;

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
      <p className="occhiello">{primo}–{ultimo} · leggi, centri, contratti, notizie</p>
      <h1 className="tesi">Dieci anni di accoglienza, <em>anno per anno</em>.</h1>

      <div className="prosa">
        <p>
          Questa pagina mette in fila, dal {primo} al {ultimo}, tre serie di numeri: le notizie che i giornali e i
          telegiornali hanno dedicato all&apos;immigrazione, i contratti per l&apos;accoglienza e i centri. Segna anche le
          leggi sul sistema di accoglienza. Le tre serie sono messe una accanto all&apos;altra, anno per anno. Il sito non dice
          che l&apos;una dipenda dall&apos;altra.
        </p>
      </div>

      <section className="sezione">
        <h2 className="titolo-sezione">Come leggere i numeri</h2>
        <ul className="elenco">
          <li>Le notizie vengono dai rapporti annuali di Carta di Roma e dell&apos;Osservatorio di Pavia: non sono un dato di questo sito.</li>
          <li>
            Le prime pagine sono contate da gennaio a ottobre di ogni anno, su cinque quotidiani: {c.prime_pagine.testate.join(", ")}.
            Il Fatto Quotidiano e l&apos;Unità, nel campione dei rapporti solo in alcuni anni, sono esclusi per avere una serie omogenea.
          </li>
          <li>
            I telegiornali di prima serata ({c.telegiornali.reti.join(", ")}) sono contati sull&apos;anno intero. Per il {ultimo} il rapporto
            dà solo gennaio–ottobre: è un dato parziale, disegnato come punto vuoto, e non si confronta con gli anni precedenti.
          </li>
          <li>
            I contratti sono quelli da 40.000 € in su: dal 2024 entrano in archivio contratti più piccoli, e solo su questa soglia gli
            anni si confrontano. I dati sui centri partono dal {primoCentri}.
          </li>
        </ul>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Le tre serie</h2>
        <figure className="dieci-grafico">
          <h3>Notizie</h3>
          <GraficoSerie anni={anni} serie={serieNotizie} leggi={leggiGrafico} conEtichetteLeggi alt={altNotizie} />
          <figcaption>
            <span><i className="g-sw gs1" />Telegiornali, anno intero</span>
            <span><i className="g-sw gs2" />Prime pagine, gennaio–ottobre</span>
            <span><i className="g-sw legge" />Anno di una legge</span>
            <span>Punto vuoto: gennaio–ottobre, dato parziale.</span>
          </figcaption>
        </figure>
        <figure className="dieci-grafico">
          <h3>Contratti da 40.000 € in su</h3>
          <GraficoSerie anni={anni} serie={serieContratti} leggi={leggiGrafico} alt={altContratti} />
          <figcaption>Punto vuoto: {ultimo}, dato provvisorio.</figcaption>
        </figure>
        <figure className="dieci-grafico">
          <h3>Presenze nei centri</h3>
          <GraficoSerie anni={anni} serie={serieCentri} leggi={leggiGrafico} alt={altCentri} />
          <figcaption>
            <span><i className="g-sw gs1" />CAS</span>
            <span><i className="g-sw gs2" />SAI</span>
            <span><i className="g-sw gs3" />Prima accoglienza</span>
          </figcaption>
        </figure>
      </section>

      <section className="sezione">
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
            <section className="anno" id={a} key={a}>
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
              <p>
                <b>Notizie.</b> {nItal(c.prime_pagine.per_anno[a].totale_5_testate)} titoli sulle prime pagine di cinque quotidiani da gennaio a ottobre;
                telegiornali di prima serata: {nItal(c.telegiornali.notizie[a])} {a === ultimo ? "notizie da gennaio a ottobre (dato parziale)" : "notizie nell'anno"}.
              </p>
              <p className="fonte">
                Fonti. Contratti: ANAC. Centri: Centri d&apos;Italia. Prime pagine: Carta di Roma, {rapporto(c.prime_pagine.rapporto_per_anno[a])}.
                Telegiornali: {rapporto(c.telegiornali.rapporto)}.
              </p>
            </section>
          );
        })}
      </section>

      <section className="sezione" id="fonti">
        <h2 className="titolo-sezione">Fonti</h2>
        <ul className="elenco">
          <li>
            Notizie: rapporti annuali di Carta di Roma, a cura dell&apos;Osservatorio di Pavia. Le prime pagine {primo}–{anni[8]} sono lette dal grafico per
            testata e anno del {rapporto(c.prime_pagine.rapporto_per_anno[primo])}; il {anni[9]} dal {rapporto(c.prime_pagine.rapporto_per_anno[anni[9]])};
            il {ultimo} dal {rapporto(c.prime_pagine.rapporto_per_anno[ultimo])}. Il numero di ogni anno è la somma dei titoli delle cinque testate.
          </li>
          <li>
            Telegiornali: la serie ricalcolata del {rapporto(c.telegiornali.rapporto)}, ad anno intero. Per questo differisce dai valori gennaio–ottobre dei
            rapporti dei singoli anni: per il {c.telegiornali.esempio_differenza.anno}, {nItal(c.telegiornali.esempio_differenza.serie_ricalcolata)} contro{" "}
            {nItal(c.telegiornali.esempio_differenza.gennaio_ottobre_rapporto_2018)} nel {rapporto(c.telegiornali.esempio_differenza.anno)}.
          </li>
          <li>Contratti: ANAC, estratti di questo sito (<Link href="/metodologia" className="link-interno">Metodologia</Link>).</li>
          <li>
            Centri: <a href={centriFonte.url} target="_blank" rel="noopener" className="link-interno">Centri d&apos;Italia</a> (ActionAid e Openpolis, {centriFonte.licenza});
            il costo dei CAS per adulti è spiegato in <Link href="/quanto-costa" className="link-interno">Quanto costa</Link>.
          </li>
          <li>
            Leggi: testi ufficiali su <a href="https://www.normattiva.it" target="_blank" rel="noopener" className="link-interno">Normattiva</a>.
          </li>
        </ul>
        <p className="nota-tabella">
          I rapporti sono dell&apos;Associazione Carta di Roma, che ne detiene i diritti: questa pagina ne cita solo le cifre, ciascuna con il rapporto da cui viene,
          senza riprodurre testi o grafici. La <Link href="/metodologia">Metodologia</Link> spiega i cambi di metodo dichiarati dai rapporti.
        </p>
      </section>
    </main>
  );
}
