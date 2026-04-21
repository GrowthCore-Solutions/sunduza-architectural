// Testimonial type — mirrors Prisma model + ISO date strings
export interface Testimonial {
  id: string;
  clientName: string;
  review: string;
  rating: number;
  createdAt: string;
}
