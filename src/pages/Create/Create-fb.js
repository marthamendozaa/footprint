import { db, database } from "../../backend/firebase-config.js";
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
export const crearIniciativa = async (iniciativa) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }
  iniciativa.idAdmin = user.uid;
  
  try {
    iniciativa.idIniciativa = push(child(ref(database), 'Iniciativa')).key;
    
    const iniciativaRef = ref(database, `Iniciativas/${iniciativa.idIniciativa}`);
    await set(iniciativaRef, iniciativa);
    console.log("Nueva iniciativa creada: ", iniciativa);

    try {
      const snapshot = await get(child(db, `Usuarios/${user.uid}/listaIniciativasAdmin`));
      const listaIniciativasAdmin = snapshot.val();
      listaIniciativasAdmin.push(iniciativa.idIniciativa);
  
      const usuarioRef = ref(database, `Usuarios/${user.uid}/listaIniciativasAdmin`);
      await set(usuarioRef, listaIniciativasAdmin);
      console.log("Iniciativa creada agregada a lista del usuario");
      
      return iniciativa.idIniciativa;
    } catch (error) {
      console.error("Error agregando iniciativa creada al usuario: ", error.message);
    }

  } catch (error) {
    console.error("Error creando iniciativa: ", error.message);
  }
};