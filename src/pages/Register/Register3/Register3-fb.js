import { firestore } from "../../../backend/firebase-config.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Intereses: todos los intereses
export const getIntereses = async () => {
  try {
    const interesesRef = doc(firestore, "General", "Intereses");
    const interesesSnapshot = await getDoc(interesesRef);

    return interesesSnapshot.data();
  } catch (error) {
    console.error("Error obteniendo lista de intereses: ", error.message);
    return null;
  }
};


// Intereses: actualiza intereses
export const actualizaIntereses = async (listaInteresesNueva) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const usuarioRef = doc(firestore, "Usuarios", user.uid);
    await updateDoc(usuarioRef, {listaIntereses: listaInteresesNueva});
  } catch (error) {
    console.error("Error actualizando intereses del usuario: ", error.message);
    return null;
  }
};