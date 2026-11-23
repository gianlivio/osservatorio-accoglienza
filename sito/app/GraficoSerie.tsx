import { nItal } from "@/lib/dati";

export type Serie = {
  nome: string;
  valori: (number | null)[];
  tono: 1 | 2 | 3;      // 1 = colore pieno, 2 e 3 = gradazioni più chiare dello stesso colore
  vuoti?: string[];     // anni da disegnare come punto vuoto, non collegato alla linea
  lati?: boolean;       // etichette del primo e dell'ultimo valore a sinistra e a destra del punto, non sopra
  ultimaSotto?: boolean; // etichetta dell'ultimo valore sotto il punto
  primaSotto?: boolean;  // etichetta del primo valore sotto il punto
};
export type Legge = { anno: string; etichetta?: string };

const L_LARGO = 440, DX_LARGO = 22, L_STRETTO = 300, DX_STRETTO = 12, GIU = 24;
const LARGHEZZA_CARATTERE = 6.6; // px nel viewBox, carattere monospace a 11 px

// Scala "tonda" verso l'alto: 1, 2, 2,5, 5 o 10 per la potenza di dieci giusta.
function massimoTondo(max: number) {
  const e = Math.pow(10, Math.floor(Math.log10(max)));
  return [1, 1.5, 2, 2.5, 5, 10].map((m) => m * e).find((v) => v >= max) ?? max;
}

const massimoSerie = (serie: Serie[]) =>
  massimoTondo(Math.max(...serie.flatMap((s) => s.valori.filter((v): v is number => v !== null))));

// Margine sinistro che contiene l'etichetta più lunga dell'asse verticale di tutti i grafici della pagina:
// usato da ogni grafico, così gli anni restano allineati.
export function margineSinistro(gruppi: Serie[][]) {
  const lunghezza = Math.max(...gruppi.map((g) => nItal(massimoSerie(g)).length));
  return Math.ceil(lunghezza * LARGHEZZA_CARATTERE) + 14;
}

// Linee su un asse comune 2015-2025; linee verticali tratteggiate sugli anni delle leggi. SVG statico, nessun JavaScript.
// `stretto`: versione per il telefono, viewBox di 300 unità con testo a 12 unità (circa 13 px a 327 px di larghezza):
// asse verticale con le etichette sopra le linee della griglia (solo 0 e massimo), anni abbreviati, sigle delle leggi su due righe.
export default function GraficoSerie({ anni, serie, leggi, conEtichetteLeggi, alt, margineSx, stretto = false, altezza }: {
  anni: string[]; serie: Serie[]; leggi: Legge[]; conEtichetteLeggi?: boolean; alt: string; margineSx: number;
  stretto?: boolean; altezza?: number;
}) {
  const L = stretto ? L_STRETTO : L_LARGO, DX = stretto ? DX_STRETTO : DX_LARGO;
  const SX = stretto ? 14 : margineSx;
  altezza = altezza ?? (stretto ? 190 : 170);
  const SU = stretto ? (conEtichetteLeggi ? 48 : 24) : (conEtichetteLeggi ? 30 : 14);
  const annoBreve = (a: string) => `’${a.slice(2)}`;
  const max = massimoSerie(serie);
  const x = (i: number) => Math.round(10 * (SX + (i * (L - SX - DX)) / (anni.length - 1))) / 10;
  const y = (v: number) => Math.round(10 * (altezza - GIU - (v / max) * (altezza - GIU - SU))) / 10;
  const f = (v: number) => nItal(v);

  return (
    <svg viewBox={`0 0 ${L} ${altezza}`} role="img" aria-label={alt} className={stretto ? "g-svg-stretto" : undefined}>
      <title>{alt}</title>
      {(stretto ? [0, max] : [0, max / 2, max]).map((v) => (
        <g key={v}>
          <line className="g-asse" x1={SX} x2={L - DX} y1={y(v)} y2={y(v)} />
          {stretto
            ? <text className="g-anno" x={SX + 5} y={y(v) - 4} textAnchor="start">{f(v)}</text>
            : <text className="g-anno" x={SX - 6} y={y(v) + 4} textAnchor="end">{f(v)}</text>}
        </g>
      ))}
      {leggi.map((l, k) => {
        const i = anni.indexOf(l.anno);
        // sul telefono le sigle stanno su due righe alternate, per non sovrapporsi
        const rigaY = stretto ? SU - (k % 2 === 0 ? 30 : 16) : SU - 12;
        return (
          <g key={l.anno}>
            <line className="g-legge" x1={x(i)} x2={x(i)} y1={stretto ? rigaY + 4 : SU - 6} y2={altezza - GIU} />
            {conEtichetteLeggi && l.etichetta && (
              <text className="g-sigla" x={x(i)} y={rigaY} textAnchor={i === 0 ? "start" : "middle"}>{l.etichetta}</text>
            )}
          </g>
        );
      })}
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
              s.lati && !stretto && ultimo < anni.length - 1
                ? <text className="g-valore" x={x(ultimo) + 8} y={y(s.valori[ultimo]!) + 4} textAnchor="start">{f(s.valori[ultimo]!)}</text>
                : <text className="g-valore" x={x(ultimo)} y={y(s.valori[ultimo]!) + (s.ultimaSotto ? 17 : -8)} textAnchor={ultimo === anni.length - 1 || stretto ? "end" : "middle"}>{f(s.valori[ultimo]!)}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
