"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";

const LoginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof LoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="paper-grain flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-ink text-sm font-black text-white shadow-soft">
            SA
          </div>
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-primary mb-2">
            Admin Portal
          </p>
          <h1 className="font-serif text-3xl font-bold text-ink">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-muted">
            Sunduza Architectural & Projects
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-5 rounded-md border border-rule/75 bg-white/95 p-8 shadow-soft"
          noValidate
        >
          <div className="space-y-1.5">
            <Label htmlFor="email" required>
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@sunduza.co.za"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs font-medium text-red-700">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" required>
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs font-medium text-red-700">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted">
          This portal is for authorised staff only.
        </p>
      </div>
    </div>
  );
}
