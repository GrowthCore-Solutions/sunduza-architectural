interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="mb-12 max-w-3xl">
      {eyebrow && (
        <p className="type-eyebrow mb-4">{eyebrow}</p>
      )}
      <h1 className="font-serif text-[2.75rem] font-semibold leading-tight tracking-[-0.025em] text-ink md:text-6xl">
        {title}
      </h1>
      {description && (
        <p className="mt-5 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
