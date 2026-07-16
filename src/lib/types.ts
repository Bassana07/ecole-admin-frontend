export type Role =
  | "Direction"
  | "Secrétariat"
  | "Comptabilité"
  | "Enseignant"
  | "Parent";

export type Presence = "P" | "R" | "A";
export type StatutDossier = "Validé" | "Incomplet" | "En attente";
export type MoyenPaiement = "Orange Money" | "Moov Money" | "Espèces" | "Virement bancaire";

export interface Matiere {
  code: string;
  nom: string;
  coefficient: number;
}

export interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  sexe: "F" | "M";
  naissance: string;
  matricule: string;
  classe: string;
  redoublant: boolean;
  statut: StatutDossier;
  parent: string;
  tel: string;
  email: string;
  quartier: string;
  fraisTotal: number;
  paye: number;
}

export interface Note {
  eleveId: number;
  matiere: string;
  /** Devoirs et composition, sur 20 */
  devoir1: number;
  devoir2: number;
  composition: number;
}

export interface Absence {
  id: number;
  eleveId: number;
  date: string;
  type: "Absence" | "Retard";
  motif: string;
  justifiee: boolean;
}

export interface Paiement {
  id: number;
  eleveId: number;
  date: string;
  montant: number;
  moyen: MoyenPaiement;
  recu: string;
}

export interface Echeance {
  libelle: string;
  date: string;
  montant: number;
}

export interface Personnel {
  id: number;
  nom: string;
  fonction: string;
  matieres: string[];
  classes: string[];
  tel: string;
  statut: "Permanent" | "Vacataire";
}

export interface Cours {
  jour: number; // 0 = lundi
  creneau: number; // index dans CRENEAUX
  matiere: string;
  enseignant: string;
  salle: string;
}

export interface Annonce {
  id: number;
  date: string;
  titre: string;
  corps: string;
  canal: "SMS" | "E-mail" | "Application";
  cible: string;
  destinataires: number;
  statut: "Envoyée" | "Programmée" | "Brouillon";
}

export interface EvenementJournal {
  id: number;
  date: string;
  auteur: string;
  role: Role;
  action: string;
}

export type DecisionBepc = "Admis" | "Ajourné" | "Absent";

export type TypeExamen = "CEP" | "BEPC";

export interface ResultatBepc {
  id: number;
  examen: TypeExamen;
  eleveId: number | null;
  nom: string;
  prenom: string;
  numeroTable: string;
  notes: { matiere: string; note: number; coefficient: number }[];
  moyenne: number;
  decision: DecisionBepc;
  mention: string | null;
}

export type FeuilleAppel = Record<number, Presence>;
export type FeuilleNotes = Record<number, string>;
