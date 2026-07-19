const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const config = {
  apiKey: "AIzaSyCHkuyoGEVpVtszL1vwZfViJSNDrfu_8lc",
  authDomain: "restoranotomasyon-d8055.firebaseapp.com",
  projectId: "restoranotomasyon-d8055",
  storageBucket: "restoranotomasyon-d8055.firebasestorage.app",
  messagingSenderId: "675112504485",
  appId: "1:675112504485:web:ebc7e1abb50ae3ac24114c",
  measurementId: "G-ZDCGL80ES2"
};

const app = initializeApp(config);
const db = getFirestore(app);
async function run() {
  const pSnap = await getDocs(collection(db, "products"));
  const cSnap = await getDocs(collection(db, "categories"));
  console.log("Products count:", pSnap.docs.length);
  console.log("Categories count:", cSnap.docs.length);
  if (pSnap.docs.length > 0) {
    console.log("First product:", pSnap.docs[0].data());
  }
}
run();
