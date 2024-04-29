import { firestore } from "../../backend/firebase-config.js";
import { doc, getDoc } from "firebase/firestore";


// Iniciativa: obtener información de una iniciativa
export const getIniciativa = async (idIniciativa) => {
  try {
    const iniciativaRef = doc(firestore, "Iniciativas", idIniciativa);
    const docSnapshot = await getDoc(iniciativaRef);

    if (docSnapshot.exists()) {
      return docSnapshot.data();
    } else {
      console.log(`Iniciativa ${idIniciativa} no encontrada`);
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo iniciativa: ", error.message);
    return null;
  }
};