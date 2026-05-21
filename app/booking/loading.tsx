import { Skeleton } from "@/src/client/components/ui/skeleton";

export default function BookingLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 space-y-4">
      <Skeleton className="h-10 w-64" />
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}
