import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  chargerProjets,
  chargerNotes,
  chargerTachesProjet,
} from "../utils/firestoreJoNote";

function PageCalendrierGlobal({
  onRetour,
  onOuvrirNote,
  onOuvrirProjet,
}) {
  const [elements, setElements] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [dateCourante, setDateCourante] = useState(() => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const charger = async () => {
    try {
      setChargement(true);
      setErreur("");

      const projets = await chargerProjets();
      const tousElements = [];

      for (const projet of projets) {
        const [notes, taches] = await Promise.all([
          chargerNotes(projet.id),
          chargerTachesProjet(projet.id),
        ]);

        notes.forEach((note) => {
          if (
            note.dansCalendrier === true &&
            (note.dateCalendrier || "").trim() !== ""
          ) {
            tousElements.push({
              id: `note-${projet.id}-${note.id}`,
              type: "note",
              projet,
              note,
              tache: null,
              titre: note.titre || "Sans titre",
              date: note.dateCalendrier,
              complete: false,
            });
          }
        });

        taches.forEach((tache) => {
          if ((tache.dateEcheance || "").trim() === "") {
            return;
          }

          const sousTaches = Array.isArray(tache.elements)
            ? tache.elements
            : [];

          tousElements.push({
            id: `tache-${projet.id}-${tache.id}`,
            type: "tache",
            projet,
            note: null,
            tache,
            titre: tache.titre || "Tâche sans titre",
            date: tache.dateEcheance,
            complete: tache.complete === true,
            progression:
              sousTaches.length > 0
                ? `${sousTaches.filter((element) => element.complete === true).length}/${sousTaches.length}`
                : "",
          });
        });
      }

      tousElements.sort((a, b) => {
        if (a.date !== b.date) {
          return a.date.localeCompare(b.date);
        }

        return a.titre.localeCompare(b.titre, "fr");
      });

      setElements(tousElements);
    } catch (error) {
      console.error("Erreur chargement calendrier global :", error);
      setErreur("Impossible de charger le calendrier global.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    charger();
  }, []);

  const obtenirCleDate = (annee, moisIndex, jour) => {
    const mois = String(moisIndex + 1).padStart(2, "0");
    const jourFormate = String(jour).padStart(2, "0");
    return `${annee}-${mois}-${jourFormate}`;
  };

  const obtenirCleAujourdhui = () => {
    const date = new Date();
    return obtenirCleDate(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  };

  const moisNom = dateCourante.toLocaleDateString("fr-CA", {
    month: "long",
    year: "numeric",
  });

  const annee = dateCourante.getFullYear();
  const mois = dateCourante.getMonth();
  const premierJour = new Date(annee, mois, 1);
  const nombreJours = new Date(annee, mois + 1, 0).getDate();

  // JS: dimanche=0. On veut lundi=0.
  const decalagePremierJour = (premierJour.getDay() + 6) % 7;

  const cellules = [];

  for (let index = 0; index < decalagePremierJour; index += 1) {
    cellules.push(null);
  }

  for (let jour = 1; jour <= nombreJours; jour += 1) {
    cellules.push(jour);
  }

  while (cellules.length % 7 !== 0) {
    cellules.push(null);
  }

  const elementsParDate = useMemo(() => {
    const map = new Map();

    elements.forEach((element) => {
      if (!map.has(element.date)) {
        map.set(element.date, []);
      }

      map.get(element.date).push(element);
    });

    return map;
  }, [elements]);

  const allerMoisPrecedent = () => {
    setDateCourante(
      new Date(
        dateCourante.getFullYear(),
        dateCourante.getMonth() - 1,
        1
      )
    );
  };

  const allerMoisSuivant = () => {
    setDateCourante(
      new Date(
        dateCourante.getFullYear(),
        dateCourante.getMonth() + 1,
        1
      )
    );
  };

  const allerAujourdhui = () => {
    const date = new Date();
    setDateCourante(new Date(date.getFullYear(), date.getMonth(), 1));
  };

  const ouvrirElement = (element) => {
    if (element.type === "tache") {
      onOuvrirProjet?.({
        ...element.projet,
        jonoteOngletInitial: "taches",
        jonoteTacheId: element.tache.id,
      });
      return;
    }

    onOuvrirNote?.(element.projet, element.note);
  };

  const totalMois = elements.filter((element) => {
    const prefixe = `${annee}-${String(mois + 1).padStart(2, "0")}-`;
    return element.date.startsWith(prefixe);
  }).length;

  return (
    <div
      style={{
        padding: "26px 32px 42px",
        background: "#fafafa",
        minHeight: "100%",
      }}
    >
      <div
        style={{
          maxWidth: "1450px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "18px",
          }}
        >
          <div>
            <button
              type="button"
              onClick={onRetour}
              style={{
                marginBottom: "12px",
              }}
            >
              ← Retour à l'aperçu global
            </button>

            <h1
              style={{
                margin: "0 0 4px",
                fontSize: "28px",
              }}
            >
              📅 Calendrier global
            </h1>

            <p
              style={{
                margin: 0,
                color: "#777",
                fontSize: "12px",
              }}
            >
              Toutes les notes planifiées et toutes les échéances de tâches de tes projets.
            </p>
          </div>

          <button
            type="button"
            onClick={charger}
            disabled={chargement}
          >
            ↻ Actualiser
          </button>
        </div>

        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "14px",
            background: "#fff",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              padding: "14px 16px",
              borderBottom: "1px solid #e6e6e6",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                flexWrap: "wrap",
              }}
            >
              <button type="button" onClick={allerMoisPrecedent}>
                ←
              </button>

              <button type="button" onClick={allerAujourdhui}>
                Aujourd'hui
              </button>

              <button type="button" onClick={allerMoisSuivant}>
                →
              </button>
            </div>

            <div
              style={{
                textAlign: "center",
              }}
            >
              <strong
                style={{
                  fontSize: "17px",
                  textTransform: "capitalize",
                }}
              >
                {moisNom}
              </strong>

              <div
                style={{
                  marginTop: "2px",
                  color: "#888",
                  fontSize: "10px",
                }}
              >
                {totalMois} élément{totalMois !== 1 ? "s" : ""} ce mois-ci
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                color: "#777",
                fontSize: "10px",
              }}
            >
              <span>📝 Note</span>
              <span>☑️ Tâche</span>
            </div>
          </div>

          {chargement && (
            <div
              style={{
                padding: "50px 20px",
                textAlign: "center",
                color: "#777",
              }}
            >
              Chargement du calendrier global...
            </div>
          )}

          {!chargement && erreur && (
            <div
              style={{
                margin: "16px",
                padding: "16px",
                border: "1px solid #e1aaaa",
                borderRadius: "9px",
                background: "#fff2f2",
              }}
            >
              {erreur}
            </div>
          )}

          {!chargement && !erreur && (
            <div
              style={{
                overflowX: "auto",
              }}
            >
              <div
                style={{
                  minWidth: "900px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(
                    (jour) => (
                      <div
                        key={jour}
                        style={{
                          padding: "9px",
                          textAlign: "center",
                          color: "#777",
                          fontSize: "10px",
                          fontWeight: "700",
                        }}
                      >
                        {jour}
                      </div>
                    )
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  }}
                >
                  {cellules.map((jour, index) => {
                    if (!jour) {
                      return (
                        <div
                          key={`vide-${index}`}
                          style={{
                            minHeight: "125px",
                            background: "#fafafa",
                            borderRight: "1px solid #eee",
                            borderBottom: "1px solid #eee",
                          }}
                        />
                      );
                    }

                    const cleDate = obtenirCleDate(annee, mois, jour);
                    const elementsJour = elementsParDate.get(cleDate) || [];
                    const estAujourdhui = cleDate === obtenirCleAujourdhui();

                    return (
                      <div
                        key={cleDate}
                        style={{
                          minHeight: "125px",
                          padding: "7px",
                          borderRight: "1px solid #eee",
                          borderBottom: "1px solid #eee",
                          background: estAujourdhui ? "#f8fbfd" : "#fff",
                        }}
                      >
                        <div
                          style={{
                            width: "25px",
                            height: "25px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "5px",
                            borderRadius: "999px",
                            background: estAujourdhui ? "#222" : "transparent",
                            color: estAujourdhui ? "#fff" : "#555",
                            fontSize: "11px",
                            fontWeight: "700",
                          }}
                        >
                          {jour}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px",
                          }}
                        >
                          {elementsJour.map((element) => (
                            <button
                              key={element.id}
                              type="button"
                              onClick={() => ouvrirElement(element)}
                              style={{
                                width: "100%",
                                padding: "5px 6px",
                                border: element.type === "tache"
                                  ? "1px solid #dfe3e6"
                                  : "1px solid #e2e8ec",
                                borderRadius: "6px",
                                background: element.complete
                                  ? "#f3f3f3"
                                  : element.type === "tache"
                                  ? "#fbfbfb"
                                  : "#f7fafc",
                                textAlign: "left",
                                cursor: "pointer",
                                fontFamily: "inherit",
                                opacity: element.complete ? 0.72 : 1,
                              }}
                            >
                              <div
                                style={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  fontSize: "9px",
                                  fontWeight: "700",
                                  color: element.complete ? "#888" : "#333",
                                  textDecoration: element.complete
                                    ? "line-through"
                                    : "none",
                                }}
                              >
                                {element.type === "tache" ? "☑️ " : "📝 "}
                                {element.titre}
                              </div>

                              <div
                                style={{
                                  marginTop: "2px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  color: "#999",
                                  fontSize: "8px",
                                }}
                              >
                                {element.projet.nom}
                                {element.type === "tache" && element.progression
                                  ? ` • ${element.progression}`
                                  : ""}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageCalendrierGlobal;