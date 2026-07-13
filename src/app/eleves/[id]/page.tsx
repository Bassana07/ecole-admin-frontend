"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Avatar, EnTete, Jauge, Modale, Onglets, Stat, Vide } from "@/components/ui";
import { Barres } from "@/components/Charts";
import {
  ABSENCES,
  CLASSES,
  ECHEANCIER,
  bulletin,
  eleveParId,
  nomComplet,
  rangDansClasse,
} from "@/lib/data";
import { fcfa, mention, note20 } from "@/lib/format";
import { useEcole } from "@/lib/store";

const ONGLETS = ["Identité", "Notes", "Présences", "Paiements", "Documents"] as const;

export default function FicheEleve() {
  const params = useParams<{ id: string }>();
  const { eleves, paiements, annoncer, tracer } = useEcole();
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]>("Identité");
  const [modale, setModale] = useState(false);

  const id = Number(params.id);
  const eleve = eleves.find((e) => e.id === id) ?? eleveParId(id);
  if (!eleve) {
    return <Vide titre="Élève introuvable" aide="Cet identifiant ne correspond à aucun dossier." />;
  }

  const b = bulletin(eleve.id);
  const { rang, effectif } = rangDansClasse(eleve.id);
  const absences = ABSENCES.filter((a) => a.eleveId === eleve.id);
  const versements = paiements.filter((p) => p.eleveId === eleve.id);
  const reste = eleve.fraisTotal - eleve.paye;

  return (
    <>
      <p className="sous" style={{ marginBottom: 8 }}>
        <Link href="/eleves">← Retour à la liste des élèves</Link>
      </p>

      <EnTete
        titre={nomComplet(eleve)}
        sous={`${eleve.classe} · Matricule ${eleve.matricule} · Né${eleve.sexe === "F" ? "e" : ""} le ${eleve.naissance}`}
        actions={
          <>
            <button className="btn sec" onClick={() => setModale(true)}>Modifier le dossier</button>
            <Link href="/bulletins" className="btn">Imprimer le bulletin</Link>
          </>
        }
      />

      <div className="grille g4 mb">
        <Stat libelle="Moyenne générale" valeur={`${note20(b.moyenne)}/20`} delta={mention(b.moyenne)} />
        <Stat libelle="Rang" valeur={`${rang}e / ${effectif}`} />
        <Stat libelle="Absences" valeur={absences.length} delta={`${absences.filter((a) => !a.justifiee).length} non justifiées`} sens="down" />
        <Stat libelle="Reste à payer" valeur={fcfa(reste)} alerte={reste > 0} />
      </div>

      <Onglets onglets={ONGLETS} actif={onglet} onChange={setOnglet} />

      {onglet === "Identité" && (
        <div className="grille g2">
          <div className="carte">
            <p className="oeil">État civil</p>
            <div className="lignes">
              <div className="ligne"><span>Nom et prénom</span><span>{nomComplet(eleve)}</span></div>
              <div className="ligne"><span>Sexe</span><span>{eleve.sexe === "F" ? "Féminin" : "Masculin"}</span></div>
              <div className="ligne"><span>Date de naissance</span><span>{eleve.naissance}</span></div>
              <div className="ligne"><span>Quartier</span><span>{eleve.quartier}</span></div>
              <div className="ligne"><span>Statut du dossier</span>
                <span>
                  <span className={`badge ${eleve.statut === "Validé" ? "b-ok" : eleve.statut === "Incomplet" ? "b-att" : "b-non"}`}>
                    {eleve.statut}
                  </span>
                </span>
              </div>
              <div className="ligne"><span>Redoublant</span><span>{eleve.redoublant ? "Oui" : "Non"}</span></div>
            </div>
          </div>

          <div className="carte">
            <p className="oeil">Parent / tuteur</p>
            <div className="lignes">
              <div className="ligne"><span>Nom</span><span>{eleve.parent}</span></div>
              <div className="ligne"><span>Téléphone</span><span>{eleve.tel}</span></div>
              <div className="ligne"><span>E-mail</span><span>{eleve.email}</span></div>
            </div>
            <button className="btn sec plein" onClick={() => annoncer(`SMS envoyé à ${eleve.parent}.`)}>
              Envoyer un SMS au parent
            </button>
          </div>
        </div>
      )}

      {onglet === "Notes" && (
        <div className="grille g-2-1">
          <div className="carte nue">
            <div className="carte-tete"><h3>Notes du 2e trimestre</h3><span className="mat">Sur 20</span></div>
            <table>
              <thead>
                <tr>
                  <th>Matière</th><th className="centre">Coef.</th>
                  <th className="centre">Devoir 1</th><th className="centre">Devoir 2</th>
                  <th className="centre">Compo.</th><th className="droite">Moyenne</th>
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
                    <td className="droite nb">
                      <b style={{ color: l.moyenne < 10 ? "var(--brique)" : undefined }}>{note20(l.moyenne)}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="carte">
            <p className="oeil" style={{ marginBottom: 8 }}>Profil par matière</p>
            <Barres
              donnees={b.lignes.map((l) => ({ label: l.matiere.code, valeur: Number(l.moyenne.toFixed(1)) }))}
              couleur="var(--indigo)"
            />
            <p className="mat">Moyenne générale : {note20(b.moyenne)} / 20 — {mention(b.moyenne)}</p>
          </div>
        </div>
      )}

      {onglet === "Présences" && (
        <div className="carte nue">
          <div className="carte-tete">
            <h3>Absences et retards</h3>
            <button className="btn sec petit" onClick={() => annoncer("Récapitulatif envoyé au parent.")}>
              Envoyer le récapitulatif
            </button>
          </div>
          {absences.length > 0 ? (
            <table>
              <thead><tr><th>Date</th><th>Type</th><th>Motif</th><th className="droite">Justifiée</th></tr></thead>
              <tbody>
                {absences.map((a) => (
                  <tr key={a.id}>
                    <td className="nb">{a.date}</td>
                    <td><span className={`badge ${a.type === "Retard" ? "b-att" : "b-info"}`}>{a.type}</span></td>
                    <td>{a.motif}</td>
                    <td className="droite">
                      <span className={`badge ${a.justifiee ? "b-ok" : "b-non"}`}>{a.justifiee ? "Oui" : "Non"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <Vide titre="Aucune absence" aide="Cet élève a été présent à tous les cours ce trimestre." />
          )}
        </div>
      )}

      {onglet === "Paiements" && (
        <div className="grille g-2-1">
          <div className="carte nue">
            <div className="carte-tete"><h3>Versements</h3><Link href="/paiements" className="btn petit">Encaisser</Link></div>
            {versements.length > 0 ? (
              <table>
                <thead><tr><th>Date</th><th>Moyen</th><th>Reçu</th><th className="droite">Montant</th></tr></thead>
                <tbody>
                  {versements.map((p) => (
                    <tr key={p.id}>
                      <td className="nb">{p.date}</td>
                      <td>{p.moyen}</td>
                      <td className="mat">{p.recu}</td>
                      <td className="droite nb"><b>{fcfa(p.montant)}</b></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <Vide titre="Aucun versement" aide="Aucune tranche n'a encore été réglée pour cet élève." />
            )}
          </div>

          <div className="carte">
            <p className="oeil">Échéancier</p>
            <div className="lignes">
              {ECHEANCIER.map((e) => (
                <div className="ligne" key={e.libelle}>
                  <span>{e.libelle}<br /><span className="mat">avant le {e.date}</span></span>
                  <span>{fcfa(e.montant)}</span>
                </div>
              ))}
            </div>
            <Jauge valeur={eleve.paye} total={eleve.fraisTotal} />
            <p className="mat" style={{ marginTop: 6 }}>
              {fcfa(eleve.paye)} versés sur {fcfa(eleve.fraisTotal)}
            </p>
          </div>
        </div>
      )}

      {onglet === "Documents" && (
        <div className="carte nue">
          <div className="carte-tete">
            <h3>Pièces du dossier</h3>
            <button className="btn sec petit" onClick={() => annoncer("Sélectionnez un fichier à joindre.")}>Ajouter une pièce</button>
          </div>
          <table>
            <tbody>
              {[
                { nom: "Extrait d'acte de naissance", present: true },
                { nom: "Certificat de scolarité (année précédente)", present: true },
                { nom: "Photo d'identité", present: eleve.statut === "Validé" },
                { nom: "Carnet de vaccination", present: eleve.statut === "Validé" },
                { nom: "Fiche d'inscription signée", present: eleve.statut !== "En attente" },
              ].map((d) => (
                <tr key={d.nom}>
                  <td>{d.nom}</td>
                  <td className="droite">
                    <span className={`badge ${d.present ? "b-ok" : "b-non"}`}>{d.present ? "Fournie" : "Manquante"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modale && (
        <Modale titre={`Modifier le dossier de ${nomComplet(eleve)}`} onFermer={() => setModale(false)}>
          <p className="oeil">Dossier élève</p>
          <h2>{nomComplet(eleve)}</h2>
          <p className="sous">Les modifications sont tracées dans le journal d&apos;activité.</p>

          <div className="champ-bloc" style={{ marginTop: 16 }}>
            <label className="champ" htmlFor="classe-e">Classe</label>
            <select id="classe-e" defaultValue={eleve.classe} style={{ width: "100%" }}>
              {CLASSES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="champ-bloc">
            <label className="champ" htmlFor="tel-e">Téléphone du parent</label>
            <input id="tel-e" type="text" defaultValue={eleve.tel} style={{ width: "100%" }} />
          </div>
          <div className="champ-bloc">
            <label className="champ" htmlFor="statut-e">Statut du dossier</label>
            <select id="statut-e" defaultValue={eleve.statut} style={{ width: "100%" }}>
              {["Validé", "Incomplet", "En attente"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div className="grille g2">
            <button className="btn sec plein" onClick={() => setModale(false)}>Annuler</button>
            <button
              className="btn plein"
              onClick={() => {
                setModale(false);
                tracer(`Dossier modifié — ${nomComplet(eleve)}`);
                annoncer("Dossier enregistré.");
              }}
            >
              Enregistrer
            </button>
          </div>
        </Modale>
      )}
    </>
  );
}
