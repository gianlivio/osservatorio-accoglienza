import Link from "next/link";
import type { ReactNode } from "react";

/** Apertura di pagina su una riga: link di ritorno a sinistra e occhiello (children) a destra. */
export default function Intestazione({ ritorno, href = "/", children }: { ritorno?: string; href?: string; children: ReactNode }) {
  return (
    <div className="intestazione">
      {ritorno && <Link href={href} className="indietro">← {ritorno}</Link>}
      <p className="occhiello">{children}</p>
    </div>
  );
}
