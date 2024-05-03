import { firestore } from "../../backend/firebase-config.js";
import { collection, getDocs, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";

// Explora: todas las iniciativas
export const getIniciativas = async () => {
  try {
    const iniciativasRef = collection(firestore, "Iniciativas");
    const querySnapshot = await getDocs(iniciativasRef);

    const iniciativas = [];

    querySnapshot.forEach((doc) => {
      iniciativas.push({ id: doc.id, ...doc.data() });
    });

    return iniciativas;
  } catch (error) {
    console.error("Error obteniendo lista de iniciativas: ", error.message);
    return null;
  }
};

export const suscribirseAIniciativa = async (idIniciativa) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }
  
  try {
    const usuarioDocRef = doc(firestore, "Usuarios", user.uid);
    await updateDoc(usuarioDocRef, { listaIniciativasMiembro: arrayUnion(idIniciativa) });
    
    return idIniciativa;
  } catch (error) {
    console.error("Error suscribiéndose a la iniciativa como miembro: ", error.message);
    return null;
  }
};

export const verificarRolUsuario = async (idUsuario, idIniciativa) => {
  try {
    const usuarioDocRef = doc(firestore, "Usuarios", idUsuario);
    const usuarioSnapshot = await getDoc(usuarioDocRef);
    const usuarioData = usuarioSnapshot.data();
    
    if (usuarioData) {
      const { listaIniciativasAdmin, listaIniciativasMiembro } = usuarioData;
      if (listaIniciativasAdmin.includes(idIniciativa)) {
        return "admin";
      } else if (listaIniciativasMiembro.includes(idIniciativa)) {
        return "miembro";
      }
    }
    
    return "visitante";
  } catch (error) {
    console.error("Error verificando el rol del usuario: ", error.message);
    return "visitante";
  }
};