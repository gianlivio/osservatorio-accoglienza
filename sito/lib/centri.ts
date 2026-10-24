import dati from "@/data/centri.json";

export type BloccoCas = { centri: number; capienza: number | null; presenze: number | null; costo_mediano: number | null };
export type BloccoSai = { strutture: number; capienza: number | null; presenze: number | null };
export type CentriAnno = { cas?: BloccoCas; sai?: BloccoSai };

export const centri = dati as unknown as {
  fonte: string; url: string; licenza: string; anni: string[];
  rilevazioni_cas: Record<string, string>;
  rilevazioni_sai: Record<string, string>;
  rilevazioni_sai_scartate: Record<string, string[]>;
  province: Record<string, Record<string, CentriAnno>>;
};
