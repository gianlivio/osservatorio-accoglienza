import { motoreMappa, type DatiMappa } from "@/lib/mappa3d";
import type { Motore } from "@/lib/scena3d";

export type DatiFigura = DatiMappa;

export const motore = (dati: DatiFigura, leggero = false): Motore => motoreMappa(dati, leggero);
