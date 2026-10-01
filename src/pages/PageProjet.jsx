import {
  useEffect,
  useState,
} from "react";

import BlocNote from "../components/BlocNote";
import BanqueNotes from "../components/BanqueNotes";

import {
  creerNote,
  ecouterNotesProjet,
  modifierNote,
  supprimerNote,
} from "../utils/firestoreJoNote";

function PageProjet({
  projet,
  onRetour,
}) {
  const [
    notes,
    setNotes,
  ] = useState([]);

  const [
    creationEnCours,
    setCreationEnCours,
  ] = useState(false);

  const [
    erreur,
    setErreur,
  ] = useState("");

  useEffect(() => {
    if (!projet?.id) {
      return undefined;
    }

    setErreur("");

    const unsubscribe =
      ecouterNotesProjet(
        projet.id,

        (
          nouvellesNotes
        ) => {
          setNotes(
            nouvellesNotes
          );
        }
      );

    return () => {
      unsubscribe?.();
    };
  }, [projet?.id]);

  const obtenirDateAujourdhui =
    () => {
      const date =
        new Date();

      const annee =
        date.getFullYear();

      const mois =
        String(
          date.getMonth() +
            1
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

  const handleAjouterNote =
    async () => {
      try {
        setCreationEnCours(
          true
        );

        setErreur("");

        await creerNote({
          projetId:
            projet.id,

          titre:
            "",

          contenu:
            "",

          date:
            obtenirDateAujourdhui(),
        });
      } catch (error) {
        console.error(
          "Erreur création note :",
          error
        );

        setErreur(
          "Impossible de créer la note."
        );
      } finally {
        setCreationEnCours(
          false
        );
      }
    };

  const handleModifierNote =
    async (
      noteId,
      donnees
    ) => {
      await modifierNote(
        noteId,
        donnees
      );
    };

  const handleSupprimerNote =
    async (
      noteId
    ) => {
      try {
        await supprimerNote(
          noteId
        );
      } catch (error) {
        console.error(
          "Erreur suppression note :",
          error
        );

        setErreur(
          "Impossible de supprimer la note."
        );
      }
    };

  return (
    <div
      style={{
        display:
          "flex",

        minHeight:
          "100%",

        background:
          "#f7f8fa",
      }}
    >
      {/* =========================
          CONTENU DU PROJET
      ========================= */}

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
            maxWidth:
              "1000px",

            margin:
              "0 auto",

            padding:
              "32px",
          }}
        >
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

              marginBottom:
                "30px",

              flexWrap:
                "wrap",
            }}
          >
            <div>
              <button
                type="button"
                onClick={
                  onRetour
                }
                style={{
                  border:
                    "none",

                  background:
                    "transparent",

                  padding:
                    0,

                  marginBottom:
                    "14px",

                  cursor:
                    "pointer",

                  color:
                    "#6b7280",

                  fontFamily:
                    "inherit",

                  fontSize:
                    "14px",
                }}
              >
                ← Tous les projets
              </button>

              <h1
                style={{
                  margin:
                    "0 0 6px",

                  fontSize:
                    "30px",

                  color:
                    "#111827",
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
                      "#6b7280",
                  }}
                >
                  {
                    projet.description
                  }
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={
                handleAjouterNote
              }
              disabled={
                creationEnCours
              }
              style={{
                border:
                  "none",

                borderRadius:
                  "10px",

                padding:
                  "11px 18px",

                background:
                  "#111827",

                color:
                  "#ffffff",

                fontWeight:
                  "600",

                cursor:
                  creationEnCours
                    ? "default"
                    : "pointer",

                fontFamily:
                  "inherit",

                fontSize:
                  "14px",

                opacity:
                  creationEnCours
                    ? 0.6
                    : 1,
              }}
            >
              {creationEnCours
                ? "Création..."
                : "+ Nouvelle note"}
            </button>
          </div>

          {erreur && (
            <div
              style={{
                padding:
                  "12px 14px",

                borderRadius:
                  "10px",

                background:
                  "#fff1f1",

                color:
                  "#b42318",

                marginBottom:
                  "18px",
              }}
            >
              {erreur}
            </div>
          )}

          {notes.length ===
          0 ? (
            <div
              style={{
                padding:
                  "70px 20px",

                textAlign:
                  "center",

                border:
                  "1px dashed #d1d5db",

                borderRadius:
                  "14px",

                background:
                  "#ffffff",
              }}
            >
              <div
                style={{
                  fontSize:
                    "36px",

                  marginBottom:
                    "10px",
                }}
              >
                📝
              </div>

              <h3
                style={{
                  margin:
                    "0 0 6px",
                }}
              >
                Aucune note
              </h3>

              <p
                style={{
                  margin:
                    "0 0 18px",

                  color:
                    "#6b7280",
                }}
              >
                Ajoute ta première
                note pour ce projet.
              </p>

              <button
                type="button"
                onClick={
                  handleAjouterNote
                }
              >
                + Nouvelle note
              </button>
            </div>
          ) : (
            <div
              style={{
                display:
                  "flex",

                flexDirection:
                  "column",

                gap:
                  "14px",
              }}
            >
              {notes.map(
                (note) => (
                  <BlocNote
                    key={
                      note.id
                    }
                    note={
                      note
                    }
                    onModifier={
                      handleModifierNote
                    }
                    onSupprimer={
                      handleSupprimerNote
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================
          BANQUE DE NOTES
      ========================= */}

      <BanqueNotes />
    </div>
  );
}

export default PageProjet;