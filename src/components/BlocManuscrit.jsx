import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

function BlocManuscrit({
  bloc,
  onModifier,
  onSupprimer,
}) {
  const canvasRef = useRef(null);
  const conteneurRef = useRef(null);

  const [traits, setTraits] = useState(
    bloc.traits || []
  );

  const [historiqueRefaire, setHistoriqueRefaire] =
    useState([]);

  const [outil, setOutil] = useState("stylo");

  const [hauteur, setHauteur] = useState(
    bloc.hauteur || 520
  );

  const [typePapier, setTypePapier] = useState(
    bloc.typePapier || "ligne"
  );

  const [epaisseurStylo, setEpaisseurStylo] = useState(
    bloc.epaisseurStylo || 2.2
  );

  const [couleurStylo, setCouleurStylo] = useState(
    bloc.couleurStylo || "#111111"
  );

  const espacementLignes =
    bloc.espacementLignes || 32;

  const dessinEnCoursRef = useRef(false);
  const traitActuelRef = useRef(null);
  const timerSauvegardeRef = useRef(null);

  useEffect(() => {
    setTraits(bloc.traits || []);
    setHauteur(bloc.hauteur || 520);
    setTypePapier(bloc.typePapier || "ligne");
    setEpaisseurStylo(bloc.epaisseurStylo || 2.2);
    setCouleurStylo(bloc.couleurStylo || "#111111");
  }, [bloc.id]);

  const stylePapier = useMemo(() => {
    if (typePapier === "blanc") {
      return {
        backgroundColor: "#fff",
      };
    }

    if (typePapier === "quadrille") {
      return {
        backgroundColor: "#fff",
        backgroundImage: `
          linear-gradient(#d8e3ef 1px, transparent 1px),
          linear-gradient(90deg, #d8e3ef 1px, transparent 1px)
        `,
        backgroundSize: `${espacementLignes}px ${espacementLignes}px`,
      };
    }

    if (typePapier === "pointille") {
      return {
        backgroundColor: "#fff",
        backgroundImage: `
          radial-gradient(circle, #c5ced8 1.2px, transparent 1.2px)
        `,
        backgroundSize: `${espacementLignes}px ${espacementLignes}px`,
      };
    }

    return {
      backgroundColor: "#fff",
      backgroundImage: `
        repeating-linear-gradient(
          to bottom,
          transparent 0px,
          transparent ${espacementLignes - 1}px,
          #c9d7e8 ${espacementLignes - 1}px,
          #c9d7e8 ${espacementLignes}px
        )
      `,
    };
  }, [typePapier, espacementLignes]);

  const dessinerTrait = (
    ctx,
    trait
  ) => {
    if (
      !trait.points ||
      trait.points.length === 0
    ) {
      return;
    }

    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle =
      trait.outil === "gomme"
        ? "#ffffff"
        : trait.couleur || "#111111";

    ctx.lineWidth =
      trait.outil === "gomme"
        ? 26
        : trait.epaisseur || 2.2;

    const premier =
      trait.points[0];

    ctx.moveTo(
      premier.x,
      premier.y
    );

    for (
      let i = 1;
      i < trait.points.length;
      i += 1
    ) {
      const point = trait.points[i];

      ctx.lineTo(
        point.x,
        point.y
      );
    }

    ctx.stroke();
  };

  const redessiner = () => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx =
      canvas.getContext("2d");

    ctx.clearRect(
      0,
      0,
      canvas.clientWidth,
      hauteur
    );

    traits.forEach((trait) => {
      dessinerTrait(
        ctx,
        trait
      );
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const conteneur = conteneurRef.current;

    if (!canvas || !conteneur) {
      return;
    }

    const ajusterCanvas = () => {
      const rect =
        conteneur.getBoundingClientRect();

      const ratio =
        window.devicePixelRatio || 1;

      canvas.width =
        Math.max(1, rect.width * ratio);

      canvas.height =
        hauteur * ratio;

      canvas.style.width =
        `${rect.width}px`;

      canvas.style.height =
        `${hauteur}px`;

      const ctx =
        canvas.getContext("2d");

      ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
      );

      redessiner();
    };

    ajusterCanvas();

    const observer =
      new ResizeObserver(
        ajusterCanvas
      );

    observer.observe(conteneur);

    return () => {
      observer.disconnect();
    };
  }, [hauteur, traits]);

  useEffect(() => {
    return () => {
      if (timerSauvegardeRef.current) {
        clearTimeout(
          timerSauvegardeRef.current
        );
      }
    };
  }, []);

  const sauvegarder = (
    nouvellesDonnees,
    attente = 400
  ) => {
    if (timerSauvegardeRef.current) {
      clearTimeout(
        timerSauvegardeRef.current
      );
    }

    timerSauvegardeRef.current =
      setTimeout(() => {
        onModifier(
          bloc.id,
          nouvellesDonnees
        );
      }, attente);
  };

  const sauvegarderTraits = (
    nouveauxTraits
  ) => {
    setTraits(nouveauxTraits);

    sauvegarder({
      traits: nouveauxTraits,
      hauteur,
      typePapier,
      epaisseurStylo,
      couleurStylo,
    });
  };

  const obtenirPoint = (e) => {
    const canvas =
      canvasRef.current;

    const rect =
      canvas.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pression:
        typeof e.pressure === "number"
          ? e.pressure
          : 0.5,
    };
  };

  const commencerDessin = (e) => {
    if (
      e.pointerType === "mouse" &&
      e.button !== 0
    ) {
      return;
    }

    e.preventDefault();

    canvasRef.current.setPointerCapture(
      e.pointerId
    );

    dessinEnCoursRef.current = true;

    setHistoriqueRefaire([]);

    traitActuelRef.current = {
      id: crypto.randomUUID(),
      outil,
      couleur: couleurStylo,
      epaisseur: epaisseurStylo,
      points: [
        obtenirPoint(e),
      ],
    };
  };

  const continuerDessin = (e) => {
    if (
      !dessinEnCoursRef.current ||
      !traitActuelRef.current
    ) {
      return;
    }

    e.preventDefault();

    const point =
      obtenirPoint(e);

    traitActuelRef.current.points.push(
      point
    );

    const points =
      traitActuelRef.current.points;

    if (points.length < 2) {
      return;
    }

    const canvas =
      canvasRef.current;

    const ctx =
      canvas.getContext("2d");

    const precedent =
      points[points.length - 2];

    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctx.strokeStyle =
      outil === "gomme"
        ? "#ffffff"
        : couleurStylo;

    ctx.lineWidth =
      outil === "gomme"
        ? 26
        : epaisseurStylo;

    ctx.moveTo(
      precedent.x,
      precedent.y
    );

    ctx.lineTo(
      point.x,
      point.y
    );

    ctx.stroke();
  };

  const terminerDessin = (e) => {
    if (
      !dessinEnCoursRef.current ||
      !traitActuelRef.current
    ) {
      return;
    }

    e.preventDefault();

    dessinEnCoursRef.current = false;

    const nouveauTrait =
      traitActuelRef.current;

    traitActuelRef.current = null;

    sauvegarderTraits([
      ...traits,
      nouveauTrait,
    ]);
  };

  const annuler = () => {
    if (traits.length === 0) {
      return;
    }

    const dernier =
      traits[traits.length - 1];

    const nouveauxTraits =
      traits.slice(0, -1);

    setHistoriqueRefaire((actuel) => [
      ...actuel,
      dernier,
    ]);

    sauvegarderTraits(
      nouveauxTraits
    );
  };

  const refaire = () => {
    if (
      historiqueRefaire.length === 0
    ) {
      return;
    }

    const dernier =
      historiqueRefaire[
        historiqueRefaire.length - 1
      ];

    setHistoriqueRefaire((actuel) =>
      actuel.slice(0, -1)
    );

    sauvegarderTraits([
      ...traits,
      dernier,
    ]);
  };

  const changerPapier = (
    nouveauType
  ) => {
    setTypePapier(nouveauType);

    sauvegarder({
      traits,
      hauteur,
      typePapier: nouveauType,
      epaisseurStylo,
      couleurStylo,
    });
  };

  const changerEpaisseur = (
    nouvelleEpaisseur
  ) => {
    setEpaisseurStylo(
      nouvelleEpaisseur
    );

    sauvegarder({
      traits,
      hauteur,
      typePapier,
      epaisseurStylo:
        nouvelleEpaisseur,
      couleurStylo,
    });
  };

  const changerCouleur = (
    nouvelleCouleur
  ) => {
    setCouleurStylo(
      nouvelleCouleur
    );

    sauvegarder({
      traits,
      hauteur,
      typePapier,
      epaisseurStylo,
      couleurStylo:
        nouvelleCouleur,
    });
  };

  const changerHauteur = (
    nouvelleHauteur
  ) => {
    const hauteurFinale =
      Math.max(
        260,
        Math.min(
          1600,
          nouvelleHauteur
        )
      );

    setHauteur(
      hauteurFinale
    );

    sauvegarder({
      traits,
      hauteur:
        hauteurFinale,
      typePapier,
      epaisseurStylo,
      couleurStylo,
    });
  };

  const toutEffacer = () => {
    if (traits.length === 0) {
      return;
    }

    setHistoriqueRefaire(
      traits
    );

    sauvegarderTraits([]);
  };

  return (
    <div
      style={{
        border:
          "1px solid #e2e2e2",
        borderRadius: "14px",
        overflow: "hidden",
        marginBottom: "16px",
        background: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: "10px",
          padding: "10px 14px",
          borderBottom:
            "1px solid #e5e5e5",
          background: "#fafafa",
          flexWrap: "wrap",
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
          <strong>
            Écriture guidée
          </strong>

          <button
            type="button"
            onClick={() =>
              setOutil("stylo")
            }
          >
            ✏️ Stylo
          </button>

          <button
            type="button"
            onClick={() =>
              setOutil("gomme")
            }
          >
            Gomme
          </button>

          <button
            type="button"
            onClick={annuler}
            disabled={
              traits.length === 0
            }
          >
            ↶
          </button>

          <button
            type="button"
            onClick={refaire}
            disabled={
              historiqueRefaire.length ===
              0
            }
          >
            ↷
          </button>

          <select
            value={typePapier}
            onChange={(e) =>
              changerPapier(
                e.target.value
              )
            }
          >
            <option value="ligne">
              Ligné
            </option>

            <option value="quadrille">
              Quadrillé
            </option>

            <option value="pointille">
              Pointillé
            </option>

            <option value="blanc">
              Blanc
            </option>
          </select>

          <select
            value={epaisseurStylo}
            onChange={(e) =>
              changerEpaisseur(
                Number(
                  e.target.value
                )
              )
            }
          >
            <option value={1.4}>
              Fin
            </option>

            <option value={2.2}>
              Normal
            </option>

            <option value={3.5}>
              Épais
            </option>

            <option value={5}>
              Très épais
            </option>
          </select>

          <input
            type="color"
            value={couleurStylo}
            onChange={(e) =>
              changerCouleur(
                e.target.value
              )
            }
            title="Couleur du stylo"
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "7px",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() =>
              changerHauteur(
                hauteur - 128
              )
            }
          >
            − Hauteur
          </button>

          <button
            type="button"
            onClick={() =>
              changerHauteur(
                hauteur + 128
              )
            }
          >
            + Hauteur
          </button>

          <button
            type="button"
            onClick={toutEffacer}
          >
            Tout effacer
          </button>

          <button
            type="button"
            onClick={() =>
              onSupprimer(bloc.id)
            }
          >
            Supprimer
          </button>
        </div>
      </div>

      <div
        ref={conteneurRef}
        style={{
          position: "relative",
          width: "100%",
          height: `${hauteur}px`,
          touchAction: "none",
          ...stylePapier,
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={
            commencerDessin
          }
          onPointerMove={
            continuerDessin
          }
          onPointerUp={
            terminerDessin
          }
          onPointerCancel={
            terminerDessin
          }
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            cursor:
              outil === "gomme"
                ? "cell"
                : "crosshair",
            touchAction: "none",
          }}
        />
      </div>
    </div>
  );
}

export default BlocManuscrit;