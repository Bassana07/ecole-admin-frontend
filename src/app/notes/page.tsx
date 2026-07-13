"use client";

import { useState } from "react";
import { Barres } from "@/components/Charts";
import { Avatar, EnTete, Puces, Stat } from "@/components/ui";
import { CLASSES, MATIERES, nomComplet } from "@/lib/data";
import { note20 } from "@/lib/format";
import { useEcole } from "@/lib/store";

const TYPES = ["Devoir 1", "Devoir 2", "Composition"] as const;

export default function PageNotes() {
  const { eleves, notes, noter, reinitialiserNotes, annoncer, tracer } = useEcole();
  const [classe, setClasse] = useState<(typeof CLASSES)[number]>(CLASSES[1]);
  const [matiere, setMatiere] = useState(MATIERES[0].nom);
  const [type, setType] = useState<(typeof TYPES)[number]>("Composition");
  const [bareme, setBareme] = useState("20");

  const liste = eleves.filter((e) => e.classe === classe);
  const saisies = liste.filter((e) => notes[e.id] !== undefined && notes[e.id] !== "");
  const valeurs = saisies.map((e) => Number(notes[e.id]));
  const moyenne = valeurs.length ? valeurs.reduce((s, v) => s + v, 0) / valeurs.length : 0;
  const meilleure = valeurs.length ? Math.max(...valeurs) : 0;
  const plusBasse = valeurs.length ? Math.min(...valeurs) : 0;
  const sousLaMoyenne = valeurs.filter((v) => v < 10).length;

  const tranches = [
    { label: "0–5", valeur: valeurs.filter((v) => v < 5).length },
    { label: "5–10", valeur: valeurs.filter((v) => v >= 5 && v < 10).length },
    { label: "10–14", valeur: valeurs.filter((v) => v >= 10 && v < 14).length },
    { label: "14–17", valeur: valeurs.filter((v) => v >= 14 && v < 17).length },
    { label: "17–20", valeur: valeurs.filter((v) => v >= 17).length },
  ];

  return (
    <>
      <EnTete
        titre="Saisie des notes"
        sous="Une note par élève. Moyennes, rangs et bulletins se mettent à jour automatiquement."
        actions={<button className="btn sec" onClick={reinitialiserNotes} disabled={saisies.length === 0}>Effacer la saisie</button>}
      />

      <div className="barre-outils">
        <Puces options={CLASSES} actif={classe} onChange={setClasse} libelle="Choisir la classe" />
      </div>

      <div className="barre-outils">
        <select value={matiere} onChange={(e) => setMatiere(e.target.value)} aria-label="Choisir la matière">
          {MATIERES.map((m) => <option key={m.code}>{m.nom}</option>)}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as (typeof TYPES)[number])} aria-label="Type d'évaluation">
          {TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <span className="muet">Barème</span>
        <select value={bareme} onChange={(e) => setBareme(e.target.value)} aria-label="Barème">
          {["10", "20"].map((b) => <option key={b}>Sur {b}</option>)}
        </select>
      </div>

      <div className="grille g4 mb">
        <Stat libelle="Saisies" valeur={`${saisies.length} / ${liste.length}`} />
        <Stat libelle="Moyenne" valeur={valeurs.length ? note20(moyenne) : "—"} />
        <Stat libelle="Meilleure / plus basse" valeur={valeurs.length ? `${meilleure} / ${plusBasse}` : "—"} />
        <Stat libelle="Sous la moyenne" valeur={sousLaMoyenne} alerte={sousLaMoyenne > 0} />
      </div>

      <div className="grille g-2-1">
        <div className="carte nue">
          <div className="carte-tete">
            <h3>{matiere} — {type}</h3>
            <span className="mat">{classe} · coef. {MATIERES.find((m) => m.nom === matiere)?.coefficient}</span>
          </div>
          <table>
            <thead>
              <tr><th>Élève</th><th className="droite">Note ({bareme.replace("Sur ", "")})</th></tr>
            </thead>
            <tbody>
              {liste.map((e) => {
                const v = notes[e.id];
                const rouge = v !== undefined && v !== "" && Number(v) < 10;
                return (
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
                    <td className="droite">
                      <input
                        className="note-input"
                        type="number"
                        min={0}
                        max={Number(bareme.replace("Sur ", ""))}
                        step={0.25}
                        inputMode="decimal"
                        placeholder="—"
                        value={v ?? ""}
                        onChange={(ev) => noter(e.id, ev.target.value)}
                        aria-label={`Note de ${nomComplet(e)}`}
                        style={{ color: rouge ? "var(--brique)" : undefined }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="carte">
          <p className="oeil" style={{ marginBottom: 8 }}>Répartition des notes</p>
          {valeurs.length > 0 ? (
            <>
              <Barres donnees={tranches} couleur="var(--indigo)" />
              <p className="mat">{sousLaMoyenne} élève(s) sous 10 sur {valeurs.length} noté(s).</p>
            </>
          ) : (
            <p className="muet" style={{ padding: "24px 0" }}>
              Le graphique apparaîtra dès la première note saisie.
            </p>
          )}
        </div>
      </div>

      <div className="action-bas">
        <span className="info">
          {saisies.length}/{liste.length} saisies — moyenne {valeurs.length ? note20(moyenne) : "—"}
        </span>
        <button
          className="btn"
          disabled={saisies.length === 0}
          onClick={() => {
            tracer(`Notes saisies — ${matiere}, ${type}, ${classe}`);
            annoncer(`Notes enregistrées — ${matiere}, ${type}, ${classe}.`);
          }}
        >
          Enregistrer les notes
        </button>
      </div>
    </>
  );
}
