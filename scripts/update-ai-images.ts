import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
// Need to require service account since TS might have issues resolving json without esModuleInterop
const serviceAccount = require('/Users/aly/Documents/antigravity/intelligent-lovelace/service-account.json');

// Initialize Firebase
if (!require('firebase-admin/app').getApps().length) {
    initializeApp({
      credential: cert(serviceAccount)
    });
}

const db = getFirestore();

const imageMap: Record<string, string> = {
  "Izgara Köfte": "/images/kofte_lux_1783944918152.jpg",
  "Tavuk Şiş": "/images/tavuk_sis_lux_1783944925977.jpg",
  "Karışık Pizza": "/images/pizza_lux_1783944935082.jpg",
  "Mercimek Çorbası": "/images/mercimek_lux_1783944943874.jpg",
  "Caesar Salata": "/images/caesar_lux_1783944953122.jpg",
  "Tavuk Kanat": "/images/kanat_lux_1783944962128.jpg",
  "Türk Çayı": "/images/cay_lux_1783944987292.jpg",
  "Türk Kahvesi": "/images/kahve_lux_1783944997721.jpg",
  "Taze Sıkma Portakal": "/images/portakal_lux_1783945005307.jpg",
  "Limonata": "/images/limonata_lux_1783945014047.jpg",
  "Ayran": "/images/ayran_lux_1783945022637.jpg",
  "Buzlu Kahve (Iced Latte)": "/images/icedlatte_lux_1783945031631.jpg",
  "Sütlaç": "/images/sutlac_lux_1783945066485.jpg",
  "Baklava": "/images/baklava_lux_1783945074668.jpg",
  "Cheesecake": "/images/cheesecake_lux_1783945083341.jpg",
};

async function updateImages() {
  const productsRef = db.collection('restaurants').doc('rest_demo_001').collection('products');
  const snapshot = await productsRef.get();
  
  let updatedCount = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const name = data.name;
    
    let keyToMatch = name;
    if (name.includes("Buzlu Kahve")) keyToMatch = "Buzlu Kahve (Iced Latte)";
    
    if (imageMap[keyToMatch]) {
      await doc.ref.update({ imageUrl: imageMap[keyToMatch] });
      console.log(`Updated ${name} with ${imageMap[keyToMatch]}`);
      updatedCount++;
    }
  }
  
  console.log(`Updated ${updatedCount} products with new AI images.`);
}

updateImages().catch(console.error);
