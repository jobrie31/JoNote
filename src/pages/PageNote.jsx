import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import BlocTexte from "../components/BlocTexte";
import BlocChecklist from "../components/BlocChecklist";
import BlocManuscrit from "../components/BlocManuscrit";
import BlocLien from "../components/BlocLien";

import {
  chargerBlocs,
  chargerTachesProjet,
  creerBlocTexte,
  creerTacheProjet,
  creerBlocManuscrit,
  creerBlocLien,
  modifierBlocTexte,
  modifierBlocChecklist,
  modifierBlocManuscrit,
  modifierBlocLien,
  modifierTacheProjet,
  supprimerTacheProjet,
  modifierOrdreBlocs,
  modifierTitreNote,
  modifierCalendrierNote,
  supprimerNoteEtBlocs,
  supprimerBloc,
  extraireReferences,
} from "../utils/firestoreJoNote";

function PageNote({
  projet,
  note,
  onRetour,
}) {
  const [
    titre,
    setTitre,
  ] = useState(
    note?.titre || ""
  );

  const [
    dansCalendrier,
    setDansCalendrier,
  ] = useState(
    note?.dansCalendrier ===
      true
  );

  const [
    dateCalendrier,
    setDateCalendrier,
  ] = useState(
    note?.dateCalendrier || ""
  );

  const [
    blocs,
    setBlocs,
  ] = useState([]);

  const [
    tachesLiees,
    setTachesLiees,
  ] = useState([]);

  const [
    chargement,
    setChargement,
  ] = useState(true);

  const [
    suppressionEnCours,
    setSuppressionEnCours,
  ] = useState(false);

  const [
    blocGlisseId,
    setBlocGlisseId,
  ] = useState(null);

  const [
    blocSurvoleId,
    setBlocSurvoleId,
  ] = useState(null);

  const timerTitreRef =
    useRef(null);

  const referencesTitre =
    useMemo(
      () =>
        extraireReferences(
          titre
        ),
      [titre]
    );

  useEffect(() => {
    setTitre(
      note?.titre || ""
    );

    setDansCalendrier(
      note?.dansCalendrier ===
        true
    );

    setDateCalendrier(
      note?.dateCalendrier ||
        ""
    );
  }, [note]);

  useEffect(() => {
    return () => {
      if (
        timerTitreRef.current
      ) {
        clearTimeout(
          timerTitreRef.current
        );
      }
    };
  }, []);

  const loadBlocs =
    async () => {
      try {
        setChargement(true);

        const [
          blocsFirebase,
          tachesFirebase,
        ] = await Promise.all([
          chargerBlocs(
            projet.id,
            note.id
          ),
          chargerTachesProjet(
            projet.id
          ),
        ]);

        setBlocs(
          blocsFirebase
        );

        setTachesLiees(
          tachesFirebase.filter(
            (tache) =>
              tache.noteId ===
              note.id
          )
        );
      } catch (error) {
        console.error(
          "Erreur chargement note :",
          error
        );
      } finally {
        setChargement(false);
      }
    };

  useEffect(() => {
    if (!note?.id) {
      return;
    }

    loadBlocs();
  }, [
    projet.id,
    note?.id,
  ]);

  if (!note) {
    return (
      <div
        style={{
          padding:
            "40px",
        }}
      >
        <p>
          Aucune note sélectionnée.
        </p>

        <button
          type="button"
          onClick={
            onRetour
          }
        >
          ← Retour
        </button>
      </div>
    );
  }

  const handleTitreChange = (
    e
  ) => {
    const nouveauTitre =
      e.target.value;

    setTitre(
      nouveauTitre
    );

    if (
      timerTitreRef.current
    ) {
      clearTimeout(
        timerTitreRef.current
      );
    }

    timerTitreRef.current =
      setTimeout(
        async () => {
          try {
            await modifierTitreNote(
              projet.id,
              note.id,
              nouveauTitre
            );
          } catch (error) {
            console.error(
              "Erreur sauvegarde titre :",
              error
            );
          }
        },
        600
      );
  };

  const handleSupprimerNote =
    async () => {
      const nomNote =
        titre.trim() ||
        "Sans titre";

      const confirmation =
        window.confirm(
          `Supprimer définitivement la note « ${nomNote} » ?\n\nTous les textes, checklists, dessins et liens de cette note seront aussi supprimés.`
        );

      if (
        !confirmation
      ) {
        return;
      }

      try {
        setSuppressionEnCours(
          true
        );

        if (
          timerTitreRef.current
        ) {
          clearTimeout(
            timerTitreRef.current
          );
        }

        await Promise.all(
          tachesLiees.map(
            (tache) =>
              modifierTacheProjet(
                projet.id,
                tache.id,
                {
                  noteId: "",
                }
              )
          )
        );

        await supprimerNoteEtBlocs(
          projet.id,
          note.id
        );

        onRetour?.();
      } catch (error) {
        console.error(
          "Erreur suppression note :",
          error
        );

        window.alert(
          "La note n'a pas pu être supprimée."
        );
      } finally {
        setSuppressionEnCours(
          false
        );
      }
    };

  const handleCalendrierChange =
    async (e) => {
      const valeur =
        e.target.checked;

      setDansCalendrier(
        valeur
      );

      try {
        await modifierCalendrierNote(
          projet.id,
          note.id,
          valeur,
          dateCalendrier
        );
      } catch (error) {
        console.error(
          "Erreur sauvegarde calendrier :",
          error
        );
      }
    };

  const handleDateCalendrierChange =
    async (e) => {
      const valeur =
        e.target.value;

      setDateCalendrier(
        valeur
      );

      try {
        await modifierCalendrierNote(
          projet.id,
          note.id,
          dansCalendrier,
          valeur
        );
      } catch (error) {
        console.error(
          "Erreur sauvegarde date calendrier :",
          error
        );
      }
    };

  const handleAjouterTexte =
    async () => {
      try {
        await creerBlocTexte(
          projet.id,
          note.id
        );

        await loadBlocs();
      } catch (error) {
        console.error(
          "Erreur création bloc texte :",
          error
        );
      }
    };

  const handleAjouterChecklist =
    async () => {
      try {
        const tacheId =
          await creerTacheProjet(
            projet.id,
            {
              titre:
                titre.trim() ||
                note.titre ||
                "Nouvelle tâche",
              elements: [
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
              ],
              dateEcheance:
                "",
              joursJaune:
                7,
              joursRouge:
                2,
            }
          );

        await modifierTacheProjet(
          projet.id,
          tacheId,
          {
            noteId:
              note.id,
          }
        );

        await loadBlocs();
      } catch (error) {
        console.error(
          "Erreur création tâche liée :",
          error
        );
      }
    };

  const handleAjouterManuscrit =
    async () => {
      try {
        await creerBlocManuscrit(
          projet.id,
          note.id
        );

        await loadBlocs();
      } catch (error) {
        console.error(
          "Erreur création bloc manuscrit :",
          error
        );
      }
    };

  const handleAjouterLien =
    async () => {
      try {
        await creerBlocLien(
          projet.id,
          note.id
        );

        await loadBlocs();
      } catch (error) {
        console.error(
          "Erreur création bloc lien :",
          error
        );
      }
    };

  const handleModifierTexte =
    async (
      blocId,
      contenu,
      important
    ) => {
      try {
        await modifierBlocTexte(
          projet.id,
          note.id,
          blocId,
          contenu,
          important
        );

        setBlocs(
          (blocsActuels) =>
            blocsActuels.map(
              (bloc) =>
                bloc.id ===
                blocId
                  ? {
                      ...bloc,
                      contenu,
                      important,

                      references:
                        extraireReferences(
                          contenu
                        ),
                    }
                  : bloc
            )
        );
      } catch (error) {
        console.error(
          "Erreur sauvegarde bloc texte :",
          error
        );
      }
    };

  const handleModifierChecklist =
    async (
      blocId,
      elements
    ) => {
      try {
        await modifierBlocChecklist(
          projet.id,
          note.id,
          blocId,
          elements
        );

        setBlocs(
          (blocsActuels) =>
            blocsActuels.map(
              (bloc) =>
                bloc.id ===
                blocId
                  ? {
                      ...bloc,
                      elements,
                    }
                  : bloc
            )
        );
      } catch (error) {
        console.error(
          "Erreur sauvegarde checklist :",
          error
        );
      }
    };

  const handleModifierTacheLiee =
    async (
      tacheId,
      donnees
    ) => {
      try {
        await modifierTacheProjet(
          projet.id,
          tacheId,
          donnees
        );

        setTachesLiees(
          (actuelles) =>
            actuelles.map(
              (tache) =>
                tache.id ===
                tacheId
                  ? {
                      ...tache,
                      ...donnees,
                    }
                  : tache
            )
        );
      } catch (error) {
        console.error(
          "Erreur sauvegarde tâche liée :",
          error
        );
      }
    };

  const handleSupprimerTacheLiee =
    async (tacheId) => {
      const confirmation =
        window.confirm(
          "Supprimer cette tâche du projet ?"
        );

      if (!confirmation) {
        return;
      }

      try {
        await supprimerTacheProjet(
          projet.id,
          tacheId
        );

        setTachesLiees(
          (actuelles) =>
            actuelles.filter(
              (tache) =>
                tache.id !==
                tacheId
            )
        );
      } catch (error) {
        console.error(
          "Erreur suppression tâche liée :",
          error
        );
      }
    };


  const handleModifierManuscrit =
    async (
      blocId,
      donnees
    ) => {
      try {
        await modifierBlocManuscrit(
          projet.id,
          note.id,
          blocId,
          donnees
        );

        setBlocs(
          (blocsActuels) =>
            blocsActuels.map(
              (bloc) =>
                bloc.id ===
                blocId
                  ? {
                      ...bloc,
                      ...donnees,
                    }
                  : bloc
            )
        );
      } catch (error) {
        console.error(
          "Erreur sauvegarde manuscrit :",
          error
        );
      }
    };

  const handleModifierLien =
    async (
      blocId,
      donnees
    ) => {
      try {
        await modifierBlocLien(
          projet.id,
          note.id,
          blocId,
          donnees
        );

        setBlocs(
          (blocsActuels) =>
            blocsActuels.map(
              (bloc) =>
                bloc.id ===
                blocId
                  ? {
                      ...bloc,
                      ...donnees,
                    }
                  : bloc
            )
        );
      } catch (error) {
        console.error(
          "Erreur sauvegarde lien :",
          error
        );
      }
    };

  const handleSupprimerBloc =
    async (blocId) => {
      try {
        await supprimerBloc(
          projet.id,
          note.id,
          blocId
        );

        setBlocs(
          (blocsActuels) =>
            blocsActuels.filter(
              (bloc) =>
                bloc.id !==
                blocId
            )
        );
      } catch (error) {
        console.error(
          "Erreur suppression bloc :",
          error
        );
      }
    };

  const checklists =
    blocs
      .filter(
        (bloc) =>
          bloc.type ===
          "checklist"
      )
      .sort(
        (a, b) =>
          (a.ordre || 0) -
          (b.ordre || 0)
      );

  const blocsDeplacables =
    blocs
      .filter(
        (bloc) =>
          bloc.type !==
          "checklist"
      )
      .sort(
        (a, b) =>
          (a.ordre || 0) -
          (b.ordre || 0)
      );

  const handleDragStart = (
    e,
    bloc
  ) => {
    if (
      bloc.type ===
      "checklist"
    ) {
      e.preventDefault();
      return;
    }

    setBlocGlisseId(
      bloc.id
    );

    e.dataTransfer.effectAllowed =
      "move";

    e.dataTransfer.setData(
      "text/plain",
      bloc.id
    );
  };

  const handleDragOver = (
    e,
    bloc
  ) => {
    if (
      bloc.type ===
      "checklist"
    ) {
      return;
    }

    e.preventDefault();

    e.dataTransfer.dropEffect =
      "move";

    setBlocSurvoleId(
      bloc.id
    );
  };

  const handleDragLeave = (
    e,
    bloc
  ) => {
    if (
      e.currentTarget.contains(
        e.relatedTarget
      )
    ) {
      return;
    }

    if (
      blocSurvoleId ===
      bloc.id
    ) {
      setBlocSurvoleId(
        null
      );
    }
  };

  const handleDrop = async (
    e,
    blocDestination
  ) => {
    e.preventDefault();

    const idSource =
      e.dataTransfer.getData(
        "text/plain"
      ) ||
      blocGlisseId;

    setBlocGlisseId(
      null
    );

    setBlocSurvoleId(
      null
    );

    if (
      !idSource ||
      idSource ===
        blocDestination.id
    ) {
      return;
    }

    const indexSource =
      blocsDeplacables.findIndex(
        (bloc) =>
          bloc.id ===
          idSource
      );

    const indexDestination =
      blocsDeplacables.findIndex(
        (bloc) =>
          bloc.id ===
          blocDestination.id
      );

    if (
      indexSource ===
        -1 ||
      indexDestination ===
        -1
    ) {
      return;
    }

    const nouveauxBlocs = [
      ...blocsDeplacables,
    ];

    const [blocDeplace] =
      nouveauxBlocs.splice(
        indexSource,
        1
      );

    nouveauxBlocs.splice(
      indexDestination,
      0,
      blocDeplace
    );

    const nouveauxBlocsAvecOrdre =
      nouveauxBlocs.map(
        (bloc, index) => ({
          ...bloc,

          ordre:
            (index + 1) *
            1000,
        })
      );

    setBlocs([
      ...checklists,
      ...nouveauxBlocsAvecOrdre,
    ]);

    try {
      await modifierOrdreBlocs(
        projet.id,
        note.id,
        nouveauxBlocsAvecOrdre
      );
    } catch (error) {
      console.error(
        "Erreur réorganisation blocs :",
        error
      );

      await loadBlocs();
    }
  };

  const handleDragEnd =
    () => {
      setBlocGlisseId(
        null
      );

      setBlocSurvoleId(
        null
      );
    };

  const afficherBloc = (
    bloc,
    deplacable = false
  ) => {
    let contenu = null;

    if (
      bloc.type ===
      "checklist"
    ) {
      contenu = (
        <BlocChecklist
          bloc={bloc}
          onModifier={
            handleModifierChecklist
          }
          onSupprimer={
            handleSupprimerBloc
          }
        />
      );
    }

    if (
      bloc.type ===
      "texte"
    ) {
      contenu = (
        <BlocTexte
          bloc={bloc}
          onModifier={
            handleModifierTexte
          }
          onSupprimer={
            handleSupprimerBloc
          }
        />
      );
    }

    if (
      bloc.type ===
      "manuscrit"
    ) {
      contenu = (
        <BlocManuscrit
          bloc={bloc}
          onModifier={
            handleModifierManuscrit
          }
          onSupprimer={
            handleSupprimerBloc
          }
        />
      );
    }

    if (
      bloc.type ===
      "lien"
    ) {
      contenu = (
        <BlocLien
          bloc={bloc}
          onModifier={
            handleModifierLien
          }
          onSupprimer={
            handleSupprimerBloc
          }
        />
      );
    }

    if (!contenu) {
      return null;
    }

    if (!deplacable) {
      return (
        <div key={bloc.id}>
          {contenu}
        </div>
      );
    }

    const estGlisse =
      blocGlisseId ===
      bloc.id;

    const estSurvole =
      blocSurvoleId ===
        bloc.id &&
      blocGlisseId !==
        bloc.id;

    return (
      <div
        key={bloc.id}
        draggable

        onDragStart={(e) =>
          handleDragStart(
            e,
            bloc
          )
        }

        onDragOver={(e) =>
          handleDragOver(
            e,
            bloc
          )
        }

        onDragLeave={(e) =>
          handleDragLeave(
            e,
            bloc
          )
        }

        onDrop={(e) =>
          handleDrop(
            e,
            bloc
          )
        }

        onDragEnd={
          handleDragEnd
        }

        style={{
          position:
            "relative",

          opacity:
            estGlisse
              ? 0.45
              : 1,

          borderTop:
            estSurvole
              ? "3px solid #555"
              : "3px solid transparent",

          paddingTop:
            "4px",

          cursor:
            "grab",
        }}
      >
        <div
          style={{
            display:
              "flex",

            justifyContent:
              "center",

            alignItems:
              "center",

            height:
              "18px",

            marginBottom:
              "2px",

            color:
              "#999",

            fontSize:
              "15px",

            userSelect:
              "none",
          }}
          title="Glisser pour déplacer"
        >
          ⋮⋮
        </div>

        {contenu}
      </div>
    );
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
            "24px 32px 18px",

          borderBottom:
            "1px solid #ddd",
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
              "18px",
          }}
        >
          <button
            type="button"
            onClick={
              onRetour
            }
          >
            ← Retour aux notes
          </button>

          <button
            type="button"
            onClick={
              handleSupprimerNote
            }
            disabled={
              suppressionEnCours
            }
            style={{
              border:
                "1px solid #d99",

              color:
                "#a22",

              background:
                "#fff5f5",

              borderRadius:
                "7px",

              padding:
                "7px 10px",

              cursor:
                suppressionEnCours
                  ? "wait"
                  : "pointer",
            }}
          >
            {suppressionEnCours
              ? "Suppression..."
              : "🗑 Supprimer la note"}
          </button>
        </div>

        <div
          style={{
            display:
              "flex",

            alignItems:
              "flex-start",

            justifyContent:
              "space-between",

            gap:
              "20px",

            flexWrap:
              "wrap",
          }}
        >
          <div
            style={{
              flex: 1,

              minWidth:
                "280px",
            }}
          >
            <input
              type="text"
              value={
                titre
              }
              onChange={
                handleTitreChange
              }
              placeholder="Titre de la note — tu peux utiliser @Nom"
              style={{
                width:
                  "100%",

                border:
                  "none",

                outline:
                  "none",

                fontSize:
                  "30px",

                fontWeight:
                  "700",

                padding:
                  0,
              }}
            />

            {referencesTitre.length >
              0 && (
              <div
                style={{
                  display:
                    "flex",

                  gap:
                    "6px",

                  flexWrap:
                    "wrap",

                  marginTop:
                    "9px",
                }}
              >
                {referencesTitre.map(
                  (reference) => (
                    <span
                      key={
                        reference
                      }
                      style={{
                        padding:
                          "4px 8px",

                        borderRadius:
                          "999px",

                        background:
                          "#eef3f8",

                        color:
                          "#40566a",

                        fontSize:
                          "12px",

                        fontWeight:
                          "600",
                      }}
                    >
                      @{reference}
                    </span>
                  )
                )}
              </div>
            )}

            <p
              style={{
                margin:
                  "8px 0 12px",

                color:
                  "#777",
              }}
            >
              {projet.nom}
            </p>

            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "center",

                gap:
                  "12px",

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
                    "7px",

                  cursor:
                    "pointer",

                  fontWeight:
                    "600",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    dansCalendrier
                  }
                  onChange={
                    handleCalendrierChange
                  }
                />

                📅 Ajouter au calendrier
              </label>

              {dansCalendrier && (
                <input
                  type="date"
                  value={
                    dateCalendrier
                  }
                  onChange={
                    handleDateCalendrierChange
                  }
                  style={{
                    padding:
                      "7px 10px",

                    border:
                      "1px solid #ccc",

                    borderRadius:
                      "8px",
                  }}
                />
              )}
            </div>

            {dansCalendrier &&
              !dateCalendrier && (
              <div
                style={{
                  display:
                    "inline-block",

                  marginTop:
                    "10px",

                  padding:
                    "7px 10px",

                  borderRadius:
                    "8px",

                  background:
                    "#fff7d6",

                  color:
                    "#746118",

                  fontSize:
                    "13px",
                }}
              >
                Choisis une date pour
                afficher cette note
                dans le calendrier.
              </div>
            )}
          </div>

          <div
            style={{
              display:
                "flex",

              gap:
                "8px",

              flexWrap:
                "wrap",
            }}
          >
            <button
              type="button"
              onClick={
                handleAjouterChecklist
              }
            >
              + Checklist
            </button>

            <button
              type="button"
              onClick={
                handleAjouterTexte
              }
            >
              + Texte
            </button>

            <button
              type="button"
              onClick={
                handleAjouterManuscrit
              }
            >
              ✍️ Manuscrit
            </button>

            <button
              type="button"
              onClick={
                handleAjouterLien
              }
            >
              🔗 Lien
            </button>

            <button
              type="button"
            >
              + Fichier
            </button>
          </div>
        </div>
      </div>

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
          {chargement && (
            <p>
              Chargement de la note...
            </p>
          )}

          {!chargement &&
            blocs.length ===
              0 &&
            tachesLiees.length ===
              0 && (
              <div
                style={{
                  border:
                    "1px dashed #ccc",

                  borderRadius:
                    "14px",

                  padding:
                    "40px",

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
                  Cette note est vide
                </h3>

                <p>
                  Ajoute un bloc pour
                  commencer.
                </p>

                <div
                  style={{
                    display:
                      "flex",

                    justifyContent:
                      "center",

                    gap:
                      "10px",

                    flexWrap:
                      "wrap",

                    marginTop:
                      "20px",
                  }}
                >
                  <button
                    type="button"
                    onClick={
                      handleAjouterChecklist
                    }
                  >
                    + Checklist
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleAjouterTexte
                    }
                  >
                    + Texte
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleAjouterManuscrit
                    }
                  >
                    ✍️ Écriture guidée
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleAjouterLien
                    }
                  >
                    🔗 Lien
                  </button>
                </div>
              </div>
            )}

          {!chargement &&
            tachesLiees.length >
              0 && (
              <div
                style={{
                  marginBottom:
                    "22px",
                }}
              >
                {tachesLiees.map(
                  (tache) => (
                    <BlocChecklist
                      key={
                        tache.id
                      }
                      tache={
                        tache
                      }
                      modeTache
                      onModifier={
                        handleModifierTacheLiee
                      }
                      onSupprimer={
                        handleSupprimerTacheLiee
                      }
                    />
                  )
                )}
              </div>
            )}

          {!chargement &&
            checklists.length >
              0 && (
              <div
                style={{
                  marginBottom:
                    "22px",
                }}
              >
                {checklists.map(
                  (bloc) =>
                    afficherBloc(
                      bloc,
                      false
                    )
                )}
              </div>
            )}

          {!chargement &&
            blocsDeplacables.map(
              (bloc) =>
                afficherBloc(
                  bloc,
                  true
                )
            )}

          {!chargement &&
            (
              blocs.length >
                0 ||
              tachesLiees.length >
                0
            ) && (
              <div
                style={{
                  display:
                    "flex",

                  justifyContent:
                    "center",

                  gap:
                    "10px",

                  flexWrap:
                    "wrap",

                  marginTop:
                    "24px",
                }}
              >
                <button
                  type="button"
                  onClick={
                    handleAjouterChecklist
                  }
                >
                  + Checklist
                </button>

                <button
                  type="button"
                  onClick={
                    handleAjouterTexte
                  }
                >
                  + Texte
                </button>

                <button
                  type="button"
                  onClick={
                    handleAjouterManuscrit
                  }
                >
                  ✍️ Écriture guidée
                </button>

                <button
                  type="button"
                  onClick={
                    handleAjouterLien
                  }
                >
                  🔗 Lien
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default PageNote;