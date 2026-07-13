"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useEcole } from "@/lib/store";
import { initiales } from "@/lib/format";
import type { Eleve } from "@/lib/types";

export function EnTete({ titre, sous, actions }: { titre: string; sous?: string; actions?: ReactNode }) {
  return (
    <div className="entete">
      <div>
        <h1>{titre}</h1>
        {sous && <p className="sous">{sous}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{actions}</div>}
    </div>
  );
}

export function Stat({
  libelle,
  valeur,
  delta,
  sens,
  alerte,
}: {
  libelle: string;
  valeur: string | number;
  delta?: string;
  sens?: "up" | "down";
  alerte?: boolean;
}) {
  return (
    <div className="carte stat">
      <p className="oeil">{libelle}</p>
      <p className={`chiffre${alerte ? " alerte" : ""}`}>{valeur}</p>
      {delta && <p className={`delta ${sens ?? "up"}`}>{delta}</p>}
    </div>
  );
}

export function Avatar({ eleve }: { eleve: Eleve }) {
  return (
    <span className={`avatar${eleve.sexe === "F" ? " f" : ""}`} aria-hidden="true">
      {initiales(eleve.nom, eleve.prenom)}
    </span>
  );
}

export function Jauge({ valeur, total }: { valeur: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((valeur / total) * 100);
  const classe = pct >= 100 ? "" : pct > 0 ? "partiel" : "nul";
  return (
    <span className="jauge" role="img" aria-label={`${pct} % réglé`}>
      <span className={classe} style={{ width: `${Math.max(pct, 2)}%` }} />
    </span>
  );
}

export function Onglets<T extends string>({
  onglets,
  actif,
  onChange,
}: {
  onglets: readonly T[];
  actif: T;
  onChange: (o: T) => void;
}) {
  return (
    <div className="onglets" role="tablist">
      {onglets.map((o) => (
        <button
          key={o}
          role="tab"
          aria-selected={o === actif}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Puces<T extends string>({
  options,
  actif,
  onChange,
  libelle,
}: {
  options: readonly T[];
  actif: T;
  onChange: (o: T) => void;
  libelle: string;
}) {
  return (
    <div className="puces" role="group" aria-label={libelle}>
      {options.map((o) => (
        <button key={o} className="puce" aria-pressed={o === actif} onClick={() => onChange(o)}>
          {o}
        </button>
      ))}
    </div>
  );
}

export function Modale({
  titre,
  onFermer,
  children,
}: {
  titre: string;
  onFermer: () => void;
  children: ReactNode;
}) {
  const panneau = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panneau.current?.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
    const auClavier = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFermer();
    };
    document.addEventListener("keydown", auClavier);
    return () => document.removeEventListener("keydown", auClavier);
  }, [onFermer]);

  return (
    <div className="voile" onClick={(e) => e.target === e.currentTarget && onFermer()}>
      <div className="feuille" role="dialog" aria-modal="true" aria-label={titre} ref={panneau}>
        {children}
      </div>
    </div>
  );
}

export function Flash() {
  const { message } = useEcole();
  return (
    <div role="status" aria-live="polite">
      {message && <div className="flash">{message}</div>}
    </div>
  );
}

export function Vide({ titre, aide }: { titre: string; aide: string }) {
  return (
    <div className="vide">
      <b>{titre}</b>
      {aide}
    </div>
  );
}
