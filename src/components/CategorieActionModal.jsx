import { useEffect, useMemo, useState } from "react";

function CategorieActionModal({
  ouvert,
  mode,
  categorie,
  categoriesBrutes,
  onFermer,
  onRenommer,
  onDeplacer,
  onSupprimer,
}) {
  const [nom, setNom] = useState("");
  const [parentId, setParentId] = useState("");

  useEffect(() => {
    if (!categorie) {
      return;
    }

    setNom(categorie.nom || "");
    setParentId(categorie.parentId || "");
  }, [categorie, ouvert]);

  const idsInterdits = useMemo(() => {
    if (!categorie) {
      return new Set();
    }

    const interdits = new Set([categorie.id]);

    const trouverDescendants = (parentId) => {
      categoriesBrutes.forEach((item) => {
        if (item.parentId === parentId) {
          interdits.add(item.id);
          trouverDescendants(item.id);
        }
      });
    };

    trouverDescendants(categorie.id);

    return interdits;
  }, [categorie, categoriesBrutes]);

  const destinationsPossibles = categoriesBrutes.filter(
    (item) => !idsInterdits.has(item.id)
  );

  if (!ouvert || !categorie) {
    return null;
  }

  const handleRenommer = async (e) => {
    e.preventDefault();

    const nouveauNom = nom.trim();

    if (!nouveauNom) {
      return;
    }

    await onRenommer(categorie, nouveauNom);
    onFermer();
  };

  const handleDeplacer = async (e) => {
    e.preventDefault();

    await onDeplacer(
      categorie,
      parentId || null
    );

    onFermer();
  };

  const handleSupprimer = async () => {
    await onSupprimer(categorie);
    onFermer();
  };

  let titre = "";

  if (mode === "renommer") {
    titre = "Renommer la catégorie";
  }

  if (mode === "deplacer") {
    titre = "Déplacer la catégorie";
  }

  if (mode === "supprimer") {
    titre = "Supprimer la catégorie";
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
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
          boxShadow: "0 18px 60px rgba(0,0,0,0.2)",
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "22px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
              }}
            >
              {titre}
            </h2>

            <p
              style={{
                margin: "6px 0 0",
                color: "#666",
              }}
            >
              {categorie.nom}
            </p>
          </div>

          <button
            type="button"
            onClick={onFermer}
          >
            ×
          </button>
        </div>

        {mode === "renommer" && (
          <form onSubmit={handleRenommer}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
              }}
            >
              Nouveau nom
            </label>

            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "11px",
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
                Enregistrer
              </button>
            </div>
          </form>
        )}

        {mode === "deplacer" && (
          <form onSubmit={handleDeplacer}>
            <label
              style={{
                display: "block",
                marginBottom: "7px",
              }}
            >
              Déplacer dans
            </label>

            <select
              value={parentId}
              onChange={(e) =>
                setParentId(e.target.value)
              }
              style={{
                width: "100%",
                padding: "11px",
                boxSizing: "border-box",
                marginBottom: "20px",
              }}
            >
              <option value="">
                Racine du projet
              </option>

              {destinationsPossibles.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.nom}
                </option>
              ))}
            </select>

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
                Déplacer
              </button>
            </div>
          </form>
        )}

        {mode === "supprimer" && (
          <div>
            <p
              style={{
                lineHeight: 1.5,
              }}
            >
              Veux-tu vraiment supprimer
              <strong> {categorie.nom}</strong> ?
            </p>

            <p
              style={{
                color: "#b42318",
                lineHeight: 1.5,
              }}
            >
              Toutes ses sous-catégories seront également supprimées.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "24px",
              }}
            >
              <button
                type="button"
                onClick={onFermer}
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleSupprimer}
              >
                Supprimer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CategorieActionModal;