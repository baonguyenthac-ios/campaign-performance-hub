import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type StepMeta = { id: string; label: string };

export function Stepper({
  steps,
  current,
  completed,
  onSelect,
}: {
  steps: StepMeta[];
  current: number;
  completed: boolean[];
  onSelect: (index: number) => void;
}) {
  return (
    <nav aria-label="Tiến trình tạo chiến dịch" className="w-full">
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((s, i) => {
          const isCurrent = i === current;
          const isDone = completed[i] && !isCurrent;
          return (
            <li key={s.id} className={cn("flex min-w-0 items-center gap-2", isCurrent ? "flex-1" : "shrink-0")}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-current={isCurrent ? "step" : undefined}
                className={cn(
                  "group flex min-w-0 items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-bold transition-all sm:px-3",
                  isCurrent
                    ? "border-primary bg-primary/10 text-primary"
                    : isDone
                      ? "border-success/40 bg-success/10 text-success"
                      : "border-input text-muted-foreground hover:border-primary/50 hover:text-primary",
                )}
              >
                <span
                  className={cn(
                    "num grid size-5 shrink-0 place-items-center rounded-full text-[10px]",
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isDone
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isDone ? <Check className="size-3" /> : i + 1}
                </span>
                <span className={cn("truncate", !isCurrent && "hidden sm:inline")}>{s.label}</span>
              </button>
              {i < steps.length - 1 ? (
                <span
                  aria-hidden
                  className={cn(
                    "h-px min-w-3 flex-1 rounded-full",
                    completed[i] ? "bg-success/50" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          );
        })}
      </ol>
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${((current + 1) / steps.length) * 100}%` }}
          />
        </div>
        <span className="num text-[11px] font-bold text-muted-foreground">
          {current + 1}/{steps.length}
        </span>
      </div>
    </nav>
  );
}
