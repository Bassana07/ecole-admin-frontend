"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Avatar, EnTete, Jauge, Puces, Vide } from "@/components/ui";
import { CLASSES, bulletin, nomComplet } from "@/lib/data";
import { fcfa, note20 } from "@/lib/format";
import { useEcole } from "@/lib/store";
import type { StatutDossier } from "@/lib/types";

const FILTRES_CLASSE = ["Toutes", ...CLASSES] as const;
const FILTRES_STATUT = ["Tous", "Validé", "Incomplet", "En attente"] as const;
const TRIS = ["Nom", "Classe", "Moyenne", "Reste à payer"] as const;

export default function PageEleves() {
  const { eleves, annoncer } = useEcole();
  const [recherche, setRecherche] = useState("");
  const [classe, setClasse] = useState<(typeof FILTRES_CLASSE)[number]>("Toutes");
  const [statut, setStatut] = useState<(typeof FILTRES_STATUT)[number]>("Tous");
  const [tri, setTri] = useState<(typeof TRIS)[number]>("Nom");

  const liste = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    const filtres = eleves.filter((e) => {
      const correspond =
        nomComplet(e).toLowerCase().includes(q) ||
        e.matricule.includes(q) ||
        e.tel.replace(/\s/g, "").includes(q.replace(/\s/g, ""));
      return (
        correspond &&
        (classe === "Toutes" || e.classe === classe) &&
        (statut === "Tous" || e.statut === (statut as StatutDossier))
      );
    });

    return [...filtres].sort((a, b) => {
      if (tri === "Classe") return a.classe.localeCompare(b.classe) || a.nom.localeCompare(b.nom);
      if (tri === "Moyenne") return bulletin(b.id).moyenne - bulletin(a.id).moyenne;
      if (tri === "Reste à payer") return b.fraisTotal - b.paye - (a.fraisTotal - a.paye);
      return a.nom.localeCompare(b.nom);
    });
  }, [eleves, recherche, classe, statut, tri]);

  return (
    <>
      <EnTete
        titre="Élèves"
        sous={`${liste.length} élève${liste.length > 1 ? "s" : ""} affiché${liste.length > 1 ? "s" : ""} sur ${eleves.length}`}
        actions={
          <>
            <button className="btn sec" onClick={() => annoncer("Liste exportée en Excel.")}>Exporter</button>
            <Link href="/inscriptions" className="btn">Inscrire un élève</Link>
          </>
        }
      />

      <div className="barre-outils">
        <input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Nom, matricule ou téléphone"
          aria-label="Chercher un élève"
        />
        <select value={tri} onChange={(e) => setTri(e.target.value as (typeof TRIS)[number])} aria-label="Trier par">
          {TRIS.map((t) => <option key={t}>Trier : {t}</option>)}
        </select>
      </div>

      <div className="barre-outils">
        <Puces options={FILTRES_CLASSE} actif={classe} onChange={setClasse} libelle="Filtrer par classe" />
        <span className="muet">|</span>
        <Puces options={FILTRES_STATUT} actif={statut} onChange={setStatut} libelle="Filtrer par statut du dossier" />
      </div>

      <div className="carte nue">
        {liste.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Élève</th>
                <th>Classe</th>
                <th className="cache-mobile">Parent</th>
                <th className="cache-mobile">Dossier</th>
                <th>Moyenne</th>
                <th className="cache-mobile">Scolarité</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {liste.map((e) => {
                const moyenne = bulletin(e.id).moyenne;
                const reste = e.fraisTotal - e.paye;
                return (
                  <tr key={e.id}>
                    <td>
                      <span className="cellule-eleve">
                        <Avatar eleve={e} />
                        <span>
                          <span className="nom">{nomComplet(e)}</span>
                          <br />
                          <span className="mat">{e.matricule}{e.redoublant ? " · redoublant" : ""}</span>
                        </span>
                      </span>
                    </td>
                    <td>{e.classe}</td>
                    <td className="cache-mobile">
                      {e.parent}
                      <br />
                      <span className="mat">{e.tel}</span>
                    </td>
                    <td className="cache-mobile">
                      <span className={`badge ${e.statut === "Validé" ? "b-ok" : e.statut === "Incomplet" ? "b-att" : "b-non"}`}>
                        {e.statut}
                      </span>
                    </td>
                    <td className="nb"><b>{note20(moyenne)}</b></td>
                    <td className="cache-mobile">
                      <Jauge valeur={e.paye} total={e.fraisTotal} />
                      <span className="mat">{reste === 0 ? "Soldé" : `${fcfa(reste)} dus`}</span>
                    </td>
                    <td className="droite">
                      <Link href={`/eleves/${e.id}`} className="btn sec petit">Fiche</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <Vide titre="Aucun élève ne correspond" aide="Élargissez les filtres ou vérifiez l'orthographe." />
        )}
      </div>
    </>
  );
}
