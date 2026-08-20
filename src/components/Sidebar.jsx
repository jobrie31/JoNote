function Sidebar() {
  return (
    <aside
      style={{
        width: "260px",
        minHeight: "100vh",
        borderRight: "1px solid #ddd",
        padding: "24px 18px",
        boxSizing: "border-box",
      }}
    >
      <h2 style={{ marginTop: 0 }}>JoNote</h2>

      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <button>Accueil</button>
        <button>Projets</button>
        <button>Notes récentes</button>
        <button>Important</button>
        <button>Tâches</button>
      </nav>
    </aside>
  );
}

export default Sidebar;