import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { anni } from "@/lib/dati";

export const metadata: Metadata = {
  title: "Osservatorio Accoglienza",
  description:
    "Come lo Stato italiano compra l'accoglienza dei migranti: affidamenti, importi ed enti gestori, provincia per provincia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body>
        <div className="guscio">
          <header className="testata">
            <Link href="/" className="marchio">Osservatorio Accoglienza</Link>
            <span className="meta"><Link href="/che-cose">Che cos&apos;è</Link> · <Link href="/minori">Minori</Link> · <Link href="/metodologia">Metodologia</Link> · dati {anni[0]}–{anni[anni.length - 1]} · fonte ANAC</span>
          </header>
          {children}
          <footer className="pie">
            Dati dell&apos;Autorità Nazionale Anticorruzione, la banca dati pubblica di tutti
            i contratti della pubblica amministrazione italiana.<br />
            I contratti sono selezionati automaticamente e l&apos;elenco è approssimato:
            qualcosa entra per errore, qualcosa manca. Gli importi non vanno sommati.<br />
            Codice e metodo su github.com/gianlivio/osservatorio-accoglienza
          </footer>
        </div>
      </body>
    </html>
  );
}
