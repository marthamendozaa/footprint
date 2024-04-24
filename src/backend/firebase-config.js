import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase, ref } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCadgVY4YYKAekxSJp9xPyfJw76b5kWEng",
  authDomain: "evertech-sprint1.firebaseapp.com",
  databaseURL: "https://evertech-sprint1-default-rtdb.firebaseio.com/",
  projectId: "evertech-sprint1",
  storageBucket: "evertech-sprint1.appspot.com",
  messagingSenderId: "910018975332",
  appId: "1:910018975332:web:ae986df6395636a6577171"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const database = getDatabase(app);
const db = ref(database);
const storage = getStorage(app)

export { auth, db, database, storage };