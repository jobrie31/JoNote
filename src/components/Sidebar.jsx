function Sidebar({
  onAccueil,
}) {
  return (
    <aside
      style={{
        width:
          "220px",

        minWidth:
          "220px",

        minHeight:
          "100vh",

        background:
          "#111827",

        color:
          "#ffffff",

        padding:
          "24px 16px",

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
          width:
            "100%",

          border:
            "none",

          background:
            "transparent",

          color:
            "#ffffff",

          textAlign:
            "left",

          padding:
            "0 10px",

          marginBottom:
            "28px",

          cursor:
            "pointer",

          fontFamily:
            "inherit",
        }}
      >
        <div
          style={{
            fontSize:
              "24px",

            fontWeight:
              "800",
          }}
        >
          JoNote
        </div>

        <div
          style={{
            marginTop:
              "4px",

            fontSize:
              "12px",

            color:
              "#9ca3af",
          }}
        >
          Notes de projets
        </div>
      </button>

      <nav>
        <button
          type="button"
          onClick={
            onAccueil
          }
          style={{
            width:
              "100%",

            border:
              "none",

            borderRadius:
              "8px",

            background:
              "rgba(255,255,255,0.08)",

            color:
              "#ffffff",

            padding:
              "10px 12px",

            textAlign:
              "left",

            cursor:
              "pointer",

            fontFamily:
              "inherit",

            fontWeight:
              "600",
          }}
        >
          📁 Projets
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;