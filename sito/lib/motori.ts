import { motoreAnni, type DatiAnni } from "@/lib/anni3d";
import { motoreMappa, type DatiMappa } from "@/lib/mappa3d";
import type { Motore } from "@/lib/scena3d";

export type DatiFigura = DatiMappa | DatiAnni;

export const motore = (dati: DatiFigura, leggero = false): Motore =>
  dati.tipo === "mappa" ? motoreMappa(dati, leggero) : motoreAnni(dati);
