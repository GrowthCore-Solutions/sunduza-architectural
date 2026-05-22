import type { BookingService } from "@/shared/types/booking";

export const SERVICES: {
  id: BookingService;
  title: string;
  description: string;
  features: string[];
}[] = [
  {
    id: "house_planning",
    title: "House Planning",
    description:
      "Full architectural plan sets prepared for council submission — site analysis, floor plans, elevations, and SANS-compliant documentation.",
    features: [
      "Site analysis and zoning review",
      "Floor plans, elevations, and sections",
      "Council submission package",
      "Revisions through approval",
    ],
  },
  {
    id: "arch_drawings",
    title: "Architectural Drawings",
    description:
      "Detailed architectural drawings with dimensioning, material schedules, and construction details for builders and contractors.",
    features: [
      "Dimensioned working drawings",
      "Material and finish schedules",
      "Door and window schedules",
      "Construction details",
    ],
  },
  {
    id: "drafting_services",
    title: "Drafting Services",
    description:
      "Professional CAD drafting, as-built drawings, and compliance documentation to support your project timeline.",
    features: [
      "CAD drafting and redlining",
      "As-built documentation",
      "Town planning support drawings",
      "Compliance documentation",
    ],
  },
  {
    id: "dev_project_planning",
    title: "Development Projects",
    description:
      "Planning and architectural support for multi-unit residential, townhouse complexes, and commercial developments.",
    features: [
      "Site feasibility and massing studies",
      "Unit layouts and coverage calculations",
      "Development application drawings",
      "Municipal coordination support",
    ],
  },
];
