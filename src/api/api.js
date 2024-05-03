import axios from 'axios';

// URL para pruebas locales
const isEmulator = JSON.parse(import.meta.env.VITE_EMULATOR);
const functionsURL = isEmulator ? 'http://127.0.0.1:5001/evertech-sprint2/us-central1' : 'https://us-central1-evertech-sprint2.cloudfunctions.net';


// Verifica correo duplicado
export const existeCorreo = async (correo) => {
  const response = await axios.post(`${functionsURL}/existeCorreo`, {
    correo: correo
  });
  if (response.data.success) {
    console.log("Verifica correo exitoso");
    return response.data.data;
  } else {
    console.log("Error verificando correo");
    throw new Error(response.data.error);
  }
};


// Verifica nombre de usuario duplicado
export const existeNombreUsuario = async (nombreUsuario) => {
  const response = await axios.post(`${functionsURL}/existeNombreUsuario`, {
    nombreUsuario: nombreUsuario
  });
  if (response.data.success) {
    console.log("Verifica nombre usuario exitoso");
    return response.data.data;
  } else {
    console.log("Error verificando nombre usuario");
    throw new Error(response.data.error);
  }
};


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


// Información del usuario
export const getUsuario = async (user) => {
  const response = await axios.post(`${functionsURL}/getUsuario`, {
    user: user
  });
  if (response.data.success) {
    console.log("Obtener usuario exitoso");
    return response.data.data;
  } else {
    console.log("Error obteniendo usuario");
    throw new Error(response.data.error);
  }
};


// Actualiza información del usuario
export const actualizaUsuario = async (user, data) => {
  const response = await axios.post(`${functionsURL}/actualizaUsuario`, {
    user: user,
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


// Obtener lista de habilidades
export const getHabilidades = async () => {
  const response = await axios.get(`${functionsURL}/getHabilidades`);
  if (response.data.success) {
    console.log("Obtener habilidades exitoso");
    return response.data.data;
  } else {
    console.log("Error obteniendo habilidades");
    throw new Error(response.data.error);
  }
};


// Obtener lista de intereses
export const getIntereses = async () => {
  const response = await axios.get(`${functionsURL}/getIntereses`);
  if (response.data.success) {
    console.log("Obtener intereses exitoso");
    return response.data.data;
  } else {
    console.log("Error obteniendo intereses");
    throw new Error(response.data.error);
  }
};


// Obtener lista de regiones
export const getRegiones = async () => {
  const response = await axios.get(`${functionsURL}/getRegiones`);
  if (response.data.success) {
    console.log("Obtener regiones exitoso");
    return response.data.data;
  } else {
    console.log("Error obteniendo regiones");
    throw new Error(response.data.error);
  }
};


// Información de todas las iniciativas
export const getIniciativas = async () => {
  const response = await axios.get(`${functionsURL}/getIniciativas`);
  if (response.data.success) {
    console.log("Obtener iniciativas exitoso");
    return response.data.data;
  } else {
    console.log("Error obteniendo iniciativas");
    throw new Error(response.data.error);
  }
};


// Información de la iniciativa
export const getIniciativa = async (idIniciativa) => {
  const response = await axios.post(`${functionsURL}/getIniciativa`, {
    idIniciativa: idIniciativa
  });
  if (response.data.success) {
    console.log("Obtener iniciativa exitoso");
    return response.data.data;
  } else {
    console.log("Error obteniendo iniciativa");
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
export const actualizaIniciativa = async (iniciativa, data) => {
  const response = await axios.post(`${functionsURL}/actualizaIniciativa`, {
    iniciativa: iniciativa,
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