import {
  useEffect,
  useState,
} from "react";

function NouveauProjetModal({
  ouvert,
  onFermer,
  onCreer,
}) {
  const [
    nom,
    setNom,
  ] = useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    creationEnCours,
    setCreationEnCours,
  ] = useState(false);

  useEffect(() => {
    if (ouvert) {
      setNom("");
      setDescription("");
      setCreationEnCours(
        false
      );
    }
  }, [ouvert]);

  if (!ouvert) {
    return null;
  }

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      const nomNettoye =
        nom.trim();

      if (!nomNettoye) {
        return;
      }

      try {
        setCreationEnCours(
          true
        );

        await onCreer({
          nom:
            nomNettoye,

          description:
            description.trim(),
        });

        onFermer();
      } catch (error) {
        console.error(
          "Erreur création projet :",
          error
        );

        setCreationEnCours(
          false
        );
      }
    };

  return (
    <div
      style={{
        position:
          "fixed",

        inset:
          0,

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        background:
          "rgba(17,24,39,0.35)",

        zIndex:
          2000,

        padding:
          "20px",
      }}
      onMouseDown={
        onFermer
      }
    >
      <div
        style={{
          width:
            "440px",

          maxWidth:
            "100%",

          background:
            "#ffffff",

          borderRadius:
            "16px",

          padding:
            "24px",

          boxSizing:
            "border-box",

          boxShadow:
            "0 24px 70px rgba(0,0,0,0.18)",
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

            justifyContent:
              "space-between",

            alignItems:
              "center",

            marginBottom:
              "22px",
          }}
        >
          <h2
            style={{
              margin:
                0,

              fontSize:
                "22px",
            }}
          >
            Nouveau projet
          </h2>

          <button
            type="button"
            onClick={
              onFermer
            }
            style={{
              border:
                "none",

              background:
                "transparent",

              fontSize:
                "24px",

              cursor:
                "pointer",
            }}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
        >
          <div
            style={{
              marginBottom:
                "16px",
            }}
          >
            <label
              style={{
                display:
                  "block",

                marginBottom:
                  "6px",

                fontWeight:
                  "600",
              }}
            >
              Nom du projet
            </label>

            <input
              type="text"
              value={nom}
              onChange={(
                e
              ) =>
                setNom(
                  e.target
                    .value
                )
              }
              autoFocus
              placeholder="Ex. Costco Lévis"
              style={{
                width:
                  "100%",

                boxSizing:
                  "border-box",

                border:
                  "1px solid #d1d5db",

                borderRadius:
                  "9px",

                padding:
                  "11px 12px",

                fontFamily:
                  "inherit",

                fontSize:
                  "15px",
              }}
            />
          </div>

          <div
            style={{
              marginBottom:
                "24px",
            }}
          >
            <label
              style={{
                display:
                  "block",

                marginBottom:
                  "6px",

                fontWeight:
                  "600",
              }}
            >
              Description
            </label>

            <textarea
              value={
                description
              }
              onChange={(
                e
              ) =>
                setDescription(
                  e.target
                    .value
                )
              }
              placeholder="Facultatif"
              rows={3}
              style={{
                width:
                  "100%",

                boxSizing:
                  "border-box",

                border:
                  "1px solid #d1d5db",

                borderRadius:
                  "9px",

                padding:
                  "11px 12px",

                resize:
                  "vertical",

                fontFamily:
                  "inherit",

                fontSize:
                  "15px",
              }}
            />
          </div>

          <div
            style={{
              display:
                "flex",

              justifyContent:
                "flex-end",

              gap:
                "10px",
            }}
          >
            <button
              type="button"
              onClick={
                onFermer
              }
              disabled={
                creationEnCours
              }
            >
              Annuler
            </button>

            <button
              type="submit"
              disabled={
                creationEnCours ||
                !nom.trim()
              }
              style={{
                background:
                  "#111827",

                color:
                  "#ffffff",

                border:
                  "none",

                borderRadius:
                  "9px",

                padding:
                  "10px 16px",

                cursor:
                  "pointer",

                fontWeight:
                  "600",
              }}
            >
              {creationEnCours
                ? "Création..."
                : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NouveauProjetModal;