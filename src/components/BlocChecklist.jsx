import { useEffect, useRef, useState } from "react";

function BlocChecklist({
  bloc,
  onModifier,
  onSupprimer,
}) {
  const [elements, setElements] = useState(
    bloc.elements || []
  );

  const timerRef = useRef(null);

  useEffect(() => {
    setElements(bloc.elements || []);
  }, [bloc.id, bloc.elements]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const sauvegarder = (nouveauxElements) => {
    setElements(nouveauxElements);

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onModifier(
        bloc.id,
        nouveauxElements
      );
    }, 500);
  };

  const modifierTexte = (
    elementId,
    texte
  ) => {
    const nouveauxElements =
      elements.map((element) =>
        element.id === elementId
          ? {
              ...element,
              texte,
            }
          : element
      );

    sauvegarder(nouveauxElements);
  };

  const toggleComplete = (
    elementId
  ) => {
    const nouveauxElements =
      elements.map((element) =>
        element.id === elementId
          ? {
              ...element,
              complete:
                !element.complete,
            }
          : element
      );

    sauvegarder(nouveauxElements);
  };

  const ajouterElement = () => {
    const nouveauxElements = [
      ...elements,
      {
        id: crypto.randomUUID(),
        texte: "",
        complete: false,
      },
    ];

    sauvegarder(nouveauxElements);
  };

  const supprimerElement = (
    elementId
  ) => {
    const nouveauxElements =
      elements.filter(
        (element) =>
          element.id !== elementId
      );

    sauvegarder(nouveauxElements);
  };

  return (
    <div
      style={{
        border: "1px solid #e2e2e2",
        borderRadius: "12px",
        padding: "18px",
        background: "#fff",
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
        }}
      >
        <strong>
          Checklist
        </strong>

        <button
          type="button"
          onClick={() =>
            onSupprimer(bloc.id)
          }
        >
          Supprimer
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {elements.map((element) => (
          <div
            key={element.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <input
              type="checkbox"
              checked={
                element.complete
              }
              onChange={() =>
                toggleComplete(
                  element.id
                )
              }
            />

            <input
              type="text"
              value={element.texte}
              onChange={(e) =>
                modifierTexte(
                  element.id,
                  e.target.value
                )
              }
              placeholder="Nouvelle tâche..."
              style={{
                flex: 1,
                border: "none",
                borderBottom:
                  "1px solid #ddd",
                outline: "none",
                padding: "8px 4px",
                fontSize: "15px",
                textDecoration:
                  element.complete
                    ? "line-through"
                    : "none",
                opacity:
                  element.complete
                    ? 0.6
                    : 1,
              }}
            />

            <button
              type="button"
              onClick={() =>
                supprimerElement(
                  element.id
                )
              }
              title="Supprimer l'élément"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={ajouterElement}
        style={{
          marginTop: "14px",
        }}
      >
        + Ajouter une tâche
      </button>
    </div>
  );
}

export default BlocChecklist;