"use client";

import { useState } from "react";
import { EnTete, Puces, Stat } from "@/components/ui";
import { CLASSES, CRENEAUX, JOURS, MATIERES, classementClasse, emploiDuTemps } from "@/lib/data";
import { note20 } from "@/lib/format";
import { useEcole } from "@/lib/store";

export default function PageClasses() {
  const { eleves, annoncer } = useEcole();
  const [classe, setClasse] = useState<(typeof CLASSES)[number]>(CLASSES[1]);

  const effectif = eleves.filter((e) => e.classe === classe);
  const filles = effectif.filter((e) => e.sexe === "F").length;
  const cours = emploiDuTemps(classe);
  const classement = classementClasse(classe);
  const moyenne = classement.reduce((s, c) => s + c.moyenne, 0) / (classement.length || 1);

  return (
    <>
      <EnTete
        titre="Classes et emplois du temps"
        sous={`${CLASSES.length} classes · ${MATIERES.length} matières`}
        actions={<button className="btn sec" onClick={() => annoncer("Emploi du temps envoyé à l'impression.")}>Imprimer l&apos;emploi du temps</button>}
      />

      <div className="barre-outils">
        <Puces options={CLASSES} actif={classe} onChange={setClasse} libelle="Choisir la classe" />
      </div>

      <div className="grille g4 mb">
        <Stat libelle="Effectif" valeur={effectif.length} />
        <Stat libelle="Filles / garçons" valeur={`${filles} / ${effectif.length - filles}`} />
        <Stat libelle="Moyenne de classe" valeur={`${note20(moyenne)}/20`} />
        <Stat libelle="Heures par semaine" valeur={`${cours.length * 2} h`} />
      </div>

      <div className="carte mb">
        <p className="oeil" style={{ marginBottom: 12 }}>Emploi du temps — {classe}</p>
        <div className="defile">
          <div className="edt">
            <div />
            {JOURS.map((j) => (
              <div key={j} className="tete">{j}</div>
            ))}

            {CRENEAUX.map((creneau, iC) => (
              <div key={creneau} style={{ display: "contents" }}>
                <div className="heure">{creneau}</div>
                {JOURS.map((jour, iJ) => {
                  const c = cours.find((x) => x.jour === iJ && x.creneau === iC);
                  return c ? (
                    <div key={jour} className="case">
                      <b>{c.matiere}</b>
                      <small>{c.enseignant}</small>
                      <small>{c.salle}</small>
                    </div>
                  ) : (
                    <div key={jour} className="case vide" />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grille g2">
        <div className="carte nue">
          <div className="carte-tete"><h3>Matières et coefficients</h3></div>
          <table>
            <tbody>
              {MATIERES.map((m) => (
                <tr key={m.code}>
                  <td className="nom">{m.nom}</td>
                  <td className="mat">{m.code}</td>
                  <td className="droite"><span className="badge b-neutre">coef. {m.coefficient}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="carte nue">
          <div className="carte-tete"><h3>Classement — {classe}</h3><span className="mat">2e trimestre</span></div>
          <table>
            <tbody>
              {classement.map((c, i) => (
                <tr key={c.eleve.id}>
                  <td className="mat" style={{ width: 34 }}>{i + 1}</td>
                  <td className="nom">{c.eleve.nom} {c.eleve.prenom}</td>
                  <td className="droite nb">
                    <b style={{ color: c.moyenne < 10 ? "var(--brique)" : undefined }}>{note20(c.moyenne)}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
