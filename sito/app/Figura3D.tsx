import type { ReactNode } from "react";
import Figura3DLoader from "./Figura3DLoader";
import Figura3DStatico from "./Figura3DStatico";
import { motore } from "@/lib/motori";
import { figure, type NomeFigura } from "@/lib/figure";

/** Figura in rilievo accanto all'apertura di una pagina, con la didascalia (children). */
export default function Figura3D({ nome, children }: { nome: NomeFigura; children: ReactNode }) {
  const dati = figure[nome]();
  const { larghezza, altezza } = motore(dati, true);
  return (
    <figure className="figura-a-lato">
      <Figura3DLoader fonte={`/figure/${nome}`} proporzioni={`${larghezza} / ${altezza}`}>
        <Figura3DStatico dati={dati} />
      </Figura3DLoader>
      <figcaption>{children}</figcaption>
    </figure>
  );
}
