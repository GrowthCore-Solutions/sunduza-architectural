import Link from "next/link";
import { ArrowRight, Home, PenTool, Map, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const SERVICES = [
  {
    icon: Home,
    title: "House Planning",
    description: "Professional house plans that pass council submissions first time.",
  },
  {
    icon: PenTool,
    title: "Architectural Drawings",
    description: "Detailed drawings with clear dimensioning and annotations.",
  },
  {
    icon: Map,
    title: "Drafting Services",
    description: "Accurate documentation for residential and commercial projects.",
  },
  {
    icon: Building,
    title: "Development Projects",
    description: "Full documentation for multi-unit and complex developments.",
  },
];

const STATS = [
  { value: "5+", label: "Years Experience" },
  { value: "50+", label: "Projects Delivered" },
  { value: "100%", label: "SA Council Compliant" },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero/hero-desktop.png')" }}
        />
        <div className="absolute inset-0 bg-[#fff7ef]/60" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#b88b4a] mb-6">
            Sunduza Architectural & Projects
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-black text-[#0f172a] mb-6 leading-tight">
            Architecture That<br />Builds Confidence
          </h1>
          <p className="text-lg text-[#5a5040] mb-10 max-w-2xl mx-auto leading-relaxed">
            We create professional architectural plans and drawings that give you clarity, compliance, and control over your building project.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking">
              <Button size="lg">
                Book Consultation
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="outline" size="lg">
                View Our Work
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="bg-[#0f172a] py-12">
        <div className="mx-auto max-w-5xl px-4 grid grid-cols-3 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="font-serif text-4xl font-black text-[#b88b4a]">{s.value}</div>
              <div className="text-xs text-white/50 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-24 bg-[#faf8f2]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b88b4a] mb-3">What We Do</p>
            <h2 className="font-serif text-4xl font-black text-[#0f172a]">Our Services</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SERVICES.map((svc) => {
              const Icon = svc.icon;
              return (
                <Card key={svc.title} className="group hover:border-[#b88b4a] transition-colors duration-300">
                  <CardContent className="pt-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm bg-[#f5f0e8] text-[#b88b4a] group-hover:bg-[#b88b4a] group-hover:text-white transition-colors duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#0f172a] mb-2">{svc.title}</h3>
                    <p className="text-sm text-[#5a5040] leading-relaxed">{svc.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <div className="text-center mt-12">
            <Link href="/services">
              <Button variant="outline">
                View All Services
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Strip ── */}
      <section className="bg-[#b88b4a] py-20 text-center">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">Ready to Start Your Project?</h2>
          <p className="text-white/80 mb-8">Book a consultation and get professional architectural plans tailored to your vision.</p>
          <Link href="/booking">
            <Button size="lg" className="bg-white text-[#b88b4a] hover:bg-[#f5f0e8]">
              Book Consultation
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
