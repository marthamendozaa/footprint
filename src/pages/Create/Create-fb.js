import { firestore, storage } from "../../backend/firebase-config.js";
import { collection, doc, getDoc, updateDoc, addDoc, arrayUnion, query, where, getDocs } from "firebase/firestore";
import { uploadBytes, getDownloadURL, ref } from "firebase/storage";


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


export const crearTarea = async (tarea) => { //quite idIniciativa
  // Asignar id del usuario como administrador de la iniciativa
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return [null, null];
  }
  tarea.idAdmin = user.uid;

  // Guardar fecha de creación (NECESARIA?)
  const timestamp = new Date();
  tarea.fechaCreacion = timestamp;
  
  let idTareaNueva = null;

  try {
    const tareasRef = collection(firestore, "Tareas");
    const tareaDocRef = await addDoc(tareasRef, tarea.convertirAObjeto()); //no se que hace convertirAObjeto
    idTareaNueva = tareaDocRef.id;

    await updateDoc(tareaDocRef, {idTarea: idTareaNueva});
  } catch (error) {
    console.error("Error creando tarea: ", error.message);
    return [null, null];
  }

};

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


  // Crear tareas asociadas a la iniciativa
  const listaTareasIds = []; // Guardar los IDs de las tareas creadas
  if (iniciativa.listaTareas && iniciativa.listaTareas.length > 0) {
    for (const tarea of iniciativa.listaTareas) {
      const tareaId = await crearTarea(idIniciativaNueva, tarea);
      if (tareaId) {
        listaTareasIds.push(tareaId);
      } else {
        // Manejar el error si la tarea no se pudo crear
        console.error("Error al crear tarea asociada a la iniciativa");
      }
    }
  }

  return [null, idIniciativaNueva];
};

