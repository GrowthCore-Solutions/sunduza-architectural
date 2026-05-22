"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { cn } from "@/frontend/lib/utils";

interface FloatingWhatsAppProps {
  phoneNumber: string;
  message?: string;
}

export function FloatingWhatsApp({
  phoneNumber,
  message = "Hello, I'm interested in architectural services from Sunduza.",
}: FloatingWhatsAppProps) {
  const pathname = usePathname();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  if (pathname.startsWith("/admin")) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className={cn(
        "fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg ring-4 ring-white/75 transition-all duration-500 md:bottom-6 md:right-6",
        "hover:bg-[#20ba5c] hover:scale-105 active:scale-95",
        visible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0 pointer-events-none"
      )}
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
