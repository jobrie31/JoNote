import { useEffect, useState } from "react";

import {
  chargerTachesProjet,
  creerTacheProjet,
  modifierTacheProjet,
  supprimerTacheProjet,
} from "../utils/firestoreJoNote";

const nouvelElement = () => ({
  id: crypto.randomUUID(),
  texte: "",
  complete: false,
  termineeLe: "",
  noteConfirmation: "",
});

function PageTaches({ projet, tacheAOuvrirId = null }) {
  const [taches, setTaches] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");

  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [titre, setTitre] = useState("");
  const [elements, setElements] = useState([nouvelElement()]);
  const [dateEcheance, setDateEcheance] = useState("");
  const [joursJaune, setJoursJaune] = useState(7);
  const [joursRouge, setJoursRouge] = useState(2);
  const [creationEnCours, setCreationEnCours] = useState(false);

  const [tacheOuverteId, setTacheOuverteId] = useState(
    tacheAOuvrirId || null
  );

  const [editionId, setEditionId] = useState(null);
  const [titreEdition, setTitreEdition] = useState("");
  const [elementsEdition, setElementsEdition] = useState([]);
  const [sauvegardeEdition, setSauvegardeEdition] = useState(false);

  const [termineesOuvertes, setTermineesOuvertes] = useState(false);

  const charger = async () => {
    try {
      setChargement(true);
      setErreur("");

      const resultat = await chargerTachesProjet(projet.id);

      setTaches(resultat);
    } catch (error) {
      console.error("Erreur chargement tâches :", error);

      setErreur("Impossible de charger les tâches.");
    } finally {
      setChargement(false);
    }
  };

  useEffect(() => {
    if (!projet?.id) {
      return;
    }

    charger();
  }, [projet?.id]);

  useEffect(() => {
    if (!tacheAOuvrirId) {
      return;
    }

    setTacheOuverteId(tacheAOuvrirId);

    const cible = taches.find(
      (tache) => tache.id === tacheAOuvrirId
    );

    if (cible?.complete) {
      setTermineesOuvertes(true);
    }
  }, [tacheAOuvrirId, taches]);

  const obtenirDate = (valeur) => {
    if (!valeur) {
      return null;
    }

    const [annee, mois, jour] = valeur.split("-");

    if (!annee || !mois || !jour) {
      return null;
    }

    return new Date(
      Number(annee),
      Number(mois) - 1,
      Number(jour)
    );
  };

  const formaterDate = (valeur) => {
    const date = obtenirDate(valeur);

    if (!date) {
      return "";
    }

    return date.toLocaleDateString("fr-CA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formaterDateTerminee = (valeur) => {
    if (!valeur) {
      return "";
    }

    const date = new Date(valeur);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("fr-CA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const obtenirEtat = (tache) => {
    if (tache.complete || !tache.dateEcheance) {
      return {
        niveau: "normal",
        jours: null,
      };
    }

    const echeance = obtenirDate(tache.dateEcheance);

    if (!echeance) {
      return {
        niveau: "normal",
        jours: null,
      };
    }

    const maintenant = new Date();

    maintenant.setHours(0, 0, 0, 0);
    echeance.setHours(0, 0, 0, 0);

    const jours = Math.ceil(
      (echeance.getTime() - maintenant.getTime()) / 86400000
    );

    const jaune = Number(tache.joursJaune ?? 7);
    const rouge = Number(tache.joursRouge ?? 2);

    if (jours <= rouge) {
      return {
        niveau: "rouge",
        jours,
      };
    }

    if (jours <= jaune) {
      return {
        niveau: "jaune",
        jours,
      };
    }

    return {
      niveau: "normal",
      jours,
    };
  };

  const obtenirTexteEtat = (tache) => {
    const etat = obtenirEtat(tache);

    if (etat.jours === null) {
      return "";
    }

    if (etat.jours < 0) {
      const nombre = Math.abs(etat.jours);

      return `En retard de ${nombre} jour${
        nombre !== 1 ? "s" : ""
      }`;
    }

    if (etat.jours === 0) {
      return "Aujourd'hui";
    }

    if (etat.jours === 1) {
      return "Demain";
    }

    return `Dans ${etat.jours} jours`;
  };

  const reinitialiser = () => {
    setTitre("");
    setElements([nouvelElement()]);
    setDateEcheance("");
    setJoursJaune(7);
    setJoursRouge(2);
  };

  const ajouterElement = () => {
    setElements((actuels) => [
      ...actuels,
      nouvelElement(),
    ]);
  };

  const modifierElement = (id, texte) => {
    setElements((actuels) =>
      actuels.map((element) =>
        element.id === id
          ? {
              ...element,
              texte,
            }
          : element
      )
    );
  };

  const supprimerElement = (id) => {
    setElements((actuels) => {
      const restant = actuels.filter(
        (element) => element.id !== id
      );

      if (restant.length > 0) {
        return restant;
      }

      return [nouvelElement()];
    });
  };

  const creer = async () => {
    const titreNettoye = titre.trim();

    if (!titreNettoye) {
      window.alert("Entre un titre pour la tâche.");
      return;
    }

    const elementsNettoyes = elements
      .map((element) => ({
        ...element,
        texte: (element.texte || "").trim(),
      }))
      .filter((element) => element.texte);

    try {
      setCreationEnCours(true);

      await creerTacheProjet(projet.id, {
        titre: titreNettoye,
        elements: elementsNettoyes,
        dateEcheance,
        joursJaune: Number(joursJaune),
        joursRouge: Number(joursRouge),
      });

      reinitialiser();
      setFormulaireOuvert(false);

      await charger();
    } catch (error) {
      console.error("Erreur création tâche :", error);

      window.alert("Impossible de créer la tâche.");
    } finally {
      setCreationEnCours(false);
    }
  };

  const calculerComplete = (nouveauxElements) => {
    if (nouveauxElements.length === 0) {
      return false;
    }

    return nouveauxElements.every(
      (element) => element.complete === true
    );
  };

  const toggleSousTache = async (tache, elementId) => {
    const maintenant = new Date().toISOString();

    const nouveauxElements = (tache.elements || []).map(
      (element) => {
        if (element.id !== elementId) {
          return element;
        }

        const nouvelEtat = !element.complete;

        return {
          ...element,
          complete: nouvelEtat,
          termineeLe: nouvelEtat ? maintenant : "",
        };
      }
    );

    const complete = calculerComplete(nouveauxElements);

    let termineeLe = tache.termineeLe || "";

    if (complete && !tache.complete) {
      termineeLe = maintenant;
    }

    if (!complete) {
      termineeLe = "";
    }

    setTaches((actuelles) =>
      actuelles.map((item) =>
        item.id === tache.id
          ? {
              ...item,
              elements: nouveauxElements,
              complete,
              termineeLe,
            }
          : item
      )
    );

    if (complete) {
      setTermineesOuvertes(true);
    }

    try {
      await modifierTacheProjet(projet.id, tache.id, {
        elements: nouveauxElements,
        complete,
        termineeLe,
      });
    } catch (error) {
      console.error("Erreur modification sous-tâche :", error);

      await charger();
    }
  };

  const toggleTacheComplete = async (tache) => {
    const nouvelEtat = !tache.complete;
    const maintenant = new Date().toISOString();

    const nouveauxElements = (tache.elements || []).map(
      (element) => ({
        ...element,
        complete: nouvelEtat,
        termineeLe: nouvelEtat
          ? element.termineeLe || maintenant
          : "",
      })
    );

    const termineeLe = nouvelEtat ? maintenant : "";

    setTaches((actuelles) =>
      actuelles.map((item) =>
        item.id === tache.id
          ? {
              ...item,
              complete: nouvelEtat,
              elements: nouveauxElements,
              termineeLe,
            }
          : item
      )
    );

    if (nouvelEtat) {
      setTermineesOuvertes(true);
    }

    try {
      await modifierTacheProjet(projet.id, tache.id, {
        complete: nouvelEtat,
        elements: nouveauxElements,
        termineeLe,
      });
    } catch (error) {
      console.error("Erreur modification tâche :", error);

      await charger();
    }
  };

  const modifierNoteConfirmationLocale = (
    tacheId,
    elementId,
    valeur
  ) => {
    setTaches((actuelles) =>
      actuelles.map((tache) => {
        if (tache.id !== tacheId) {
          return tache;
        }

        return {
          ...tache,

          elements: (tache.elements || []).map(
            (element) =>
              element.id === elementId
                ? {
                    ...element,
                    noteConfirmation: valeur,
                  }
                : element
          ),
        };
      })
    );
  };

  const sauvegarderNoteConfirmation = async (tache) => {
    const tacheLocale = taches.find(
      (item) => item.id === tache.id
    );

    if (!tacheLocale) {
      return;
    }

    try {
      await modifierTacheProjet(projet.id, tache.id, {
        elements: tacheLocale.elements || [],
      });
    } catch (error) {
      console.error(
        "Erreur sauvegarde note de confirmation :",
        error
      );

      await charger();
    }
  };

  const modifierNotePrincipaleLocale = (
    tacheId,
    valeur
  ) => {
    setTaches((actuelles) =>
      actuelles.map((tache) =>
        tache.id === tacheId
          ? {
              ...tache,
              noteConfirmation: valeur,
            }
          : tache
      )
    );
  };

  const sauvegarderNotePrincipale = async (tache) => {
    const tacheLocale = taches.find(
      (item) => item.id === tache.id
    );

    if (!tacheLocale) {
      return;
    }

    try {
      await modifierTacheProjet(projet.id, tache.id, {
        noteConfirmation:
          tacheLocale.noteConfirmation || "",
      });
    } catch (error) {
      console.error(
        "Erreur sauvegarde confirmation tâche principale :",
        error
      );

      await charger();
    }
  };

  const supprimerTache = async (tache) => {
    const confirmation = window.confirm(
      `Supprimer la tâche « ${tache.titre} » ?`
    );

    if (!confirmation) {
      return;
    }

    try {
      await supprimerTacheProjet(
        projet.id,
        tache.id
      );

      setTaches((actuelles) =>
        actuelles.filter(
          (item) => item.id !== tache.id
        )
      );

      if (editionId === tache.id) {
        setEditionId(null);
      }

      if (tacheOuverteId === tache.id) {
        setTacheOuverteId(null);
      }
    } catch (error) {
      console.error("Erreur suppression tâche :", error);
    }
  };

  const modifierEcheance = async (
    tache,
    champ,
    valeur
  ) => {
    let valeurFinale = valeur;

    if (
      champ === "joursJaune" ||
      champ === "joursRouge"
    ) {
      valeurFinale = Math.max(
        0,
        Number(valeur) || 0
      );
    }

    setTaches((actuelles) =>
      actuelles.map((item) =>
        item.id === tache.id
          ? {
              ...item,
              [champ]: valeurFinale,
            }
          : item
      )
    );

    try {
      await modifierTacheProjet(
        projet.id,
        tache.id,
        {
          [champ]: valeurFinale,
        }
      );
    } catch (error) {
      console.error("Erreur échéance :", error);

      await charger();
    }
  };

  const demarrerEdition = (tache) => {
    setTacheOuverteId(tache.id);

    setEditionId(tache.id);

    setTitreEdition(
      tache.titre || ""
    );

    setElementsEdition(
      Array.isArray(tache.elements)
        ? tache.elements.map(
            (element) => ({
              ...element,
              noteConfirmation:
                element.noteConfirmation || "",
              termineeLe:
                element.termineeLe || "",
            })
          )
        : []
    );
  };

  const annulerEdition = () => {
    setEditionId(null);
    setTitreEdition("");
    setElementsEdition([]);
  };

  const ajouterElementEdition = () => {
    setElementsEdition((actuels) => [
      ...actuels,
      nouvelElement(),
    ]);
  };

  const modifierElementEdition = (
    id,
    texte
  ) => {
    setElementsEdition((actuels) =>
      actuels.map((element) =>
        element.id === id
          ? {
              ...element,
              texte,
            }
          : element
      )
    );
  };

  const supprimerElementEdition = (id) => {
    setElementsEdition((actuels) =>
      actuels.filter(
        (element) => element.id !== id
      )
    );
  };

  const sauvegarderModification = async (
    tache
  ) => {
    const titreNettoye =
      titreEdition.trim();

    if (!titreNettoye) {
      window.alert(
        "Le titre de la tâche ne peut pas être vide."
      );

      return;
    }

    const elementsNettoyes =
      elementsEdition
        .map((element) => ({
          ...element,

          texte:
            (
              element.texte ||
              ""
            ).trim(),

          noteConfirmation:
            element.noteConfirmation ||
            "",

          termineeLe:
            element.termineeLe ||
            "",
        }))
        .filter(
          (element) =>
            element.texte
        );

    let complete =
      tache.complete === true;

    let termineeLe =
      tache.termineeLe || "";

    if (
      elementsNettoyes.length >
      0
    ) {
      complete =
        elementsNettoyes.every(
          (element) =>
            element.complete === true
        );

      if (
        complete &&
        !termineeLe
      ) {
        termineeLe =
          new Date().toISOString();
      }

      if (!complete) {
        termineeLe = "";
      }
    }

    const miseAJour = {
      titre: titreNettoye,
      elements: elementsNettoyes,
      complete,
      termineeLe,
    };

    setTaches((actuelles) =>
      actuelles.map((item) =>
        item.id === tache.id
          ? {
              ...item,
              ...miseAJour,
            }
          : item
      )
    );

    if (complete) {
      setTermineesOuvertes(true);
    }

    try {
      setSauvegardeEdition(true);

      await modifierTacheProjet(
        projet.id,
        tache.id,
        miseAJour
      );

      annulerEdition();
    } catch (error) {
      console.error(
        "Erreur modification de la tâche :",
        error
      );

      window.alert(
        "Impossible de modifier la tâche."
      );

      await charger();
    } finally {
      setSauvegardeEdition(false);
    }
  };

  const trierTachesActives = (
    liste
  ) => {
    return [...liste].sort(
      (a, b) => {
        const etatA =
          obtenirEtat(a);

        const etatB =
          obtenirEtat(b);

        const ordre = {
          rouge: 0,
          jaune: 1,
          normal: 2,
        };

        if (
          ordre[etatA.niveau] !==
          ordre[etatB.niveau]
        ) {
          return (
            ordre[etatA.niveau] -
            ordre[etatB.niveau]
          );
        }

        if (
          a.dateEcheance &&
          b.dateEcheance
        ) {
          return a.dateEcheance.localeCompare(
            b.dateEcheance
          );
        }

        if (a.dateEcheance) {
          return -1;
        }

        if (b.dateEcheance) {
          return 1;
        }

        return 0;
      }
    );
  };

  const trierTachesTerminees = (
    liste
  ) => {
    return [...liste].sort(
      (a, b) => {
        const dateA =
          a.termineeLe
            ? new Date(
                a.termineeLe
              ).getTime()
            : 0;

        const dateB =
          b.termineeLe
            ? new Date(
                b.termineeLe
              ).getTime()
            : 0;

        return dateB - dateA;
      }
    );
  };

  const tachesAFaire =
    trierTachesActives(
      taches.filter(
        (tache) =>
          !tache.complete
      )
    );

  const tachesTerminees =
    trierTachesTerminees(
      taches.filter(
        (tache) =>
          tache.complete
      )
    );

  const rendreTache = (tache) => {
    const etat =
      obtenirEtat(tache);

    const elementsTache =
      Array.isArray(
        tache.elements
      )
        ? tache.elements
        : [];

    const terminees =
      elementsTache.filter(
        (element) =>
          element.complete
      ).length;

    const ouverte =
      tacheOuverteId ===
      tache.id;

    const enEdition =
      editionId ===
      tache.id;

    let background =
      "#fff";

    let border =
      "1px solid #ddd";

    if (
      !tache.complete &&
      etat.niveau ===
        "jaune"
    ) {
      background =
        "#fffbea";

      border =
        "1px solid #dfcb70";
    }

    if (
      !tache.complete &&
      etat.niveau ===
        "rouge"
    ) {
      background =
        "#fff0f0";

      border =
        "1px solid #dc8e8e";
    }

    if (
      tache.complete
    ) {
      background =
        "#f7f7f7";

      border =
        "1px solid #e1e1e1";
    }

    return (
      <div
        key={
          tache.id
        }
        style={{
          border,

          borderRadius:
            "10px",

          background,

          padding:
            "10px 12px",
        }}
      >
        <div
          style={{
            display:
              "flex",

            alignItems:
              "center",

            gap:
              "10px",
          }}
        >
          <input
            type="checkbox"
            checked={
              tache.complete ===
              true
            }
            onChange={() =>
              toggleTacheComplete(
                tache
              )
            }
          />

          <button
            type="button"
            onClick={() =>
              setTacheOuverteId(
                ouverte
                  ? null
                  : tache.id
              )
            }
            style={{
              flex:
                1,

              border:
                "none",

              background:
                "transparent",

              padding:
                0,

              textAlign:
                "left",

              cursor:
                "pointer",
            }}
          >
            <div
              style={{
                display:
                  "flex",

                justifyContent:
                  "space-between",

                alignItems:
                  "center",

                gap:
                  "15px",
              }}
            >
              <div
                style={{
                  minWidth:
                    0,
                }}
              >
                <div
                  style={{
                    fontWeight:
                      "700",

                    color:
                      tache.complete
                        ? "#888"
                        : "#222",

                    textDecoration:
                      tache.complete
                        ? "line-through"
                        : "none",
                  }}
                >
                  {tache.titre ||
                    "Sans titre"}
                </div>

                <div
                  style={{
                    marginTop:
                      "3px",

                    color:
                      "#777",

                    fontSize:
                      "10px",
                  }}
                >
                  {terminees} /{" "}
                  {
                    elementsTache.length
                  }{" "}
                  terminée
                  {elementsTache.length !==
                  1
                    ? "s"
                    : ""}
                </div>
              </div>

              <div
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  gap:
                    "8px",

                  flexWrap:
                    "wrap",

                  justifyContent:
                    "flex-end",
                }}
              >
                {tache.dateEcheance && (
                  <>
                    <span
                      style={{
                        fontSize:
                          "10px",
                      }}
                    >
                      📅{" "}
                      {formaterDate(
                        tache.dateEcheance
                      )}
                    </span>

                    {!tache.complete && (
                      <span
                        style={{
                          fontSize:
                            "9px",

                          fontWeight:
                            "600",

                          color:
                            etat.niveau ===
                            "rouge"
                              ? "#a52d2d"
                              : etat.niveau ===
                                "jaune"
                              ? "#766513"
                              : "#777",
                        }}
                      >
                        {obtenirTexteEtat(
                          tache
                        )}
                      </span>
                    )}
                  </>
                )}

                <span>
                  {ouverte
                    ? "▲"
                    : "▼"}
                </span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() =>
              supprimerTache(
                tache
              )
            }
            title="Supprimer"
          >
            🗑
          </button>
        </div>

        {tache.complete && (
          <div
            style={{
              marginTop:
                "5px",

              marginLeft:
                "28px",

              display:
                "flex",

              alignItems:
                "center",

              gap:
                "7px",

              flexWrap:
                "wrap",
            }}
          >
            {tache.termineeLe && (
              <span
                style={{
                  color:
                    "#777",

                  fontSize:
                    "9px",

                  whiteSpace:
                    "nowrap",
                }}
              >
                ✓{" "}
                {formaterDateTerminee(
                  tache.termineeLe
                )}
              </span>
            )}

            <input
              type="text"
              value={
                tache.noteConfirmation ||
                ""
              }
              onChange={(e) =>
                modifierNotePrincipaleLocale(
                  tache.id,
                  e.target.value
                )
              }
              onBlur={() =>
                sauvegarderNotePrincipale(
                  tache
                )
              }
              placeholder="Confirmation facultative..."
              style={{
                flex:
                  "0 1 360px",

                minWidth:
                  "180px",

                maxWidth:
                  "360px",

                padding:
                  "3px 6px",

                border:
                  "1px solid #ddd",

                borderRadius:
                  "5px",

                background:
                  "#fff",

                fontSize:
                  "9px",

                outline:
                  "none",
              }}
            />
          </div>
        )}

        {ouverte && (
          <div
            style={{
              marginTop:
                "10px",

              paddingTop:
                "10px",

              borderTop:
                "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                gap:
                  "10px",

                marginBottom:
                  "10px",
              }}
            >
              <strong
                style={{
                  fontSize:
                    "11px",
                }}
              >
                {enEdition
                  ? "Modifier la tâche"
                  : "Détails de la tâche"}
              </strong>

              {!enEdition && (
                <button
                  type="button"
                  onClick={() =>
                    demarrerEdition(
                      tache
                    )
                  }
                  style={{
                    padding:
                      "4px 8px",

                    fontSize:
                      "10px",
                  }}
                >
                  ✏️ Modifier
                </button>
              )}
            </div>

            {enEdition ? (
              <div
                style={{
                  padding:
                    "10px",

                  border:
                    "1px solid #ddd",

                  borderRadius:
                    "8px",

                  background:
                    "#fff",

                  marginBottom:
                    "12px",
                }}
              >
                <label
                  style={{
                    display:
                      "block",

                    fontSize:
                      "10px",

                    fontWeight:
                      "600",
                  }}
                >
                  Titre

                  <input
                    type="text"
                    value={
                      titreEdition
                    }
                    onChange={(e) =>
                      setTitreEdition(
                        e.target.value
                      )
                    }
                    style={{
                      display:
                        "block",

                      width:
                        "100%",

                      marginTop:
                        "4px",

                      padding:
                        "7px 8px",

                      border:
                        "1px solid #ccc",

                      borderRadius:
                        "6px",

                      fontSize:
                        "12px",
                    }}
                  />
                </label>

                <div
                  style={{
                    marginTop:
                      "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        "10px",

                      fontWeight:
                        "600",

                      marginBottom:
                        "6px",
                    }}
                  >
                    Sous-tâches
                  </div>

                  <div
                    style={{
                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap:
                        "6px",
                    }}
                  >
                    {elementsEdition.map(
                      (element) => (
                        <div
                          key={
                            element.id
                          }
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap:
                              "7px",
                          }}
                        >
                          <span
                            style={{
                              fontSize:
                                "11px",

                              color:
                                element.complete
                                  ? "#777"
                                  : "#333",
                            }}
                          >
                            {element.complete
                              ? "☑"
                              : "☐"}
                          </span>

                          <input
                            type="text"
                            value={
                              element.texte
                            }
                            onChange={(e) =>
                              modifierElementEdition(
                                element.id,
                                e.target.value
                              )
                            }
                            placeholder="Sous-tâche..."
                            style={{
                              flex:
                                1,

                              padding:
                                "6px 7px",

                              border:
                                "1px solid #ddd",

                              borderRadius:
                                "6px",

                              fontSize:
                                "11px",
                            }}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              supprimerElementEdition(
                                element.id
                              )
                            }
                            title="Supprimer la sous-tâche"
                            style={{
                              padding:
                                "4px 7px",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={
                      ajouterElementEdition
                    }
                    style={{
                      marginTop:
                        "7px",

                      padding:
                        "5px 8px",

                      fontSize:
                        "10px",
                    }}
                  >
                    + Ajouter une sous-tâche
                  </button>
                </div>

                <div
                  style={{
                    display:
                      "flex",

                    gap:
                      "7px",

                    marginTop:
                      "12px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      sauvegarderModification(
                        tache
                      )
                    }
                    disabled={
                      sauvegardeEdition
                    }
                  >
                    {sauvegardeEdition
                      ? "Sauvegarde..."
                      : "Enregistrer"}
                  </button>

                  <button
                    type="button"
                    onClick={
                      annulerEdition
                    }
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <>
                {elementsTache.length >
                0 ? (
                  <div
                    style={{
                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap:
                        "7px",

                      marginBottom:
                        "12px",
                    }}
                  >
                    {elementsTache.map(
                      (element) => (
                        <div
                          key={
                            element.id
                          }
                          style={{
                            padding:
                              element.complete
                                ? "6px 8px"
                                : "3px 0",

                            borderRadius:
                              "6px",

                            background:
                              element.complete
                                ? "rgba(255,255,255,0.55)"
                                : "transparent",
                          }}
                        >
                          <label
                            style={{
                              display:
                                "flex",

                              alignItems:
                                "center",

                              gap:
                                "8px",

                              fontSize:
                                "12px",

                              cursor:
                                "pointer",
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={
                                element.complete ===
                                true
                              }
                              onChange={() =>
                                toggleSousTache(
                                  tache,
                                  element.id
                                )
                              }
                            />

                            <span
                              style={{
                                textDecoration:
                                  element.complete
                                    ? "line-through"
                                    : "none",

                                color:
                                  element.complete
                                    ? "#888"
                                    : "#333",
                              }}
                            >
                              {
                                element.texte
                              }
                            </span>
                          </label>

                          {element.complete && (
                            <div
                              style={{
                                marginLeft:
                                  "26px",

                                marginTop:
                                  "4px",

                                display:
                                  "flex",

                                alignItems:
                                  "center",

                                gap:
                                  "7px",

                                flexWrap:
                                  "wrap",
                              }}
                            >
                              {element.termineeLe && (
                                <span
                                  style={{
                                    color:
                                      "#777",

                                    fontSize:
                                      "9px",

                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  ✓{" "}
                                  {formaterDateTerminee(
                                    element.termineeLe
                                  )}
                                </span>
                              )}

                              <input
                                type="text"
                                value={
                                  element.noteConfirmation ||
                                  ""
                                }
                                onChange={(e) =>
                                  modifierNoteConfirmationLocale(
                                    tache.id,
                                    element.id,
                                    e.target.value
                                  )
                                }
                                onBlur={() =>
                                  sauvegarderNoteConfirmation(
                                    tache
                                  )
                                }
                                placeholder="Confirmation facultative..."
                                style={{
                                  flex:
                                    "0 1 320px",

                                  minWidth:
                                    "170px",

                                  maxWidth:
                                    "320px",

                                  padding:
                                    "3px 6px",

                                  border:
                                    "1px solid #ddd",

                                  borderRadius:
                                    "5px",

                                  background:
                                    "#fff",

                                  fontSize:
                                    "9px",

                                  outline:
                                    "none",
                                }}
                              />
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      color:
                        "#999",

                      fontSize:
                        "11px",

                      marginBottom:
                        "12px",
                    }}
                  >
                    Aucune sous-tâche.
                  </div>
                )}
              </>
            )}

            <div
              style={{
                display:
                  "flex",

                gap:
                  "10px",

                alignItems:
                  "end",

                flexWrap:
                  "wrap",
              }}
            >
              <label
                style={{
                  fontSize:
                    "10px",
                }}
              >
                Échéance

                <input
                  type="date"
                  value={
                    tache.dateEcheance ||
                    ""
                  }
                  onChange={(e) =>
                    modifierEcheance(
                      tache,
                      "dateEcheance",
                      e.target.value
                    )
                  }
                  style={{
                    display:
                      "block",

                    marginTop:
                      "4px",

                    padding:
                      "5px",

                    border:
                      "1px solid #ccc",

                    borderRadius:
                      "6px",
                  }}
                />
              </label>

              {tache.dateEcheance && (
                <>
                  <label
                    style={{
                      fontSize:
                        "10px",
                    }}
                  >
                    🟡 Jaune

                    <input
                      type="number"
                      min="0"
                      value={
                        tache.joursJaune ??
                        7
                      }
                      onChange={(e) =>
                        modifierEcheance(
                          tache,
                          "joursJaune",
                          e.target.value
                        )
                      }
                      style={{
                        display:
                          "block",

                        width:
                          "65px",

                        marginTop:
                          "4px",

                        padding:
                          "5px",

                        border:
                          "1px solid #ccc",

                        borderRadius:
                          "6px",
                      }}
                    />
                  </label>

                  <label
                    style={{
                      fontSize:
                        "10px",
                    }}
                  >
                    🔴 Rouge

                    <input
                      type="number"
                      min="0"
                      value={
                        tache.joursRouge ??
                        2
                      }
                      onChange={(e) =>
                        modifierEcheance(
                          tache,
                          "joursRouge",
                          e.target.value
                        )
                      }
                      style={{
                        display:
                          "block",

                        width:
                          "65px",

                        marginTop:
                          "4px",

                        padding:
                          "5px",

                        border:
                          "1px solid #ccc",

                        borderRadius:
                          "6px",
                      }}
                    />
                  </label>
                </>
              )}
            </div>

            {tache.dateEcheance && (
              <div
                style={{
                  marginTop:
                    "7px",

                  color:
                    "#777",

                  fontSize:
                    "9px",
                }}
              >
                📅 Cette tâche apparaît automatiquement dans le calendrier.
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        padding:
          "32px",
      }}
    >
      <div
        style={{
          maxWidth:
            "1100px",

          margin:
            "0 auto",
        }}
      >
        <div
          style={{
            display:
              "flex",

            justifyContent:
              "space-between",

            alignItems:
              "center",

            gap:
              "20px",

            flexWrap:
              "wrap",

            marginBottom:
              "22px",
          }}
        >
          <div>
            <h2
              style={{
                margin:
                  "0 0 5px",
              }}
            >
              ☑️ Tâches
            </h2>

            <p
              style={{
                color:
                  "#777",

                margin:
                  0,
              }}
            >
              Tâches et suivis du projet.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setFormulaireOuvert(
                (ouvert) =>
                  !ouvert
              )
            }
          >
            + Nouvelle tâche
          </button>
        </div>

        {formulaireOuvert && (
          <div
            style={{
              padding:
                "18px",

              marginBottom:
                "22px",

              border:
                "1px solid #ddd",

              borderRadius:
                "12px",

              background:
                "#fafafa",
            }}
          >
            <h3
              style={{
                margin:
                  "0 0 14px",
              }}
            >
              Nouvelle tâche
            </h3>

            <label
              style={{
                display:
                  "block",

                fontSize:
                  "12px",

                marginBottom:
                  "14px",
              }}
            >
              Titre

              <input
                type="text"
                value={
                  titre
                }
                onChange={(e) =>
                  setTitre(
                    e.target.value
                  )
                }
                placeholder="Ex. Préparer livraison Kingspan"
                style={{
                  display:
                    "block",

                  width:
                    "100%",

                  marginTop:
                    "5px",

                  padding:
                    "9px",

                  border:
                    "1px solid #ccc",

                  borderRadius:
                    "7px",
                }}
              />
            </label>

            <div
              style={{
                marginBottom:
                  "16px",
              }}
            >
              <div
                style={{
                  fontSize:
                    "12px",

                  fontWeight:
                    "600",

                  marginBottom:
                    "7px",
                }}
              >
                Checklist
              </div>

              <div
                style={{
                  display:
                    "flex",

                  flexDirection:
                    "column",

                  gap:
                    "7px",
                }}
              >
                {elements.map(
                  (element) => (
                    <div
                      key={
                        element.id
                      }
                      style={{
                        display:
                          "flex",

                        gap:
                          "7px",

                        alignItems:
                          "center",
                      }}
                    >
                      <span>
                        ☐
                      </span>

                      <input
                        type="text"
                        value={
                          element.texte
                        }
                        onChange={(e) =>
                          modifierElement(
                            element.id,
                            e.target.value
                          )
                        }
                        placeholder="Sous-tâche..."
                        style={{
                          flex:
                            1,

                          padding:
                            "7px 8px",

                          border:
                            "1px solid #ddd",

                          borderRadius:
                            "6px",
                        }}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          supprimerElement(
                            element.id
                          )
                        }
                      >
                        ×
                      </button>
                    </div>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={
                  ajouterElement
                }
                style={{
                  marginTop:
                    "8px",
                }}
              >
                + Ajouter une sous-tâche
              </button>
            </div>

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "minmax(180px, 1fr) 120px 120px",

                gap:
                  "12px",

                alignItems:
                  "end",
              }}
            >
              <label
                style={{
                  fontSize:
                    "12px",
                }}
              >
                Échéance facultative

                <input
                  type="date"
                  value={
                    dateEcheance
                  }
                  onChange={(e) =>
                    setDateEcheance(
                      e.target.value
                    )
                  }
                  style={{
                    display:
                      "block",

                    width:
                      "100%",

                    marginTop:
                      "5px",

                    padding:
                      "8px",

                    border:
                      "1px solid #ccc",

                    borderRadius:
                      "7px",
                  }}
                />
              </label>

              {dateEcheance && (
                <>
                  <label
                    style={{
                      fontSize:
                        "12px",
                    }}
                  >
                    🟡 Jaune

                    <input
                      type="number"
                      min="0"
                      value={
                        joursJaune
                      }
                      onChange={(e) =>
                        setJoursJaune(
                          e.target.value
                        )
                      }
                      style={{
                        display:
                          "block",

                        width:
                          "100%",

                        marginTop:
                          "5px",

                        padding:
                          "8px",

                        border:
                          "1px solid #ccc",

                        borderRadius:
                          "7px",
                      }}
                    />
                  </label>

                  <label
                    style={{
                      fontSize:
                        "12px",
                    }}
                  >
                    🔴 Rouge

                    <input
                      type="number"
                      min="0"
                      value={
                        joursRouge
                      }
                      onChange={(e) =>
                        setJoursRouge(
                          e.target.value
                        )
                      }
                      style={{
                        display:
                          "block",

                        width:
                          "100%",

                        marginTop:
                          "5px",

                        padding:
                          "8px",

                        border:
                          "1px solid #ccc",

                        borderRadius:
                          "7px",
                      }}
                    />
                  </label>
                </>
              )}
            </div>

            {dateEcheance && (
              <div
                style={{
                  marginTop:
                    "8px",

                  color:
                    "#666",

                  fontSize:
                    "10px",
                }}
              >
                📅 Cette tâche sera automatiquement affichée dans le calendrier.
              </div>
            )}

            <div
              style={{
                display:
                  "flex",

                gap:
                  "8px",

                marginTop:
                  "16px",
              }}
            >
              <button
                type="button"
                onClick={
                  creer
                }
                disabled={
                  creationEnCours
                }
              >
                {creationEnCours
                  ? "Création..."
                  : "Créer"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setFormulaireOuvert(
                    false
                  );

                  reinitialiser();
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {chargement && (
          <div
            style={{
              padding:
                "30px",

              textAlign:
                "center",

              color:
                "#777",
            }}
          >
            Chargement des tâches...
          </div>
        )}

        {!chargement &&
          erreur && (
            <div>
              {erreur}
            </div>
          )}

        {!chargement &&
          !erreur && (
            <>
              <div
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "space-between",

                  marginBottom:
                    "10px",

                  gap:
                    "12px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap:
                      "8px",
                  }}
                >
                  <h3
                    style={{
                      margin:
                        0,

                      fontSize:
                        "14px",
                    }}
                  >
                    À faire
                  </h3>

                  <span
                    style={{
                      minWidth:
                        "22px",

                      height:
                        "22px",

                      padding:
                        "0 7px",

                      display:
                        "inline-flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      borderRadius:
                        "999px",

                      background:
                        "#f0f0f0",

                      color:
                        "#555",

                      fontSize:
                        "10px",

                      fontWeight:
                        "700",
                    }}
                  >
                    {
                      tachesAFaire.length
                    }
                  </span>
                </div>
              </div>

              {tachesAFaire.length ===
              0 ? (
                <div
                  style={{
                    padding:
                      "28px",

                    border:
                      "1px dashed #ccc",

                    borderRadius:
                      "10px",

                    textAlign:
                      "center",

                    color:
                      "#888",

                    marginBottom:
                      "24px",
                  }}
                >
                  Aucune tâche à faire.
                </div>
              ) : (
                <div
                  style={{
                    display:
                      "flex",

                    flexDirection:
                      "column",

                    gap:
                      "9px",

                    marginBottom:
                      "26px",
                  }}
                >
                  {tachesAFaire.map(
                    rendreTache
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  setTermineesOuvertes(
                    (ouvert) =>
                      !ouvert
                  )
                }
                style={{
                  width:
                    "100%",

                  display:
                    "flex",

                  justifyContent:
                    "space-between",

                  alignItems:
                    "center",

                  gap:
                    "12px",

                  padding:
                    "11px 12px",

                  border:
                    "1px solid #ddd",

                  borderRadius:
                    "9px",

                  background:
                    "#fafafa",

                  cursor:
                    "pointer",

                  fontFamily:
                    "inherit",

                  textAlign:
                    "left",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap:
                      "8px",
                  }}
                >
                  <strong
                    style={{
                      fontSize:
                        "13px",

                      color:
                        "#555",
                    }}
                  >
                    ✓ Terminées
                  </strong>

                  <span
                    style={{
                      minWidth:
                        "22px",

                      height:
                        "22px",

                      padding:
                        "0 7px",

                      display:
                        "inline-flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      borderRadius:
                        "999px",

                      background:
                        "#ececec",

                      color:
                        "#777",

                      fontSize:
                        "10px",

                      fontWeight:
                        "700",
                    }}
                  >
                    {
                      tachesTerminees.length
                    }
                  </span>
                </div>

                <span
                  style={{
                    color:
                      "#777",

                    fontSize:
                      "11px",
                  }}
                >
                  {termineesOuvertes
                    ? "▲"
                    : "▼"}
                </span>
              </button>

              {termineesOuvertes && (
                <div
                  style={{
                    display:
                      "flex",

                    flexDirection:
                      "column",

                    gap:
                      "9px",

                    marginTop:
                      "9px",
                  }}
                >
                  {tachesTerminees.length ===
                  0 ? (
                    <div
                      style={{
                        padding:
                          "18px",

                        color:
                          "#999",

                        fontSize:
                          "11px",

                        textAlign:
                          "center",
                      }}
                    >
                      Aucune tâche terminée.
                    </div>
                  ) : (
                    tachesTerminees.map(
                      rendreTache
                    )
                  )}
                </div>
              )}
            </>
          )}
      </div>
    </div>
  );
}

export default PageTaches;