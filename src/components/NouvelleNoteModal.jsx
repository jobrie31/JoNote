import { useEffect, useState } from "react";

function NouvelleNoteModal({
  ouvert,
  onFermer,
  onCreer,
  categories = [],
  categorieSelectionnee = null,
}) {
  const [titre, setTitre] = useState("");
  const [categorieId, setCategorieId] = useState("");
  const [importance, setImportance] = useState("normal");

  useEffect(() => {
    if (ouvert) {
      setCategorieId(categorieSelectionnee?.id || "");
    }
  }, [ouvert, categorieSelectionnee]);

  if (!ouvert) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    const titreNettoye = titre.trim();

    if (!titreNettoye) {
      return;
    }

    await onCreer({
      titre: titreNettoye,
      categorieIds: categorieId ? [categorieId] : [],
      importance,
    });

    setTitre("");
    setCategorieId("");
    setImportance("normal");

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
        zIndex: 3000,
      }}
      onMouseDown={onFermer}
    >
      <div
        style={{
          width: "440px",
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
            gap: "20px",
            marginBottom: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
            }}
          >
            Nouvelle note
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
              Titre
            </label>

            <input
              type="text"
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
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
              marginBottom: "16px",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "6px",
              }}
            >
              Catégorie
            </label>

            <select
              value={categorieId}
              onChange={(e) => setCategorieId(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
              }}
            >
              <option value="">
                Aucune catégorie
              </option>

              {categories.map((categorie) => (
                <option
                  key={categorie.id}
                  value={categorie.id}
                >
                  {categorie.nom}
                </option>
              ))}
            </select>
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
              Importance
            </label>

            <select
              value={importance}
              onChange={(e) => setImportance(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                boxSizing: "border-box",
              }}
            >
              <option value="normal">
                Normal
              </option>

              <option value="information">
                Information
              </option>

              <option value="retenir">
                À retenir
              </option>

              <option value="important">
                Important
              </option>

              <option value="critique">
                Critique
              </option>
            </select>
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
              Créer la note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NouvelleNoteModal;