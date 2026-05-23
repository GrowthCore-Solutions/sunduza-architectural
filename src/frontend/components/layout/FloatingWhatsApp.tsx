"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

interface FloatingWhatsAppProps {
  phoneNumber: string;
  message?: string;
}

function WhatsAppGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M16.004 3C8.82 3 3 8.82 3 16.005c0 2.293.6 4.527 1.74 6.504L3 29l6.66-1.738a13 13 0 0 0 6.345 1.62h.005C23.193 28.882 29 23.063 29 15.878 29 12.4 27.65 9.133 25.2 6.683A12.93 12.93 0 0 0 16.004 3Zm0 23.711h-.004a10.74 10.74 0 0 1-5.473-1.5l-.39-.232-3.954 1.034 1.055-3.85-.255-.397a10.71 10.71 0 0 1-1.642-5.762c0-5.95 4.842-10.792 10.792-10.792 2.881 0 5.591 1.122 7.625 3.16a10.72 10.72 0 0 1 3.16 7.633c-.005 5.95-4.846 10.706-10.913 10.706Zm5.917-8.024c-.324-.162-1.918-.946-2.215-1.054-.297-.108-.513-.162-.729.163-.216.324-.835 1.054-1.024 1.27-.189.216-.378.243-.702.081-.324-.162-1.37-.505-2.61-1.612-.965-.86-1.616-1.92-1.806-2.244-.189-.324-.02-.5.142-.66.146-.146.324-.378.487-.567.162-.189.216-.324.324-.54.108-.216.054-.405-.027-.567-.081-.162-.729-1.756-1-2.404-.263-.629-.531-.543-.729-.553-.189-.01-.405-.012-.621-.012-.216 0-.567.081-.864.405-.297.324-1.134 1.108-1.134 2.701 0 1.594 1.16 3.135 1.323 3.351.162.216 2.285 3.49 5.534 4.892.773.334 1.376.534 1.846.683.776.247 1.482.212 2.04.129.622-.093 1.918-.785 2.189-1.542.27-.756.27-1.404.189-1.542-.081-.135-.297-.216-.621-.378Z" />
    </svg>
  );
}

export function FloatingWhatsApp({
  phoneNumber,
  message = "Hello Sunduza Architectural, I'd like to enquire about your services.",
}: FloatingWhatsAppProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;
  if (!phoneNumber) return null;

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="float-wa"
    >
      <span className="float-wa-ping" aria-hidden="true" />
      <span className="float-wa-button">
        <WhatsAppGlyph className="float-wa-icon" />
      </span>
      <span className="float-wa-label">Chat on WhatsApp</span>
    </a>
  );
}
