"use client";

import { useState } from "react";
import { EnTete } from "@/components/ui";
import { ANNEE, CLASSES, ECOLE, PERIODE, bulletin, classementClasse, nomComplet, rangDansClasse } from "@/lib/data";
import { mention, note20 } from "@/lib/format";
import { useEcole } from "@/lib/store";

export default function PageBulletins() {
  const { eleves, role, annoncer } = useEcole();
  const parent = role === "Parent";

  const [classe, setClasse] = useState<(typeof CLASSES)[number]>(CLASSES[1]);
  const listeClasse = eleves.filter((e) => e.classe === classe);
  const defaut = parent ? 4 : (listeClasse[0]?.id ?? 1);
  const [eleveId, setEleveId] = useState<number>(defaut);

  const eleve = eleves.find((e) => e.id === eleveId) ?? eleves[0];
  const b = bulletin(eleve.id);
  const { rang, effectif } = rangDansClasse(eleve.id);
  const moyenneClasse =
    classementClasse(eleve.classe).reduce((s, c) => s + c.moyenne, 0) / effectif;
  const [appreciation, setAppreciation] = useState(
    "Trimestre sérieux. Des progrès nets en mathématiques ; l'expression écrite doit encore être travaillée.",
  );

  return (
    <>
      <EnTete
        titre="Bulletins"
        sous={`${PERIODE} · année ${ANNEE}`}
        actions={
          <>
            <button className="btn sec" onClick={() => annoncer("Bulletins de la classe envoyés en PDF.")}>
              Générer toute la classe
            </button>
            <button className="btn" onClick={() => window.print()}>Imprimer ce bulletin</button>
          </>
        }
      />

      {!parent && (
        <div className="barre-outils sans-impression">
          <select
            value={classe}
            onChange={(e) => {
              const c = e.target.value as (typeof CLASSES)[number];
              setClasse(c);
              const premier = eleves.find((x) => x.classe === c);
              if (premier) setEleveId(premier.id);
            }}
            aria-label="Choisir la classe"
          >
            {CLASSES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={eleveId} onChange={(e) => setEleveId(Number(e.target.value))} aria-label="Choisir l'élève">
            {listeClasse.map((e) => (
              <option key={e.id} value={e.id}>{nomComplet(e)}</option>
            ))}
          </select>
        </div>
      )}

      <div className="bulletin">
        <div className="bulletin-tete">
          <div>
            <p className="oeil">{ECOLE}</p>
            <h2>Bulletin — {PERIODE}</h2>
            <p className="sous">Année scolaire {ANNEE}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p className="nom" style={{ fontSize: 18 }}>{nomComplet(eleve)}</p>
            <p className="mat">{eleve.classe} · Matricule {eleve.matricule}</p>
            <p className="mat">Effectif de la classe : {effectif}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Matière</th>
              <th className="centre">Coef.</th>
              <th className="centre">Devoir 1</th>
              <th className="centre">Devoir 2</th>
              <th className="centre">Composition</th>
              <th className="centre">Moyenne</th>
              <th className="droite">Points (moy. × coef.)</th>
            </tr>
          </thead>
          <tbody>
            {b.lignes.map((l) => (
              <tr key={l.matiere.code}>
                <td className="nom">{l.matiere.nom}</td>
                <td className="centre nb">{l.matiere.coefficient}</td>
                <td className="centre nb">{l.note.devoir1}</td>
                <td className="centre nb">{l.note.devoir2}</td>
                <td className="centre nb">{l.note.composition}</td>
                <td className="centre nb">
                  <b style={{ color: l.moyenne < 10 ? "var(--brique)" : undefined }}>{note20(l.moyenne)}</b>
                </td>
                <td className="droite nb">{note20(l.points)}</td>
              </tr>
            ))}
            <tr className="total">
              <td>Total</td>
              <td className="centre nb">{b.totalCoef}</td>
              <td colSpan={3} />
              <td className="centre nb">{note20(b.moyenne)}</td>
              <td className="droite nb">{note20(b.totalPoints)}</td>
            </tr>
          </tbody>
        </table>

        <div className="grille g4" style={{ marginTop: 18 }}>
          <div className="carte">
            <p className="oeil">Moyenne générale</p>
            <p className="chiffre" style={{ fontSize: 26, fontWeight: 800 }}>{note20(b.moyenne)}/20</p>
          </div>
          <div className="carte">
            <p className="oeil">Rang</p>
            <p className="chiffre" style={{ fontSize: 26, fontWeight: 800 }}>{rang}<sup>{rang === 1 ? "er" : "e"}</sup> / {effectif}</p>
          </div>
          <div className="carte">
            <p className="oeil">Moyenne de la classe</p>
            <p className="chiffre" style={{ fontSize: 26, fontWeight: 800 }}>{note20(moyenneClasse)}/20</p>
          </div>
          <div className="carte">
            <p className="oeil">Mention</p>
            <p className="chiffre" style={{ fontSize: 20, fontWeight: 800, marginTop: 6 }}>{mention(b.moyenne)}</p>
          </div>
        </div>

        <div className="appreciation">
          <p className="oeil" style={{ marginBottom: 6 }}>Appréciation du conseil de classe</p>
          {parent ? (
            <p>{appreciation}</p>
          ) : (
            <textarea
              rows={3}
              value={appreciation}
              onChange={(e) => setAppreciation(e.target.value)}
              aria-label="Appréciation du conseil de classe"
            />
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26 }}>
          <p className="mat">Visa de l&apos;enseignant</p>
          <p className="mat">Visa du directeur</p>
          <p className="mat">Visa du parent</p>
        </div>
      </div>
    </>
  );
}
