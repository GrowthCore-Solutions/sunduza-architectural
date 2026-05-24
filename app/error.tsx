"use client";

import * as React from "react";
import { ArrowLeft, AlertTriangle, MessageCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/frontend/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <main className="system-page" aria-labelledby="err-title">
      <div className="system-page-inner">
        <div>
          <div className="system-page-numeral" aria-hidden="true">
            5<em>0</em>0
          </div>
          <p className="system-page-eyebrow">Something went wrong</p>
          <h1 id="err-title" className="system-page-title">
            An unexpected<br />
            <em>error occurred.</em>
          </h1>
          <p className="system-page-sub">
            We hit a snag loading this page. The issue has been logged and
            we&rsquo;ll take a look &mdash; please try again, or reach out on
            WhatsApp if it keeps happening.
          </p>

          {error.digest && (
            <div className="system-page-meta" aria-label="Error reference">
              <span>
                Reference
                <strong>{error.digest}</strong>
              </span>
            </div>
          )}

          <div className="system-page-actions">
            <Button onClick={reset} variant="default" size="lg">
              <RefreshCw size={15} /> Try again
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">
                <ArrowLeft size={15} /> Back to home
              </Link>
            </Button>
          </div>
        </div>

        <nav aria-label="Get help">
          <div className="system-page-links">
            <button
              type="button"
              onClick={reset}
              className="system-page-link"
              style={{ cursor: "pointer", textAlign: "left", font: "inherit" }}
            >
              <span className="system-page-link-icon" aria-hidden="true">
                <RefreshCw size={16} strokeWidth={1.75} />
              </span>
              <div className="system-page-link-foot">
                <div>
                  <p className="system-page-link-title">Retry</p>
                  <span className="system-page-link-cta">
                    Reload page <RefreshCw size={11} />
                  </span>
                </div>
              </div>
            </button>

            <Link href="/" className="system-page-link">
              <span className="system-page-link-icon" aria-hidden="true">
                <ArrowLeft size={16} strokeWidth={1.75} />
              </span>
              <div className="system-page-link-foot">
                <div>
                  <p className="system-page-link-title">Home</p>
                  <span className="system-page-link-cta">
                    Start over <ArrowLeft size={11} />
                  </span>
                </div>
              </div>
            </Link>

            <Link href="/contact" className="system-page-link">
              <span className="system-page-link-icon" aria-hidden="true">
                <MessageCircle size={16} strokeWidth={1.75} />
              </span>
              <div className="system-page-link-foot">
                <div>
                  <p className="system-page-link-title">Contact</p>
                  <span className="system-page-link-cta">
                    Tell us what broke
                  </span>
                </div>
              </div>
            </Link>

            <div className="system-page-link" aria-hidden="true">
              <span className="system-page-link-icon">
                <AlertTriangle size={16} strokeWidth={1.75} />
              </span>
              <div className="system-page-link-foot">
                <div>
                  <p className="system-page-link-title">Logged</p>
                  <span className="system-page-link-cta">
                    We&rsquo;re on it
                  </span>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </main>
  );
}
