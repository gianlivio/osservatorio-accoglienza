import type { CSSProperties } from "react";
import { motore, type DatiFigura } from "@/lib/motori";
import { coloreCss, type Punto } from "@/lib/scena3d";

// Un poligono come tracciato con coordinate intere relative.
function tracciato(punti: Punto[]) {
  let d = "", px = 0, py = 0;
  punti.forEach(([u, v], i) => {
    const x = Math.round(u), y = Math.round(v);
    if (i === 0) d = `M${x} ${y}l`;
    else if (x !== px || y !== py) d += `${x - px} ${y - py} `;
    px = x; py = y;
  });
  return `${d.trimEnd()}z`.replace(/ -/g, "-");
}

/** La stessa vista del canvas, ferma, generata al build: si vede prima del caricamento e senza JavaScript. */
export default function Figura3DStatico({ dati }: { dati: DatiFigura }) {
  const m = motore(dati, true);
  const gia = new Set<number>();
  return (
    <svg viewBox={`0 0 ${m.larghezza} ${m.altezza}`} role="group" aria-label={dati.descrizione}>
      {m.quadro(0, () => 1).map((pezzo, k) => {
        const v = m.voci[pezzo.voce];
        const ripetuto = gia.has(pezzo.voce);
        gia.add(pezzo.voce);
        const colore = v.classe === undefined
          ? { style: { "--c": coloreCss(v.tono) } as CSSProperties }
          : { className: `m-c${v.classe}` };
        const facce = pezzo.facce.map((f, i) => <path key={i} className={`f3-${f.ruolo}`} d={f.punti.map(tracciato).join("")} />);
        const testi = pezzo.testi?.map((t, i) => (
          <text key={`t${i}`} className={`f3-t-${t.ruolo}`} x={Math.round(t.x)} y={Math.round(t.y)} textAnchor="middle">{t.testo}</text>
        ));
        return v.href
          ? <a key={k} href={v.href} {...colore} tabIndex={ripetuto ? -1 : undefined} aria-label={v.testi.join(", ")}>{facce}{testi}</a>
          : <g key={k} {...colore}><title>{v.testi.join(", ")}</title>{facce}{testi}</g>;
      })}
    </svg>
  );
}
