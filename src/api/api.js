import axios from 'axios';

const isEmulator = JSON.parse(import.meta.env.VITE_EMULATOR);

// LECTURAS CON FIREBASE CLIENT

// Firebase Client SDK
import { query, where, orderBy, doc, collection, getDoc, getDocs, connectFirestoreEmulator } from "firebase/firestore";
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
    const q = query(collection(firestore, "Iniciativas"), orderBy("fechaCreacion", "asc"));
    const iniciativasRef = await getDocs(q);
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


// Información de todos los usuarios
export const getUsuarios = async () => {
  try {
    const usuariosRef = await getDocs(collection(firestore, "Usuarios"));
    let usuarios = {};
    for (const docRef of usuariosRef.docs) {
      const usuario = docRef.data();
      usuarios[usuario.idUsuario] = usuario;
    }
    console.log("Obtener usuarios exitoso");
    return usuarios;
  } catch (error) {
    console.log("Error obteniendo usuarios", error);
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

// Obtener miembros de la iniciativa
export const getMiembros = async (idIniciativa) => {
  try {
    const iniciativa = await getDoc(doc(firestore, "Iniciativas", idIniciativa));
    let miembros = [];
    for (const docRef of iniciativa.data().listaMiembros) {
      const miembro = await getDoc(doc(firestore, "Usuarios", docRef));
      miembros.push(miembro.data());
    }
    console.log("Obtener miembros exitoso");
    return miembros;
  } catch (error) {
    console.log("Error obteniendo miembros");
    throw new Error(error);
  }
}


// Verifica si el usuario ya mandó solicitud a la iniciativa
export const existeSolicitud = async (idUsuario, idIniciativa) => {
  try {
    const q = query(collection(firestore, "Solicitudes"), where('idUsuario', '==', idUsuario), where('idIniciativa', '==', idIniciativa));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.docs.length) {
      console.log("Solicitud ya existe");
      return querySnapshot.docs[0].id;
    } else {
      console.log("Solicitud no existe");
      return null;
    }
  } catch (error) {
    console.log("Error verificando solicitud");
    throw new Error(error);
  }
};





// FIREBASE FUNCTIONS

// URL para pruebas locales
const functionsURL = isEmulator ? 'http://127.0.0.1:5001/evertech-sprint2/us-central1' : 'https://us-central1-evertech-sprint2.cloudfunctions.net';
console.log(functionsURL);


// Autentificación del usuario
export const autentificaUsuario = async (email, password) => {
  try {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
    const url = isEmulator ? 'http://127.0.0.1:9099' : 'https:/';
    const response = await axios.post(`${url}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
      email,
      password,
      returnSecureToken: true
    });

    const { data } = response;
    const user = data.localId;
    console.log("Autentificación exitosa");
    return user;
  } catch (error) {
    console.log("Error en autentificación");
    throw new Error(error);
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
export const eliminaIniciativa = async (iniciativa, user) => {
  const response = await axios.post(`${functionsURL}/eliminaIniciativa`, {
    iniciativa: iniciativa,
    user: user
  });
  if (response.data.success) {
    console.log("Eliminar iniciativa exitoso");
    return response.data.success;
  } else {
    console.log("Error eliminando iniciativa");
    throw new Error(response.data.error);
  }
};


// Eliminar una iniciativa
export const eliminarMiembro = async (iniciativa, user) => {
  const response = await axios.post(`${functionsURL}/eliminarMiembro`, {
    iniciativa: iniciativa,
    user: user
  });
  if (response.data.success) {
    console.log("Miembro eliminado exitosamente");
    return response.data.data;
  } else {
    console.log("Error eliminando miembro");
    throw new Error(response.data.error);
  }
};


// Eliminar una iniciativa
export const eliminarSolicitud = async (idSolicitud) => {
  const response = await axios.post(`${functionsURL}/eliminaSolicitud`, {
    solicitud: idSolicitud,
  });
  if (response.data.success) {
    console.log("Solicitud eliminada exitosamente");
    return response.data.data;
  } else {
    console.log("Error eliminando solicitud");
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


// Actualizar tarea
export const actualizaTarea = async (data) => {
  const response = await axios.post(`${functionsURL}/actualizaTarea`, {
    data: data
  });
  if (response.data.success) {
    console.log("Actualizar tarea exitoso");
    return response.data.data;
  } else {
    console.log("Error actualizando tarea");
    throw new Error(response.data.error);
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


// Actualiza información de solicitud
export const actualizaSolicitud = async (data) => {
  const response = await axios.post(`${functionsURL}/actualizaSolicitud`, {
    data: data
  });
  if (response.data.success) {
    console.log("Actualizando solicitud exitoso");
    return;
  } else {
    console.log("Error actualizando solicitud");
    throw new Error(response.data.error);
  }
};


// Enviar correo de notificación al eliminar iniciativa
export const enviarCorreoIniciativa = async (iniciativa) => {
  const adminRef = await getDoc(doc(firestore, "Usuarios", iniciativa.idAdmin));
  const admin = adminRef.data();

  const message = {
    subject: `Notificación sobre la eliminación de tu iniciativa ${iniciativa.titulo}`,
    text: `Estimado/a ${admin.nombre},\n\nLamentamos informarte que tu iniciativa ${iniciativa.titulo} ha sido borrada por los administradores debido a que no cumple con los estándares de la plataforma. Si tienes alguna duda sobre el motivo de esta decisión, te invitamos a ponerte en contacto con la administración para obtener más información.\n\nAgradecemos tu comprensión.\n\nSaludos cordiales,\nAdministración de Evertech`
  }  

  const response = await axios.post(`${functionsURL}/enviarCorreo`, {
    email: admin.correo,
    message: message
  });

  if (response.data.success) {
    console.log("Envio de correo exitoso");
    return;
  } else {
    console.log("Error enviando correo");
    throw new Error(response.data.error);
  }
}


// Enviar correo de notificación al eliminar miembro de iniciativa
export const enviarCorreoMiembro = async (iniciativa, miembro) => {
  const message = {
    subject: `Notificación sobre tu participación en la iniciativa ${iniciativa.titulo}`,
    text: `Estimado/a ${miembro.nombre},\n\nLamentamos informarte que has sido removido/a de la iniciativa ${iniciativa.titulo}. Si tienes alguna duda sobre el motivo de esta decisión, te invitamos a ponerte en contacto con la persona a cargo de la iniciativa para obtener más información.\n\nAgradecemos tu comprensión.\n\nSaludos cordiales,\nAdministración de Evertech`
  }

  const response = await axios.post(`${functionsURL}/enviarCorreo`, {
    email: miembro.correo,
    message: message
  });

  if (response.data.success) {
    console.log("Envio de correo exitoso");
    return;
  } else {
    console.log("Error enviando correo");
    throw new Error(response.data.error);
  }
}


// Enviar correo de notificación al asignar miembro a una tarea
export const enviarCorreoTarea = async (iniciativa, miembro, tarea) => {
  try {
    const message = {
      subject: `Notificación sobre tu asignación a la tarea ${tarea.titulo}`,
      text: `Estimado/a ${miembro.nombre},\n\nNos complace informarte que has sido asignado/a a la tarea ${tarea.titulo} en la iniciativa ${iniciativa.titulo}. Si tienes alguna duda, te invitamos a ponerte en contacto con la persona a cargo de la iniciativa.\n\nSaludos cordiales,\nAdministración de Evertech`
    }

    const response = await axios.post(`${functionsURL}/enviarCorreo`, {
      email: miembro.correo,
      message: message
    });

    if (response.data.success) {
      console.log("Envio de correo exitoso");
      return;
    } else {
      console.log("Error enviando correo");
      throw new Error(response.data.error);
    }
  } catch (error) {
    console.log("Error sending email");
    throw new Error(error);
  }
}

