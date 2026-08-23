import { useState } from "react";
import { Plus, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { SUGGESTED_TAGS } from "@/lib/campaign-composer";

export function TagInput({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  const add = (raw: string) => {
    const tag = raw.trim().replace(/^#/, "").slice(0, 32);
    if (!tag || value.includes(tag)) return;
    onChange([...value, tag]);
    setDraft("");
  };

  const suggestions = SUGGESTED_TAGS.filter((t) => !value.includes(t)).slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          id="tags"
          value={draft}
          placeholder="Nhập tag rồi bấm Enter (ví dụ: review)"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add(draft);
            }
            if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
        />
        <button
          type="button"
          onClick={() => add(draft)}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-input px-3 text-sm font-semibold transition-colors hover:border-primary hover:text-primary"
        >
          <Plus className="size-4" /> Thêm
        </button>
      </div>

      {value.length ? (
        <div className="flex flex-wrap gap-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 py-1.5 pl-3 pr-2 text-xs font-bold text-primary"
            >
              #{tag}
              <button
                type="button"
                aria-label={`Xoá tag ${tag}`}
                onClick={() => onChange(value.filter((v) => v !== tag))}
                className="grid size-4 place-items-center rounded-full bg-primary/20 hover:bg-primary hover:text-primary-foreground"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      ) : null}

      {suggestions.length ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Gợi ý:</span>
          {suggestions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => add(t)}
              className="rounded-full border border-dashed border-input px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              #{t}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
