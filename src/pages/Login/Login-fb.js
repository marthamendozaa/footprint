import { auth, firestore } from "../../backend/firebase-config.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";


// Login: autentificación del usuario
export const loginUsuario = async (email, password, setUser) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Login exitoso:", user);
    setUser(user);
  } catch (error) {
    console.error("Error al hacer login:", error.message);
    throw error;
  }
};


// Login: verificar si el usuario es administrador
export const getEsAdmin = async (user) => {
  try {
    const usuarioRef = doc(firestore, "Usuarios", user.uid);
    const docSnapshot = await getDoc(usuarioRef);

    if (docSnapshot.exists()) {
      const esAdmin = docSnapshot.data().esAdmin;
      return esAdmin;
    } else {
      console.log("El usuario no existe");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    return null;
  }
};