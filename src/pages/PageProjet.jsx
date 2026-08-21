import {
  useEffect,
  useState,
} from "react";

import PageVueEnsemble from "./PageVueEnsemble";
import PageImportant from "./PageImportant";
import PageTaches from "./PageTaches";
import PageCalendrier from "./PageCalendrier";
import PageReferences from "./PageReferences";

function PageProjet({
  projet,
  onRetour,
  noteAOuvrir = null,
  onNoteOuverte,
}) {
  const [
    ongletActif,
    setOngletActif,
  ] = useState(
    projet?.jonoteOngletInitial ||
      "vue-ensemble"
  );

  const [
    tacheAOuvrirId,
    setTacheAOuvrirId,
  ] = useState(
    projet?.jonoteTacheId ||
      null
  );

  useEffect(() => {
    if (noteAOuvrir) {
      setOngletActif(
        "vue-ensemble"
      );
    }
  }, [
    noteAOuvrir?.id,
  ]);

  useEffect(() => {
    if (
      projet?.jonoteOngletInitial ===
      "taches"
    ) {
      setOngletActif(
        "taches"
      );

      setTacheAOuvrirId(
        projet?.jonoteTacheId ||
          null
      );
    }
  }, [
    projet?.id,
    projet?.jonoteOngletInitial,
    projet?.jonoteTacheId,
  ]);

  const ouvrirTache = (
    tacheId
  ) => {
    setTacheAOuvrirId(
      tacheId
    );

    setOngletActif(
      "taches"
    );
  };

  const onglets = [
    {
      id:
        "vue-ensemble",

      nom:
        "Vue d'ensemble",
    },

    {
      id:
        "calendrier",

      nom:
        "Calendrier",
    },

    {
      id:
        "references",

      nom:
        "Références",
    },

    {
      id:
        "important",

      nom:
        "Important",
    },

    {
      id:
        "taches",

      nom:
        "Tâches",
    },

    {
      id:
        "fichiers",

      nom:
        "Fichiers",
    },
  ];

  const afficherContenu =
    () => {
      if (
        ongletActif ===
        "vue-ensemble"
      ) {
        return (
          <PageVueEnsemble
            projet={projet}
            noteAOuvrir={
              noteAOuvrir
            }
            onNoteOuverte={
              onNoteOuverte
            }
            onOuvrirTache={
              ouvrirTache
            }
          />
        );
      }

      if (
        ongletActif ===
        "calendrier"
      ) {
        return (
          <PageCalendrier
            projet={projet}
          />
        );
      }

      if (
        ongletActif ===
        "references"
      ) {
        return (
          <PageReferences
            projet={projet}
          />
        );
      }

      if (
        ongletActif ===
        "important"
      ) {
        return (
          <PageImportant
            projet={projet}
          />
        );
      }

      if (
        ongletActif ===
        "taches"
      ) {
        return (
          <PageTaches
            projet={projet}
            tacheAOuvrirId={
              tacheAOuvrirId
            }
          />
        );
      }

      if (
        ongletActif ===
        "fichiers"
      ) {
        return (
          <div
            style={{
              padding:
                "32px",
            }}
          >
            <div
              style={{
                maxWidth:
                  "1000px",

                margin:
                  "0 auto",
              }}
            >
              <h2>
                Fichiers
              </h2>

              <p
                style={{
                  color:
                    "#777",
                }}
              >
                Les fichiers du
                projet seront
                affichés ici.
              </p>
            </div>
          </div>
        );
      }

      return null;
    };

  return (
    <div
      style={{
        minHeight:
          "100%",

        background:
          "#fff",
      }}
    >
      <div
        style={{
          padding:
            "24px 32px 0",

          borderBottom:
            "1px solid #ddd",
        }}
      >
        <button
          type="button"
          onClick={
            onRetour
          }
          style={{
            marginBottom:
              "18px",
          }}
        >
          ← Tous les projets
        </button>

        <div
          style={{
            marginBottom:
              "22px",
          }}
        >
          <h1
            style={{
              margin:
                "0 0 6px",

              fontSize:
                "30px",
            }}
          >
            {projet.nom}
          </h1>

          {projet.description && (
            <p
              style={{
                margin:
                  0,

                color:
                  "#777",
              }}
            >
              {
                projet.description
              }
            </p>
          )}
        </div>

        <div
          style={{
            display:
              "flex",

            gap:
              "4px",

            overflowX:
              "auto",
          }}
        >
          {onglets.map(
            (onglet) => {
              const estActif =
                ongletActif ===
                onglet.id;

              let icone =
                "";

              if (
                onglet.id ===
                "vue-ensemble"
              ) {
                icone =
                  "📝 ";
              }

              if (
                onglet.id ===
                "calendrier"
              ) {
                icone =
                  "📅 ";
              }

              if (
                onglet.id ===
                "references"
              ) {
                icone =
                  "@ ";
              }

              if (
                onglet.id ===
                "important"
              ) {
                icone =
                  "⭐ ";
              }

              if (
                onglet.id ===
                "taches"
              ) {
                icone =
                  "☑️ ";
              }

              if (
                onglet.id ===
                "fichiers"
              ) {
                icone =
                  "📎 ";
              }

              return (
                <button
                  key={
                    onglet.id
                  }
                  type="button"
                  onClick={() => {
                    setOngletActif(
                      onglet.id
                    );

                    if (
                      onglet.id !==
                      "taches"
                    ) {
                      setTacheAOuvrirId(
                        null
                      );
                    }
                  }}
                  style={{
                    border:
                      "none",

                    borderBottom:
                      estActif
                        ? "3px solid #222"
                        : "3px solid transparent",

                    background:
                      "transparent",

                    padding:
                      "12px 16px",

                    fontWeight:
                      estActif
                        ? "700"
                        : "500",

                    color:
                      estActif
                        ? "#222"
                        : "#777",

                    cursor:
                      "pointer",

                    whiteSpace:
                      "nowrap",

                    fontFamily:
                      "inherit",
                  }}
                >
                  {icone}
                  {onglet.nom}
                </button>
              );
            }
          )}
        </div>
      </div>

      {afficherContenu()}
    </div>
  );
}

export default PageProjet;