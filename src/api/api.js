import axios from 'axios';

// FIREBASE FUNCTIONS

// URL para pruebas locales
const isEmulator = JSON.parse(import.meta.env.VITE_EMULATOR);
const functionsURL = isEmulator ? 'http://127.0.0.1:5001/evertech-sprint2/us-central1' : 'https://us-central1-evertech-sprint2.cloudfunctions.net';
console.log(functionsURL);


// Autentificación del usuario
export const autentificaUsuario = async (email, password) => {
  const response = await axios.post(`${functionsURL}/autentificaUsuario`, {
    email: email,
    password: password,
    isEmulator: isEmulator
  });
  if (response.data.success) {
    console.log("Autentificación exitosa");
    return response.data.data;
  } else {
    console.log("Error en autentificación");
    throw new Error(response.data.error);
  }
};


// Registro del usuario
export const crearUsuario = async (data) => {
  const response = await axios.post(`${functionsURL}/crearUsuario`, {
    data: data
  });
  if (response.data.success) {
    console.log("Registro exitoso");
    return response.data;
  } else {
    console.log("Error en registro");
    throw new Error(response.data.error);
  }
};


// Actualiza información del usuario
export const actualizaUsuario = async (data) => {
  const response = await axios.post(`${functionsURL}/actualizaUsuario`, {
    data: data
  });
  if (response.data.success) {
    console.log("Actualizando usuario exitoso");
    return;
  } else {
    console.log("Error actualizando usuario");
    throw new Error(response.data.error);
  }
};


// Actualiza contraseña del usuario
export const actualizaContrasena = async (user, data) => {
  const response = await axios.post(`${functionsURL}/actualizaContrasena`, {
    user: user,
    data: data
  });
  if (response.data.success) {
    console.log("Actualizando contraseña exitoso");
    return;
  } else {
    console.log("Error actualizando contraseña");
    throw new Error(response.data.error);
  }
};


// Crear una iniciativa
export const crearIniciativa = async (data) => {
  const response = await axios.post(`${functionsURL}/crearIniciativa`, {
    data: data
  });
  if (response.data.success) {
    console.log("Crear iniciativa exitoso");
    return response.data.data;
  } else {
    console.log("Error creando iniciativa");
    return response.data.error;
  }
};


// Actualizar una iniciativa
export const actualizaIniciativa = async (data) => {
  const response = await axios.post(`${functionsURL}/actualizaIniciativa`, {
    data: data
  });
  if (response.data.success) {
    console.log("Actualizar iniciativa exitoso");
    return response.data.data;
  } else {
    console.log("Error actualizando iniciativa");
    throw new Error(response.data.error);
  }
};


// Eliminar una iniciativa
export const eliminaIniciativa = async (iniciativa) => {
  const response = await axios.post(`${functionsURL}/eliminaIniciativa`, {
    iniciativa: iniciativa,
  });
  if (response.data.success) {
    console.log("Eliminar iniciativa exitoso");
    return response.data.data;
  } else {
    console.log("Error eliminando iniciativa");
    throw new Error(response.data.error);
  }
};


// Subir imágenes a Storage
export const subirImagen = async (imagen, path) => {
  const formData = new FormData();
  formData.append('imagen', imagen);
  formData.append('path', path);
  formData.append('isEmulator', isEmulator);

  const response = await axios.post(`${functionsURL}/subirImagen`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (response.data.success) {
    console.log("Subir imagen exitoso");
    return response.data.data;
  } else {
    console.log("Error subiendo imagen");
    throw new Error(response.data.error);
  }
};


// Suscribe el usuario a una iniciativa
export const suscribirseAIniciativa = async (user, iniciativa) => {
  const response = await axios.post(`${functionsURL}/suscribirseAIniciativa`, {
    user: user,
    iniciativa: iniciativa
  });
  if (response.data.success) {
    console.log("Suscribir usuario a iniciativa exitoso");
    return response.data.success;
  } else {
    console.log("Error suscribiendo usuario a iniciativa");
    throw new Error(response.data.error);
  }
};


// Crea las tareas de la iniciativa
export const crearTareas = async (data) => {
  const response = await axios.post(`${functionsURL}/crearTareas`, {
    data: data
  });
  if (response.data.success) {
    console.log("Crear tareas exitoso");
    return response.data.data;
  } else {
    console.log("Error creando tareas");
    return response.data.error;
  }
};


// Crear solicitudes
export const crearSolicitud = async (solicitud) => {
  const response = await axios.post(`${functionsURL}/crearSolicitud`, {
    solicitud: solicitud
  });
  if (response.data.success) {
    console.log("Crear solicitud exitoso");
    return response.data;
  } else {
    console.log("Error creando solicitud");
    throw new Error(response.data.error);
  }
};


// LECTURAS CON FIREBASE CLIENT

// Firebase Client SDK
import { query, where, doc, collection, getDoc, getDocs, connectFirestoreEmulator } from "firebase/firestore";
import firestore from "../api/firebase-config";

if (isEmulator) {
  connectFirestoreEmulator(firestore, 'localhost', 8080);
}


// Verifica correo duplicado
export const existeCorreo = async (correo) => {
  try {
    const q = query(collection(firestore, "Usuarios"), where('correo', '==', correo));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length) {
      console.log("Correo ya existe");
      return true;
    } else {
      console.log("Correo no existe");
      return false;
    }
  } catch (error) {
    console.log("Error verificando correo");
    throw new Error(error);
  }
};


// Verifica nombre de usuario duplicado
export const existeNombreUsuario = async (nombreUsuario) => {
  try {
    const q = query(collection(firestore, "Usuarios"), where('nombreUsuario', '==', `@${nombreUsuario}`));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length) {
      console.log("Nombre de usuario ya existe");
      return true;
    } else {
      console.log("Nombre de usuario no existe");
      return false;
    }
  } catch (error) {
    console.log("Error verificando nombre de usuario");
    throw new Error(error);
  }
};


// Obtener lista de habilidades
export const getHabilidades = async () => {
  try {
    const habilidades = await getDoc(doc(firestore, "General", "Habilidades"));
    console.log("Obtener habilidades exitoso");
    return habilidades.data();
  } catch (error) {
    console.log("Error obteniendo habilidades");
    throw new Error(error);
  }
};


// Obtener lista de intereses
export const getIntereses = async () => {
  try {
    const intereses = await getDoc(doc(firestore, "General", "Intereses"));
    console.log("Obtener intereses exitoso");
    return intereses.data();
  } catch (error) {
    console.log("Error obteniendo intereses");
    throw new Error(error);
  }
};


// Obtener lista de regiones
export const getRegiones = async () => {
  try {
    const regiones = await getDoc(doc(firestore, "General", "Regiones"));
    console.log("Obtener regiones exitoso");
    return regiones.data();
  } catch (error) {
    console.log("Error obteniendo regiones");
    throw new Error(error);
  }
};


// Información de la iniciativa
export const getIniciativa = async (idIniciativa) => {
  try {
    const iniciativa = await getDoc(doc(firestore, "Iniciativas", idIniciativa));
    console.log("Obtener iniciativa exitoso");
    return iniciativa.data();
  } catch (error) {
    console.log("Error obteniendo iniciativa");
    throw new Error(error);
  }
};


// Información de todas las iniciativas
export const getIniciativas = async () => {
  try {
    const iniciativasRef = await getDocs(collection(firestore, "Iniciativas"));
    let iniciativas = [];
    for (const docRef of iniciativasRef.docs) {
      iniciativas.push(docRef.data());
    }
    console.log("Obtener iniciativas exitoso");
    return iniciativas;
  } catch (error) {
    console.log("Error obteniendo iniciativas");
    throw new Error(error);
  }
};


// Información de todas las iniciativas del usuario
export const getMisIniciativas = async (user) => {
  try {
    const usuario = await getDoc(doc(firestore, "Usuarios", user));

    // Iniciativas donde es miembro
    let iniciativasMiembro = [];
    for (const idIniciativa of usuario.data().listaIniciativasMiembro) {
      const iniciativa = await getDoc(doc(firestore, "Iniciativas", idIniciativa));
      iniciativasMiembro.push(iniciativa.data());
    }

    // Iniciativas creadas
    let iniciativasAdmin = [];
    for (const idIniciativa of usuario.data().listaIniciativasAdmin) {
      const iniciativa = await getDoc(doc(firestore, "Iniciativas", idIniciativa));
      iniciativasAdmin.push(iniciativa.data());
    }

    // Iniciativas favoritas
    let iniciativasFavoritas = [];
    for (const idIniciativa of usuario.data().listaIniciativasFavoritas) {
      const iniciativa = await getDoc(doc(firestore, "Iniciativas", idIniciativa));
      iniciativasFavoritas.push(iniciativa.data());
    }

    const iniciativasData = { iniciativasMiembro, iniciativasAdmin, iniciativasFavoritas };
    console.log("Obtener mis iniciativas exitoso");
    return iniciativasData;
  } catch (error) {
    console.log("Error obteniendo mis iniciativas");
    throw new Error(error);
  }
};


// Información del usuario
export const getUsuario = async (user) => {
  try {
    const usuario = await getDoc(doc(firestore, "Usuarios", user));
    console.log("Obtener usuario exitoso");
    return usuario.data();
  } catch (error) {
    console.log("Error obteniendo usuario");
    throw new Error(error);
  }
};


// Get solicitudes
export const getSolicitudes = async (collection, id) => {
  try {
    const objeto = await getDoc(doc(firestore, collection, id));
    let solicitudes = [];
    for (const docRef of objeto.data().listaSolicitudes) {
      const solicitud = await getDoc(doc(firestore, "Solicitudes", docRef));
      solicitudes.push(solicitud.data());
    }
    console.log("Obtener solicitudes exitoso");
    return solicitudes;
  } catch (error) {
    console.log("Error obteniendo solicitudes");
    throw new Error(error);
  }
};


// Obtener tareas de la iniciativa
export const getMisTareas = async (idTarea) => {
  try {
    const tarea = await getDoc(doc(firestore, "Tareas", idTarea));
    console.log("Obtener tarea exitoso");
    return tarea.data();
  } catch (error) {
    console.log("Error obteniendo tarea");
    throw new Error(error);
  }
};