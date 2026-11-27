"use client";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import type { DatiFigura } from "@/lib/motori";

type Tela = ComponentType<{ dati: DatiFigura }>;

/**
 * Mostra l'SVG statico (children) e, dopo il primo rendering e quando la figura è vicina allo schermo, scarica i dati
 * (`fonte`) e il canvas. Il riquadro ha le proporzioni riservate fin dall'HTML.
 */
export default function Figura3DLoader({ fonte, proporzioni, children }: { fonte: string; proporzioni: string; children: ReactNode }) {
  const [pronto, setPronto] = useState<{ Tela: Tela; dati: DatiFigura } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let attesa = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      attesa = window.setTimeout(() => {
        Promise.all([import("./Figura3DTela"), fetch(fonte).then((r) => { if (!r.ok) throw r; return r.json(); })])
          .then(([m, dati]) => setPronto({ Tela: m.default, dati }))
          .catch(() => {}); // resta l'SVG statico
      }, 200);
    }, { rootMargin: "100px" });
    io.observe(ref.current!);
    return () => { io.disconnect(); clearTimeout(attesa); };
  }, [fonte]);
  return <div ref={ref} className="figura3d" style={{ aspectRatio: proporzioni }}>{pronto ? <pronto.Tela dati={pronto.dati} /> : children}</div>;
}
