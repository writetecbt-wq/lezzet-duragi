import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── 1. Restaurant ────────────────────────────────────
  const restaurant = await prisma.restaurant.upsert({
    where: { id: "rest_demo_001" },
    update: {},
    create: {
      id: "rest_demo_001",
      name: "Lezzet Durağı",
      logoUrl: "/logo.png",
    },
  });
  console.log(`✅ Restaurant: ${restaurant.name}`);

  // ─── 2. Categories ────────────────────────────────────
  const yiyecekler = await prisma.category.upsert({
    where: { id: "cat_yiyecek_001" },
    update: {},
    create: {
      id: "cat_yiyecek_001",
      name: "Yiyecekler",
      sortOrder: 1,
      restaurantId: restaurant.id,
    },
  });

  const icecekler = await prisma.category.upsert({
    where: { id: "cat_icecek_001" },
    update: {},
    create: {
      id: "cat_icecek_001",
      name: "İçecekler",
      sortOrder: 2,
      restaurantId: restaurant.id,
    },
  });

  const tatlilar = await prisma.category.upsert({
    where: { id: "cat_tatli_001" },
    update: {},
    create: {
      id: "cat_tatli_001",
      name: "Tatlılar",
      sortOrder: 3,
      restaurantId: restaurant.id,
    },
  });
  console.log("✅ Categories created");

  // ─── 3. Products ──────────────────────────────────────
  const products = [
    // Yiyecekler
    {
      id: "prod_001",
      name: "Izgara Köfte",
      description: "El yapımı dana köfte, yanında pilav ve salata ile",
      price: 180.0,
      categoryId: yiyecekler.id,
      sortOrder: 1,
    },
    {
      id: "prod_002",
      name: "Tavuk Şiş",
      description: "Marine edilmiş tavuk göğsü, közlenmiş sebzeler ile",
      price: 160.0,
      categoryId: yiyecekler.id,
      sortOrder: 2,
    },
    {
      id: "prod_003",
      name: "Karışık Pizza",
      description: "Mozarella, sucuk, mantar, biber ve zeytinli büyük boy",
      price: 220.0,
      categoryId: yiyecekler.id,
      sortOrder: 3,
    },
    {
      id: "prod_004",
      name: "Mercimek Çorbası",
      description: "Geleneksel tarif ile pişirilmiş kırmızı mercimek çorbası",
      price: 60.0,
      categoryId: yiyecekler.id,
      sortOrder: 4,
    },
    {
      id: "prod_005",
      name: "Caesar Salata",
      description: "Romaine marul, crouton, parmesan ve Caesar sos",
      price: 90.0,
      categoryId: yiyecekler.id,
      sortOrder: 5,
    },
    // İçecekler
    {
      id: "prod_006",
      name: "Türk Çayı",
      description: "Demlikten taze çekilen çay, iki bardak",
      price: 25.0,
      categoryId: icecekler.id,
      sortOrder: 1,
    },
    {
      id: "prod_007",
      name: "Türk Kahvesi",
      description: "Geleneksel pişirim, yanında lokum ikramı ile",
      price: 45.0,
      categoryId: icecekler.id,
      sortOrder: 2,
    },
    {
      id: "prod_008",
      name: "Taze Sıkılmış Portakal Suyu",
      description: "Günlük taze sıkılmış, 300ml",
      price: 55.0,
      categoryId: icecekler.id,
      sortOrder: 3,
    },
    // Tatlılar
    {
      id: "prod_009",
      name: "Sütlaç",
      description: "Fırında üstü kızarmış geleneksel sütlaç",
      price: 75.0,
      categoryId: tatlilar.id,
      sortOrder: 1,
    },
    {
      id: "prod_010",
      name: "Baklava",
      description: "Antep fıstıklı, tereyağlı baklava, 4 dilim",
      price: 120.0,
      categoryId: tatlilar.id,
      sortOrder: 2,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        ...product,
        price: product.price,
      },
    });
  }
  console.log(`✅ ${products.length} products created`);

  // ─── 4. Tables ────────────────────────────────────────
  for (let i = 1; i <= 10; i++) {
    await prisma.table.upsert({
      where: {
        restaurantId_tableNumber: {
          restaurantId: restaurant.id,
          tableNumber: i,
        },
      },
      update: {},
      create: {
        tableNumber: i,
        restaurantId: restaurant.id,
        qrCodeUrl: `/qr/table-${i}.png`,
      },
    });
  }
  console.log("✅ 10 tables created");

  console.log("\n🎉 Seeding completed successfully!");
  console.log(`\n📌 Restaurant ID: ${restaurant.id}`);
  console.log("📌 Use this ID in your QR codes: /rest_demo_001/menu/[tableId]");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
