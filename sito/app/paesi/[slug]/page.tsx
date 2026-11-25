import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/app/JsonLd";
import { creatore, dominio, licenza, breadcrumb } from "@/lib/jsonld";
import { metadatiPagina } from "@/lib/metadati";
import { nItal, dataLunga } from "@/lib/dati";
import { sicuri, attoPerId, sicuroAl31Dicembre, testoSicuro, frasiSicuro } from "@/lib/paesiSicuri";
import {
  dati, paesi, trovaPaese, anniPaesi, periodoPaesi, ultimoAnno, aperturaPaese, descrizionePaese, titoloPaese,
  multipaese, haRigheUcdp, elencoAnni, SERIE_UCDP,
} from "@/lib/paesi";

export function generateStaticParams() {
  return paesi.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = trovaPaese(slug);
  if (!p) return {};
  return { ...metadatiPagina(titoloPaese(p), descrizionePaese(p)), alternates: { canonical: "./" } };
}

const ETICHETTE_UCDP: Record<(typeof SERIE_UCDP)[number], string> = {
  battaglia: "Morti in combattimenti tra forze armate",
  unilaterale: "Morti per violenza contro civili",
  non_statale: "Morti in conflitti tra gruppi non statali",
};

export default async function PaginaPaese({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = trovaPaese(slug);
  if (!p) notFound();
  const e = dati.fonti.eurostat, u = dati.fonti.ucdp;
  const anniMinori = anniPaesi.filter((a) => p.minori_presenti[a] !== undefined);
  const multi = multipaese(p);
  const conRighe = haRigheUcdp(p);
  const url = `${dominio}/paesi/${slug}`;
  const fs = frasiSicuro(slug);
  const atti = [...new Set(fs.intervalli.flatMap((i) => i.atti))].map(attoPerId);

  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Richiedenti asilo e decisioni di prima istanza per cittadinanza ${p.aggettivo}, Italia, ${periodoPaesi}`,
    description: descrizionePaese(p),
    url,
    creator: creatore,
    license: licenza,
    isAccessibleForFree: true,
    spatialCoverage: { "@type": "Place", name: "Italia" },
    temporalCoverage: `${anniPaesi[0]}/${ultimoAnno}`,
    isBasedOn: [e.url, u.url],
    citation: [
      "Eurostat, migr_asyappctza, migr_asydcfsta, migr_asyunaa",
      `Uppsala Conflict Data Program (UCDP), Battle-related Deaths, One-sided Violence e Non-state Conflict, versione ${u.versione}`,
      "Elenco dei paesi di origine sicuri: art. 2-bis del decreto legislativo 28 gennaio 2008, n. 25, e atti che l'hanno stabilito",
    ],
  };

  return (
    <main>
      <JsonLd dati={datasetJsonLd} />
      <JsonLd dati={breadcrumb([{ nome: "Da dove arrivano", percorso: "/paesi" }, { nome: p.nome, percorso: `/paesi/${slug}` }])} />
      <Link href="/paesi" className="indietro">← tutti i paesi</Link>
      <p className="occhiello">Paese · {periodoPaesi}</p>
      <h1 className="tesi">{p.nome}</h1>
      <p className="frase-provincia">{aperturaPaese(p)}</p>

      <section className="sezione">
        <h2 className="titolo-sezione">Anno per anno</h2>
        <table className="tabella tabella-paese">
          <caption className="sr-only">Richiedenti asilo e decisioni di prima istanza per anno: totale, status di rifugiato, protezione sussidiaria, motivi umanitari, rifiutate</caption>
          <thead>
            <tr><th>Anno</th><th className="num">Richie&shy;denti</th><th className="num">Deci&shy;sioni</th><th className="num">Rifu&shy;giato</th>
            <th className="num">Sussi&shy;diaria</th><th className="num">Umani&shy;taria</th><th className="num">Rifiu&shy;tate</th><th className="num">Paese sicuro</th></tr>
          </thead>
          <tbody>
            {anniPaesi.map((a) => {
              const x = p.anni[a], d = x.decisioni;
              return (
                <tr key={a}>
                  <td>{a}</td><td className="num">{nItal(x.richiedenti)}</td><td className="num">{nItal(d.totale)}</td>
                  <td className="num">{nItal(d.rifugiato)}</td><td className="num">{nItal(d.sussidiaria)}</td>
                  <td className="num">{nItal(d.umanitaria)}</td><td className="num">{nItal(d.rifiuti)}</td>
                  <td className="num">{testoSicuro(sicuroAl31Dicembre(slug, a))}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="nota-tabella">
          Richiedenti: richiedenti asilo. Rifugiato: decisioni con lo status di rifugiato; Sussidiaria: con la protezione sussidiaria; Umanitaria: per motivi umanitari. Decisioni di prima istanza: quelle prese nell&apos;anno, che non riguardano necessariamente le domande presentate nello stesso anno. Eurostat arrotonda i valori a multipli di {e.arrotondamento}: il totale delle decisioni può non coincidere con la somma dei quattro tipi. Paese sicuro: se il paese è nell&apos;elenco italiano dei paesi di origine sicuri al 31 dicembre dell&apos;anno; — : prima del {dataLunga(sicuri.primo_elenco_dal)} non c&apos;era un elenco.{" "}
          <Link href="/metodologia#paesi" className="link-interno">Metodologia</Link>
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Minori non accompagnati</h2>
        <table className="tabella tabella-paese">
          <caption className="sr-only">Minori non accompagnati richiedenti asilo e minori non accompagnati presenti al 31 dicembre</caption>
          <thead>
            <tr><th>Anno</th><th className="num">Richiedenti asilo, minori non accompagnati</th><th className="num">Minori non accompagnati presenti al 31 dicembre</th></tr>
          </thead>
          <tbody>
            {anniPaesi.map((a) => (
              <tr key={a}>
                <td>{a}</td><td className="num">{nItal(p.anni[a].minori_richiedenti)}</td>
                <td className="num">{p.minori_presenti[a] === undefined ? "n.d." : nItal(p.minori_presenti[a])}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="nota-tabella">
          Richiedenti asilo: Eurostat. Presenti: report del Ministero del Lavoro, per gli anni in cui {p.nome} compare tra le cittadinanze riportate
          {anniMinori.length > 0 ? ` (${elencoAnni(anniMinori)})` : ""}; n.d. negli altri anni. Dal 2023 i report riportano solo le prime cittadinanze.{" "}
          <Link href="/minori" className="link-interno">Minori non accompagnati →</Link>
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Conflitti armati</h2>
        {conRighe ? (
          <>
            <table className="tabella tabella-paese">
              <caption className="sr-only">Morti per anno secondo UCDP, per tipo di violenza organizzata</caption>
              <thead>
                <tr><th>Anno</th>{SERIE_UCDP.map((k) => <th key={k} className="num">{ETICHETTE_UCDP[k]}</th>)}</tr>
              </thead>
              <tbody>
                {anniPaesi.map((a) => (
                  <tr key={a}>
                    <td>{a}</td>
                    {SERIE_UCDP.map((k) => <td key={k} className="num">{p.ucdp.morti[k][a] === undefined ? "—" : nItal(p.ucdp.morti[k][a])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="nota-tabella">
              Stima migliore di UCDP, versione {u.versione}. — : nessuna riga nel dataset per quell&apos;anno; UCDP considera conflitto armato uno scontro che causa almeno {u.soglia_morti} morti in un anno.{" "}
              <Link href="/metodologia#paesi" className="link-interno">Definizioni</Link>
            </p>
          </>
        ) : (
          <p>
            UCDP non registra conflitti armati in {p.nome} dal {anniPaesi[0]} al {ultimoAnno}. UCDP considera conflitto armato uno scontro che causa almeno {u.soglia_morti} morti in un anno.
          </p>
        )}
        {multi.righe > 0 && (
          <p className="nota-tabella">
            UCDP registra {multi.righe === 1 ? "1 riga" : `${nItal(multi.righe)} righe`} che riguardano {p.nome} insieme ad altri paesi ({elencoAnni(multi.anni)}): non sono attribuite a nessun paese e non sono nella tabella.
          </p>
        )}
      </section>

      <section className="sezione" id="paesi-sicuri">
        <h2 className="titolo-sezione">Elenco dei paesi di origine sicuri</h2>
        <p>{fs.prima}{fs.passati.length > 0 && " " + fs.passati.join(" ")}</p>
        {atti.length > 0 && (
          <ul className="elenco-atti">
            {atti.map((a) => (
              <li key={a.id}>
                <a href={a.url} target="_blank" rel="noopener" className="link-interno">{a.titolo}</a>, {a.pubblicazione.fonte} del {dataLunga(a.pubblicazione.data)}; in applicazione dal {dataLunga(a.in_applicazione_dal)}.
              </li>
            ))}
          </ul>
        )}
        {fs.intervalli.length > 0 && <p className="nota-tabella">{sicuri.eccezioni}</p>}
        {fs.intervalli.filter((i) => i.norma_transitoria).map((i) => (
          <p key={i.atto} className="nota-tabella">Norma transitoria ({attoPerId(i.atto).breve}, {i.norma_transitoria!.riferimento}): «{i.norma_transitoria!.testo}»</p>
        ))}
        <p className="avviso">
          Per la domanda d&apos;asilo, {sicuri.effetto.riferimento}, prevede: «{sicuri.effetto.testo}»{" "}
          <a href={sicuri.effetto.url} target="_blank" rel="noopener">Testo su Normattiva</a>
        </p>
        <p className="nota-tabella">
          Elenco verificato il {dataLunga(sicuri.controllato)}. <Link href="/metodologia#paesi-sicuri" className="link-interno">Come è costruito</Link>
        </p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Documenti</h2>
        <p><a href={p.ecoi} target="_blank" rel="noopener" className="link-interno">Documenti su {p.nome} su ecoi.net</a></p>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Fonti</h2>
        <p className="avviso">
          Richiedenti asilo, decisioni di prima istanza e minori non accompagnati richiedenti, dati per l&apos;Italia:{" "}
          <a href={e.url} target="_blank" rel="noopener">Eurostat</a>, tabelle {e.richiedenti.dataset}, {e.decisioni.dataset} e {e.minori.dataset}, aggiornate il {dataLunga(e.decisioni.aggiornamento)} (decisioni),
          licenza CC BY 4.0. I dati sono stati rielaborati da Osservatorio Accoglienza (scelta del paese e degli anni, somma dei tipi di decisione); Eurostat non risponde della rielaborazione.
        </p>
        <p className="avviso">
          Morti per conflitto armato: <a href={u.url} target="_blank" rel="noopener">Uppsala Conflict Data Program</a> (UCDP), Battle-related Deaths, One-sided Violence e Non-state Conflict, versione {u.versione},
          licenza CC BY 4.0.
        </p>
        <p className="avviso">
          Documenti: <a href={dati.fonti.ecoi.url} target="_blank" rel="noopener">ecoi.net</a>. Questo sito non ne riprende i testi: rinvia alla pagina del paese. Fonte e condizioni di riuso sono quelle di ciascun documento.
        </p>
        <p className="nota-tabella">Dati estratti il {dataLunga(dati.estratto)}.</p>
      </section>
    </main>
  );
}
