"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ECOLE, ROLES } from "@/lib/data";
import { peut } from "@/lib/format";
import { useEcole } from "@/lib/store";
import type { Role } from "@/lib/types";

interface Lien {
  href: string;
  libelle: string;
  icone: string;
  groupe: string;
}

const LIENS: Lien[] = [
  { href: "/", libelle: "Tableau de bord", icone: "⌂", groupe: "Pilotage" },
  { href: "/statistiques", libelle: "Statistiques", icone: "▤", groupe: "Pilotage" },
  { href: "/eleves", libelle: "Élèves", icone: "☺", groupe: "Scolarité" },
  { href: "/inscriptions", libelle: "Inscriptions", icone: "✚", groupe: "Scolarité" },
  { href: "/personnel", libelle: "Personnel", icone: "☏", groupe: "Scolarité" },
  { href: "/classes", libelle: "Classes & emplois du temps", icone: "▦", groupe: "Scolarité" },
  { href: "/presences", libelle: "Présences", icone: "✓", groupe: "Pédagogie" },
  { href: "/notes", libelle: "Notes", icone: "✎", groupe: "Pédagogie" },
  { href: "/bulletins", libelle: "Bulletins", icone: "▣", groupe: "Pédagogie" },
  { href: "/bepc", libelle: "Résultats BEPC", icone: "★", groupe: "Pédagogie" },
  { href: "/paiements", libelle: "Paiements", icone: "₣", groupe: "Finances" },
  { href: "/communication", libelle: "Communication", icone: "✉", groupe: "Finances" },
  { href: "/parametres", libelle: "Paramètres", icone: "⚙", groupe: "Administration" },
];

const MOBILE = ["/", "/eleves", "/presences", "/notes", "/paiements"];

const estActif = (chemin: string, href: string) =>
  href === "/" ? chemin === "/" : chemin.startsWith(href);

export function Rail() {
  const chemin = usePathname();
  const { role, utilisateur, eleves } = useEcole();
  const visibles = LIENS.filter((l) => peut(role, l.href));
  const groupes = [...new Set(visibles.map((l) => l.groupe))];
  const impayes = eleves.filter((e) => e.paye < e.fraisTotal).length;

  return (
    <nav className="rail" aria-label="Menu principal">
      <div className="marque marque-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.jpeg" alt={`Logo ${ECOLE}`} className="logo-img" width={96} height={96} />
      </div>

      {groupes.map((g) => (
        <div key={g}>
          <p className="groupe">{g}</p>
          {visibles
            .filter((l) => l.groupe === g)
            .map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="lien"
                aria-current={estActif(chemin, l.href) ? "page" : undefined}
              >
                <span className="ic" aria-hidden="true">{l.icone}</span>
                {l.libelle}
                {l.href === "/paiements" && impayes > 0 && (
                  <span className="compte">{impayes}</span>
                )}
              </Link>
            ))}
        </div>
      ))}

      <div className="bas">
        <div className="marque" style={{ padding: 0 }}>
          <div className="logo" style={{ background: "var(--ardoise-clair)", color: "#fff" }} aria-hidden="true">
            {(() => {
              const p = utilisateur.nom.trim().split(/\s+/);
              return p.length >= 2
                ? `${p[0][0]}${p[p.length - 1][0]}`.toUpperCase()
                : (p[0]?.slice(0, 2) ?? "?").toUpperCase();
            })()}
          </div>
          <div>
            <b>{utilisateur.nom}</b>
            <span>{utilisateur.sous}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export function BarreSuperieure() {
  const chemin = usePathname();
  const { role, changerRole } = useEcole();
  const page = LIENS.find((l) => estActif(chemin, l.href));

  return (
    <div className="topbar">
      <p className="fil">
        {ECOLE} <span aria-hidden="true">›</span> <b>{page?.libelle ?? "Page"}</b>
      </p>
      <div className="selecteur-role">
        <label className="oeil" htmlFor="role">Connecté en tant que</label>
        <select id="role" value={role} onChange={(e) => changerRole(e.target.value as Role)}>
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function NavigationMobile() {
  const chemin = usePathname();
  const { role } = useEcole();
  const visibles = LIENS.filter((l) => MOBILE.includes(l.href) && peut(role, l.href));

  return (
    <nav className="nav-bas" aria-label="Menu principal">
      {visibles.map((l) => (
        <Link key={l.href} href={l.href} aria-current={estActif(chemin, l.href) ? "page" : undefined}>
          <span className="ic" aria-hidden="true">{l.icone}</span>
          {l.libelle.split(" ")[0]}
        </Link>
      ))}
    </nav>
  );
}
