import { z } from "zod";

export const ProjectCreateSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1),
  imagePath: z.string().min(1).max(255),
  category: z.string().optional(),
  isFeatured: z.boolean().optional().default(false),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export const ProjectUpdateSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).optional(),
  imagePath: z.string().min(1).max(255).optional(),
  category: z.string().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateSchema>;

/** @deprecated Use ProjectRow from types/db */
export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  imageUrl: string;
  category: string;
  createdAt: string;
}
