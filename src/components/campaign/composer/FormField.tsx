import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export function FormField({
  id,
  label,
  required,
  hint,
  error,
  children,
  count,
  className,
}: {
  id: string;
  label: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  count?: { current: number; max: number };
  className?: string;
}) {
  return (
    <div data-field={id} className={cn("scroll-mt-28", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-semibold text-foreground">
          {label}
          {required ? <span className="ml-1 text-primary">*</span> : null}
        </label>
        {count ? (
          <span
            className={cn(
              "num text-xs tabular-nums text-muted-foreground",
              count.current > count.max && "text-destructive",
            )}
          >
            {count.current}/{count.max}
          </span>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-destructive"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
  aside,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="panel p-5 sm:p-6 lg:p-7">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {aside}
      </header>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
