import { Skeleton } from "@/src/client/components/ui/skeleton";

export default function AdminBookingsLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-10 w-full max-w-md" />
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-sm" />
      ))}
    </div>
  );
}
