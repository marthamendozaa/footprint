import { firestore } from "../../backend/firebase-config.js";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";


// Mis Iniciativas: iniciativas donde es miembro
export const getIniciativasMiembro = async () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const usuarioRef = doc(firestore, "Usuarios", user.uid);
    const docSnapshot = await getDoc(usuarioRef);

    const listaIniciativasMiembro = docSnapshot.data().listaIniciativasMiembro;
    const iniciativasData = [];

    for (const idIniciativa of listaIniciativasMiembro){
      const iniciativaRef = doc(firestore, "Iniciativas", idIniciativa);
      const iniciativaSnapshot = await getDoc(iniciativaRef);

      if (iniciativaSnapshot.exists()) {
        iniciativasData.push(iniciativaSnapshot.data());
      } else {
        console.log(`Iniciativa ${idIniciativa} no encontrada`);
      }
    }

    return iniciativasData;
  } catch (error) {
    console.error("Error obteniendo lista de iniciativas miembro:", error.message);
    return null;
  }
};


// Mis Iniciativas: iniciativas donde es admin
export const getIniciativasAdmin = async () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const usuarioRef = doc(firestore, "Usuarios", user.uid);
    const docSnapshot = await getDoc(usuarioRef);

    const listaIniciativasAdmin = docSnapshot.data().listaIniciativasAdmin;
    const iniciativasData = [];

    for (const idIniciativa of listaIniciativasAdmin){
      const iniciativaRef = doc(firestore, "Iniciativas", idIniciativa);
      const iniciativaSnapshot = await getDoc(iniciativaRef);
      
      if (iniciativaSnapshot.exists()) {
        iniciativasData.push(iniciativaSnapshot.data());
      } else {
        console.log(`Iniciativa ${idIniciativa} no encontrada`);
      }
    }

    return iniciativasData;
  } catch (error) {
    console.error("Error obteniendo lista de iniciativas creadas:", error.message);
    return null;
  }
};


// Mis Iniciativas: iniciativas favoritas
export const getIniciativasFavoritas = async () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const usuarioRef = doc(firestore, "Usuarios", user.uid);
    const docSnapshot = await getDoc(usuarioRef);

    const listaIniciativasFavoritas = docSnapshot.data().listaIniciativasFavoritas;
    const iniciativasData = [];

    for (const idIniciativa of listaIniciativasFavoritas){
      const iniciativaRef = doc(firestore, "Iniciativas", idIniciativa);
      const iniciativaSnapshot = await getDoc(iniciativaRef);
      
      if (iniciativaSnapshot.exists()) {
        iniciativasData.push(iniciativaSnapshot.data());
      } else {
        console.log(`Iniciativa ${idIniciativa} no encontrada`);
      }
    }

    return iniciativasData;
  } catch (error) {
    console.error("Error obteniendo lista de iniciativas favoritas:", error.message);
    return null;
  }
};

// Eliminar iniciativa de lista de favoritos
export const eliminarFavoritas = async (idIniciativa) => {
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
    console.error("El documento del usuario no existe");
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

};