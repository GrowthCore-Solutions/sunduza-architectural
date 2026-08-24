import { Prisma } from "@prisma/client";

export const bookingRowSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  service: true,
  serviceId: true,
  leadId: true,
  location: true,
  description: true,
  meetingDate: true,
  budget: true,
  budgetMinCents: true,
  budgetMaxCents: true,
  budgetCurrency: true,
  status: true,
  leadScore: true,
  adminNotes: true,
  consentGiven: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.BookingSelect;

export type BookingRow = Prisma.BookingGetPayload<{ select: typeof bookingRowSelect }>;

export const bookingConfirmSelect = {
  id: true,
  status: true,
  leadScore: true,
} satisfies Prisma.BookingSelect;

export type BookingConfirm = Prisma.BookingGetPayload<{
  select: typeof bookingConfirmSelect;
}>;

export const projectRowSelect = {
  id: true,
  title: true,
  description: true,
  imagePath: true,
  category: true,
  sortOrder: true,
  isFeatured: true,
  createdAt: true,
} satisfies Prisma.ProjectSelect;

export type ProjectRow = Prisma.ProjectGetPayload<{ select: typeof projectRowSelect }>;

export const testimonialRowSelect = {
  id: true,
  clientName: true,
  review: true,
  rating: true,
  projectId: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.TestimonialSelect;

export type TestimonialRow = Prisma.TestimonialGetPayload<{
  select: typeof testimonialRowSelect;
}>;

export const contactMessageRowSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  message: true,
  read: true,
  readAt: true,
  createdAt: true,
} satisfies Prisma.ContactMessageSelect;

export type ContactMessageRow = Prisma.ContactMessageGetPayload<{
  select: typeof contactMessageRowSelect;
}>;

export const contactConfirmSelect = {
  id: true,
} satisfies Prisma.ContactMessageSelect;

export type ContactConfirm = Prisma.ContactMessageGetPayload<{
  select: typeof contactConfirmSelect;
}>;

export const leadRowSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  firstSeenAt: true,
  lastSeenAt: true,
  bookingCount: true,
  createdAt: true,
} satisfies Prisma.LeadSelect;

export type LeadRow = Prisma.LeadGetPayload<{ select: typeof leadRowSelect }>;

export const serviceRowSelect = {
  id: true,
  slug: true,
  name: true,
  description: true,
  icon: true,
  isActive: true,
  sortOrder: true,
} satisfies Prisma.ServiceSelect;

export type ServiceRow = Prisma.ServiceGetPayload<{ select: typeof serviceRowSelect }>;

export const settingRowSelect = {
  key: true,
  value: true,
  valueType: true,
  category: true,
  isPublic: true,
  description: true,
  updatedAt: true,
} satisfies Prisma.SiteSettingsSelect;

export type SettingRow = Prisma.SiteSettingsGetPayload<{
  select: typeof settingRowSelect;
}>;

// Credentials-auth projection — includes the password hash and lockout
// fields, so this must never leave the auth service/repository boundary
// (never returned from an API route or put in a session).
export const userAuthSelect = {
  id: true,
  email: true,
  name: true,
  password: true,
  role: true,
  failedAttempts: true,
  lockedUntil: true,
  deletedAt: true,
} satisfies Prisma.UserSelect;

export type UserAuthRow = Prisma.UserGetPayload<{ select: typeof userAuthSelect }>;
