import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  FileStack,
  Inbox,
  Info,
  RefreshCw,
  Send,
  ServerCrash,
  Star,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MetricCard } from "@/components/campaign/MetricCard";
import { CreatorTable } from "@/components/campaign/CreatorTable";
import {
  currency,
  fetchCampaignPerformance,
  pct,
  type DataState,
} from "@/lib/campaign-performance";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Performance Campaign · Influencer Marketing Dashboard" },
      {
        name: "description",
        content:
          "Theo dõi hiệu suất chiến dịch influencer: booking, tỷ lệ hoàn thành, giao đúng hạn, duyệt lần đầu, chi phí và hiệu suất từng creator.",
      },
      { property: "og:title", content: "Performance Campaign · Influencer Marketing" },
      {
        property: "og:description",
        content:
          "Tổng quan chiến dịch, thống kê nội dung bàn giao/đã đăng và bảng so sánh hiệu suất creator.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PerformanceCampaign,
});

const states: Array<{ key: DataState; label: string }> = [
  { key: "ready", label: "Có dữ liệu" },
  { key: "loading", label: "Đang tải" },
  { key: "empty", label: "Trống" },
  { key: "error", label: "Lỗi" },
];

function PerformanceCampaign() {
  const [state, setState] = useState<DataState>("ready");
  const query = useQuery({
    queryKey: ["campaign-performance", state],
    queryFn: () => fetchCampaignPerformance(state),
    retry: false,
  });

  const data = query.data;
  const isEmpty = !!data && data.creators.length === 0 && data.overview.bookings === 0;

  return (
    <main className="min-h-screen">
      <div className="hero-glow border-b border-border bg-surface/60">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <header className="flex flex-col gap-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                  Báo cáo
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Hiệu suất chiến dịch
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Số liệu được cập nhật tự động từ booking, nội dung, thanh toán, tranh chấp và đánh
                  giá.
                </p>
              </div>
              <Button
                variant="outline"
                className="h-10 shrink-0 rounded-xl bg-surface"
                onClick={() => query.refetch()}
              >
                <RefreshCw className={cn("size-4", query.isFetching && "animate-spin")} /> Làm mới
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 rounded-full border border-border bg-surface p-1">
                {states.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setState(s.key)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                      state === s.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarClock className="size-3.5 shrink-0" />
                  {data?.campaign.name ?? "—"} · {data?.campaign.period ?? "—"}
                </span>
                <DataStatus
                  loading={query.isPending}
                  error={query.isError}
                  empty={isEmpty}
                  coverage={data?.campaign.dataCoverage ?? 0}
                  syncedAt={data?.campaign.lastSyncedAt ?? "—"}
                />
              </div>
            </div>
          </header>
        </div>
      </div>


      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {query.isPending ? (
          <LoadingState />
        ) : query.isError ? (
          <ErrorState
            message={(query.error as Error).message}
            onRetry={() => query.refetch()}
          />
        ) : isEmpty ? (
          <EmptyState />
        ) : (
          data && (
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <MetricCard
                  label="Booking"
                  value={String(data.overview.bookings)}
                  sub={`+${data.overview.bookingsDelta} so với kỳ trước`}
                  icon={<Users className="size-4" />}
                />
                <MetricCard
                  label="Hoàn thành"
                  value={pct(data.overview.completionRate)}
                  progress={data.overview.completionRate}
                  tone="good"
                  sub="112/128 booking đã kết thúc"
                  icon={<CheckCircle2 className="size-4" />}
                />
                <MetricCard
                  label="Giao đúng hạn"
                  value={pct(data.overview.onTimeRate)}
                  progress={data.overview.onTimeRate}
                  tone="warn"
                  sub="Mục tiêu 85%"
                  icon={<Clock className="size-4" />}
                />
                <MetricCard
                  label="Duyệt lần đầu"
                  value={pct(data.overview.firstApprovalRate)}
                  progress={data.overview.firstApprovalRate}
                  tone="bad"
                  sub="Dưới ngưỡng 70%"
                  icon={<BadgeCheck className="size-4" />}
                />
                <MetricCard
                  label="Điểm đánh giá"
                  value={data.overview.rating.toFixed(1)}
                  progress={(data.overview.rating / 5) * 100}
                  tone="good"
                  sub={`${data.overview.ratingCount} lượt đánh giá`}
                  icon={<Star className="size-4" />}
                />
                <MetricCard
                  label="Chi phí đã thanh toán"
                  value={currency(data.overview.paidCost)}
                  progress={(data.overview.paidCost / data.overview.budget) * 100}
                  sub={`${pct((data.overview.paidCost / data.overview.budget) * 100)} ngân sách ${currency(data.overview.budget)}`}
                  icon={<CircleDollarSign className="size-4" />}
                />
              </section>

              <section className="grid grid-cols-1 gap-6 lg:grid-cols-5">
                <div className="panel p-4 sm:p-6 lg:col-span-3">
                  <h2 className="text-base font-semibold sm:text-lg">Nội dung</h2>
                  <p className="text-xs text-muted-foreground">
                    Bàn giao, đã đăng và lượt chỉnh sửa trong toàn chiến dịch
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <ContentStat
                      icon={<FileStack className="size-4" />}
                      label="Bàn giao"
                      value={data.content.delivered}
                    />
                    <ContentStat
                      icon={<Send className="size-4" />}
                      label="Đã đăng"
                      value={data.content.posted}
                      tone="text-success"
                    />
                    <ContentStat
                      icon={<Inbox className="size-4" />}
                      label="Chờ duyệt"
                      value={data.content.pendingReview}
                      tone="text-accent"
                    />
                    <ContentStat
                      icon={<RefreshCw className="size-4" />}
                      label="Lượt sửa"
                      value={data.content.revisions}
                      tone="text-warning"
                    />
                  </div>
                  <div className="mt-6 space-y-3">
                    <StackedBar
                      label="Đã đăng / Bàn giao"
                      value={(data.content.posted / data.content.delivered) * 100}
                      tone="bg-success"
                    />
                    <StackedBar
                      label="Tỷ lệ nội dung phải sửa"
                      value={data.content.revisionRate}
                      tone="bg-warning"
                    />
                  </div>
                </div>

                <div className="panel p-4 sm:p-6 lg:col-span-2">
                  <h2 className="text-base font-semibold sm:text-lg">Cảnh báo chất lượng</h2>
                  <ul className="mt-4 space-y-3">
                    {data.qualityAlerts.map((a) => (
                      <li
                        key={a.id}
                        className={cn(
                          "flex gap-3 rounded-xl border p-3",
                          a.level === "critical" && "border-destructive/30 bg-destructive/10",
                          a.level === "warning" && "border-warning/30 bg-warning/10",
                          a.level === "info" && "border-border bg-surface-2",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 shrink-0",
                            a.level === "critical" && "text-destructive",
                            a.level === "warning" && "text-warning",
                            a.level === "info" && "text-muted-foreground",
                          )}
                        >
                          {a.level === "info" ? (
                            <Info className="size-4" />
                          ) : (
                            <AlertTriangle className="size-4" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{a.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{a.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              <CampaignList />

              <CreatorTable rows={data.creators} />

            </>
          )
        )}
      </div>
    </main>
  );
}

function DataStatus({
  loading,
  error,
  empty,
  coverage,
  syncedAt,
}: {
  loading: boolean;
  error: boolean;
  empty: boolean;
  coverage: number;
  syncedAt: string;
}) {
  const meta = error
    ? { dot: "bg-destructive", text: "Dữ liệu lỗi" }
    : loading
      ? { dot: "bg-accent animate-pulse", text: "Đang đồng bộ…" }
      : empty
        ? { dot: "bg-muted-foreground", text: "Chưa có dữ liệu" }
        : coverage >= 95
          ? { dot: "bg-success", text: `Đầy đủ ${coverage}%` }
          : { dot: "bg-warning", text: `Thiếu ${100 - coverage}% dữ liệu` };

  return (
    <p className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className={cn("size-2 shrink-0 rounded-full", meta.dot)} />
      <span>{meta.text}</span>
      <span aria-hidden>·</span>
      <span className="num">Cập nhật {syncedAt}</span>
    </p>
  );
}

function ContentStat({
  icon,
  label,
  value,
  tone = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <p className={cn("num mt-2 text-2xl font-bold", tone)}>{value}</p>
    </div>
  );
}

function StackedBar({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="num font-semibold">{pct(value)}</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="panel space-y-3 p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-1.5 w-full" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="panel space-y-4 p-6 lg:col-span-3">
          <Skeleton className="h-4 w-28" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
        <div className="panel space-y-3 p-6 lg:col-span-2">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
      <div className="panel space-y-3 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="panel flex flex-col items-center px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl border border-border bg-surface-2 text-muted-foreground">
        <Inbox className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">Chưa có dữ liệu hiệu suất</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Chiến dịch chưa có booking nào được ghi nhận. Sau khi creator nhận booking và bàn giao nội
        dung, các chỉ số sẽ xuất hiện tại đây.
      </p>
      <Button className="mt-6">Thêm booking đầu tiên</Button>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="panel flex flex-col items-center border-destructive/30 px-6 py-16 text-center"
    >
      <span className="grid size-14 place-items-center rounded-2xl border border-destructive/30 bg-destructive/10 text-destructive">
        <ServerCrash className="size-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold">Không tải được báo cáo</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
      <Button variant="outline" className="mt-6" onClick={onRetry}>
        <RefreshCw className="size-4" /> Thử lại
      </Button>
    </div>
  );
}
