import axios from 'axios';


// Autentificación del usuario
export const autentificaUsuario = async (email, password) => {
  const response = await axios.post("http://127.0.0.1:5001/evertech-sprint2/us-central1/autentificaUsuario", {
    email: email,
    password: password
  });
  if (response.data.success) {
    console.log("Login exitoso");
    return response.data.data;
  } else {
    console.log("Error en login");
    throw new Error(response.data.error);
  }
};


// Verifica si el usuario es administrador
export const getEsAdmin = async (id) => {
  const response = await axios.post("http://127.0.0.1:5001/evertech-sprint2/us-central1/getEsAdmin", {
    user: id
  });
  if (response.data.success) {
    console.log("Obtener admin exitoso");
    return response.data.data;
  } else {
    console.log("Error obteniendo admin");
    throw new Error(response.data.error);
  }
};


// Obtener lista de habilidades
export const getHabilidades = async () => {
  const response = await axios.get("http://127.0.0.1:5001/evertech-sprint2/us-central1/getHabilidades");
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.error);
  }
};


// Obtener lista de intereses
export const getIntereses = async () => {
  const response = await axios.get("http://127.0.0.1:5001/evertech-sprint2/us-central1/getIntereses");
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.error);
  }
};


// Obtener lista de regiones
export const getRegiones = async () => {
  const response = await axios.get("http://127.0.0.1:5001/evertech-sprint2/us-central1/getRegiones");
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.error);
  }
};