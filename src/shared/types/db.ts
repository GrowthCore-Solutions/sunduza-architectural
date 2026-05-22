import { Prisma } from "@prisma/client";

export const bookingRowSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  service: true,
  location: true,
  description: true,
  meetingDate: true,
  budget: true,
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

export const settingRowSelect = {
  key: true,
  value: true,
  description: true,
  updatedAt: true,
} satisfies Prisma.SiteSettingsSelect;

export type SettingRow = Prisma.SiteSettingsGetPayload<{
  select: typeof settingRowSelect;
}>;
