import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHkuyoGEVpVtszL1vwZfViJSNDrfu_8lc",
  authDomain: "restoranotomasyon-d8055.firebaseapp.com",
  projectId: "restoranotomasyon-d8055",
  storageBucket: "restoranotomasyon-d8055.firebasestorage.app",
  messagingSenderId: "675112504485",
  appId: "1:675112504485:web:ebc7e1abb50ae3ac24114c",
  measurementId: "G-ZDCGL80ES2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  try {
    console.log("Attempting to write to orders collection...");
    await setDoc(doc(db, "orders", "test_order_123"), { test: "data" });
    console.log("Success!");
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}
test();
