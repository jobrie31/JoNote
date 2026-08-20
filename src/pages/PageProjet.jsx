import { useState } from "react";

import PageNotes from "./PageNotes";

function PageProjet({ projet, onRetour }) {
  const [ongletActif, setOngletActif] = useState("vue");

  if (!projet) {
    return (
      <div
        style={{
          padding: "40px",
        }}
      >
        <p>Aucun projet sélectionné.</p>

        <button
          type="button"
          onClick={onRetour}
        >
          Retour
        </button>
      </div>
    );
  }

  const onglets = [
    {
      id: "vue",
      label: "Vue d'ensemble",
    },
    {
      id: "notes",
      label: "Notes",
    },
    {
      id: "chronologie",
      label: "Chronologie",
    },
    {
      id: "important",
      label: "Important",
    },
    {
      id: "taches",
      label: "Tâches",
    },
    {
      id: "fichiers",
      label: "Fichiers",
    },
  ];

  return (
    <div
      style={{
        padding: "40px",
      }}
    >
      <button
        type="button"
        onClick={onRetour}
        style={{
          marginBottom: "20px",
        }}
      >
        ← Retour
      </button>

      <div
        style={{
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            marginBottom: "8px",
          }}
        >
          {projet.nom}
        </h1>

        {projet.description && (
          <p
            style={{
              margin: 0,
              color: "#666",
            }}
          >
            {projet.description}
          </p>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "30px",
          borderBottom: "1px solid #ddd",
        }}
      >
        {onglets.map((onglet) => (
          <button
            key={onglet.id}
            type="button"
            onClick={() => setOngletActif(onglet.id)}
            style={{
              border: "none",
              background: "transparent",
              padding: "12px 14px",
              cursor: "pointer",
              borderBottom:
                ongletActif === onglet.id
                  ? "3px solid #222"
                  : "3px solid transparent",
              fontWeight:
                ongletActif === onglet.id
                  ? "600"
                  : "400",
            }}
          >
            {onglet.label}
          </button>
        ))}
      </div>

      {ongletActif === "vue" && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "24px",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            Vue d'ensemble
          </h2>

          <p>
            Les informations principales du projet seront affichées ici.
          </p>
        </div>
      )}

      {ongletActif === "notes" && (
        <PageNotes projet={projet} />
      )}

      {ongletActif === "chronologie" && (
        <div>
          <h2>Chronologie</h2>
          <p>La chronologie du projet sera affichée ici.</p>
        </div>
      )}

      {ongletActif === "important" && (
        <div>
          <h2>Important</h2>
          <p>
            Les éléments importants du projet seront affichés ici.
          </p>
        </div>
      )}

      {ongletActif === "taches" && (
        <div>
          <h2>Tâches</h2>
          <p>
            Les tâches du projet seront affichées ici.
          </p>
        </div>
      )}

      {ongletActif === "fichiers" && (
        <div>
          <h2>Fichiers</h2>
          <p>
            Les fichiers du projet seront affichés ici.
          </p>
        </div>
      )}
    </div>
  );
}

export default PageProjet;