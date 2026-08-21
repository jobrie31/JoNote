import {
  useEffect,
  useMemo,
  useState,
} from "react";

import CategorieTree from "../components/CategorieTree";
import NouvelleCategorieModal from "../components/NouvelleCategorieModal";
import CategorieActionModal from "../components/CategorieActionModal";
import NouvelleNoteModal from "../components/NouvelleNoteModal";
import PageNote from "./PageNote";

import {
  chargerCategories,
  creerCategorie,
  modifierNomCategorie,
  deplacerCategorie,
  supprimerCategorieEtEnfants,
  chargerNotes,
  chargerBlocs,
  creerNote,
} from "../utils/firestoreJoNote";

function PageNotes({
  projet,
  noteAOuvrir = null,
  onNoteOuverte,
}) {
  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    categoriesBrutes,
    setCategoriesBrutes,
  ] = useState([]);

  const [
    categorieSelectionnee,
    setCategorieSelectionnee,
  ] = useState(null);

  const [
    modalCategorieOuvert,
    setModalCategorieOuvert,
  ] = useState(false);

  const [
    parentCategorie,
    setParentCategorie,
  ] = useState(null);

  const [
    chargementCategories,
    setChargementCategories,
  ] = useState(true);

  const [
    actionCategorie,
    setActionCategorie,
  ] = useState({
    ouvert: false,
    mode: null,
    categorie: null,
  });

  const [
    notes,
    setNotes,
  ] = useState([]);

  const [
    chargementNotes,
    setChargementNotes,
  ] = useState(true);

  const [
    modalNoteOuvert,
    setModalNoteOuvert,
  ] = useState(false);

  const [
    noteSelectionnee,
    setNoteSelectionnee,
  ] = useState(null);

  const [
    recherche,
    setRecherche,
  ] = useState("");

  const [
    tri,
    setTri,
  ] = useState("recent");

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

  useEffect(() => {
    if (!noteAOuvrir?.id) {
      return;
    }

    setCategorieSelectionnee(
      null
    );

    setRecherche("");

    setNoteSelectionnee(
      noteAOuvrir
    );

    onNoteOuverte?.();
  }, [
    noteAOuvrir?.id,
  ]);

  const construireArbreCategories = (
    categoriesListe
  ) => {
    const categoriesMap = {};

    categoriesListe.forEach(
      (categorie) => {
        categoriesMap[
          categorie.id
        ] = {
          ...categorie,
          enfants: [],
        };
      }
    );

    const racines = [];

    Object.values(
      categoriesMap
    ).forEach(
      (categorie) => {
        if (
          categorie.parentId &&
          categoriesMap[
            categorie.parentId
          ]
        ) {
          categoriesMap[
            categorie.parentId
          ].enfants.push(
            categorie
          );
        } else {
          racines.push(
            categorie
          );
        }
      }
    );

    return racines;
  };

  const loadCategories =
    async () => {
      try {
        setChargementCategories(
          true
        );

        const categoriesFirebase =
          await chargerCategories(
            projet.id
          );

        setCategoriesBrutes(
          categoriesFirebase
        );

        const arbre =
          construireArbreCategories(
            categoriesFirebase
          );

        setCategories(
          arbre
        );
      } catch (error) {
        console.error(
          "Erreur chargement catégories :",
          error
        );
      } finally {
        setChargementCategories(
          false
        );
      }
    };

  const obtenirInfosBlocsNote =
    async (note) => {
      try {
        const blocs =
          await chargerBlocs(
            projet.id,
            note.id
          );

        const premierBlocTexte =
          blocs.find(
            (bloc) =>
              bloc.type ===
                "texte" &&
              (
                bloc.contenu ||
                ""
              ).trim() !==
                ""
          );

        const nombreImportants =
          blocs.filter(
            (bloc) =>
              bloc.type ===
                "texte" &&
              bloc.important ===
                true &&
              (
                bloc.contenu ||
                ""
              ).trim() !==
                ""
          ).length;

        let nombreTaches =
          0;

        const contenusRecherche =
          [
            note.titre || "",
          ];

        if (
          Array.isArray(
            note.references
          )
        ) {
          note.references.forEach(
            (reference) => {
              contenusRecherche.push(
                reference
              );

              contenusRecherche.push(
                `@${reference}`
              );
            }
          );
        }

        blocs.forEach(
          (bloc) => {
            if (
              bloc.type ===
              "texte"
            ) {
              contenusRecherche.push(
                bloc.contenu ||
                  ""
              );

              if (
                Array.isArray(
                  bloc.references
                )
              ) {
                bloc.references.forEach(
                  (reference) => {
                    contenusRecherche.push(
                      reference
                    );

                    contenusRecherche.push(
                      `@${reference}`
                    );
                  }
                );
              }
            }

            if (
              bloc.type ===
              "lien"
            ) {
              contenusRecherche.push(
                bloc.titre ||
                  ""
              );

              contenusRecherche.push(
                bloc.description ||
                  ""
              );

              contenusRecherche.push(
                bloc.url ||
                  ""
              );
            }

            if (
              bloc.type !==
              "checklist"
            ) {
              return;
            }

            const elements =
              Array.isArray(
                bloc.elements
              )
                ? bloc.elements
                : [];

            elements.forEach(
              (element) => {
                const texte =
                  element.texte ||
                  "";

                contenusRecherche.push(
                  texte
                );

                if (
                  texte.trim() !==
                    "" &&
                  element.complete !==
                    true
                ) {
                  nombreTaches +=
                    1;
                }
              }
            );
          }
        );

        return {
          ...note,

          apercu:
            premierBlocTexte
              ?.contenu ||
            "",

          nombreImportants,

          nombreTaches,

          rechercheTexte:
            normaliserTexte(
              contenusRecherche.join(
                " "
              )
            ),
        };
      } catch (error) {
        console.error(
          `Erreur chargement des blocs de la note ${note.id} :`,
          error
        );

        return {
          ...note,

          apercu: "",

          nombreImportants:
            0,

          nombreTaches:
            0,

          rechercheTexte:
            normaliserTexte(
              note.titre ||
                ""
            ),
        };
      }
    };

  const loadNotes =
    async () => {
      try {
        setChargementNotes(
          true
        );

        const notesFirebase =
          await chargerNotes(
            projet.id
          );

        const notesAvecInfos =
          await Promise.all(
            notesFirebase.map(
              obtenirInfosBlocsNote
            )
          );

        setNotes(
          notesAvecInfos
        );
      } catch (error) {
        console.error(
          "Erreur chargement notes :",
          error
        );
      } finally {
        setChargementNotes(
          false
        );
      }
    };

  useEffect(() => {
    loadCategories();
    loadNotes();
  }, [
    projet.id,
  ]);

  const ouvrirNouvelleCategorie =
    () => {
      setParentCategorie(
        null
      );

      setModalCategorieOuvert(
        true
      );
    };

  const ouvrirNouvelleSousCategorie =
    (categorie) => {
      setParentCategorie(
        categorie
      );

      setModalCategorieOuvert(
        true
      );
    };

  const handleCreerCategorie =
    async (nom) => {
      try {
        await creerCategorie(
          projet.id,
          nom,
          parentCategorie?.id ||
            null
        );

        await loadCategories();
      } catch (error) {
        console.error(
          "Erreur création catégorie :",
          error
        );
      }
    };

  const ouvrirActionCategorie = (
    mode,
    categorie
  ) => {
    setActionCategorie({
      ouvert: true,
      mode,
      categorie,
    });
  };

  const fermerActionCategorie =
    () => {
      setActionCategorie({
        ouvert: false,
        mode: null,
        categorie: null,
      });
    };

  const handleRenommerCategorie =
    async (
      categorie,
      nouveauNom
    ) => {
      try {
        await modifierNomCategorie(
          projet.id,
          categorie.id,
          nouveauNom
        );

        if (
          categorieSelectionnee?.id ===
          categorie.id
        ) {
          setCategorieSelectionnee({
            ...categorieSelectionnee,
            nom: nouveauNom,
          });
        }

        await loadCategories();
      } catch (error) {
        console.error(
          "Erreur modification catégorie :",
          error
        );
      }
    };

  const handleDeplacerCategorie =
    async (
      categorie,
      nouveauParentId
    ) => {
      try {
        await deplacerCategorie(
          projet.id,
          categorie.id,
          nouveauParentId
        );

        await loadCategories();
      } catch (error) {
        console.error(
          "Erreur déplacement catégorie :",
          error
        );
      }
    };

  const estDansBranche = (
    categorieId,
    brancheId
  ) => {
    if (
      categorieId ===
      brancheId
    ) {
      return true;
    }

    let categorie =
      categoriesBrutes.find(
        (item) =>
          item.id ===
          categorieId
      );

    while (
      categorie?.parentId
    ) {
      if (
        categorie.parentId ===
        brancheId
      ) {
        return true;
      }

      categorie =
        categoriesBrutes.find(
          (item) =>
            item.id ===
            categorie.parentId
        );
    }

    return false;
  };

  const obtenirIdsBranche = (
    categorieId
  ) => {
    const ids =
      new Set([
        categorieId,
      ]);

    let changement =
      true;

    while (changement) {
      changement =
        false;

      categoriesBrutes.forEach(
        (categorie) => {
          if (
            categorie.parentId &&
            ids.has(
              categorie.parentId
            ) &&
            !ids.has(
              categorie.id
            )
          ) {
            ids.add(
              categorie.id
            );

            changement =
              true;
          }
        }
      );
    }

    return ids;
  };

  const noteEstDansCategorieSelectionnee =
    (note) => {
      if (
        !categorieSelectionnee
      ) {
        return true;
      }

      const idsBranche =
        obtenirIdsBranche(
          categorieSelectionnee.id
        );

      const idsNote =
        Array.isArray(
          note.categorieIds
        )
          ? note.categorieIds
          : [];

      return idsNote.some(
        (categorieId) =>
          idsBranche.has(
            categorieId
          )
      );
    };

  const handleSupprimerCategorie =
    async (categorie) => {
      try {
        await supprimerCategorieEtEnfants(
          projet.id,
          categorie.id
        );

        if (
          categorieSelectionnee &&
          estDansBranche(
            categorieSelectionnee.id,
            categorie.id
          )
        ) {
          setCategorieSelectionnee(
            null
          );
        }

        await loadCategories();
      } catch (error) {
        console.error(
          "Erreur suppression catégorie :",
          error
        );
      }
    };

  const handleCreerNote =
    async ({
      titre,
      categorieIds,
      importance,
    }) => {
      try {
        await creerNote(
          projet.id,
          titre,
          categorieIds,
          importance
        );

        await loadNotes();
      } catch (error) {
        console.error(
          "Erreur création note :",
          error
        );
      }
    };

  const obtenirCategorieNom = (
    categorieId
  ) => {
    const categorie =
      categoriesBrutes.find(
        (item) =>
          item.id ===
          categorieId
      );

    return (
      categorie?.nom ||
      ""
    );
  };

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

  const formaterDateCalendrier = (
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

    if (
      !annee ||
      !mois ||
      !jour
    ) {
      return date;
    }

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
        year: "numeric",
      }
    );
  };

  const formaterDateModification = (
    timestamp
  ) => {
    if (
      !timestamp ||
      typeof timestamp.toDate !==
        "function"
    ) {
      return "";
    }

    return timestamp
      .toDate()
      .toLocaleDateString(
        "fr-CA",
        {
          day: "numeric",
          month: "long",
          year: "numeric",
        }
      );
  };

  const notesAffichees =
    useMemo(() => {
      let resultat =
        notes.filter(
          noteEstDansCategorieSelectionnee
        );

      const terme =
        normaliserTexte(
          recherche
        );

      const mots =
        terme
          .split(/\s+/)
          .filter(Boolean);

      if (
        mots.length >
        0
      ) {
        resultat =
          resultat.filter(
            (note) =>
              mots.every(
                (mot) =>
                  (
                    note.rechercheTexte ||
                    ""
                  ).includes(
                    mot
                  )
              )
          );
      }

      resultat.sort(
        (a, b) => {
          if (
            tri ===
            "ancien"
          ) {
            return (
              obtenirMillis(
                a.updatedAt
              ) -
              obtenirMillis(
                b.updatedAt
              )
            );
          }

          if (
            tri ===
            "az"
          ) {
            return (
              a.titre ||
              ""
            ).localeCompare(
              b.titre ||
                "",
              "fr",
              {
                sensitivity:
                  "base",
              }
            );
          }

          if (
            tri ===
            "za"
          ) {
            return (
              b.titre ||
              ""
            ).localeCompare(
              a.titre ||
                "",
              "fr",
              {
                sensitivity:
                  "base",
              }
            );
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

      return resultat;
    }, [
      notes,
      categorieSelectionnee,
      categoriesBrutes,
      recherche,
      tri,
    ]);

  const handleRetourNote =
    async () => {
      setNoteSelectionnee(
        null
      );

      await loadNotes();
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
        display: "flex",

        minHeight:
          "500px",
      }}
    >
      <CategorieTree
        categories={
          categories
        }
        categorieSelectionnee={
          categorieSelectionnee
        }
        onSelectionnerCategorie={
          setCategorieSelectionnee
        }
        onAjouterCategorie={
          ouvrirNouvelleCategorie
        }
        onAjouterSousCategorie={
          ouvrirNouvelleSousCategorie
        }
        onActionCategorie={
          ouvrirActionCategorie
        }
      />

      <div
        style={{
          flex: 1,

          paddingLeft:
            "24px",

          minWidth: 0,
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
              "20px",

            marginBottom:
              "16px",

            flexWrap:
              "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin:
                  "0 0 4px",
              }}
            >
              {categorieSelectionnee
                ? categorieSelectionnee.nom
                : "Toutes les notes"}
            </h2>

            <p
              style={{
                margin: 0,

                color:
                  "#777",

                fontSize:
                  "13px",
              }}
            >
              Notes de{" "}
              {projet.nom}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setModalNoteOuvert(
                true
              )
            }
          >
            + Nouvelle note
          </button>
        </div>

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

            flexWrap:
              "wrap",

            marginBottom:
              "16px",

            padding:
              "10px",

            border:
              "1px solid #e5e5e5",

            borderRadius:
              "10px",

            background:
              "#fafafa",
          }}
        >
          <div
            style={{
              flex:
                "1 1 320px",

              position:
                "relative",
            }}
          >
            <span
              style={{
                position:
                  "absolute",

                left:
                  "11px",

                top:
                  "50%",

                transform:
                  "translateY(-50%)",

                pointerEvents:
                  "none",
              }}
            >
              🔎
            </span>

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
              placeholder="Rechercher titre, texte, tâche ou @référence..."
              style={{
                width:
                  "100%",

                padding:
                  "8px 10px 8px 36px",

                border:
                  "1px solid #d7d7d7",

                borderRadius:
                  "7px",

                outline:
                  "none",

                background:
                  "#fff",

                fontSize:
                  "13px",
              }}
            />
          </div>

          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap:
                "7px",
            }}
          >
            <span
              style={{
                color:
                  "#777",

                fontSize:
                  "11px",
              }}
            >
              Trier :
            </span>

            <select
              value={tri}
              onChange={(e) =>
                setTri(
                  e.target.value
                )
              }
              style={{
                padding:
                  "7px 9px",

                border:
                  "1px solid #d7d7d7",

                borderRadius:
                  "7px",

                background:
                  "#fff",

                fontSize:
                  "12px",
              }}
            >
              <option value="recent">
                Dernière modification
              </option>

              <option value="ancien">
                Plus ancienne
              </option>

              <option value="az">
                A → Z
              </option>

              <option value="za">
                Z → A
              </option>
            </select>
          </div>
        </div>

        {chargementCategories && (
          <p>
            Chargement des catégories...
          </p>
        )}

        {chargementNotes && (
          <p>
            Chargement des notes...
          </p>
        )}

        {!chargementNotes && (
          <div
            style={{
              marginBottom:
                "10px",

              color:
                "#888",

              fontSize:
                "11px",
            }}
          >
            {
              notesAffichees.length
            }{" "}
            note
            {notesAffichees.length !==
            1
              ? "s"
              : ""}
          </div>
        )}

        {!chargementNotes &&
          notesAffichees.length ===
            0 && (
            <div
              style={{
                border:
                  "1px dashed #ccc",

                borderRadius:
                  "10px",

                padding:
                  "24px",
              }}
            >
              <h3
                style={{
                  marginTop:
                    0,
                }}
              >
                Aucune note
              </h3>

              <button
                type="button"
                onClick={() =>
                  setModalNoteOuvert(
                    true
                  )
                }
              >
                + Créer une note
              </button>
            </div>
          )}

        {!chargementNotes &&
          notesAffichees.length >
            0 && (
            <div
              style={{
                display:
                  "flex",

                flexDirection:
                  "column",

                gap:
                  "7px",
              }}
            >
              {notesAffichees.map(
                (note) => {
                  const aImportant =
                    note.nombreImportants >
                    0;

                  const aTaches =
                    note.nombreTaches >
                    0;

                  const estCalendrier =
                    note.dansCalendrier ===
                      true &&
                    (
                      note.dateCalendrier ||
                      ""
                    ).trim() !==
                      "";

                  const dateModification =
                    formaterDateModification(
                      note.updatedAt
                    );

                  return (
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

                        border:
                          aImportant
                            ? "1px solid #dfcf83"
                            : "1px solid #ddd",

                        borderRadius:
                          "9px",

                        padding:
                          "11px 13px",

                        background:
                          aImportant
                            ? "#fffef8"
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
                            "16px",
                        }}
                      >
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

                              alignItems:
                                "center",

                              gap:
                                "7px",

                              marginBottom:
                                "3px",
                            }}
                          >
                            <strong
                              style={{
                                fontSize:
                                  "14px",

                                color:
                                  "#222",

                                overflow:
                                  "hidden",

                                textOverflow:
                                  "ellipsis",

                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {note.titre ||
                                "Sans titre"}
                            </strong>

                            {aImportant && (
                              <span>
                                ⭐
                              </span>
                            )}
                          </div>

                          {note.apercu && (
                            <div
                              style={{
                                color:
                                  "#666",

                                fontSize:
                                  "11px",

                                marginBottom:
                                  "7px",

                                overflow:
                                  "hidden",

                                textOverflow:
                                  "ellipsis",

                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {
                                note.apercu
                              }
                            </div>
                          )}

                          <div
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap:
                                "6px",

                              flexWrap:
                                "wrap",
                            }}
                          >
                            {aTaches && (
                              <span
                                style={{
                                  padding:
                                    "3px 6px",

                                  borderRadius:
                                    "999px",

                                  background:
                                    "#eef3f7",

                                  fontSize:
                                    "9px",

                                  color:
                                    "#4c5c68",
                                }}
                              >
                                ☑{" "}
                                {
                                  note.nombreTaches
                                }{" "}
                                à faire
                              </span>
                            )}

                            {estCalendrier && (
                              <span
                                style={{
                                  padding:
                                    "3px 6px",

                                  borderRadius:
                                    "999px",

                                  background:
                                    "#edf5ff",

                                  fontSize:
                                    "9px",

                                  color:
                                    "#46647f",
                                }}
                              >
                                📅{" "}
                                {formaterDateCalendrier(
                                  note.dateCalendrier
                                )}
                              </span>
                            )}

                            {note.categorieIds?.map(
                              (
                                categorieId
                              ) => {
                                const nom =
                                  obtenirCategorieNom(
                                    categorieId
                                  );

                                if (
                                  !nom
                                ) {
                                  return null;
                                }

                                return (
                                  <span
                                    key={
                                      categorieId
                                    }
                                    style={{
                                      padding:
                                        "3px 6px",

                                      borderRadius:
                                        "999px",

                                      background:
                                        "#f2f2f2",

                                      fontSize:
                                        "9px",

                                      color:
                                        "#666",
                                    }}
                                  >
                                    {nom}
                                  </span>
                                );
                              }
                            )}
                          </div>
                        </div>

                        {dateModification && (
                          <div
                            style={{
                              flexShrink:
                                0,

                              color:
                                "#999",

                              fontSize:
                                "10px",

                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              dateModification
                            }
                          </div>
                        )}
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
      </div>

      <NouvelleCategorieModal
        ouvert={
          modalCategorieOuvert
        }
        onFermer={() =>
          setModalCategorieOuvert(
            false
          )
        }
        onCreer={
          handleCreerCategorie
        }
        parentCategorie={
          parentCategorie
        }
      />

      <CategorieActionModal
        ouvert={
          actionCategorie.ouvert
        }
        mode={
          actionCategorie.mode
        }
        categorie={
          actionCategorie.categorie
        }
        categoriesBrutes={
          categoriesBrutes
        }
        onFermer={
          fermerActionCategorie
        }
        onRenommer={
          handleRenommerCategorie
        }
        onDeplacer={
          handleDeplacerCategorie
        }
        onSupprimer={
          handleSupprimerCategorie
        }
      />

      <NouvelleNoteModal
        ouvert={
          modalNoteOuvert
        }
        onFermer={() =>
          setModalNoteOuvert(
            false
          )
        }
        onCreer={
          handleCreerNote
        }
        categories={
          categoriesBrutes
        }
        categorieSelectionnee={
          categorieSelectionnee
        }
      />
    </div>
  );
}

export default PageNotes;