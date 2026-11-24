import { euroCent, nItal } from "@/lib/dati";

export type PuntoCosto = { anno: string; valore: number; centri: number };

// Barre orizzontali, una per anno, con l'asse che parte da zero: la cifra è scritta in fondo alla barra, il numero di centri
// con il dato in grigio accanto all'anno. L'ultimo anno è a colore pieno. SVG statico, due versioni (larga e stretta).
function Barre({ punti, stretto, alt }: { punti: PuntoCosto[]; stretto: boolean; alt: string }) {
  const L = stretto ? 300 : 440, X0 = stretto ? 92 : 104, DX = stretto ? 60 : 66;
  const RIGA = stretto ? 38 : 36, BARRA = 18, SU = 6, GIU = 24;
  const A = SU + punti.length * RIGA + GIU;
  const max = Math.ceil(Math.max(...punti.map((p) => p.valore)) / 5) * 5;
  const larghezza = (v: number) => Math.round(10 * (v / max) * (L - X0 - DX)) / 10;
  const ultimo = punti.length - 1;
  return (
    <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label={alt}>
      <title>{alt}</title>
      {punti.map((p, i) => {
        const y0 = SU + i * RIGA, yb = y0 + (RIGA - BARRA) / 2, w = larghezza(p.valore);
        return (
          <g key={p.anno}>
            <text className="gb-anno" x={0} y={y0 + RIGA / 2 - 2}>{p.anno}</text>
            <text className="gb-centri" x={0} y={y0 + RIGA / 2 + 12}>{nItal(p.centri)} centri</text>
            <rect className={i === ultimo ? "gb-barra gb-ultima" : "gb-barra"} x={X0} y={yb} width={w} height={BARRA} />
            <text className={i === ultimo ? "gb-valore gb-valore-ult" : "gb-valore"} x={X0 + w + 6} y={yb + BARRA / 2 + 4}>{euroCent(p.valore)}</text>
          </g>
        );
      })}
      <line className="g-asse" x1={X0} x2={X0} y1={SU} y2={SU + punti.length * RIGA} />
      <text className="gb-zero" x={X0} y={A - 6} textAnchor="middle">0 €</text>
    </svg>
  );
}

export default function GraficoCosto({ punti }: { punti: PuntoCosto[] }) {
  const primo = punti[0], ultimo = punti[punti.length - 1];
  const alt =
    `Costo giornaliero per ospite nei CAS per adulti, dal ${primo.anno} al ${ultimo.anno}, barre che partono da zero: ` +
    punti.map((p) => `${p.anno}, ${euroCent(p.valore)} (${nItal(p.centri)} centri con il dato)`).join("; ") +
    `. Metà dei centri sta sopra la cifra indicata, metà sotto.`;
  return (
    <figure className="grafico-barre">
      <div className="g-largo"><Barre punti={punti} stretto={false} alt={alt} /></div>
      <div className="g-stretto"><Barre punti={punti} stretto alt={alt} /></div>
      <figcaption className="nota-tabella">Costo giornaliero per ospite nei CAS per adulti: metà dei centri sta sopra la cifra indicata, metà sotto.</figcaption>
    </figure>
  );
}
