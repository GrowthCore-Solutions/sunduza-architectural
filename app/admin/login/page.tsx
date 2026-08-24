"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Lock, ShieldCheck } from "lucide-react";
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
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok || !body?.success) {
        setError(body?.error?.message ?? "Invalid email or password. Please try again.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="admin-login-shell">
      {/* ── Brand panel (desktop) ──────────────────────────────────────── */}
      <aside className="admin-login-brand" aria-label="Sunduza brand">
        <div className="admin-login-brand-mark">
          <span className="admin-login-brand-monogram" aria-hidden="true">
            SA
          </span>
          <span>Sunduza Architectural</span>
        </div>

        <div className="admin-login-brand-body">
          <p className="admin-login-brand-eyebrow">Studio operations</p>
          <h2 className="admin-login-brand-headline">
            Manage every brief,<br />
            <em>booking, and brick.</em>
          </h2>
          <p className="admin-login-brand-quote">
            The control panel for projects, consultations, testimonials, and
            site settings &mdash; built for the studio team.
          </p>
        </div>

        <div className="admin-login-brand-foot">
          <strong>Sunduza Architectural &amp; Projects (Pty) Ltd</strong>
          <span>© {new Date().getFullYear()} &middot; Malamulele, Limpopo</span>
        </div>
      </aside>

      {/* ── Form panel ────────────────────────────────────────────────── */}
      <section className="admin-login-form-panel" aria-label="Sign in">
        <div className="admin-login-form-wrap">
          {/* Mobile-only brand */}
          <div className="admin-login-mobile-brand">
            <span className="admin-login-brand-monogram" aria-hidden="true">
              SA
            </span>
            <span style={{ fontFamily: "var(--font-serif)", fontSize: "1rem", color: "var(--color-ink)" }}>
              Sunduza Architectural
            </span>
          </div>

          <header className="admin-login-head">
            <p className="admin-login-eyebrow">
              <ShieldCheck size={12} strokeWidth={2.25} aria-hidden="true" />
              Admin portal
            </p>
            <h1 className="admin-login-title">
              Welcome<br />
              <em>back.</em>
            </h1>
            <p className="admin-login-sub">
              Sign in to manage projects, bookings, messages, and site
              settings.
            </p>
          </header>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="admin-login-card"
            noValidate
          >
            {error && (
              <div className="admin-login-error" role="alert">
                <AlertCircle
                  size={15}
                  strokeWidth={2.25}
                  className="admin-login-error-icon"
                  aria-hidden="true"
                />
                <span>{error}</span>
              </div>
            )}

            <div className="admin-login-field">
              <Label htmlFor="email" required>
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@sunduza.co.za"
                aria-invalid={errors.email ? "true" : "false"}
                {...register("email")}
              />
              {errors.email && (
                <p className="admin-login-field-error">{errors.email.message}</p>
              )}
            </div>

            <div className="admin-login-field">
              <div className="admin-login-field-label-row">
                <Label htmlFor="password" required>
                  Password
                </Label>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={errors.password ? "true" : "false"}
                {...register("password")}
              />
              {errors.password && (
                <p className="admin-login-field-error">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="admin-login-submit"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Signing in…"
              ) : (
                <>
                  Sign in <ArrowRight size={15} />
                </>
              )}
            </Button>
          </form>

          <p className="admin-login-foot">
            <Lock size={11} style={{ display: "inline", verticalAlign: "-1px", marginRight: "0.35rem" }} aria-hidden="true" />
            Authorised studio staff only.
          </p>
        </div>
      </section>
    </div>
  );
}
