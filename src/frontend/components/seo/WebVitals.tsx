"use client";

import { useReportWebVitals } from "next/web-vitals";
import * as Sentry from "@sentry/nextjs";

// CLS is a unitless ratio; every other Web Vital is a duration in ms.
const UNIT_MAP: Record<string, "millisecond" | "none"> = {
  CLS: "none",
};

export function WebVitals() {
  useReportWebVitals((metric) => {
    const unit = UNIT_MAP[metric.name] ?? "millisecond";
    Sentry.metrics.distribution(
      `web_vitals.${metric.name.toLowerCase()}`,
      metric.value,
      {
        unit,
        attributes: {
          page: window.location.pathname,
          rating: metric.rating,
        },
      }
    );
  });

  return null;
}
