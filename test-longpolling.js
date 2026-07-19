import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCHkuyoGEVpVtszL1vwZfViJSNDrfu_8lc",
  authDomain: "restoranotomasyon-d8055.firebaseapp.com",
  projectId: "restoranotomasyon-d8055",
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

async function run() {
  console.log("Fetching with long polling...");
  const start = Date.now();
  await getDocs(collection(db, "orders"));
  console.log("Done in", Date.now() - start, "ms");
  process.exit(0);
}
run();
