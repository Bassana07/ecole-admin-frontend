"use client";

import { EnTete, Stat } from "@/components/ui";
import { PERSONNEL } from "@/lib/data";
import { useEcole } from "@/lib/store";

export default function PagePersonnel() {
  const { annoncer } = useEcole();
  const enseignants = PERSONNEL.filter((p) => p.fonction.startsWith("Enseignant"));
  const vacataires = PERSONNEL.filter((p) => p.statut === "Vacataire");

  return (
    <>
      <EnTete
        titre="Personnel"
        sous={`${PERSONNEL.length} personnes · ${enseignants.length} enseignants`}
        actions={<button className="btn" onClick={() => annoncer("Formulaire d'ajout de personnel à brancher.")}>Ajouter une personne</button>}
      />

      <div className="grille g4 mb">
        <Stat libelle="Effectif total" valeur={PERSONNEL.length} />
        <Stat libelle="Enseignants" valeur={enseignants.length} />
        <Stat libelle="Permanents" valeur={PERSONNEL.length - vacataires.length} />
        <Stat libelle="Vacataires" valeur={vacataires.length} />
      </div>

      <div className="carte nue">
        <table>
          <thead>
            <tr>
              <th>Nom</th><th>Fonction</th>
              <th className="cache-mobile">Matières</th>
              <th className="cache-mobile">Classes</th>
              <th>Statut</th><th className="cache-mobile">Téléphone</th>
            </tr>
          </thead>
          <tbody>
            {PERSONNEL.map((p) => (
              <tr key={p.id}>
                <td className="nom">{p.nom}</td>
                <td>{p.fonction}</td>
                <td className="cache-mobile">
                  {p.matieres.length ? p.matieres.join(", ") : <span className="muet">—</span>}
                </td>
                <td className="cache-mobile">
                  {p.classes.length ? p.classes.join(", ") : <span className="muet">—</span>}
                </td>
                <td>
                  <span className={`badge ${p.statut === "Permanent" ? "b-ok" : "b-info"}`}>{p.statut}</span>
                </td>
                <td className="cache-mobile mat">{p.tel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
