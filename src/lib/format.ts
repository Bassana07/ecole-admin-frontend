import type { Role } from "./types";

export function fcfa(montant: number): string {
  return `${Math.round(montant).toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ")} F`;
}

export function fcfaCourt(montant: number): string {
  if (montant >= 1_000_000) return `${(montant / 1_000_000).toFixed(1).replace(".", ",")} M`;
  if (montant >= 1_000) return `${Math.round(montant / 1_000)} k`;
  return String(montant);
}

export function note20(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

export function pluriel(n: number, mot: string): string {
  return n > 1 ? `${mot}s` : mot;
}

export function initiales(nom: string, prenom: string): string {
  return `${nom[0]}${prenom[0]}`.toUpperCase();
}

/** Mention portée sur le bulletin. */
export function mention(moyenne: number): string {
  if (moyenne >= 16) return "Félicitations";
  if (moyenne >= 14) return "Tableau d'honneur";
  if (moyenne >= 12) return "Encouragements";
  if (moyenne >= 10) return "Passable";
  return "Doit progresser";
}

/** Pages accessibles selon le rôle connecté. */
export const ACCES: Record<Role, string[]> = {
  Direction: ["/", "/eleves", "/inscriptions", "/personnel", "/classes", "/presences", "/notes", "/bulletins", "/bepc", "/paiements", "/communication", "/statistiques", "/parametres"],
  Secrétariat: ["/", "/eleves", "/inscriptions", "/personnel", "/classes", "/presences", "/bulletins", "/bepc", "/communication"],
  Comptabilité: ["/", "/eleves", "/paiements", "/statistiques"],
  Enseignant: ["/", "/eleves", "/classes", "/presences", "/notes", "/bulletins", "/bepc"],
  Parent: ["/", "/bulletins", "/bepc", "/paiements"],
};

export function peut(role: Role, chemin: string): boolean {
  return ACCES[role].includes(chemin);
}
