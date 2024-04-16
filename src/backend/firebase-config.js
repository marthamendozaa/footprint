import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCN3VcpUepRMmeWU4HM5OE5WLAsYE_aaG8",
  authDomain: "evertech-db.firebaseapp.com",
  databaseURL: "https://evertech-db-default-rtdb.firebaseio.com",
  projectId: "evertech-db",
  storageBucket: "evertech-db.appspot.com",
  messagingSenderId: "224256696685",
  appId: "1:224256696685:web:5a9a31d1516ccb6d9d7a64"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);
const db = ref(database);

export { auth, db, database };