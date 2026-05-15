import Link from "next/link";
import { Button } from "@/src/client/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-[--color-primary] mb-4">
          404
        </p>
        <h1 className="font-serif text-4xl font-black text-[--color-ink] mb-4">
          Page Not Found
        </h1>
        <p className="text-[--color-muted] mb-8 leading-relaxed">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
