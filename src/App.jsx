import {
  useState,
} from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import PageAccueil from "./pages/PageAccueil";
import PageProjet from "./pages/PageProjet";
import PageCalendrierGlobal from "./pages/PageCalendrierGlobal.jsx";

function App() {
  const [
    projetSelectionne,
    setProjetSelectionne,
  ] = useState(null);

  const [
    noteAOuvrir,
    setNoteAOuvrir,
  ] = useState(null);

  const [
    calendrierGlobalOuvert,
    setCalendrierGlobalOuvert,
  ] = useState(false);

  const handleOuvrirProjet = (
    projet
  ) => {
    setProjetSelectionne(
      projet
    );

    setNoteAOuvrir(
      null
    );

    setCalendrierGlobalOuvert(
      false
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

    setCalendrierGlobalOuvert(
      false
    );
  };

  const handleOuvrirCalendrierGlobal =
    () => {
      setProjetSelectionne(
        null
      );

      setNoteAOuvrir(
        null
      );

      setCalendrierGlobalOuvert(
        true
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

      setCalendrierGlobalOuvert(
        false
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

      setCalendrierGlobalOuvert(
        false
      );

      if (tacheId) {
        setProjetSelectionne({
          ...projet,

          jonoteOngletInitial:
            "taches",

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
          ) : calendrierGlobalOuvert ? (
            <PageCalendrierGlobal
              onRetour={
                handleRetourAccueil
              }
              onOuvrirProjet={
                handleOuvrirProjet
              }
              onOuvrirNote={
                handleOuvrirNote
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
              onOuvrirCalendrierGlobal={
                handleOuvrirCalendrierGlobal
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
