const logger = require("firebase-functions/logger");
const { onRequest } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

initializeApp();
const auth = getAuth();


// Autentificación del usuario
exports.autentificaUsuario = onRequest(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await auth.getUserByEmail(email);

    const userPassword = user.passwordHash.split('password=')[1];
    const passwordMatch = (userPassword === password);

    if (passwordMatch) {
      res.json({ success: true, data: user.uid });
    } else {
      res.status(401).json({ success: false, error: 'Authentication failed' });
    }
  } catch (error) {
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
});


// Verifica si el usuario es administrador
exports.getEsAdmin = onRequest(async (req, res) => {
  const { user } = req.body;

  try {
    const usuarioRef = await getFirestore().doc(`Usuarios/${user}`).get();
    const usuario = usuarioRef.data();
    
    res.json({ success: true, data: usuario.esAdmin });
  } catch (error) {
    console.error("Error obteniendo usuario: ", error.message);
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
    console.error("Error obteniendo lista de habilidades: ", error.message);
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
    console.error("Error obteniendo lista de intereses: ", error.message);
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
    console.error("Error obteniendo lista de regiones: ", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});