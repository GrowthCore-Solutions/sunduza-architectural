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
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={inputId} required={required}>
        {label}
      </Label>
      {hint && <p className="text-xs text-[--color-muted] -mt-0.5">{hint}</p>}
      {children}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
