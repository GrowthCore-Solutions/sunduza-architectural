import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";

export default function NotFound() {
  return (
    <div className="paper-grain flex min-h-[80vh] items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <p className="font-serif text-[8rem] font-light leading-none tracking-[-0.04em] text-rule select-none">
          404
        </p>
        <p className="type-eyebrow mt-2 mb-5">Page not found</p>
        <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
          This page doesn&rsquo;t exist
        </h1>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted">
          The page you are looking for may have been moved, renamed, or removed.
          Let&rsquo;s get you back on track.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contact">
              Contact us
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
