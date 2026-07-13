"use client";

import { useState } from "react";
import { Avatar, EnTete, Onglets, Puces, Stat } from "@/components/ui";
import { ABSENCES, CLASSES, CRENEAUX, eleveParId, nomComplet } from "@/lib/data";
import { pluriel } from "@/lib/format";
import { useEcole } from "@/lib/store";
import type { Presence } from "@/lib/types";

const ONGLETS = ["Appel du jour", "Récapitulatif"] as const;

const CHOIX: { valeur: Presence; libelle: string; classe: string }[] = [
  { valeur: "P", libelle: "Présent", classe: "p" },
  { valeur: "R", libelle: "Retard", classe: "r" },
  { valeur: "A", libelle: "Absent", classe: "a" },
];

export default function PagePresences() {
  const { eleves, appel, pointer, pointerTous, annoncer, tracer } = useEcole();
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]>("Appel du jour");
  const [classe, setClasse] = useState<(typeof CLASSES)[number]>(CLASSES[1]);
  const [creneau, setCreneau] = useState(CRENEAUX[0]);

  const liste = eleves.filter((e) => e.classe === classe);
  const pointes = liste.filter((e) => appel[e.id]).length;
  const absents = liste.filter((e) => appel[e.id] === "A").length;
  const retards = liste.filter((e) => appel[e.id] === "R").length;

  function enregistrer() {
    tracer(`Appel enregistré — ${classe}, ${absents} ${pluriel(absents, "absent")}`);
    annoncer(
      absents > 0
        ? `Appel enregistré. ${absents} ${pluriel(absents, "absent")} — SMS envoyé aux parents.`
        : "Appel enregistré. Aucune absence.",
    );
  }

  return (
    <>
      <EnTete titre="Présences" sous="Appel par cours, justificatifs et récapitulatif du trimestre." />

      <Onglets onglets={ONGLETS} actif={onglet} onChange={setOnglet} />

      {onglet === "Appel du jour" && (
        <>
          <div className="barre-outils">
            <Puces options={CLASSES} actif={classe} onChange={setClasse} libelle="Choisir la classe" />
            <select value={creneau} onChange={(e) => setCreneau(e.target.value)} aria-label="Choisir le créneau">
              {CRENEAUX.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div className="barre-outils">
            <button className="btn sec" onClick={() => pointerTous(classe, "P")}>Tout le monde est présent</button>
            <button className="btn sec" onClick={() => pointerTous(classe, "A")}>Tout le monde est absent</button>
          </div>

          <div className="grille g4 mb">
            <Stat libelle="Pointés" valeur={`${pointes} / ${liste.length}`} />
            <Stat libelle="Présents" valeur={liste.filter((e) => appel[e.id] === "P").length} />
            <Stat libelle="Retards" valeur={retards} />
            <Stat libelle="Absents" valeur={absents} alerte={absents > 0} />
          </div>

          <div className="carte nue">
            <table>
              <tbody>
                {liste.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <span className="cellule-eleve">
                        <Avatar eleve={e} />
                        <span>
                          <span className="nom">{nomComplet(e)}</span>
                          <br />
                          <span className="mat">{e.matricule}</span>
                        </span>
                      </span>
                    </td>
                    <td>
                      <div className="choix" role="group" aria-label={`Présence de ${nomComplet(e)}`}>
                        {CHOIX.map((c) => (
                          <button
                            key={c.valeur}
                            className={c.classe}
                            aria-pressed={appel[e.id] === c.valeur}
                            onClick={() => pointer(e.id, c.valeur)}
                          >
                            {c.libelle}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="action-bas">
            <span className="info">
              {classe} · {creneau} — {pointes} {pluriel(pointes, "élève")} sur {liste.length} {pluriel(pointes, "pointé")}
            </span>
            <button className="btn" onClick={enregistrer} disabled={pointes === 0}>
              Enregistrer l&apos;appel
            </button>
          </div>
        </>
      )}

      {onglet === "Récapitulatif" && (
        <>
          <div className="grille g4 mb">
            <Stat libelle="Absences du trimestre" valeur={ABSENCES.filter((a) => a.type === "Absence").length} />
            <Stat libelle="Retards" valeur={ABSENCES.filter((a) => a.type === "Retard").length} />
            <Stat libelle="Non justifiées" valeur={ABSENCES.filter((a) => !a.justifiee).length} alerte />
            <Stat libelle="Taux de présence" valeur="93 %" />
          </div>

          <div className="carte nue">
            <div className="carte-tete">
              <h3>Dernières absences</h3>
              <button className="btn sec petit" onClick={() => annoncer("Relance envoyée aux parents concernés.")}>
                Relancer les non justifiées
              </button>
            </div>
            <table>
              <thead>
                <tr><th>Élève</th><th className="cache-mobile">Classe</th><th>Date</th><th>Type</th><th className="cache-mobile">Motif</th><th className="droite">Justifiée</th></tr>
              </thead>
              <tbody>
                {ABSENCES.slice(0, 14).map((a) => {
                  const e = eleveParId(a.eleveId)!;
                  return (
                    <tr key={a.id}>
                      <td className="nom">{nomComplet(e)}</td>
                      <td className="cache-mobile">{e.classe}</td>
                      <td className="nb">{a.date}</td>
                      <td><span className={`badge ${a.type === "Retard" ? "b-att" : "b-info"}`}>{a.type}</span></td>
                      <td className="cache-mobile">{a.motif}</td>
                      <td className="droite">
                        <span className={`badge ${a.justifiee ? "b-ok" : "b-non"}`}>{a.justifiee ? "Oui" : "Non"}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
