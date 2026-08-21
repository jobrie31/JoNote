import {
  useEffect,
  useMemo,
  useState,
} from "react";

import NouveauProjetModal from "../components/NouveauProjetModal";

import {
  chargerProjets,
  chargerNotes,
  chargerBlocs,
  chargerTachesProjet,
  creerProjet,
} from "../utils/firestoreJoNote";

function PageAccueil({
  onOuvrirProjet,
  onOuvrirNote,
}) {
  const [
    projets,
    setProjets,
  ] = useState([]);

  const [
    notes,
    setNotes,
  ] = useState([]);

  const [
    taches,
    setTaches,
  ] = useState([]);

  const [
    importants,
    setImportants,
  ] = useState([]);

  const [
    modalOuvert,
    setModalOuvert,
  ] = useState(false);

  const [
    chargement,
    setChargement,
  ] = useState(true);

  const [
    erreur,
    setErreur,
  ] = useState("");

  const obtenirMillis = (
    timestamp
  ) => {
    if (!timestamp) {
      return 0;
    }

    if (
      typeof timestamp.toMillis ===
      "function"
    ) {
      return timestamp.toMillis();
    }

    if (
      typeof timestamp.toDate ===
      "function"
    ) {
      return timestamp
        .toDate()
        .getTime();
    }

    return 0;
  };

  const loadAccueil =
    async () => {
      try {
        setChargement(true);
        setErreur("");

        const projetsFirebase =
          await chargerProjets();

        const toutesNotes = [];
        const toutesTaches = [];
        const tousImportants = [];

        const projetsAvecActivite =
          [];

        for (
          const projet of
          projetsFirebase
        ) {
          const [
            notesProjet,
            tachesProjet,
          ] =
            await Promise.all([
              chargerNotes(
                projet.id
              ),

              chargerTachesProjet(
                projet.id
              ),
            ]);

          let derniereActivite =
            Math.max(
              obtenirMillis(
                projet.updatedAt
              ),
              obtenirMillis(
                projet.createdAt
              )
            );

          for (
            const note of
            notesProjet
          ) {
            const activiteNote =
              Math.max(
                obtenirMillis(
                  note.updatedAt
                ),
                obtenirMillis(
                  note.createdAt
                )
              );

            derniereActivite =
              Math.max(
                derniereActivite,
                activiteNote
              );

            const noteComplete = {
              ...note,
              projet,
            };

            toutesNotes.push(
              noteComplete
            );

            const blocs =
              await chargerBlocs(
                projet.id,
                note.id
              );

            blocs.forEach(
              (bloc) => {
                const activiteBloc =
                  Math.max(
                    obtenirMillis(
                      bloc.updatedAt
                    ),
                    obtenirMillis(
                      bloc.createdAt
                    )
                  );

                derniereActivite =
                  Math.max(
                    derniereActivite,
                    activiteBloc
                  );

                if (
                  bloc.type ===
                    "texte"
                ) {
                  const contenu =
                    (
                      bloc.contenu ||
                      ""
                    ).trim();

                  if (
                    contenu &&
                    bloc.important ===
                      true
                  ) {
                    tousImportants.push({
                      id:
                        `${projet.id}-${note.id}-${bloc.id}`,

                      contenu,

                      note:
                        noteComplete,

                      projet,

                      updatedAt:
                        bloc.updatedAt ||
                        note.updatedAt ||
                        null,
                    });
                  }
                }

              }
            );
          }

          tachesProjet.forEach(
            (tache) => {
              const activiteTache =
                Math.max(
                  obtenirMillis(
                    tache.updatedAt
                  ),
                  obtenirMillis(
                    tache.createdAt
                  )
                );

              derniereActivite =
                Math.max(
                  derniereActivite,
                  activiteTache
                );

              if (
                tache.complete ===
                true
              ) {
                return;
              }

              toutesTaches.push({
                ...tache,

                projet,

                updatedAt:
                  tache.updatedAt ||
                  null,
              });
            }
          );

          projetsAvecActivite.push({
            ...projet,

            derniereActivite,

            nombreNotes:
              notesProjet.length,

            nombreTaches:
              tachesProjet.filter(
                (tache) =>
                  tache.complete !==
                  true
              ).length,
          });
        }

        projetsAvecActivite.sort(
          (a, b) =>
            b.derniereActivite -
            a.derniereActivite
        );

        toutesNotes.sort(
          (a, b) =>
            obtenirMillis(
              b.updatedAt
            ) -
            obtenirMillis(
              a.updatedAt
            )
        );

        toutesTaches.sort(
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

            return (
              obtenirMillis(
                b.updatedAt
              ) -
              obtenirMillis(
                a.updatedAt
              )
            );
          }
        );

        tousImportants.sort(
          (a, b) =>
            obtenirMillis(
              b.updatedAt
            ) -
            obtenirMillis(
              a.updatedAt
            )
        );

        setProjets(
          projetsAvecActivite
        );

        setNotes(
          toutesNotes
        );

        setTaches(
          toutesTaches
        );

        setImportants(
          tousImportants
        );
      } catch (error) {
        console.error(
          "Erreur chargement accueil :",
          error
        );

        setErreur(
          "Impossible de charger le tableau de bord."
        );
      } finally {
        setChargement(false);
      }
    };

  useEffect(() => {
    loadAccueil();
  }, []);

  const handleCreerProjet =
    async ({
      nom,
      description,
    }) => {
      try {
        await creerProjet(
          nom,
          description
        );

        await loadAccueil();
      } catch (error) {
        console.error(
          "Erreur création projet :",
          error
        );
      }
    };

  const obtenirDateAujourdhui =
    () => {
      const date =
        new Date();

      const annee =
        date.getFullYear();

      const mois =
        String(
          date.getMonth() + 1
        ).padStart(
          2,
          "0"
        );

      const jour =
        String(
          date.getDate()
        ).padStart(
          2,
          "0"
        );

      return `${annee}-${mois}-${jour}`;
    };

  const notesCalendrier =
    useMemo(() => {
      const aujourdHui =
        obtenirDateAujourdhui();

      return notes
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
              aujourdHui
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
    }, [notes]);

  const projetsRecents =
    projets.slice(
      0,
      6
    );

  const tachesAffichees =
    taches.slice(
      0,
      5
    );

  const importantsAffiches =
    importants.slice(
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

  const raccourcir = (
    texte,
    longueur = 110
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

  const ouvrirNote = (
    element
  ) => {
    if (
      !element?.projet ||
      !element?.id
    ) {
      return;
    }

    onOuvrirNote?.(
      element.projet,
      element
    );
  };

  const blocCompact = (
    titre,
    compteur,
    contenu
  ) => {
    return (
      <div
        style={{
          border:
            "1px solid #e2e2e2",

          borderRadius:
            "12px",

          background:
            "#fff",

          padding:
            "13px",

          minWidth:
            0,
        }}
      >
        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            gap:
              "10px",

            marginBottom:
              "9px",
          }}
        >
          <strong
            style={{
              fontSize:
                "14px",
            }}
          >
            {titre}
          </strong>

          <span
            style={{
              minWidth:
                "22px",

              height:
                "22px",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              padding:
                "0 6px",

              background:
                "#f2f2f2",

              borderRadius:
                "999px",

              color:
                "#666",

              fontSize:
                "11px",

              fontWeight:
                "700",
            }}
          >
            {compteur}
          </span>
        </div>

        {contenu}
      </div>
    );
  };

  return (
    <div
      style={{
        padding:
          "26px 32px 42px",

        background:
          "#fafafa",

        minHeight:
          "100%",
      }}
    >
      <div
        style={{
          maxWidth:
            "1350px",

          margin:
            "0 auto",
        }}
      >
        {/* ENTÊTE */}

        <div
          style={{
            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "space-between",

            gap:
              "20px",

            flexWrap:
              "wrap",

            marginBottom:
              "20px",
          }}
        >
          <div>
            <h1
              style={{
                margin:
                  "0 0 4px",

                fontSize:
                  "28px",
              }}
            >
              JoNote
            </h1>

            <p
              style={{
                margin:
                  0,

                color:
                  "#777",

                fontSize:
                  "13px",
              }}
            >
              Ton aperçu global
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setModalOuvert(
                true
              )
            }
            style={{
              padding:
                "9px 14px",

              fontWeight:
                "600",
            }}
          >
            + Nouveau projet
          </button>
        </div>

        {chargement && (
          <div
            style={{
              padding:
                "50px 20px",

              textAlign:
                "center",

              color:
                "#777",
            }}
          >
            Chargement de JoNote...
          </div>
        )}

        {!chargement &&
          erreur && (
            <div
              style={{
                padding:
                  "18px",

                border:
                  "1px solid #e1aaaa",

                borderRadius:
                  "12px",

                background:
                  "#fff2f2",
              }}
            >
              {erreur}
            </div>
          )}

        {!chargement &&
          !erreur &&
          projets.length ===
            0 && (
            <div
              style={{
                border:
                  "1px dashed #ccc",

                borderRadius:
                  "14px",

                padding:
                  "35px",

                background:
                  "#fff",

                textAlign:
                  "center",
              }}
            >
              <h3
                style={{
                  marginTop:
                    0,
                }}
              >
                Aucun projet
              </h3>

              <p>
                Crée ton premier
                projet ou sujet dans
                JoNote.
              </p>

              <button
                type="button"
                onClick={() =>
                  setModalOuvert(
                    true
                  )
                }
              >
                + Créer un projet
              </button>
            </div>
          )}

        {!chargement &&
          !erreur &&
          projets.length >
            0 && (
            <>
              {/* RÉSUMÉ COMPACT EN HAUT */}

              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "repeat(3, minmax(0, 1fr))",

                  gap:
                    "12px",

                  marginBottom:
                    "26px",
                }}
              >
                {blocCompact(
                  "📅 À venir",
                  notesCalendrier.length,
                  notesCalendrier.length ===
                    0 ? (
                    <div
                      style={{
                        color:
                          "#999",

                        fontSize:
                          "12px",
                      }}
                    >
                      Rien de prévu
                    </div>
                  ) : (
                    <div
                      style={{
                        display:
                          "flex",

                        flexDirection:
                          "column",

                        gap:
                          "5px",
                      }}
                    >
                      {notesCalendrier.map(
                        (note) => (
                          <button
                            key={
                              `${note.projet.id}-${note.id}`
                            }
                            type="button"
                            onClick={() =>
                              ouvrirNote(
                                note
                              )
                            }
                            style={{
                              display:
                                "flex",

                              justifyContent:
                                "space-between",

                              alignItems:
                                "center",

                              gap:
                                "8px",

                              width:
                                "100%",

                              padding:
                                "7px 8px",

                              border:
                                "1px solid #e6ebef",

                              borderRadius:
                                "7px",

                              background:
                                "#f8fafb",

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
                                minWidth:
                                  0,
                              }}
                            >
                              <div
                                style={{
                                  overflow:
                                    "hidden",

                                  textOverflow:
                                    "ellipsis",

                                  whiteSpace:
                                    "nowrap",

                                  fontWeight:
                                    "600",

                                  fontSize:
                                    "12px",
                                }}
                              >
                                {note.titre ||
                                  "Sans titre"}
                              </div>

                              <div
                                style={{
                                  marginTop:
                                    "2px",

                                  color:
                                    "#999",

                                  fontSize:
                                    "9px",

                                  overflow:
                                    "hidden",

                                  textOverflow:
                                    "ellipsis",

                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {
                                  note
                                    .projet
                                    .nom
                                }
                              </div>
                            </div>

                            <span
                              style={{
                                color:
                                  "#687784",

                                fontSize:
                                  "10px",

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

                {blocCompact(
                  "☑️ Tâches",
                  taches.length,
                  tachesAffichees.length ===
                    0 ? (
                    <div
                      style={{
                        color:
                          "#999",

                        fontSize:
                          "12px",
                      }}
                    >
                      Aucune tâche
                    </div>
                  ) : (
                    <div
                      style={{
                        display:
                          "flex",

                        flexDirection:
                          "column",

                        gap:
                          "5px",
                      }}
                    >
                      {tachesAffichees.map(
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
                                `${tache.projet.id}-${tache.id}`
                              }
                              type="button"
                              onClick={() =>
                                onOuvrirProjet(
                                  {
                                    ...tache.projet,
                                    jonoteOngletInitial:
                                      "taches",
                                    jonoteTacheId:
                                      tache.id,
                                  }
                                )
                              }
                              style={{
                                width:
                                  "100%",

                                padding:
                                  "7px 8px",

                                border:
                                  etat ===
                                  "rouge"
                                    ? "1px solid #dc8e8e"
                                    : etat ===
                                      "jaune"
                                    ? "1px solid #dfcb70"
                                    : "1px solid #e8e8e8",

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

                                  justifyContent:
                                    "space-between",

                                  alignItems:
                                    "center",

                                  gap:
                                    "8px",
                                }}
                              >
                                <div
                                  style={{
                                    minWidth:
                                      0,

                                    fontSize:
                                      "12px",

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
                                    "2px",

                                  color:
                                    "#999",

                                  fontSize:
                                    "9px",

                                  overflow:
                                    "hidden",

                                  textOverflow:
                                    "ellipsis",

                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {
                                  tache.projet.nom
                                }{" "}
                                •{" "}
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

                {blocCompact(
                  "⭐ Importants",
                  importants.length,
                  importantsAffiches.length ===
                    0 ? (
                    <div
                      style={{
                        color:
                          "#999",

                        fontSize:
                          "12px",
                      }}
                    >
                      Aucun important
                    </div>
                  ) : (
                    <div
                      style={{
                        display:
                          "flex",

                        flexDirection:
                          "column",

                        gap:
                          "5px",
                      }}
                    >
                      {importantsAffiches.map(
                        (
                          important
                        ) => (
                          <button
                            key={
                              important.id
                            }
                            type="button"
                            onClick={() =>
                              ouvrirNote(
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
                            }}
                          >
                            <div
                              style={{
                                fontSize:
                                  "11px",

                                color:
                                  "#4b4326",

                                overflow:
                                  "hidden",

                                textOverflow:
                                  "ellipsis",

                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {raccourcir(
                                important.contenu,
                                75
                              )}
                            </div>

                            <div
                              style={{
                                marginTop:
                                  "2px",

                                color:
                                  "#9a8b52",

                                fontSize:
                                  "9px",

                                overflow:
                                  "hidden",

                                textOverflow:
                                  "ellipsis",

                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {
                                important
                                  .projet
                                  .nom
                              }{" "}
                              •{" "}
                              {
                                important
                                  .note
                                  .titre
                              }
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  )
                )}
              </div>

              {/* PROJETS */}

              <div>
                <div
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "space-between",

                    marginBottom:
                      "11px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin:
                          "0 0 3px",

                        fontSize:
                          "19px",
                      }}
                    >
                      Projets récents
                    </h2>

                    <p
                      style={{
                        margin:
                          0,

                        color:
                          "#999",

                        fontSize:
                          "11px",
                      }}
                    >
                      Derniers projets
                      utilisés
                    </p>
                  </div>

                  <span
                    style={{
                      color:
                        "#999",

                      fontSize:
                        "11px",
                    }}
                  >
                    {
                      projets.length
                    }{" "}
                    projet
                    {projets.length !==
                    1
                      ? "s"
                      : ""}
                  </span>
                </div>

                <div
                  style={{
                    display:
                      "grid",

                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(220px, 1fr))",

                    gap:
                      "12px",
                  }}
                >
                  {projetsRecents.map(
                    (projet) => (
                      <button
                        key={
                          projet.id
                        }
                        type="button"
                        onClick={() =>
                          onOuvrirProjet(
                            projet
                          )
                        }
                        style={{
                          border:
                            "1px solid #ddd",

                          borderRadius:
                            "12px",

                          padding:
                            "15px",

                          background:
                            "#fff",

                          textAlign:
                            "left",

                          cursor:
                            "pointer",

                          fontFamily:
                            "inherit",

                          minHeight:
                            "105px",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",

                            justifyContent:
                              "space-between",

                            alignItems:
                              "flex-start",

                            gap:
                              "10px",
                          }}
                        >
                          <h3
                            style={{
                              margin:
                                "0 0 6px",

                              fontSize:
                                "15px",
                            }}
                          >
                            {
                              projet.nom
                            }
                          </h3>

                          <span
                            style={{
                              fontSize:
                                "14px",
                            }}
                          >
                            📁
                          </span>
                        </div>

                        {projet.description && (
                          <p
                            style={{
                              margin:
                                "0 0 9px",

                              color:
                                "#777",

                              fontSize:
                                "11px",

                              lineHeight:
                                1.4,

                              display:
                                "-webkit-box",

                              WebkitLineClamp:
                                2,

                              WebkitBoxOrient:
                                "vertical",

                              overflow:
                                "hidden",
                            }}
                          >
                            {raccourcir(
                              projet.description,
                              90
                            )}
                          </p>
                        )}

                        <div
                          style={{
                            color:
                              "#aaa",

                            fontSize:
                              "10px",
                          }}
                        >
                          {
                            projet.nombreNotes
                          }{" "}
                          note
                          {projet.nombreNotes !==
                          1
                            ? "s"
                            : ""}

                          {" • "}

                          {
                            projet.nombreTaches ||
                            0
                          }{" "}
                          tâche
                          {(projet.nombreTaches ||
                            0) !==
                          1
                            ? "s"
                            : ""}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </div>
            </>
          )}

        <NouveauProjetModal
          ouvert={
            modalOuvert
          }
          onFermer={() =>
            setModalOuvert(
              false
            )
          }
          onCreer={
            handleCreerProjet
          }
        />
      </div>
    </div>
  );
}

export default PageAccueil;