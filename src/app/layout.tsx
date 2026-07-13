import type { Metadata, Viewport } from "next";
import "./globals.css";
import { EcoleProvider } from "@/lib/store";
import { BarreSuperieure, NavigationMobile, Rail } from "@/components/Navigation";
import { Flash } from "@/components/ui";
import { ECOLE } from "@/lib/data";

export const metadata: Metadata = {
  title: `Gestion — ${ECOLE}`,
  description: "Élèves, inscriptions, présences, notes, bulletins, paiements et communication.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#153a30",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <EcoleProvider>
          <div className="app">
            <Rail />
            <div className="zone">
              <BarreSuperieure />
              <main>{children}</main>
            </div>
          </div>
          <NavigationMobile />
          <Flash />
        </EcoleProvider>
      </body>
    </html>
  );
}
