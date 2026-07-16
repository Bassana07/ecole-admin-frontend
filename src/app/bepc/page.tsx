"use client";

import { useMemo, useState } from "react";
import { EnTete, Onglets, Puces, Stat } from "@/components/ui";
import {
  ANNEE,
  ECOLE,
  SESSION_EXAMEN,
  nomCompletBepc,
  resultatsExamen,
} from "@/lib/data";
import { note20, pluriel } from "@/lib/format";
import type { DecisionBepc, TypeExamen } from "@/lib/types";

const EXAMENS = ["CEP", "BEPC"] as const;
const FILTRES = ["Tous", "Admis", "Ajourné", "Absent"] as const;

const LIBELLE_EXAMEN: Record<TypeExamen, string> = {
  CEP: "Certificat d'Études Primaires",
  BEPC: "Brevet d'Études du Premier Cycle",
};

function badgeDecision(d: DecisionBepc) {
  if (d === "Admis") return "b-ok";
  if (d === "Ajourné") return "b-non";
  return "b-neutre";
}

export default function PageExamen() {
  const [examen, setExamen] = useState<TypeExamen>("BEPC");
  const [filtre, setFiltre] = useState<(typeof FILTRES)[number]>("Tous");
  const [recherche, setRecherche] = useState("");
  const [candidatId, setCandidatId] = useState<number | null>(null);

  const resultats = useMemo(() => resultatsExamen(examen), [examen]);

  const admis = resultats.filter((r) => r.decision === "Admis").length;
  const ajournes = resultats.filter((r) => r.decision === "Ajourné").length;
  const absents = resultats.filter((r) => r.decision === "Absent").length;
  const presents = resultats.length - absents;
  const taux = presents ? Math.round((admis / presents) * 100) : 0;

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return resultats.filter((r) => {
      if (filtre !== "Tous" && r.decision !== filtre) return false;
      if (!q) return true;
      return (
        nomCompletBepc(r).toLowerCase().includes(q) ||
        r.numeroTable.toLowerCase().includes(q)
      );
    });
  }, [resultats, filtre, recherche]);

  const candidat =
    resultats.find((r) => r.id === candidatId) ?? liste[0] ?? resultats[0];

  const changerExamen = (e: TypeExamen) => {
    setExamen(e);
    setCandidatId(null);
    setFiltre("Tous");
  };

  const classeCandidat = examen === "CEP" ? "CM2" : "3e";

  return (
    <>
      <EnTete
        titre="Examen national"
        sous={`${ECOLE} · CEP et BEPC · ${SESSION_EXAMEN} · année ${ANNEE}`}
        actions={
          <button className="btn sec" onClick={() => window.print()}>
            Imprimer
          </button>
        }
      />

      <div className="sans-impression" style={{ marginBottom: 16 }}>
        <Onglets onglets={EXAMENS} actif={examen} onChange={changerExamen} />
        <p className="sous" style={{ marginTop: 6 }}>{LIBELLE_EXAMEN[examen]}</p>
      </div>

      <div className="grille g4 mb">
        <Stat libelle="Candidats" valeur={resultats.length} />
        <Stat libelle="Admis" valeur={admis} delta={`${pluriel(admis, "candidat")}`} sens="up" />
        <Stat libelle="Ajournés" valeur={ajournes} sens="down" />
        <Stat libelle="Taux de réussite" valeur={`${taux} %`} delta={`${absents} ${pluriel(absents, "absent")}`} />
      </div>

      <div className="barre-outils sans-impression">
        <input
          type="search"
          placeholder="Rechercher un candidat ou un n° de table…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          aria-label="Rechercher un candidat"
        />
        <Puces options={FILTRES} actif={filtre} onChange={setFiltre} libelle="Filtrer par décision" />
      </div>

      <div className="grille g-2-1">
        <div className="carte nue">
          <div className="carte-tete">
            <h3>{liste.length} {pluriel(liste.length, "résultat")}</h3>
            <span className="mat">{examen} · {SESSION_EXAMEN}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Rang</th>
                <th>Candidat</th>
                <th className="cache-mobile">N° table</th>
                <th className="droite">Moyenne</th>
                <th className="droite">Décision</th>
              </tr>
            </thead>
            <tbody>
              {liste.map((r, i) => (
                <tr
                  key={r.id}
                  className="cliquable"
                  onClick={() => setCandidatId(r.id)}
                  aria-selected={r.id === candidat?.id}
                >
                  <td className="mat">{i + 1}</td>
                  <td>
                    <span className="nom">{nomCompletBepc(r)}</span>
                    {r.eleveId != null && (
                      <>
                        <br />
                        <span className="mat">Élève inscrit · {classeCandidat}</span>
                      </>
                    )}
                  </td>
                  <td className="cache-mobile mat">{r.numeroTable}</td>
                  <td className="droite">{r.decision === "Absent" ? "—" : `${note20(r.moyenne)}/20`}</td>
                  <td className="droite">
                    <span className={`badge ${badgeDecision(r.decision)}`}>{r.decision}</span>
                  </td>
                </tr>
              ))}
              {liste.length === 0 && (
                <tr>
                  <td colSpan={5} className="mat" style={{ textAlign: "center", padding: 28 }}>
                    Aucun résultat pour ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {candidat && (
          <div className="bulletin">
            <div className="bulletin-tete">
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.jpeg" alt="" width={48} height={48} style={{ borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <p className="oeil">{ECOLE}</p>
                  <h2>Relevé {examen}</h2>
                  <p className="sous">{SESSION_EXAMEN}</p>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p className="nom" style={{ fontSize: 18 }}>{nomCompletBepc(candidat)}</p>
                <p className="mat">{candidat.numeroTable}</p>
                <p style={{ marginTop: 8 }}>
                  <span className={`badge ${badgeDecision(candidat.decision)}`}>{candidat.decision}</span>
                  {candidat.mention && (
                    <span className="badge b-info" style={{ marginLeft: 6 }}>{candidat.mention}</span>
                  )}
                </p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Matière</th>
                  <th className="centre">Coef.</th>
                  <th className="droite">Note /20</th>
                  <th className="droite">Points</th>
                </tr>
              </thead>
              <tbody>
                {candidat.notes.map((n) => (
                  <tr key={n.matiere}>
                    <td className="nom">{n.matiere}</td>
                    <td className="centre mat">{n.coefficient}</td>
                    <td className="droite">{candidat.decision === "Absent" ? "—" : note20(n.note)}</td>
                    <td className="droite mat">
                      {candidat.decision === "Absent" ? "—" : note20(n.note * n.coefficient)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="nom">Moyenne générale</td>
                  <td className="droite nom" colSpan={2}>
                    {candidat.decision === "Absent" ? "—" : `${note20(candidat.moyenne)}/20`}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
