"use client";

import { useState } from "react";
import { EnTete, Stat } from "@/components/ui";
import { ANNONCES, CLASSES } from "@/lib/data";
import { useEcole } from "@/lib/store";

const CIBLES = ["Tous les parents", "Une classe", "Familles avec impayés", "Enseignants"] as const;
const CANAUX = ["SMS", "E-mail", "Application"] as const;

export default function PageCommunication() {
  const { eleves, annoncer, tracer } = useEcole();
  const [canal, setCanal] = useState<(typeof CANAUX)[number]>("SMS");
  const [cible, setCible] = useState<(typeof CIBLES)[number]>("Tous les parents");
  const [classe, setClasse] = useState<(typeof CLASSES)[number]>(CLASSES[1]);
  const [titre, setTitre] = useState("");
  const [corps, setCorps] = useState("");

  const impayes = eleves.filter((e) => e.paye < e.fraisTotal).length;
  const destinataires =
    cible === "Tous les parents" ? eleves.length
    : cible === "Une classe" ? eleves.filter((e) => e.classe === classe).length
    : cible === "Familles avec impayés" ? impayes
    : 6;

  const coutSms = canal === "SMS" ? destinataires * 25 : 0;
  const caracteres = corps.length;
  const nbSms = Math.max(1, Math.ceil(caracteres / 160));

  function envoyer() {
    tracer(`Annonce envoyée par ${canal} à ${destinataires} destinataires`);
    annoncer(`Annonce envoyée à ${destinataires} destinataires par ${canal}.`);
    setTitre("");
    setCorps("");
  }

  return (
    <>
      <EnTete titre="Communication" sous="Annonces, résultats et convocations aux parents et enseignants." />

      <div className="grille g4 mb">
        <Stat libelle="Annonces envoyées" valeur={ANNONCES.filter((a) => a.statut === "Envoyée").length} />
        <Stat libelle="Programmées" valeur={ANNONCES.filter((a) => a.statut === "Programmée").length} />
        <Stat libelle="Parents joignables par SMS" valeur={`${eleves.length}`} />
        <Stat libelle="Coût moyen d'un envoi" valeur={`${eleves.length * 25} F`} />
      </div>

      <div className="grille g-2-1 mb">
        <div className="carte">
          <p className="oeil" style={{ marginBottom: 12 }}>Nouvelle annonce</p>

          <div className="champ-bloc">
            <label className="champ" htmlFor="c-titre">Titre</label>
            <input
              id="c-titre"
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              placeholder="Remise des bulletins du 2e trimestre"
              style={{ width: "100%" }}
            />
          </div>

          <div className="champ-bloc">
            <label className="champ" htmlFor="c-corps">Message</label>
            <textarea
              id="c-corps"
              rows={4}
              value={corps}
              onChange={(e) => setCorps(e.target.value)}
              placeholder="Les bulletins seront remis samedi 18 juillet, de 8h à 12h."
            />
            <p className="mat">{caracteres} caractères — {nbSms} SMS par destinataire</p>
          </div>

          <div className="grille g2">
            <div className="champ-bloc">
              <label className="champ" htmlFor="c-canal">Canal</label>
              <select id="c-canal" value={canal} onChange={(e) => setCanal(e.target.value as (typeof CANAUX)[number])} style={{ width: "100%" }}>
                {CANAUX.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="champ-bloc">
              <label className="champ" htmlFor="c-cible">Destinataires</label>
              <select id="c-cible" value={cible} onChange={(e) => setCible(e.target.value as (typeof CIBLES)[number])} style={{ width: "100%" }}>
                {CIBLES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {cible === "Une classe" && (
            <div className="champ-bloc">
              <label className="champ" htmlFor="c-classe">Classe</label>
              <select id="c-classe" value={classe} onChange={(e) => setClasse(e.target.value as (typeof CLASSES)[number])} style={{ width: "100%" }}>
                {CLASSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          )}

          <div className="grille g2">
            <button className="btn sec plein" onClick={() => annoncer("Annonce enregistrée comme brouillon.")}>
              Enregistrer le brouillon
            </button>
            <button className="btn plein" disabled={!titre || !corps} onClick={envoyer}>
              Envoyer à {destinataires} destinataires
            </button>
          </div>
        </div>

        <div className="carte">
          <p className="oeil">Récapitulatif de l&apos;envoi</p>
          <div className="lignes">
            <div className="ligne"><span>Canal</span><span>{canal}</span></div>
            <div className="ligne"><span>Destinataires</span><span>{destinataires}</span></div>
            <div className="ligne"><span>SMS par personne</span><span>{canal === "SMS" ? nbSms : "—"}</span></div>
            <div className="ligne"><span>Coût estimé</span><span>{canal === "SMS" ? `${coutSms * nbSms} F` : "Gratuit"}</span></div>
          </div>
          <p className="mat">
            Le coût SMS dépend de l&apos;opérateur. Les canaux « E-mail » et « Application » sont sans frais.
          </p>
        </div>
      </div>

      <div className="carte nue">
        <div className="carte-tete"><h3>Historique</h3></div>
        <table>
          <thead>
            <tr><th>Date</th><th>Annonce</th><th className="cache-mobile">Canal</th><th className="cache-mobile">Cible</th><th className="droite">Statut</th></tr>
          </thead>
          <tbody>
            {ANNONCES.map((a) => (
              <tr key={a.id}>
                <td className="nb">{a.date}</td>
                <td>
                  <span className="nom">{a.titre}</span>
                  <br />
                  <span className="mat">{a.corps.slice(0, 70)}…</span>
                </td>
                <td className="cache-mobile"><span className="badge b-info">{a.canal}</span></td>
                <td className="cache-mobile">{a.cible}<br /><span className="mat">{a.destinataires} destinataires</span></td>
                <td className="droite">
                  <span className={`badge ${a.statut === "Envoyée" ? "b-ok" : a.statut === "Programmée" ? "b-att" : "b-neutre"}`}>
                    {a.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
