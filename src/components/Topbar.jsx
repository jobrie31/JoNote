function Topbar({
  projetActuel,
  onAccueil,
}) {
  return (
    <header
      style={{
        height:
          "64px",

        minHeight:
          "64px",

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "space-between",

        gap:
          "20px",

        padding:
          "0 24px",

        borderBottom:
          "1px solid #e5e7eb",

        background:
          "#ffffff",

        boxSizing:
          "border-box",
      }}
    >
      <button
        type="button"
        onClick={
          onAccueil
        }
        style={{
          border:
            "none",

          background:
            "transparent",

          cursor:
            "pointer",

          fontFamily:
            "inherit",

          color:
            "#6b7280",
        }}
      >
        Projets
      </button>

      {projetActuel && (
        <div
          style={{
            fontWeight:
              "600",

            color:
              "#374151",

            overflow:
              "hidden",

            textOverflow:
              "ellipsis",

            whiteSpace:
              "nowrap",
          }}
        >
          {projetActuel.nom}
        </div>
      )}

      <div
        style={{
          width:
            "60px",
        }}
      />
    </header>
  );
}

export default Topbar;