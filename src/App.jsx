import {
  useState,
} from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

import PageAccueil from "./pages/PageAccueil";
import PageProjet from "./pages/PageProjet";

function App() {
  const [
    projetSelectionne,
    setProjetSelectionne,
  ] = useState(null);

  const handleOuvrirProjet =
    (projet) => {
      setProjetSelectionne(
        projet
      );
    };

  const handleAccueil =
    () => {
      setProjetSelectionne(
        null
      );
    };

  return (
    <div
      style={{
        display:
          "flex",

        minHeight:
          "100vh",

        background:
          "#f7f8fa",

        fontFamily:
          'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <Sidebar
        onAccueil={
          handleAccueil
        }
      />

      <div
        style={{
          flex:
            1,

          minWidth:
            0,

          display:
            "flex",

          flexDirection:
            "column",
        }}
      >
        <Topbar
          projetActuel={
            projetSelectionne
          }
          onAccueil={
            handleAccueil
          }
        />

        <main
          style={{
            flex:
              1,

            minWidth:
              0,
          }}
        >
          {projetSelectionne ? (
            <PageProjet
              projet={
                projetSelectionne
              }
              onRetour={
                handleAccueil
              }
            />
          ) : (
            <PageAccueil
              onOuvrirProjet={
                handleOuvrirProjet
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;