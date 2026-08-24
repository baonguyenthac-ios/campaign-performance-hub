import { Link, createFileRoute } from "@tanstack/react-router";
import { CircleDollarSign, LayoutList, Plus, Star, Trophy } from "lucide-react";

import { MetricCard } from "@/components/campaign/MetricCard";
import { CampaignList } from "@/components/campaign/CampaignList";
import { campaignRows, currency, pct } from "@/lib/campaign-performance";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hiệu suất chiến dịch · Influencer Marketing" },
      {
        name: "description",
        content:
          "Danh sách chiến dịch influencer với booking, tỷ lệ hoàn thành, giao đúng hạn, điểm đánh giá và chi phí đã thanh toán.",
      },
      { property: "og:title", content: "Hiệu suất chiến dịch · Influencer Marketing" },
      {
        property: "og:description",
        content: "Chọn chiến dịch để xem recap và hiệu suất từng nhà sáng tạo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CampaignPerformanceList,
});

function CampaignPerformanceList() {
  const withData = campaignRows.filter((r) => r.snapshot === "updated");
  const avg = (vals: Array<number | null>) => {
    const nums = vals.filter((v): v is number => v !== null);
    return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  };
  const totalCost = campaignRows.reduce((s, r) => s + (r.cost ?? 0), 0);

  return (
    <main className="min-h-screen">
      <div className="hero-glow border-b border-border bg-surface/60">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-start gap-4 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Báo cáo</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Hiệu suất chiến dịch
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Tổng hợp toàn bộ chiến dịch. Bấm “Xem chi tiết” để mở báo cáo hiệu suất của từng nhà
              sáng tạo trong chiến dịch.
            </p>
          </div>
          <Link
            to="/campaign/new"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:px-5"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Tạo chiến dịch</span>
          </Link>
        </div>
      </div>


      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Chiến dịch"
            value={String(campaignRows.length)}
            sub={`${withData.length} chiến dịch đã có dữ liệu`}
            icon={<LayoutList className="size-4" />}
          />
          <MetricCard
            label="Hoàn thành trung bình"
            value={pct(avg(campaignRows.map((r) => r.completionRate)))}
            progress={avg(campaignRows.map((r) => r.completionRate))}
            tone="good"
            sub="Tính trên các chiến dịch có dữ liệu"
            icon={<Trophy className="size-4" />}
          />
          <MetricCard
            label="Chi phí đã thanh toán"
            value={currency(totalCost)}
            sub="Tổng toàn bộ chiến dịch"
            icon={<CircleDollarSign className="size-4" />}
          />
          <MetricCard
            label="Điểm đánh giá"
            value={avg(campaignRows.map((r) => r.rating)).toFixed(1)}
            progress={(avg(campaignRows.map((r) => r.rating)) / 5) * 100}
            tone="warn"
            sub="Trung bình các chiến dịch"
            icon={<Star className="size-4" />}
          />
        </section>

        <CampaignList />
      </div>
    </main>
  );
}
