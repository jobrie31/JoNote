import { useEffect, useState } from "react";

function CategorieTree({
  categories = [],
  categorieSelectionnee,
  onSelectionnerCategorie,
  onAjouterCategorie,
  onAjouterSousCategorie,
  onActionCategorie,
}) {
  const [menuContextuel, setMenuContextuel] =
    useState(null);

  useEffect(() => {
    const fermerMenu = () => {
      setMenuContextuel(null);
    };

    window.addEventListener("click", fermerMenu);
    window.addEventListener("scroll", fermerMenu);

    return () => {
      window.removeEventListener("click", fermerMenu);
      window.removeEventListener("scroll", fermerMenu);
    };
  }, []);

  const ouvrirMenuContextuel = (
    e,
    categorie
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setMenuContextuel({
      x: e.clientX,
      y: e.clientY,
      categorie,
    });
  };

  const lancerAction = (action) => {
    if (!menuContextuel?.categorie) {
      return;
    }

    onActionCategorie(
      action,
      menuContextuel.categorie
    );

    setMenuContextuel(null);
  };

  const renderCategorie = (
    categorie,
    niveau = 0
  ) => {
    const estSelectionnee =
      categorieSelectionnee?.id === categorie.id;

    return (
      <div key={categorie.id}>
        <div
          onContextMenu={(e) =>
            ouvrirMenuContextuel(e, categorie)
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <button
            type="button"
            onClick={() =>
              onSelectionnerCategorie(categorie)
            }
            style={{
              flex: 1,
              border: "none",
              background: estSelectionnee
                ? "#f0f0f0"
                : "transparent",
              textAlign: "left",
              padding: "8px 10px",
              paddingLeft: `${10 + niveau * 18}px`,
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: estSelectionnee
                ? "600"
                : "400",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            📁 {categorie.nom}
          </button>

          <button
            type="button"
            title="Ajouter une sous-catégorie"
            onClick={(e) => {
              e.stopPropagation();
              onAjouterSousCategorie(categorie);
            }}
            style={{
              width: "30px",
              height: "30px",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              borderRadius: "6px",
              flexShrink: 0,
            }}
          >
            +
          </button>
        </div>

        {categorie.enfants?.map((enfant) =>
          renderCategorie(
            enfant,
            niveau + 1
          )
        )}
      </div>
    );
  };

  return (
    <>
      <div
        style={{
          width: "260px",
          minWidth: "260px",
          borderRight: "1px solid #ddd",
          paddingRight: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              margin: 0,
            }}
          >
            Catégories
          </h3>

          <button
            type="button"
            onClick={onAjouterCategorie}
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            onSelectionnerCategorie(null)
          }
          style={{
            width: "100%",
            border: "none",
            background:
              categorieSelectionnee === null
                ? "#f0f0f0"
                : "transparent",
            textAlign: "left",
            padding: "8px 10px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight:
              categorieSelectionnee === null
                ? "600"
                : "400",
            marginBottom: "6px",
          }}
        >
          🗂 Toutes les notes
        </button>

        {categories.map((categorie) =>
          renderCategorie(categorie)
        )}
      </div>

      {menuContextuel && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            left: menuContextuel.x,
            top: menuContextuel.y,
            width: "180px",
            background: "white",
            border: "1px solid #ddd",
            borderRadius: "10px",
            padding: "6px",
            boxShadow:
              "0 10px 30px rgba(0,0,0,0.16)",
            zIndex: 5000,
          }}
        >
          <button
            type="button"
            onClick={() =>
              lancerAction("renommer")
            }
            style={menuButtonStyle}
          >
            ✏️ Renommer
          </button>

          <button
            type="button"
            onClick={() =>
              lancerAction("deplacer")
            }
            style={menuButtonStyle}
          >
            📁 Déplacer
          </button>

          <div
            style={{
              height: "1px",
              background: "#eee",
              margin: "5px 0",
            }}
          />

          <button
            type="button"
            onClick={() =>
              lancerAction("supprimer")
            }
            style={{
              ...menuButtonStyle,
              color: "#b42318",
            }}
          >
            🗑 Supprimer
          </button>
        </div>
      )}
    </>
  );
}

const menuButtonStyle = {
  width: "100%",
  border: "none",
  background: "transparent",
  textAlign: "left",
  padding: "9px 10px",
  borderRadius: "6px",
  cursor: "pointer",
};

export default CategorieTree;