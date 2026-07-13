"use client";

/** Graphiques en SVG pur : aucune librairie, aucun téléchargement supplémentaire. */

interface Point {
  label: string;
  valeur: number;
}

export function Barres({
  donnees,
  format,
  couleur = "var(--ardoise)",
  hauteur = 160,
}: {
  donnees: Point[];
  format?: (v: number) => string;
  couleur?: string;
  hauteur?: number;
}) {
  const max = Math.max(...donnees.map((d) => d.valeur), 1);
  const largeurBarre = 100 / (donnees.length * 1.6);
  const ecart = largeurBarre * 0.6;

  return (
    <svg viewBox={`0 0 100 ${hauteur / 2}`} width="100%" height={hauteur} role="img"
      aria-label={donnees.map((d) => `${d.label} : ${format ? format(d.valeur) : d.valeur}`).join(", ")}>
      {donnees.map((d, i) => {
        const h = (d.valeur / max) * (hauteur / 2 - 16);
        const x = i * (largeurBarre + ecart) + ecart / 2;
        return (
          <g key={d.label}>
            <rect x={x} y={hauteur / 2 - 12 - h} width={largeurBarre} height={h} rx="1.2" fill={couleur} />
            <text x={x + largeurBarre / 2} y={hauteur / 2 - 3} textAnchor="middle" fontSize="4" fill="var(--encre-doux)">
              {d.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function Courbe({ donnees, suffixe = "" }: { donnees: Point[]; suffixe?: string }) {
  const max = Math.max(...donnees.map((d) => d.valeur)) * 1.05;
  const min = Math.min(...donnees.map((d) => d.valeur)) * 0.9;
  const pts = donnees.map((d, i) => {
    const x = (i / (donnees.length - 1)) * 96 + 2;
    const y = 60 - ((d.valeur - min) / (max - min || 1)) * 44 - 8;
    return { ...d, x, y };
  });
  const chemin = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y}`).join(" ");
  const aire = `${chemin} L98 62 L2 62 Z`;

  return (
    <svg viewBox="0 0 100 72" width="100%" height="170" role="img"
      aria-label={donnees.map((d) => `${d.label} : ${d.valeur}${suffixe}`).join(", ")}>
      <path d={aire} fill="var(--vert-pale)" />
      <path d={chemin} fill="none" stroke="var(--vert)" strokeWidth="1.2" strokeLinejoin="round" />
      {pts.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="1.5" fill="var(--vert)" />
          <text x={p.x} y={p.y - 3} textAnchor="middle" fontSize="3.6" fill="var(--encre)" fontWeight="700">
            {p.valeur}{suffixe}
          </text>
          <text x={p.x} y="70" textAnchor="middle" fontSize="4" fill="var(--encre-doux)">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function Anneau({
  parts,
  centre,
  legende,
}: {
  parts: { label: string; valeur: number; couleur: string }[];
  centre: string;
  legende?: string;
}) {
  const total = parts.reduce((s, p) => s + p.valeur, 0) || 1;
  const rayon = 15.9155; // circonférence ≈ 100
  let offset = 25; // départ en haut

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
      <svg viewBox="0 0 42 42" width="128" height="128" role="img" aria-label={parts.map((p) => `${p.label} : ${p.valeur}`).join(", ")}>
        <circle cx="21" cy="21" r={rayon} fill="none" stroke="var(--papier)" strokeWidth="6" />
        {parts.map((p) => {
          const pct = (p.valeur / total) * 100;
          const el = (
            <circle
              key={p.label}
              cx="21" cy="21" r={rayon} fill="none"
              stroke={p.couleur} strokeWidth="6"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={offset}
            />
          );
          offset -= pct;
          return el;
        })}
        <text x="21" y="21.5" textAnchor="middle" fontSize="6" fontWeight="800" fill="var(--encre)">
          {centre}
        </text>
        {legende && (
          <text x="21" y="26" textAnchor="middle" fontSize="2.8" fill="var(--encre-doux)">
            {legende}
          </text>
        )}
      </svg>
      <ul style={{ listStyle: "none", display: "grid", gap: 7, fontSize: 14 }}>
        {parts.map((p) => (
          <li key={p.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 11, height: 11, borderRadius: 3, background: p.couleur, flex: "0 0 11px" }} />
            {p.label} — <b className="nb">{p.valeur}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
