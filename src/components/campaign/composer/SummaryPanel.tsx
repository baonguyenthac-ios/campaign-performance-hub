import { CalendarClock, CheckCircle2, CircleDollarSign, Circle, Layers, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  PLATFORMS,
  formatDate,
  vnd,
  type DraftInput,
  type Errors,
  type FieldKey,
} from "@/lib/campaign-composer";

const CHECKLIST: Array<{ key: FieldKey; label: string }> = [
  { key: "coverDataUrl", label: "Ảnh bìa 4:3" },
  { key: "name", label: "Tên chiến dịch" },
  { key: "category", label: "Ngành hàng" },
  { key: "platforms", label: "Nền tảng mục tiêu" },
  { key: "budget", label: "Ngân sách ≥ 100.000₫" },
  { key: "deadline", label: "Hạn nhận hồ sơ" },
  { key: "deliverySummary", label: "Tóm tắt bàn giao" },
  { key: "description", label: "Mô tả chiến dịch" },
];

export function SummaryPanel({
  draft,
  errors,
  className,
}: {
  draft: DraftInput;
  errors: Errors;
  className?: string | undefined;
}) {
  const done = CHECKLIST.filter((c) => !errors[c.key]).length;

  return (
    <div className={cn("panel overflow-hidden", className)}>
      <div className="relative aspect-[4/3] w-full bg-surface-2">
        {draft.coverDataUrl ? (
          <img src={draft.coverDataUrl} alt="" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-xs text-muted-foreground">
            Ảnh bìa sẽ hiển thị ở đây
          </div>
        )}
      </div>
      <div className="space-y-4 p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Xem trước trên Discovery
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-bold">
            {draft.name.trim() || "Tên chiến dịch của bạn"}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {draft.category || "Chưa chọn ngành hàng"}
          </p>
        </div>

        <dl className="space-y-2.5 border-t border-border pt-4 text-sm">
          <Row icon={<CircleDollarSign className="size-4" />} label="Ngân sách" value={vnd(draft.budget)} />
          <Row icon={<Users className="size-4" />} label="Số creator" value={String(draft.creatorCount)} />
          <Row
            icon={<CalendarClock className="size-4" />}
            label="Hạn nhận hồ sơ"
            value={formatDate(draft.deadline)}
          />
          <Row
            icon={<Layers className="size-4" />}
            label="Nền tảng"
            value={
              draft.platforms.length
                ? draft.platforms
                    .map((p) => PLATFORMS.find((x) => x.id === p)?.label ?? p)
                    .join(", ")
                : "—"
            }
          />
        </dl>

        {draft.tags.length ? (
          <div className="flex flex-wrap gap-1.5 border-t border-border pt-4">
            {draft.tags.map((t) => (
              <span key={t} className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold">
                #{t}
              </span>
            ))}
          </div>
        ) : null}

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold">Checklist trước khi xuất bản</p>
            <span className="num text-xs font-bold text-muted-foreground">
              {done}/{CHECKLIST.length}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success transition-all"
              style={{ width: `${(done / CHECKLIST.length) * 100}%` }}
            />
          </div>
          <ul className="mt-3 space-y-1.5">
            {CHECKLIST.map((c) => {
              const ok = !errors[c.key];
              return (
                <li key={c.key} className="flex items-center gap-2 text-xs">
                  {ok ? (
                    <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                  ) : (
                    <Circle className="size-3.5 shrink-0 text-muted-foreground/60" />
                  )}
                  <span className={ok ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
      <dt className="flex min-w-0 items-center gap-2 text-muted-foreground">
        <span className="shrink-0 text-primary">{icon}</span>
        <span className="truncate">{label}</span>
      </dt>
      <dd className="num min-w-0 truncate text-right font-bold">{value}</dd>
    </div>
  );
}
