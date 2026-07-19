import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

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
    const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newOrder = {
      id: orderId,
      tableNumber: 1,
      status: "PENDING",
      totalAmount: 150,
      createdAt: serverTimestamp(),
      items: [
        {
          productId: "prod_001",
          name: "Izgara Köfte",
          quantity: 1,
          unitPrice: 150,
          categoryId: "cat_ana_yemek_001",
          id: `${orderId}_item_0`,
          status: "PENDING"
        }
      ],
      notes: "",
      waiterName: "",
      restaurantId: "rest_demo_001",
      source: "DINE_IN",
    };

    console.log("Attempting to place full order...");
    await setDoc(doc(db, "orders", orderId), newOrder);
    console.log("Success! Order placed:", orderId);
  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}
test();
