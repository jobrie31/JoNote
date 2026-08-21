import {
  useEffect,
  useMemo,
  useState,
} from "react";

import PageNote from "./PageNote";

import {
  chargerNotes,
  chargerBlocs,
  extraireReferences,
} from "../utils/firestoreJoNote";

function PageReferences({
  projet,
}) {
  const [
    references,
    setReferences,
  ] = useState([]);

  const [
    referenceSelectionnee,
    setReferenceSelectionnee,
  ] = useState(null);

  const [
    noteSelectionnee,
    setNoteSelectionnee,
  ] = useState(null);

  const [
    recherche,
    setRecherche,
  ] = useState("");

  const [
    chargement,
    setChargement,
  ] = useState(true);

  const [
    erreur,
    setErreur,
  ] = useState("");

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
      .replace(/@/g, "")
      .toLowerCase()
      .trim();
  };

  const construireReferences =
    async () => {
      try {
        setChargement(true);
        setErreur("");

        const notes =
          await chargerNotes(
            projet.id
          );

        const referencesMap =
          new Map();

        const ajouterMention = ({
          nom,
          note,
          type,
          contenu,
          blocId = null,
        }) => {
          if (!nom) {
            return;
          }

          const cle =
            normaliserTexte(
              nom
            );

          if (!cle) {
            return;
          }

          if (
            !referencesMap.has(
              cle
            )
          ) {
            referencesMap.set(
              cle,
              {
                cle,
                nom,
                mentions: [],
              }
            );
          }

          const reference =
            referencesMap.get(
              cle
            );

          reference.mentions.push({
            id: `${note.id}-${blocId || "titre"}-${reference.mentions.length}`,

            note,

            noteId:
              note.id,

            blocId,

            type,

            contenu,
          });
        };

        for (
          const note of notes
        ) {
          /*
            Références dans le titre.
            On recalcule aussi avec
            extraireReferences pour
            supporter les anciennes notes
            qui n'auraient pas encore le
            champ references dans Firebase.
          */
          const referencesTitre =
            Array.isArray(
              note.references
            )
              ? note.references
              : extraireReferences(
                  note.titre || ""
                );

          referencesTitre.forEach(
            (nom) => {
              ajouterMention({
                nom,

                note,

                type:
                  "titre",

                contenu:
                  note.titre ||
                  "Sans titre",
              });
            }
          );

          const blocs =
            await chargerBlocs(
              projet.id,
              note.id
            );

          blocs.forEach(
            (bloc) => {
              if (
                bloc.type !==
                "texte"
              ) {
                return;
              }

              const contenu =
                bloc.contenu ||
                "";

              if (
                !contenu.trim()
              ) {
                return;
              }

              /*
                Même logique ici :
                si references existe déjà,
                on l'utilise.
                Sinon on les détecte
                directement dans le texte.
              */
              const referencesBloc =
                Array.isArray(
                  bloc.references
                )
                  ? bloc.references
                  : extraireReferences(
                      contenu
                    );

              referencesBloc.forEach(
                (nom) => {
                  ajouterMention({
                    nom,

                    note,

                    blocId:
                      bloc.id,

                    type:
                      bloc.important ===
                      true
                        ? "important"
                        : "texte",

                    contenu,
                  });
                }
              );
            }
          );
        }

        const liste =
          Array.from(
            referencesMap.values()
          );

        liste.sort(
          (a, b) => {
            if (
              b.mentions.length !==
              a.mentions.length
            ) {
              return (
                b.mentions.length -
                a.mentions.length
              );
            }

            return a.nom.localeCompare(
              b.nom,
              "fr",
              {
                sensitivity:
                  "base",
              }
            );
          }
        );

        setReferences(
          liste
        );

        if (
          referenceSelectionnee
        ) {
          const cle =
            referenceSelectionnee.cle;

          const nouvelleReference =
            liste.find(
              (reference) =>
                reference.cle ===
                cle
            );

          setReferenceSelectionnee(
            nouvelleReference ||
              null
          );
        }
      } catch (error) {
        console.error(
          "Erreur chargement références :",
          error
        );

        setErreur(
          "Impossible de charger les références."
        );
      } finally {
        setChargement(false);
      }
    };

  useEffect(() => {
    if (!projet?.id) {
      return;
    }

    construireReferences();
  }, [
    projet?.id,
  ]);

  const referencesAffichees =
    useMemo(() => {
      const terme =
        normaliserTexte(
          recherche
        );

      if (!terme) {
        return references;
      }

      return references.filter(
        (reference) =>
          normaliserTexte(
            reference.nom
          ).includes(
            terme
          )
      );
    }, [
      references,
      recherche,
    ]);

  const mentionsSelectionnees =
    useMemo(() => {
      if (
        !referenceSelectionnee
      ) {
        return [];
      }

      return [
        ...referenceSelectionnee.mentions,
      ];
    }, [
      referenceSelectionnee,
    ]);

  const notesUniques =
    useMemo(() => {
      if (
        !referenceSelectionnee
      ) {
        return 0;
      }

      return new Set(
        referenceSelectionnee.mentions.map(
          (mention) =>
            mention.noteId
        )
      ).size;
    }, [
      referenceSelectionnee,
    ]);

  const raccourcirTexte = (
    texte,
    longueur = 240
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

  const obtenirIconeMention = (
    type
  ) => {
    switch (type) {
      case "titre":
        return "📝";

      case "important":
        return "⭐";

      case "texte":
        return "💬";

      default:
        return "•";
    }
  };

  const obtenirNomMention = (
    type
  ) => {
    switch (type) {
      case "titre":
        return "Titre";

      case "important":
        return "Texte important";

      case "texte":
        return "Texte";

      default:
        return "";
    }
  };

  const handleOuvrirNote = (
    note
  ) => {
    setNoteSelectionnee(
      note
    );
  };

  const handleRetourNote =
    async () => {
      setNoteSelectionnee(
        null
      );

      await construireReferences();
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
            "1200px",

          margin:
            "0 auto",
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
              "20px",

            flexWrap:
              "wrap",

            marginBottom:
              "24px",
          }}
        >
          <div>
            <h2
              style={{
                margin:
                  "0 0 6px",
              }}
            >
              @ Références
            </h2>

            <p
              style={{
                margin: 0,

                color:
                  "#777",
              }}
            >
              Retrouve toutes les
              références utilisées
              dans les notes de{" "}
              {projet.nom}.
            </p>
          </div>

          {!chargement && (
            <div
              style={{
                padding:
                  "8px 13px",

                borderRadius:
                  "999px",

                background:
                  "#f1f4f7",

                color:
                  "#52606d",

                fontSize:
                  "13px",

                fontWeight:
                  "600",
              }}
            >
              {
                references.length
              }{" "}
              référence
              {references.length !==
              1
                ? "s"
                : ""}
            </div>
          )}
        </div>

        {chargement && (
          <div
            style={{
              padding:
                "40px",

              textAlign:
                "center",

              color:
                "#777",
            }}
          >
            Chargement des
            références...
          </div>
        )}

        {!chargement &&
          erreur && (
            <div
              style={{
                padding:
                  "18px",

                border:
                  "1px solid #e2aaaa",

                background:
                  "#fff2f2",

                borderRadius:
                  "12px",
              }}
            >
              {erreur}
            </div>
          )}

        {!chargement &&
          !erreur &&
          references.length ===
            0 && (
            <div
              style={{
                padding:
                  "40px",

                border:
                  "1px dashed #ccc",

                borderRadius:
                  "14px",

                textAlign:
                  "center",

                color:
                  "#777",
              }}
            >
              <h3
                style={{
                  marginTop:
                    0,

                  color:
                    "#333",
                }}
              >
                Aucune référence
              </h3>

              <p>
                Écris quelque chose
                comme{" "}
                <strong>
                  @Daniel
                </strong>{" "}
                dans le titre ou le
                texte d'une note.
              </p>
            </div>
          )}

        {!chargement &&
          !erreur &&
          references.length >
            0 && (
            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "minmax(260px, 330px) minmax(0, 1fr)",

                gap:
                  "20px",

                alignItems:
                  "start",
              }}
            >
              {/* COLONNE GAUCHE */}

              <div
                style={{
                  border:
                    "1px solid #ddd",

                  borderRadius:
                    "14px",

                  background:
                    "#fff",

                  overflow:
                    "hidden",
                }}
              >
                <div
                  style={{
                    padding:
                      "14px",

                    borderBottom:
                      "1px solid #eee",

                    background:
                      "#fafafa",
                  }}
                >
                  <input
                    type="text"
                    value={
                      recherche
                    }
                    onChange={(e) =>
                      setRecherche(
                        e.target.value
                      )
                    }
                    placeholder="Rechercher @..."
                    style={{
                      width:
                        "100%",

                      boxSizing:
                        "border-box",

                      padding:
                        "9px 11px",

                      border:
                        "1px solid #d6d6d6",

                      borderRadius:
                        "8px",

                      outline:
                        "none",

                      fontFamily:
                        "inherit",
                    }}
                  />
                </div>

                <div
                  style={{
                    maxHeight:
                      "650px",

                    overflowY:
                      "auto",
                  }}
                >
                  {referencesAffichees.length ===
                    0 && (
                    <div
                      style={{
                        padding:
                          "24px",

                        textAlign:
                          "center",

                        color:
                          "#888",

                        fontSize:
                          "13px",
                      }}
                    >
                      Aucune référence
                      trouvée.
                    </div>
                  )}

                  {referencesAffichees.map(
                    (
                      reference
                    ) => {
                      const actif =
                        referenceSelectionnee?.cle ===
                        reference.cle;

                      const nombreNotes =
                        new Set(
                          reference.mentions.map(
                            (
                              mention
                            ) =>
                              mention.noteId
                          )
                        ).size;

                      return (
                        <button
                          key={
                            reference.cle
                          }
                          type="button"
                          onClick={() =>
                            setReferenceSelectionnee(
                              reference
                            )
                          }
                          style={{
                            display:
                              "block",

                            width:
                              "100%",

                            border:
                              "none",

                            borderBottom:
                              "1px solid #eee",

                            padding:
                              "13px 14px",

                            background:
                              actif
                                ? "#eef3f8"
                                : "#fff",

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
                              display:
                                "flex",

                              justifyContent:
                                "space-between",

                              alignItems:
                                "center",

                              gap:
                                "10px",
                            }}
                          >
                            <strong
                              style={{
                                color:
                                  actif
                                    ? "#32485c"
                                    : "#222",
                              }}
                            >
                              @
                              {
                                reference.nom
                              }
                            </strong>

                            <span
                              style={{
                                padding:
                                  "3px 7px",

                                borderRadius:
                                  "999px",

                                background:
                                  actif
                                    ? "#dce8f2"
                                    : "#f1f1f1",

                                color:
                                  "#666",

                                fontSize:
                                  "11px",

                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {
                                reference
                                  .mentions
                                  .length
                              }
                            </span>
                          </div>

                          <div
                            style={{
                              marginTop:
                                "4px",

                              color:
                                "#888",

                              fontSize:
                                "11px",
                            }}
                          >
                            {
                              nombreNotes
                            }{" "}
                            note
                            {nombreNotes !==
                            1
                              ? "s"
                              : ""}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>

              {/* COLONNE DROITE */}

              <div>
                {!referenceSelectionnee && (
                  <div
                    style={{
                      minHeight:
                        "300px",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      padding:
                        "40px",

                      border:
                        "1px dashed #ccc",

                      borderRadius:
                        "14px",

                      color:
                        "#777",

                      textAlign:
                        "center",
                    }}
                  >
                    Sélectionne une
                    référence à gauche
                    pour voir toutes ses
                    mentions.
                  </div>
                )}

                {referenceSelectionnee && (
                  <>
                    <div
                      style={{
                        display:
                          "flex",

                        justifyContent:
                          "space-between",

                        alignItems:
                          "flex-start",

                        gap:
                          "16px",

                        flexWrap:
                          "wrap",

                        marginBottom:
                          "18px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin:
                              "0 0 5px",

                            fontSize:
                              "24px",

                            color:
                              "#32485c",
                          }}
                        >
                          @
                          {
                            referenceSelectionnee.nom
                          }
                        </h3>

                        <p
                          style={{
                            margin:
                              0,

                            color:
                              "#777",
                          }}
                        >
                          {
                            referenceSelectionnee
                              .mentions
                              .length
                          }{" "}
                          mention
                          {referenceSelectionnee
                            .mentions
                            .length !==
                          1
                            ? "s"
                            : ""}{" "}
                          dans{" "}
                          {
                            notesUniques
                          }{" "}
                          note
                          {notesUniques !==
                          1
                            ? "s"
                            : ""}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setReferenceSelectionnee(
                            null
                          )
                        }
                      >
                        Fermer
                      </button>
                    </div>

                    <div
                      style={{
                        display:
                          "flex",

                        flexDirection:
                          "column",

                        gap:
                          "10px",
                      }}
                    >
                      {mentionsSelectionnees.map(
                        (
                          mention
                        ) => (
                          <button
                            key={
                              mention.id
                            }
                            type="button"
                            onClick={() =>
                              handleOuvrirNote(
                                mention.note
                              )
                            }
                            style={{
                              width:
                                "100%",

                              border:
                                mention.type ===
                                "important"
                                  ? "1px solid #e0cf78"
                                  : "1px solid #ddd",

                              borderRadius:
                                "12px",

                              padding:
                                "15px",

                              background:
                                mention.type ===
                                "important"
                                  ? "#fffbed"
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
                                  "flex-start",

                                gap:
                                  "12px",

                                marginBottom:
                                  "8px",
                              }}
                            >
                              <div
                                style={{
                                  display:
                                    "flex",

                                  gap:
                                    "8px",

                                  alignItems:
                                    "center",

                                  minWidth:
                                    0,
                                }}
                              >
                                <span>
                                  {obtenirIconeMention(
                                    mention.type
                                  )}
                                </span>

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
                                  {mention
                                    .note
                                    .titre ||
                                    "Sans titre"}
                                </strong>
                              </div>

                              <span
                                style={{
                                  padding:
                                    "3px 7px",

                                  borderRadius:
                                    "999px",

                                  background:
                                    "#f1f1f1",

                                  color:
                                    "#777",

                                  fontSize:
                                    "10px",

                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {obtenirNomMention(
                                  mention.type
                                )}
                              </span>
                            </div>

                            <div
                              style={{
                                color:
                                  "#666",

                                fontSize:
                                  "13px",

                                lineHeight:
                                  1.5,

                                whiteSpace:
                                  "pre-wrap",
                              }}
                            >
                              {raccourcirTexte(
                                mention.contenu
                              )}
                            </div>

                            <div
                              style={{
                                marginTop:
                                  "10px",

                                color:
                                  "#999",

                                fontSize:
                                  "11px",
                              }}
                            >
                              Cliquer pour
                              ouvrir la note
                            </div>
                          </button>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default PageReferences;