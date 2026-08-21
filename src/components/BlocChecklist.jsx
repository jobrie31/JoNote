import {
  useEffect,
  useRef,
  useState,
} from "react";

function BlocChecklistLegacy({
  bloc,
  onModifier,
  onSupprimer,
}) {
  const [
    elements,
    setElements,
  ] = useState(
    bloc.elements || []
  );

  const timerRef =
    useRef(null);

  useEffect(() => {
    setElements(
      bloc.elements || []
    );
  }, [
    bloc.id,
    bloc.elements,
  ]);

  useEffect(() => {
    return () => {
      if (
        timerRef.current
      ) {
        clearTimeout(
          timerRef.current
        );
      }
    };
  }, []);

  const obtenirNombre = (
    valeur,
    defaut
  ) => {
    const nombre =
      Number(valeur);

    if (
      Number.isNaN(nombre) ||
      nombre < 0
    ) {
      return defaut;
    }

    return nombre;
  };

  const obtenirDateLocale = (
    valeur
  ) => {
    if (!valeur) {
      return null;
    }

    const [
      annee,
      mois,
      jour,
    ] = valeur.split("-");

    if (
      !annee ||
      !mois ||
      !jour
    ) {
      return null;
    }

    return new Date(
      Number(annee),
      Number(mois) - 1,
      Number(jour)
    );
  };

  const obtenirEtatEcheance = (
    element
  ) => {
    if (
      element.complete ||
      !element.dateEcheance
    ) {
      return {
        niveau:
          "normal",

        joursRestants:
          null,
      };
    }

    const echeance =
      obtenirDateLocale(
        element.dateEcheance
      );

    if (!echeance) {
      return {
        niveau:
          "normal",

        joursRestants:
          null,
      };
    }

    const aujourdhui =
      new Date();

    aujourdhui.setHours(
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

    const difference =
      echeance.getTime() -
      aujourdhui.getTime();

    const joursRestants =
      Math.ceil(
        difference /
          86400000
      );

    const joursJaune =
      obtenirNombre(
        element.joursJaune,
        7
      );

    const joursRouge =
      obtenirNombre(
        element.joursRouge,
        2
      );

    if (
      joursRestants <=
      joursRouge
    ) {
      return {
        niveau:
          "rouge",

        joursRestants,
      };
    }

    if (
      joursRestants <=
      joursJaune
    ) {
      return {
        niveau:
          "jaune",

        joursRestants,
      };
    }

    return {
      niveau:
        "normal",

      joursRestants,
    };
  };

  const sauvegarder = (
    nouveauxElements
  ) => {
    setElements(
      nouveauxElements
    );

    if (
      timerRef.current
    ) {
      clearTimeout(
        timerRef.current
      );
    }

    timerRef.current =
      setTimeout(
        () => {
          onModifier(
            bloc.id,
            nouveauxElements
          );
        },
        500
      );
  };

  const modifierElement = (
    elementId,
    modifications
  ) => {
    const nouveauxElements =
      elements.map(
        (element) =>
          element.id ===
          elementId
            ? {
                ...element,
                ...modifications,
              }
            : element
      );

    sauvegarder(
      nouveauxElements
    );
  };

  const modifierTexte = (
    elementId,
    texte
  ) => {
    modifierElement(
      elementId,
      {
        texte,
      }
    );
  };

  const toggleComplete = (
    elementId
  ) => {
    const element =
      elements.find(
        (item) =>
          item.id ===
          elementId
      );

    if (!element) {
      return;
    }

    modifierElement(
      elementId,
      {
        complete:
          !element.complete,
      }
    );
  };

  const modifierDateEcheance = (
    elementId,
    dateEcheance
  ) => {
    modifierElement(
      elementId,
      {
        dateEcheance,
      }
    );
  };

  const modifierJoursJaune = (
    elementId,
    valeur
  ) => {
    modifierElement(
      elementId,
      {
        joursJaune:
          obtenirNombre(
            valeur,
            7
          ),
      }
    );
  };

  const modifierJoursRouge = (
    elementId,
    valeur
  ) => {
    modifierElement(
      elementId,
      {
        joursRouge:
          obtenirNombre(
            valeur,
            2
          ),
      }
    );
  };

  const ajouterElement =
    () => {
      const nouveauxElements =
        [
          ...elements,
          {
            id:
              crypto.randomUUID(),

            texte: "",

            complete:
              false,

            dateEcheance:
              "",

            joursJaune:
              7,

            joursRouge:
              2,
          },
        ];

      sauvegarder(
        nouveauxElements
      );
    };

  const supprimerElement = (
    elementId
  ) => {
    const nouveauxElements =
      elements.filter(
        (element) =>
          element.id !==
          elementId
      );

    sauvegarder(
      nouveauxElements
    );
  };

  const formaterDate = (
    valeur
  ) => {
    const date =
      obtenirDateLocale(
        valeur
      );

    if (!date) {
      return "";
    }

    return date.toLocaleDateString(
      "fr-CA",
      {
        day:
          "numeric",

        month:
          "short",

        year:
          "numeric",
      }
    );
  };

  return (
    <div
      style={{
        border:
          "1px solid #e2e2e2",

        borderRadius:
          "12px",

        padding:
          "18px",

        background:
          "#fff",

        marginBottom:
          "14px",
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
            "12px",

          marginBottom:
            "14px",
        }}
      >
        <strong>
          Checklist
        </strong>

        <button
          type="button"
          onClick={() =>
            onSupprimer(
              bloc.id
            )
          }
        >
          Supprimer
        </button>
      </div>

      <div
        style={{
          display:
            "flex",

          flexDirection:
            "column",

          gap:
            "9px",
        }}
      >
        {elements.map(
          (element) => {
            const etat =
              obtenirEtatEcheance(
                element
              );

            let background =
              "#fff";

            let border =
              "1px solid #eee";

            if (
              !element.complete &&
              etat.niveau ===
                "jaune"
            ) {
              background =
                "#fffbea";

              border =
                "1px solid #dfcb70";
            }

            if (
              !element.complete &&
              etat.niveau ===
                "rouge"
            ) {
              background =
                "#fff0f0";

              border =
                "1px solid #dc8e8e";
            }

            if (
              element.complete
            ) {
              background =
                "#f8f8f8";
            }

            return (
              <div
                key={
                  element.id
                }
                style={{
                  padding:
                    "9px 10px",

                  border,

                  borderRadius:
                    "8px",

                  background,
                }}
              >
                <div
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap:
                      "10px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      element.complete
                    }
                    onChange={() =>
                      toggleComplete(
                        element.id
                      )
                    }
                  />

                  <input
                    type="text"
                    value={
                      element.texte
                    }
                    onChange={(e) =>
                      modifierTexte(
                        element.id,
                        e.target.value
                      )
                    }
                    placeholder="Nouvelle tâche..."
                    style={{
                      flex: 1,

                      border:
                        "none",

                      borderBottom:
                        "1px solid #ddd",

                      outline:
                        "none",

                      padding:
                        "7px 4px",

                      fontSize:
                        "14px",

                      background:
                        "transparent",

                      textDecoration:
                        element.complete
                          ? "line-through"
                          : "none",

                      opacity:
                        element.complete
                          ? 0.6
                          : 1,
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      supprimerElement(
                        element.id
                      )
                    }
                    title="Supprimer l'élément"
                  >
                    ×
                  </button>
                </div>

                {!element.complete && (
                  <div
                    style={{
                      marginLeft:
                        "28px",

                      marginTop:
                        "8px",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      gap:
                        "8px",

                      flexWrap:
                        "wrap",
                    }}
                  >
                    <label
                      style={{
                        display:
                          "flex",

                        alignItems:
                          "center",

                        gap:
                          "5px",

                        fontSize:
                          "10px",

                        color:
                          "#666",
                      }}
                    >
                      📅
                      <input
                        type="date"
                        value={
                          element.dateEcheance ||
                          ""
                        }
                        onChange={(e) =>
                          modifierDateEcheance(
                            element.id,
                            e.target.value
                          )
                        }
                        style={{
                          border:
                            "1px solid #ccc",

                          borderRadius:
                            "6px",

                          padding:
                            "4px 6px",

                          fontSize:
                            "10px",
                        }}
                      />
                    </label>

                    {element.dateEcheance && (
                      <>
                        <label
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap:
                              "4px",

                            fontSize:
                              "10px",

                            color:
                              "#776512",
                          }}
                        >
                          🟡
                          <input
                            type="number"
                            min="0"
                            value={
                              element.joursJaune ??
                              7
                            }
                            onChange={(e) =>
                              modifierJoursJaune(
                                element.id,
                                e.target.value
                              )
                            }
                            style={{
                              width:
                                "48px",

                              padding:
                                "4px",

                              border:
                                "1px solid #ccc",

                              borderRadius:
                                "5px",

                              fontSize:
                                "10px",
                            }}
                          />
                          j
                        </label>

                        <label
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap:
                              "4px",

                            fontSize:
                              "10px",

                            color:
                              "#a52d2d",
                          }}
                        >
                          🔴
                          <input
                            type="number"
                            min="0"
                            value={
                              element.joursRouge ??
                              2
                            }
                            onChange={(e) =>
                              modifierJoursRouge(
                                element.id,
                                e.target.value
                              )
                            }
                            style={{
                              width:
                                "48px",

                              padding:
                                "4px",

                              border:
                                "1px solid #ccc",

                              borderRadius:
                                "5px",

                              fontSize:
                                "10px",
                            }}
                          />
                          j
                        </label>
                      </>
                    )}

                    {element.dateEcheance && (
                      <span
                        style={{
                          marginLeft:
                            "auto",

                          fontSize:
                            "9px",

                          color:
                            etat.niveau ===
                            "rouge"
                              ? "#a52d2d"
                              : etat.niveau ===
                                "jaune"
                              ? "#776512"
                              : "#888",

                          fontWeight:
                            etat.niveau ===
                            "normal"
                              ? "400"
                              : "600",
                        }}
                      >
                        {formaterDate(
                          element.dateEcheance
                        )}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      <button
        type="button"
        onClick={
          ajouterElement
        }
        style={{
          marginTop:
            "14px",
        }}
      >
        + Ajouter une tâche
      </button>
    </div>
  );
}


function BlocChecklistTache({
  tache,
  onModifier,
  onSupprimer,
}) {
  const [etat, setEtat] = useState({
    titre: tache.titre || "",
    elements: Array.isArray(tache.elements)
      ? tache.elements
      : [],
    dateEcheance: tache.dateEcheance || "",
    joursJaune: Number(tache.joursJaune ?? 7),
    joursRouge: Number(tache.joursRouge ?? 2),
    complete: tache.complete === true,
    termineeLe: tache.termineeLe || "",
    noteConfirmation: tache.noteConfirmation || "",
  });

  const timerTacheRef = useRef(null);

  useEffect(() => {
    setEtat({
      titre: tache.titre || "",
      elements: Array.isArray(tache.elements)
        ? tache.elements
        : [],
      dateEcheance: tache.dateEcheance || "",
      joursJaune: Number(tache.joursJaune ?? 7),
      joursRouge: Number(tache.joursRouge ?? 2),
      complete: tache.complete === true,
      termineeLe: tache.termineeLe || "",
      noteConfirmation: tache.noteConfirmation || "",
    });
  }, [tache]);

  useEffect(() => {
    return () => {
      if (timerTacheRef.current) {
        clearTimeout(timerTacheRef.current);
      }
    };
  }, []);

  const programmerSauvegarde = (prochainEtat) => {
    if (timerTacheRef.current) {
      clearTimeout(timerTacheRef.current);
    }

    timerTacheRef.current = setTimeout(() => {
      onModifier(
        tache.id,
        prochainEtat
      );
    }, 500);
  };

  const mettreAJour = (modifications) => {
    setEtat((actuel) => {
      const prochain = {
        ...actuel,
        ...modifications,
      };

      programmerSauvegarde(prochain);

      return prochain;
    });
  };

  const mettreAJourElements = (nouveauxElements) => {
    const complete =
      nouveauxElements.length > 0 &&
      nouveauxElements.every(
        (element) =>
          element.complete === true
      );

    let termineeLe =
      etat.termineeLe || "";

    if (
      complete &&
      !etat.complete
    ) {
      termineeLe =
        new Date().toISOString();
    }

    if (!complete) {
      termineeLe = "";
    }

    mettreAJour({
      elements:
        nouveauxElements,
      complete,
      termineeLe,
    });
  };

  const ajouterElement = () => {
    mettreAJourElements([
      ...etat.elements,
      {
        id:
          crypto.randomUUID(),
        texte: "",
        complete:
          false,
        termineeLe:
          "",
        noteConfirmation:
          "",
      },
    ]);
  };

  const modifierTexte = (
    elementId,
    texte
  ) => {
    mettreAJourElements(
      etat.elements.map(
        (element) =>
          element.id ===
          elementId
            ? {
                ...element,
                texte,
              }
            : element
      )
    );
  };

  const toggleElement = (
    elementId
  ) => {
    const maintenant =
      new Date().toISOString();

    mettreAJourElements(
      etat.elements.map(
        (element) => {
          if (
            element.id !==
            elementId
          ) {
            return element;
          }

          const complete =
            !element.complete;

          return {
            ...element,
            complete,
            termineeLe:
              complete
                ? maintenant
                : "",
          };
        }
      )
    );
  };

  const modifierConfirmationElement = (
    elementId,
    valeur
  ) => {
    mettreAJourElements(
      etat.elements.map(
        (element) =>
          element.id ===
          elementId
            ? {
                ...element,
                noteConfirmation:
                  valeur,
              }
            : element
      )
    );
  };

  const supprimerElement = (
    elementId
  ) => {
    mettreAJourElements(
      etat.elements.filter(
        (element) =>
          element.id !==
          elementId
      )
    );
  };

  const toggleTache = () => {
    const complete =
      !etat.complete;

    const maintenant =
      new Date().toISOString();

    const elements =
      etat.elements.map(
        (element) => ({
          ...element,
          complete,
          termineeLe:
            complete
              ? (
                  element.termineeLe ||
                  maintenant
                )
              : "",
        })
      );

    mettreAJour({
      elements,
      complete,
      termineeLe:
        complete
          ? maintenant
          : "",
    });
  };

  const obtenirDate = (
    valeur
  ) => {
    if (!valeur) {
      return null;
    }

    const [
      annee,
      mois,
      jour,
    ] = valeur.split("-");

    if (
      !annee ||
      !mois ||
      !jour
    ) {
      return null;
    }

    return new Date(
      Number(annee),
      Number(mois) - 1,
      Number(jour)
    );
  };

  const obtenirEtatEcheance =
    () => {
      if (
        etat.complete ||
        !etat.dateEcheance
      ) {
        return "normal";
      }

      const echeance =
        obtenirDate(
          etat.dateEcheance
        );

      if (!echeance) {
        return "normal";
      }

      const maintenant =
        new Date();

      maintenant.setHours(
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

      const jours =
        Math.ceil(
          (
            echeance.getTime() -
            maintenant.getTime()
          ) /
            86400000
        );

      if (
        jours <=
        Number(
          etat.joursRouge ??
            2
        )
      ) {
        return "rouge";
      }

      if (
        jours <=
        Number(
          etat.joursJaune ??
            7
        )
      ) {
        return "jaune";
      }

      return "normal";
    };

  const etatEcheance =
    obtenirEtatEcheance();

  let background =
    "#fff";

  let border =
    "1px solid #dfe4e8";

  if (
    etatEcheance ===
    "jaune"
  ) {
    background =
      "#fffbea";

    border =
      "1px solid #dfcb70";
  }

  if (
    etatEcheance ===
    "rouge"
  ) {
    background =
      "#fff0f0";

    border =
      "1px solid #dc8e8e";
  }

  if (etat.complete) {
    background =
      "#f7f7f7";

    border =
      "1px solid #e1e1e1";
  }

  return (
    <div
      style={{
        border,
        borderRadius:
          "12px",
        padding:
          "14px",
        background,
        marginBottom:
          "14px",
      }}
    >
      <div
        style={{
          display:
            "flex",
          alignItems:
            "center",
          gap:
            "9px",
        }}
      >
        <input
          type="checkbox"
          checked={
            etat.complete
          }
          onChange={
            toggleTache
          }
        />

        <input
          type="text"
          value={
            etat.titre
          }
          onChange={(e) =>
            mettreAJour({
              titre:
                e.target.value,
            })
          }
          placeholder="Titre de la tâche..."
          style={{
            flex:
              1,
            minWidth:
              0,
            border:
              "none",
            borderBottom:
              "1px solid #ddd",
            outline:
              "none",
            padding:
              "5px 3px",
            background:
              "transparent",
            fontWeight:
              "700",
            fontSize:
              "14px",
            textDecoration:
              etat.complete
                ? "line-through"
                : "none",
          }}
        />

        <span
          style={{
            padding:
              "3px 7px",
            borderRadius:
              "999px",
            background:
              "#eef3f8",
            color:
              "#52697b",
            fontSize:
              "9px",
            fontWeight:
              "700",
            whiteSpace:
              "nowrap",
          }}
        >
          ☑️ Tâche du projet
        </span>

        <button
          type="button"
          onClick={() =>
            onSupprimer(
              tache.id
            )
          }
          title="Supprimer la tâche"
        >
          🗑
        </button>
      </div>

      {etat.complete && (
        <div
          style={{
            marginTop:
              "6px",
            marginLeft:
              "27px",
            display:
              "flex",
            alignItems:
              "center",
            gap:
              "7px",
            flexWrap:
              "wrap",
          }}
        >
          {etat.termineeLe && (
            <span
              style={{
                color:
                  "#777",
                fontSize:
                  "9px",
              }}
            >
              ✓{" "}
              {new Date(
                etat.termineeLe
              ).toLocaleDateString(
                "fr-CA",
                {
                  day:
                    "numeric",
                  month:
                    "short",
                  year:
                    "numeric",
                }
              )}
            </span>
          )}

          <input
            type="text"
            value={
              etat.noteConfirmation
            }
            onChange={(e) =>
              mettreAJour({
                noteConfirmation:
                  e.target.value,
              })
            }
            placeholder="Confirmation facultative..."
            style={{
              flex:
                "0 1 320px",
              minWidth:
                "170px",
              padding:
                "3px 6px",
              border:
                "1px solid #ddd",
              borderRadius:
                "5px",
              background:
                "#fff",
              fontSize:
                "9px",
            }}
          />
        </div>
      )}

      <div
        style={{
          display:
            "flex",
          flexDirection:
            "column",
          gap:
            "7px",
          marginTop:
            "12px",
        }}
      >
        {etat.elements.map(
          (element) => (
            <div
              key={
                element.id
              }
              style={{
                padding:
                  "6px 7px",
                borderRadius:
                  "7px",
                background:
                  element.complete
                    ? "rgba(255,255,255,0.65)"
                    : "transparent",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap:
                    "8px",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    element.complete ===
                    true
                  }
                  onChange={() =>
                    toggleElement(
                      element.id
                    )
                  }
                />

                <input
                  type="text"
                  value={
                    element.texte ||
                    ""
                  }
                  onChange={(e) =>
                    modifierTexte(
                      element.id,
                      e.target.value
                    )
                  }
                  placeholder="Sous-tâche..."
                  style={{
                    flex:
                      1,
                    minWidth:
                      0,
                    border:
                      "none",
                    borderBottom:
                      "1px solid #ddd",
                    outline:
                      "none",
                    padding:
                      "5px 3px",
                    background:
                      "transparent",
                    fontSize:
                      "12px",
                    textDecoration:
                      element.complete
                        ? "line-through"
                        : "none",
                    opacity:
                      element.complete
                        ? 0.65
                        : 1,
                  }}
                />

                <button
                  type="button"
                  onClick={() =>
                    supprimerElement(
                      element.id
                    )
                  }
                  title="Supprimer la sous-tâche"
                >
                  ×
                </button>
              </div>

              {element.complete && (
                <div
                  style={{
                    marginTop:
                      "4px",
                    marginLeft:
                      "26px",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    gap:
                      "7px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  {element.termineeLe && (
                    <span
                      style={{
                        color:
                          "#777",
                        fontSize:
                          "9px",
                      }}
                    >
                      ✓{" "}
                      {new Date(
                        element.termineeLe
                      ).toLocaleDateString(
                        "fr-CA",
                        {
                          day:
                            "numeric",
                          month:
                            "short",
                          year:
                            "numeric",
                        }
                      )}
                    </span>
                  )}

                  <input
                    type="text"
                    value={
                      element.noteConfirmation ||
                      ""
                    }
                    onChange={(e) =>
                      modifierConfirmationElement(
                        element.id,
                        e.target.value
                      )
                    }
                    placeholder="Confirmation facultative..."
                    style={{
                      flex:
                        "0 1 300px",
                      minWidth:
                        "160px",
                      padding:
                        "3px 6px",
                      border:
                        "1px solid #ddd",
                      borderRadius:
                        "5px",
                      background:
                        "#fff",
                      fontSize:
                        "9px",
                    }}
                  />
                </div>
              )}
            </div>
          )
        )}
      </div>

      <button
        type="button"
        onClick={
          ajouterElement
        }
        style={{
          marginTop:
            "10px",
          fontSize:
            "10px",
          padding:
            "5px 8px",
        }}
      >
        + Ajouter une sous-tâche
      </button>

      <div
        style={{
          marginTop:
            "12px",
          paddingTop:
            "10px",
          borderTop:
            "1px solid #eee",
          display:
            "flex",
          alignItems:
            "end",
          gap:
            "8px",
          flexWrap:
            "wrap",
        }}
      >
        <label
          style={{
            fontSize:
              "10px",
          }}
        >
          Échéance
          <input
            type="date"
            value={
              etat.dateEcheance
            }
            onChange={(e) =>
              mettreAJour({
                dateEcheance:
                  e.target.value,
              })
            }
            style={{
              display:
                "block",
              marginTop:
                "4px",
              padding:
                "5px",
              border:
                "1px solid #ccc",
              borderRadius:
                "6px",
            }}
          />
        </label>

        {etat.dateEcheance && (
          <>
            <label
              style={{
                fontSize:
                  "10px",
              }}
            >
              🟡 Jaune
              <input
                type="number"
                min="0"
                value={
                  etat.joursJaune
                }
                onChange={(e) =>
                  mettreAJour({
                    joursJaune:
                      Math.max(
                        0,
                        Number(
                          e.target.value
                        ) || 0
                      ),
                  })
                }
                style={{
                  display:
                    "block",
                  width:
                    "60px",
                  marginTop:
                    "4px",
                  padding:
                    "5px",
                  border:
                    "1px solid #ccc",
                  borderRadius:
                    "6px",
                }}
              />
            </label>

            <label
              style={{
                fontSize:
                  "10px",
              }}
            >
              🔴 Rouge
              <input
                type="number"
                min="0"
                value={
                  etat.joursRouge
                }
                onChange={(e) =>
                  mettreAJour({
                    joursRouge:
                      Math.max(
                        0,
                        Number(
                          e.target.value
                        ) || 0
                      ),
                  })
                }
                style={{
                  display:
                    "block",
                  width:
                    "60px",
                  marginTop:
                    "4px",
                  padding:
                    "5px",
                  border:
                    "1px solid #ccc",
                  borderRadius:
                    "6px",
                }}
              />
            </label>
          </>
        )}
      </div>

      {etat.dateEcheance && (
        <div
          style={{
            marginTop:
              "6px",
            color:
              "#777",
            fontSize:
              "9px",
          }}
        >
          📅 Cette tâche apparaît aussi automatiquement dans le calendrier du projet.
        </div>
      )}
    </div>
  );
}

function BlocChecklist(props) {
  if (
    props.modeTache &&
    props.tache
  ) {
    return (
      <BlocChecklistTache
        tache={
          props.tache
        }
        onModifier={
          props.onModifier
        }
        onSupprimer={
          props.onSupprimer
        }
      />
    );
  }

  return (
    <BlocChecklistLegacy
      bloc={
        props.bloc
      }
      onModifier={
        props.onModifier
      }
      onSupprimer={
        props.onSupprimer
      }
    />
  );
}

export default BlocChecklist;