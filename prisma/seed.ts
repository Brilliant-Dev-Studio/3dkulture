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

  const REGIONS = [
    {
      name: "Yangon Region",
      nameMy: "ရန်ကုန်တိုင်းဒေသကြီး",
      cities: [
        {
          name: "Yangon",
          nameMy: "ရန်ကုန်",
          townships: [
            { name: "Bahan", nameMy: "ဗဟန်း" },
            { name: "Sanchaung", nameMy: "စမ်းချောင်း" },
            { name: "Yankin", nameMy: "ရန်ကင်း" },
            { name: "Insein", nameMy: "အင်းစိန်" },
            { name: "Thingangyun", nameMy: "သင်္ဃန်းကျွန်း" },
          ],
        },
      ],
    },
    {
      name: "Mandalay Region",
      nameMy: "မန္တလေးတိုင်းဒေသကြီး",
      cities: [
        {
          name: "Mandalay",
          nameMy: "မန္တလေး",
          townships: [
            { name: "Chanayethazan", nameMy: "ချမ်းအေးသာဇံ" },
            { name: "Aung Myay Thar Zan", nameMy: "အောင်မြေသာစံ" },
          ],
        },
      ],
    },
    {
      name: "Naypyidaw Union Territory",
      nameMy: "နေပြည်တော် ပြည်ထောင်စုနယ်မြေ",
      cities: [
        {
          name: "Naypyidaw",
          nameMy: "နေပြည်တော်",
          townships: [{ name: "Zabuthiri", nameMy: "ဇမ္ဗူသီရိ" }],
        },
      ],
    },
  ];

  for (const r of REGIONS) {
    const region = await prisma.region.upsert({
      where: { name: r.name },
      create: { name: r.name, nameMy: r.nameMy },
      update: { nameMy: r.nameMy },
    });
    for (const c of r.cities) {
      const city = await prisma.city.upsert({
        where: { name: c.name },
        create: { name: c.name, nameMy: c.nameMy, regionId: region.id },
        update: { nameMy: c.nameMy, regionId: region.id },
      });
      for (const tw of c.townships) {
        await prisma.township.upsert({
          where: { name: tw.name },
          create: { name: tw.name, nameMy: tw.nameMy, cityId: city.id },
          update: { nameMy: tw.nameMy },
        });
      }
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
