import { firestore } from "../../backend/firebase-config.js";
import { collection, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";

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
