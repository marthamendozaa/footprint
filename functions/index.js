const logger = require("firebase-functions/logger");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { Storage } = require("@google-cloud/storage");
const { v4: uuid } = require("uuid");
const formidable = require("formidable-serverless");
const axios = require('axios');
const cors = require('cors')({ origin: true });
const config = require('./config');

initializeApp();
const auth = getAuth();


// Autentificación del usuario
exports.autentificaUsuario = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { email, password, isEmulator } = req.body;

    try {
      const url = isEmulator ? 'http://127.0.0.1:9099' : 'https:/';
      const response = await axios.post(`${url}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${config.apiKey}`, {
        email,
        password,
        returnSecureToken: true
      });

      const { data } = response;
      const user = data.localId;
      logger.info("Usuario autenticado:", user);
      res.json({ success: true, data: user });
    } catch (error) {
      logger.info("Error en autentificación: ", error.message);
      res.json({ success: false, error: error.message });
    }
  });
});


// Registro de usuario
exports.crearUsuario = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { data } = req.body;

    try {
      const user = await auth.createUser({ email: data.correo, password: data.contrasena });
      data.idUsuario = user.uid;
      const { contrasena, ...usuario } = data;
      await getFirestore().doc(`Usuarios/${user.uid}`).set(usuario);
      res.json({ success: true });
    } catch (error) {
      logger.info("Error registrando usuario: ", error.message);
      res.json({ success: false });
    }
  });
});


// Actualiza información del usuario
exports.actualizaUsuario = onRequest(async (req, res) => {
  cors(req, res, async () => {
    const { user, data } = req.body;

    try {
      await getFirestore().doc(`Usuarios/${user}`).update(data);
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
    const { iniciativa, data } = req.body;

    try {
      await getFirestore().doc(`Iniciativas/${iniciativa}`).update(data);
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
      // Borrar iniciativa de Firestore
      const iniciativaRef = await getFirestore().doc(`Iniciativas/${iniciativa}`);
      const iniciativaData = await getFirestore().doc(`Iniciativas/${iniciativa}`).get();
      const admin = iniciativaData.data().idAdmin;
      const miembros = iniciativaData.data().listaMiembros;
      await iniciativaRef.delete();

      // Elimina tareas de la iniciativa
      for (const tarea of iniciativaData.data().listaTareas) {
        await getFirestore().doc(`Tareas/${tarea}`).delete();
      }
  
      // Elimina archivos en el folder
      const [files] = await bucket.getFiles({ prefix: `Iniciativas/${iniciativa}` });
      if (files.length > 0) {
        await Promise.all(files.map(file => file.delete()));
      }
  
      // Borrar iniciativa de lista de iniciativas del admin
      const usuarioRef = await getFirestore().doc(`Usuarios/${admin}`).get();
      const usuario = usuarioRef.data();
      const usuarioNuevo = { ...usuario, listaIniciativasAdmin: usuario.listaIniciativasAdmin.filter(id => id !== iniciativa) };
      await getFirestore().doc(`Usuarios/${admin}`).update(usuarioNuevo);

      // Borrar iniciativa de lista de iniciativas de los miembros
      for (const miembro of miembros) {
        const miembroRef = await getFirestore().doc(`Usuarios/${miembro}`).get();
        const miembroData = miembroRef.data();
        const miembroNuevo = { ...miembroData, listaIniciativasMiembro: miembroData.listaIniciativasMiembro.filter(id => id !== iniciativa) };
        await getFirestore().doc(`Usuarios/${miembro}`).update(miembroNuevo);
      }
      
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