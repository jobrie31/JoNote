import {
  useEffect,
  useState,
} from "react";

import NouveauProjetModal from "../components/NouveauProjetModal";

import {
  creerProjet,
  ecouterProjets,
  modifierProjet,
  supprimerProjet,
} from "../utils/firestoreJoNote";

function PageAccueil({
  onOuvrirProjet,
}) {
  const [
    projets,
    setProjets,
  ] = useState([]);

  const [
    modalOuvert,
    setModalOuvert,
  ] = useState(false);

  const [
    erreur,
    setErreur,
  ] = useState("");

  useEffect(() => {
    const unsubscribe =
      ecouterProjets(
        (
          nouveauxProjets
        ) => {
          setProjets(
            nouveauxProjets
          );
        }
      );

    return () => {
      unsubscribe?.();
    };
  }, []);

  const handleCreerProjet =
    async (
      donnees
    ) => {
      setErreur("");

      await creerProjet(
        donnees
      );
    };

  const handleRenommerProjet =
    async (
      projet
    ) => {
      const nouveauNom =
        window.prompt(
          "Nouveau nom du projet :",
          projet.nom || ""
        );

      if (
        nouveauNom ===
        null
      ) {
        return;
      }

      const nomNettoye =
        nouveauNom.trim();

      if (!nomNettoye) {
        return;
      }

      try {
        await modifierProjet(
          projet.id,
          {
            nom:
              nomNettoye,
          }
        );
      } catch (error) {
        console.error(
          "Erreur modification projet :",
          error
        );

        setErreur(
          "Impossible de modifier le projet."
        );
      }
    };

  const handleSupprimerProjet =
    async (
      projet
    ) => {
      const confirmation =
        window.confirm(
          `Supprimer le projet « ${projet.nom} » ?\n\nToutes les notes de ce projet seront aussi supprimées.`
        );

      if (!confirmation) {
        return;
      }

      try {
        await supprimerProjet(
          projet.id
        );
      } catch (error) {
        console.error(
          "Erreur suppression projet :",
          error
        );

        setErreur(
          "Impossible de supprimer le projet."
        );
      }
    };

  return (
    <div
      style={{
        minHeight:
          "100%",

        background:
          "#f7f8fa",
      }}
    >
      <div
        style={{
          maxWidth:
            "1100px",

          margin:
            "0 auto",

          padding:
            "36px 32px",
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
              "30px",

            flexWrap:
              "wrap",
          }}
        >
          <div>
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
              Projets
            </h1>

            <p
              style={{
                margin:
                  0,

                color:
                  "#6b7280",
              }}
            >
              Ta banque de projets
              JoNote.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setModalOuvert(
                true
              )
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
                "pointer",

              fontFamily:
                "inherit",
            }}
          >
            + Nouveau projet
          </button>
        </div>

        {erreur && (
          <div
            style={{
              marginBottom:
                "20px",

              padding:
                "12px 14px",

              borderRadius:
                "10px",

              background:
                "#fff1f1",

              color:
                "#b42318",
            }}
          >
            {erreur}
          </div>
        )}

        {projets.length ===
        0 ? (
          <div
            style={{
              background:
                "#ffffff",

              border:
                "1px dashed #d1d5db",

              borderRadius:
                "14px",

              padding:
                "70px 20px",

              textAlign:
                "center",
            }}
          >
            <div
              style={{
                fontSize:
                  "40px",

                marginBottom:
                  "10px",
              }}
            >
              📁
            </div>

            <h3
              style={{
                margin:
                  "0 0 6px",
              }}
            >
              Aucun projet
            </h3>

            <p
              style={{
                color:
                  "#6b7280",

                margin:
                  "0 0 18px",
              }}
            >
              Commence par créer
              ton premier projet.
            </p>

            <button
              type="button"
              onClick={() =>
                setModalOuvert(
                  true
                )
              }
            >
              + Nouveau projet
            </button>
          </div>
        ) : (
          <div
            style={{
              display:
                "grid",

              gridTemplateColumns:
                "repeat(auto-fill, minmax(260px, 1fr))",

              gap:
                "16px",
            }}
          >
            {projets.map(
              (projet) => (
                <div
                  key={
                    projet.id
                  }
                  style={{
                    background:
                      "#ffffff",

                    border:
                      "1px solid #e5e7eb",

                    borderRadius:
                      "14px",

                    padding:
                      "20px",

                    boxShadow:
                      "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      onOuvrirProjet(
                        projet
                      )
                    }
                    style={{
                      display:
                        "block",

                      width:
                        "100%",

                      border:
                        "none",

                      background:
                        "transparent",

                      padding:
                        0,

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
                        fontSize:
                          "28px",

                        marginBottom:
                          "12px",
                      }}
                    >
                      📁
                    </div>

                    <h3
                      style={{
                        margin:
                          "0 0 7px",

                        color:
                          "#111827",

                        fontSize:
                          "18px",
                      }}
                    >
                      {
                        projet.nom
                      }
                    </h3>

                    <p
                      style={{
                        margin:
                          0,

                        minHeight:
                          "40px",

                        color:
                          "#6b7280",

                        fontSize:
                          "14px",

                        lineHeight:
                          1.45,
                      }}
                    >
                      {projet.description ||
                        "Aucune description"}
                    </p>
                  </button>

                  <div
                    style={{
                      display:
                        "flex",

                      justifyContent:
                        "flex-end",

                      gap:
                        "8px",

                      marginTop:
                        "18px",

                      paddingTop:
                        "12px",

                      borderTop:
                        "1px solid #f3f4f6",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleRenommerProjet(
                          projet
                        )
                      }
                      style={{
                        fontSize:
                          "12px",
                      }}
                    >
                      Renommer
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSupprimerProjet(
                          projet
                        )
                      }
                      style={{
                        fontSize:
                          "12px",

                        color:
                          "#b42318",
                      }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <NouveauProjetModal
        ouvert={
          modalOuvert
        }
        onFermer={() =>
          setModalOuvert(
            false
          )
        }
        onCreer={
          handleCreerProjet
        }
      />
    </div>
  );
}

export default PageAccueil;