import { firestore } from "../../backend/firebase-config.js";
import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc, arrayRemove } from "firebase/firestore";

// Explora Admin: todas las iniciativas
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

// Explora Admin: eliminar iniciativa
export const eliminaIniciativa = async (idIniciativa) => {
  try {
    const iniciativaDocRef = doc(firestore, "Iniciativas", idIniciativa);
    const iniciativaDocSnapshot = await getDoc(iniciativaDocRef);
    const idAdmin = iniciativaDocSnapshot.data().idAdmin;

    await deleteDoc(iniciativaDocRef);
    const adminDocRef = doc(firestore, "Usuarios", idAdmin);
    await updateDoc(adminDocRef, { listaIniciativasAdmin: arrayRemove(idIniciativa) });

    return true;
  } catch (error) {
    console.error("Error eliminando iniciativa: ", error.message);
    return null;
  }
};