import { Skeleton } from "@/src/client/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16">
      <Skeleton className="h-10 w-64 mb-4" />
      <Skeleton className="h-5 w-96 mb-10" />
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full rounded-sm" />
        ))}
      </div>
    </div>
  );
}
