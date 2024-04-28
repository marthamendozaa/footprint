const logger = require("firebase-functions/logger");
const {onRequest} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

initializeApp();


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