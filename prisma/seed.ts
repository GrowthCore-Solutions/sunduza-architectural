// Sunduza Architectural & Projects — Database Seed v2.0
// Reads credentials from environment variables — never hardcoded (S3.3)
// Idempotent: upsert on all records — safe to run multiple times
// Run: npm run db:seed

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Sunduza database...\n");

  // ── 1. ADMIN USER ──────────────────────────────────────────────────────────
  // Credentials read from env — never committed (S3.3)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be set in environment. See .env.example"
    );
  }

  const rounds = parseInt(process.env.BCRYPT_ROUNDS ?? "12", 10);
  const hashedPassword = await bcrypt.hash(adminPassword, rounds);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      id: createId(),
      email: adminEmail,
      password: hashedPassword,
      name: "Xivutiso Kevin Sunduza",
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin seeded: ${admin.email}`);

  // ── 2. SITE SETTINGS ───────────────────────────────────────────────────────
  // Runtime config — admin edits through UI, no redeployment needed
  const settings = [
    {
      key: "whatsapp_number",
      value: "27786723364",
      description:
        "WhatsApp number for floating button — format: country code + number, no +",
    },
    {
      key: "contact_email",
      value: "xivutisokevinsunduza@gmail.com",
      description: "Primary contact email displayed on the contact page",
    },
    {
      key: "business_phone",
      value: "+27 78 672 3364",
      description: "Business phone number displayed on contact page and footer",
    },
    {
      key: "business_address",
      value: "South Africa",
      description:
        "Business address shown on contact page and in structured data",
    },
    {
      key: "hero_tagline",
      value: "Architecture That Builds Confidence",
      description:
        "Main headline in the hero section — keep it impactful and short",
    },
    {
      key: "years_experience",
      value: "5",
      description:
        "Years of experience shown in the stats bar — update annually",
    },
    {
      key: "projects_completed",
      value: "50",
      description: "Number of completed projects shown in stats bar",
    },
  ];

  for (const setting of settings) {
    await prisma.siteSettings.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        id: createId(),
        ...setting,
      },
    });
  }
  console.log(`✅ Site settings seeded: ${settings.length} entries`);

  // ── 3. PORTFOLIO PROJECTS ──────────────────────────────────────────────────
  // Replace imagePath values with real project images before launch
  // imagePath format: /images/projects/filename.webp
  const projects = [
    {
      title: "Modern Family Residence — Sandton",
      description:
        "A contemporary 4-bedroom family home designed for a 600sqm plot in Sandton. The design prioritises open-plan living, natural light, and seamless indoor-outdoor flow. Full council submission package included.",
      imagePath: "/images/projects/sandton-residence.webp",
      category: "Residential",
      sortOrder: 1,
      isFeatured: true,
    },
    {
      title: "Mixed-Use Development — Pretoria East",
      description:
        "A 12-unit mixed-use development combining ground-floor retail with residential apartments above. Full architectural drawings, structural coordination, and development planning documentation.",
      imagePath: "/images/projects/pretoria-mixed-use.webp",
      category: "Development",
      sortOrder: 2,
      isFeatured: true,
    },
    {
      title: "Commercial Office Fitout — Midrand",
      description:
        "Architectural drawings and drafting services for a 400sqm commercial office space. Includes space planning, mechanical coordination, and full documentation package.",
      imagePath: "/images/projects/midrand-office.webp",
      category: "Commercial",
      sortOrder: 3,
      isFeatured: true,
    },
    {
      title: "Residential Extension — Centurion",
      description:
        "A double-storey extension to an existing home, adding two bedrooms, a study, and an entertainment deck. Full council submission drawings and approval management.",
      imagePath: "/images/projects/centurion-extension.webp",
      category: "Residential",
      sortOrder: 4,
      isFeatured: false,
    },
    {
      title: "Townhouse Complex — Johannesburg South",
      description:
        "Site planning and architectural drawings for a 6-unit townhouse complex. Includes unit layouts, site coverage calculations, and full drafting documentation.",
      imagePath: "/images/projects/jhb-townhouses.webp",
      category: "Development",
      sortOrder: 5,
      isFeatured: false,
    },
  ];

  let projectCount = 0;
  for (const project of projects) {
    const exists = await prisma.project.findFirst({
      where: { title: project.title, deletedAt: null },
      select: { id: true },
    });
    if (!exists) {
      await prisma.project.create({
        data: { id: createId(), ...project },
      });
      projectCount++;
    }
  }
  console.log(`✅ Projects seeded: ${projectCount} new (${projects.length - projectCount} already existed)`);

  // ── 4. TESTIMONIALS ────────────────────────────────────────────────────────
  // Replace with real client reviews before launch
  const testimonials = [
    {
      clientName: "Thabo Mokoena",
      review:
        "Kevin delivered architectural drawings that were precise, professional, and ready for council submission first time. No back and forth — he understood the brief immediately.",
      rating: 5,
      isActive: true,
    },
    {
      clientName: "Zanele Dlamini",
      review:
        "From the first consultation to the final drawings, the process was seamless. The house design exceeded what I imagined. I have already recommended Sunduza Architectural to three friends.",
      rating: 5,
      isActive: true,
    },
    {
      clientName: "Riaan van der Merwe",
      review:
        "Professional, responsive, and technically excellent. The development project planning he provided saved us months of back-and-forth with the municipality.",
      rating: 5,
      isActive: true,
    },
    {
      clientName: "Amahle Khumalo",
      review:
        "From the initial consultation to the final plan set, everything was handled with precision and care. The drawings were clear enough for our contractor to build from directly.",
      rating: 5,
      isActive: true,
    },
  ];

  let testimonialCount = 0;
  for (const testimonial of testimonials) {
    const exists = await prisma.testimonial.findFirst({
      where: { clientName: testimonial.clientName, deletedAt: null },
      select: { id: true },
    });
    if (!exists) {
      await prisma.testimonial.create({
        data: { id: createId(), ...testimonial },
      });
      testimonialCount++;
    }
  }
  console.log(`✅ Testimonials seeded: ${testimonialCount} new`);

  console.log("\n✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
