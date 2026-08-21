import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  chargerProjets,
  chargerNotes,
  chargerBlocs,
  chargerTachesProjet,
} from "../utils/firestoreJoNote";

function Topbar({
  projetActuel,
  onRetourAccueil,
  onOuvrirResultat,
}) {
  const [
    rechercheOuverte,
    setRechercheOuverte,
  ] = useState(false);

  const [
    recherche,
    setRecherche,
  ] = useState("");

  const [
    indexRecherche,
    setIndexRecherche,
  ] = useState([]);

  const [
    chargement,
    setChargement,
  ] = useState(false);

  const [
    indexCharge,
    setIndexCharge,
  ] = useState(false);

  const zoneRechercheRef =
    useRef(null);

  const normaliserTexte = (
    valeur
  ) => {
    return (
      valeur || ""
    )
      .toString()
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /@/g,
        ""
      )
      .toLowerCase()
      .trim();
  };

  const raccourcirTexte = (
    texte,
    longueur = 120
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

  const construireIndex =
    async () => {
      try {
        setChargement(
          true
        );

        const projets =
          await chargerProjets();

        const nouveauxElements =
          [];

        for (
          const projet of projets
        ) {
          nouveauxElements.push({
            id:
              `projet-${projet.id}`,

            type:
              "projet",

            projet,

            note:
              null,

            tacheId:
              null,

            titre:
              projet.nom ||
              "Projet sans nom",

            texte:
              projet.description ||
              "",

            rechercheTexte:
              normaliserTexte(
                `${projet.nom || ""} ${projet.description || ""}`
              ),
          });

          /*
            NOUVELLES TÂCHES INDÉPENDANTES
            DU PROJET
          */

          try {
            const tachesProjet =
              await chargerTachesProjet(
                projet.id
              );

            tachesProjet.forEach(
              (tache) => {
                const elements =
                  Array.isArray(
                    tache.elements
                  )
                    ? tache.elements
                    : [];

                const texteSousTaches =
                  elements
                    .map(
                      (element) =>
                        element.texte ||
                        ""
                    )
                    .filter(
                      Boolean
                    )
                    .join(
                      " "
                    );

                const texteConfirmations =
                  elements
                    .map(
                      (element) =>
                        element.noteConfirmation ||
                        ""
                    )
                    .filter(
                      Boolean
                    )
                    .join(
                      " "
                    );

                const progression =
                  elements.length >
                  0
                    ? `${
                        elements.filter(
                          (element) =>
                            element.complete ===
                            true
                        ).length
                      }/${elements.length} terminées`
                    : "";

                nouveauxElements.push({
                  id:
                    `tache-projet-${projet.id}-${tache.id}`,

                  type:
                    "tacheProjet",

                  projet,

                  note:
                    null,

                  tacheId:
                    tache.id,

                  titre:
                    tache.titre ||
                    "Tâche sans titre",

                  texte:
                    texteSousTaches ||
                    progression ||
                    tache.noteConfirmation ||
                    "",

                  complete:
                    tache.complete ===
                    true,

                  dateEcheance:
                    tache.dateEcheance ||
                    "",

                  rechercheTexte:
                    normaliserTexte(
                      `
                        ${tache.titre || ""}
                        ${texteSousTaches}
                        ${texteConfirmations}
                        ${tache.noteConfirmation || ""}
                        ${projet.nom || ""}
                      `
                    ),
                });
              }
            );
          } catch (error) {
            console.error(
              `Erreur chargement tâches du projet ${projet.id} :`,
              error
            );
          }

          /*
            NOTES
          */

          const notes =
            await chargerNotes(
              projet.id
            );

          for (
            const note of notes
          ) {
            const referencesNote =
              Array.isArray(
                note.references
              )
                ? note.references
                : [];

            const texteReferencesNote =
              referencesNote
                .map(
                  (reference) =>
                    `${reference} @${reference}`
                )
                .join(
                  " "
                );

            nouveauxElements.push({
              id:
                `note-${projet.id}-${note.id}`,

              type:
                "note",

              projet,

              note,

              tacheId:
                null,

              titre:
                note.titre ||
                "Sans titre",

              texte:
                referencesNote.length >
                0
                  ? referencesNote
                      .map(
                        (reference) =>
                          `@${reference}`
                      )
                      .join(
                        " "
                      )
                  : projet.nom ||
                    "",

              rechercheTexte:
                normaliserTexte(
                  `${note.titre || ""} ${projet.nom || ""} ${texteReferencesNote}`
                ),
            });

            const blocs =
              await chargerBlocs(
                projet.id,
                note.id
              );

            blocs.forEach(
              (bloc) => {
                /*
                  BLOCS TEXTE
                */

                if (
                  bloc.type ===
                    "texte" &&
                  (
                    bloc.contenu ||
                    ""
                  ).trim() !==
                    ""
                ) {
                  const referencesBloc =
                    Array.isArray(
                      bloc.references
                    )
                      ? bloc.references
                      : [];

                  const texteReferencesBloc =
                    referencesBloc
                      .map(
                        (reference) =>
                          `${reference} @${reference}`
                      )
                      .join(
                        " "
                      );

                  nouveauxElements.push({
                    id:
                      `texte-${projet.id}-${note.id}-${bloc.id}`,

                    type:
                      bloc.important ===
                      true
                        ? "important"
                        : "texte",

                    projet,

                    note,

                    tacheId:
                      null,

                    titre:
                      note.titre ||
                      "Sans titre",

                    texte:
                      bloc.contenu ||
                      "",

                    rechercheTexte:
                      normaliserTexte(
                        `${bloc.contenu || ""} ${note.titre || ""} ${projet.nom || ""} ${texteReferencesBloc}`
                      ),
                  });
                }

                /*
                  ANCIENNES CHECKLISTS
                  DANS LES NOTES
                */

                if (
                  bloc.type ===
                  "checklist"
                ) {
                  const elements =
                    Array.isArray(
                      bloc.elements
                    )
                      ? bloc.elements
                      : [];

                  elements.forEach(
                    (element) => {
                      if (
                        !(
                          element.texte ||
                          ""
                        ).trim()
                      ) {
                        return;
                      }

                      nouveauxElements.push({
                        id:
                          `tache-note-${projet.id}-${note.id}-${bloc.id}-${element.id}`,

                        type:
                          "tacheNote",

                        projet,

                        note,

                        tacheId:
                          null,

                        titre:
                          note.titre ||
                          "Sans titre",

                        texte:
                          element.texte ||
                          "",

                        complete:
                          element.complete ===
                          true,

                        rechercheTexte:
                          normaliserTexte(
                            `${element.texte || ""} ${note.titre || ""} ${projet.nom || ""}`
                          ),
                      });
                    }
                  );
                }

                /*
                  LIENS
                */

                if (
                  bloc.type ===
                  "lien"
                ) {
                  const texteLien =
                    `${bloc.titre || ""} ${bloc.description || ""} ${bloc.url || ""}`;

                  if (
                    texteLien.trim() !==
                    ""
                  ) {
                    nouveauxElements.push({
                      id:
                        `lien-${projet.id}-${note.id}-${bloc.id}`,

                      type:
                        "lien",

                      projet,

                      note,

                      tacheId:
                        null,

                      titre:
                        note.titre ||
                        "Sans titre",

                      texte:
                        bloc.titre ||
                        bloc.url ||
                        bloc.description ||
                        "",

                      rechercheTexte:
                        normaliserTexte(
                          `${texteLien} ${note.titre || ""} ${projet.nom || ""}`
                        ),
                    });
                  }
                }
              }
            );
          }
        }

        setIndexRecherche(
          nouveauxElements
        );

        setIndexCharge(
          true
        );
      } catch (error) {
        console.error(
          "Erreur construction index recherche :",
          error
        );
      } finally {
        setChargement(
          false
        );
      }
    };

  const ouvrirRecherche =
    async () => {
      setRechercheOuverte(
        true
      );

      /*
        On reconstruit toujours l'index
        pour inclure les dernières notes,
        tâches, confirmations et références.
      */

      await construireIndex();
    };

  const fermerRecherche =
    () => {
      setRechercheOuverte(
        false
      );

      setRecherche(
        ""
      );
    };

  useEffect(() => {
    const handleClickExterieur =
      (event) => {
        if (
          zoneRechercheRef.current &&
          !zoneRechercheRef.current.contains(
            event.target
          )
        ) {
          fermerRecherche();
        }
      };

    document.addEventListener(
      "mousedown",
      handleClickExterieur
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickExterieur
      );
    };
  }, []);

  useEffect(() => {
    const handleClavier = (
      event
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        fermerRecherche();
      }

      if (
        (
          event.ctrlKey ||
          event.metaKey
        ) &&
        event.key.toLowerCase() ===
          "k"
      ) {
        event.preventDefault();

        ouvrirRecherche();
      }
    };

    window.addEventListener(
      "keydown",
      handleClavier
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleClavier
      );
    };
  }, []);

  const resultats =
    useMemo(() => {
      const terme =
        normaliserTexte(
          recherche
        );

      if (!terme) {
        return [];
      }

      const mots =
        terme
          .split(
            /\s+/
          )
          .filter(
            Boolean
          );

      return indexRecherche
        .filter(
          (element) =>
            mots.every(
              (mot) =>
                element.rechercheTexte.includes(
                  mot
                )
            )
        )
        .sort(
          (a, b) => {
            const ordreTypes = {
              projet:
                0,

              tacheProjet:
                1,

              note:
                2,

              important:
                3,

              texte:
                4,

              tacheNote:
                5,

              lien:
                6,
            };

            return (
              (
                ordreTypes[
                  a.type
                ] ?? 99
              ) -
              (
                ordreTypes[
                  b.type
                ] ?? 99
              )
            );
          }
        )
        .slice(
          0,
          30
        );
    }, [
      recherche,
      indexRecherche,
    ]);

  const obtenirIcone = (
    type
  ) => {
    switch (type) {
      case "projet":
        return "📁";

      case "note":
        return "📝";

      case "important":
        return "⭐";

      case "texte":
        return "💬";

      case "tacheProjet":
        return "☑️";

      case "tacheNote":
        return "☑";

      case "lien":
        return "🔗";

      default:
        return "•";
    }
  };

  const obtenirTypeNom = (
    type
  ) => {
    switch (type) {
      case "projet":
        return "Projet";

      case "note":
        return "Note";

      case "important":
        return "Important";

      case "texte":
        return "Texte";

      case "tacheProjet":
        return "Tâche";

      case "tacheNote":
        return "Tâche de note";

      case "lien":
        return "Lien";

      default:
        return "";
    }
  };

  const ouvrirResultat = (
    resultat
  ) => {
    onOuvrirResultat?.({
      projet:
        resultat.projet,

      note:
        resultat.note ||
        null,

      tacheId:
        resultat.tacheId ||
        null,
    });

    fermerRecherche();
  };

  const actualiserRecherche =
    async () => {
      setIndexCharge(
        false
      );

      await construireIndex();
    };

  return (
    <header
      style={{
        height:
          "64px",

        borderBottom:
          "1px solid #ddd",

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        padding:
          "0 24px",

        boxSizing:
          "border-box",

        background:
          "#fff",

        position:
          "relative",

        zIndex:
          100,
      }}
    >
      <button
        type="button"
        onClick={
          onRetourAccueil
        }
        style={{
          border:
            "none",

          background:
            "transparent",

          padding:
            0,

          cursor:
            "pointer",

          fontFamily:
            "inherit",

          textAlign:
            "left",
        }}
      >
        <div
          style={{
            fontWeight:
              "700",

            fontSize:
              "15px",
          }}
        >
          {projetActuel
            ? projetActuel.nom
            : "Accueil"}
        </div>

        {projetActuel && (
          <div
            style={{
              color:
                "#888",

              fontSize:
                "11px",

              marginTop:
                "2px",
            }}
          >
            JoNote
          </div>
        )}
      </button>

      <div
        ref={
          zoneRechercheRef
        }
        style={{
          position:
            "relative",

          display:
            "flex",

          alignItems:
            "center",

          gap:
            "10px",
        }}
      >
        {!rechercheOuverte && (
          <button
            type="button"
            onClick={
              ouvrirRecherche
            }
            style={{
              padding:
                "8px 12px",

              border:
                "1px solid #ddd",

              borderRadius:
                "8px",

              background:
                "#fff",

              cursor:
                "pointer",

              fontFamily:
                "inherit",
            }}
          >
            🔎 Recherche
          </button>
        )}

        {rechercheOuverte && (
          <div
            style={{
              position:
                "relative",

              width:
                "min(540px, 65vw)",
            }}
          >
            <div
              style={{
                display:
                  "flex",

                gap:
                  "6px",
              }}
            >
              <input
                autoFocus
                type="text"
                value={
                  recherche
                }
                onChange={(e) =>
                  setRecherche(
                    e.target.value
                  )
                }
                placeholder="Projet, note, tâche, sous-tâche, texte ou @référence..."
                style={{
                  flex:
                    1,

                  minWidth:
                    0,

                  padding:
                    "9px 12px",

                  border:
                    "1px solid #ccc",

                  borderRadius:
                    "9px",

                  outline:
                    "none",

                  fontFamily:
                    "inherit",

                  fontSize:
                    "14px",
                }}
              />

              <button
                type="button"
                onClick={
                  actualiserRecherche
                }
                title="Actualiser la recherche"
                style={{
                  border:
                    "1px solid #ddd",

                  borderRadius:
                    "8px",

                  background:
                    "#fff",

                  cursor:
                    "pointer",
                }}
              >
                ↻
              </button>

              <button
                type="button"
                onClick={
                  fermerRecherche
                }
                style={{
                  border:
                    "1px solid #ddd",

                  borderRadius:
                    "8px",

                  background:
                    "#fff",

                  cursor:
                    "pointer",
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                position:
                  "absolute",

                top:
                  "46px",

                right:
                  0,

                width:
                  "100%",

                maxHeight:
                  "520px",

                overflowY:
                  "auto",

                background:
                  "#fff",

                border:
                  "1px solid #ddd",

                borderRadius:
                  "12px",

                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.12)",
              }}
            >
              {chargement && (
                <div
                  style={{
                    padding:
                      "24px",

                    color:
                      "#777",

                    textAlign:
                      "center",
                  }}
                >
                  Recherche dans JoNote...
                </div>
              )}

              {!chargement &&
                !recherche.trim() && (
                  <div
                    style={{
                      padding:
                        "24px",

                      color:
                        "#777",

                      textAlign:
                        "center",
                    }}
                  >
                    Recherche un projet, une note,
                    une tâche, une sous-tâche, un
                    texte ou une référence comme
                    @Daniel.
                  </div>
                )}

              {!chargement &&
                recherche.trim() &&
                resultats.length ===
                  0 && (
                  <div
                    style={{
                      padding:
                        "24px",

                      color:
                        "#777",

                      textAlign:
                        "center",
                    }}
                  >
                    Aucun résultat pour «{" "}
                    {recherche} ».
                  </div>
                )}

              {!chargement &&
                resultats.map(
                  (resultat) => (
                    <button
                      key={
                        resultat.id
                      }
                      type="button"
                      onClick={() =>
                        ouvrirResultat(
                          resultat
                        )
                      }
                      style={{
                        display:
                          "flex",

                        gap:
                          "12px",

                        width:
                          "100%",

                        padding:
                          "13px 14px",

                        border:
                          "none",

                        borderBottom:
                          "1px solid #eee",

                        background:
                          "#fff",

                        cursor:
                          "pointer",

                        textAlign:
                          "left",

                        fontFamily:
                          "inherit",
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            "20px",

                          flexShrink:
                            0,

                          paddingTop:
                            "2px",
                        }}
                      >
                        {obtenirIcone(
                          resultat.type
                        )}
                      </div>

                      <div
                        style={{
                          flex:
                            1,

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
                              "4px",
                          }}
                        >
                          <strong
                            style={{
                              overflow:
                                "hidden",

                              textOverflow:
                                "ellipsis",

                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              resultat.titre
                            }
                          </strong>

                          <span
                            style={{
                              fontSize:
                                "10px",

                              padding:
                                "3px 6px",

                              borderRadius:
                                "999px",

                              background:
                                "#f1f1f1",

                              color:
                                "#666",

                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {obtenirTypeNom(
                              resultat.type
                            )}
                          </span>
                        </div>

                        {resultat.type !==
                          "projet" && (
                          <div
                            style={{
                              color:
                                "#999",

                              fontSize:
                                "11px",

                              marginBottom:
                                "4px",
                            }}
                          >
                            {
                              resultat
                                .projet
                                .nom
                            }

                            {resultat.type ===
                              "tacheProjet" &&
                              resultat.dateEcheance && (
                                <>
                                  {" "}
                                  • 📅{" "}
                                  {
                                    resultat.dateEcheance
                                  }
                                </>
                              )}
                          </div>
                        )}

                        {resultat.texte && (
                          <div
                            style={{
                              color:
                                resultat.complete
                                  ? "#999"
                                  : "#666",

                              fontSize:
                                "12px",

                              lineHeight:
                                1.4,

                              textDecoration:
                                resultat.complete
                                  ? "line-through"
                                  : "none",
                            }}
                          >
                            {raccourcirTexte(
                              resultat.texte
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                )}
            </div>
          </div>
        )}

        {!rechercheOuverte && (
          <span
            style={{
              color:
                "#aaa",

              fontSize:
                "11px",
            }}
          >
            Ctrl + K
          </span>
        )}
      </div>
    </header>
  );
}

export default Topbar;