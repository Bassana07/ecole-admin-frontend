"use client";

import { useState } from "react";
import { EnTete, Modale, Stat, Vide } from "@/components/ui";
import { ANNEE, CLASSES, FRAIS_SCOLARITE, nomComplet } from "@/lib/data";
import { fcfa } from "@/lib/format";
import { useEcole } from "@/lib/store";

export default function PageInscriptions() {
  const { eleves, annoncer, tracer } = useEcole();
  const [ouvert, setOuvert] = useState(false);

  const aTraiter = eleves.filter((e) => e.statut !== "Validé");
  const valides = eleves.length - aTraiter.length;
  const prochainMatricule = `2025-0${142 + eleves.length}`;

  return (
    <>
      <EnTete
        titre="Inscriptions"
        sous={`Campagne ${ANNEE} · frais de scolarité ${fcfa(FRAIS_SCOLARITE)}`}
        actions={<button className="btn" onClick={() => setOuvert(true)}>Nouvelle inscription</button>}
      />

      <div className="grille g4 mb">
        <Stat libelle="Dossiers validés" valeur={valides} />
        <Stat libelle="À compléter" valeur={aTraiter.length} alerte={aTraiter.length > 0} />
        <Stat libelle="Places restantes" valeur={40 - eleves.length} />
        <Stat libelle="Prochain matricule" valeur={prochainMatricule} />
      </div>

      <div className="carte nue">
        <div className="carte-tete">
          <h3>Dossiers à traiter</h3>
          <button className="btn sec petit" onClick={() => annoncer("Rappel envoyé aux familles concernées.")}>
            Relancer les familles
          </button>
        </div>
        {aTraiter.length > 0 ? (
          <table>
            <thead>
              <tr><th>Élève</th><th>Classe demandée</th><th className="cache-mobile">Parent</th><th>Statut</th><th /></tr>
            </thead>
            <tbody>
              {aTraiter.map((e) => (
                <tr key={e.id}>
                  <td>
                    <span className="nom">{nomComplet(e)}</span>
                    <br />
                    <span className="mat">{e.matricule}</span>
                  </td>
                  <td>{e.classe}</td>
                  <td className="cache-mobile">{e.parent}<br /><span className="mat">{e.tel}</span></td>
                  <td>
                    <span className={`badge ${e.statut === "Incomplet" ? "b-att" : "b-non"}`}>{e.statut}</span>
                  </td>
                  <td className="droite">
                    <button
                      className="btn petit"
                      onClick={() => {
                        tracer(`Inscription validée — ${nomComplet(e)} (${e.classe})`);
                        annoncer(`Dossier de ${nomComplet(e)} validé.`);
                      }}
                    >
                      Valider
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Vide titre="Tous les dossiers sont validés" aide="Rien à traiter pour le moment." />
        )}
      </div>

      {ouvert && (
        <Modale titre="Nouvelle inscription" onFermer={() => setOuvert(false)}>
          <p className="oeil">Campagne {ANNEE}</p>
          <h2>Nouvelle inscription</h2>
          <p className="sous">Le matricule <b>{prochainMatricule}</b> sera attribué automatiquement.</p>

          <div className="grille g2" style={{ marginTop: 16 }}>
            <div className="champ-bloc">
              <label className="champ" htmlFor="i-nom">Nom</label>
              <input id="i-nom" type="text" placeholder="Ouédraogo" style={{ width: "100%" }} />
            </div>
            <div className="champ-bloc">
              <label className="champ" htmlFor="i-prenom">Prénom</label>
              <input id="i-prenom" type="text" placeholder="Aminata" style={{ width: "100%" }} />
            </div>
          </div>

          <div className="grille g2">
            <div className="champ-bloc">
              <label className="champ" htmlFor="i-naissance">Date de naissance</label>
              <input id="i-naissance" type="date" style={{ width: "100%" }} />
            </div>
            <div className="champ-bloc">
              <label className="champ" htmlFor="i-classe">Classe</label>
              <select id="i-classe" style={{ width: "100%" }}>
                {CLASSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grille g2">
            <div className="champ-bloc">
              <label className="champ" htmlFor="i-parent">Parent / tuteur</label>
              <input id="i-parent" type="text" placeholder="M. Ouédraogo Issa" style={{ width: "100%" }} />
            </div>
            <div className="champ-bloc">
              <label className="champ" htmlFor="i-tel">Téléphone</label>
              <input id="i-tel" type="text" placeholder="70 12 34 56" style={{ width: "100%" }} />
            </div>
          </div>

          <div className="grille g2" style={{ marginTop: 4 }}>
            <button className="btn sec plein" onClick={() => setOuvert(false)}>Annuler</button>
            <button
              className="btn plein"
              onClick={() => {
                setOuvert(false);
                tracer(`Inscription créée — matricule ${prochainMatricule}`);
                annoncer(`Élève inscrit. Matricule ${prochainMatricule} attribué.`);
              }}
            >
              Enregistrer l&apos;inscription
            </button>
          </div>
        </Modale>
      )}
    </>
  );
}
