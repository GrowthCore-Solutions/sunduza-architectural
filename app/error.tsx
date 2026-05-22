"use client";

import * as React from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/client/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <div className="paper-grain flex min-h-[80vh] items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <RefreshCw className="h-6 w-6" />
        </div>
        <p className="type-eyebrow mb-5" style={{ color: "rgb(185 28 28)" }}>
          Something went wrong
        </p>
        <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-ink md:text-4xl">
          An unexpected error occurred
        </h2>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted">
          We encountered an issue loading this page. This has been noted — please
          try again, or contact us on WhatsApp if it persists.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
