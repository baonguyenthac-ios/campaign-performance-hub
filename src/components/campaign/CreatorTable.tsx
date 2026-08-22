import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { currency, pct, type CreatorRow } from "@/lib/campaign-performance";
import { Star } from "lucide-react";

const statusMeta: Record<CreatorRow["status"], { label: string; cls: string }> = {
  on_track: { label: "Đúng tiến độ", cls: "bg-success/15 text-success border-success/30" },
  at_risk: { label: "Cần theo dõi", cls: "bg-warning/15 text-warning border-warning/30" },
  late: { label: "Trễ hạn", cls: "bg-destructive/15 text-destructive border-destructive/30" },
};

function Bar({ value, tone }: { value: number; tone: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
      <span className="num text-sm">{pct(value)}</span>
    </div>
  );
}

const toneFor = (v: number) =>
  v >= 85 ? "bg-success" : v >= 65 ? "bg-warning" : "bg-destructive";

export function CreatorTable({ rows }: { rows: CreatorRow[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold sm:text-lg">Hiệu suất từng Creator</h2>
          <p className="text-xs text-muted-foreground">
            So sánh tiến độ, chất lượng duyệt và chi phí đã thanh toán
          </p>
        </div>
        <span className="num shrink-0 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted-foreground">
          {rows.length} creator
        </span>
      </div>

      {/* Mobile: cards */}
      <ul className="divide-y divide-border lg:hidden">
        {rows.map((r) => (
          <li key={r.id} className="space-y-3 p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">{r.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {r.handle} · {r.tier}
                </p>
              </div>
              <Badge variant="outline" className={cn("shrink-0", statusMeta[r.status].cls)}>
                {statusMeta[r.status].label}
              </Badge>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Booking</dt>
                <dd className="num">{r.bookings}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Chi phí</dt>
                <dd className="num">{currency(r.paidCost)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Hoàn thành</dt>
                <dd>
                  <Bar value={r.completionRate} tone={toneFor(r.completionRate)} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Đúng hạn</dt>
                <dd>
                  <Bar value={r.onTimeRate} tone={toneFor(r.onTimeRate)} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Duyệt lần đầu</dt>
                <dd>
                  <Bar value={r.firstApprovalRate} tone={toneFor(r.firstApprovalRate)} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Sửa / Điểm</dt>
                <dd className="num flex items-center gap-2">
                  {r.revisions}
                  <span className="flex items-center gap-1 text-warning">
                    <Star className="size-3.5 fill-current" />
                    {r.rating.toFixed(1)}
                  </span>
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      {/* Desktop / tablet: table */}
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-6 py-3 font-medium">Creator</th>
              <th className="px-4 py-3 font-medium">Booking</th>
              <th className="px-4 py-3 font-medium">Hoàn thành</th>
              <th className="px-4 py-3 font-medium">Đúng hạn</th>
              <th className="px-4 py-3 font-medium">Duyệt lần đầu</th>
              <th className="px-4 py-3 font-medium">Sửa</th>
              <th className="px-4 py-3 font-medium">Điểm</th>
              <th className="px-4 py-3 font-medium">Chi phí</th>
              <th className="px-6 py-3 font-medium">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className="transition-colors hover:bg-surface-2/70">
                <td className="px-6 py-4">
                  <p className="font-semibold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.handle} · {r.tier}
                  </p>
                </td>
                <td className="num px-4 py-4">{r.bookings}</td>
                <td className="px-4 py-4">
                  <Bar value={r.completionRate} tone={toneFor(r.completionRate)} />
                </td>
                <td className="px-4 py-4">
                  <Bar value={r.onTimeRate} tone={toneFor(r.onTimeRate)} />
                </td>
                <td className="px-4 py-4">
                  <Bar value={r.firstApprovalRate} tone={toneFor(r.firstApprovalRate)} />
                </td>
                <td className="num px-4 py-4">{r.revisions}</td>
                <td className="px-4 py-4">
                  <span className="num flex items-center gap-1 text-warning">
                    <Star className="size-3.5 fill-current" />
                    {r.rating.toFixed(1)}
                  </span>
                </td>
                <td className="num px-4 py-4">{currency(r.paidCost)}</td>
                <td className="px-6 py-4">
                  <Badge variant="outline" className={statusMeta[r.status].cls}>
                    {statusMeta[r.status].label}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
