import { firestore, storage } from "../../backend/firebase-config.js";
import { collection, doc, getDoc, getDocs, updateDoc, deleteDoc, arrayRemove } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";

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
    const iniciativa = iniciativaDocSnapshot.data();
    const idAdmin = iniciativa.idAdmin;
    
    if (iniciativa.urlImagen.includes("firebasestorage.googleapis.com")) {
      const imagenRef = ref(storage, iniciativa.urlImagen);
      await deleteObject(imagenRef);
    }

    await deleteDoc(iniciativaDocRef);
    const adminDocRef = doc(firestore, "Usuarios", idAdmin);
    await updateDoc(adminDocRef, { listaIniciativasAdmin: arrayRemove(idIniciativa) });

    return true;
  } catch (error) {
    console.error("Error eliminando iniciativa: ", error.message);
    return null;
  }
};