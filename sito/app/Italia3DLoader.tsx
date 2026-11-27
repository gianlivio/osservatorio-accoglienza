"use client";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import type { DatiItalia } from "@/lib/italia3d";

type Tela = ComponentType<{ dati: DatiItalia }>;

/** Mostra l'SVG statico (children) e, dopo il primo rendering e quando la figura è vicina allo schermo, carica il canvas. */
export default function Italia3DLoader({ children }: { children: ReactNode }) {
  const [pronto, setPronto] = useState<{ Tela: Tela; dati: DatiItalia } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let attesa = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      attesa = window.setTimeout(() => {
        Promise.all([import("./Italia3DTela"), fetch("/italia.json").then((r) => { if (!r.ok) throw r; return r.json(); })])
          .then(([m, dati]) => setPronto({ Tela: m.default, dati }))
          .catch(() => {}); // resta l'SVG statico
      }, 200);
    }, { rootMargin: "100px" });
    io.observe(ref.current!);
    return () => { io.disconnect(); clearTimeout(attesa); };
  }, []);
  return <div ref={ref} className="italia3d">{pronto ? <pronto.Tela dati={pronto.dati} /> : children}</div>;
}
