"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  );
}

interface SheetContentProps {
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function SheetContent({ children, side = "right", className }: SheetContentProps) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <Dialog.Content
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-white shadow-xl transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right-0 data-[state=open]:slide-in-from-right-0",
          className
        )}
      >
        <div className="flex flex-col h-full">
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          {children}
        </div>
        <Dialog.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none">
          <X className="h-5 w-5" />
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export function SheetTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  if (className) {
    return (
      <Dialog.Trigger className={className}>
        {children}
      </Dialog.Trigger>
    );
  }
  return <Dialog.Trigger>{children}</Dialog.Trigger>;
}
