const logger = require("firebase-functions/logger");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

initializeApp();


// Autentificación del usuario
exports.autentificaUsuario = onRequest(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await getAuth().getUserByEmail(email);
    const userPassword = user.passwordHash.split('password=')[1];
    if (userPassword === password) {
      res.json({ success: true, data: user.uid });
    } else {
      logger.info("Contraseña incorrecta");
      res.status(401).json({ success: false, error: 'Authentication failed' });
    }
  } catch (error) {
    logger.info("Error en autentificación: ", error.message);
    res.status(401).json({ success: false, error: error.message });
  }
});


// Información del usuario
exports.getUsuario = onRequest(async (req, res) => {
  const { user } = req.body;

  try {
    const usuarioRef = await getFirestore().doc(`Usuarios/${user}`).get();
    const usuario = usuarioRef.data();
    res.json({ success: true, data: usuario });
  } catch (error) {
    logger.info("Error obteniendo usuario: ", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Actualiza información del usuario
exports.actualizaUsuario = onRequest(async (req, res) => {
  const { user, data } = req.body;

  try {
    await getFirestore().doc(`Usuarios/${user}`).update(data);
    res.json({ success: true });
  } catch (error) {
    logger.info("Error actualizando usuario: ", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Obtener lista de habilidades
exports.getHabilidades = onRequest(async (req, res) => {
  try {
    const habilidadesRef = await getFirestore().doc("General/Habilidades").get();
    const habilidades = habilidadesRef.data();
    res.json({ success: true, data: habilidades });
  } catch (error) {
    logger.info("Error obteniendo lista de habilidades: ", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Obtener lista de intereses
exports.getIntereses = onRequest(async (req, res) => {
  try {
    const interesesRef = await getFirestore().doc("General/Intereses").get();
    const intereses = interesesRef.data();
    res.json({ success: true, data: intereses });
  } catch (error) {
    logger.info("Error obteniendo lista de intereses: ", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Obtener lista de regiones
exports.getRegiones = onRequest(async (req, res) => {
  try {
    const regionesRef = await getFirestore().doc("General/Regiones").get();
    const regiones = regionesRef.data();
    res.json({ success: true, data: regiones });
  } catch (error) {
    logger.info("Error obteniendo lista de regiones: ", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Información de la iniciativa
exports.getIniciativa = onRequest(async (req, res) => {
  const { idIniciativa } = req.body;

  try {
    const iniciativaRef = await getFirestore().doc(`Iniciativas/${idIniciativa}`).get();
    const iniciativa = iniciativaRef.data();
    res.json({ success: true, data: iniciativa });
  } catch (error) {
    logger.info("Error obteniendo iniciativa: ", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


// Crear una iniciativa
exports.crearIniciativa = onRequest(async (req, res) => {
  const { data } = req.body;

  try {
    const iniciativasQuery = await getFirestore().collection('Iniciativas')
      .where('titulo', '==', data.titulo)
      .get();

    if (!iniciativasQuery.empty) {
      logger.info("Ya existe una iniciativa con el mismo título");
      res.json({ success: false, error: "Ya existe una iniciativa con el mismo título" });
    }
    
    res.json({ success: true, data: iniciativa });
  } catch (error) {
    logger.info("Error obteniendo iniciativa: ", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});


const { Storage } = require("@google-cloud/storage");
const { v4: uuid } = require("uuid");
const formidable = require("formidable-serverless");

const storage = new Storage({});

exports.subirImagen = onRequest(async (req, res) => {
  const form = new formidable.IncomingForm({ multiples: true, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      logger.info("Error parsing the files", err);
      return res.status(400).json({ success: false, error: "There was an error parsing the files"});
    }
    const profileImage = files.profileImage;
    const bucket = storage.bucket("gs://evertech-sprint2.appspot.com");
    await bucket.upload(profileImage.path, {
      destination: `users/${profileImage.name}`,
      resumable: true,
      metadata: {
        metadata: {
          firebaseStorageDownloadTokens: uuid,
        },
      },
    });
    const storageHost = "http://localhost:9199";
    const imageUrl = `${storageHost}/evertech-sprint2.appspot.com/users/${profileImage.name}`;
    res.status(200).json({ success: true, data: imageUrl });
  });
});