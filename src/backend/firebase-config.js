import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD0iR6PPEeDPELDoccOFu9MgIguZALUVgQ",
  authDomain: "evertech-sprint2.firebaseapp.com",
  projectId: "evertech-sprint2",
  storageBucket: "evertech-sprint2.appspot.com",
  messagingSenderId: "183811382302",
  appId: "1:183811382302:web:fbeba06dfd22f97316e20f"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app)

export { auth, firestore, storage };
