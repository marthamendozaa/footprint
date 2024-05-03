import { firestore } from "../../../backend/firebase-config.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";

// Habilidades: todos las habilidades
export const getHabilidades = async () => {
  try {
    const habilidadesRef = doc(firestore, "General", "Habilidades");
    const habilidadesSnapshot = await getDoc(habilidadesRef);
    
    return habilidadesSnapshot.data();
  } catch (error) {
    console.error("Error obteniendo lista de habilidades: ", error.message);
    return null;
  }
};


// Habilidades: actualiza habilidades
export const actualizaHabilidades = async (listaHabilidadesNueva) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const usuarioRef = doc(firestore, "Usuarios", user.uid);
    await updateDoc(usuarioRef, {listaHabilidades: listaHabilidadesNueva});
  } catch (error) {
    console.error("Error actualizando habilidades del usuario: ", error.message);
    return null;
  }
};