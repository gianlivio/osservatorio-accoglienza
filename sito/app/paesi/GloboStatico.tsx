import { geoOrthographic, geoPath, geoRotation, geoGraticule10 } from "d3-geo";
import { contorni, trovaContorno } from "@/lib/mondo";
import "@/lib/contorni"; // controllo di build su coordinate e contorni
import { COLORE, costruisciArco, larghezza, massimoRichiedenti, trattiArco, type PaeseGlobo, type Punto } from "@/lib/globoGeom";
import LegendaGlobo, { DidascaliaGlobo } from "./LegendaGlobo";

const S = 600;

/** Stesso globo e stessi archi dell'ultimo anno, come SVG generato al build: si vede prima del caricamento del globo e senza JavaScript. */
export default function GloboStatico({ paesi, anni, italia }: { paesi: PaeseGlobo[]; anni: string[]; italia: Punto }) {
  const anno = anni[anni.length - 1];
  const R = S * 0.46, c = S / 2;
  const proj = geoOrthographic().translate([c, c]).scale(R).rotate([-italia[0], -italia[1]]).clipAngle(90).precision(0.6);
  const path = geoPath(proj);
  const rot = geoRotation([-italia[0], -italia[1]]);
  const max = massimoRichiedenti(paesi);
  const archi = paesi.map((p) => ({ p, w: larghezza(p.richiedenti[anno], max, S * 0.03), a: costruisciArco(p.slug, p.coordinate, italia) }))
    .filter((x) => x.w > 0).sort((a, b) => b.w - a.w);
  const d = (t: [number, number][]) => "M" + t.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join("L");
  const it = proj(italia);
  return (
    <div className="globo" data-globo="statico">
      <div className="globo-tela">
        <svg viewBox={`0 0 ${S} ${S}`} role="img" aria-label="Globo centrato sull'Italia, con un arco da ciascun paese di cittadinanza. I numeri sono nell'elenco dei paesi.">
          <path d={path({ type: "Sphere" }) ?? ""} fill="#F4F5F0" />
          <path d={path(geoGraticule10()) ?? ""} fill="none" stroke="#C3C7BC" strokeWidth=".5" opacity=".45" />
          <path d={contorni.map((f) => path(f)).join("")} fill="#DDE0D6" stroke="#C3C7BC" strokeWidth=".6" />
          {paesi.map((p) => <path key={p.slug} d={path(trovaContorno(p.contorno)!) ?? ""} fill={COLORE[p.continente]} opacity=".32" />)}
          <path d={path({ type: "Sphere" }) ?? ""} fill="none" stroke="#1B1F1C" strokeWidth="1" />
          {archi.map(({ p, w, a }) => (
            <path key={p.slug} d={trattiArco(a, rot, c, c, R).filter((t) => t.length > 1).map(d).join("")} fill="none" stroke={COLORE[p.continente]}
              strokeWidth={w.toFixed(2)} strokeLinecap="round" strokeLinejoin="round" opacity=".88" />
          ))}
          {it && <circle cx={it[0]} cy={it[1]} r="5" fill="#1B1F1C" stroke="#fff" strokeWidth="2" />}
        </svg>
      </div>
      <div className="globo-barra"><output className="globo-anno" style={{ marginLeft: "auto" }}>{anno}</output></div>
      <div className="globo-assi" aria-hidden="true"><span>&nbsp;</span></div>
      <LegendaGlobo paesi={paesi} anno={anno} />
      <DidascaliaGlobo />
    </div>
  );
}
