import { db } from "./firebase-config.js";
import { child, get } from "firebase/database";

// Iniciativa: obtener información de una iniciativa
export const getIniciativa = async (idIniciativa) => {
  try {
    const snapshot = await get(child(db, `Iniciativas/${idIniciativa}`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log(`Iniciativa ${idIniciativa} no encontrada`);
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo iniciativa: ", error.message);
    return null;
  }
};