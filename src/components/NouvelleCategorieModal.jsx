import { useState } from "react";

function NouvelleCategorieModal({
  ouvert,
  onFermer,
  onCreer,
  parentCategorie = null,
}) {
  const [nom, setNom] = useState("");

  if (!ouvert) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nomNettoye = nom.trim();

    if (!nomNettoye) {
      return;
    }

    await onCreer(nomNettoye);

    setNom("");
    onFermer();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onMouseDown={onFermer}
    >
      <div
        style={{
          width: "420px",
          maxWidth: "calc(100vw - 40px)",
          background: "white",
          borderRadius: "14px",
          padding: "24px",
          boxSizing: "border-box",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
              }}
            >
              {parentCategorie
                ? "Nouvelle sous-catégorie"
                : "Nouvelle catégorie"}
            </h2>

            {parentCategorie && (
              <p
                style={{
                  margin: "6px 0 0",
                  color: "#666",
                }}
              >
                Dans {parentCategorie.nom}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onFermer}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              marginBottom: "6px",
            }}
          >
            Nom
          </label>

          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            autoFocus
            style={{
              width: "100%",
              padding: "10px",
              boxSizing: "border-box",
              marginBottom: "20px",
            }}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={onFermer}
            >
              Annuler
            </button>

            <button type="submit">
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NouvelleCategorieModal;