import {
  useEffect,
  useMemo,
  useState,
} from "react";

import PageNote from "./PageNote";

import {
  chargerNotes,
  chargerTachesProjet,
} from "../utils/firestoreJoNote";

function PageCalendrier({
  projet,
}) {
  const [
    notes,
    setNotes,
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

  const [
    dateAffichee,
    setDateAffichee,
  ] = useState(
    new Date()
  );

  const charger =
    async () => {
      try {
        setChargement(true);
        setErreur("");

        const [
          notesFirebase,
          tachesFirebase,
        ] =
          await Promise.all([
            chargerNotes(
              projet.id
            ),

            chargerTachesProjet(
              projet.id
            ),
          ]);

        setNotes(
          notesFirebase.filter(
            (note) =>
              note.dansCalendrier ===
                true &&
              (
                note.dateCalendrier ||
                ""
              ).trim() !==
                ""
          )
        );

        setTaches(
          tachesFirebase.filter(
            (tache) =>
              (
                tache.dateEcheance ||
                ""
              ).trim() !==
                ""
          )
        );
      } catch (error) {
        console.error(
          "Erreur chargement calendrier :",
          error
        );

        setErreur(
          "Impossible de charger le calendrier."
        );
      } finally {
        setChargement(false);
      }
    };

  useEffect(() => {
    if (!projet?.id) {
      return;
    }

    charger();
  }, [
    projet?.id,
  ]);

  const annee =
    dateAffichee.getFullYear();

  const mois =
    dateAffichee.getMonth();

  const premierJour =
    new Date(
      annee,
      mois,
      1
    );

  const dernierJour =
    new Date(
      annee,
      mois + 1,
      0
    );

  const decalageDebut =
    (
      premierJour.getDay() +
      6
    ) %
    7;

  const nombreJours =
    dernierJour.getDate();

  const cellules =
    [];

  for (
    let index = 0;
    index < decalageDebut;
    index += 1
  ) {
    cellules.push(
      null
    );
  }

  for (
    let jour = 1;
    jour <= nombreJours;
    jour += 1
  ) {
    cellules.push(
      jour
    );
  }

  while (
    cellules.length %
      7 !==
    0
  ) {
    cellules.push(
      null
    );
  }

  const obtenirDateCle = (
    jour
  ) => {
    const moisValeur =
      String(
        mois + 1
      ).padStart(
        2,
        "0"
      );

    const jourValeur =
      String(
        jour
      ).padStart(
        2,
        "0"
      );

    return `${annee}-${moisValeur}-${jourValeur}`;
  };

  const contenuParDate =
    useMemo(() => {
      const resultat =
        {};

      notes.forEach(
        (note) => {
          const date =
            note.dateCalendrier;

          if (!date) {
            return;
          }

          if (
            !resultat[
              date
            ]
          ) {
            resultat[
              date
            ] = {
              notes: [],
              taches: [],
            };
          }

          resultat[
            date
          ].notes.push(
            note
          );
        }
      );

      taches.forEach(
        (tache) => {
          const date =
            tache.dateEcheance;

          if (!date) {
            return;
          }

          if (
            !resultat[
              date
            ]
          ) {
            resultat[
              date
            ] = {
              notes: [],
              taches: [],
            };
          }

          resultat[
            date
          ].taches.push(
            tache
          );
        }
      );

      return resultat;
    }, [
      notes,
      taches,
    ]);

  const moisPrecedent =
    () => {
      setDateAffichee(
        new Date(
          annee,
          mois - 1,
          1
        )
      );
    };

  const moisSuivant =
    () => {
      setDateAffichee(
        new Date(
          annee,
          mois + 1,
          1
        )
      );
    };

  const allerAujourdhui =
    () => {
      setDateAffichee(
        new Date()
      );
    };

  const estAujourdhui = (
    jour
  ) => {
    if (!jour) {
      return false;
    }

    const maintenant =
      new Date();

    return (
      jour ===
        maintenant.getDate() &&
      mois ===
        maintenant.getMonth() &&
      annee ===
        maintenant.getFullYear()
    );
  };

  const formaterTitreMois =
    dateAffichee.toLocaleDateString(
      "fr-CA",
      {
        month:
          "long",

        year:
          "numeric",
      }
    );

  const handleRetourNote =
    async () => {
      setNoteSelectionnee(
        null
      );

      await charger();
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

  const joursSemaine = [
    "Lun",
    "Mar",
    "Mer",
    "Jeu",
    "Ven",
    "Sam",
    "Dim",
  ];

  return (
    <div
      style={{
        padding:
          "28px 32px 40px",
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
            "18px",

          flexWrap:
            "wrap",

          marginBottom:
            "20px",
        }}
      >
        <div>
          <h2
            style={{
              margin:
                "0 0 4px",

              textTransform:
                "capitalize",
            }}
          >
            📅{" "}
            {formaterTitreMois}
          </h2>

          <p
            style={{
              margin: 0,

              color:
                "#777",

              fontSize:
                "12px",
            }}
          >
            Notes et échéances du projet.
          </p>
        </div>

        <div
          style={{
            display:
              "flex",

            gap:
              "7px",
          }}
        >
          <button
            type="button"
            onClick={
              moisPrecedent
            }
          >
            ←
          </button>

          <button
            type="button"
            onClick={
              allerAujourdhui
            }
          >
            Aujourd'hui
          </button>

          <button
            type="button"
            onClick={
              moisSuivant
            }
          >
            →
          </button>
        </div>
      </div>

      {chargement && (
        <div
          style={{
            padding:
              "30px",

            textAlign:
              "center",

            color:
              "#777",
          }}
        >
          Chargement du calendrier...
        </div>
      )}

      {!chargement &&
        erreur && (
          <div
            style={{
              padding:
                "15px",

              border:
                "1px solid #e3aaaa",

              borderRadius:
                "10px",

              background:
                "#fff3f3",
            }}
          >
            {erreur}
          </div>
        )}

      {!chargement &&
        !erreur && (
          <div
            style={{
              border:
                "1px solid #ddd",

              borderRadius:
                "12px",

              overflow:
                "hidden",

              background:
                "#fff",
            }}
          >
            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(7, minmax(0, 1fr))",

                background:
                  "#f7f7f7",

                borderBottom:
                  "1px solid #ddd",
              }}
            >
              {joursSemaine.map(
                (jour) => (
                  <div
                    key={
                      jour
                    }
                    style={{
                      padding:
                        "9px",

                      textAlign:
                        "center",

                      fontSize:
                        "11px",

                      fontWeight:
                        "700",

                      color:
                        "#666",
                    }}
                  >
                    {jour}
                  </div>
                )
              )}
            </div>

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(7, minmax(0, 1fr))",
              }}
            >
              {cellules.map(
                (
                  jour,
                  index
                ) => {
                  if (!jour) {
                    return (
                      <div
                        key={
                          `vide-${index}`
                        }
                        style={{
                          minHeight:
                            "125px",

                          background:
                            "#fafafa",

                          borderRight:
                            index %
                              7 !==
                            6
                              ? "1px solid #eee"
                              : "none",

                          borderBottom:
                            "1px solid #eee",
                        }}
                      />
                    );
                  }

                  const dateCle =
                    obtenirDateCle(
                      jour
                    );

                  const contenu =
                    contenuParDate[
                      dateCle
                    ] || {
                      notes:
                        [],

                      taches:
                        [],
                    };

                  return (
                    <div
                      key={
                        dateCle
                      }
                      style={{
                        minHeight:
                          "125px",

                        padding:
                          "7px",

                        borderRight:
                          index %
                            7 !==
                          6
                            ? "1px solid #eee"
                            : "none",

                        borderBottom:
                          "1px solid #eee",

                        background:
                          estAujourdhui(
                            jour
                          )
                            ? "#f6faff"
                            : "#fff",

                        minWidth:
                          0,
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",

                          justifyContent:
                            "flex-end",

                          marginBottom:
                            "5px",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            width:
                              "24px",

                            height:
                              "24px",

                            borderRadius:
                              "50%",

                            background:
                              estAujourdhui(
                                jour
                              )
                                ? "#222"
                                : "transparent",

                            color:
                              estAujourdhui(
                                jour
                              )
                                ? "#fff"
                                : "#555",

                            fontSize:
                              "11px",

                            fontWeight:
                              "700",
                          }}
                        >
                          {jour}
                        </span>
                      </div>

                      <div
                        style={{
                          display:
                            "flex",

                          flexDirection:
                            "column",

                          gap:
                            "4px",
                        }}
                      >
                        {contenu.notes.map(
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

                                padding:
                                  "5px 6px",

                                border:
                                  "1px solid #d8e4ef",

                                borderRadius:
                                  "5px",

                                background:
                                  "#f2f7fb",

                                textAlign:
                                  "left",

                                fontSize:
                                  "9px",

                                cursor:
                                  "pointer",

                                overflow:
                                  "hidden",

                                textOverflow:
                                  "ellipsis",

                                whiteSpace:
                                  "nowrap",
                              }}
                              title={
                                note.titre ||
                                "Sans titre"
                              }
                            >
                              📝{" "}
                              {note.titre ||
                                "Sans titre"}
                            </button>
                          )
                        )}

                        {contenu.taches.map(
                          (tache) => {
                            const total =
                              Array.isArray(
                                tache.elements
                              )
                                ? tache
                                    .elements
                                    .length
                                : 0;

                            const terminees =
                              Array.isArray(
                                tache.elements
                              )
                                ? tache
                                    .elements
                                    .filter(
                                      (
                                        element
                                      ) =>
                                        element.complete ===
                                        true
                                    )
                                    .length
                                : 0;

                            return (
                              <div
                                key={
                                  tache.id
                                }
                                style={{
                                  width:
                                    "100%",

                                  padding:
                                    "5px 6px",

                                  border:
                                    tache.complete
                                      ? "1px solid #ddd"
                                      : "1px solid #e2d49b",

                                  borderRadius:
                                    "5px",

                                  background:
                                    tache.complete
                                      ? "#f5f5f5"
                                      : "#fffbea",

                                  fontSize:
                                    "9px",

                                  color:
                                    tache.complete
                                      ? "#999"
                                      : "#544b25",
                                }}
                                title={
                                  tache.titre
                                }
                              >
                                <div
                                  style={{
                                    overflow:
                                      "hidden",

                                    textOverflow:
                                      "ellipsis",

                                    whiteSpace:
                                      "nowrap",

                                    textDecoration:
                                      tache.complete
                                        ? "line-through"
                                        : "none",

                                    fontWeight:
                                      "600",
                                  }}
                                >
                                  ☑️{" "}
                                  {tache.titre ||
                                    "Sans titre"}
                                </div>

                                {total >
                                  0 && (
                                  <div
                                    style={{
                                      marginTop:
                                        "2px",

                                      fontSize:
                                        "8px",

                                      opacity:
                                        0.75,
                                    }}
                                  >
                                    {
                                      terminees
                                    }
                                    /
                                    {
                                      total
                                    }
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
    </div>
  );
}

export default PageCalendrier;