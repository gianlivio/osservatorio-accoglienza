import dati from "@/data/centri.json";

export type BloccoCas = { centri: number; capienza: number | null; presenze: number | null; costo_mediano: number | null };
export type BloccoSai = { progetti: number; capienza: number | null; presenze: number | null; senza_presenze: number };
export type CentriAnno = { cas?: BloccoCas; sai?: BloccoSai };

export const centri = dati as unknown as {
  fonte: string; url: string; licenza: string; anni: string[];
  rilevazioni_cas: Record<string, string>;
  rilevazioni_sai: Record<string, string>;
  sai_ultimo_anno: { anno: string; presenze_progetti: number; presenze_strutture: number };
  province: Record<string, Record<string, CentriAnno>>;
};
