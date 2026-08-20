import { useEffect, useState } from "react";

import NouveauProjetModal from "../components/NouveauProjetModal";
import {
  chargerProjets,
  creerProjet,
} from "../utils/firestoreJoNote";

function PageAccueil({ onOuvrirProjet }) {
  const [projets, setProjets] = useState([]);
  const [modalOuvert, setModalOuvert] = useState(false);
  const [chargement, setChargement] = useState(true);

  const loadProjets = async () => {
    try {
      setChargement(true);

      const projetsFirebase = await chargerProjets();

      setProjets(projetsFirebase);
    } catch (error) {
      console.error("Erreur chargement projets :", error);
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    loadProjets();
  }, []);

  const handleCreerProjet = async ({
    nom,
    description,
  }) => {
    try {
      await creerProjet(nom, description);

      await loadProjets();
    } catch (error) {
      console.error("Erreur création projet :", error);
    }
  };

  return (
    <div
      style={{
        padding: "40px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div>
          <h1
            style={{
              marginBottom: "8px",
            }}
          >
            JoNote
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
            }}
          >
            Tes projets et sujets
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOuvert(true)}
        >
          + Nouveau projet
        </button>
      </div>

      {chargement && (
        <p>Chargement des projets...</p>
      )}

      {!chargement && projets.length === 0 && (
        <div
          style={{
            border: "1px dashed #ccc",
            borderRadius: "12px",
            padding: "30px",
          }}
        >
          <h3
            style={{
              marginTop: 0,
            }}
          >
            Aucun projet
          </h3>

          <p>
            Crée ton premier projet ou sujet dans JoNote.
          </p>

          <button
            type="button"
            onClick={() => setModalOuvert(true)}
          >
            + Créer un projet
          </button>
        </div>
      )}

      {!chargement && projets.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          {projets.map((projet) => (
            <button
              key={projet.id}
              type="button"
              onClick={() => onOuvrirProjet(projet)}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "20px",
                background: "white",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "8px",
                }}
              >
                {projet.nom}
              </h3>

              {projet.description && (
                <p
                  style={{
                    margin: 0,
                    color: "#666",
                  }}
                >
                  {projet.description}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      <NouveauProjetModal
        ouvert={modalOuvert}
        onFermer={() => setModalOuvert(false)}
        onCreer={handleCreerProjet}
      />
    </div>
  );
}

export default PageAccueil;