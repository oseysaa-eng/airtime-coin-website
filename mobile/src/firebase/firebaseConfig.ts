// src/firebase/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCu5uSwO9MmUW3jB7PAuWtwYHL_Fx3KOss",
  authDomain: "atc-app-5fc99.firebaseapp.com",
  databaseURL: "https://atc-app-5fc99-default-rtdb.firebaseio.com",
  projectId: "atc-app-5fc99",
  storageBucket: "atc-app-5fc99.appspot.com",
  messagingSenderId: "1088495586379",
  appId: "1:1088495586379:web:86070f443b707feeb711ce",
  measurementId: "G-BXRXHNWR6D"
};

const app = initializeApp(firebaseConfig);

//export const auth = getAuth(app);

