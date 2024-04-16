import { db, database } from "./firebase-config.js";
import { child, get, set, ref} from "firebase/database";

// Explora Admin: todas las iniciativas
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

// Explora Admin: eliminar iniciativa
export const eliminaIniciativa = async (idIniciativa) => {
  try {
    const snapshot = await get(child(db, `Iniciativas`));

    if (snapshot.exists()) {
      let listaIniciativas = snapshot.val();
      
      if (listaIniciativas.hasOwnProperty(idIniciativa)) {
        delete listaIniciativas[idIniciativa];
      }

      const iniciativasRef = ref(database, `Iniciativas`);
      await set(iniciativasRef, listaIniciativas);
    }
  } catch (error) {
    console.error("Error eliminando iniciativa: ", error.message);
  }
};