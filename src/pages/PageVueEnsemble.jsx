import {
  useEffect,
  useState,
} from "react";

import PageNotes from "./PageNotes";
import PageNote from "./PageNote";

import {
  chargerNotes,
  chargerBlocs,
  chargerTachesProjet,
} from "../utils/firestoreJoNote";

function PageVueEnsemble({
  projet,
  noteAOuvrir = null,
  onNoteOuverte,
  onOuvrirTache,
}) {
  const [
    notes,
    setNotes,
  ] = useState([]);

  const [
    importants,
    setImportants,
  ] = useState([]);

  const [
    taches,
    setTaches,
  ] = useState([]);

  const [
    noteSelectionnee,
    setNoteSelectionnee,
  ] = useState(null);

  const [
    chargement,
    setChargement,
  ] = useState(true);

  const [
    erreur,
    setErreur,
  ] = useState("");

  const chargerVueEnsemble =
    async () => {
      try {
        setChargement(true);
        setErreur("");

        const [
          notesFirebase,
          tachesProjetFirebase,
        ] =
          await Promise.all([
            chargerNotes(
              projet.id
            ),

            chargerTachesProjet(
              projet.id
            ),
          ]);

        const nouveauxImportants =
          [];

        for (
          const note of
          notesFirebase
        ) {
          const blocs =
            await chargerBlocs(
              projet.id,
              note.id
            );

          blocs.forEach(
            (bloc) => {
              if (
                bloc.type ===
                  "texte" &&
                bloc.important ===
                  true &&
                (
                  bloc.contenu ||
                  ""
                ).trim() !==
                  ""
              ) {
                nouveauxImportants.push({
                  id:
                    `${note.id}-${bloc.id}`,

                  blocId:
                    bloc.id,

                  noteId:
                    note.id,

                  note,

                  contenu:
                    bloc.contenu ||
                    "",

                  updatedAt:
                    bloc.updatedAt ||
                    null,
                });
              }

            }
          );
        }

        nouveauxImportants.sort(
          (a, b) => {
            const dateA =
              a.updatedAt
                ?.toMillis?.() ||
              0;

            const dateB =
              b.updatedAt
                ?.toMillis?.() ||
              0;

            return (
              dateB -
              dateA
            );
          }
        );

        setNotes(
          notesFirebase
        );

        setImportants(
          nouveauxImportants
        );

        const tachesProjetActives =
          tachesProjetFirebase
            .filter(
              (tache) =>
                tache.complete !==
                true
            )
            .sort(
              (a, b) => {
                if (
                  a.dateEcheance &&
                  b.dateEcheance
                ) {
                  return a.dateEcheance.localeCompare(
                    b.dateEcheance
                  );
                }

                if (
                  a.dateEcheance
                ) {
                  return -1;
                }

                if (
                  b.dateEcheance
                ) {
                  return 1;
                }

                return 0;
              }
            );

        setTaches(
          tachesProjetActives
        );
      } catch (error) {
        console.error(
          "Erreur chargement vue d'ensemble :",
          error
        );

        setErreur(
          "Impossible de charger la vue d'ensemble."
        );
      } finally {
        setChargement(false);
      }
    };

  useEffect(() => {
    if (!projet?.id) {
      return;
    }

    chargerVueEnsemble();
  }, [
    projet?.id,
  ]);

  const obtenirDateAujourdhui =
    () => {
      const maintenant =
        new Date();

      const annee =
        maintenant.getFullYear();

      const mois =
        String(
          maintenant.getMonth() +
            1
        ).padStart(
          2,
          "0"
        );

      const jour =
        String(
          maintenant.getDate()
        ).padStart(
          2,
          "0"
        );

      return `${annee}-${mois}-${jour}`;
    };

  const notesCalendrier =
    notes
      .filter(
        (note) =>
          note.dansCalendrier ===
            true &&
          (
            note.dateCalendrier ||
            ""
          ).trim() !==
            "" &&
          note.dateCalendrier >=
            obtenirDateAujourdhui()
      )
      .sort(
        (a, b) =>
          a.dateCalendrier.localeCompare(
            b.dateCalendrier
          )
      )
      .slice(
        0,
        4
      );

  const formaterDate = (
    date
  ) => {
    if (!date) {
      return "";
    }

    const [
      annee,
      mois,
      jour,
    ] = date.split("-");

    const valeur =
      new Date(
        Number(annee),
        Number(mois) - 1,
        Number(jour)
      );

    return valeur.toLocaleDateString(
      "fr-CA",
      {
        day: "numeric",
        month: "short",
      }
    );
  };

  const raccourcir = (
    texte,
    longueur = 70
  ) => {
    const valeur =
      (
        texte || ""
      ).trim();

    if (
      valeur.length <=
      longueur
    ) {
      return valeur;
    }

    return `${valeur.slice(
      0,
      longueur
    )}…`;
  };

  const handleRetourNote =
    async () => {
      setNoteSelectionnee(
        null
      );

      await chargerVueEnsemble();
    };

  if (noteSelectionnee) {
    return (
      <PageNote
        projet={projet}
        note={
          noteSelectionnee
        }
        onRetour={
          handleRetourNote
        }
      />
    );
  }

  const obtenirAvancementTache = (
    tache
  ) => {
    const elements =
      Array.isArray(
        tache.elements
      )
        ? tache.elements
        : [];

    const terminees =
      elements.filter(
        (element) =>
          element.complete ===
          true
      ).length;

    return {
      total:
        elements.length,

      terminees,
    };
  };

  const obtenirEtatTache = (
    tache
  ) => {
    if (
      !tache.dateEcheance
    ) {
      return "normal";
    }

    const [
      annee,
      mois,
      jour,
    ] =
      tache.dateEcheance.split(
        "-"
      );

    const echeance =
      new Date(
        Number(annee),
        Number(mois) - 1,
        Number(jour)
      );

    const aujourdHui =
      new Date();

    aujourdHui.setHours(
      0,
      0,
      0,
      0
    );

    echeance.setHours(
      0,
      0,
      0,
      0
    );

    const joursRestants =
      Math.ceil(
        (
          echeance.getTime() -
          aujourdHui.getTime()
        ) /
          86400000
      );

    const joursJaune =
      Number(
        tache.joursJaune ??
          7
      );

    const joursRouge =
      Number(
        tache.joursRouge ??
          2
      );

    if (
      joursRestants <=
      joursRouge
    ) {
      return "rouge";
    }

    if (
      joursRestants <=
      joursJaune
    ) {
      return "jaune";
    }

    return "normal";
  };

  const sectionResume = (
    titre,
    children
  ) => {
    return (
      <div
        style={{
          marginBottom:
            "18px",
        }}
      >
        <h3
          style={{
            margin:
              "0 0 8px",

            fontSize:
              "14px",

            fontWeight:
              "700",
          }}
        >
          {titre}
        </h3>

        {children}
      </div>
    );
  };

  return (
    <div
      style={{
        display:
          "grid",

        gridTemplateColumns:
          "minmax(0, 1fr) 300px",

        gap:
          "22px",

        padding:
          "26px 32px 36px",

        alignItems:
          "start",
      }}
    >
      {/* ZONE PRINCIPALE NOTES */}

      <div
        style={{
          minWidth:
            0,
        }}
      >
        <PageNotes
          projet={projet}
          noteAOuvrir={
            noteAOuvrir
          }
          onNoteOuverte={
            onNoteOuverte
          }
        />
      </div>

      {/* MARGE DROITE / RÉSUMÉ */}

      <aside
        style={{
          position:
            "sticky",

          top:
            "82px",

          border:
            "1px solid #e2e2e2",

          borderRadius:
            "14px",

          background:
            "#fafafa",

          padding:
            "16px",

          minWidth:
            0,
        }}
      >
        <div
          style={{
            marginBottom:
              "16px",
          }}
        >
          <h2
            style={{
              margin:
                "0 0 4px",

              fontSize:
                "16px",
            }}
          >
            Résumé du projet
          </h2>

          <p
            style={{
              margin:
                0,

              color:
                "#888",

              fontSize:
                "11px",
            }}
          >
            À surveiller
          </p>
        </div>

        {chargement && (
          <div
            style={{
              color:
                "#888",

              fontSize:
                "12px",
            }}
          >
            Chargement...
          </div>
        )}

        {!chargement &&
          erreur && (
            <div
              style={{
                color:
                  "#a33",

                fontSize:
                  "12px",
              }}
            >
              {erreur}
            </div>
          )}

        {!chargement &&
          !erreur && (
            <>
              {sectionResume(
                "📅 À venir",

                notesCalendrier.length ===
                  0 ? (
                  <div
                    style={{
                      color:
                        "#999",

                      fontSize:
                        "11px",
                    }}
                  >
                    Rien de prévu.
                  </div>
                ) : (
                  <div
                    style={{
                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap:
                        "6px",
                    }}
                  >
                    {notesCalendrier.map(
                      (note) => (
                        <button
                          key={
                            note.id
                          }
                          type="button"
                          onClick={() =>
                            setNoteSelectionnee(
                              note
                            )
                          }
                          style={{
                            width:
                              "100%",

                            display:
                              "flex",

                            justifyContent:
                              "space-between",

                            gap:
                              "8px",

                            padding:
                              "7px 8px",

                            border:
                              "1px solid #e3e8ec",

                            borderRadius:
                              "7px",

                            background:
                              "#fff",

                            textAlign:
                              "left",

                            cursor:
                              "pointer",

                            fontFamily:
                              "inherit",
                          }}
                        >
                          <span
                            style={{
                              minWidth:
                                0,

                              overflow:
                                "hidden",

                              textOverflow:
                                "ellipsis",

                              whiteSpace:
                                "nowrap",

                              fontSize:
                                "11px",

                              fontWeight:
                                "600",
                            }}
                          >
                            {note.titre ||
                              "Sans titre"}
                          </span>

                          <span
                            style={{
                              color:
                                "#777",

                              fontSize:
                                "9px",

                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {formaterDate(
                              note.dateCalendrier
                            )}
                          </span>
                        </button>
                      )
                    )}
                  </div>
                )
              )}

              {sectionResume(
                "☑️ Tâches",

                taches.length ===
                  0 ? (
                  <div
                    style={{
                      color:
                        "#999",

                      fontSize:
                        "11px",
                    }}
                  >
                    Aucune tâche.
                  </div>
                ) : (
                  <div
                    style={{
                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap:
                        "6px",
                    }}
                  >
                    {taches
                      .slice(
                        0,
                        5
                      )
                      .map(
                        (tache) => {
                          const avancement =
                            obtenirAvancementTache(
                              tache
                            );

                          const etat =
                            obtenirEtatTache(
                              tache
                            );

                          return (
                            <button
                              key={
                                tache.id
                              }
                              type="button"
                              onClick={() =>
                                onOuvrirTache?.(
                                  tache.id
                                )
                              }
                              style={{
                                width:
                                  "100%",

                                padding:
                                  "8px",

                                border:
                                  etat ===
                                  "rouge"
                                    ? "1px solid #dc8e8e"
                                    : etat ===
                                      "jaune"
                                    ? "1px solid #dfcb70"
                                    : "1px solid #e6e6e6",

                                borderRadius:
                                  "7px",

                                background:
                                  etat ===
                                  "rouge"
                                    ? "#fff0f0"
                                    : etat ===
                                      "jaune"
                                    ? "#fffbea"
                                    : "#fff",

                                textAlign:
                                  "left",

                                cursor:
                                  "pointer",

                                fontFamily:
                                  "inherit",
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",

                                  alignItems:
                                    "center",

                                  justifyContent:
                                    "space-between",

                                  gap:
                                    "8px",
                                }}
                              >
                                <div
                                  style={{
                                    minWidth:
                                      0,

                                    fontSize:
                                      "11px",

                                    color:
                                      "#333",

                                    fontWeight:
                                      "600",

                                    overflow:
                                      "hidden",

                                    textOverflow:
                                      "ellipsis",

                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  ☐{" "}
                                  {tache.titre ||
                                    "Sans titre"}
                                </div>

                                {tache.dateEcheance && (
                                  <span
                                    style={{
                                      color:
                                        etat ===
                                        "rouge"
                                          ? "#a52d2d"
                                          : etat ===
                                            "jaune"
                                          ? "#776512"
                                          : "#777",

                                      fontSize:
                                        "9px",

                                      whiteSpace:
                                        "nowrap",
                                    }}
                                  >
                                    📅{" "}
                                    {formaterDate(
                                      tache.dateEcheance
                                    )}
                                  </span>
                                )}
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    "4px",

                                  color:
                                    "#999",

                                  fontSize:
                                    "9px",
                                }}
                              >
                                {
                                  avancement.terminees
                                }
                                /
                                {
                                  avancement.total
                                }{" "}
                                terminée
                                {avancement.total !==
                                1
                                  ? "s"
                                  : ""}
                              </div>
                            </button>
                          );
                        }
                      )}
                  </div>
                )
              )}

              {sectionResume(
                "⭐ Importants",

                importants.length ===
                  0 ? (
                  <div
                    style={{
                      color:
                        "#999",

                      fontSize:
                        "11px",
                    }}
                  >
                    Aucun important.
                  </div>
                ) : (
                  <div
                    style={{
                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap:
                        "6px",
                    }}
                  >
                    {importants
                      .slice(
                        0,
                        4
                      )
                      .map(
                        (
                          important
                        ) => (
                          <button
                            key={
                              important.id
                            }
                            type="button"
                            onClick={() =>
                              setNoteSelectionnee(
                                important.note
                              )
                            }
                            style={{
                              width:
                                "100%",

                              padding:
                                "7px 8px",

                              border:
                                "1px solid #eadb98",

                              borderRadius:
                                "7px",

                              background:
                                "#fffbed",

                              textAlign:
                                "left",

                              cursor:
                                "pointer",

                              fontFamily:
                                "inherit",

                              fontSize:
                                "10px",

                              color:
                                "#514728",
                            }}
                          >
                            {raccourcir(
                              important.contenu
                            )}
                          </button>
                        )
                      )}
                  </div>
                )
              )}
            </>
          )}
      </aside>
    </div>
  );
}

export default PageVueEnsemble;