"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ELEVES, JOURNAL, PAIEMENTS, UTILISATEURS } from "./data";
import type {
  Eleve,
  EvenementJournal,
  FeuilleAppel,
  FeuilleNotes,
  MoyenPaiement,
  Paiement,
  Presence,
  Role,
} from "./types";

interface EcoleContexte {
  role: Role;
  utilisateur: { nom: string; sous: string };
  changerRole: (role: Role) => void;

  eleves: Eleve[];
  paiements: Paiement[];
  journal: EvenementJournal[];
  appel: FeuilleAppel;
  notes: FeuilleNotes;
  message: string | null;

  pointer: (eleveId: number, presence: Presence) => void;
  pointerTous: (classe: string, presence: Presence) => void;
  noter: (eleveId: number, note: string) => void;
  reinitialiserNotes: () => void;
  encaisser: (eleveId: number, montant: number, moyen: MoyenPaiement) => number;
  annoncer: (texte: string) => void;
  tracer: (action: string) => void;
}

const Contexte = createContext<EcoleContexte | null>(null);

export function EcoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("Direction");
  const [eleves, setEleves] = useState<Eleve[]>(ELEVES);
  const [paiements, setPaiements] = useState<Paiement[]>(PAIEMENTS);
  const [journal, setJournal] = useState<EvenementJournal[]>(JOURNAL);
  const [appel, setAppel] = useState<FeuilleAppel>({});
  const [notes, setNotes] = useState<FeuilleNotes>({});
  const [message, setMessage] = useState<string | null>(null);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);
  const compteur = useRef(1000);

  const annoncer = useCallback((texte: string) => {
    setMessage(texte);
    if (minuteur.current) clearTimeout(minuteur.current);
    minuteur.current = setTimeout(() => setMessage(null), 3000);
  }, []);

  const tracer = useCallback(
    (action: string) => {
      const u = UTILISATEURS[role];
      setJournal((j) => [
        { id: ++compteur.current, date: "À l'instant", auteur: u.nom, role, action },
        ...j,
      ]);
    },
    [role],
  );

  const changerRole = useCallback((r: Role) => setRole(r), []);

  const pointer = useCallback((eleveId: number, presence: Presence) => {
    setAppel((f) => ({ ...f, [eleveId]: presence }));
  }, []);

  const pointerTous = useCallback(
    (classe: string, presence: Presence) => {
      setAppel((f) => {
        const suite = { ...f };
        for (const e of eleves) if (e.classe === classe) suite[e.id] = presence;
        return suite;
      });
    },
    [eleves],
  );

  const noter = useCallback((eleveId: number, note: string) => {
    setNotes((f) => ({ ...f, [eleveId]: note }));
  }, []);

  const reinitialiserNotes = useCallback(() => setNotes({}), []);

  const encaisser = useCallback(
    (eleveId: number, montant: number, moyen: MoyenPaiement) => {
      const eleve = eleves.find((e) => e.id === eleveId);
      if (!eleve) return 0;
      const reste = eleve.fraisTotal - eleve.paye;
      const encaisse = Math.max(0, Math.min(montant, reste));
      if (encaisse === 0) return 0;

      setEleves((liste) =>
        liste.map((e) => (e.id === eleveId ? { ...e, paye: e.paye + encaisse } : e)),
      );
      setPaiements((liste) => [
        {
          id: ++compteur.current,
          eleveId,
          date: "12/07/2026",
          montant: encaisse,
          moyen,
          recu: `R-2026-${String(compteur.current).slice(-4)}`,
        },
        ...liste,
      ]);
      return encaisse;
    },
    [eleves],
  );

  const valeur = useMemo<EcoleContexte>(
    () => ({
      role,
      utilisateur: UTILISATEURS[role],
      changerRole,
      eleves,
      paiements,
      journal,
      appel,
      notes,
      message,
      pointer,
      pointerTous,
      noter,
      reinitialiserNotes,
      encaisser,
      annoncer,
      tracer,
    }),
    [role, changerRole, eleves, paiements, journal, appel, notes, message, pointer, pointerTous, noter, reinitialiserNotes, encaisser, annoncer, tracer],
  );

  return <Contexte.Provider value={valeur}>{children}</Contexte.Provider>;
}

export function useEcole(): EcoleContexte {
  const contexte = useContext(Contexte);
  if (!contexte) throw new Error("useEcole doit être utilisé dans <EcoleProvider>");
  return contexte;
}
