// Project type — mirrors Prisma model + ISO date strings
export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}
