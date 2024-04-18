import { db } from "../../backend/firebase-config.js";
import { child, get } from "firebase/database";

// Mis Iniciativas: iniciativas donde es miembro
export const getIniciativasMiembro = async () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const snapshot = await get(child(db, `Usuarios/${user.uid}/listaIniciativasMiembro`));

    if (snapshot.exists()) {
      const listaIniciativasMiembro = snapshot.val();
      const iniciativasData = [];

      await Promise.all(Object.values(listaIniciativasMiembro).map(async idIniciativa => {
        const iniciativaSnapshot = await get(child(db, `Iniciativas/${idIniciativa}`));

        if (iniciativaSnapshot.exists()) {
          iniciativasData.push(iniciativaSnapshot.val());
        } else {
          console.log(`Iniciativa ${idIniciativa} no encontrada`);
        }
      }));

      return iniciativasData;
    } else {
      console.log("La lista de iniciativas miembro no existe");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo lista de iniciativas miembro:", error.message);
    return null;
  }
};


// Mis Iniciativas: iniciativas donde es admin
export const getIniciativasAdmin = async () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const snapshot = await get(child(db, `Usuarios/${user.uid}/listaIniciativasAdmin`));

    if (snapshot.exists()) {
      const listaIniciativasAdmin = snapshot.val();
      const iniciativasData = [];

      await Promise.all(Object.values(listaIniciativasAdmin).map(async idIniciativa => {
        const iniciativaSnapshot = await get(child(db, `Iniciativas/${idIniciativa}`));
        
        if (iniciativaSnapshot.exists()) {
          iniciativasData.push(iniciativaSnapshot.val());
        } else {
          console.log(`Iniciativa ${idIniciativa} no encontrada`);
        }
      }));

      return iniciativasData;
    } else {
      console.log("La lista de iniciativas admin no existe");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo lista de iniciativas admin:", error.message);
    return null;
  }
};