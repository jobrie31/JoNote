import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase";

const projetsRef = collection(
  db,
  "Applications",
  "JoNote",
  "projets"
);

export async function creerProjet(
  nom,
  description = ""
) {
  const docRef = await addDoc(projetsRef, {
    nom,
    description,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function chargerProjets() {
  const q = query(
    projetsRef,
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function creerCategorie(
  projetId,
  nom,
  parentId = null
) {
  const categoriesRef = collection(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "categories"
  );

  const docRef = await addDoc(categoriesRef, {
    nom,
    parentId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function chargerCategories(projetId) {
  const categoriesRef = collection(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "categories"
  );

  const q = query(
    categoriesRef,
    orderBy("createdAt", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function modifierNomCategorie(
  projetId,
  categorieId,
  nouveauNom
) {
  const categorieRef = doc(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "categories",
    categorieId
  );

  await updateDoc(categorieRef, {
    nom: nouveauNom,
    updatedAt: serverTimestamp(),
  });
}

export async function deplacerCategorie(
  projetId,
  categorieId,
  nouveauParentId = null
) {
  const categorieRef = doc(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "categories",
    categorieId
  );

  await updateDoc(categorieRef, {
    parentId: nouveauParentId,
    updatedAt: serverTimestamp(),
  });
}

export async function supprimerCategorieEtEnfants(
  projetId,
  categorieId
) {
  const categories =
    await chargerCategories(projetId);

  const idsASupprimer = new Set();

  const trouverEnfants = (parentId) => {
    idsASupprimer.add(parentId);

    categories.forEach((categorie) => {
      if (categorie.parentId === parentId) {
        trouverEnfants(categorie.id);
      }
    });
  };

  trouverEnfants(categorieId);

  for (const id of idsASupprimer) {
    const categorieRef = doc(
      db,
      "Applications",
      "JoNote",
      "projets",
      projetId,
      "categories",
      id
    );

    await deleteDoc(categorieRef);
  }
}

export async function creerNote(
  projetId,
  titre,
  categorieIds = [],
  importance = "normal"
) {
  const notesRef = collection(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes"
  );

  const docRef = await addDoc(notesRef, {
    titre,
    categorieIds,
    importance,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function chargerNotes(projetId) {
  const notesRef = collection(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes"
  );

  const q = query(
    notesRef,
    orderBy("updatedAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function modifierTitreNote(
  projetId,
  noteId,
  titre
) {
  const noteRef = doc(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes",
    noteId
  );

  await updateDoc(noteRef, {
    titre,
    updatedAt: serverTimestamp(),
  });
}

export async function creerBlocTexte(
  projetId,
  noteId
) {
  const blocsRef = collection(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes",
    noteId,
    "blocs"
  );

  const docRef = await addDoc(blocsRef, {
    type: "texte",
    contenu: "",
    important: false,
    ordre: Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function creerBlocChecklist(
  projetId,
  noteId
) {
  const blocsRef = collection(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes",
    noteId,
    "blocs"
  );

  const docRef = await addDoc(blocsRef, {
    type: "checklist",
    elements: [
      {
        id: crypto.randomUUID(),
        texte: "",
        complete: false,
      },
    ],
    ordre: Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function creerBlocManuscrit(
  projetId,
  noteId
) {
  const blocsRef = collection(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes",
    noteId,
    "blocs"
  );

  const docRef = await addDoc(blocsRef, {
    type: "manuscrit",
    traits: [],
    hauteur: 520,
    espacementLignes: 32,
    typePapier: "ligne",
    epaisseurStylo: 2.2,
    couleurStylo: "#111111",
    ordre: Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function creerBlocLien(
  projetId,
  noteId
) {
  const blocsRef = collection(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes",
    noteId,
    "blocs"
  );

  const docRef = await addDoc(blocsRef, {
    type: "lien",
    titre: "",
    url: "",
    description: "",
    ordre: Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function creerBlocImportant(
  projetId,
  noteId
) {
  const blocsRef = collection(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes",
    noteId,
    "blocs"
  );

  const docRef = await addDoc(blocsRef, {
    type: "important",
    contenu: "",
    niveau: "important",
    ordre: Date.now(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function chargerBlocs(
  projetId,
  noteId
) {
  const blocsRef = collection(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes",
    noteId,
    "blocs"
  );

  const q = query(
    blocsRef,
    orderBy("ordre", "asc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}

export async function modifierBlocTexte(
  projetId,
  noteId,
  blocId,
  contenu,
  important = false
) {
  const blocRef = doc(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes",
    noteId,
    "blocs",
    blocId
  );

  await updateDoc(blocRef, {
    contenu,
    important,
    updatedAt: serverTimestamp(),
  });
}

export async function modifierImportanceBlocTexte(
  projetId,
  noteId,
  blocId,
  important
) {
  const blocRef = doc(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes",
    noteId,
    "blocs",
    blocId
  );

  await updateDoc(blocRef, {
    important,
    updatedAt: serverTimestamp(),
  });
}

export async function modifierBlocChecklist(
  projetId,
  noteId,
  blocId,
  elements
) {
  const blocRef = doc(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes",
    noteId,
    "blocs",
    blocId
  );

  await updateDoc(blocRef, {
    elements,
    updatedAt: serverTimestamp(),
  });
}

export async function modifierBlocManuscrit(
  projetId,
  noteId,
  blocId,
  donnees
) {
  const blocRef = doc(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes",
    noteId,
    "blocs",
    blocId
  );

  await updateDoc(blocRef, {
    ...donnees,
    updatedAt: serverTimestamp(),
  });
}

export async function modifierBlocLien(
  projetId,
  noteId,
  blocId,
  donnees
) {
  const blocRef = doc(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes",
    noteId,
    "blocs",
    blocId
  );

  await updateDoc(blocRef, {
    ...donnees,
    updatedAt: serverTimestamp(),
  });
}

export async function modifierBlocImportant(
  projetId,
  noteId,
  blocId,
  donnees
) {
  const blocRef = doc(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes",
    noteId,
    "blocs",
    blocId
  );

  await updateDoc(blocRef, {
    ...donnees,
    updatedAt: serverTimestamp(),
  });
}

export async function modifierOrdreBlocs(
  projetId,
  noteId,
  blocs
) {
  const batch = writeBatch(db);

  blocs.forEach((bloc, index) => {
    const blocRef = doc(
      db,
      "Applications",
      "JoNote",
      "projets",
      projetId,
      "notes",
      noteId,
      "blocs",
      bloc.id
    );

    batch.update(blocRef, {
      ordre: (index + 1) * 1000,
      updatedAt: serverTimestamp(),
    });
  });

  await batch.commit();
}

export async function supprimerBloc(
  projetId,
  noteId,
  blocId
) {
  const blocRef = doc(
    db,
    "Applications",
    "JoNote",
    "projets",
    projetId,
    "notes",
    noteId,
    "blocs",
    blocId
  );

  await deleteDoc(blocRef);
}