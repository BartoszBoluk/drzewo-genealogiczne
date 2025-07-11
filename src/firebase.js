import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCQotd0NHYulbDOFM_qUhfYGK_AgT4u79Y",
  authDomain: "drzewo-genealogiczne-2becb.firebaseapp.com",
  projectId: "drzewo-genealogiczne-2becb",
  storageBucket: "drzewo-genealogiczne-2becb.firebasestorage.app",
  messagingSenderId: "563772634220",
  appId: "1:563772634220:web:5ef68b2deeb61637c5d449",
  measurementId: "G-580STDE2HS"
};
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export { db, auth }
