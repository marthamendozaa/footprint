import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { child, get} from "firebase/database";


// Login: autentificación del usuario
export const loginUsuario = async (email, password, setUser) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Login exitoso:", user);
    sessionStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    return user;
  }
  catch (error) {
    console.error("Error al hacer login:", error.message);
    throw error;
  }
};


// Login: verificar si el usuario es administrador
export const getEsAdmin = async (user) => {
  try {
    const snapshot = await get(child(db, `Usuarios/${user.uid}`));
    if (snapshot.exists()) {
      const esAdmin = snapshot.val().esAdmin;
      return esAdmin;
    } else {
      console.log("El usuario no existe");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo usuario:", error.message);
    return null;
  }
};