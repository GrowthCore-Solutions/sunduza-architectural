/**
 * Production seed — run once after deploy with env vars set.
 * npx tsx prisma/seed.prod.ts
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  }

  const rounds = parseInt(process.env.BCRYPT_ROUNDS ?? "12", 10);
  const hashedPassword = await bcrypt.hash(adminPassword, rounds);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashedPassword, failedAttempts: 0, lockedUntil: null },
    create: {
      id: createId(),
      email: adminEmail,
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });

  const settings = [
    { key: "whatsapp_number", value: "27786723364", description: "WhatsApp number" },
    { key: "contact_email", value: adminEmail, description: "Contact email" },
  ];

  for (const s of settings) {
    await prisma.siteSettings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { id: createId(), ...s },
    });
  }

  console.log("Production seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
