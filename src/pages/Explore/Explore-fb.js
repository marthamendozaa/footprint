import { db } from "../../backend/firebase-config.js";
import { child, get} from "firebase/database";

// Explora: todas las iniciativas
export const getIniciativas = async () => {
  try {
    const snapshot = await get(child(db, `Iniciativas`));
    const listaIniciativas = snapshot.val();
    const iniciativas = [];

    for (const idIniciativa in listaIniciativas){
      const iniciativaSnapshot = await get(child(db, `Iniciativas/${idIniciativa}`));
      iniciativas.push(iniciativaSnapshot.val());
    };
    return iniciativas;

  } catch (error) {
    console.error("Error obteniendo lista de iniciativas: ", error.message);
    return null;
  }
};