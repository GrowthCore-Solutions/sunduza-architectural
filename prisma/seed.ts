import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient({
  datasourceUrl: "file:./dev.db",
});

async function main() {
  console.log("Seeding database...");

  // Admin user — email: admin@sunduza.co.za / password: Sunduza2026!
  const password = await bcrypt.hash("Sunduza2026!", 12);
  await db.admin.upsert({
    where: { email: "admin@sunduza.co.za" },
    update: {},
    create: {
      email: "admin@sunduza.co.za",
      name: "Xivutiso Kevin Sunduza",
      password,
      role: "admin",
    },
  });
  console.log("Admin created: admin@sunduza.co.za / Sunduza2026!");

  const projects = [
    { title: "Residential Planning Set 01", shortDescription: "Professional house planning and architectural presentation for confident decision-making.", imageUrl: "/images/projects/project-01.png", category: "House Plan" },
    { title: "Modern Elevation Concept", shortDescription: "Clean elevation concept with premium detailing and clear architectural lines.", imageUrl: "/images/projects/project-02.png", category: "Architectural Drawing" },
    { title: "Architectural Plan Set 03", shortDescription: "A complete plan set supporting planning, drafting, and project coordination.", imageUrl: "/images/projects/project-03.png", category: "Architectural Drawing" },
    { title: "House Planning & Drafting Sheet 04", shortDescription: "Layout-focused planning with clear room distribution and documentation.", imageUrl: "/images/projects/project-04.png", category: "House Plan" },
    { title: "Drafting Portfolio View 05", shortDescription: "Detailed drafting visuals built for accurate interpretation during build.", imageUrl: "/images/projects/project-05.png", category: "Drafting Services" },
    { title: "Residential Drafting Set 06", shortDescription: "A structured drawing set covering planning and architectural presentation.", imageUrl: "/images/projects/project-06.png", category: "House Plan" },
    { title: "Architectural Drawing Set 07", shortDescription: "Professional drawing coverage supporting clear project direction.", imageUrl: "/images/projects/project-07.png", category: "Architectural Drawing" },
    { title: "Architectural Elevation & Layout 08", shortDescription: "Premium layout and elevation presentation aligned to planning clarity.", imageUrl: "/images/projects/project-08.png", category: "House Plan" },
    { title: "Residential Planning Sheet 09", shortDescription: "Detailed residential planning visuals showcasing professional architectural work.", imageUrl: "/images/projects/project-09.png", category: "Architectural Drawing" },
  ];

  for (const p of projects) {
    await db.project.create({ data: p });
  }
  console.log("Seeded 9 projects.");

  const testimonials = [
    { clientName: "Thabo M.", review: "Sunduza delivered our house plans with precision. The council submission passed first time — exactly what we needed.", rating: 5 },
    { clientName: "Nokuthula D.", review: "Professional, timely, and the drawings were clear enough for our contractor to build from directly.", rating: 5 },
    { clientName: "Johan van R.", review: "We commissioned a full set of architectural drawings for a townhouse development. Exceeded expectations.", rating: 4 },
    { clientName: "Amahle K.", review: "From first consultation to final drawings — smooth process, excellent communication. Highly recommended.", rating: 5 },
  ];

  for (const t of testimonials) {
    await db.testimonial.create({ data: t });
  }
  console.log("Seeded 4 testimonials.");
  console.log("Done.");
}

main().catch(console.error).finally(() => db.$disconnect());
