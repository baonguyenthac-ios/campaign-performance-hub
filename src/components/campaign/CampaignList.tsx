import { useMemo, useState } from "react";
import { ChevronRight, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";


import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { campaignRows, currencyFull, pct, type CampaignRow } from "@/lib/campaign-performance";

const stateLabel: Record<CampaignRow["state"], string> = {
  published: "published",
  closed: "closed",
  draft: "draft",
};

const na = (v: number | null, fmt: (n: number) => string) =>
  v === null ? <span className="text-muted-foreground">N/A</span> : <span className="num">{fmt(v)}</span>;

export function CampaignList() {
  const [q, setQ] = useState("");
  const [term, setTerm] = useState("");

  const rows = useMemo(
    () => campaignRows.filter((r) => r.name.toLowerCase().includes(term.trim().toLowerCase())),
    [term],
  );

  return (
    <section className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setTerm(q);
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm chiến dịch theo tên"
            className="h-11 rounded-xl bg-surface pl-9"
          />
        </div>
        <Button type="submit" className="h-11 rounded-xl px-6">
          <Search className="size-4" /> Tìm kiếm
        </Button>
      </form>

      <div className="panel overflow-hidden">
        <div className="border-b border-border px-4 py-4 sm:px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Các chiến dịch
          </p>
          <h2 className="mt-1 text-base font-semibold sm:text-lg">
            Chọn chiến dịch để xem recap và hiệu suất từng nhà sáng tạo
          </h2>
        </div>

        {rows.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            Không tìm thấy chiến dịch nào khớp “{term}”.
          </p>
        ) : (
          <>
            {/* Mobile */}
            <ul className="divide-y divide-border md:hidden">
              {rows.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/campaign/$id"
                    params={{ id: r.id }}
                    className="block space-y-3 p-4 transition-colors active:bg-surface-2"
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{stateLabel[r.state]}</p>
                      </div>
                      <SnapshotBadge snapshot={r.snapshot} />
                    </div>
                    <dl className="grid grid-cols-3 gap-3 text-sm">
                      <Cell label="Booking">{r.bookings}</Cell>
                      <Cell label="Hoàn thành">{na(r.completionRate, (n) => pct(n))}</Cell>
                      <Cell label="Đúng hạn">{na(r.onTimeRate, (n) => pct(n))}</Cell>
                      <Cell label="Đánh giá">{na(r.rating, (n) => n.toFixed(1))}</Cell>
                      <Cell label="Chi phí">{na(r.cost, currencyFull)}</Cell>
                    </dl>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                      Xem chi tiết <ChevronRight className="size-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>


            {/* Tablet + desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[860px] text-sm">
                <thead>
                  <tr className="bg-surface-2 text-left text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                    <th className="px-6 py-3 font-medium">Chiến dịch</th>
                    <th className="px-4 py-3 font-medium">Trạng thái</th>
                    <th className="px-4 py-3 font-medium">Booking</th>
                    <th className="px-4 py-3 font-medium">Hoàn thành</th>
                    <th className="px-4 py-3 font-medium">Đúng hạn</th>
                    <th className="px-4 py-3 font-medium">Đánh giá</th>
                    <th className="px-4 py-3 font-medium">Chi phí</th>
                    <th className="px-6 py-3 text-right font-medium" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((r) => (
                    <tr key={r.id} className="group transition-colors hover:bg-surface-2/70">
                      <td className="px-6 py-4">
                        <p className="font-semibold">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{stateLabel[r.state]}</p>
                      </td>
                      <td className="px-4 py-4">
                        <SnapshotBadge snapshot={r.snapshot} />
                      </td>
                      <td className="num px-4 py-4">{r.bookings}</td>
                      <td className="px-4 py-4">{na(r.completionRate, (n) => pct(n))}</td>
                      <td className="px-4 py-4">{na(r.onTimeRate, (n) => pct(n))}</td>
                      <td className="px-4 py-4">{na(r.rating, (n) => n.toFixed(1))}</td>
                      <td className="px-4 py-4">{na(r.cost, currencyFull)}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                          Xem chi tiết <ChevronRight className="size-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function SnapshotBadge({ snapshot }: { snapshot: CampaignRow["snapshot"] }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "shrink-0 rounded-full font-medium",
        snapshot === "updated"
          ? "border-success/30 bg-success/10 text-success"
          : "border-border bg-muted text-muted-foreground",
      )}
    >
      {snapshot === "updated" ? "Đã cập nhật" : "Chưa có dữ liệu"}
    </Badge>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="num mt-0.5">{children}</dd>
    </div>
  );
}
