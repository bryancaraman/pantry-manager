// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-CY9eqUOtgMQ2686NOqHL2g8G4QTzXJw",
  authDomain: "pantry-manager-80402.firebaseapp.com",
  projectId: "pantry-manager-80402",
  storageBucket: "pantry-manager-80402.appspot.com",
  messagingSenderId: "559870327399",
  appId: "1:559870327399:web:fd32a1f7d3a02cc9cbb2c2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}