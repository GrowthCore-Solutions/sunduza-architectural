"use client";

import * as React from "react";
import { Label } from "@/src/client/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactElement<{ id?: string }>;
}

export function FormField({
  label,
  error,
  required,
  hint,
  className,
  children,
}: FormFieldProps) {
  const inputId = children.props.id;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      {hint && <p className="-mt-0.5 text-xs leading-relaxed text-muted">{hint}</p>}
      {children}
      {error && (
        <p className="text-xs font-medium text-red-700" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
