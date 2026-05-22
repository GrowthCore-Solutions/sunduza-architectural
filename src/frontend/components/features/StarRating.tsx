import { Star } from "lucide-react";
import { cn } from "@/frontend/lib/utils";

export function StarRating({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex gap-0.5", className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < rating ? "fill-primary text-primary" : "text-rule"
          )}
        />
      ))}
    </div>
  );
}
