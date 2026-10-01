import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ecouterProjets,
  ecouterToutesNotes,
} from "../utils/firestoreJoNote";

function BanqueNotes() {
  const [
    notes,
    setNotes,
  ] = useState([]);

  const [
    projets,
    setProjets,
  ] = useState([]);

  const [
    noteSelectionnee,
    setNoteSelectionnee,
  ] = useState(null);

  useEffect(() => {
    const unsubscribeNotes =
      ecouterToutesNotes(
        (nouvellesNotes) => {
          setNotes(
            nouvellesNotes
          );
        }
      );

    const unsubscribeProjets =
      ecouterProjets(
        (nouveauxProjets) => {
          setProjets(
            nouveauxProjets
          );
        }
      );

    return () => {
      unsubscribeNotes?.();
      unsubscribeProjets?.();
    };
  }, []);

  const projetsParId =
    useMemo(() => {
      const map =
        new Map();

      projets.forEach(
        (projet) => {
          map.set(
            projet.id,
            projet
          );
        }
      );

      return map;
    }, [projets]);

  const obtenirNomProjet = (
    projetId
  ) => {
    return (
      projetsParId.get(
        projetId
      )?.nom ||
      "Projet inconnu"
    );
  };

  const formaterDate = (
    valeur
  ) => {
    if (!valeur) {
      return "";
    }

    const [
      annee,
      mois,
      jour,
    ] =
      valeur.split("-");

    if (
      !annee ||
      !mois ||
      !jour
    ) {
      return valeur;
    }

    const date =
      new Date(
        Number(annee),
        Number(mois) - 1,
        Number(jour)
      );

    let resultat =
      date.toLocaleDateString(
        "fr-CA",
        {
          weekday:
            "long",

          day:
            "numeric",

          month:
            "long",

          year:
            "numeric",
        }
      );

    resultat =
      resultat.charAt(0)
        .toUpperCase() +
      resultat.slice(1);

    return resultat;
  };

  return (
    <>
      <aside
        style={{
          width:
            "300px",

          minWidth:
            "300px",

          height:
            "calc(100vh - 64px)",

          position:
            "sticky",

          top:
            "64px",

          background:
            "#ffffff",

          borderLeft:
            "1px solid #e5e7eb",

          boxSizing:
            "border-box",

          overflowY:
            "auto",
        }}
      >
        <div
          style={{
            padding:
              "20px 18px 14px",

            position:
              "sticky",

            top:
              0,

            background:
              "#ffffff",

            borderBottom:
              "1px solid #f1f3f5",

            zIndex:
              2,
          }}
        >
          <h3
            style={{
              margin:
                "0 0 4px",

              fontSize:
                "17px",

              color:
                "#111827",
            }}
          >
            Notes récentes
          </h3>

          <div
            style={{
              color:
                "#9ca3af",

              fontSize:
                "12px",
            }}
          >
            {notes.length}{" "}
            {notes.length === 1
              ? "note"
              : "notes"}
          </div>
        </div>

        {notes.length ===
        0 ? (
          <div
            style={{
              padding:
                "30px 18px",

              color:
                "#9ca3af",

              fontSize:
                "13px",

              textAlign:
                "center",
            }}
          >
            Aucune note
          </div>
        ) : (
          <div>
            {notes.map(
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

                    display:
                      "block",

                    border:
                      "none",

                    borderBottom:
                      "1px solid #f3f4f6",

                    background:
                      "#ffffff",

                    padding:
                      "14px 18px",

                    textAlign:
                      "left",

                    cursor:
                      "pointer",

                    fontFamily:
                      "inherit",
                  }}
                  onMouseEnter={(
                    e
                  ) => {
                    e.currentTarget.style.background =
                      "#f9fafb";
                  }}
                  onMouseLeave={(
                    e
                  ) => {
                    e.currentTarget.style.background =
                      "#ffffff";
                  }}
                >
                  <div
                    style={{
                      fontWeight:
                        "650",

                      fontSize:
                        "14px",

                      color:
                        "#111827",

                      whiteSpace:
                        "nowrap",

                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",

                      marginBottom:
                        "4px",
                    }}
                  >
                    {note.titre?.trim() ||
                      "Sans titre"}
                  </div>

                  <div
                    style={{
                      fontSize:
                        "12px",

                      color:
                        "#9ca3af",

                      whiteSpace:
                        "nowrap",

                      overflow:
                        "hidden",

                      textOverflow:
                        "ellipsis",
                    }}
                  >
                    {obtenirNomProjet(
                      note.projetId
                    )}
                  </div>
                </button>
              )
            )}
          </div>
        )}
      </aside>

      {noteSelectionnee && (
        <div
          style={{
            position:
              "fixed",

            inset:
              0,

            background:
              "rgba(17,24,39,0.35)",

            zIndex:
              5000,

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            padding:
              "30px",
          }}
          onMouseDown={() =>
            setNoteSelectionnee(
              null
            )
          }
        >
          <div
            style={{
              width:
                "650px",

              maxWidth:
                "100%",

              maxHeight:
                "80vh",

              overflowY:
                "auto",

              background:
                "#ffffff",

              borderRadius:
                "16px",

              padding:
                "26px",

              boxSizing:
                "border-box",

              boxShadow:
                "0 25px 80px rgba(0,0,0,0.22)",
            }}
            onMouseDown={(
              e
            ) =>
              e.stopPropagation()
            }
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
                  "18px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin:
                      "0 0 7px",

                    color:
                      "#111827",

                    fontSize:
                      "23px",
                  }}
                >
                  {noteSelectionnee
                    .titre
                    ?.trim() ||
                    "Sans titre"}
                </h2>

                <div
                  style={{
                    fontSize:
                      "13px",

                    color:
                      "#6b7280",

                    marginBottom:
                      "3px",
                  }}
                >
                  {obtenirNomProjet(
                    noteSelectionnee.projetId
                  )}
                </div>

                <div
                  style={{
                    fontSize:
                      "13px",

                    color:
                      "#9ca3af",
                  }}
                >
                  {formaterDate(
                    noteSelectionnee.date
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setNoteSelectionnee(
                    null
                  )
                }
                style={{
                  border:
                    "none",

                  background:
                    "transparent",

                  fontSize:
                    "24px",

                  color:
                    "#9ca3af",

                  cursor:
                    "pointer",

                  padding:
                    0,
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                height:
                  "1px",

                background:
                  "#e5e7eb",

                marginBottom:
                  "18px",
              }}
            />

            <div
              style={{
                whiteSpace:
                  "pre-wrap",

                fontSize:
                  "15px",

                lineHeight:
                  1.65,

                color:
                  "#1f2937",
              }}
            >
              {noteSelectionnee
                .contenu ||
                "Aucun contenu."}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default BanqueNotes;