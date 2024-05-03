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