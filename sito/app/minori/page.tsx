import Link from "next/link";
import JsonLd from "@/app/JsonLd";
import { breadcrumb, creatore, dominio } from "@/lib/jsonld";
import { metadatiPagina } from "@/lib/metadati";
import { msnaData, nItal } from "@/lib/dati";

const primoAnno = msnaData.primo_periodo.slice(0, 4);
const fineRegionale = msnaData.ultimo_periodo.slice(0, 4);
const fineNazionale = msnaData.ultimo_totale_periodo.slice(0, 4);
const descrizione = `Minori stranieri non accompagnati: serie mensile per regione dal ${primoAnno} al ${fineRegionale} e totale nazionale fino al ${fineNazionale}, da report del Ministero del Lavoro.`;

export const metadata = metadatiPagina("Minori non accompagnati · Osservatorio Accoglienza", descrizione);

function Spark({ serie, regione }: { serie: { presenti: number }[]; regione: string }) {
  const vals = serie.map((p) => p.presenti);
  const max = Math.max(...vals), min = Math.min(...vals);
  const range = max - min || 1;
  const w = 240, h = 40;
  const pts = vals.map((v, i) =>
    `${(i / (vals.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`
  ).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="spark" preserveAspectRatio="none"
      role="img" aria-label={`Andamento dei minori non accompagnati presenti in ${regione} nel tempo`}>
      <polyline points={pts} fill="none" stroke="var(--timbro)" strokeWidth="1.5" />
    </svg>
  );
}


function GraficoNazionale({ serie }: { serie: { periodo: string; presenti: number; tipo?: string }[] }) {
  const w = 720, h = 200, pad = 34;
  const vals = serie.map((p) => p.presenti);
  const max = Math.max(...vals), min = Math.min(...vals);
  const range = max - min || 1;
  const x = (i: number) => pad + (i / (serie.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / range) * (h - pad * 2);
  const mensili = serie.filter((p) => p.tipo === "mensile");
  const linea = mensili.map((p) => {
    const i = serie.indexOf(p);
    return `${x(i)},${y(p.presenti)}`;
  }).join(" ");
  const semestrali = serie.map((p, i) => ({ p, i })).filter((o) => o.p.tipo === "semestrale");
  const primoAnno = serie[0].periodo.slice(0, 4);
  const ultimoAnno = serie[serie.length - 1].periodo.slice(0, 4);
  const ultimoMensile = mensili[mensili.length - 1].periodo.slice(0, 4);
  const primoSemestrale = semestrali[0].p.periodo.slice(0, 4);
  return (
    <div className="grafico-naz">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet"
        role="img" aria-label={`Andamento nazionale dei minori non accompagnati presenti, ${primoAnno}–${ultimoAnno}`}>
        <polyline points={linea} fill="none" stroke="var(--timbro)" strokeWidth="1.6" />
        {semestrali.map(({ p, i }) => (
          <circle key={p.periodo} cx={x(i)} cy={y(p.presenti)} r="3.5"
            fill="var(--carta)" stroke="var(--timbro)" strokeWidth="1.6" />
        ))}
        <text x={pad} y={h - 8} className="asse-txt">{primoAnno}</text>
        <text x={w - pad} y={h - 8} className="asse-txt" textAnchor="end">{ultimoAnno}</text>
        <text x={pad} y={y(max) - 6} className="asse-txt">{nItal(max)}</text>
      </svg>
      <p className="legenda">
        <span className="leg-linea" /> rilevazione mensile ({primoAnno}–{ultimoMensile})
        <span className="leg-punto" /> rilevazione semestrale ({primoSemestrale}–{ultimoAnno})
      </p>
    </div>
  );
}

export default function Minori() {
  const d = msnaData;
  const [pa, pm] = d.ultimo_periodo.split("-");
  const mesi = ["", "gennaio","febbraio","marzo","aprile","maggio","giugno",
    "luglio","agosto","settembre","ottobre","novembre","dicembre"];
  const dataLeggibile = `${mesi[+pm]} ${pa}`;
  const [ta, tm] = d.ultimo_totale_periodo.split("-");
  const dataTotale = `${mesi[+tm]} ${ta}`;
  const primoSemestraleTot = d.nazionale.find((x) => x.tipo === "semestrale")!.periodo.slice(0, 4);
  const primoAnno = d.primo_periodo.split("-")[0];
  const naz = (periodo: string) => d.nazionale.find((x) => x.periodo === periodo)!.presenti;
  const lungo = (periodo: string) => { const [a, m] = periodo.split("-"); return `${mesi[+m]} ${a}`; };
  const datasetJsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `Minori stranieri non accompagnati presenti in Italia: serie per regione ${primoAnno}–${fineRegionale} e totale nazionale ${primoAnno}–${fineNazionale}`,
    description: descrizione,
    url: `${dominio}/minori`,
    creator: creatore,
    isAccessibleForFree: true,
    spatialCoverage: "Italia",
    temporalCoverage: `${d.primo_periodo}/${d.ultimo_totale_periodo}`,
    isBasedOn: {
      "@type": "Organization",
      name: "Ministero del Lavoro e delle Politiche Sociali",
      url: "https://www.lavoro.gov.it",
    },
  };

  return (
    <main>
      <JsonLd dati={datasetJsonLd} />
      <JsonLd dati={breadcrumb([{ nome: "Minori non accompagnati", percorso: "/minori" }])} />
      <Link href="/" className="indietro">← torna all&apos;archivio contratti</Link>
      <p className="occhiello">Dati del Ministero del Lavoro</p>
      <h1 className="tesi">Minori stranieri <em>non accompagnati</em>.</h1>
      <div className="apertura">
        <b className="cifra-grande">{nItal(d.ultimo_totale)}</b>
        <p>
          minori stranieri non accompagnati presenti in Italia al {dataTotale}, secondo il Ministero del Lavoro.
          Al {dataLeggibile} erano {nItal(naz(d.ultimo_periodo))}; al {lungo(d.primo_periodo)}, {nItal(naz(d.primo_periodo))}.
        </p>
      </div>
      <p className="sommario">
        I minori stranieri non accompagnati sono le persone sotto la maggiore età che si
        trovano in Italia senza un adulto legalmente responsabile per loro. La legge ne
        affida l&apos;accoglienza allo Stato. Il Ministero del Lavoro ne ha pubblicato il numero
        presente in ciascuna regione, mese per mese, fino a {dataLeggibile}; da allora pubblica rapporti
        semestrali con, tra l&apos;altro, il totale nazionale. Qui i dati vanno dal {primoAnno} a {dataTotale}:
        per regione fino a {dataLeggibile}, per il totale nazionale fino a {dataTotale}.
      </p>

      <section className="sezione">
        <h2 className="titolo-sezione">
          Minori presenti in Italia, {msnaData.nazionale[0].periodo.slice(0,4)}–{msnaData.ultimo_totale_periodo.slice(0,4)}
        </h2>
        <p className="nota-tabella">
          Quanti minori non accompagnati ci sono in Italia. Fino al {fineRegionale} il conteggio era
          mensile (la linea); dal {+fineRegionale + 1} il Ministero lo pubblica ogni sei mesi (i punti).
        </p>
        <GraficoNazionale serie={msnaData.nazionale} />
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Quante regioni accolgono, al {dataLeggibile}</h2>
        <p className="nota-tabella">
          Ogni linea segue nel tempo i minori presenti in una regione. In ordine di numero,
          dal più alto.
        </p>
        <table className="tabella">
          <caption className="sr-only">Regioni per numero di minori non accompagnati presenti e andamento nel tempo</caption>
          <thead>
            <tr>
              <th>Regione</th>
              <th className="num">Al {dataLeggibile}</th>
              <th>Andamento dal {primoAnno}</th>
            </tr>
          </thead>
          <tbody>
            {d.regioni.map((r) => (
              <tr key={r.regione}>
                <td className="nome-prov">{r.regione}</td>
                <td className="num">{nItal(r.ultimo)}</td>
                <td className="cella-spark"><Spark serie={r.serie} regione={r.regione} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="sezione">
        <h2 className="titolo-sezione">Da dove vengono questi dati</h2>
        <p>
          Fonte: Ministero del Lavoro e delle Politiche Sociali. Fino a dicembre 2022, i report
          mensili sulla presenza dei minori stranieri non accompagnati; dal 2023, i rapporti
          semestrali di approfondimento, al 30 giugno e al 31 dicembre. I numeri indicano i
          minori presenti all&apos;ultimo giorno del periodo.
        </p>
        <p>
          La serie per regione e la tabella qui sopra arrivano a {dataLeggibile}, perché sono
          costruite sui report mensili. I punti del grafico dal {primoSemestraleTot} al {fineNazionale} sono il totale
          nazionale dei rapporti semestrali. I semestrali riportano anche dati per regione, che
          non sono ancora stati aggiunti a questa pagina. Il dato è regionale, non provinciale,
          perché il Ministero non lo pubblica a un dettaglio maggiore.
        </p>
        <p className="avviso">
          Nelle linee di andamento si nota un calo a inizio di ogni anno. Secondo il Ministero
          del Lavoro dipende in parte da come funziona il censimento: per i minori di cui non si
          conoscono il giorno e il mese di nascita il sistema registra convenzionalmente il 1°
          gennaio dell&apos;anno di nascita, e tutti questi minori escono dalla base dati a gennaio, al
          compimento della maggiore età. Fonti: report mensile al 31 gennaio 2016, p. 2; rapporto
          semestrale al 31 dicembre 2023, p. 25.
        </p>
      </section>
    </main>
  );
}
