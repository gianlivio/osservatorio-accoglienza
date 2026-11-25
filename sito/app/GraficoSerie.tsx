import { nItal } from "@/lib/dati";

export type Serie = {
  nome: string;
  valori: (number | null)[];
  tono: 1 | 2 | 3;       // 1 = colore pieno, 2 e 3 = gradazioni più chiare dello stesso colore
  vuoti?: string[];      // anni da disegnare come punto vuoto, non collegato alla linea
  lati?: boolean;        // etichette del primo e dell'ultimo valore a sinistra e a destra del punto, non sopra
  ultimaSotto?: boolean; // etichetta dell'ultimo valore sotto il punto
  primaSotto?: boolean;  // etichetta del primo valore sotto il punto
  massimo?: boolean;     // etichetta del valore massimo sopra il punto, se non è il primo o l'ultimo
  nomeFine?: string;     // nome della serie scritto in fondo alla linea, al posto della legenda
};
export type Legge = { anno: string; etichetta?: string };

const L_LARGO = 440, DX_LARGO = 22, L_STRETTO = 300, DX_STRETTO = 12, GIU = 24;
const LARGHEZZA_CARATTERE = 6.6; // px nel viewBox, carattere monospace a 11 px

// Scala "tonda" verso l'alto: 1, 1,5, 2, 2,5, 5 o 10 per la potenza di dieci giusta.
function massimoTondo(max: number) {
  const e = Math.pow(10, Math.floor(Math.log10(max)));
  return [1, 1.5, 2, 2.5, 5, 10].map((m) => m * e).find((v) => v >= max) ?? max;
}

const massimoSerie = (serie: Serie[]) =>
  massimoTondo(Math.max(...serie.flatMap((s) => s.valori.filter((v): v is number => v !== null))));

// Margine sinistro che contiene l'etichetta più lunga dell'asse verticale di tutti i grafici della pagina:
// usato da ogni grafico, così gli anni restano allineati.
export function margineSinistro(gruppi: Serie[][], stretto = false) {
  const lunghezza = Math.max(...gruppi.map((g) => nItal(massimoSerie(g)).length));
  return Math.ceil(lunghezza * LARGHEZZA_CARATTERE) + (stretto ? 10 : 14);
}

// Linee su un asse comune; linee verticali tratteggiate sugli anni delle leggi, con il nome breve della legge che parte dalla linea:
// i nomi vicini vanno su due (o più) righe. SVG statico, nessun JavaScript.
// `stretto`: versione per il telefono, viewBox di 300 unità con testo a 11-12 unità (12-13 px a 327 px di larghezza), anni abbreviati.
// `senzaDati`: testo (a righe) di una fascia grigia sugli anni che precedono il primo dato di tutte le serie.
export default function GraficoSerie({ anni, serie, leggi, conEtichetteLeggi, alt, margineSx, stretto = false, altezza, senzaDati }: {
  anni: string[]; serie: Serie[]; leggi: Legge[]; conEtichetteLeggi?: boolean; alt: string; margineSx: number;
  stretto?: boolean; altezza?: number; senzaDati?: string[];
}) {
  const L = stretto ? L_STRETTO : L_LARGO, DX = stretto ? DX_STRETTO : DX_LARGO;
  const SX = margineSx;
  altezza = altezza ?? (stretto ? 190 : 170);
  const annoBreve = (a: string) => `’${a.slice(2)}`;
  const max = massimoSerie(serie);
  const x = (i: number) => Math.round(10 * (SX + (i * (L - SX - DX)) / (anni.length - 1))) / 10;
  const f = (v: number) => nItal(v);

  // righe delle etichette delle leggi: la prima riga in cui il nome non tocca quello precedente
  const cw = stretto ? 6.6 : 6.0;
  const etichette = conEtichetteLeggi ? leggi.filter((l) => l.etichetta).map((l) => ({ l, a: x(anni.indexOf(l.anno)) + 3, w: l.etichetta!.length * cw })) : [];
  const fineRiga: number[] = [];
  const righe = etichette.map((e) => { let r = 0; while ((fineRiga[r] ?? -Infinity) + 2 > e.a) r++; fineRiga[r] = e.a + e.w; return r; });
  const nRighe = Math.max(1, fineRiga.length);
  const TOP = conEtichetteLeggi ? (stretto ? 38 : 30) + 14 * (nRighe - 1) : (stretto ? 24 : 14);
  const SU = TOP + (serie.some((s) => s.massimo) ? 12 : 0); // spazio per l'etichetta del massimo sopra il punto
  const yRiga = (r: number) => TOP - 12 - 14 * r;
  const y = (v: number) => Math.round(10 * (altezza - GIU - (v / max) * (altezza - GIU - SU))) / 10;

  const primoDato = Math.min(...serie.map((s) => s.valori.findIndex((v) => v !== null)).filter((i) => i >= 0));
  const fascia = senzaDati && primoDato > 0 ? { x0: SX, x1: x(primoDato) } : null;
  const mezzo = (SU + altezza - GIU) / 2;

  return (
    <svg viewBox={`0 0 ${L} ${altezza}`} role="img" aria-label={alt} className={stretto ? "g-svg-stretto" : undefined}>
      <title>{alt}</title>
      {fascia && (
        <g>
          <rect className="g-nodati" x={fascia.x0} y={SU} width={fascia.x1 - fascia.x0} height={altezza - GIU - SU} />
          {senzaDati!.map((riga, k) => (
            <text key={riga} className="g-nodati-txt" x={(fascia.x0 + fascia.x1) / 2} y={mezzo - ((senzaDati!.length - 1) * 14) / 2 + k * 14 + 4} textAnchor="middle">{riga}</text>
          ))}
        </g>
      )}
      {[0, max / 2, max].map((v) => (
        <g key={v}>
          <line className="g-asse" x1={SX} x2={L - DX} y1={y(v)} y2={y(v)} />
          <text className="g-anno" x={SX - 6} y={y(v) + 4} textAnchor="end">{f(v)}</text>
        </g>
      ))}
      {leggi.map((l) => {
        const i = anni.indexOf(l.anno), k = etichette.findIndex((e) => e.l === l);
        return <line key={l.anno} className="g-legge" x1={x(i)} x2={x(i)} y1={k >= 0 ? yRiga(righe[k]) + 3 : SU - 6} y2={altezza - GIU} />;
      })}
      {etichette.map((e, k) => (
        <text key={e.l.anno} className="g-sigla" x={e.a} y={yRiga(righe[k])}>{e.l.etichetta}</text>
      ))}
      {anni.map((a, i) => (
        <text key={a} className="g-anno" x={x(i)} y={altezza - 8} textAnchor="middle">{stretto ? annoBreve(a) : a}</text>
      ))}
      {serie.map((s) => {
        const pieni = s.valori.map((v, i) => (v !== null && !s.vuoti?.includes(anni[i]) ? i : -1)).filter((i) => i >= 0);
        // segmenti continui: una nuova linea dopo ogni anno senza dato o con punto vuoto
        const segmenti: number[][] = [];
        pieni.forEach((i) => {
          const ultimo = segmenti[segmenti.length - 1];
          if (ultimo && ultimo[ultimo.length - 1] === i - 1) ultimo.push(i); else segmenti.push([i]);
        });
        const primo = pieni[0], ultimo = pieni[pieni.length - 1];
        const vMax = Math.max(...pieni.map((i) => s.valori[i]!)), iMax = pieni.find((i) => s.valori[i] === vMax)!;
        return (
          <g key={s.nome}>
            {segmenti.filter((g) => g.length > 1).map((g) => (
              <polyline key={g[0]} className={`g-serie gs${s.tono}`} points={g.map((i) => `${x(i)},${y(s.valori[i]!)}`).join(" ")} />
            ))}
            {s.valori.map((v, i) => v === null ? null : (
              <circle key={i} className={s.vuoti?.includes(anni[i]) ? `g-vuoto gs${s.tono}` : `g-pt gp${s.tono}`}
                cx={x(i)} cy={y(v)} r={s.vuoti?.includes(anni[i]) ? 3.5 : i === primo || i === ultimo ? 3.5 : 2.2} />
            ))}
            {primo !== undefined && (
              s.lati && primo > 0
                ? <text className="g-valore" x={x(primo) - 8} y={y(s.valori[primo]!) + 4} textAnchor="end">{f(s.valori[primo]!)}</text>
                : <text className="g-valore" x={x(primo) + (primo === 0 ? 5 : 0)} y={y(s.valori[primo]!) + (s.primaSotto ? 17 : -8)} textAnchor={primo === 0 ? "start" : "middle"}>{f(s.valori[primo]!)}</text>
            )}
            {ultimo !== undefined && ultimo !== primo && (
              s.lati && !stretto && !s.nomeFine && ultimo < anni.length - 1
                ? <text className="g-valore" x={x(ultimo) + 8} y={y(s.valori[ultimo]!) + 4} textAnchor="start">{f(s.valori[ultimo]!)}</text>
                : <text className="g-valore" x={x(ultimo)} y={y(s.valori[ultimo]!) + (s.ultimaSotto ? 17 : -8)} textAnchor={ultimo === anni.length - 1 || stretto || s.nomeFine ? "end" : "middle"}>{f(s.valori[ultimo]!)}</text>
            )}
            {s.massimo && iMax !== primo && iMax !== ultimo && (
              <text className="g-valore" x={x(iMax)} y={y(vMax) - 8} textAnchor="middle">{f(vMax)}</text>
            )}
            {s.nomeFine && ultimo !== undefined && (
              <text className="g-nome" x={x(ultimo) + 8} y={y(s.valori[ultimo]!) + 4}>{s.nomeFine}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
