"use client";
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import type { PaeseGlobo, Punto } from "@/lib/globoGeom";

type Props = { paesi: PaeseGlobo[]; anni: string[]; italia: Punto };

/** Mostra l'SVG statico (children) e, dopo il primo rendering e quando il globo è visibile, carica il componente interattivo. */
export default function GloboLoader({ children, ...props }: Props & { children: ReactNode }) {
  const [Globo, setGlobo] = useState<ComponentType<Props> | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // il contenitore non ha un proprio riquadro (display: contents): si osserva il globo
    const el = ref.current?.querySelector(".globo-tela");
    if (!el) return;
    let fatto = false, t = 0, idle = false;
    const carica = () => {
      if (fatto) return;
      fatto = true;
      import("./Globo").then((m) => setGlobo(() => m.default)).catch(() => {});
    };
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const w = window as Window & { requestIdleCallback?: (f: () => void, o?: { timeout: number }) => number };
      if (w.requestIdleCallback) { idle = true; t = w.requestIdleCallback(carica, { timeout: 1500 }); } else t = window.setTimeout(carica, 200);
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => { io.disconnect(); if (idle) (window as Window & { cancelIdleCallback?: (n: number) => void }).cancelIdleCallback?.(t); else clearTimeout(t); };
  }, []);
  return Globo ? <Globo {...props} /> : <div ref={ref} className="globo-attesa">{children}</div>;
}
