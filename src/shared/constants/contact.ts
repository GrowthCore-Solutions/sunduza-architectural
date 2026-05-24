// Single source of truth for Sunduza Architectural & Projects contact details.
// Update here and every consumer (pages, components, emails) reflects immediately.

export const CONTACT = {
  /** E.164 format — used in tel: and wa.me links */
  PHONE_E164: "+27786723364",
  /** Display format */
  PHONE_DISPLAY: "+27 78 672 3364",
  /** WhatsApp deep-link number (no +) */
  WHATSAPP_NUMBER: "27786723364",
  EMAIL: "xivutisokevinsunduza@gmail.com",
  HOURS: "Mon–Fri, 8 am – 5 pm",
  HOURS_FULL: "Mon–Fri, 8 am – 5 pm SAST",
  LOCATION: "Malamulele, Limpopo, South Africa",
} as const;
