import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBLHYNfoKr4woJsClqr8xLX6PWUKUJ4214",
  authDomain: "nails-for-you.firebaseapp.com",
  projectId: "nails-for-you",
  storageBucket: "nails-for-you.firebasestorage.app",
  messagingSenderId: "60474241959",
  appId: "1:60474241959:web:1dfca6f918dcea52153c82",
};

const app = initializeApp(firebaseConfig);

// É aqui que a mágica acontece e exportamos para a tela de Login usar!
export const auth = getAuth(app);
