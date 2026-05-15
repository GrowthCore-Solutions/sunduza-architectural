"use client";

import * as React from "react";
import { Button } from "@/src/client/components/ui/button";
import { RefreshCw } from "lucide-react";

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
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-red-600 mb-4">
          Something went wrong
        </p>
        <h2 className="font-serif text-3xl font-black text-[--color-ink] mb-4">
          An error occurred
        </h2>
        <p className="text-[--color-muted] mb-8 leading-relaxed">
          We encountered an unexpected issue. Please try again — if the problem
          persists, contact us on WhatsApp.
        </p>
        <Button onClick={reset}>
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}
