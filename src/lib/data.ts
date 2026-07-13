import type {
  Absence,
  Annonce,
  Cours,
  Echeance,
  Eleve,
  EvenementJournal,
  Matiere,
  MoyenPaiement,
  Note,
  Paiement,
  Personnel,
  ResultatBepc,
  Role,
} from "./types";

export const ECOLE = "Le Royaume du Savoir";
export const ANNEE = "2025–2026";
export const PERIODE = "2e trimestre";
export const FRAIS_SCOLARITE = 180_000;

/** Maternelle → collège (3e) */
export const CLASSES = [
  "PS", "MS", "GS",
  "CP", "CE1", "CE2", "CM1", "CM2",
  "6e", "5e", "4e", "3e",
] as const;

export const MATIERES: Matiere[] = [
  { code: "MAT", nom: "Mathématiques", coefficient: 4 },
  { code: "FRA", nom: "Français", coefficient: 4 },
  { code: "SVT", nom: "Sciences", coefficient: 2 },
  { code: "HG", nom: "Histoire-Géo", coefficient: 2 },
  { code: "ANG", nom: "Anglais", coefficient: 2 },
  { code: "EPS", nom: "EPS", coefficient: 1 },
];

export const MOYENS_PAIEMENT: MoyenPaiement[] = [
  "Orange Money",
  "Moov Money",
  "Espèces",
  "Virement bancaire",
];

export const ROLES: Role[] = ["Direction", "Secrétariat", "Comptabilité", "Enseignant", "Parent"];

export const UTILISATEURS: Record<Role, { nom: string; sous: string }> = {
  Direction: { nom: "Madame TRAORE", sous: "Directrice" },
  Secrétariat: { nom: "Mme Ouédraogo Aïcha", sous: "Secrétaire" },
  Comptabilité: { nom: "M. Sawadogo Boukary", sous: "Comptable" },
  Enseignant: { nom: "Mme Kaboré Léa", sous: "Enseignante — CM2" },
  Parent: { nom: "M. Traoré Adama", sous: "Parent de Traoré Ibrahim" },
};

/* ---------- Générateur déterministe (même rendu serveur et client) ---------- */
function alea(graine: number): () => number {
  let x = graine * 9301 + 49297;
  return () => {
    x = (x * 9301 + 49297) % 233280;
    return x / 233280;
  };
}
const entre = (r: () => number, min: number, max: number) => min + Math.floor(r() * (max - min + 1));

/* ---------- Élèves ---------- */
const NOMS = [
  ["Ouédraogo", "Aminata", "F"], ["Kaboré", "Yacouba", "M"], ["Sawadogo", "Awa", "F"],
  ["Traoré", "Ibrahim", "M"], ["Zongo", "Mariam", "F"], ["Compaoré", "Rachid", "M"],
  ["Nikiéma", "Salif", "M"], ["Ilboudo", "Fatimata", "F"], ["Bationo", "Karim", "M"],
  ["Congo", "Nafissatou", "F"], ["Yaméogo", "Éric", "M"], ["Tapsoba", "Bintou", "F"],
  ["Barry", "Souleymane", "M"], ["Sanou", "Kadiatou", "F"], ["Dabiré", "Moussa", "M"],
  ["Zerbo", "Safiatou", "F"], ["Kaboré", "Abdoulaye", "M"], ["Ouattara", "Djeneba", "F"],
  ["Sankara", "Thomas", "M"], ["Diallo", "Assèta", "F"], ["Kiéma", "Boureima", "M"],
  ["Nacoulma", "Ramata", "F"], ["Sory", "Hamidou", "M"], ["Palenfo", "Estelle", "F"],
] as const;

const QUARTIERS = ["Tanghin", "Gounghin", "Dassasgho", "Karpala", "Zogona", "Pissy", "Cissin"];

/** Année de naissance approximative selon le niveau (année scolaire 2025–2026) */
const ANNEE_NAISSANCE: Record<(typeof CLASSES)[number], number> = {
  PS: 2022, MS: 2021, GS: 2020,
  CP: 2019, CE1: 2018, CE2: 2017, CM1: 2016, CM2: 2015,
  "6e": 2014, "5e": 2013, "4e": 2012, "3e": 2011,
};

export const ELEVES: Eleve[] = NOMS.map(([nom, prenom, sexe], i) => {
  const r = alea(i + 7);
  const classe = CLASSES[i % CLASSES.length];
  const paye = [0, 60_000, 120_000, 180_000, 90_000, 150_000][entre(r, 0, 5)];
  const statutPossible = ["Validé", "Validé", "Validé", "Incomplet", "En attente"] as const;
  return {
    id: i + 1,
    nom,
    prenom,
    sexe: sexe as "F" | "M",
    naissance: `${entre(r, 1, 28)}/${String(entre(r, 1, 12)).padStart(2, "0")}/${ANNEE_NAISSANCE[classe]}`,
    matricule: `2025-0${142 + i}`,
    classe,
    redoublant: i % 9 === 0,
    statut: statutPossible[entre(r, 0, 4)],
    parent: `${sexe === "F" ? "M." : "Mme"} ${nom} ${["Issa", "Fati", "Paul", "Salam", "Adama", "Rose"][entre(r, 0, 5)]}`,
    tel: `7${entre(r, 0, 9)} ${entre(r, 10, 99)} ${entre(r, 10, 99)} ${entre(r, 10, 99)}`,
    email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@example.bf`,
    quartier: QUARTIERS[entre(r, 0, QUARTIERS.length - 1)],
    fraisTotal: FRAIS_SCOLARITE,
    paye,
  };
});

export const eleveParId = (id: number) => ELEVES.find((e) => e.id === id);
export const nomComplet = (e: Eleve) => `${e.nom} ${e.prenom}`;

/* ---------- Notes ---------- */
export const NOTES: Note[] = ELEVES.flatMap((e) =>
  MATIERES.map((m) => {
    const r = alea(e.id * 13 + m.nom.length);
    const base = entre(r, 7, 17);
    return {
      eleveId: e.id,
      matiere: m.nom,
      devoir1: Math.min(20, base + entre(r, -2, 3)),
      devoir2: Math.min(20, base + entre(r, -3, 3)),
      composition: Math.min(20, base + entre(r, -2, 2)),
    };
  }),
);

/** Moyenne d'une matière : (devoir1 + devoir2 + 2 × composition) / 4 */
export function moyenneMatiere(n: Note): number {
  return (n.devoir1 + n.devoir2 + 2 * n.composition) / 4;
}

export function bulletin(eleveId: number) {
  const lignes = MATIERES.map((m) => {
    const n = NOTES.find((x) => x.eleveId === eleveId && x.matiere === m.nom)!;
    const moyenne = moyenneMatiere(n);
    return { matiere: m, note: n, moyenne, points: moyenne * m.coefficient };
  });
  const totalCoef = MATIERES.reduce((s, m) => s + m.coefficient, 0);
  const totalPoints = lignes.reduce((s, l) => s + l.points, 0);
  return { lignes, totalCoef, totalPoints, moyenne: totalPoints / totalCoef };
}

export function classementClasse(classe: string) {
  return ELEVES.filter((e) => e.classe === classe)
    .map((e) => ({ eleve: e, moyenne: bulletin(e.id).moyenne }))
    .sort((a, b) => b.moyenne - a.moyenne);
}

export function rangDansClasse(eleveId: number): { rang: number; effectif: number } {
  const e = eleveParId(eleveId)!;
  const cl = classementClasse(e.classe);
  return { rang: cl.findIndex((x) => x.eleve.id === eleveId) + 1, effectif: cl.length };
}

/* ---------- Absences ---------- */
const MOTIFS = ["Maladie", "Raison familiale", "Non justifié", "Rendez-vous médical", "Transport"];

export const ABSENCES: Absence[] = ELEVES.flatMap((e) => {
  const r = alea(e.id * 31);
  const nb = entre(r, 0, 4);
  return Array.from({ length: nb }, (_, k) => {
    const motif = MOTIFS[entre(r, 0, MOTIFS.length - 1)];
    return {
      id: e.id * 10 + k,
      eleveId: e.id,
      date: `${String(entre(r, 1, 28)).padStart(2, "0")}/0${entre(r, 4, 6)}/2026`,
      type: (entre(r, 0, 3) === 0 ? "Retard" : "Absence") as "Absence" | "Retard",
      motif,
      justifiee: motif !== "Non justifié",
    };
  });
});

/* ---------- Paiements ---------- */
export const PAIEMENTS: Paiement[] = ELEVES.flatMap((e) => {
  if (e.paye === 0) return [];
  const r = alea(e.id * 17);
  const tranches = e.paye >= 180_000 ? 2 : 1;
  const part = e.paye / tranches;
  return Array.from({ length: tranches }, (_, k) => ({
    id: e.id * 100 + k,
    eleveId: e.id,
    date: `${String(entre(r, 1, 28)).padStart(2, "0")}/${k === 0 ? "10/2025" : "01/2026"}`,
    montant: part,
    moyen: MOYENS_PAIEMENT[entre(r, 0, 3)],
    recu: `R-2025-${String(e.id * 10 + k).padStart(4, "0")}`,
  }));
});

export const ECHEANCIER: Echeance[] = [
  { libelle: "1re tranche — inscription", date: "15/10/2025", montant: 60_000 },
  { libelle: "2e tranche", date: "15/01/2026", montant: 60_000 },
  { libelle: "3e tranche", date: "15/04/2026", montant: 60_000 },
];

export const AUTRES_FRAIS = [
  { libelle: "Cantine (mensuel)", montant: 8_000 },
  { libelle: "Transport (mensuel)", montant: 12_000 },
  { libelle: "Tenue scolaire", montant: 7_500 },
  { libelle: "Frais d'examen", montant: 5_000 },
];

/* ---------- Personnel ---------- */
export const PERSONNEL: Personnel[] = [
  { id: 0, nom: "Madame TRAORE", fonction: "Directrice", matieres: [], classes: [], tel: "70 00 11 22", statut: "Permanent" },
  { id: 1, nom: "Mme Kaboré Léa", fonction: "Enseignante", matieres: ["Mathématiques", "Sciences"], classes: ["CM2"], tel: "70 11 22 33", statut: "Permanent" },
  { id: 2, nom: "M. Zoungrana Paul", fonction: "Enseignant", matieres: ["Français", "Histoire-Géo"], classes: ["CM1", "CM2"], tel: "76 44 55 66", statut: "Permanent" },
  { id: 3, nom: "Mme Sanou Clarisse", fonction: "Enseignante", matieres: ["Mathématiques", "Français"], classes: ["CE1", "CE2"], tel: "78 77 88 99", statut: "Permanent" },
  { id: 4, nom: "M. Ilboudo Serge", fonction: "Enseignant", matieres: ["Anglais"], classes: ["CM2", "6e", "5e", "4e", "3e"], tel: "71 23 45 67", statut: "Vacataire" },
  { id: 5, nom: "M. Ouédraogo Hamed", fonction: "Enseignant", matieres: ["Sciences", "Histoire-Géo"], classes: ["6e", "5e", "4e", "3e"], tel: "75 89 01 23", statut: "Permanent" },
  { id: 6, nom: "M. Kagoné Salif", fonction: "Enseignant", matieres: ["EPS"], classes: ["CP", "CE1", "CE2", "CM1", "CM2", "6e", "5e", "4e", "3e"], tel: "79 34 56 78", statut: "Vacataire" },
  { id: 7, nom: "Mme Diallo Amina", fonction: "Enseignante", matieres: ["Éveil"], classes: ["PS", "MS", "GS"], tel: "70 45 67 89", statut: "Permanent" },
  { id: 8, nom: "Mme Tapsoba Claire", fonction: "Enseignante", matieres: ["Français", "Mathématiques"], classes: ["CP"], tel: "74 12 34 56", statut: "Permanent" },
  { id: 9, nom: "Mme Ouédraogo Aïcha", fonction: "Secrétaire", matieres: [], classes: [], tel: "70 90 12 34", statut: "Permanent" },
  { id: 10, nom: "M. Sawadogo Boukary", fonction: "Comptable", matieres: [], classes: [], tel: "76 56 78 90", statut: "Permanent" },
];

/* ---------- Emploi du temps ---------- */
export const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
export const CRENEAUX = ["07h30 – 09h30", "09h45 – 11h45", "15h00 – 17h00"];

const PLAN: [string, string, string][] = [
  ["Mathématiques", "Mme Kaboré Léa", "Salle 1"],
  ["Français", "M. Zoungrana Paul", "Salle 1"],
  ["Sciences", "Mme Kaboré Léa", "Salle 2"],
  ["Histoire-Géo", "M. Zoungrana Paul", "Salle 1"],
  ["Anglais", "M. Ilboudo Serge", "Salle 3"],
  ["EPS", "M. Kagoné Salif", "Terrain"],
];

export function emploiDuTemps(classe: string): Cours[] {
  const r = alea(classe.length * 41 + classe.charCodeAt(0));
  const cours: Cours[] = [];
  for (let jour = 0; jour < JOURS.length; jour++) {
    for (let creneau = 0; creneau < CRENEAUX.length; creneau++) {
      if (jour === 2 && creneau === 2) continue; // mercredi après-midi libre
      const [matiere, enseignant, salle] = PLAN[entre(r, 0, PLAN.length - 1)];
      cours.push({ jour, creneau, matiere, enseignant, salle });
    }
  }
  return cours;
}

/* ---------- Résultats BEPC ---------- */
export const SESSION_BEPC = "Session juin 2026";

export const MATIERES_BEPC = [
  { nom: "Français", coefficient: 4 },
  { nom: "Mathématiques", coefficient: 4 },
  { nom: "Histoire-Géographie", coefficient: 2 },
  { nom: "Sciences", coefficient: 2 },
  { nom: "Anglais", coefficient: 2 },
  { nom: "EPS", coefficient: 1 },
] as const;

function mentionBepc(moyenne: number): string | null {
  if (moyenne >= 16) return "Très Bien";
  if (moyenne >= 14) return "Bien";
  if (moyenne >= 12) return "Assez Bien";
  if (moyenne >= 10) return "Passable";
  return null;
}

/** Candidats inscrits (classe de 3e) + quelques candidats libres de la session. */
const CANDIDATS_BEPC_EXTRA: { nom: string; prenom: string }[] = [
  ["Kaboré", "Salamata"],
  ["Ouédraogo", "Ismaël"],
  ["Sawadogo", "Fati"],
  ["Zongo", "Abdoul"],
  ["Compaoré", "Aïssata"],
  ["Traoré", "Moussa"],
].map(([nom, prenom]) => ({ nom, prenom }));

export const RESULTATS_BEPC: ResultatBepc[] = (() => {
  const inscrits = ELEVES.filter((e) => e.classe === "3e").map((e) => ({
    eleveId: e.id as number | null,
    nom: e.nom,
    prenom: e.prenom,
  }));
  const libres = CANDIDATS_BEPC_EXTRA.map((c) => ({ eleveId: null as number | null, ...c }));
  const tous = [...inscrits, ...libres];

  return tous.map((c, i) => {
    const r = alea(900 + i * 17);
    const absent = i === tous.length - 1;
    const notes = MATIERES_BEPC.map((m) => ({
      matiere: m.nom,
      note: absent ? 0 : Math.min(20, entre(r, 6, 18) + (i % 3 === 0 ? 2 : 0)),
      coefficient: m.coefficient,
    }));
    const totalCoef = notes.reduce((s, n) => s + n.coefficient, 0);
    const moyenne = absent ? 0 : notes.reduce((s, n) => s + n.note * n.coefficient, 0) / totalCoef;
    const decision = absent ? "Absent" : moyenne >= 10 ? "Admis" : "Ajourné";
    return {
      id: i + 1,
      eleveId: c.eleveId,
      nom: c.nom,
      prenom: c.prenom,
      numeroTable: `BEPC-26-${String(101 + i).padStart(3, "0")}`,
      notes,
      moyenne: Math.round(moyenne * 100) / 100,
      decision: decision as ResultatBepc["decision"],
      mention: decision === "Admis" ? mentionBepc(moyenne) : null,
    };
  }).sort((a, b) => b.moyenne - a.moyenne);
})();

export function nomCompletBepc(r: ResultatBepc) {
  return `${r.nom} ${r.prenom}`;
}

/* ---------- Communication ---------- */
export const ANNONCES: Annonce[] = [
  { id: 1, date: "10/07/2026", titre: "Remise des bulletins du 2e trimestre", corps: "Les bulletins seront remis aux parents samedi 18 juillet, de 8h à 12h, dans les salles de classe.", canal: "SMS", cible: "Tous les parents", destinataires: 24, statut: "Envoyée" },
  { id: 2, date: "08/07/2026", titre: "Rappel : 3e tranche de scolarité", corps: "La troisième tranche est attendue avant le 15 avril. Paiement possible par Orange Money ou Moov Money.", canal: "SMS", cible: "Familles avec impayés", destinataires: 11, statut: "Envoyée" },
  { id: 3, date: "05/07/2026", titre: "Journée culturelle", corps: "La journée culturelle de l'école aura lieu le 25 juillet. Les élèves peuvent venir en tenue traditionnelle.", canal: "Application", cible: "Tous", destinataires: 24, statut: "Envoyée" },
  { id: 4, date: "14/07/2026", titre: "Réunion des enseignants", corps: "Conseil de classe du 2e trimestre, lundi 14 juillet à 16h en salle des maîtres.", canal: "E-mail", cible: "Enseignants", destinataires: 6, statut: "Programmée" },
  { id: 5, date: "12/07/2026", titre: "Résultats du BEPC 2026", corps: "Les résultats du BEPC session juin 2026 sont disponibles. Consultez la page Résultats BEPC ou passez au secrétariat.", canal: "SMS", cible: "Parents des candidats", destinataires: 8, statut: "Envoyée" },
  { id: 6, date: "—", titre: "Inscriptions 2026–2027", corps: "Ouverture des réinscriptions à partir du 1er août.", canal: "SMS", cible: "Tous les parents", destinataires: 24, statut: "Brouillon" },
];

/* ---------- Journal d'activité ---------- */
export const JOURNAL: EvenementJournal[] = [
  { id: 1, date: "12/07/2026 09:14", auteur: "Mme Ouédraogo Aïcha", role: "Secrétariat", action: "Inscription validée — Palenfo Estelle (6e)" },
  { id: 2, date: "12/07/2026 08:52", auteur: "M. Sawadogo Boukary", role: "Comptabilité", action: "Paiement encaissé — 60 000 F, Orange Money, reçu R-2025-0071" },
  { id: 3, date: "12/07/2026 08:10", auteur: "Madame TRAORE", role: "Direction", action: "Publication des résultats BEPC — session juin 2026" },
  { id: 4, date: "11/07/2026 17:30", auteur: "Mme Kaboré Léa", role: "Enseignant", action: "Notes saisies — Mathématiques, composition, CM2" },
  { id: 5, date: "11/07/2026 11:05", auteur: "Mme Kaboré Léa", role: "Enseignant", action: "Appel enregistré — CM2, 2 absents" },
  { id: 6, date: "10/07/2026 16:40", auteur: "Madame TRAORE", role: "Direction", action: "Annonce envoyée par SMS à 24 parents" },
  { id: 7, date: "10/07/2026 10:22", auteur: "Madame TRAORE", role: "Direction", action: "Rôle modifié — M. Ilboudo Serge : Enseignant" },
  { id: 8, date: "09/07/2026 15:18", auteur: "Mme Ouédraogo Aïcha", role: "Secrétariat", action: "Sauvegarde automatique effectuée" },
  { id: 9, date: "09/07/2026 08:03", auteur: "M. Sawadogo Boukary", role: "Comptabilité", action: "Relance envoyée — 11 familles" },
];

/* ---------- Séries pour les graphiques ---------- */
export const PRESENCE_HEBDO = [
  { label: "Lun", valeur: 96 }, { label: "Mar", valeur: 93 }, { label: "Mer", valeur: 91 },
  { label: "Jeu", valeur: 95 }, { label: "Ven", valeur: 88 },
];

export const RECOUVREMENT_MENSUEL = [
  { label: "Oct", valeur: 1_260_000 }, { label: "Nov", valeur: 540_000 },
  { label: "Déc", valeur: 300_000 }, { label: "Jan", valeur: 980_000 },
  { label: "Fév", valeur: 420_000 }, { label: "Mar", valeur: 360_000 },
];
