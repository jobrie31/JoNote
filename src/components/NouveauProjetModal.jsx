import { useState } from "react";

function NouveauProjetModal({
  ouvert,
  onFermer,
  onCreer,
}) {
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");

  if (!ouvert) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nomNettoye = nom.trim();

    if (!nomNettoye) {
      return;
    }

    await onCreer({
      nom: nomNettoye,
      description: description.trim(),
    });

    setNom("");
    setDescription("");
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
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
            }}
          >
            Nouveau projet
          </h2>

          <button
            type="button"
            onClick={onFermer}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              marginBottom: "16px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "6px",
              }}
            >
              Nom du projet
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
              }}
            />
          </div>

          <div
            style={{
              marginBottom: "20px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "6px",
              }}
            >
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

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
              Créer le projet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NouveauProjetModal;