import { auth, firestore } from "../../backend/firebase-config.js";
import { reauthenticateWithCredential, updatePassword, EmailAuthProvider, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";


// Perfil: información del usuario
export const getUsuario = async () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const usuarioDocRef = doc(firestore, "Usuarios", user.uid);
    const docSnapshot = await getDoc(usuarioDocRef);

    if (docSnapshot.exists()) {
      return docSnapshot.data();
    } else {
      console.log("El usuario no existe");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo usuario:", error.message);
    return null;
  }
};


// Actualizar nombres del usuario
export const updateUsuarioNombre = async (nuevoNombre) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No hay usuario autenticado");
    return;
  }

  try {
    const usuarioRef = doc(firestore, "Usuarios", user.uid);
    await updateDoc(usuarioRef, { nombre: nuevoNombre });
    console.log("Nombre de usuario actualizado exitosamente");
  } catch (error) {
    console.error("Error al actualizar el nombre de usuario:", error.message);
    throw error;
  }
};


// Cambiar contraseña del usuario
export const cambiarContrasena = async (contrasenaActual, nuevaContrasena) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No hay usuario autenticado");
  }

  // Crear credencial con la contraseña actual
  const credential = EmailAuthProvider.credential(user.email, contrasenaActual);
  
  try {
    // Reautenticar al usuario con la credencial creada
    await reauthenticateWithCredential(user, credential);
    
    // Si la reautenticación es exitosa, cambiar la contraseña
    await updatePassword(user, nuevaContrasena);
    console.log("Contraseña cambiada exitosamente");
  } catch (error) {
    throw new Error("Error al cambiar la contraseña: " + error.message);
  }
};


// Obtener lista de habilidades
export const getHabilidades = async () => {
  try {
    const habilidadesRef = doc(firestore, "General", "Habilidades");
    const habilidadesSnapshot = await getDoc(habilidadesRef);
    
    return habilidadesSnapshot.data();
  } catch (error) {
    console.error("Error obteniendo lista de habilidades: ", error.message);
    return null;
  }
};


// Habilidades: habilidades del usuario
export const getHabilidadesUsuario = async () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const usuarioRef = doc(firestore, "Usuarios", user.uid);
    const usuarioSnapshot = await getDoc(usuarioRef);

    const listaHabilidades = usuarioSnapshot.data().listaHabilidades;

    return listaHabilidades;
  } catch (error) {
    console.error("Error obteniendo lista de habilidades del usuario: ", error.message);
    return null;
  }
};


// Habilidades: actualiza habilidades
export const actualizaHabilidades = async (listaHabilidadesNueva) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const usuarioRef = doc(firestore, "Usuarios", user.uid);
    await updateDoc(usuarioRef, {listaHabilidades: listaHabilidadesNueva});
  } catch (error) {
    console.error("Error actualizando habilidades del usuario: ", error.message);
    return null;
  }
};


// Intereses: todos los intereses
export const getIntereses = async () => {
  try {
    const interesesRef = doc(firestore, "General", "Intereses");
    const interesesSnapshot = await getDoc(interesesRef);

    return interesesSnapshot.data();
  } catch (error) {
    console.error("Error obteniendo lista de intereses: ", error.message);
    return null;
  }
};


// Intereses: intereses del usuario
export const getInteresesUsuario = async () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const usuarioRef = doc(firestore, "Usuarios", user.uid);
    const usuarioSnapshot = await getDoc(usuarioRef);

    const listaIntereses = usuarioSnapshot.data().listaIntereses;

    return listaIntereses;
  } catch (error) {
    console.error("Error obteniendo lista de intereses del usuario: ", error.message);
    return null;
  }
};


// Intereses: actualiza intereses
export const actualizaIntereses = async (listaInteresesNueva) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const usuarioRef = doc(firestore, "Usuarios", user.uid);
    await updateDoc(usuarioRef, {listaIntereses: listaInteresesNueva});
  } catch (error) {
    console.error("Error actualizando intereses del usuario: ", error.message);
    return null;
  }
};


// Cierra sesión: cierre de sesión del usuario
export const cerrarSesion = async () => {
  try {
    await signOut(auth);
    console.log("Sesión cerrada exitosamente");
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
    throw error;
  }
};