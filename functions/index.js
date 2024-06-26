const logger = require("firebase-functions/logger");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { Storage } = require("@google-cloud/storage");
const { v4: uuid } = require("uuid");
const formidable = require("formidable-serverless");
const cors = require('cors')({ origin: true });

initializeApp();
const auth = getAuth();


// Registro de usuario
exports.crearUsuario = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { data } = req.body;

    try {
      const user = await auth.createUser({ email: data.correo, password: data.contrasena });
      data.idUsuario = user.uid;
      const { contrasena, ...usuario } = data;
      await getFirestore().doc(`Usuarios/${user.uid}`).set(usuario);
      res.json({ success: true, data: user.uid});
    } catch (error) {
      logger.info("Error registrando usuario: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});


// Actualiza información del usuario
exports.actualizaUsuario = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { data } = req.body;

    try {
      await getFirestore().doc(`Usuarios/${data.idUsuario}`).update(data);
      res.json({ success: true });
    } catch (error) {
      logger.info("Error actualizando usuario: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});


// Actualiza contraseña del usuario
exports.actualizaContrasena = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { user, data } = req.body;

    try {
      await getAuth().updateUser(user, {password: data});
      res.json({ success: true });
    } catch (error) {
      logger.info("Error actualizando contraseña: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});


// Crea una iniciativa
exports.crearIniciativa = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { data } = req.body;

    try {
      // Verifica existencia de iniciativas duplicadas
      const iniciativasQuery = await getFirestore().collection('Iniciativas')
        .where('titulo', '==', data.titulo)
        .get();
  
      if (!iniciativasQuery.empty) {
        logger.info("Ya existe una iniciativa con el mismo título");
        return res.json({ success: false, error: 409 });
      }
  
      // Crea iniciativa en Firestore
      const iniciativaData = await getFirestore().collection('Iniciativas').add(data);
  
      // Actualiza lista de iniciativas del admin
      const usuarioRef = await getFirestore().doc(`Usuarios/${data.idAdmin}`).get();
      const usuario = usuarioRef.data();
      const usuarioNuevo = { ...usuario, listaIniciativasAdmin: [...usuario.listaIniciativasAdmin, iniciativaData.id] };
      await getFirestore().doc(`Usuarios/${data.idAdmin}`).update(usuarioNuevo);
  
      res.json({ success: true, data: iniciativaData.id });
    } catch (error) {
      logger.info("Error creando iniciativa: ", error.message);
      res.json({ success: false, error: 500 });
    }
  });
});


// Actualiza información de iniciativa
exports.actualizaIniciativa = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { data } = req.body;

    try {
      await getFirestore().doc(`Iniciativas/${data.idIniciativa}`).update(data);
      res.json({ success: true });
    } catch (error) {
      logger.info("Error actualizando iniciativa: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});


// Elimina iniciativa
exports.eliminaIniciativa = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const storage = new Storage({});
    const bucket = storage.bucket("gs://evertech-sprint2.appspot.com");
    const { iniciativa } = req.body;
  
    try {
      const iniciativaRef = await getFirestore().doc(`Iniciativas/${iniciativa}`);
      const iniciativaData = await getFirestore().doc(`Iniciativas/${iniciativa}`).get();

      // Elimina solicitudes de la iniciativa
      logger.info("Borrando solicitudes de la iniciativa...");
      for (const solicitud of iniciativaData.data().listaSolicitudes) {
        // Borrar solicitud de Firestore
        const solicitudRef = await getFirestore().doc(`Solicitudes/${solicitud}`);
        const solicitudData = await getFirestore().doc(`Solicitudes/${solicitud}`).get();
        await solicitudRef.delete();

        // Borrar solicitud de la lista de solicitudes del usuario que la creó
        const idUsuario = solicitudData.data().idUsuario;
        const usuarioRef = await getFirestore().doc(`Usuarios/${idUsuario}`).get();
        const usuario = usuarioRef.data();
        const usuarioNuevo = { ...usuario, listaSolicitudes: usuario.listaSolicitudes.filter(id => id !== solicitud) };
        await getFirestore().doc(`Usuarios/${idUsuario}`).update(usuarioNuevo);
      }
      
      // Elimina tareas de la iniciativa
      logger.info("Borrando tareas de la iniciativa...");
      for (const tarea of iniciativaData.data().listaTareas) {
        await getFirestore().doc(`Tareas/${tarea}`).delete();
        
        // Elimina archivos en el folder de la tareas
        logger.info("Borrando archivos de la tarea...");
        const [files] = await bucket.getFiles({ prefix: `Tareas/${tarea}` });
        if (files.length > 0) {
          await Promise.all(files.map(file => file.delete()));
        }
      }
      
      // Elimina archivos en el folder
      logger.info("Borrando imagen de la iniciativa...");
      const [files] = await bucket.getFiles({ prefix: `Iniciativas/${iniciativa}` });
      if (files.length > 0) {
        await Promise.all(files.map(file => file.delete()));
      }
      
      // Elimina iniciativa de lista de iniciativas del admin
      logger.info("Borrando iniciativa de admin...");
      const admin = iniciativaData.data().idAdmin;
      const usuarioRef = await getFirestore().doc(`Usuarios/${admin}`).get();
      const usuario = usuarioRef.data();
      const usuarioNuevo = { ...usuario, listaIniciativasAdmin: usuario.listaIniciativasAdmin.filter(id => id !== iniciativa) };
      await getFirestore().doc(`Usuarios/${admin}`).update(usuarioNuevo);
      
      // Elimina iniciativa de lista de iniciativas de los miembros
      logger.info("Borrando iniciativa de miembros...");
      const miembros = iniciativaData.data().listaMiembros;
      for (const miembro of miembros) {
        const miembroRef = await getFirestore().doc(`Usuarios/${miembro}`).get();
        const miembroData = miembroRef.data();
        const miembroNuevo = { ...miembroData, listaIniciativasMiembro: miembroData.listaIniciativasMiembro.filter(id => id !== iniciativa) };
        await getFirestore().doc(`Usuarios/${miembro}`).update(miembroNuevo);
      }

      // Query para obtener usuarios donde la iniciativa esté en lista de favoritas
      logger.info("Borrando iniciativa de favoritos...");
      const usuariosQuery = await getFirestore().collection('Usuarios')
        .where('listaIniciativasFavoritas', 'array-contains', iniciativa)
        .get();
      
      // Elimina iniciativa de lista de favoritas de los usuarios
      for (const usuario of usuariosQuery.docs) {
        const usuarioData = usuario.data();
        const usuarioNuevo = { ...usuarioData, listaIniciativasFavoritas: usuarioData.listaIniciativasFavoritas.filter(id => id !== iniciativa) };
        await getFirestore().doc(`Usuarios/${usuario.id}`).update(usuarioNuevo);
      }
      
      // Borrar iniciativa de Firestore
      logger.info("Borrando iniciativa de Firestore...");
      await iniciativaRef.delete();
      
      res.json({ success: true });
    } catch (error) {
      logger.info("Error eliminando iniciativa: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});


// Subir imágenes a Storage
exports.subirImagen = onRequest(async (req, res) => {
  cors(req, res, async () => {
    // Configuración de Storage
    const storage = new Storage({});
    const bucket = storage.bucket("gs://evertech-sprint2.appspot.com");

    // Recibir imagen por form data
    const form = new formidable.IncomingForm({ multiples: true, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        logger.info("Error parsing the files", err);
        return res.status(400).json({ success: false, error: "There was an error parsing the files"});
      }
      const imagen = files.imagen;
      const path = fields.path;
      const isEmulator = fields.isEmulator;

      // Elimina archivos en el folder si ya existen
      const [filesInFolder] = await bucket.getFiles({ prefix: path });
      if (filesInFolder.length > 0) {
        await Promise.all(filesInFolder.map(file => file.delete()));
      }
      
      // Sube la imagen a Storage
      try {
        const token = uuid();
        await bucket.upload(imagen.path, {
          destination: `${path}/${imagen.name}`,
          resumable: true,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: token,
            },
          },
        });
        
        const url = isEmulator === "true" ? 'http://127.0.0.1:9199/evertech-sprint2.appspot.com' : 'https://firebasestorage.googleapis.com/v0/b/evertech-sprint2.appspot.com/o';
        const imagePath = `${path}/${imagen.name}`;
        const imageUrl = `${url}/${encodeURIComponent(imagePath)}?alt=media&token=${token}`;
        res.json({ success: true, data: imageUrl });
      } catch (error) {
        logger.info("Error subiendo imagen: ", error.message);
        res.json({ success: false, error: error.message });
      }
    });
  });
});


// Suscribe el usuario a una iniciativa
exports.suscribirseAIniciativa = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { user, iniciativa } = req.body;

    try {
      const usuarioRef = await getFirestore().doc(`Usuarios/${user}`).get();
      const usuario = usuarioRef.data();
      const usuarioNuevo = { ...usuario, listaIniciativasMiembro: [...usuario.listaIniciativasMiembro, iniciativa] };
      await getFirestore().doc(`Usuarios/${user}`).update(usuarioNuevo);

      const iniciativaRef = await getFirestore().doc(`Iniciativas/${iniciativa}`).get();
      const iniciativaData = iniciativaRef.data();
      const iniciativaNueva = { ...iniciativaData, listaMiembros: [...iniciativaData.listaMiembros, user] };
      await getFirestore().doc(`Iniciativas/${iniciativa}`).update(iniciativaNueva);

      res.json({ success: true });
    } catch (error) {
      logger.info("Error suscribiéndose a la iniciativa como miembro: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});


// Eliminar miembro de iniciativa
exports.eliminarMiembro = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { user, iniciativa } = req.body;

    try {
      // Información del usuario
      const usuarioRef = await getFirestore().doc(`Usuarios/${user}`).get();
      let usuarioData = usuarioRef.data();

      // Información de la iniciativa
      const iniciativaRef = await getFirestore().doc(`Iniciativas/${iniciativa}`).get();
      let iniciativaData = iniciativaRef.data();

      // Eliminar iniciativa del miembro
      usuarioData.listaIniciativasMiembro = usuarioData.listaIniciativasMiembro.filter(id => id !== iniciativa);
      // Eliminar miembro de la iniciativa
      iniciativaData.listaMiembros = iniciativaData.listaMiembros.filter(id => id !== user);

      // Eliminar solicitudes del miembro en la iniciativa
      const solicitudesQuery = await getFirestore().collection('Solicitudes')
      .where('idUsuario', '==', user)
      .where('idIniciativa', '==', iniciativa)
      .get();

      for (const solicitud of solicitudesQuery.docs) {
        usuarioData.listaSolicitudes = usuarioData.listaSolicitudes.filter(id => id !== solicitud.id);
        iniciativaData.listaSolicitudes = iniciativaData.listaSolicitudes.filter(id => id !== solicitud.id);
        await getFirestore().doc(`Solicitudes/${solicitud.id}`).delete();
      }
      
      await getFirestore().doc(`Usuarios/${user}`).update(usuarioData);
      await getFirestore().doc(`Iniciativas/${iniciativa}`).update(iniciativaData);

      // Reasignar tareas pendientes del miembro en la iniciativa
      const tareasQuery = await getFirestore().collection('Tareas')
        .where('idAsignado', '==', user)
        .where('idIniciativa', '==', iniciativa)
        .where('completada', '==', false)
        .get();
      
      for (const tarea of tareasQuery.docs) {
        const tareaNueva = { ...tarea.data(), idAsignado: null };
        await getFirestore().doc(`Tareas/${tarea.id}`).update(tareaNueva);
      }

      res.json({ success: true });
    } catch (error) {
      logger.info("Error eliminando miembro de la iniciativa: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});


// Crea las tareas de la iniciativa
exports.crearTareas = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { data } = req.body;

    let tareas = [];
    let idIniciativa = data[0].idIniciativa;
    try {
      for (const tarea of data) {
        const tareaData = await getFirestore().collection('Tareas').add(tarea);
        await getFirestore().doc(`Tareas/${tareaData.id}`).update({ idTarea: tareaData.id });
        tareas.push(tareaData.id);
      }
      await getFirestore().doc(`Iniciativas/${idIniciativa}`).update({ listaTareas: tareas });
      res.json({ success: true });
    } catch (error) {
      logger.info("Error creando tareas: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});


// Actualiza información de iniciativa
exports.actualizaTarea = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { data } = req.body;

    try {
      await getFirestore().doc(`Tareas/${data.idTarea}`).update(data);
      res.json({ success: true });
    } catch (error) {
      logger.info("Error actualizando tarea: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});


//Crea las solicitudes
exports.crearSolicitud = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { solicitud } = req.body;

    const idUsuario = solicitud.idUsuario;
    const idIniciativa = solicitud.idIniciativa;

    try {
      const solicitudData = await getFirestore().collection('Solicitudes').add(solicitud);
      const idSolicitud = solicitudData.id;
      await getFirestore().doc(`Solicitudes/${idSolicitud}`).update({ idSolicitud: idSolicitud });
    
      const usuarioRef = await getFirestore().doc(`Usuarios/${idUsuario}`).get();
      const usuario = usuarioRef.data();
      const usuarioNuevo = { ...usuario, listaSolicitudes: [...usuario.listaSolicitudes, idSolicitud] };
      await getFirestore().doc(`Usuarios/${idUsuario}`).update(usuarioNuevo);

      const iniciativaRef = await getFirestore().doc(`Iniciativas/${idIniciativa}`).get();
      const iniciativaData = iniciativaRef.data();
      const iniciativaNueva = { ...iniciativaData, listaSolicitudes: [...iniciativaData.listaSolicitudes, idSolicitud] };
      await getFirestore().doc(`Iniciativas/${idIniciativa}`).update(iniciativaNueva);
  
      res.json({ success: true, data: idSolicitud });
    } catch (error) {
      logger.info("Error creando solicitud: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});


// Actualiza información de la solicitud
exports.actualizaSolicitud = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { data } = req.body;

    try {
      await getFirestore().doc(`Solicitudes/${data.idSolicitud}`).update(data);
      res.json({ success: true });
    } catch (error) {
      logger.info("Error actualizando solicitud: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});


// Elimina solicitud
exports.eliminaSolicitud = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { solicitud } = req.body;
  
    try {
      // Borrar solicitud de Firestore
      const solicitudRef = await getFirestore().doc(`Solicitudes/${solicitud}`);
      const solicitudData = await getFirestore().doc(`Solicitudes/${solicitud}`).get();
      const idIniciativa = solicitudData.data().idIniciativa;
      const idUsuario = solicitudData.data().idUsuario;
      await solicitudRef.delete();
  
      // Borrar solicitud de lista de solicitudes de la iniciativa
      const iniciativaRef = await getFirestore().doc(`Iniciativas/${idIniciativa}`).get();
      const iniciativa = iniciativaRef.data();
      const iniciativaNueva = { ...iniciativa, listaSolicitudes: iniciativa.listaSolicitudes.filter(id => id !== solicitud) };
      await getFirestore().doc(`Iniciativas/${idIniciativa}`).update(iniciativaNueva);

      // Borrar solicitud de lista de solicitudes del usuario
      const usuarioRef = await getFirestore().doc(`Usuarios/${idUsuario}`).get();
      const usuario = usuarioRef.data();
      const usuarioNuevo = { ...usuario, listaSolicitudes: usuario.listaSolicitudes.filter(id => id !== solicitud) };
      await getFirestore().doc(`Usuarios/${idUsuario}`).update(usuarioNuevo);
      
      res.json({ success: true });
    } catch (error) {
      logger.info("Error eliminando miembro de iniciativa: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});


// Función para enviar correos de notificación
exports.enviarCorreo = onRequest(async (req, res) =>{
  cors(req, res, async () => {
    const { email, message } = req.body;

    try {
      const mail = { to: email, message: message };
      await getFirestore().collection('mail').add(mail);
      res.json({ success: true });
    } catch (error) {
      logger.info("Error enviando correo: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});


// Función para enviar correo de cambio de contraseña
exports.enviarCorreoContrasena = onRequest(async (req, res) =>{
  cors(req, res, async () => {
    const { email } = req.body;

    try {
      const link = await auth.generatePasswordResetLink(email);

      const message = {
        subject: `Restablece tu contraseña de Evertech`,
        text: `Hola:\n\nVisita este vínculo para restablecer la contraseña de Evertech para tu cuenta de ${email}.\n\nSi no solicitaste el restablecimiento de tu contraseña, puedes ignorar este correo electrónico.\n\n${link}`
      }

      const mail = { to: email, message: message };
      await getFirestore().collection('mail').add(mail);
      
      res.json({ success: true });
    } catch (error) {
      logger.info("Error enviando correo: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});