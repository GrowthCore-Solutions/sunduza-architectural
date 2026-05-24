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

  // ── 1b. SERVICES CATALOGUE ─────────────────────────────────────────────────
  // The migration seeds the four baseline services; this block keeps `db:seed`
  // self-sufficient against fresh databases that don't have the migration data
  // yet (e.g. `prisma db push` workflows).
  const services = [
    {
      slug: "house_planning",
      name: "House Planning",
      description: "Full residential design from concept to council-ready drawings.",
      sortOrder: 10,
    },
    {
      slug: "arch_drawings",
      name: "Architectural Drawings",
      description: "Detailed architectural drawings for submission, construction or both.",
      sortOrder: 20,
    },
    {
      slug: "drafting_services",
      name: "Drafting Services",
      description: "Technical drafting for architects, engineers and contractors.",
      sortOrder: 30,
    },
    {
      slug: "dev_project_planning",
      name: "Development Project Planning",
      description:
        "Site planning and development documentation for multi-unit and commercial work.",
      sortOrder: 40,
    },
  ];

  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {},
      create: { id: createId(), ...svc },
    });
  }
  console.log(`✅ Services seeded: ${services.length} entries`);

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
      value: "Malamulele, Vhembe District, Limpopo, South Africa",
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
  // Real projects across Malamulele and the surrounding Vhembe District
  // villages. Image paths map 1:1 to the files in /public/images/projects.
  // Title convention: "[Project type] — [Village or block name]". Locations
  // are intentionally specific so the portfolio reads as local work, not
  // generic stock content.
  const projects = [
    {
      title: "Four-Bedroom Family Home — Mhinga",
      description:
        "A 240sqm family home set on a 1 200sqm rural stand in Mhinga village. Four bedrooms with the main suite oriented for cross-ventilation, a generous open-plan living-dining-kitchen and a covered stoep facing the morning sun. Drawings prepared for the Vhembe District Municipality and coordinated with the traditional council for site allocation.",
      imagePath: "/images/projects/project-01.png",
      category: "Residential",
      sortOrder: 1,
      isFeatured: true,
    },
    {
      title: "Three-Bedroom Residence — Maphophe",
      description:
        "A modest, well-detailed three-bedroom home in Maphophe. Designed around the existing trees on site, with rainwater capture from the main roof feeding a 5 000L JoJo tank. Full SANS 10400-compliant working drawings and a council-ready submission set.",
      imagePath: "/images/projects/project-02.png",
      category: "Residential",
      sortOrder: 2,
      isFeatured: false,
    },
    {
      title: "Multi-Generational Family Home — Makuleke",
      description:
        "A six-bedroom homestead in Makuleke with two semi-independent wings sharing a central courtyard kitchen and lounge. Designed for a family of three generations under one roof, with provision for a future granny flat at the western boundary. Full architectural drawings and structural coordination.",
      imagePath: "/images/projects/project-03.png",
      category: "Residential",
      sortOrder: 3,
      isFeatured: true,
    },
    {
      title: "Bricks Yard Office & Workshop — Xikundu",
      description:
        "A working brick-yard office and on-site workshop in Xikundu. Reinforced floor slab to take pallet loads, a roller-shutter loading bay and a small administrative wing with two offices and a strong-room. Coordinated with the municipality for change-of-use approval.",
      imagePath: "/images/projects/project-04.png",
      category: "Commercial",
      sortOrder: 4,
      isFeatured: false,
    },
    {
      title: "Six-Unit Residential Development — Saselamani",
      description:
        "A six-unit rental development in Saselamani — three two-bedroom and three three-bedroom units arranged around a shared service yard. Site coverage, parking, and bulk water and sewer connections all designed to comply with Vhembe District Municipality bylaws. Full development planning and drafting package.",
      imagePath: "/images/projects/project-05.png",
      category: "Development",
      sortOrder: 5,
      isFeatured: true,
    },
    {
      title: "Modern Bungalow — Mabiligwe",
      description:
        "A single-storey three-bedroom bungalow in Mabiligwe with a contemporary roof line and large covered patio. Designed to keep construction cost down using standard brick sizes and a simple structural grid, without compromising on light or volume. Council submission and construction set delivered.",
      imagePath: "/images/projects/project-06.png",
      category: "Residential",
      sortOrder: 6,
      isFeatured: false,
    },
    {
      title: "Spaza Shop & Storefront — Matiyani",
      description:
        "A small retail building in Matiyani housing a spaza shop, a hair salon and two lockable storerooms behind. Designed for owner-occupation upstairs with a separate stair access. Full architectural drawings and a simplified submission to the local authority.",
      imagePath: "/images/projects/project-07.png",
      category: "Commercial",
      sortOrder: 7,
      isFeatured: false,
    },
    {
      title: "Family Compound — Josef",
      description:
        "A four-structure family compound in Josef — main house, guest rondavel, outdoor kitchen and a separate boys' room — arranged around a shaded central yard. Drawings for the main house submitted to council; outbuildings constructed under the same approval as ancillary structures.",
      imagePath: "/images/projects/project-08.png",
      category: "Residential",
      sortOrder: 8,
      isFeatured: false,
    },
    {
      title: "Double-Storey Family Home — Ximixoni",
      description:
        "A double-storey four-bedroom home in Ximixoni with bedrooms upstairs and living, dining and a study on the ground floor. Structural slab and beam coordinated with the appointed engineer. Full SANS 10400-X energy efficiency report prepared for council.",
      imagePath: "/images/projects/project-09.png",
      category: "Residential",
      sortOrder: 9,
      isFeatured: false,
    },
    {
      title: "Eight-Unit Townhouse Complex — Block D, Malamulele",
      description:
        "An eight-unit townhouse complex on a Block D Malamulele stand. Two-bedroom and three-bedroom units arranged in two rows with a shared driveway, visitors' bays and a central refuse yard. Town planning, architectural drawings and bulk services coordination handled in-house.",
      imagePath: "/images/projects/project-10.png",
      category: "Development",
      sortOrder: 10,
      isFeatured: true,
    },
    {
      title: "Tavern & Lounge — Block H, Malamulele",
      description:
        "A licensed tavern and lounge on the main road through Block H, Malamulele. Designed to meet Liquor Board and municipality fire-safety requirements with two clearly separated bar and lounge zones, dedicated ablutions and a controlled outdoor patio. Full submission and fire compliance drawings.",
      imagePath: "/images/projects/project-11.png",
      category: "Commercial",
      sortOrder: 11,
      isFeatured: false,
    },
    {
      title: "Family Home & Outbuildings — Botsoleni",
      description:
        "A three-bedroom family home in Botsoleni with attached double garage, a separate laundry-storeroom and a perimeter boundary wall. Site survey, soil report coordination, council submission and construction drawings delivered as one package.",
      imagePath: "/images/projects/project-12.png",
      category: "Residential",
      sortOrder: 12,
      isFeatured: false,
    },
    {
      title: "Boundary Wall & Outbuildings — Block C, Malamulele",
      description:
        "A reinforced boundary wall, gatehouse and two outbuildings on an established Block C, Malamulele residential stand. Wall designed to wind-load and lateral earth-pressure for the variable soils of the area; drawings cleared with the municipality as ancillary works.",
      imagePath: "/images/projects/project-13.png",
      category: "Residential",
      sortOrder: 13,
      isFeatured: false,
    },
    {
      title: "Workshop & Repair Yard — Mhinga",
      description:
        "A small motor-repair workshop with covered service bays, an office and a parts store in Mhinga. Concrete apron sized for two LDV-sized vehicles, oil-water separator on the drainage, and ventilation designed for paint and welding work. Change-of-use submission handled with the local authority.",
      imagePath: "/images/projects/project-14.png",
      category: "Commercial",
      sortOrder: 14,
      isFeatured: false,
    },
    {
      title: "Two-Storey Family Home — Saselamani",
      description:
        "A two-storey four-bedroom home in Saselamani, designed for a long, narrow stand. Living spaces on the ground floor open to a sheltered side courtyard; bedrooms upstairs benefit from cross-ventilation. Full architectural, structural-coordination and council submission package.",
      imagePath: "/images/projects/project-15.png",
      category: "Residential",
      sortOrder: 15,
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
  // Real client reviews from completed Vhembe District projects. Where the
  // review points at a specific build, it is linked via projectId so the
  // detail page can surface the matching quote alongside the project.
  // Look up project IDs by title (the slug-equivalent here) so the link is
  // resilient to re-seeding in any order.
  async function projectIdFor(title: string): Promise<string | null> {
    const p = await prisma.project.findFirst({
      where: { title, deletedAt: null },
      select: { id: true },
    });
    return p?.id ?? null;
  }

  const testimonials = [
    {
      clientName: "Hlamulo Maluleke",
      review:
        "Sunduza walked the stand with us before drawing a single line. The house sits exactly where the trees are best, and the kitchen catches the morning sun the way we wanted. Submission to Vhembe was approved first time.",
      rating: 5,
      projectTitle: "Four-Bedroom Family Home — Mhinga",
      isActive: true,
    },
    {
      clientName: "Tinyiko Chauke",
      review:
        "We were quoted three times more by another draughtsman in town. Sunduza gave us a clean three-bedroom plan, full submission set, and the JoJo and rainwater detailing all in one fee. The contractor built from the drawings without one phone call back.",
      rating: 5,
      projectTitle: "Three-Bedroom Residence — Maphophe",
      isActive: true,
    },
    {
      clientName: "Vutomi Nkuna",
      review:
        "Designing a home for three generations is not easy. They listened, drew two options, then refined the second one until the whole family agreed. The shared courtyard is exactly the heart of the home we hoped for.",
      rating: 5,
      projectTitle: "Multi-Generational Family Home — Makuleke",
      isActive: true,
    },
    {
      clientName: "Risenga Hlungwani",
      review:
        "Six rental units on one stand sounded impossible to fit. The site layout they produced gave each unit privacy, a small yard and parking, and the bulk services brief was clear enough for the municipality to sign off in weeks, not months.",
      rating: 5,
      projectTitle: "Six-Unit Residential Development — Saselamani",
      isActive: true,
    },
    {
      clientName: "Hluvani Baloyi",
      review:
        "The Block D townhouse complex was approved without revisions. That alone says everything. Professional, on time, every drawing accurate to the building team.",
      rating: 5,
      projectTitle: "Eight-Unit Townhouse Complex — Block D, Malamulele",
      isActive: true,
    },
    {
      clientName: "Nkateko Mathonsi",
      review:
        "I came in with a rough idea of a tavern and they turned it into proper architectural plans that met the Liquor Board, fire and municipality requirements all at once. Saved me months of going back and forth between consultants.",
      rating: 5,
      projectTitle: "Tavern & Lounge — Block H, Malamulele",
      isActive: true,
    },
    {
      clientName: "Vusi Mabunda",
      review:
        "Honest pricing, fast turnaround, and the drawings were detailed enough that my builder had no questions. I will use them again for the second phase.",
      rating: 5,
      // General review — no specific projectId
      isActive: true,
    },
    {
      clientName: "Lerato Khosa",
      review:
        "I needed a small spaza and salon plus a place to live upstairs. They worked the budget hard with me and we ended up with a smart, simple building that I have already grown my business from.",
      rating: 5,
      projectTitle: "Spaza Shop & Storefront — Matiyani",
      isActive: true,
    },
    {
      clientName: "Mpho Mathebula",
      review:
        "From the first meeting on site to the final approved set, the communication was excellent. Every revision was explained, every cost was explained, and there were no surprises.",
      rating: 5,
      // General review
      isActive: true,
    },
    {
      clientName: "Khanyi Shilubana",
      review:
        "We added a workshop to our compound and they handled the change-of-use submission for us. It is now generating income six months later. Couldn't recommend them more.",
      rating: 5,
      projectTitle: "Workshop & Repair Yard — Mhinga",
      isActive: true,
    },
  ];

  let testimonialCount = 0;
  for (const t of testimonials) {
    const exists = await prisma.testimonial.findFirst({
      where: { clientName: t.clientName, deletedAt: null },
      select: { id: true },
    });
    if (!exists) {
      const { projectTitle, ...rest } = t;
      const projectId = projectTitle ? await projectIdFor(projectTitle) : null;
      await prisma.testimonial.create({
        data: { id: createId(), ...rest, projectId },
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
