import { useState } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import PageAccueil from "./pages/PageAccueil";
import PageProjet from "./pages/PageProjet";

function App() {
  const [projetSelectionne, setProjetSelectionne] = useState(null);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Topbar />

        <main
          style={{
            flex: 1,
          }}
        >
          {projetSelectionne ? (
            <PageProjet
              projet={projetSelectionne}
              onRetour={() => setProjetSelectionne(null)}
            />
          ) : (
            <PageAccueil
              onOuvrirProjet={setProjetSelectionne}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;