import {
  useEffect,
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
  creerNote,
} from "../utils/firestoreJoNote";

function PageNotes({ projet }) {
  const [categories, setCategories] =
    useState([]);

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

  const [notes, setNotes] = useState([]);

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

  const construireArbreCategories = (
    categoriesListe
  ) => {
    const categoriesMap = {};

    categoriesListe.forEach((categorie) => {
      categoriesMap[categorie.id] = {
        ...categorie,
        enfants: [],
      };
    });

    const racines = [];

    Object.values(categoriesMap).forEach(
      (categorie) => {
        if (
          categorie.parentId &&
          categoriesMap[categorie.parentId]
        ) {
          categoriesMap[
            categorie.parentId
          ].enfants.push(categorie);
        } else {
          racines.push(categorie);
        }
      }
    );

    return racines;
  };

  const loadCategories = async () => {
    try {
      setChargementCategories(true);

      const categoriesFirebase =
        await chargerCategories(projet.id);

      setCategoriesBrutes(
        categoriesFirebase
      );

      const arbre =
        construireArbreCategories(
          categoriesFirebase
        );

      setCategories(arbre);
    } catch (error) {
      console.error(
        "Erreur chargement catégories :",
        error
      );
    } finally {
      setChargementCategories(false);
    }
  };

  const loadNotes = async () => {
    try {
      setChargementNotes(true);

      const notesFirebase =
        await chargerNotes(projet.id);

      setNotes(notesFirebase);
    } catch (error) {
      console.error(
        "Erreur chargement notes :",
        error
      );
    } finally {
      setChargementNotes(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadNotes();
  }, [projet.id]);

  const ouvrirNouvelleCategorie = () => {
    setParentCategorie(null);
    setModalCategorieOuvert(true);
  };

  const ouvrirNouvelleSousCategorie = (
    categorie
  ) => {
    setParentCategorie(categorie);
    setModalCategorieOuvert(true);
  };

  const handleCreerCategorie = async (
    nom
  ) => {
    try {
      await creerCategorie(
        projet.id,
        nom,
        parentCategorie?.id || null
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

  const fermerActionCategorie = () => {
    setActionCategorie({
      ouvert: false,
      mode: null,
      categorie: null,
    });
  };

  const handleRenommerCategorie = async (
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

  const handleDeplacerCategorie = async (
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
    if (categorieId === brancheId) {
      return true;
    }

    let categorie =
      categoriesBrutes.find(
        (item) => item.id === categorieId
      );

    while (categorie?.parentId) {
      if (
        categorie.parentId === brancheId
      ) {
        return true;
      }

      categorie =
        categoriesBrutes.find(
          (item) =>
            item.id === categorie.parentId
        );
    }

    return false;
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
          setCategorieSelectionnee(null);
        }

        await loadCategories();
      } catch (error) {
        console.error(
          "Erreur suppression catégorie :",
          error
        );
      }
    };

  const handleCreerNote = async ({
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

  const notesFiltrees =
    categorieSelectionnee === null
      ? notes
      : notes.filter((note) =>
          note.categorieIds?.includes(
            categorieSelectionnee.id
          )
        );

  const obtenirNomImportance = (
    importance
  ) => {
    switch (importance) {
      case "critique":
        return "🔴 Critique";

      case "important":
        return "🟠 Important";

      case "retenir":
        return "🟡 À retenir";

      case "information":
        return "🔵 Information";

      default:
        return "Normal";
    }
  };

  const obtenirCategorieNom = (
    categorieId
  ) => {
    const categorie =
      categoriesBrutes.find(
        (item) => item.id === categorieId
      );

    return categorie?.nom || "";
  };

  if (noteSelectionnee) {
    return (
      <PageNote
        projet={projet}
        note={noteSelectionnee}
        onRetour={() =>
          setNoteSelectionnee(null)
        }
      />
    );
  }

  return (
    <div
      style={{
        display: "flex",
        minHeight: "500px",
      }}
    >
      <CategorieTree
        categories={categories}
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
          paddingLeft: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                marginBottom: "6px",
              }}
            >
              {categorieSelectionnee
                ? categorieSelectionnee.nom
                : "Toutes les notes"}
            </h2>

            <p
              style={{
                margin: 0,
                color: "#666",
              }}
            >
              Notes de {projet.nom}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setModalNoteOuvert(true)
            }
          >
            + Nouvelle note
          </button>
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

        {!chargementNotes &&
          notesFiltrees.length === 0 && (
            <div
              style={{
                border:
                  "1px dashed #ccc",
                borderRadius: "12px",
                padding: "30px",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                }}
              >
                Aucune note
              </h3>

              <p>
                {categorieSelectionnee
                  ? `Crée une note dans ${categorieSelectionnee.nom}.`
                  : "Crée une note dans ce projet."}
              </p>

              <button
                type="button"
                onClick={() =>
                  setModalNoteOuvert(true)
                }
              >
                + Créer une note
              </button>
            </div>
          )}

        {!chargementNotes &&
          notesFiltrees.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "14px",
              }}
            >
              {notesFiltrees.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() =>
                    setNoteSelectionnee(note)
                  }
                  style={{
                    border:
                      "1px solid #ddd",
                    borderRadius: "12px",
                    padding: "18px",
                    background: "white",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "flex-start",
                      gap: "10px",
                    }}
                  >
                    <h3
                      style={{
                        margin:
                          "0 0 12px",
                      }}
                    >
                      {note.titre}
                    </h3>

                    {note.importance &&
                      note.importance !==
                        "normal" && (
                        <span
                          style={{
                            fontSize:
                              "12px",
                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {obtenirNomImportance(
                            note.importance
                          )}
                        </span>
                      )}
                  </div>

                  {note.categorieIds?.length >
                    0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: "6px",
                        flexWrap: "wrap",
                      }}
                    >
                      {note.categorieIds.map(
                        (categorieId) => {
                          const nom =
                            obtenirCategorieNom(
                              categorieId
                            );

                          if (!nom) {
                            return null;
                          }

                          return (
                            <span
                              key={
                                categorieId
                              }
                              style={{
                                padding:
                                  "4px 8px",
                                background:
                                  "#f2f2f2",
                                borderRadius:
                                  "999px",
                                fontSize:
                                  "12px",
                              }}
                            >
                              {nom}
                            </span>
                          );
                        }
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
      </div>

      <NouvelleCategorieModal
        ouvert={modalCategorieOuvert}
        onFermer={() =>
          setModalCategorieOuvert(false)
        }
        onCreer={handleCreerCategorie}
        parentCategorie={
          parentCategorie
        }
      />

      <CategorieActionModal
        ouvert={
          actionCategorie.ouvert
        }
        mode={actionCategorie.mode}
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
        ouvert={modalNoteOuvert}
        onFermer={() =>
          setModalNoteOuvert(false)
        }
        onCreer={handleCreerNote}
        categories={categoriesBrutes}
        categorieSelectionnee={
          categorieSelectionnee
        }
      />
    </div>
  );
}

export default PageNotes;