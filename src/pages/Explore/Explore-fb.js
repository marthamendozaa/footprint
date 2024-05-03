import { firestore } from "../../backend/firebase-config.js";
import { collection, doc, getDocs, updateDoc, arrayRemove, arrayUnion, getDoc } from "firebase/firestore";

// Explora: todas las iniciativas
export const getIniciativas = async () => {
  try {
    const iniciativasRef = collection(firestore, "Iniciativas");
    const querySnapshot = await getDocs(iniciativasRef);

    const iniciativas = [];

    querySnapshot.forEach((doc) => {
      iniciativas.push({ id: doc.id, ...doc.data() });
    });

    return iniciativas;
  } catch (error) {
    console.error("Error obteniendo lista de iniciativas: ", error.message);
    return null;
  }
};
/*
export const addFavoritas = async (idIniciativa) => {
  console.log("Sí se presionó el botón");
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  const idIniciativaFavoritaNueva = idIniciativa;
  const usuarioDocRef = doc(firestore, "Usuarios", user.uid);
  
  // Obtener el documento del usuario de Firestore
  const usuarioDocSnap = await getDocs(usuarioDocRef);
  if (!usuarioDocSnap.exists()) {
    console.error("El documento del usuario no existe.");
    return null;
  }

   // Acceder a los datos del documento del usuario
   const usuarioData = usuarioDocSnap.data();
   if (!usuarioData.listaIniciativasFavoritas) {
     console.error("La lista de iniciativas favoritas no está definida en el documento del usuario.");
     return null;
   }

   const listaIniciativasFavoritas = usuarioData.listaIniciativasFavoritas;

  // Eliminar iniciativa de lista de favoritos del usuario
  if (listaIniciativasFavoritas.includes(idIniciativaFavoritaNueva)){
    await updateDoc(usuarioDocRef, { listaIniciativasFavoritas: arrayRemove(idIniciativaFavoritaNueva) });
  }

  // Agregar iniciativa a lista de favoritos del usuario
  try {
    await updateDoc(usuarioDocRef, { listaIniciativasFavoritas: arrayUnion(idIniciativaFavoritaNueva) });
  } catch (error) {
    console.error("Error agregando iniciativa a lista de favoritos del usuario: ", error.message);
    return [null, null];
  }

};
*/
export const addFavoritas = async (idIniciativa) => {
  console.log("Sí se presionó el botón");
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  const idIniciativaFavoritaNueva = idIniciativa;
  const usuarioDocRef = doc(firestore, "Usuarios", user.uid);

  // Obtener el documento del usuario de Firestore
  const usuarioDocSnap = await getDoc(usuarioDocRef);
  if (!usuarioDocSnap.exists()) {
    console.error("El documento del usuario no existe.");
    return null;
  }

  // Acceder a los datos del documento del usuario
  const usuarioData = usuarioDocSnap.data();
  if (!usuarioData.listaIniciativasFavoritas) {
    console.error("La lista de iniciativas favoritas no está definida en el documento del usuario.");
    return null;
  }

  const listaIniciativasFavoritas = usuarioData.listaIniciativasFavoritas;

  // Eliminar iniciativa de lista de favoritos del usuario
  if (listaIniciativasFavoritas.includes(idIniciativaFavoritaNueva)){
    await updateDoc(usuarioDocRef, { listaIniciativasFavoritas: arrayRemove(idIniciativaFavoritaNueva) });
    console.log("Iniciativa eliminada");
  }

  // Agregar iniciativa a lista de favoritos del usuario
  else try{
    await updateDoc(usuarioDocRef, { listaIniciativasFavoritas: arrayUnion(idIniciativaFavoritaNueva) });
    console.log("Iniciativa agregada");
  } catch (error) {
    console.error("Error agregando iniciativa a lista de favoritos del usuario: ", error.message);
    return [null, null];
  }
};