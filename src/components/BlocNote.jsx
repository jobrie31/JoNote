import {
  useEffect,
  useRef,
  useState,
} from "react";

function BlocNote({
  note,
  onModifier,
  onSupprimer,
}) {
  const [
    titre,
    setTitre,
  ] = useState(
    note.titre || ""
  );

  const [
    contenu,
    setContenu,
  ] = useState(
    note.contenu || ""
  );

  const [
    date,
    setDate,
  ] = useState(
    note.date || ""
  );

  const [
    sauvegarde,
    setSauvegarde,
  ] = useState(
    "sauvegarde"
  );

  const timerRef =
    useRef(null);

  const textareaRef =
    useRef(null);

  useEffect(() => {
    setTitre(
      note.titre || ""
    );

    setContenu(
      note.contenu || ""
    );

    setDate(
      note.date || ""
    );
  }, [note.id]);

  useEffect(() => {
    return () => {
      if (
        timerRef.current
      ) {
        clearTimeout(
          timerRef.current
        );
      }
    };
  }, []);

  useEffect(() => {
    ajusterHauteur();
  }, [contenu]);

  const ajusterHauteur =
    () => {
      const textarea =
        textareaRef.current;

      if (!textarea) {
        return;
      }

      textarea.style.height =
        "auto";

      textarea.style.height =
        `${textarea.scrollHeight}px`;
    };

  const programmerSauvegarde = (
    nouvellesDonnees
  ) => {
    setSauvegarde(
      "modification"
    );

    if (
      timerRef.current
    ) {
      clearTimeout(
        timerRef.current
      );
    }

    timerRef.current =
      setTimeout(
        async () => {
          try {
            setSauvegarde(
              "sauvegarde-en-cours"
            );

            await onModifier(
              note.id,
              nouvellesDonnees
            );

            setSauvegarde(
              "sauvegarde"
            );
          } catch (error) {
            console.error(
              "Erreur sauvegarde note :",
              error
            );

            setSauvegarde(
              "erreur"
            );
          }
        },
        500
      );
  };

  const handleTitreChange = (
    e
  ) => {
    const nouvelleValeur =
      e.target.value;

    setTitre(
      nouvelleValeur
    );

    programmerSauvegarde({
      titre:
        nouvelleValeur,
    });
  };

  const handleContenuChange = (
    e
  ) => {
    const nouvelleValeur =
      e.target.value;

    setContenu(
      nouvelleValeur
    );

    programmerSauvegarde({
      contenu:
        nouvelleValeur,
    });
  };

  const handleDateChange = (
    e
  ) => {
    const nouvelleDate =
      e.target.value;

    setDate(
      nouvelleDate
    );

    programmerSauvegarde({
      date:
        nouvelleDate,
    });
  };

  const formaterDate = (
    valeur
  ) => {
    if (!valeur) {
      return "";
    }

    const [
      annee,
      mois,
      jour,
    ] =
      valeur.split("-");

    if (
      !annee ||
      !mois ||
      !jour
    ) {
      return valeur;
    }

    const dateLocale =
      new Date(
        Number(annee),
        Number(mois) - 1,
        Number(jour)
      );

    let texte =
      dateLocale.toLocaleDateString(
        "fr-CA",
        {
          weekday:
            "long",

          day:
            "numeric",

          month:
            "long",
        }
      );

    return (
      texte.charAt(0)
        .toUpperCase() +
      texte.slice(1)
    );
  };

  const obtenirTexteSauvegarde =
    () => {
      if (
        sauvegarde ===
        "modification"
      ) {
        return "Modification...";
      }

      if (
        sauvegarde ===
        "sauvegarde-en-cours"
      ) {
        return "Sauvegarde...";
      }

      if (
        sauvegarde ===
        "erreur"
      ) {
        return "Erreur";
      }

      return "Sauvegardé";
    };

  const handleSupprimer =
    () => {
      const confirmation =
        window.confirm(
          "Supprimer cette note ?"
        );

      if (
        !confirmation
      ) {
        return;
      }

      onSupprimer(
        note.id
      );
    };

  return (
    <article
      style={{
        border:
          "1px solid #e5e7eb",

        borderRadius:
          "14px",

        background:
          "#ffffff",

        padding:
          "15px 16px",

        boxShadow:
          "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      {/* TITRE */}

      <input
        type="text"
        value={titre}
        onChange={
          handleTitreChange
        }
        placeholder="Titre de la note"
        style={{
          width:
            "100%",

          boxSizing:
            "border-box",

          border:
            "none",

          outline:
            "none",

          background:
            "transparent",

          fontFamily:
            "inherit",

          fontSize:
            "18px",

          fontWeight:
            "700",

          color:
            "#111827",

          padding:
            "0",

          marginBottom:
            "6px",
        }}
      />

      {/* DATE + ÉTAT */}

      <div
        style={{
          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "space-between",

          gap:
            "12px",

          marginBottom:
            "10px",
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
          <label
            style={{
              position:
                "relative",

              cursor:
                "pointer",
            }}
          >
            <span
              style={{
                color:
                  "#6b7280",

                fontSize:
                  "13px",

                fontWeight:
                  "500",
              }}
            >
              {formaterDate(
                date
              )}
            </span>

            <input
              type="date"
              value={date}
              onChange={
                handleDateChange
              }
              style={{
                position:
                  "absolute",

                inset:
                  0,

                opacity:
                  0,

                cursor:
                  "pointer",

                width:
                  "100%",

                height:
                  "100%",
              }}
            />
          </label>
        </div>

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
          <span
            style={{
              fontSize:
                "11px",

              color:
                sauvegarde ===
                "erreur"
                  ? "#b42318"
                  : "#9ca3af",
            }}
          >
            {
              obtenirTexteSauvegarde()
            }
          </span>

          <button
            type="button"
            onClick={
              handleSupprimer
            }
            title="Supprimer la note"
            style={{
              border:
                "none",

              background:
                "transparent",

              color:
                "#9ca3af",

              cursor:
                "pointer",

              fontSize:
                "17px",

              padding:
                "2px 4px",

              lineHeight:
                1,
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* TEXTE */}

      <textarea
        ref={
          textareaRef
        }
        value={
          contenu
        }
        onChange={
          handleContenuChange
        }
        placeholder="Écris ta note ici..."
        rows={1}
        style={{
          width:
            "100%",

          boxSizing:
            "border-box",

          border:
            "none",

          outline:
            "none",

          resize:
            "none",

          overflow:
            "hidden",

          padding:
            "0",

          margin:
            0,

          fontFamily:
            "inherit",

          fontSize:
            "15px",

          lineHeight:
            1.55,

          color:
            "#1f2937",

          background:
            "transparent",

          display:
            "block",
        }}
      />
    </article>
  );
}

export default BlocNote;