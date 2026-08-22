import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  sub,
  tone = "neutral",
  progress,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
  progress?: number;
  icon?: ReactNode;
}) {
  const subText = {
    neutral: "text-muted-foreground",
    good: "text-success",
    warn: "text-warning",
    bad: "text-destructive",
  }[tone];
  const toneBar = {
    neutral: "bg-accent",
    good: "bg-success",
    warn: "bg-warning",
    bad: "bg-destructive",
  }[tone];
  const chip = {
    neutral: "bg-accent/10 text-accent",
    good: "bg-success/12 text-success",
    warn: "bg-warning/15 text-warning",
    bad: "bg-destructive/12 text-destructive",
  }[tone];

  return (
    <div className="panel group relative overflow-hidden p-4 transition-shadow hover:shadow-lg sm:p-5">
      <span
        className={cn("absolute inset-x-0 top-0 h-0.5 opacity-70", toneBar)}
        aria-hidden
      />
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <p className="min-w-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        {icon ? (
          <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", chip)}>
            {icon}
          </span>
        ) : null}
      </div>
      <p className="num mt-3 text-2xl font-bold tracking-tight sm:text-[1.75rem]">{value}</p>
      {typeof progress === "number" ? (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full transition-all", toneBar)}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      ) : null}
      {sub ? <p className={cn("mt-2 text-xs font-medium", subText)}>{sub}</p> : null}
    </div>
  );
}
