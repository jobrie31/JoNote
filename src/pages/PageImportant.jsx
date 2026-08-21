import {
  useEffect,
  useState,
} from "react";

import PageNote from "./PageNote";

import {
  chargerNotes,
  chargerBlocs,
} from "../utils/firestoreJoNote";

function PageImportant({
  projet,
}) {
  const [
    elementsImportants,
    setElementsImportants,
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

  const chargerImportants =
    async () => {
      try {
        setChargement(true);
        setErreur("");

        const notes =
          await chargerNotes(
            projet.id
          );

        const resultats = [];

        for (const note of notes) {
          const blocs =
            await chargerBlocs(
              projet.id,
              note.id
            );

          const blocsImportants =
            blocs.filter(
              (bloc) =>
                bloc.type ===
                  "texte" &&
                bloc.important ===
                  true &&
                (
                  bloc.contenu ||
                  ""
                ).trim() !== ""
            );

          blocsImportants.forEach(
            (bloc) => {
              resultats.push({
                id: `${note.id}-${bloc.id}`,
                blocId: bloc.id,
                noteId: note.id,
                note,
                contenu:
                  bloc.contenu ||
                  "",
                ordre:
                  bloc.ordre || 0,
                updatedAt:
                  bloc.updatedAt ||
                  null,
              });
            }
          );
        }

        resultats.sort(
          (a, b) => {
            const dateA =
              a.updatedAt
                ?.toMillis?.() ||
              a.ordre ||
              0;

            const dateB =
              b.updatedAt
                ?.toMillis?.() ||
              b.ordre ||
              0;

            return (
              dateB - dateA
            );
          }
        );

        setElementsImportants(
          resultats
        );
      } catch (error) {
        console.error(
          "Erreur chargement éléments importants :",
          error
        );

        setErreur(
          "Impossible de charger les éléments importants."
        );
      } finally {
        setChargement(false);
      }
    };

  useEffect(() => {
    if (!projet?.id) {
      return;
    }

    chargerImportants();
  }, [projet?.id]);

  const handleRetourNote = async () => {
    setNoteSelectionnee(null);

    await chargerImportants();
  };

  if (noteSelectionnee) {
    return (
      <PageNote
        projet={projet}
        note={noteSelectionnee}
        onRetour={
          handleRetourNote
        }
      />
    );
  }

  return (
    <div
      style={{
        padding: "32px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: "20px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin:
                  "0 0 6px",
              }}
            >
              ⭐ Important
            </h2>

            <p
              style={{
                margin: 0,
                color: "#777",
              }}
            >
              Tous les textes
              importants du projet.
            </p>
          </div>

          {!chargement && (
            <div
              style={{
                padding:
                  "8px 14px",
                background:
                  "#fff7d6",
                border:
                  "1px solid #ead88b",
                borderRadius:
                  "999px",
                fontWeight: "600",
              }}
            >
              ⭐{" "}
              {
                elementsImportants.length
              }{" "}
              important
              {elementsImportants.length !==
              1
                ? "s"
                : ""}
            </div>
          )}
        </div>

        {chargement && (
          <div
            style={{
              padding: "30px",
              textAlign:
                "center",
              color: "#777",
            }}
          >
            Chargement des
            éléments importants...
          </div>
        )}

        {!chargement &&
          erreur && (
            <div
              style={{
                padding: "18px",
                border:
                  "1px solid #e5aaaa",
                background:
                  "#fff1f1",
                borderRadius:
                  "12px",
              }}
            >
              {erreur}
            </div>
          )}

        {!chargement &&
          !erreur &&
          elementsImportants.length ===
            0 && (
            <div
              style={{
                border:
                  "1px dashed #ccc",
                borderRadius:
                  "14px",
                padding: "50px",
                textAlign:
                  "center",
                color: "#777",
              }}
            >
              <div
                style={{
                  fontSize:
                    "36px",
                  marginBottom:
                    "12px",
                }}
              >
                ☆
              </div>

              <h3
                style={{
                  margin:
                    "0 0 8px",
                  color: "#333",
                }}
              >
                Aucun élément
                important
              </h3>

              <p
                style={{
                  margin: 0,
                }}
              >
                Dans une note,
                mets un bloc Texte
                sur ⭐ Important et
                il apparaîtra ici.
              </p>
            </div>
          )}

        {!chargement &&
          !erreur &&
          elementsImportants.length >
            0 && (
            <div
              style={{
                display: "flex",
                flexDirection:
                  "column",
                gap: "14px",
              }}
            >
              {elementsImportants.map(
                (element) => (
                  <button
                    key={
                      element.id
                    }
                    type="button"
                    onClick={() =>
                      setNoteSelectionnee(
                        element.note
                      )
                    }
                    style={{
                      width: "100%",
                      textAlign:
                        "left",
                      border:
                        "1px solid #e5d485",
                      borderRadius:
                        "12px",
                      padding:
                        "18px",
                      background:
                        "#fffbed",
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
                        gap: "12px",
                        marginBottom:
                          "12px",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap: "8px",
                        }}
                      >
                        <span>
                          ⭐
                        </span>

                        <strong>
                          Important
                        </strong>
                      </div>

                      <span
                        style={{
                          color:
                            "#777",
                          fontSize:
                            "13px",
                        }}
                      >
                        Ouvrir la
                        note →
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize:
                          "16px",
                        lineHeight:
                          1.55,
                        color:
                          "#222",
                        whiteSpace:
                          "pre-wrap",
                      }}
                    >
                      {
                        element.contenu
                      }
                    </div>

                    <div
                      style={{
                        marginTop:
                          "14px",
                        paddingTop:
                          "12px",
                        borderTop:
                          "1px solid rgba(0,0,0,0.08)",
                        color:
                          "#777",
                        fontSize:
                          "14px",
                      }}
                    >
                      Note :{" "}
                      <strong
                        style={{
                          color:
                            "#444",
                        }}
                      >
                        {element.note
                          .titre ||
                          "Sans titre"}
                      </strong>
                    </div>
                  </button>
                )
              )}
            </div>
          )}
      </div>
    </div>
  );
}

export default PageImportant;