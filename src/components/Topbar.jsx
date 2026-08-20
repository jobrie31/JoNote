function Topbar() {
  return (
    <header
      style={{
        height: "64px",
        borderBottom: "1px solid #ddd",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        boxSizing: "border-box",
      }}
    >
      <div>
        <strong>Accueil</strong>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button>Recherche</button>
        <button>+</button>
      </div>
    </header>
  );
}

export default Topbar;