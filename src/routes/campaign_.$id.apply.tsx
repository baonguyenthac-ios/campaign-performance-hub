import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  FileText,
  ImageIcon,
  ListChecks,
  MapPin,
  Megaphone,
  Sparkles,
  Users,
} from "lucide-react";

import { ApplyPanel } from "@/components/campaign/ApplyPanel";
import { Button } from "@/components/ui/button";
import coverAurora from "@/assets/cover-aurora.jpg";
import {
  applyStates,
  currency,
  formatFollowers,
  gigs,
  platformColors,
  type ApplyState,
} from "@/lib/campaign-gig";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/campaign_/$id/apply")({
  head: ({ params }) => {
    const gig = gigs.find((g) => g.id === params.id) ?? gigs[0]!;
    const title = `${gig.name} · Ứng tuyển chiến dịch`;
    const description = `${gig.brandName} tuyển creator ${gig.category}: ${gig.slotsLeft}/${gig.slotsTotal} slot còn lại, hạn ${gig.deadline}. Ngân sách ${gig.budget ? currency(gig.budget) : "thỏa thuận"}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CampaignApplyPage,
});

function CampaignApplyPage() {
  const { id } = Route.useParams();
  const gig = { ...(gigs.find((g) => g.id === id) ?? gigs[0]!), cover: coverAurora };
  const [state, setState] = useState<ApplyState>("eligible");

  const slotPct = ((gig.slotsTotal - gig.slotsLeft) / gig.slotsTotal) * 100;

  return (
    <main className="min-h-screen bg-surface-2/40">
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link to="/" className="transition-colors hover:text-foreground">
            Khám phá chiến dịch
          </Link>
          <ChevronRight className="size-3.5 shrink-0" />
          <span>{gig.category}</span>
          <ChevronRight className="size-3.5 shrink-0" />
          <span className="max-w-56 truncate font-medium text-foreground sm:max-w-none">
            {gig.name}
          </span>
        </nav>

        {/* Cover */}
        <div className="relative mt-4 aspect-[21/9] w-full overflow-hidden rounded-2xl border border-border bg-surface sm:rounded-3xl">
          {gig.cover ? (
            <img src={gig.cover} alt={`Ảnh bìa chiến dịch ${gig.name}`} className="h-full w-full object-cover" />
          ) : (
            <div className="hero-glow flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
              <span className="grid size-16 place-items-center rounded-2xl border border-border bg-surface">
                <ImageIcon className="size-7" />
              </span>
              <p className="text-sm font-medium">Ảnh bìa chiến dịch 21:9</p>
            </div>
          )}
          <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur">
            {gig.category}
          </span>
        </div>

        {/* Dev state switcher */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Trạng thái ứng tuyển:
          </span>
          <div className="flex flex-wrap gap-1 rounded-full border border-border bg-surface p-1">
            {applyStates.map((s) => (
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
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Nội dung chính */}
          <div className="min-w-0 space-y-8">
            <header>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{gig.name}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {gig.brandName.slice(0, 1)}
                  </span>
                  {gig.brandName}
                  {gig.brandVerified && <BadgeCheck className="size-4 text-success" />}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <MapPin className="size-4" /> {gig.regions.join(" · ")}
                </span>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">{gig.description}</p>
            </header>

            {/* Quick stats */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <QuickStat
                icon={<CalendarClock className="size-4" />}
                label="Hạn ứng tuyển"
                value={gig.deadline}
              />
              <QuickStat
                icon={<Users className="size-4" />}
                label="Slot còn lại"
                value={`${gig.slotsLeft}/${gig.slotsTotal}`}
              />
              <QuickStat
                icon={<Sparkles className="size-4" />}
                label="Followers tối thiểu"
                value={formatFollowers(gig.minFollowers)}
              />
              <QuickStat
                icon={<Megaphone className="size-4" />}
                label="Ngân sách"
                value={gig.budget ? currency(gig.budget) : "Thỏa thuận"}
              />
            </section>

            {/* Slot progress */}
            <section className="panel p-4 sm:p-5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-semibold">Tiến độ tuyển</span>
                <span className="num text-muted-foreground">
                  Đã nhận {gig.slotsTotal - gig.slotsLeft}/{gig.slotsTotal} đơn
                </span>
              </div>
              <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${slotPct}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Chỉ còn {gig.slotsLeft} slot — ứng tuyển sớm để tăng cơ hội được duyệt.
              </p>
            </section>

            {/* Nền tảng */}
            <section>
              <h2 className="text-lg font-semibold">Nền tảng yêu cầu</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {gig.platforms.map((p) => (
                  <span
                    key={p}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-semibold",
                      platformColors[p] ?? "bg-muted text-foreground",
                    )}
                  >
                    {p}
                  </span>
                ))}
              </div>
            </section>

            {/* Brand brief */}
            <section className="panel p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <FileText className="size-5 text-primary" /> Brand brief
              </h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{gig.brandBrief}</p>
            </section>

            {/* Deliverables */}
            <section className="panel p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <ListChecks className="size-5 text-primary" /> Deliverables
              </h2>
              <ul className="mt-3 space-y-2.5">
                {gig.deliverables.map((d) => (
                  <li key={d} className="flex gap-2.5 text-sm leading-relaxed">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Yêu cầu creator */}
            <section className="panel p-5 sm:p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Users className="size-5 text-primary" /> Yêu cầu creator
              </h2>
              <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {gig.creatorRequirements.map((r) => (
                  <li
                    key={r}
                    className="flex gap-2.5 rounded-xl border border-border bg-surface-2 p-3 text-sm leading-relaxed"
                  >
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Sidebar ứng tuyển (mobile: xuống dưới nội dung) */}
          <div className="lg:block">
            <ApplyPanel gig={gig} state={state} />
          </div>
        </div>

        {/* Mobile CTA sticky */}
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="num truncate text-base font-bold text-primary">
                {gig.budget ? currency(gig.budget) : "Thỏa thuận"}
              </p>
              <p className="text-xs text-muted-foreground">
                Còn {gig.slotsLeft}/{gig.slotsTotal} slot · Hạn {gig.deadline}
              </p>
            </div>
            <Button
              className="h-11 shrink-0 rounded-xl px-5 font-semibold"
              onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })}
            >
              Ứng tuyển
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="shrink-0 text-primary">{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <p className="num mt-1.5 truncate text-lg font-bold">{value}</p>
    </div>
  );
}
