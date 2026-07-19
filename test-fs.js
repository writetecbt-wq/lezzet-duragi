const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");
const fs = require("fs");
const env = fs.readFileSync(".env.local", "utf8");
const config = {};
env.split('\n').forEach(line => {
  const match = line.match(/^NEXT_PUBLIC_FIREBASE_([A-Z_]+)=(.*)$/);
  if (match) config[match[1]] = match[2].replace(/"/g, '');
});

const app = initializeApp({
  apiKey: config.API_KEY,
  authDomain: config.AUTH_DOMAIN,
  projectId: config.PROJECT_ID,
  storageBucket: config.STORAGE_BUCKET,
  messagingSenderId: config.MESSAGING_SENDER_ID,
  appId: config.APP_ID
});
const db = getFirestore(app);

async function check() {
  const p = await getDocs(collection(db, "products"));
  const c = await getDocs(collection(db, "categories"));
  console.log("Products count:", p.docs.length);
  p.docs.forEach(d => console.log(d.data()));
  console.log("Categories count:", c.docs.length);
  c.docs.forEach(d => console.log(d.data()));
  process.exit(0);
}
check();
