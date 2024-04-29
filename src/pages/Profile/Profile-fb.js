import { auth, storage } from "../../backend/firebase-config.js";
import { reauthenticateWithCredential, updatePassword, EmailAuthProvider } from "firebase/auth";
import { uploadBytes, getDownloadURL, ref, deleteObject } from "firebase/storage";

//Imagen Perfil
export const uploadProfileImage = async (file) => {
  try {
    // Referencia al almacenamiento en Firebase
    const storageRef = ref(storage, `profile-images/${file.name}`);
    
    // Subir el archivo al almacenamiento
    await uploadBytes(storageRef, file);

    // Obtener la URL de descarga de la imagen subida
    const imageUrl = await getDownloadURL(storageRef);
    
    return imageUrl;
  } catch (error) {
    console.error("Error al subir la imagen de perfil:", error.message);
    throw error;
  }
};


//Borrar imagen anterior
export const deleteProfileImage = async (imageUrl) => {
  try {
    // Obtener la referencia a la imagen en Firebase Storage
    const imageRef = ref(storage, imageUrl);
    // Eliminar la imagen
    await deleteObject(imageRef);
    console.log("Imagen de perfil antigua eliminada exitosamente");
  } catch (error) {
    console.error("Error al eliminar la imagen de perfil antigua:", error.message);
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