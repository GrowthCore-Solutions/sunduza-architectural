import { cn } from "@/lib/utils";
import { SectionLabel } from "./SectionLabel";

interface PageHeroProps {
  label: string;
  title: string;
  description?: string;
  className?: string;
  dark?: boolean;
}

export function PageHero({
  label,
  title,
  description,
  className,
  dark = true,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "py-20 text-center",
        dark ? "bg-[--color-ink] text-white" : "bg-[--color-paper2]",
        className
      )}
    >
      <div className="mx-auto max-w-3xl px-4">
        <SectionLabel
          className={dark ? "text-[--color-primary]" : "text-[--color-primary]"}
        >
          {label}
        </SectionLabel>
        <h1
          className={cn(
            "mt-3 font-serif text-4xl md:text-5xl font-black leading-tight",
            dark ? "text-white" : "text-[--color-ink]"
          )}
        >
          {title}
        </h1>
        {description && (
          <p
            className={cn(
              "mt-4 text-base md:text-lg leading-relaxed max-w-2xl mx-auto",
              dark ? "text-white/70" : "text-[--color-muted]"
            )}
          >
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
