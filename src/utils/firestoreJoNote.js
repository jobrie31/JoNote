import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase";

/* =========================================================
   RÉFÉRENCES
========================================================= */

const projetsRef = collection(
  db,
  "Applications",
  "JoNote",
  "projets"
);

const notesRef = collection(
  db,
  "Applications",
  "JoNote",
  "notes"
);

/* =========================================================
   PROJETS
========================================================= */

export function ecouterProjets(
  callback
) {
  return onSnapshot(
    projetsRef,

    (snapshot) => {
      const projets =
        snapshot.docs.map(
          (document) => ({
            id:
              document.id,

            ...document.data(),
          })
        );

      projets.sort(
        (a, b) =>
          (a.nom || "").localeCompare(
            b.nom || "",
            "fr",
            {
              sensitivity:
                "base",
            }
          )
      );

      callback(
        projets
      );
    },

    (error) => {
      console.error(
        "Erreur écoute projets :",
        error
      );
    }
  );
}

export async function chargerProjets() {
  const snapshot =
    await getDocs(
      projetsRef
    );

  const projets =
    snapshot.docs.map(
      (document) => ({
        id:
          document.id,

        ...document.data(),
      })
    );

  projets.sort(
    (a, b) =>
      (a.nom || "").localeCompare(
        b.nom || "",
        "fr",
        {
          sensitivity:
            "base",
        }
      )
  );

  return projets;
}

export async function creerProjet({
  nom,
  description = "",
}) {
  const docRef =
    await addDoc(
      projetsRef,
      {
        nom:
          nom.trim(),

        description:
          description.trim(),

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      }
    );

  return docRef.id;
}

export async function modifierProjet(
  projetId,
  donnees
) {
  const projetRef =
    doc(
      db,
      "Applications",
      "JoNote",
      "projets",
      projetId
    );

  await updateDoc(
    projetRef,
    {
      ...donnees,

      updatedAt:
        serverTimestamp(),
    }
  );
}

export async function supprimerProjet(
  projetId
) {
  /*
    On trouve toutes les notes
    reliées au projet.
  */

  const notesProjetQuery =
    query(
      notesRef,

      where(
        "projetId",
        "==",
        projetId
      )
    );

  const notesSnapshot =
    await getDocs(
      notesProjetQuery
    );

  /*
    On supprime le projet
    et toutes ses notes dans
    un seul batch.
  */

  const batch =
    writeBatch(db);

  notesSnapshot.docs.forEach(
    (
      noteDocument
    ) => {
      batch.delete(
        noteDocument.ref
      );
    }
  );

  const projetRef =
    doc(
      db,
      "Applications",
      "JoNote",
      "projets",
      projetId
    );

  batch.delete(
    projetRef
  );

  await batch.commit();
}

/* =========================================================
   NOTES D'UN PROJET
========================================================= */

export function ecouterNotesProjet(
  projetId,
  callback
) {
  const q =
    query(
      notesRef,

      where(
        "projetId",
        "==",
        projetId
      )
    );

  return onSnapshot(
    q,

    (snapshot) => {
      const notes =
        snapshot.docs.map(
          (document) => ({
            id:
              document.id,

            ...document.data(),
          })
        );

      /*
        Dans le projet :
        on trie par la date
        attribuée à la note.

        Plus récente en premier.
      */

      notes.sort(
        (a, b) => {
          const dateA =
            a.date || "";

          const dateB =
            b.date || "";

          if (
            dateA !==
            dateB
          ) {
            return dateB.localeCompare(
              dateA
            );
          }

          /*
            Si deux notes ont
            la même date,
            la plus récemment
            créée apparaît avant.
          */

          const creationA =
            a.createdAt
              ?.toMillis?.() ||
            0;

          const creationB =
            b.createdAt
              ?.toMillis?.() ||
            0;

          return (
            creationB -
            creationA
          );
        }
      );

      callback(
        notes
      );
    },

    (error) => {
      console.error(
        "Erreur écoute notes du projet :",
        error
      );
    }
  );
}

/* =========================================================
   TOUTES LES NOTES
   POUR LA BANQUE À DROITE
========================================================= */

export function ecouterToutesNotes(
  callback
) {
  return onSnapshot(
    notesRef,

    (snapshot) => {
      const notes =
        snapshot.docs.map(
          (document) => ({
            id:
              document.id,

            ...document.data(),
          })
        );

      /*
        Banque globale :
        tri par DATE D'AJOUT,
        donc createdAt.

        La note créée le plus
        récemment est toujours
        en premier, peu importe
        la date manuelle de la note.
      */

      notes.sort(
        (a, b) => {
          const creationA =
            a.createdAt
              ?.toMillis?.() ||
            0;

          const creationB =
            b.createdAt
              ?.toMillis?.() ||
            0;

          return (
            creationB -
            creationA
          );
        }
      );

      callback(
        notes
      );
    },

    (error) => {
      console.error(
        "Erreur écoute toutes les notes :",
        error
      );
    }
  );
}

/* =========================================================
   CRÉER UNE NOTE
========================================================= */

export async function creerNote({
  projetId,
  titre = "",
  contenu = "",
  date,
}) {
  const docRef =
    await addDoc(
      notesRef,
      {
        projetId,

        titre,

        contenu,

        date,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      }
    );

  return docRef.id;
}

/* =========================================================
   MODIFIER UNE NOTE
========================================================= */

export async function modifierNote(
  noteId,
  donnees
) {
  const noteRef =
    doc(
      db,
      "Applications",
      "JoNote",
      "notes",
      noteId
    );

  await updateDoc(
    noteRef,
    {
      ...donnees,

      updatedAt:
        serverTimestamp(),
    }
  );
}

/* =========================================================
   SUPPRIMER UNE NOTE
========================================================= */

export async function supprimerNote(
  noteId
) {
  const noteRef =
    doc(
      db,
      "Applications",
      "JoNote",
      "notes",
      noteId
    );

  await deleteDoc(
    noteRef
  );
}