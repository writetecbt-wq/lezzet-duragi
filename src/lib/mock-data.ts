import { CartItem } from "@/types";

// ─── Mock Restaurant Data ──────────────────────────────────────────────────

export const MOCK_RESTAURANT = {
  id: "rest_demo_001",
  name: "Lezzet Durağı",
  logoUrl: null,
};

export const MOCK_CATEGORIES = [
  { id: "cat_yiyecek_001", name: "Yiyecekler", emoji: "🍽️", sortOrder: 1 },
  { id: "cat_icecek_001", name: "İçecekler", emoji: "🥤", sortOrder: 2 },
  { id: "cat_tatli_001", name: "Tatlılar", emoji: "🍮", sortOrder: 3 },
];

export const MOCK_PRODUCTS = [
  // ── Yiyecekler ──
  {
    id: "prod_001",
    name: "Izgara Köfte",
    description: "El yapımı dana köfte, yanında pilav ve mevsim salata ile servis edilir",
    price: 180,
    imageUrl: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=80",
    isAvailable: true,
    sortOrder: 1,
    categoryId: "cat_yiyecek_001",
    tags: ["acili"],
  },
  {
    id: "prod_002",
    name: "Tavuk Şiş",
    description: "Marine edilmiş tavuk göğsü, közlenmiş sebzeler ve pilav ile",
    price: 160,
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76594d49cd4?w=400&q=80",
    isAvailable: true,
    sortOrder: 2,
    categoryId: "cat_yiyecek_001",
    tags: [],
  },
  {
    id: "prod_003",
    name: "Karışık Pizza",
    description: "Mozarella, sucuk, mantar, biber ve zeytinli büyük boy leziz pizza",
    price: 220,
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80",
    isAvailable: true,
    sortOrder: 3,
    categoryId: "cat_yiyecek_001",
    tags: ["sut"],
  },
  {
    id: "prod_004",
    name: "Mercimek Çorbası",
    description: "Geleneksel tarif ile pişirilmiş kırmızı mercimek çorbası, limon ile",
    price: 60,
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80",
    isAvailable: true,
    sortOrder: 4,
    categoryId: "cat_yiyecek_001",
    tags: ["vegan", "glutenFree"],
  },
  {
    id: "prod_005",
    name: "Caesar Salata",
    description: "Romaine marul, crouton, parmesan peyniri ve özel Caesar sos",
    price: 90,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80",
    isAvailable: true,
    sortOrder: 5,
    categoryId: "cat_yiyecek_001",
    tags: ["vejetaryen", "sut", "yumurta"],
  },
  {
    id: "prod_006",
    name: "Pide (Karışık)",
    description: "Kaşar peyniri, kıyma ve sebzelerle dolu fırında pişirilmiş pide",
    price: 140,
    imageUrl: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80",
    isAvailable: false,
    sortOrder: 6,
    categoryId: "cat_yiyecek_001",
    tags: ["sut"],
  },
  {
    id: "prod_006_2",
    name: "Mantı",
    description: "Sarımsaklı yoğurt, tereyağlı pul biber sosu ve taze nane ile ev yapımı Kayseri mantısı",
    price: 150,
    imageUrl: "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400&q=80",
    isAvailable: true,
    sortOrder: 7,
    categoryId: "cat_yiyecek_001",
    tags: ["sut", "yumurta", "acili"],
  },
  {
    id: "prod_006_3",
    name: "Lahmacun (Fındık)",
    description: "Özel harçlı, çıtır fırın lahmacun. Yanında limon ve yeşillik ile",
    price: 85,
    imageUrl: "https://images.unsplash.com/photo-1606850780554-b55ea4ebfabc?w=400&q=80",
    isAvailable: true,
    sortOrder: 8,
    categoryId: "cat_yiyecek_001",
    tags: ["acili"],
  },
  {
    id: "prod_006_4",
    name: "Tavuk Kanat",
    description: "Özel sosta marine edilmiş mangalda tavuk kanat",
    price: 170,
    imageUrl: "https://images.unsplash.com/photo-1608039755401-742074f0548f?w=400&q=80",
    isAvailable: true,
    sortOrder: 9,
    categoryId: "cat_yiyecek_001",
    tags: ["acili"],
  },
  // ── İçecekler ──
  {
    id: "prod_007",
    name: "Türk Çayı",
    description: "Demlikten taze çekilen çay, iki bardak",
    price: 25,
    imageUrl: "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&q=80",
    isAvailable: true,
    sortOrder: 1,
    categoryId: "cat_icecek_001",
    tags: ["vegan", "glutenFree"],
  },
  {
    id: "prod_008",
    name: "Türk Kahvesi",
    description: "Geleneksel pişirim, yanında lokum ikramı ile",
    price: 45,
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80",
    isAvailable: true,
    sortOrder: 2,
    categoryId: "cat_icecek_001",
    tags: ["vegan", "glutenFree"],
  },
  {
    id: "prod_009",
    name: "Taze Sıkma Portakal",
    description: "Günlük taze sıkılmış portakal suyu, 300ml",
    price: 55,
    imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80",
    isAvailable: true,
    sortOrder: 3,
    categoryId: "cat_icecek_001",
    tags: ["vegan", "glutenFree"],
  },
  {
    id: "prod_010",
    name: "Limonata",
    description: "Ev yapımı taze limonata, nane ile servis edilir",
    price: 50,
    imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80",
    isAvailable: true,
    sortOrder: 4,
    categoryId: "cat_icecek_001",
    tags: ["vegan", "glutenFree"],
  },
  {
    id: "prod_010_2",
    name: "Ayran",
    description: "Bol köpüklü naneli ev yapımı ayran",
    price: 35,
    imageUrl: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400&q=80",
    isAvailable: true,
    sortOrder: 5,
    categoryId: "cat_icecek_001",
    tags: ["vejetaryen", "glutenFree", "sut"],
  },
  {
    id: "prod_010_3",
    name: "Buzlu Kahve (Iced Latte)",
    description: "Soğuk süt, buz ve yoğun espresso",
    price: 70,
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80",
    isAvailable: true,
    sortOrder: 6,
    categoryId: "cat_icecek_001",
    tags: ["sut"],
  },
  // ── Tatlılar ──
  {
    id: "prod_011",
    name: "Sütlaç",
    description: "Fırında üstü kızarmış geleneksel sütlaç, tarçın ile",
    price: 75,
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80",
    isAvailable: true,
    sortOrder: 1,
    categoryId: "cat_tatli_001",
    tags: ["vejetaryen", "sut", "yumurta"],
  },
  {
    id: "prod_012",
    name: "Baklava",
    description: "Antep fıstıklı, tereyağlı özel baklava, 4 dilim",
    price: 120,
    imageUrl: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400&q=80",
    isAvailable: true,
    sortOrder: 2,
    categoryId: "cat_tatli_001",
    tags: ["vejetaryen", "fistik", "sut"],
  },
  {
    id: "prod_013",
    name: "Cheesecake",
    description: "New York usulü cheesecake, çilek sosu ile",
    price: 95,
    imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80",
    isAvailable: true,
    sortOrder: 3,
    categoryId: "cat_tatli_001",
    tags: ["vejetaryen", "sut", "yumurta"],
  },
  {
    id: "prod_014",
    name: "Künefe",
    description: "Hatay usulü, özel peynirli ve şerbetli sıcak künefe. Dondurma ile servis edilir.",
    price: 130,
    imageUrl: "https://images.unsplash.com/photo-1628181343729-1ee06775f0a0?w=400&q=80",
    isAvailable: true,
    sortOrder: 4,
    categoryId: "cat_tatli_001",
    tags: ["vejetaryen", "sut"],
  },
  {
    id: "prod_015",
    name: "Tiramisu",
    description: "Gerçek İtalyan mascarpone peyniri ve espresso ile",
    price: 110,
    imageUrl: "https://images.unsplash.com/photo-1571115177098-24de5004cb77?w=400&q=80",
    isAvailable: true,
    sortOrder: 5,
    categoryId: "cat_tatli_001",
    tags: ["vejetaryen", "sut", "yumurta"],
  },
];

// ─── Mock Orders (for Admin panel) ────────────────────────────────────────

export type MockOrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
};

export type MockOrder = {
  id: string;
  tableNumber: number;
  status: "PENDING" | "PREPARING" | "COMPLETED" | "CANCELLED";
  totalAmount: number;
  createdAt: Date;
  notes?: string;
  items: MockOrderItem[];
};

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "order_001",
    tableNumber: 3,
    status: "PENDING",
    totalAmount: 445,
    createdAt: new Date(Date.now() - 3 * 60 * 1000),
    notes: "Köfteler az pişmiş olsun lütfen",
    items: [
      { productId: "prod_001", name: "Izgara Köfte", quantity: 2, unitPrice: 180 },
      { productId: "prod_007", name: "Türk Çayı", quantity: 2, unitPrice: 25 },
      { productId: "prod_004", name: "Mercimek Çorbası", quantity: 1, unitPrice: 60 },
    ],
  },
  {
    id: "order_002",
    tableNumber: 7,
    status: "PREPARING",
    totalAmount: 330,
    createdAt: new Date(Date.now() - 12 * 60 * 1000),
    items: [
      { productId: "prod_003", name: "Karışık Pizza", quantity: 1, unitPrice: 220 },
      { productId: "prod_010", name: "Limonata", quantity: 2, unitPrice: 50 },
    ],
  },
  {
    id: "order_003",
    tableNumber: 1,
    status: "PREPARING",
    totalAmount: 215,
    createdAt: new Date(Date.now() - 8 * 60 * 1000),
    items: [
      { productId: "prod_002", name: "Tavuk Şiş", quantity: 1, unitPrice: 160 },
      { productId: "prod_008", name: "Türk Kahvesi", quantity: 1, unitPrice: 45 },
    ],
  },
  {
    id: "order_004",
    tableNumber: 5,
    status: "COMPLETED",
    totalAmount: 290,
    createdAt: new Date(Date.now() - 35 * 60 * 1000),
    items: [
      { productId: "prod_005", name: "Caesar Salata", quantity: 2, unitPrice: 90 },
      { productId: "prod_011", name: "Sütlaç", quantity: 1, unitPrice: 75 },
      { productId: "prod_007", name: "Türk Çayı", quantity: 1, unitPrice: 25 },
    ],
  },
  {
    id: "order_005",
    tableNumber: 9,
    status: "COMPLETED",
    totalAmount: 165,
    createdAt: new Date(Date.now() - 55 * 60 * 1000),
    items: [
      { productId: "prod_011", name: "Sütlaç", quantity: 1, unitPrice: 75 },
      { productId: "prod_013", name: "Cheesecake", quantity: 1, unitPrice: 95 },
    ],
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getProductsByCategory(categoryId: string) {
  return MOCK_PRODUCTS.filter((p) => p.categoryId === categoryId);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds} sn önce`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  return `${hours} sa önce`;
}
