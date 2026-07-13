"use client";

import { useState } from "react";
import { Avatar, EnTete, Jauge, Modale, Onglets, Puces, Stat, Vide } from "@/components/ui";
import { AUTRES_FRAIS, ECHEANCIER, MOYENS_PAIEMENT, nomComplet } from "@/lib/data";
import { fcfa } from "@/lib/format";
import { useEcole } from "@/lib/store";
import type { Eleve, MoyenPaiement } from "@/lib/types";

const ONGLETS = ["Recouvrement", "Journal des paiements", "Barème des frais"] as const;
const FILTRES = ["Tous", "Impayés", "Partiels", "Soldés"] as const;

export default function PagePaiements() {
  const { eleves, paiements, encaisser, annoncer, tracer, role } = useEcole();
  const [onglet, setOnglet] = useState<(typeof ONGLETS)[number]>("Recouvrement");
  const [filtre, setFiltre] = useState<(typeof FILTRES)[number]>("Tous");
  const [cible, setCible] = useState<Eleve | null>(null);
  const [recu, setRecu] = useState<{ eleve: Eleve; montant: number; moyen: string; numero: string } | null>(null);

  const encaisse = eleves.reduce((s, e) => s + e.paye, 0);
  const attendu = eleves.reduce((s, e) => s + e.fraisTotal, 0);
  const impayes = eleves.filter((e) => e.paye === 0);
  const partiels = eleves.filter((e) => e.paye > 0 && e.paye < e.fraisTotal);

  const liste = eleves.filter((e) => {
    if (filtre === "Impayés") return e.paye === 0;
    if (filtre === "Partiels") return e.paye > 0 && e.paye < e.fraisTotal;
    if (filtre === "Soldés") return e.paye >= e.fraisTotal;
    return true;
  });

  return (
    <>
      <EnTete
        titre={role === "Parent" ? "Ma scolarité" : "Paiements"}
        sous={`${Math.round((encaisse / attendu) * 100)} % recouvré · ${fcfa(attendu - encaisse)} restants`}
        actions={
          <button className="btn sec" onClick={() => annoncer(`Relance envoyée à ${impayes.length + partiels.length} familles.`)}>
            Relancer les impayés
          </button>
        }
      />

      <div className="grille g4 mb">
        <Stat libelle="Encaissé" valeur={fcfa(encaisse)} />
        <Stat libelle="Reste à recouvrer" valeur={fcfa(attendu - encaisse)} alerte />
        <Stat libelle="Rien versé" valeur={impayes.length} alerte={impayes.length > 0} />
        <Stat libelle="Paiements enregistrés" valeur={paiements.length} />
      </div>

      <Onglets onglets={ONGLETS} actif={onglet} onChange={setOnglet} />

      {onglet === "Recouvrement" && (
        <>
          <div className="barre-outils">
            <Puces options={FILTRES} actif={filtre} onChange={setFiltre} libelle="Filtrer les dossiers" />
          </div>

          <div className="carte nue">
            {liste.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Élève</th><th className="cache-mobile">Classe</th><th>Statut</th>
                    <th className="cache-mobile">Avancement</th><th className="droite">Reste</th><th />
                  </tr>
                </thead>
                <tbody>
                  {liste.map((e) => {
                    const reste = e.fraisTotal - e.paye;
                    return (
                      <tr key={e.id}>
                        <td>
                          <span className="cellule-eleve">
                            <Avatar eleve={e} />
                            <span>
                              <span className="nom">{nomComplet(e)}</span>
                              <br />
                              <span className="mat">{e.parent} · {e.tel}</span>
                            </span>
                          </span>
                        </td>
                        <td className="cache-mobile">{e.classe}</td>
                        <td>
                          <span className={`badge ${reste === 0 ? "b-ok" : e.paye > 0 ? "b-att" : "b-non"}`}>
                            {reste === 0 ? "Soldé" : e.paye > 0 ? "Partiel" : "Rien versé"}
                          </span>
                        </td>
                        <td className="cache-mobile">
                          <Jauge valeur={e.paye} total={e.fraisTotal} />
                          <span className="mat">{fcfa(e.paye)} / {fcfa(e.fraisTotal)}</span>
                        </td>
                        <td className="droite nb">{reste === 0 ? "—" : <b style={{ color: "var(--brique)" }}>{fcfa(reste)}</b>}</td>
                        <td className="droite">
                          {reste > 0 ? (
                            <button className="btn petit" onClick={() => setCible(e)}>Encaisser</button>
                          ) : (
                            <button className="btn sec petit" onClick={() => annoncer("Reçu envoyé à l'impression.")}>Reçu</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <Vide titre="Aucun dossier dans ce filtre" aide="Changez de filtre pour voir d'autres familles." />
            )}
          </div>
        </>
      )}

      {onglet === "Journal des paiements" && (
        <div className="carte nue">
          <div className="carte-tete">
            <h3>{paiements.length} paiements</h3>
            <button className="btn sec petit" onClick={() => annoncer("État de recouvrement exporté en Excel.")}>
              Exporter l&apos;état
            </button>
          </div>
          <table>
            <thead>
              <tr><th>Reçu</th><th>Date</th><th>Élève</th><th className="cache-mobile">Moyen</th><th className="droite">Montant</th></tr>
            </thead>
            <tbody>
              {paiements.slice(0, 20).map((p) => {
                const e = eleves.find((x) => x.id === p.eleveId);
                return (
                  <tr key={p.id}>
                    <td className="mat">{p.recu}</td>
                    <td className="nb">{p.date}</td>
                    <td className="nom">{e ? nomComplet(e) : "—"}</td>
                    <td className="cache-mobile">
                      <span className={`badge ${p.moyen.includes("Money") ? "b-att" : "b-neutre"}`}>{p.moyen}</span>
                    </td>
                    <td className="droite nb"><b>{fcfa(p.montant)}</b></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {onglet === "Barème des frais" && (
        <div className="grille g2">
          <div className="carte nue">
            <div className="carte-tete"><h3>Échéancier de la scolarité</h3></div>
            <table>
              <tbody>
                {ECHEANCIER.map((e) => (
                  <tr key={e.libelle}>
                    <td className="nom">{e.libelle}<br /><span className="mat">avant le {e.date}</span></td>
                    <td className="droite nb"><b>{fcfa(e.montant)}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="carte nue">
            <div className="carte-tete"><h3>Autres frais</h3></div>
            <table>
              <tbody>
                {AUTRES_FRAIS.map((f) => (
                  <tr key={f.libelle}>
                    <td className="nom">{f.libelle}</td>
                    <td className="droite nb">{fcfa(f.montant)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {cible && (
        <Encaissement
          eleve={cible}
          onFermer={() => setCible(null)}
          onValider={(montant, moyen) => {
            const recuMontant = encaisser(cible.id, montant, moyen);
            setCible(null);
            if (recuMontant > 0) {
              tracer(`Paiement encaissé — ${fcfa(recuMontant)}, ${moyen}, ${nomComplet(cible)}`);
              setRecu({ eleve: cible, montant: recuMontant, moyen, numero: `R-2026-${1000 + cible.id}` });
              annoncer(`Paiement de ${fcfa(recuMontant)} enregistré.`);
            }
          }}
        />
      )}

      {recu && (
        <Modale titre="Reçu de paiement" onFermer={() => setRecu(null)}>
          <p className="oeil">Reçu {recu.numero}</p>
          <h2>{fcfa(recu.montant)}</h2>
          <p className="sous">Reçu de {recu.eleve.parent}</p>
          <div className="lignes">
            <div className="ligne"><span>Élève</span><span>{nomComplet(recu.eleve)} — {recu.eleve.classe}</span></div>
            <div className="ligne"><span>Moyen de paiement</span><span>{recu.moyen}</span></div>
            <div className="ligne"><span>Date</span><span>12/07/2026</span></div>
            <div className="ligne"><span>Reste à payer</span><span>{fcfa(recu.eleve.fraisTotal - recu.eleve.paye - recu.montant)}</span></div>
          </div>
          <div className="grille g2">
            <button className="btn sec plein" onClick={() => setRecu(null)}>Fermer</button>
            <button className="btn plein" onClick={() => { setRecu(null); annoncer("Reçu imprimé et envoyé par SMS."); }}>
              Imprimer et envoyer
            </button>
          </div>
        </Modale>
      )}
    </>
  );
}

function Encaissement({
  eleve,
  onFermer,
  onValider,
}: {
  eleve: Eleve;
  onFermer: () => void;
  onValider: (montant: number, moyen: MoyenPaiement) => void;
}) {
  const reste = eleve.fraisTotal - eleve.paye;
  const [montant, setMontant] = useState(String(Math.min(60_000, reste)));
  const [moyen, setMoyen] = useState<MoyenPaiement>(MOYENS_PAIEMENT[0]);

  return (
    <Modale titre={`Encaisser un paiement pour ${nomComplet(eleve)}`} onFermer={onFermer}>
      <p className="oeil">Encaisser un paiement</p>
      <h2>{nomComplet(eleve)}</h2>
      <p className="sous">{eleve.classe} · Reste à payer : <b>{fcfa(reste)}</b></p>

      <div className="champ-bloc" style={{ marginTop: 16 }}>
        <label className="champ" htmlFor="montant">Montant reçu (F CFA)</label>
        <input
          id="montant"
          type="number"
          inputMode="numeric"
          min={500}
          step={500}
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          style={{ width: "100%" }}
        />
        <div className="puces" style={{ marginTop: 8 }}>
          {[30_000, 60_000, reste].map((m, i) => (
            <button key={i} className="puce" onClick={() => setMontant(String(Math.min(m, reste)))}>
              {i === 2 ? `Solde — ${fcfa(reste)}` : fcfa(m)}
            </button>
          ))}
        </div>
      </div>

      <div className="champ-bloc">
        <label className="champ" htmlFor="moyen">Moyen de paiement</label>
        <select
          id="moyen"
          value={moyen}
          onChange={(e) => setMoyen(e.target.value as MoyenPaiement)}
          style={{ width: "100%" }}
        >
          {MOYENS_PAIEMENT.map((m) => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div className="grille g2">
        <button className="btn sec plein" onClick={onFermer}>Annuler</button>
        <button
          className="btn plein"
          disabled={Number(montant) <= 0}
          onClick={() => onValider(Number(montant), moyen)}
        >
          Valider le paiement
        </button>
      </div>
    </Modale>
  );
}
