"use client";

import { useState } from "react";
import { EnTete, Onglets, Stat } from "@/components/ui";
import { ACCES } from "@/lib/format";
import { ANNEE, CLASSES, ECOLE, FRAIS_SCOLARITE, MATIERES, PERIODE, PERSONNEL, ROLES } from "@/lib/data";
import { fcfa } from "@/lib/format";
import { useEcole } from "@/lib/store";

const ONGLETS = ["Établissement", "Comptes et rôles", "Journal d'activité"] as const;

export default function PageParametres() {
  const { journal, annoncer } = useEcole();
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]>("Établissement");

  return (
    <>
      <EnTete
        titre="Paramètres"
        sous="Établissement, comptes, droits d'accès et traçabilité."
        actions={<button className="btn sec" onClick={() => annoncer("Sauvegarde effectuée.")}>Sauvegarder les données</button>}
      />

      <Onglets onglets={ONGLETS} actif={onglet} onChange={setOnglet} />

      {onglet === "Établissement" && (
        <div className="grille g2">
          <div className="carte">
            <p className="oeil">Identité de l&apos;école</p>
            <div className="lignes">
              <div className="ligne"><span>Nom</span><span>{ECOLE}</span></div>
              <div className="ligne"><span>Année scolaire</span><span>{ANNEE}</span></div>
              <div className="ligne"><span>Période en cours</span><span>{PERIODE}</span></div>
              <div className="ligne"><span>Classes ouvertes</span><span>{CLASSES.join(", ")}</span></div>
              <div className="ligne"><span>Frais de scolarité</span><span>{fcfa(FRAIS_SCOLARITE)}</span></div>
              <div className="ligne"><span>Devise</span><span>Franc CFA (XOF)</span></div>
            </div>
            <button className="btn sec plein" onClick={() => annoncer("Paramètres de l'école enregistrés.")}>
              Modifier
            </button>
          </div>

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
        </div>
      )}

      {onglet === "Comptes et rôles" && (
        <>
          <div className="grille g4 mb">
            <Stat libelle="Comptes actifs" valeur={PERSONNEL.length} />
            <Stat libelle="Rôles définis" valeur={ROLES.length} />
            <Stat libelle="Parents connectés" valeur={18} />
            <Stat libelle="Dernière sauvegarde" valeur="Hier" />
          </div>

          <div className="carte nue mb">
            <div className="carte-tete">
              <h3>Droits par rôle</h3>
              <span className="mat">Les pages non autorisées disparaissent du menu</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Rôle</th>
                  <th className="centre">Élèves</th>
                  <th className="centre">Notes</th>
                  <th className="centre">Paiements</th>
                  <th className="centre">Communication</th>
                  <th className="centre">Paramètres</th>
                </tr>
              </thead>
              <tbody>
                {ROLES.map((r) => (
                  <tr key={r}>
                    <td className="nom">{r}</td>
                    {["/eleves", "/notes", "/paiements", "/communication", "/parametres"].map((page) => (
                      <td key={page} className="centre">
                        {ACCES[r].includes(page) ? (
                          <span className="badge b-ok">Oui</span>
                        ) : (
                          <span className="badge b-neutre">Non</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="carte nue">
            <div className="carte-tete">
              <h3>Comptes du personnel</h3>
              <button className="btn sec petit" onClick={() => annoncer("Invitation envoyée.")}>Inviter un utilisateur</button>
            </div>
            <table>
              <thead>
                <tr><th>Nom</th><th>Fonction</th><th className="cache-mobile">Téléphone</th><th className="droite">Statut</th></tr>
              </thead>
              <tbody>
                {PERSONNEL.map((p) => (
                  <tr key={p.id}>
                    <td className="nom">{p.nom}</td>
                    <td>{p.fonction}</td>
                    <td className="cache-mobile mat">{p.tel}</td>
                    <td className="droite"><span className="badge b-ok">Actif</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {onglet === "Journal d'activité" && (
        <div className="carte nue">
          <div className="carte-tete">
            <h3>{journal.length} événements</h3>
            <button className="btn sec petit" onClick={() => annoncer("Journal exporté.")}>Exporter</button>
          </div>
          <table>
            <thead>
              <tr><th>Date</th><th>Auteur</th><th className="cache-mobile">Rôle</th><th>Action</th></tr>
            </thead>
            <tbody>
              {journal.map((e) => (
                <tr key={e.id}>
                  <td className="mat" style={{ width: 140 }}>{e.date}</td>
                  <td className="nom">{e.auteur}</td>
                  <td className="cache-mobile"><span className="badge b-neutre">{e.role}</span></td>
                  <td>{e.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
