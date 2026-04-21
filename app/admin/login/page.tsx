"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
type LoginInput = z.infer<typeof LoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });
    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push("/admin/dashboard");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f2] px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#b88b4a] mb-2">Admin</p>
          <h1 className="font-serif text-3xl font-bold text-[#0f172a]">Sign In</h1>
        </div>

        {error && (
          <div className="mb-6 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="email" required>Email</Label>
            <Input id="email" type="email" placeholder="admin@sunduza.co.za" {...register("email")} />
            {errors.email && <p className="text-xs text-red-700">{errors.email.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" required>Password</Label>
            <Input id="password" type="password" placeholder="Enter password" {...register("password")} />
            {errors.password && <p className="text-xs text-red-700">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
