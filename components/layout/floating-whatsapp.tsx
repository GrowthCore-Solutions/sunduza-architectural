"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// WhatsApp config from theme.json
const WHATSAPP_NUMBER = "27786723364";
const WHATSAPP_MESSAGE = encodeURIComponent("Hello, I'm interested in architectural services.");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export function FloatingWhatsApp() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:bg-[#20ba5c] active:scale-95 transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      )}
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}