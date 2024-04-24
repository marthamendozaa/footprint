import { firestore } from "../../backend/firebase-config.js";
import { collection, doc, getDoc, updateDoc, addDoc, arrayUnion } from "firebase/firestore";


// Crear iniciativa: mostrar etiquetas
export const getEtiquetas = async () => {
  try {
    const etiquetasDocRef = doc(firestore, "General", "Intereses");
    const etiquetasDocSnapshot = await getDoc(etiquetasDocRef);
    const etiquetas = etiquetasDocSnapshot.data();
    
    return etiquetas;
  } catch (error) {
    console.error("Error obteniendo lista de etiquetas: ", error.message);
    return null;
  }
};


// Crear iniciativa: mostrar regiones
export const getRegiones = async () => {
  try {
    const regionesDocRef = doc(firestore, "General", "Regiones");
    const regionesDocSnapshot = await getDoc(regionesDocRef);
    const regiones = regionesDocSnapshot.data();
    
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
    const iniciativasRef = collection(firestore, "Iniciativas");
    const iniciativaDocRef = await addDoc(iniciativasRef, iniciativa.convertirAObjeto());
    const idIniciativaNueva = iniciativaDocRef.id;
    
    await updateDoc(iniciativaDocRef, { idIniciativa: idIniciativaNueva });
    
    try {
      const usuarioDocRef = doc(firestore, "Usuarios", user.uid);
      await updateDoc(usuarioDocRef, { listaIniciativasAdmin: arrayUnion(idIniciativaNueva) });
      
      return idIniciativaNueva;
    } catch (error) {
      console.error("Error agregando iniciativa creada al usuario: ", error.message);
      return null;
    }
  } catch (error) {
    console.error("Error creando iniciativa: ", error.message);
    return null;
  }
};