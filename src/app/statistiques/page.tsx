"use client";

import { useState } from "react";
import { Anneau, Barres, Courbe } from "@/components/Charts";
import { EnTete, Onglets, Stat } from "@/components/ui";
import {
  ABSENCES,
  CLASSES,
  MATIERES,
  NOTES,
  PRESENCE_HEBDO,
  RECOUVREMENT_MENSUEL,
  bulletin,
  moyenneMatiere,
} from "@/lib/data";
import { fcfa, fcfaCourt, note20 } from "@/lib/format";
import { useEcole } from "@/lib/store";

const ONGLETS = ["Scolarité", "Résultats", "Finances"] as const;

export default function PageStatistiques() {
  const { eleves, annoncer } = useEcole();
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]>("Scolarité");

  const encaisse = eleves.reduce((s, e) => s + e.paye, 0);
  const attendu = eleves.reduce((s, e) => s + e.fraisTotal, 0);
  const filles = eleves.filter((e) => e.sexe === "F").length;

  const parClasse = CLASSES.map((c) => ({
    label: c,
    valeur: eleves.filter((e) => e.classe === c).length,
  }));

  const moyennesParMatiere = MATIERES.map((m) => {
    const notes = NOTES.filter((n) => n.matiere === m.nom);
    const moy = notes.reduce((s, n) => s + moyenneMatiere(n), 0) / notes.length;
    return { label: m.code, valeur: Number(moy.toFixed(1)) };
  });

  const moyennesParClasse = CLASSES.map((c) => {
    const liste = eleves.filter((e) => e.classe === c);
    const moy = liste.reduce((s, e) => s + bulletin(e.id).moyenne, 0) / (liste.length || 1);
    return { label: c, valeur: Number(moy.toFixed(1)) };
  });

  const moyenneEcole = eleves.reduce((s, e) => s + bulletin(e.id).moyenne, 0) / eleves.length;
  const admis = eleves.filter((e) => bulletin(e.id).moyenne >= 10).length;

  return (
    <>
      <EnTete
        titre="Statistiques"
        sous="Vue d'ensemble de l'année — effectifs, résultats et finances."
        actions={<button className="btn sec" onClick={() => annoncer("Rapport exporté en PDF.")}>Exporter le rapport</button>}
      />

      <Onglets onglets={ONGLETS} actif={onglet} onChange={setOnglet} />

      {onglet === "Scolarité" && (
        <>
          <div className="grille g4 mb">
            <Stat libelle="Effectif total" valeur={eleves.length} />
            <Stat libelle="Filles" valeur={`${Math.round((filles / eleves.length) * 100)} %`} />
            <Stat libelle="Redoublants" valeur={eleves.filter((e) => e.redoublant).length} />
            <Stat libelle="Absences non justifiées" valeur={ABSENCES.filter((a) => !a.justifiee).length} alerte />
          </div>

          <div className="grille g2">
            <div className="carte">
              <p className="oeil" style={{ marginBottom: 8 }}>Effectif par classe</p>
              <Barres donnees={parClasse} />
            </div>
            <div className="carte">
              <p className="oeil" style={{ marginBottom: 8 }}>Présence — semaine en cours</p>
              <Courbe donnees={PRESENCE_HEBDO} suffixe="%" />
            </div>
          </div>
        </>
      )}

      {onglet === "Résultats" && (
        <>
          <div className="grille g4 mb">
            <Stat libelle="Moyenne de l'école" valeur={`${note20(moyenneEcole)}/20`} />
            <Stat libelle="Élèves au-dessus de 10" valeur={`${admis} / ${eleves.length}`} />
            <Stat libelle="Taux de réussite" valeur={`${Math.round((admis / eleves.length) * 100)} %`} />
            <Stat libelle="Matières évaluées" valeur={MATIERES.length} />
          </div>

          <div className="grille g2">
            <div className="carte">
              <p className="oeil" style={{ marginBottom: 8 }}>Moyenne par matière</p>
              <Barres donnees={moyennesParMatiere} couleur="var(--indigo)" />
            </div>
            <div className="carte">
              <p className="oeil" style={{ marginBottom: 8 }}>Moyenne par classe</p>
              <Barres donnees={moyennesParClasse} couleur="var(--vert)" />
            </div>
          </div>
        </>
      )}

      {onglet === "Finances" && (
        <>
          <div className="grille g4 mb">
            <Stat libelle="Encaissé" valeur={fcfa(encaisse)} />
            <Stat libelle="Attendu" valeur={fcfa(attendu)} />
            <Stat libelle="Taux de recouvrement" valeur={`${Math.round((encaisse / attendu) * 100)} %`} />
            <Stat libelle="Reste à recouvrer" valeur={fcfa(attendu - encaisse)} alerte />
          </div>

          <div className="grille g2">
            <div className="carte">
              <p className="oeil" style={{ marginBottom: 8 }}>Encaissements par mois</p>
              <Barres donnees={RECOUVREMENT_MENSUEL} format={fcfaCourt} />
            </div>
            <div className="carte">
              <p className="oeil" style={{ marginBottom: 10 }}>Situation des familles</p>
              <Anneau
                centre={`${Math.round((encaisse / attendu) * 100)} %`}
                legende="recouvré"
                parts={[
                  { label: "Soldées", valeur: eleves.filter((e) => e.paye >= e.fraisTotal).length, couleur: "var(--vert)" },
                  { label: "Partielles", valeur: eleves.filter((e) => e.paye > 0 && e.paye < e.fraisTotal).length, couleur: "var(--karite)" },
                  { label: "Sans versement", valeur: eleves.filter((e) => e.paye === 0).length, couleur: "var(--brique)" },
                ]}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
}
