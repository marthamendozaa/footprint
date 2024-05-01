import axios from 'axios';


// Autentificación del usuario
export const autentificaUsuario = async (email, password) => {
  const response = await axios.post("http://127.0.0.1:5001/evertech-sprint2/us-central1/autentificaUsuario", {
    email: email,
    password: password
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
  const response = await axios.post("http://127.0.0.1:5001/evertech-sprint2/us-central1/getUsuario", {
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
  const response = await axios.post("http://127.0.0.1:5001/evertech-sprint2/us-central1/actualizaUsuario", {
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
  const response = await axios.post("http://127.0.0.1:5001/evertech-sprint2/us-central1/actualizaContrasena", {
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
  const response = await axios.get("http://127.0.0.1:5001/evertech-sprint2/us-central1/getHabilidades");
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
  const response = await axios.get("http://127.0.0.1:5001/evertech-sprint2/us-central1/getIntereses");
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
  const response = await axios.get("http://127.0.0.1:5001/evertech-sprint2/us-central1/getRegiones");
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
  const response = await axios.get("http://127.0.0.1:5001/evertech-sprint2/us-central1/getIniciativas");
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
  const response = await axios.post("http://127.0.0.1:5001/evertech-sprint2/us-central1/getIniciativa", {
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
  const response = await axios.post("http://127.0.0.1:5001/evertech-sprint2/us-central1/crearIniciativa", {
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
  const response = await axios.post("http://127.0.0.1:5001/evertech-sprint2/us-central1/actualizaIniciativa", {
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
  const response = await axios.post("http://127.0.0.1:5001/evertech-sprint2/us-central1/eliminaIniciativa", {
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

  const response = await axios.post('http://127.0.0.1:5001/evertech-sprint2/us-central1/subirImagen', formData, {
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