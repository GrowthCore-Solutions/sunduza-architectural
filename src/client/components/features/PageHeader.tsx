interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="mb-10 max-w-2xl">
      {eyebrow && (
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-[--color-primary] mb-3">
          {eyebrow}
        </p>
      )}
      <h1 className="font-serif text-4xl md:text-5xl font-black text-[--color-ink] tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-4 text-[--color-muted] leading-relaxed">{description}</p>
      )}
    </div>
  );
}
