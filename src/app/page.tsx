"use client";

import Link from "next/link";
import { Anneau, Barres, Courbe } from "@/components/Charts";
import { Avatar, EnTete, Stat } from "@/components/ui";
import {
  ABSENCES,
  ANNONCES,
  CLASSES,
  CRENEAUX,
  PRESENCE_HEBDO,
  RECOUVREMENT_MENSUEL,
  bulletin,
  classementClasse,
  eleveParId,
  emploiDuTemps,
  nomComplet,
  rangDansClasse,
} from "@/lib/data";
import { fcfa, fcfaCourt, note20, pluriel } from "@/lib/format";
import { useEcole } from "@/lib/store";

export default function TableauDeBord() {
  const { role } = useEcole();
  if (role === "Enseignant") return <VueEnseignant />;
  if (role === "Parent") return <VueParent />;
  if (role === "Comptabilité") return <VueComptable />;
  return <VueDirection />;
}

/* ---------- Direction / Secrétariat ---------- */
function VueDirection() {
  const { eleves, journal, utilisateur } = useEcole();
  const encaisse = eleves.reduce((s, e) => s + e.paye, 0);
  const attendu = eleves.reduce((s, e) => s + e.fraisTotal, 0);
  const taux = Math.round((encaisse / attendu) * 100);
  const impayes = eleves.filter((e) => e.paye < e.fraisTotal);
  const dossiers = eleves.filter((e) => e.statut !== "Validé");
  const moyenneEcole =
    eleves.reduce((s, e) => s + bulletin(e.id).moyenne, 0) / eleves.length;

  return (
    <>
      <EnTete
        titre={`Bonjour ${utilisateur.nom}`}
        sous="Dimanche 12 juillet 2026 — voici l'état de l'école."
        actions={<Link href="/statistiques" className="btn sec">Voir toutes les statistiques</Link>}
      />

      <div className="gestes">
        {[
          { href: "/presences", icone: "✓", titre: "Faire l'appel", detail: "4 classes à pointer" },
          { href: "/notes", icone: "✎", titre: "Saisir des notes", detail: "Composition en cours" },
          { href: "/bepc", icone: "★", titre: "Examen national", detail: "CEP et BEPC · Session juin 2026" },
          { href: "/paiements", icone: "₣", titre: "Encaisser", detail: `${impayes.length} ${pluriel(impayes.length, "famille")} à relancer` },
        ].map((g) => (
          <Link key={g.href} href={g.href} className="geste">
            <span className="em" aria-hidden="true">{g.icone}</span>
            <span>
              <b>{g.titre}</b>
              <small>{g.detail}</small>
            </span>
          </Link>
        ))}
      </div>

      <div className="grille g4 mb">
        <Stat libelle="Élèves inscrits" valeur={eleves.length} delta="+3 ce trimestre" sens="up" />
        <Stat libelle="Taux de présence" valeur="93 %" delta="−2 pts vs. semaine passée" sens="down" />
        <Stat libelle="Recouvrement" valeur={`${taux} %`} delta={fcfa(attendu - encaisse) + " restants"} sens="down" />
        <Stat libelle="Moyenne de l'école" valeur={`${note20(moyenneEcole)}/20`} delta="+0,4 vs. 1er trimestre" sens="up" />
      </div>

      <div className="grille g-2-1 mb">
        <div className="carte">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <p className="oeil">Présence — semaine en cours</p>
            <span className="mat">en %</span>
          </div>
          <Courbe donnees={PRESENCE_HEBDO} suffixe="%" />
        </div>
        <div className="carte">
          <p className="oeil" style={{ marginBottom: 10 }}>Dossiers d&apos;inscription</p>
          <Anneau
            centre={String(eleves.length)}
            legende="élèves"
            parts={[
              { label: "Validés", valeur: eleves.filter((e) => e.statut === "Validé").length, couleur: "var(--vert)" },
              { label: "Incomplets", valeur: eleves.filter((e) => e.statut === "Incomplet").length, couleur: "var(--karite)" },
              { label: "En attente", valeur: eleves.filter((e) => e.statut === "En attente").length, couleur: "var(--brique)" },
            ]}
          />
        </div>
      </div>

      <div className="grille g2 mb">
        <div className="carte">
          <p className="oeil" style={{ marginBottom: 8 }}>Encaissements par mois</p>
          <Barres donnees={RECOUVREMENT_MENSUEL} format={fcfaCourt} />
          <p className="mat">Total encaissé : {fcfa(encaisse)} sur {fcfa(attendu)}</p>
        </div>

        <div className="carte nue">
          <div className="carte-tete">
            <h3>À traiter</h3>
            <Link href="/inscriptions" className="btn sec petit">Ouvrir</Link>
          </div>
          <table>
            <tbody>
              <tr>
                <td>Dossiers incomplets</td>
                <td className="droite"><span className="badge b-att">{dossiers.length}</span></td>
              </tr>
              <tr>
                <td>Familles en impayé</td>
                <td className="droite"><span className="badge b-non">{impayes.length}</span></td>
              </tr>
              <tr>
                <td>Absences non justifiées</td>
                <td className="droite">
                  <span className="badge b-non">{ABSENCES.filter((a) => !a.justifiee).length}</span>
                </td>
              </tr>
              <tr>
                <td>Annonces programmées</td>
                <td className="droite">
                  <span className="badge b-info">{ANNONCES.filter((a) => a.statut === "Programmée").length}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="carte nue">
        <div className="carte-tete">
          <h3>Activité récente</h3>
          <Link href="/parametres" className="btn sec petit">Journal complet</Link>
        </div>
        <table>
          <tbody>
            {journal.slice(0, 5).map((e) => (
              <tr key={e.id}>
                <td className="mat" style={{ width: 150 }}>{e.date}</td>
                <td>{e.action}</td>
                <td className="droite cache-mobile">
                  <span className="badge b-neutre">{e.auteur}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ---------- Enseignant ---------- */
function VueEnseignant() {
  const { eleves, utilisateur } = useEcole();
  const maClasse = "CM2";
  const mesEleves = eleves.filter((e) => e.classe === maClasse);
  const cours = emploiDuTemps(maClasse).filter((c) => c.jour === 0).slice(0, 3);
  const classement = classementClasse(maClasse);

  return (
    <>
      <EnTete titre={`Bonjour ${utilisateur.nom.trim().split(/\s+/).pop()}`} sous={`Votre classe : ${maClasse} — ${mesEleves.length} élèves.`} />

      <div className="gestes">
        <Link href="/presences" className="geste">
          <span className="em" aria-hidden="true">✓</span>
          <span><b>Faire l&apos;appel</b><small>{maClasse} — pas encore fait</small></span>
        </Link>
        <Link href="/notes" className="geste">
          <span className="em" aria-hidden="true">✎</span>
          <span><b>Saisir des notes</b><small>Composition de maths</small></span>
        </Link>
        <Link href="/bulletins" className="geste">
          <span className="em" aria-hidden="true">▣</span>
          <span><b>Bulletins</b><small>Appréciations à remplir</small></span>
        </Link>
        <Link href="/classes" className="geste">
          <span className="em" aria-hidden="true">▦</span>
          <span><b>Emploi du temps</b><small>Voir la semaine</small></span>
        </Link>
      </div>

      <div className="grille g2">
        <div className="carte nue">
          <div className="carte-tete"><h3>Vos cours aujourd&apos;hui</h3><span className="mat">Lundi</span></div>
          <table>
            <tbody>
              {cours.map((c, i) => (
                <tr key={i}>
                  <td className="mat" style={{ width: 130 }}>{CRENEAUX[c.creneau]}</td>
                  <td><b>{c.matiere}</b><br /><span className="mat">{maClasse} · {c.salle}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="carte nue">
          <div className="carte-tete"><h3>Classement — {maClasse}</h3><span className="mat">2e trimestre</span></div>
          <table>
            <tbody>
              {classement.slice(0, 5).map((c, i) => (
                <tr key={c.eleve.id}>
                  <td style={{ width: 38 }} className="mat">{i + 1}<sup>{i === 0 ? "er" : "e"}</sup></td>
                  <td>
                    <span className="cellule-eleve">
                      <Avatar eleve={c.eleve} />
                      <span className="nom">{nomComplet(c.eleve)}</span>
                    </span>
                  </td>
                  <td className="droite nb"><b>{note20(c.moyenne)}</b></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------- Parent ---------- */
function VueParent() {
  const enfant = eleveParId(4)!; // Traoré Ibrahim
  const b = bulletin(enfant.id);
  const { rang, effectif } = rangDansClasse(enfant.id);
  const absences = ABSENCES.filter((a) => a.eleveId === enfant.id);
  const reste = enfant.fraisTotal - enfant.paye;
  const edt = emploiDuTemps(enfant.classe).filter((c) => c.jour === 0);

  return (
    <>
      <EnTete titre={`Bonjour, suivi de ${nomComplet(enfant)}`} sous={`${enfant.classe} · Matricule ${enfant.matricule}`} />

      <div className="grille g4 mb">
        <Stat libelle="Moyenne générale" valeur={`${note20(b.moyenne)}/20`} />
        <Stat libelle="Rang" valeur={`${rang}e / ${effectif}`} />
        <Stat libelle="Absences" valeur={absences.length} delta={`${absences.filter((a) => !a.justifiee).length} non justifiées`} sens="down" />
        <Stat libelle="Reste à payer" valeur={fcfa(reste)} alerte={reste > 0} />
      </div>

      <div className="grille g2">
        <div className="carte nue">
          <div className="carte-tete"><h3>Notes du trimestre</h3><Link href="/bulletins" className="btn sec petit">Bulletin</Link></div>
          <table>
            <tbody>
              {b.lignes.map((l) => (
                <tr key={l.matiere.code}>
                  <td>{l.matiere.nom}<br /><span className="mat">coef. {l.matiere.coefficient}</span></td>
                  <td className="droite nb"><b>{note20(l.moyenne)}</b>/20</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="carte nue">
          <div className="carte-tete"><h3>Emploi du temps — lundi</h3></div>
          <table>
            <tbody>
              {edt.map((c, i) => (
                <tr key={i}>
                  <td className="mat" style={{ width: 130 }}>{CRENEAUX[c.creneau]}</td>
                  <td><b>{c.matiere}</b><br /><span className="mat">{c.enseignant}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------- Comptabilité ---------- */
function VueComptable() {
  const { eleves, paiements } = useEcole();
  const encaisse = eleves.reduce((s, e) => s + e.paye, 0);
  const attendu = eleves.reduce((s, e) => s + e.fraisTotal, 0);
  const impayes = eleves.filter((e) => e.paye < e.fraisTotal);
  const parMoyen = ["Orange Money", "Moov Money", "Espèces", "Virement bancaire"].map((m, i) => ({
    label: m,
    valeur: paiements.filter((p) => p.moyen === m).length,
    couleur: ["var(--karite)", "var(--indigo)", "var(--vert)", "var(--encre-doux)"][i],
  }));

  return (
    <>
      <EnTete titre="Recouvrement" sous={`${CLASSES.length} classes · ${eleves.length} élèves`} actions={<Link href="/paiements" className="btn">Encaisser un paiement</Link>} />

      <div className="grille g4 mb">
        <Stat libelle="Encaissé" valeur={fcfa(encaisse)} />
        <Stat libelle="Attendu" valeur={fcfa(attendu)} />
        <Stat libelle="Reste à recouvrer" valeur={fcfa(attendu - encaisse)} alerte />
        <Stat libelle="Familles en impayé" valeur={impayes.length} alerte />
      </div>

      <div className="grille g2">
        <div className="carte">
          <p className="oeil" style={{ marginBottom: 8 }}>Encaissements par mois</p>
          <Barres donnees={RECOUVREMENT_MENSUEL} format={fcfaCourt} />
        </div>
        <div className="carte">
          <p className="oeil" style={{ marginBottom: 10 }}>Moyens de paiement utilisés</p>
          <Anneau centre={String(paiements.length)} legende="paiements" parts={parMoyen} />
        </div>
      </div>
    </>
  );
}
