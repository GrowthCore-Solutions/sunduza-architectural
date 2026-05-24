"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/frontend/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[admin]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center max-w-md">
        <h2 className="font-serif text-2xl font-black mb-4">Something went wrong</h2>
        <p className="text-muted mb-6">
          An error occurred in the admin section. Try again or return to the dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/admin">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
