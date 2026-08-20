import {
  useEffect,
  useRef,
  useState,
} from "react";

function BlocImportant({
  bloc,
  onModifier,
  onSupprimer,
}) {
  const [contenu, setContenu] =
    useState(bloc.contenu || "");

  const [niveau, setNiveau] =
    useState(
      bloc.niveau || "important"
    );

  const timerRef = useRef(null);

  useEffect(() => {
    setContenu(
      bloc.contenu || ""
    );

    setNiveau(
      bloc.niveau || "important"
    );
  }, [
    bloc.id,
    bloc.contenu,
    bloc.niveau,
  ]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(
          timerRef.current
        );
      }
    };
  }, []);

  const niveaux = {
    critique: {
      icone: "🔴",
      nom: "Critique",
      fond: "#fff1f1",
      bordure: "#e7a3a3",
    },

    important: {
      icone: "🟠",
      nom: "Important",
      fond: "#fff7ea",
      bordure: "#e8bd7c",
    },

    retenir: {
      icone: "🟡",
      nom: "À retenir",
      fond: "#fffbea",
      bordure: "#ddd07c",
    },

    information: {
      icone: "🔵",
      nom: "Information",
      fond: "#eef7ff",
      bordure: "#9dc7e8",
    },
  };

  const apparence =
    niveaux[niveau] ||
    niveaux.important;

  const sauvegarder = (
    nouveauContenu,
    nouveauNiveau
  ) => {
    if (timerRef.current) {
      clearTimeout(
        timerRef.current
      );
    }

    timerRef.current =
      setTimeout(() => {
        onModifier(
          bloc.id,
          {
            contenu:
              nouveauContenu,
            niveau:
              nouveauNiveau,
          }
        );
      }, 500);
  };

  const handleContenu = (e) => {
    const valeur =
      e.target.value;

    setContenu(valeur);

    sauvegarder(
      valeur,
      niveau
    );
  };

  const handleNiveau = (e) => {
    const valeur =
      e.target.value;

    setNiveau(valeur);

    sauvegarder(
      contenu,
      valeur
    );
  };

  return (
    <div
      style={{
        border: `1px solid ${apparence.bordure}`,
        borderRadius: "12px",
        padding: "18px",
        background:
          apparence.fond,
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: "12px",
          marginBottom: "14px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <strong>
            {apparence.icone}{" "}
            {apparence.nom}
          </strong>

          <select
            value={niveau}
            onChange={
              handleNiveau
            }
          >
            <option value="critique">
              🔴 Critique
            </option>

            <option value="important">
              🟠 Important
            </option>

            <option value="retenir">
              🟡 À retenir
            </option>

            <option value="information">
              🔵 Information
            </option>
          </select>
        </div>

        <button
          type="button"
          onClick={() =>
            onSupprimer(bloc.id)
          }
        >
          Supprimer
        </button>
      </div>

      <textarea
        value={contenu}
        onChange={
          handleContenu
        }
        placeholder="Écris l'information importante ici..."
        rows={4}
        style={{
          width: "100%",
          boxSizing: "border-box",
          border:
            "1px solid rgba(0, 0, 0, 0.12)",
          borderRadius: "8px",
          outline: "none",
          resize: "vertical",
          padding: "12px",
          fontFamily: "inherit",
          fontSize: "16px",
          lineHeight: 1.5,
          background:
            "rgba(255,255,255,0.75)",
        }}
      />
    </div>
  );
}

export default BlocImportant;