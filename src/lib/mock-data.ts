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
    description: "El yapımı dana köfte, yanında tereyağlı pilav ve mevsim salata ile servis edilir. Özel baharatlarla marine edilmiştir.",
    price: 180,
    imageUrl: "/images/menu/izgara_kofte.jpg",
    isAvailable: true,
    sortOrder: 1,
    categoryId: "cat_yiyecek_001",
    tags: ["acili"],
    nutrition: { calories: 520, protein: 38, fat: 28, carbs: 32 },
    ingredients: [
      { name: "Dana Kıyma", amount: "200g" },
      { name: "Pirinç Pilavı", amount: "150g" },
      { name: "Mevsim Salata", amount: "100g" },
      { name: "Soğan" },
      { name: "Maydanoz" },
      { name: "Kimyon" },
      { name: "Pul Biber" },
    ],
  },
  {
    id: "prod_002",
    name: "Tavuk Şiş",
    description: "Özel sosumuzda 24 saat marine edilmiş tavuk göğsü, közlenmiş sebzeler ve tereyağlı pilav ile servis edilir.",
    price: 160,
    imageUrl: "/images/menu/tavuk_sis.jpg",
    isAvailable: true,
    sortOrder: 2,
    categoryId: "cat_yiyecek_001",
    tags: [],
    nutrition: { calories: 440, protein: 42, fat: 14, carbs: 36 },
    ingredients: [
      { name: "Tavuk Göğsü", amount: "250g" },
      { name: "Közlenmiş Biber" },
      { name: "Közlenmiş Domates" },
      { name: "Közlenmiş Soğan" },
      { name: "Pirinç Pilavı", amount: "150g" },
      { name: "Zeytinyağı" },
      { name: "Sarımsak" },
    ],
  },
  {
    id: "prod_003",
    name: "Karışık Pizza",
    description: "İnce hamurlu, mozarella peyniri, sucuk, mantar, biber ve zeytinli büyük boy fırın pizza. Taş fırında pişirilir.",
    price: 220,
    imageUrl: "/images/menu/karisik_pizza.jpg",
    isAvailable: true,
    sortOrder: 3,
    categoryId: "cat_yiyecek_001",
    tags: ["sut"],
    nutrition: { calories: 680, protein: 28, fat: 32, carbs: 68 },
    ingredients: [
      { name: "Pizza Hamuru" },
      { name: "Mozarella Peyniri", amount: "120g" },
      { name: "Sucuk", amount: "60g" },
      { name: "Mantar", amount: "40g" },
      { name: "Yeşil Biber" },
      { name: "Siyah Zeytin" },
      { name: "Domates Sosu" },
    ],
  },
  {
    id: "prod_004",
    name: "Mercimek Çorbası",
    description: "Geleneksel tarif ile pişirilmiş kırmızı mercimek çorbası. Taze sıkılmış limon ve kızarmış ekmek ile servis edilir.",
    price: 60,
    imageUrl: "/images/menu/mercimek_corbasi.jpg",
    isAvailable: true,
    sortOrder: 4,
    categoryId: "cat_yiyecek_001",
    tags: ["vegan", "glutenFree"],
    nutrition: { calories: 180, protein: 12, fat: 4, carbs: 28 },
    ingredients: [
      { name: "Kırmızı Mercimek", amount: "100g" },
      { name: "Soğan" },
      { name: "Havuç" },
      { name: "Patates" },
      { name: "Zeytinyağı" },
      { name: "Limon" },
      { name: "Kimyon" },
    ],
  },
  {
    id: "prod_005",
    name: "Caesar Salata",
    description: "Taze romaine marul, ev yapımı crouton, parmesan peyniri rendesi ve özel Caesar sos ile hazırlanır.",
    price: 90,
    imageUrl: "/images/menu/caesar_salata.jpg",
    isAvailable: true,
    sortOrder: 5,
    categoryId: "cat_yiyecek_001",
    tags: ["vejetaryen", "sut"],
    nutrition: { calories: 320, protein: 14, fat: 22, carbs: 18 },
    ingredients: [
      { name: "Romaine Marul", amount: "150g" },
      { name: "Parmesan Peyniri", amount: "30g" },
      { name: "Crouton", amount: "40g" },
      { name: "Caesar Sos", amount: "50ml" },
      { name: "Zeytinyağı" },
      { name: "Limon Suyu" },
    ],
  },
  {
    id: "prod_006",
    name: "Pide (Karışık)",
    description: "Kaşar peyniri, kıyma ve taze sebzelerle dolu, taş fırında pişirilmiş geleneksel Türk pidesi.",
    price: 140,
    imageUrl: "/images/menu/karisik_pide.jpg",
    isAvailable: true,
    sortOrder: 6,
    categoryId: "cat_yiyecek_001",
    tags: ["sut"],
    nutrition: { calories: 580, protein: 26, fat: 24, carbs: 62 },
    ingredients: [
      { name: "Pide Hamuru" },
      { name: "Kaşar Peyniri", amount: "80g" },
      { name: "Dana Kıyma", amount: "100g" },
      { name: "Domates" },
      { name: "Yeşil Biber" },
      { name: "Soğan" },
      { name: "Tereyağı" },
    ],
  },
  {
    id: "prod_006_2",
    name: "Mantı",
    description: "Sarımsaklı yoğurt, tereyağlı pul biber sosu ve taze nane ile sunulan ev yapımı Kayseri mantısı. Günlük taze açılır.",
    price: 150,
    imageUrl: "/images/menu/manti.jpg",
    isAvailable: true,
    sortOrder: 7,
    categoryId: "cat_yiyecek_001",
    tags: ["sut", "acili"],
    nutrition: { calories: 480, protein: 22, fat: 20, carbs: 52 },
    ingredients: [
      { name: "Mantı Hamuru" },
      { name: "Dana Kıyma", amount: "80g" },
      { name: "Süzme Yoğurt", amount: "100g" },
      { name: "Sarımsak" },
      { name: "Tereyağı" },
      { name: "Pul Biber" },
      { name: "Taze Nane" },
    ],
  },
  {
    id: "prod_006_3",
    name: "Lahmacun (Fındık)",
    description: "Özel harçlı, çıtır ince hamurlu fırın lahmacun. Yanında taze limon, maydanoz ve yeşillik ile servis edilir.",
    price: 85,
    imageUrl: "/images/menu/lahmacun.jpg",
    isAvailable: true,
    sortOrder: 8,
    categoryId: "cat_yiyecek_001",
    tags: ["acili"],
    nutrition: { calories: 290, protein: 16, fat: 10, carbs: 36 },
    ingredients: [
      { name: "İnce Hamur" },
      { name: "Dana Kıyma", amount: "60g" },
      { name: "Domates" },
      { name: "Biber Salçası" },
      { name: "Soğan" },
      { name: "Maydanoz" },
      { name: "Limon" },
    ],
  },
  {
    id: "prod_006_4",
    name: "Tavuk Kanat",
    description: "Özel sosumuzda marine edilmiş, mangalda közlenmiş çıtır tavuk kanatlar. Yanında ranch sos ile servis edilir.",
    price: 170,
    imageUrl: "/images/menu/tavuk_kanat.jpg",
    isAvailable: true,
    sortOrder: 9,
    categoryId: "cat_yiyecek_001",
    tags: ["acili"],
    nutrition: { calories: 460, protein: 34, fat: 30, carbs: 12 },
    ingredients: [
      { name: "Tavuk Kanat", amount: "300g" },
      { name: "BBQ Sos" },
      { name: "Sarımsak" },
      { name: "Tereyağı" },
      { name: "Pul Biber" },
      { name: "Susam" },
      { name: "Ranch Sos", amount: "50ml" },
    ],
  },
  // ── İçecekler ──
  {
    id: "prod_007",
    name: "Türk Çayı",
    description: "Demlikten taze demlenmiş geleneksel Türk çayı. İnce belli bardakta, iki adet servis edilir.",
    price: 25,
    imageUrl: "/images/menu/turk_cayi.jpg",
    isAvailable: true,
    sortOrder: 1,
    categoryId: "cat_icecek_001",
    tags: ["vegan", "glutenFree"],
    nutrition: { calories: 5, protein: 0, fat: 0, carbs: 1 },
    ingredients: [
      { name: "Siyah Çay Yaprağı" },
      { name: "Kaynar Su" },
    ],
  },
  {
    id: "prod_008",
    name: "Türk Kahvesi",
    description: "Geleneksel cezve ile pişirilmiş, bol köpüklü Türk kahvesi. Yanında lokum ikramı ile servis edilir.",
    price: 45,
    imageUrl: "/images/menu/turk_kahvesi.jpg",
    isAvailable: true,
    sortOrder: 2,
    categoryId: "cat_icecek_001",
    tags: ["vegan", "glutenFree"],
    nutrition: { calories: 12, protein: 0, fat: 0, carbs: 2 },
    ingredients: [
      { name: "Türk Kahvesi", amount: "7g" },
      { name: "Su", amount: "65ml" },
      { name: "Lokum", amount: "2 adet" },
    ],
  },
  {
    id: "prod_009",
    name: "Taze Sıkma Portakal",
    description: "Günlük taze sıkılmış %100 doğal portakal suyu. Hiçbir katkı maddesi içermez. 300ml bardakta servis edilir.",
    price: 55,
    imageUrl: "/images/menu/portakal_suyu.jpg",
    isAvailable: true,
    sortOrder: 3,
    categoryId: "cat_icecek_001",
    tags: ["vegan", "glutenFree"],
    nutrition: { calories: 112, protein: 2, fat: 0, carbs: 26 },
    ingredients: [
      { name: "Taze Portakal", amount: "3-4 adet" },
    ],
  },
  {
    id: "prod_010",
    name: "Limonata",
    description: "Ev yapımı taze limonata, nane yaprakları ve buz ile servis edilir. Doğal şekerle tatlandırılır.",
    price: 50,
    imageUrl: "/images/menu/limonata.jpg",
    isAvailable: true,
    sortOrder: 4,
    categoryId: "cat_icecek_001",
    tags: ["vegan", "glutenFree"],
    nutrition: { calories: 95, protein: 0, fat: 0, carbs: 24 },
    ingredients: [
      { name: "Taze Limon Suyu" },
      { name: "Şeker" },
      { name: "Taze Nane" },
      { name: "Buz" },
      { name: "Su" },
    ],
  },
  {
    id: "prod_010_2",
    name: "Ayran",
    description: "Bol köpüklü, naneli ev yapımı geleneksel ayran. Bakır bardakta soğuk servis edilir.",
    price: 35,
    imageUrl: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=400&q=80",
    isAvailable: true,
    sortOrder: 5,
    categoryId: "cat_icecek_001",
    tags: ["vejetaryen", "glutenFree", "sut"],
    nutrition: { calories: 60, protein: 3, fat: 2, carbs: 5 },
    ingredients: [
      { name: "Yoğurt", amount: "150g" },
      { name: "Su", amount: "100ml" },
      { name: "Tuz" },
      { name: "Taze Nane" },
    ],
  },
  {
    id: "prod_010_3",
    name: "Buzlu Kahve (Iced Latte)",
    description: "Soğuk süt, buz ve çift shot yoğun espresso ile hazırlanan serinletici buzlu kahve.",
    price: 70,
    imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&q=80",
    isAvailable: true,
    sortOrder: 6,
    categoryId: "cat_icecek_001",
    tags: ["sut", "vejetaryen"],
    nutrition: { calories: 140, protein: 6, fat: 5, carbs: 16 },
    ingredients: [
      { name: "Espresso", amount: "çift shot" },
      { name: "Soğuk Süt", amount: "200ml" },
      { name: "Buz" },
      { name: "Vanilya Şurubu (opsiyonel)" },
    ],
  },
  // ── Tatlılar ──
  {
    id: "prod_011",
    name: "Sütlaç",
    description: "Fırında üstü altın rengi kızarmış geleneksel sütlaç. Tarçın ile süslenerek soğuk servis edilir.",
    price: 75,
    imageUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80",
    isAvailable: true,
    sortOrder: 1,
    categoryId: "cat_tatli_001",
    tags: ["vejetaryen", "sut"],
    nutrition: { calories: 280, protein: 8, fat: 10, carbs: 40 },
    ingredients: [
      { name: "Süt", amount: "300ml" },
      { name: "Pirinç", amount: "40g" },
      { name: "Şeker", amount: "60g" },
      { name: "Pirinç Unu" },
      { name: "Vanilya" },
      { name: "Tarçın" },
    ],
  },
  {
    id: "prod_012",
    name: "Baklava",
    description: "Antep fıstıklı, tereyağlı, ince yufka katlarıyla hazırlanan özel el yapımı baklava. 4 dilim servis edilir.",
    price: 120,
    imageUrl: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400&q=80",
    isAvailable: true,
    sortOrder: 2,
    categoryId: "cat_tatli_001",
    tags: ["vejetaryen", "fistik", "sut"],
    nutrition: { calories: 420, protein: 8, fat: 24, carbs: 48 },
    ingredients: [
      { name: "Yufka", amount: "40 kat" },
      { name: "Antep Fıstığı", amount: "60g" },
      { name: "Tereyağı", amount: "40g" },
      { name: "Şeker Şerbeti" },
      { name: "Limon Suyu" },
    ],
  },
  {
    id: "prod_013",
    name: "Cheesecake",
    description: "New York usulü kremsi cheesecake, ev yapımı çilek sosu ve taze meyveler ile servis edilir.",
    price: 95,
    imageUrl: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&q=80",
    isAvailable: true,
    sortOrder: 3,
    categoryId: "cat_tatli_001",
    tags: ["vejetaryen", "sut"],
    nutrition: { calories: 380, protein: 6, fat: 26, carbs: 32 },
    ingredients: [
      { name: "Krem Peyniri", amount: "150g" },
      { name: "Bisküvi Tabanı" },
      { name: "Şeker" },
      { name: "Yumurta" },
      { name: "Vanilya" },
      { name: "Çilek Sosu" },
    ],
  },
  {
    id: "prod_014",
    name: "Künefe",
    description: "Hatay usulü, özel tel kadayıf peyniri ile hazırlanan sıcak künefe. Antep fıstığı ve kaymak ile servis edilir.",
    price: 130,
    imageUrl: "https://images.unsplash.com/photo-1628181343729-1ee06775f0a0?w=400&q=80",
    isAvailable: true,
    sortOrder: 4,
    categoryId: "cat_tatli_001",
    tags: ["vejetaryen", "sut"],
    nutrition: { calories: 450, protein: 12, fat: 22, carbs: 52 },
    ingredients: [
      { name: "Tel Kadayıf" },
      { name: "Künefe Peyniri", amount: "100g" },
      { name: "Tereyağı", amount: "30g" },
      { name: "Şeker Şerbeti" },
      { name: "Antep Fıstığı" },
      { name: "Kaymak (opsiyonel)" },
    ],
  },
  {
    id: "prod_015",
    name: "Tiramisu",
    description: "Gerçek İtalyan mascarpone peyniri, yoğun espresso ve kakao ile katman katman hazırlanan tiramisu.",
    price: 110,
    imageUrl: "https://images.unsplash.com/photo-1571115177098-24de5004cb77?w=400&q=80",
    isAvailable: true,
    sortOrder: 5,
    categoryId: "cat_tatli_001",
    tags: ["vejetaryen", "sut"],
    nutrition: { calories: 350, protein: 6, fat: 20, carbs: 36 },
    ingredients: [
      { name: "Mascarpone Peyniri", amount: "120g" },
      { name: "Lady Finger Bisküvi" },
      { name: "Espresso" },
      { name: "Yumurta" },
      { name: "Şeker" },
      { name: "Kakao Tozu" },
      { name: "Amaretto (opsiyonel)" },
    ],
  },
];

// ─── Mock Orders (for Admin panel) ────────────────────────────────────────

export type MockProduct = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  tags?: ("vegan" | "vejetaryen" | "glutenFree" | "laktosuzFree" | "acili" | "fistik" | "sut" | "yumurta" | "denizUrunu")[];
  nutrition?: { calories: number; protein: number; fat: number; carbs: number };
  ingredients?: { name: string; amount?: string }[];
};

export type MockOrderItem = {
  id?: string;
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  price?: number;
  totalPrice?: number;
  note?: string;
  status?: "PENDING" | "PREPARING" | "ON_THE_WAY" | "DELIVERED" | "COMPLETED" | "CANCELLED";
  categoryId?: string;
};

export type MockOrder = {
  id: string;
  tableNumber: number;
  status: "PENDING" | "PREPARING" | "ON_THE_WAY" | "DELIVERED" | "COMPLETED" | "PAID" | "CANCELLED";
  totalAmount: number;
  createdAt: Date;
  completedAt?: Date;
  waiterName?: string;
  items: MockOrderItem[];
  notes?: string;
};

export const MOCK_ORDERS: MockOrder[] = [
  {
    id: "ord_001",
    tableNumber: 3,
    status: "PREPARING",
    totalAmount: 340,
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    items: [
      { productId: "prod_001", name: "Izgara Köfte", quantity: 1, unitPrice: 180, price: 180, totalPrice: 180 },
      { productId: "prod_002", name: "Tavuk Şiş", quantity: 1, unitPrice: 160, price: 160, totalPrice: 160 },
    ],
  },
  {
    id: "ord_002",
    tableNumber: 7,
    status: "PENDING",
    totalAmount: 520,
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
    items: [
      { productId: "prod_003", name: "Karışık Pizza", quantity: 2, unitPrice: 220, price: 220, totalPrice: 440 },
      { productId: "prod_004", name: "Mercimek Çorbası", quantity: 1, unitPrice: 60, price: 60, totalPrice: 60 },
      { productId: "prod_007", name: "Türk Çayı", quantity: 1, unitPrice: 25, price: 25, totalPrice: 25 },
    ],
  },
];

// ─── Cart Items ──────────────────────────────────────────────────────────

export const MOCK_CART_ITEMS: CartItem[] = [];

// ─── Utility ─────────────────────────────────────────────────────────────

export function formatPrice(price: number): string {
  return `${price.toLocaleString("tr-TR")} ₺`;
}

export function timeAgo(date: Date | string | number): string {
  const now = new Date();
  const d = date instanceof Date ? date : new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  
  if (diffMin < 1) return "Az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} saat önce`;
  
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} gün önce`;
}

export function formatTime(date: Date | string | number): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function getOrderDuration(
  startDate: Date | string | number,
  endDate?: Date | string | number
): string {
  const start = startDate instanceof Date ? startDate : new Date(startDate);
  const end = endDate ? (endDate instanceof Date ? endDate : new Date(endDate)) : new Date();
  const diffMs = end.getTime() - start.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "< 1 dk";
  if (diffMin < 60) return `${diffMin} dk`;

  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  return mins > 0 ? `${hours} sa ${mins} dk` : `${hours} sa`;
}

