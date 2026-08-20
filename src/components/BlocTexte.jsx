import {
  useEffect,
  useRef,
  useState,
} from "react";

function BlocTexte({
  bloc,
  onModifier,
  onSupprimer,
}) {
  const [contenu, setContenu] =
    useState(bloc.contenu || "");

  const [important, setImportant] =
    useState(
      bloc.important === true
    );

  const timerRef = useRef(null);

  useEffect(() => {
    setContenu(
      bloc.contenu || ""
    );

    setImportant(
      bloc.important === true
    );
  }, [
    bloc.id,
    bloc.contenu,
    bloc.important,
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

  const sauvegarder = (
    nouveauContenu,
    nouvelImportant
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
          nouveauContenu,
          nouvelImportant
        );
      }, 600);
  };

  const handleContenuChange = (
    e
  ) => {
    const valeur =
      e.target.value;

    setContenu(valeur);

    sauvegarder(
      valeur,
      important
    );
  };

  const handleImportantChange = (
    e
  ) => {
    const valeur =
      e.target.value ===
      "important";

    setImportant(valeur);

    sauvegarder(
      contenu,
      valeur
    );
  };

  return (
    <div
      style={{
        border: important
          ? "1px solid #e0b74f"
          : "1px solid #e2e2e2",
        borderRadius: "12px",
        padding: "16px",
        background: important
          ? "#fffbed"
          : "#fff",
        marginBottom: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "10px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <strong>
            Texte
          </strong>

          <select
            value={
              important
                ? "important"
                : "normal"
            }
            onChange={
              handleImportantChange
            }
            style={{
              padding: "5px 8px",
              border:
                "1px solid #ccc",
              borderRadius: "7px",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            <option value="normal">
              Normal
            </option>

            <option value="important">
              ⭐ Important
            </option>
          </select>

          {important && (
            <span
              style={{
                fontWeight: "600",
              }}
            >
              ⭐ Important
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            onSupprimer(
              bloc.id
            )
          }
        >
          Supprimer
        </button>
      </div>

      <textarea
        value={contenu}
        onChange={
          handleContenuChange
        }
        placeholder="Écris ton texte ici..."
        rows={5}
        style={{
          width: "100%",
          boxSizing:
            "border-box",
          resize: "vertical",
          border:
            "1px solid #ddd",
          borderRadius: "8px",
          outline: "none",
          padding: "12px",
          fontFamily: "inherit",
          fontSize: "16px",
          lineHeight: 1.5,
          background:
            "transparent",
        }}
      />
    </div>
  );
}

export default BlocTexte;