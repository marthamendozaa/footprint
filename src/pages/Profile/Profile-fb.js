import { signOut, reauthenticateWithCredential, updatePassword, EmailAuthProvider } from "firebase/auth";
import { auth, db, database } from "../../backend/firebase-config.js";
import { child, get, set, ref } from "firebase/database";


// Perfil: información del usuario
export const getUsuario = async () => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const snapshot = await get(child(db, `Usuarios/${user.uid}`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log("El usuario no existe");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo usuario:", error.message);
    return null;
  }
};


//Actualizar nombres del usuario
export const updateUsuarioNombre = async (nuevoNombre) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No hay usuario autenticado");
    return;
  }

  try {
    await set(child(db, `Usuarios/${user.uid}/nombre`), nuevoNombre);
    console.log("Nombre de usuario actualizado exitosamente");
  } catch (error) {
    console.error("Error al actualizar el nombre de usuario:", error.message);
    throw error;
  }
};

//Cambiar contraseña
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

// Habilidades: todas las habilidades
export const getHabilidades = async () => {
  try {
    const snapshot = await get(child(db, `Habilidades`));
    const listaHabilidades  = snapshot.val();
    const habilidades = [];

    for (const idHabilidad in listaHabilidades){
      const habilidadesSnapshot = await get(child(db, `Habilidades/${idHabilidad}`));
      habilidades.push(habilidadesSnapshot.val());
    };
    return habilidades;

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
    const snapshot = await get(child(db, `Usuarios/${user.uid}/listaHabilidades`));

    if (snapshot.exists()) {
      const listaHabilidades  = snapshot.val();
      const habilidadesUsuario = [];

      for (const idHabilidad in listaHabilidades){
        const habilidadesSnapshot = await get(child(db, `Habilidades/${idHabilidad}`));
        
        if (habilidadesSnapshot.exists()) {
          habilidadesUsuario.push(habilidadesSnapshot.val());
          
        } else {
          console.log(`Habilidad ${idHabilidad} no encontrada`);
        }
      };
      return habilidadesUsuario;

    } else {
      console.log("La lista de habilidades del usuario no existe");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo lista de habilidades del usuario: ", error.message);
    return null;
  }
};


// Habilidades: agrega habilidad
export const agregaHabilidad = async (habilidad, idHabilidad) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }
  
  try {
    const snapshot = await get(child(db, `Usuarios/${user.uid}/listaHabilidades`));

    if (snapshot.exists()) {
      let listaHabilidades = snapshot.val();

      if (!listaHabilidades.hasOwnProperty(idHabilidad)) {
        listaHabilidades[idHabilidad] = habilidad;
      }

      const habilidadesRef = ref(database, `Usuarios/${user.uid}/listaHabilidades`);
      await set(habilidadesRef, listaHabilidades);
    }
  } catch (error) {
    console.error("Error agregando habilidad del usuario: ", error.message);
  }
};


// Habilidades: elimina habilidad
export const eliminaHabilidad = async (idHabilidad) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const snapshot = await get(child(db, `Usuarios/${user.uid}/listaHabilidades`));

    if (snapshot.exists()) {
      let listaHabilidades = snapshot.val();
      
      if (listaHabilidades.hasOwnProperty(idHabilidad)) {
        delete listaHabilidades[idHabilidad];
      }

      const habilidadesRef = ref(database, `Usuarios/${user.uid}/listaHabilidades`);
      await set(habilidadesRef, listaHabilidades);
    }
  } catch (error) {
    console.error("Error eliminando habilidad del usuario: ", error.message);
  }
};


// Intereses: todos los intereses
export const getIntereses = async () => {
  try {
    const snapshot = await get(child(db, `Intereses`));
    const listaIntereses  = snapshot.val();
    const intereses = [];

    for (const idInteres in listaIntereses){
      const interesesSnapshot = await get(child(db, `Intereses/${idInteres}`));
      intereses.push(interesesSnapshot.val());
    };
    return intereses;

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
    const snapshot = await get(child(db, `Usuarios/${user.uid}/listaIntereses`));

    if (snapshot.exists()) {
      const listaIntereses  = snapshot.val();
      const interesesUsuario = [];

      for (const idInteres in listaIntereses){
        const interesesSnapshot = await get(child(db, `Intereses/${idInteres}`));
        
        if (interesesSnapshot.exists()) {
          interesesUsuario.push(interesesSnapshot.val());
          
        } else {
          console.log(`Interés ${idInteres} no encontrado`);
        }
      };
      return interesesUsuario;

    } else {
      console.log("La lista de intereses del usuario no existe");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo lista de intereses del usuario: ", error.message);
    return null;
  }
};

//Intereses: agrega interés
export const agregaInteres = async (interes, idInteres) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }
  
  try {
    const snapshot = await get(child(db, `Usuarios/${user.uid}/listaIntereses`));

    if (snapshot.exists()) {
      let listaIntereses = snapshot.val();

      if (!listaIntereses.hasOwnProperty(idInteres)) {
        listaIntereses[idInteres] = interes;
      }

      const interesesRef = ref(database, `Usuarios/${user.uid}/listaIntereses`);
      await set(interesesRef, listaIntereses);
    }
  } catch (error) {
    console.error("Error agregando temas de interés del usuario: ", error.message);
  }
};

//Intereses: elimina interés
export const eliminaInteres = async (idInteres) => {
  const user = JSON.parse(sessionStorage.getItem('user'));
  if (!user) {
    console.error("No hay usuario autenticado");
    return null;
  }

  try {
    const snapshot = await get(child(db, `Usuarios/${user.uid}/listaIntereses`));

    if (snapshot.exists()) {
      let listaIntereses = snapshot.val();
      
      if (listaIntereses.hasOwnProperty(idInteres)) {
        delete listaIntereses[idInteres];
      }

      const interesesRef = ref(database, `Usuarios/${user.uid}/listaIntereses`);
      await set(interesesRef, listaIntereses);
    }
  } catch (error) {
    console.error("Error eliminando interés del usuario: ", error.message);
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