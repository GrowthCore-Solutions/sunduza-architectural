// NextAuth v5 type augmentation for Sunduza
// Session exposes: id, email, name, role — safe fields only (S3.8)

import type { DefaultSession } from "next-auth";
import type { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
  }
}
