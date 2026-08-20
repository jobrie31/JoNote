import {
  useEffect,
  useRef,
  useState,
} from "react";

function BlocLien({
  bloc,
  onModifier,
  onSupprimer,
}) {
  const [titre, setTitre] = useState(
    bloc.titre || ""
  );

  const [url, setUrl] = useState(
    bloc.url || ""
  );

  const [
    description,
    setDescription,
  ] = useState(
    bloc.description || ""
  );

  const timerRef = useRef(null);

  useEffect(() => {
    setTitre(bloc.titre || "");
    setUrl(bloc.url || "");
    setDescription(
      bloc.description || ""
    );
  }, [bloc.id]);

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
    nouvellesDonnees
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
          nouvellesDonnees
        );
      }, 500);
  };

  const handleTitre = (e) => {
    const valeur =
      e.target.value;

    setTitre(valeur);

    sauvegarder({
      titre: valeur,
      url,
      description,
    });
  };

  const handleUrl = (e) => {
    const valeur =
      e.target.value;

    setUrl(valeur);

    sauvegarder({
      titre,
      url: valeur,
      description,
    });
  };

  const handleDescription = (e) => {
    const valeur =
      e.target.value;

    setDescription(valeur);

    sauvegarder({
      titre,
      url,
      description: valeur,
    });
  };

  const obtenirUrlValide = () => {
    const valeur =
      url.trim();

    if (!valeur) {
      return "";
    }

    if (
      valeur.startsWith(
        "http://"
      ) ||
      valeur.startsWith(
        "https://"
      )
    ) {
      return valeur;
    }

    return `https://${valeur}`;
  };

  const ouvrirLien = () => {
    const urlFinale =
      obtenirUrlValide();

    if (!urlFinale) {
      return;
    }

    window.open(
      urlFinale,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div
      style={{
        border:
          "1px solid #e2e2e2",
        borderRadius: "12px",
        padding: "18px",
        background: "#fff",
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
          marginBottom: "16px",
        }}
      >
        <strong>
          🔗 Lien
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
          gap: "12px",
        }}
      >
        <input
          type="text"
          value={titre}
          onChange={handleTitre}
          placeholder="Titre du lien"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px",
            fontSize: "16px",
            fontWeight: "600",
          }}
        />

        <input
          type="text"
          value={url}
          onChange={handleUrl}
          placeholder="https://..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px",
          }}
        />

        <textarea
          value={description}
          onChange={
            handleDescription
          }
          placeholder="Description facultative..."
          rows={3}
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent:
              "flex-end",
          }}
        >
          <button
            type="button"
            onClick={ouvrirLien}
            disabled={!url.trim()}
          >
            Ouvrir le lien ↗
          </button>
        </div>
      </div>
    </div>
  );
}

export default BlocLien;