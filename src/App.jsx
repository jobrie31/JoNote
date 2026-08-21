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

  const [
    noteAOuvrir,
    setNoteAOuvrir,
  ] = useState(null);

  const handleOuvrirProjet = (
    projet
  ) => {
    setProjetSelectionne(
      projet
    );

    setNoteAOuvrir(
      null
    );
  };

  const handleOuvrirNote = (
    projet,
    note
  ) => {
    if (
      !projet ||
      !note
    ) {
      return;
    }

    setProjetSelectionne(
      projet
    );

    setNoteAOuvrir(
      note
    );
  };

  const handleRetourAccueil =
    () => {
      setProjetSelectionne(
        null
      );

      setNoteAOuvrir(
        null
      );
    };

  const handleOuvrirResultatRecherche =
    ({
      projet,
      note = null,
      tacheId = null,
    }) => {
      if (!projet) {
        return;
      }

      if (tacheId) {
        setProjetSelectionne({
          ...projet,

          jonoteTacheId:
            tacheId,
        });

        setNoteAOuvrir(
          null
        );

        return;
      }

      setProjetSelectionne({
        ...projet,

        jonoteTacheId:
          null,
      });

      setNoteAOuvrir(
        note || null
      );
    };

  return (
    <div
      style={{
        display:
          "flex",

        minHeight:
          "100vh",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex:
            1,

          display:
            "flex",

          flexDirection:
            "column",

          minWidth:
            0,
        }}
      >
        <Topbar
          projetActuel={
            projetSelectionne
          }
          onRetourAccueil={
            handleRetourAccueil
          }
          onOuvrirResultat={
            handleOuvrirResultatRecherche
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
              noteAOuvrir={
                noteAOuvrir
              }
              onNoteOuverte={() =>
                setNoteAOuvrir(
                  null
                )
              }
              onRetour={
                handleRetourAccueil
              }
            />
          ) : (
            <PageAccueil
              onOuvrirProjet={
                handleOuvrirProjet
              }
              onOuvrirNote={
                handleOuvrirNote
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;