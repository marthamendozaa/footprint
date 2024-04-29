import { firestore, storage } from "../../backend/firebase-config.js";
import { collection, doc, updateDoc, addDoc, arrayUnion, query, where, getDocs } from "firebase/firestore";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";

// Crear iniciativa
export const crearIniciativa = async (iniciativa, imagen) => {
  // Asignar id del usuario como administrador de la iniciativa
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return [null, null];
  }
  iniciativa.idAdmin = user.uid;

  // Verificar que no exista una iniciativa con el mismo título
  const iniciativasQuery = query(collection(firestore, "Iniciativas"), where("titulo", "==", iniciativa.titulo));
  const iniciativasSnapshot = await getDocs(iniciativasQuery);
  if (!iniciativasSnapshot.empty) {
    console.error("Ya existe una iniciativa con el mismo título");
    return [true, null];
  }

  // Subir imagen a Firebase Storage
  if (imagen) {
    try {
      const storageRef = ref(storage, `initiative-images/${imagen.name}`);
      await uploadBytes(storageRef, imagen);
      const urlImagen = await getDownloadURL(storageRef);
      iniciativa.urlImagen = urlImagen;
    } catch (error) {
      console.error("Error subiendo imagen: ", error.message);
      return [null, null];
    } 
  }
  
  // Guardar fecha de creación
  const timestamp = new Date();
  iniciativa.fechaCreacion = timestamp;

  // Subir iniciativa a Firestore
  let idIniciativaNueva = null;
  try {
    const iniciativasRef = collection(firestore, "Iniciativas");
    const iniciativaDocRef = await addDoc(iniciativasRef, iniciativa.convertirAObjeto());
    idIniciativaNueva = iniciativaDocRef.id;
    
    await updateDoc(iniciativaDocRef, { idIniciativa: idIniciativaNueva });
  } catch (error) {
    console.error("Error creando iniciativa: ", error.message);
    return [null, null];
  }

  // Agregar iniciativa creada al usuario
  try {
    const usuarioDocRef = doc(firestore, "Usuarios", user.uid);
    await updateDoc(usuarioDocRef, { listaIniciativasAdmin: arrayUnion(idIniciativaNueva) });
  } catch (error) {
    console.error("Error agregando iniciativa creada al usuario: ", error.message);
    return [null, null];
  }

  return [null, idIniciativaNueva];
};