import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";

import { cn } from "@/lib/utils";

const TOOLS = [
  { cmd: "bold", icon: Bold, label: "In đậm" },
  { cmd: "italic", icon: Italic, label: "In nghiêng" },
  { cmd: "underline", icon: Underline, label: "Gạch chân" },
  { cmd: "insertUnorderedList", icon: List, label: "Danh sách" },
  { cmd: "insertOrderedList", icon: ListOrdered, label: "Danh sách số" },
] as const;

export function RichTextEditor({
  id,
  value,
  onChange,
  invalid,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (html: string) => void;
  invalid?: boolean;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value;
  }, [value]);

  const exec = (cmd: string) => {
    ref.current?.focus();
    document.execCommand(cmd);
    onChange(ref.current?.innerHTML ?? "");
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-input bg-surface transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
        invalid && "border-destructive/70 focus-within:border-destructive",
      )}
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-surface-2 px-2 py-1.5">
        {TOOLS.map((t) => (
          <button
            key={t.cmd}
            type="button"
            aria-label={t.label}
            title={t.label}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => exec(t.cmd)}
            className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <t.icon className="size-4" />
          </button>
        ))}
      </div>
      <div
        id={id}
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onBlur={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className={cn(
          "min-h-40 w-full px-4 py-3 text-sm leading-relaxed outline-none",
          "[&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-5 [&_ol]:pl-5 [&_p]:mb-2",
          "empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
        )}
      />
    </div>
  );
}
