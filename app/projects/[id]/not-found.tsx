import Link from "next/link";
import { Button } from "@/frontend/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary mb-4">
          Project not found
        </p>
        <h1 className="font-serif text-4xl font-black text-ink mb-4">
          This project doesn&apos;t exist
        </h1>
        <p className="text-muted mb-8 leading-relaxed">
          The project you are looking for may have been removed or the link may be incorrect.
        </p>
        <Button asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
            View all projects
          </Link>
        </Button>
      </div>
    </div>
  );
}
