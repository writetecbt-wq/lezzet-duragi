const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyCHkuyoGEVpVtszL1vwZfViJSNDrfu_8lc",
  authDomain: "restoranotomasyon-d8055.firebaseapp.com",
  projectId: "restoranotomasyon-d8055",
  storageBucket: "restoranotomasyon-d8055.firebasestorage.app",
  messagingSenderId: "675112504485",
  appId: "1:675112504485:web:ebc7e1abb50ae3ac24114c",
  measurementId: "G-ZDCGL80ES2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  try {
    const p = await getDocs(collection(db, "products"));
    const c = await getDocs(collection(db, "categories"));
    console.log(`Products: ${p.size}, Categories: ${c.size}`);
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}
check();
