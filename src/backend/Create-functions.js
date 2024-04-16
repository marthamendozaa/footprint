import { db, database } from "./firebase-config.js";
import { get, set, ref, child, push } from "firebase/database";

// Crear iniciativa: mostrar etiquetas
export const getEtiquetas = async () => {
  try {
    const snapshot = await get(child(db, `Intereses`));
    const listaEtiquetas  = snapshot.val();
    const etiquetas = [];

    for (const idEtiqueta in listaEtiquetas){
      const etiquetasSnapshot = await get(child(db, `Intereses/${idEtiqueta}`));
      etiquetas.push(etiquetasSnapshot.val());
    };
    return etiquetas;

  } catch (error) {
    console.error("Error obteniendo lista de intereses: ", error.message);
    return null;
  }
};

// Crear iniciativa: mostrar regiones
export const getRegiones = async () => {
  try {
    const snapshot = await get(child(db, `Regiones`));
    const listaRegiones  = snapshot.val();
    const regiones = [];

    for (const idRegion in listaRegiones){
      const regionesSnapshot = await get(child(db, `Regiones/${idRegion}`));
      regiones.push(regionesSnapshot.val());
    };
    return regiones;

  } catch (error) {
    console.error("Error obteniendo lista de regiones: ", error.message);
    return null;
  }
};


// Crear iniciativa
export const crearIniciativa = async (infoIniciativa) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }
  infoIniciativa.idAdmin = user.uid;
  
  try {
    const nuevaIdIniciativa = push(child(ref(database), 'Iniciativa')).key;
    infoIniciativa.idIniciativa = nuevaIdIniciativa;
    
    const iniciativaRef = ref(database, `Iniciativas/${nuevaIdIniciativa}`);
    await set(iniciativaRef, infoIniciativa);
    console.log("Nueva Iniciativa creada: ", infoIniciativa);

  } catch (error) {
    console.error("Error creando iniciativa: ", error.message);
  }
};