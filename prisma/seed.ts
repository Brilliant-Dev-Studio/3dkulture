import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { BASE_PRODUCTS, CATEGORIES, CATEGORY_TREE, COLORS, SIZES, MATERIALS_LIST } from "../lib/products";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const ADMIN_EMAIL = "admin@3dkulture.com";
const ADMIN_PASSWORD = "Kulture#2026!";

async function main() {
  await prisma.category.createMany({
    data: CATEGORIES.map((name) => ({ name })),
    skipDuplicates: true,
  });
  await prisma.category.createMany({
    data: CATEGORY_TREE.map((c) => ({ name: c.name })),
    skipDuplicates: true,
  });
  for (const main of CATEGORY_TREE) {
    const mainRow = await prisma.category.findUnique({ where: { name: main.name } });
    if (!mainRow) continue;
    await prisma.category.createMany({
      data: main.subs.map((name) => ({ name, parentId: mainRow.id })),
      skipDuplicates: true,
    });
  }
  await prisma.color.createMany({
    data: COLORS.map((name) => ({ name })),
    skipDuplicates: true,
  });
  await prisma.size.createMany({
    data: SIZES.map((name) => ({ name })),
    skipDuplicates: true,
  });
  await prisma.material.createMany({
    data: MATERIALS_LIST.map((name) => ({ name })),
    skipDuplicates: true,
  });

  for (const p of BASE_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      create: {
        id: p.id,
        title: p.title,
        category: p.category,
        description: p.description,
        price: p.price,
        costPrice: p.costPrice,
        discountType: p.discountType,
        discountValue: p.discountValue,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        images: p.images,
        colors: p.colors,
        sizes: p.sizes,
        materials: p.materials,
        sizePrices: p.sizePrices,
        materialPrices: p.materialPrices,
        colorImages: p.colorImages,
        materialImages: p.materialImages,
      },
      update: {},
    });
  }

  const CITY_TOWNSHIPS: Record<string, { name: string; deliveryFee: number }[]> = {
    Yangon: [
      { name: "Bahan", deliveryFee: 2000 },
      { name: "Sanchaung", deliveryFee: 2000 },
      { name: "Yankin", deliveryFee: 2500 },
      { name: "Insein", deliveryFee: 3500 },
      { name: "Thingangyun", deliveryFee: 3000 },
    ],
    Mandalay: [
      { name: "Chanayethazan", deliveryFee: 3000 },
      { name: "Aung Myay Thar Zan", deliveryFee: 3000 },
    ],
    Naypyidaw: [{ name: "Zabuthiri", deliveryFee: 4000 }],
  };

  for (const cityName of Object.keys(CITY_TOWNSHIPS)) {
    const city = await prisma.city.upsert({
      where: { name: cityName },
      create: { name: cityName },
      update: {},
    });
    for (const tw of CITY_TOWNSHIPS[cityName]) {
      await prisma.township.upsert({
        where: { name: tw.name },
        create: { name: tw.name, deliveryFee: tw.deliveryFee, cityId: city.id },
        update: {},
      });
    }
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await prisma.adminUser.upsert({
    where: { email: ADMIN_EMAIL },
    create: { email: ADMIN_EMAIL, passwordHash },
    update: {},
  });

  console.log("Seed complete.");
  console.log("Admin login:", ADMIN_EMAIL, "/", ADMIN_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
