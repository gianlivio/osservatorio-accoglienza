import { euroCent } from "@/lib/dati";

export type PuntoCosto = { anno: string; mediana: number; q1: number; q3: number };

const L = 400, A = 240;
const SX = 28, DX = 28, SU = 34, GIU = 30;

// Linea della mediana con fascia tra primo e terzo quartile. SVG statico: nessuna libreria, nessun JavaScript.
export default function GraficoCosto({ punti }: { punti: PuntoCosto[] }) {
  const lo = Math.floor(Math.min(...punti.map((p) => p.q1)) / 2) * 2 - 2;
  const hi = Math.ceil(Math.max(...punti.map((p) => p.q3)) / 2) * 2 + 2;
  const x = (i: number) => Math.round(10 * (SX + (i * (L - SX - DX)) / (punti.length - 1))) / 10;
  const y = (v: number) => Math.round(10 * (A - GIU - ((v - lo) / (hi - lo)) * (A - GIU - SU))) / 10;
  const f = (n: number) => n.toFixed(1);
  const fascia =
    punti.map((p, i) => `${f(x(i))},${f(y(p.q3))}`).join(" ") + " " +
    [...punti].reverse().map((p, i) => `${f(x(punti.length - 1 - i))},${f(y(p.q1))}`).join(" ");
  const linea = punti.map((p, i) => `${f(x(i))},${f(y(p.mediana))}`).join(" ");
  const primo = punti[0], ultimo = punti[punti.length - 1];
  const ultimoI = punti.length - 1;
  const alt =
    `Costo giornaliero mediano per ospite nei CAS per adulti, dal ${primo.anno} al ${ultimo.anno}: ` +
    `${euroCent(primo.mediana)} nel ${primo.anno}, ${euroCent(ultimo.mediana)} nel ${ultimo.anno}. ` +
    `La fascia chiara va dal primo al terzo quartile. I valori di ogni anno sono nella tabella sotto.`;

  return (
    <figure className="grafico">
      <svg viewBox={`0 0 ${L} ${A}`} role="img" aria-label={alt}>
        <title>{alt}</title>
        <line className="g-asse" x1={SX} x2={L - DX} y1={A - GIU} y2={A - GIU} />
        <polygon className="g-fascia" points={fascia} />
        <polyline className="g-linea" points={linea} />
        {punti.map((p, i) => (
          <circle key={p.anno} className="g-punto" cx={x(i)} cy={y(p.mediana)} r={i === 0 || i === ultimoI ? 4 : 2.5} />
        ))}
        {punti.map((p, i) => (
          <text key={p.anno} className="g-anno" x={x(i)} y={A - 10} textAnchor="middle">{p.anno}</text>
        ))}
        <text className="g-valore" x={x(0)} y={y(primo.q3) - 9} textAnchor="start">{euroCent(primo.mediana)}</text>
        <text className="g-valore" x={x(ultimoI)} y={y(ultimo.q3) - 9} textAnchor="end">{euroCent(ultimo.mediana)}</text>
      </svg>
      <figcaption className="nota-tabella">Linea: mediana. Fascia chiara: dal primo al terzo quartile. L&apos;asse verticale non parte da zero.</figcaption>
    </figure>
  );
}
