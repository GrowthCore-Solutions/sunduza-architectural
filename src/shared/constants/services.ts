import { Home, PenTool, Map, Building2 } from "lucide-react";

export const SERVICES = [
  {
    key: "house_planning" as const,
    title: "House Planning",
    shortDescription:
      "Professional house plans that pass council submissions first time.",
    description:
      "Comprehensive house plans designed to pass council submissions first time. We handle site analysis, floor plans, elevations, and section drawings — all compliant with South African National Standards (SANS).",
    features: [
      "Site analysis & orientation",
      "Floor plans & room layouts",
      "Elevations & section drawings",
      "Council submission package",
      "SANS compliance documentation",
    ],
    icon: Home,
    href: "/services#house-planning",
    id: "house-planning",
  },
  {
    key: "arch_drawings" as const,
    title: "Architectural Drawings",
    shortDescription:
      "Detailed drawings with clear dimensioning that contractors build from directly.",
    description:
      "Detailed architectural drawings with precise dimensioning, material specifications, and annotated details that contractors can build from directly — no ambiguity, no costly rework on site.",
    features: [
      "Precise dimensioning & annotations",
      "Material schedules & specifications",
      "Construction detail drawings",
      "Structural coordination",
      "Revision management",
    ],
    icon: PenTool,
    href: "/services#arch-drawings",
    id: "arch-drawings",
  },
  {
    key: "drafting_services" as const,
    title: "Drafting Services",
    shortDescription:
      "Accurate documentation for residential and commercial projects.",
    description:
      "Accurate documentation for residential and commercial projects — from initial concept sketches to full working drawings. CAD-precise, compliant, and ready for submission.",
    features: [
      "CAD drafting & technical drawings",
      "As-built drawings & surveys",
      "Town planning support",
      "Compliance documentation",
      "PDF & DWG delivery",
    ],
    icon: Map,
    href: "/services#drafting",
    id: "drafting",
  },
  {
    key: "dev_project_planning" as const,
    title: "Development Project Planning",
    shortDescription:
      "Full documentation for multi-unit and complex developments.",
    description:
      "Full architectural documentation for multi-unit residential, townhouse complexes, and commercial developments. From bulk & coverage analysis to SANS compliance — built to get approved.",
    features: [
      "Multi-unit layout planning",
      "Bulk & coverage analysis",
      "SANS 10400 compliance",
      "Landscape integration",
      "Full development submission package",
    ],
    icon: Building2,
    href: "/services#development",
    id: "development",
  },
] as const;

export type ServiceKey = (typeof SERVICES)[number]["key"];
