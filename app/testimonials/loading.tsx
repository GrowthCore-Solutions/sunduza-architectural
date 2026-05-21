import { Skeleton } from "@/src/client/components/ui/skeleton";

export default function TestimonialsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <Skeleton className="h-10 w-64 mb-10" />
      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-sm" />
        ))}
      </div>
    </div>
  );
}
