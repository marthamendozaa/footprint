import { firestore } from "../../backend/firebase-config.js";
import { doc, getDoc } from "firebase/firestore";


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
    console.error("Error obteniendo lista de iniciativas miembro:", error.message);
    return null;
  }
};