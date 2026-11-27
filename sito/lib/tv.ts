// Cifre del sottopancia di /che-cose, lette dai dati al build. L'unica esterna è il pocket money (lib/capitolato).
import { POCKET_MONEY } from "@/lib/capitolato";
import { centri } from "@/lib/centri";
import { msnaData, senzaProvincia, dataLunga, euroCent, nItal } from "@/lib/dati";
import { anniIngressi, ingressi, testoPercentuale } from "@/lib/msnaIngressi";
import { paesi, ultimoAnno } from "@/lib/paesi";

export type Notizia = { testo: string; href: string };

export function notizie(): Notizia[] {
  const annoCentri = centri.anni[centri.anni.length - 1];
  const costo = centri.nazionale.costo_per_tipo[annoCentri].cas_adulti!.mediana!;
  const [anno, mese] = msnaData.ultimo_totale_periodo.split("-").map(Number);
  const giorno = dataLunga(`${msnaData.ultimo_totale_periodo}-${new Date(Date.UTC(anno, mese, 0)).getUTCDate()}`);
  const annoIngressi = anniIngressi[anniIngressi.length - 1];
  const senza = Object.values(senzaProvincia).reduce((n, a) => n + a.affidamenti, 0);
  const [primo, secondo] = [...paesi].sort((a, b) => b.anni[ultimoAnno].richiedenti - a.anni[ultimoAnno].richiedenti);
  const paese = (p: typeof primo) => `${p.nome} (${nItal(p.anni[ultimoAnno].richiedenti)})`;
  return [
    { testo: `Costo mediano dei CAS per adulti nel ${annoCentri}: ${euroCent(costo)} al giorno per ospite`, href: "/quanto-costa" },
    { testo: `Pocket money alla persona accolta: ${euroCent(POCKET_MONEY)} al giorno`, href: "/quanto-costa#soldi" },
    { testo: `Minori non accompagnati presenti al ${giorno}: ${nItal(msnaData.ultimo_totale)}`, href: "/minori" },
    { testo: `Minori entrati nel ${annoIngressi} con eventi di sbarco: ${testoPercentuale(ingressi.anni[annoIngressi].sbarchi.percentuale)}`, href: "/minori#come-sono-entrati" },
    { testo: `Contratti che nei dati ANAC non indicano la provincia: ${nItal(senza)}`, href: "/metodologia#senza-provincia" },
    { testo: `Richiedenti asilo nel ${ultimoAnno}, prime due cittadinanze: ${paese(primo)} e ${paese(secondo)}`, href: "/paesi" },
  ];
}
