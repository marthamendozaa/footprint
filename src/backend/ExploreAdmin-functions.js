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
    let listaIniciativas = snapshot.val();

    const idAdmin = listaIniciativas[idIniciativa].idAdmin;
    delete listaIniciativas[idIniciativa];

    const iniciativasRef = ref(database, `Iniciativas`);
    await set(iniciativasRef, listaIniciativas);

    try {
      const snapshot = await get(child(db, `Usuarios/${idAdmin}/listaIniciativasAdmin`));
      let listaIniciativasAdmin = snapshot.val();
      listaIniciativasAdmin = listaIniciativasAdmin.filter(id => id !== idIniciativa);

      const adminRef = ref(database, `Usuarios/${idAdmin}/listaIniciativasAdmin`);
      await set(adminRef, listaIniciativasAdmin);

    } catch (error) {
      console.error("Error eliminando iniciativa de la lista del admin: ", error.message);
    }
  } catch (error) {
    console.error("Error eliminando iniciativa: ", error.message);
  }
};