import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export function ChipMultiSelect<T extends string>({
  options,
  value,
  onChange,
  invalid,
}: {
  options: Array<{ id: T; label: string }>;
  value: T[];
  onChange: (next: T[]) => void;
  invalid?: boolean;
}) {
  const toggle = (id: T) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div className={cn("flex flex-wrap gap-2", invalid && "rounded-2xl")}>
      {options.map((o) => {
        const active = value.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(o.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border-primary bg-primary/10 text-primary"
                : "border-input bg-surface text-foreground hover:border-foreground/30 hover:bg-surface-2",
              invalid && !active && "border-destructive/50",
            )}
          >
            {active ? <Check className="size-3.5" /> : null}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
