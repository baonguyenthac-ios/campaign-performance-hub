import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Lock,
  RefreshCw,
  Rocket,
  Save,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  FIELD_ORDER,
  FOLLOWER_PRESETS,
  LIMITS,
  PLATFORMS,
  PROVINCES,
  compactNumber,
  emptyDraft,
  fetchSession,
  formatDate,
  getDraft,
  publishDraft,
  richTextLength,
  saveDraft,
  validateDraft,
  vnd,
  type CampaignDraft,
  type DraftInput,
  type Errors,
  type Platform,
} from "@/lib/campaign-composer";
import { CoverUploader } from "./CoverUploader";
import { RichTextEditor } from "./RichTextEditor";
import { ChipMultiSelect } from "./ChipMultiSelect";
import { TagInput } from "./TagInput";
import { SummaryPanel } from "./SummaryPanel";
import { FormField, SectionCard } from "./FormField";
import { Stepper } from "./Stepper";

const STEPS: Array<{ id: string; label: string; title: string; hint: string; fields: FieldKey[] }> = [
  {
    id: "basics",
    label: "Cơ bản",
    title: "Thông tin cơ bản",
    hint: "Ảnh bìa, tên, ngành hàng, nền tảng và hạn nhận hồ sơ.",
    fields: ["coverDataUrl", "name", "category", "deadline", "platforms"],
  },
  {
    id: "budget",
    label: "Ngân sách",
    title: "Ngân sách & quy mô",
    hint: "Chi phí và số creator bạn muốn tuyển.",
    fields: ["budget", "creatorCount"],
  },
  {
    id: "content",
    label: "Nội dung",
    title: "Nội dung & mô tả",
    hint: "Bàn giao gì và mô tả chiến dịch.",
    fields: ["deliverySummary", "description"],
  },
  {
    id: "extras",
    label: "Nâng cao",
    title: "Yêu cầu nâng cao",
    hint: "Không bắt buộc — nhưng giúp lọc creator tốt hơn.",
    fields: ["minFollowers", "region", "creatorRequirements", "contentGuidelines"],
  },
];

export function CampaignComposer({ mode, draftId }: { mode: "create" | "edit"; draftId?: string }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<DraftInput>(emptyDraft());
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [publishedDraft, setPublishedDraft] = useState<CampaignDraft | null>(null);
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);


  const sessionQuery = useQuery({ queryKey: ["brand-session"], queryFn: fetchSession });
  const draftQuery = useQuery({
    queryKey: ["draft", draftId],
    queryFn: () => getDraft(draftId!),
    enabled: mode === "edit" && !!draftId,
    retry: false,
  });

  useEffect(() => {
    const d = draftQuery.data;
    if (!d) return;
    const { id: _id, status: _s, updatedAt, publishedAt: _p, ...rest } = d;
    setDraft(rest);
    setSavedAt(updatedAt);
    if (d.status === "published") setPublishedDraft(d);
  }, [draftQuery.data]);

  const liveErrors = useMemo(() => validateDraft(draft), [draft]);
  const shownErrors = submitted ? errors : {};
  const canPublish = sessionQuery.data?.verification === "verified";
  const isBlocked = sessionQuery.data && !canPublish;

  const set = <K extends keyof DraftInput>(key: K, value: DraftInput[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    if (submitted) setErrors((prev) => ({ ...prev, [key]: validateDraft({ ...draft, [key]: value })[key] }));
  };

  const focusFirstError = (errs: Errors) => {
    const first = FIELD_ORDER.find((f) => errs[f]);
    if (!first) return;
    const host = formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
    host?.scrollIntoView({ behavior: "smooth", block: "center" });
    const focusable = host?.querySelector<HTMLElement>(
      "input:not([type=file]), textarea, button, [contenteditable=true]",
    );
    setTimeout(() => focusable?.focus({ preventScroll: true }), 350);
  };

  const saveMutation = useMutation({
    mutationFn: () => saveDraft(draft, draftId),
    onSuccess: (saved) => {
      setSavedAt(saved.updatedAt);
      queryClient.setQueryData(["draft", saved.id], saved);
      if (mode === "create") {
        toast.success("Đã tạo bản nháp chiến dịch");
        navigate({ to: "/campaign/$id/edit", params: { id: saved.id } });
      } else {
        toast.success("Đã lưu thay đổi");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      const saved = await saveDraft(draft, draftId);
      return publishDraft(saved.id);
    },
    onSuccess: (p) => {
      setPublishedDraft(p);
      toast.success("Chiến dịch đã được xuất bản lên Discovery");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setErrors(liveErrors);
    if (Object.keys(liveErrors).length) {
      toast.error("Vui lòng kiểm tra lại các trường bắt buộc");
      focusFirstError(liveErrors);
      return;
    }
    saveMutation.mutate();
  };

  // ---------------------------------------------------------------- states
  if (sessionQuery.isLoading || (mode === "edit" && draftQuery.isLoading)) {
    return <ComposerSkeleton />;
  }

  if (mode === "edit" && draftQuery.isError) {
    return (
      <StatusScreen
        tone="error"
        icon={<AlertTriangle className="size-7" />}
        title="Không tải được bản nháp"
        description={(draftQuery.error as Error).message}
        action={
          <Button onClick={() => draftQuery.refetch()}>
            <RefreshCw className="size-4" /> Thử lại
          </Button>
        }
      />
    );
  }

  if (mode === "edit" && draftQuery.isSuccess && !draftQuery.data) {
    return (
      <StatusScreen
        tone="warn"
        icon={<AlertTriangle className="size-7" />}
        title="Bản nháp không tồn tại"
        description="Bản nháp có thể đã bị xoá hoặc liên kết không chính xác."
        action={
          <Button asChild>
            <Link to="/campaign/new">Tạo chiến dịch mới</Link>
          </Button>
        }
      />
    );
  }

  if (publishedDraft) {
    return (
      <StatusScreen
        tone="success"
        icon={<Rocket className="size-7" />}
        title="Chiến dịch đã lên Discovery"
        description={`“${publishedDraft.name}” đang hiển thị công khai và có thể nhận hồ sơ đến ${formatDate(publishedDraft.deadline)}.`}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/">Về danh sách chiến dịch</Link>
            </Button>
            <Button variant="outline" onClick={() => setPublishedDraft(null)}>
              Xem lại nội dung
            </Button>
          </div>
        }
      />
    );
  }

  const isSaving = saveMutation.isPending;
  const isPublishing = publishMutation.isPending;
  const busy = isSaving || isPublishing;

  return (
    <main className="min-h-screen pb-32 lg:pb-12">
      <div className="hero-glow border-b border-border bg-surface/70">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="size-3.5" /> Chiến dịch
          </Link>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">
                {mode === "create" ? "Bước 1 · Tạo bản nháp" : "Bước 2 · Hoàn thiện bản nháp"}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                {mode === "create" ? "Tạo chiến dịch" : "Chỉnh sửa chiến dịch"}
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
                {mode === "create"
                  ? "Điền thông tin cơ bản để tạo bản nháp. Bạn có thể chỉnh sửa và xuất bản sau."
                  : "Kiểm tra lại nội dung, lưu thay đổi và xuất bản khi chiến dịch đã sẵn sàng."}
              </p>
            </div>
            <div className="shrink-0 text-right">
              {savedAt ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-3 py-1.5 text-xs font-bold text-success">
                  <CheckCircle2 className="size-3.5" /> Đã lưu nháp
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground">
                  <Sparkles className="size-3.5" /> Bản nháp mới
                </span>
              )}
              {sessionQuery.data ? (
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {sessionQuery.data.brandName} ·{" "}
                  {canPublish ? (
                    <span className="font-semibold text-success">Đã xác minh</span>
                  ) : (
                    <span className="font-semibold text-warning-foreground">Chưa xác minh</span>
                  )}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8 lg:py-8">
        <form ref={formRef} onSubmit={submit} noValidate className="space-y-6">
          {isBlocked ? (
            <div className="panel border-warning/40 bg-warning/[0.07] p-5">
              <div className="flex gap-3">
                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-warning-foreground" />
                <div className="min-w-0">
                  <p className="text-sm font-bold">Thương hiệu chưa đủ quyền xuất bản</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Bạn vẫn lưu được bản nháp. Để mở nút “Xuất bản chiến dịch”, hãy hoàn tất:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    {sessionQuery.data?.missingSteps.map((s) => (
                      <li key={s} className="flex items-center gap-2">
                        <span className="size-1.5 rounded-full bg-warning" /> {s}
                      </li>
                    ))}
                  </ul>
                  <Button type="button" size="sm" variant="outline" className="mt-3">
                    <BadgeCheck className="size-4" /> Hoàn tất xác minh
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {submitted && Object.keys(shownErrors).length ? (
            <div className="panel border-destructive/40 bg-destructive/[0.05] p-4">
              <button
                type="button"
                onClick={() => focusFirstError(shownErrors)}
                className="flex w-full items-start gap-3 text-left"
              >
                <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
                <span className="text-sm">
                  <span className="font-bold text-destructive">
                    Còn {Object.keys(shownErrors).length} trường cần sửa.
                  </span>{" "}
                  <span className="text-muted-foreground">Bấm để tới trường lỗi đầu tiên.</span>
                </span>
              </button>
            </div>
          ) : null}

          <SectionCard title="Ảnh bìa & thông tin cơ bản" description="Những thông tin creator nhìn thấy đầu tiên trên Discovery.">
            <FormField
              id="coverDataUrl"
              label="Ảnh bìa"
              required
              hint="Tỉ lệ 4:3 · JPEG, PNG, WebP, GIF · tối đa 5 MB"
              error={shownErrors.coverDataUrl}
            >
              <CoverUploader
                value={draft.coverDataUrl}
                fileName={draft.coverName}
                error={shownErrors.coverDataUrl}
                onChange={(url, name) =>
                  setDraft((p) => ({ ...p, coverDataUrl: url, coverName: name }))
                }
              />
            </FormField>

            <FormField
              id="name"
              label="Tên chiến dịch"
              required
              error={shownErrors.name}
              count={{ current: draft.name.length, max: LIMITS.name.max }}
            >
              <Input
                id="name"
                value={draft.name}
                maxLength={300}
                placeholder="Ví dụ: Summer Glow Launch 2026"
                aria-invalid={!!shownErrors.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </FormField>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField id="category" label="Ngành hàng" required error={shownErrors.category}>
                <Select value={draft.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger id="category" aria-invalid={!!shownErrors.category} className="w-full">
                    <SelectValue placeholder="Chọn ngành hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                id="deadline"
                label="Hạn nhận hồ sơ"
                required
                error={shownErrors.deadline}
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      aria-invalid={!!shownErrors.deadline}
                      className={cn(
                        "w-full justify-between font-normal",
                        !draft.deadline && "text-muted-foreground",
                      )}
                    >
                      {draft.deadline ? formatDate(draft.deadline) : "Chọn ngày"}
                      <ChevronDown className="size-4 opacity-60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={draft.deadline ? new Date(draft.deadline) : undefined}
                      onSelect={(d) =>
                        set("deadline", d ? d.toISOString().slice(0, 10) : null)
                      }
                      disabled={{ before: new Date() }}
                      autoFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormField>
            </div>

            <FormField
              id="platforms"
              label="Nền tảng mục tiêu"
              required
              hint="Chọn tối thiểu 1 nền tảng"
              error={shownErrors.platforms}
            >
              <ChipMultiSelect<Platform>
                options={PLATFORMS}
                value={draft.platforms}
                invalid={!!shownErrors.platforms}
                onChange={(v) => set("platforms", v)}
              />
            </FormField>
          </SectionCard>

          <SectionCard title="Ngân sách & quy mô" description="Xác định chi phí và số lượng creator cần tuyển.">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="budget"
                label="Ngân sách (VND)"
                required
                hint={`Tối thiểu 100.000₫${draft.budget ? ` · ${vnd(draft.budget)}` : ""}`}
                error={shownErrors.budget}
              >
                <div className="relative">
                  <Input
                    id="budget"
                    inputMode="numeric"
                    value={draft.budget === null ? "" : new Intl.NumberFormat("vi-VN").format(draft.budget)}
                    placeholder="0"
                    aria-invalid={!!shownErrors.budget}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      set("budget", digits ? Number(digits) : null);
                    }}
                    className="num pr-10 text-right font-bold"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                    ₫
                  </span>
                </div>
              </FormField>

              <FormField
                id="creatorCount"
                label="Số creator cần chọn"
                required
                hint="Từ 1 đến 500"
                error={shownErrors.creatorCount}
              >
                <Input
                  id="creatorCount"
                  inputMode="numeric"
                  value={String(draft.creatorCount)}
                  aria-invalid={!!shownErrors.creatorCount}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    set("creatorCount", digits ? Number(digits) : 0);
                  }}
                  className="num font-bold"
                />
              </FormField>
            </div>
          </SectionCard>

          {step === 2 ? (
          <SectionCard title="Nội dung & mô tả" description="Mô tả càng rõ, creator gửi hồ sơ càng đúng nhu cầu.">
            <FormField
              id="deliverySummary"
              label="Tóm tắt nội dung bàn giao"
              required
              hint="Ví dụ: 1 video TikTok 30–45s + 2 ảnh feed Instagram"
              error={shownErrors.deliverySummary}
              count={{ current: draft.deliverySummary.length, max: LIMITS.deliverySummary.max }}
            >
              <Textarea
                id="deliverySummary"
                rows={4}
                value={draft.deliverySummary}
                aria-invalid={!!shownErrors.deliverySummary}
                onChange={(e) => set("deliverySummary", e.target.value.slice(0, 2100))}
              />
            </FormField>

            <FormField
              id="description"
              label="Mô tả chiến dịch"
              required
              hint="Bối cảnh thương hiệu, mục tiêu, thông điệp chính"
              error={shownErrors.description}
              count={{ current: richTextLength(draft.description), max: LIMITS.description.max }}
            >
              <RichTextEditor
                id="description"
                value={draft.description}
                invalid={!!shownErrors.description}
                placeholder="Giới thiệu chiến dịch của bạn…"
                onChange={(html) => set("description", html)}
              />
            </FormField>
          </SectionCard>
          ) : null}


          {step === 3 ? (
            <SectionCard
              title="Yêu cầu nâng cao"
              description="Không bắt buộc — nhưng giúp bạn lọc creator phù hợp hơn."
            >
              <div className="space-y-5">

                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    id="minFollowers"
                    label="Số follower tối thiểu"
                    error={shownErrors.minFollowers}
                  >
                    <Input
                      id="minFollowers"
                      inputMode="numeric"
                      placeholder="Không yêu cầu"
                      value={draft.minFollowers === null ? "" : new Intl.NumberFormat("vi-VN").format(draft.minFollowers)}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        set("minFollowers", digits ? Number(digits) : null);
                      }}
                      className="num"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {FOLLOWER_PRESETS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => set("minFollowers", p)}
                          className={cn(
                            "rounded-full border px-3 py-1 text-xs font-bold transition-colors",
                            draft.minFollowers === p
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-input text-muted-foreground hover:border-primary hover:text-primary",
                          )}
                        >
                          {compactNumber(p)}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField id="region" label="Khu vực" error={shownErrors.region}>
                    <Select value={draft.region} onValueChange={(v) => set("region", v)}>
                      <SelectTrigger id="region" className="w-full">
                        <SelectValue placeholder="Chọn tỉnh/thành" />
                      </SelectTrigger>
                      <SelectContent>
                        {PROVINCES.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>
                </div>

                <FormField id="tags" label="Tags" hint="Chọn có sẵn hoặc tạo tag mới">
                  <TagInput value={draft.tags} onChange={(v) => set("tags", v)} />
                </FormField>

                <FormField
                  id="creatorRequirements"
                  label="Yêu cầu thêm với creator"
                  error={shownErrors.creatorRequirements}
                  count={{
                    current: draft.creatorRequirements.length,
                    max: LIMITS.creatorRequirements.max,
                  }}
                >
                  <Textarea
                    id="creatorRequirements"
                    rows={3}
                    value={draft.creatorRequirements}
                    onChange={(e) => set("creatorRequirements", e.target.value.slice(0, 2100))}
                  />
                </FormField>

                <FormField
                  id="contentGuidelines"
                  label="Yêu cầu nội dung chi tiết · Dos, Don’ts, Key message"
                  error={shownErrors.contentGuidelines}
                  count={{
                    current: draft.contentGuidelines.length,
                    max: LIMITS.contentGuidelines.max,
                  }}
                >
                  <Textarea
                    id="contentGuidelines"
                    rows={5}
                    value={draft.contentGuidelines}
                    onChange={(e) => set("contentGuidelines", e.target.value.slice(0, 5100))}
                  />
                </FormField>
              </div>
            </SectionCard>
          ) : null}


          {/* Desktop actions */}
          <div className="hidden items-center justify-between gap-3 lg:flex">
            <div className="flex items-center gap-3">
              {step > 0 ? (
                <Button type="button" variant="ghost" onClick={() => goTo(step - 1)}>
                  <ArrowLeft className="size-4" /> Quay lại
                </Button>
              ) : null}
              <p className="text-xs text-muted-foreground">
                {savedAt
                  ? `Cập nhật lần cuối ${new Date(savedAt).toLocaleString("vi-VN")}`
                  : "Bản nháp chưa được lưu"}
              </p>
            </div>
            <div className="flex gap-2">
              {isLastStep ? (
                <>
                  {mode === "edit" ? (
                    <PublishButton
                      disabled={!canPublish || busy}
                      loading={isPublishing}
                      locked={!canPublish}
                      onClick={tryPublish}
                    />
                  ) : null}
                  <Button type="submit" size="lg" disabled={busy} className="min-w-44">
                    {isSaving ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    {isSaving
                      ? mode === "create"
                        ? "Đang tạo…"
                        : "Đang lưu…"
                      : mode === "create"
                        ? "Tạo chiến dịch"
                        : "Lưu thay đổi"}
                  </Button>
                </>
              ) : (
                <Button type="button" size="lg" onClick={next} className="min-w-44">
                  Tiếp tục <ArrowRight className="size-4" />
                </Button>
              )}
            </div>
          </div>

        </form>

        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <SummaryPanel draft={draft} errors={liveErrors} />
          </div>
        </aside>

        {/* Mobile collapsed summary */}
        <div className="lg:hidden">
          <SummaryPanel draft={draft} errors={liveErrors} />
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          <div className="flex gap-2">
            {step > 0 ? (
              <Button type="button" size="lg" variant="outline" onClick={() => goTo(step - 1)}>
                <ArrowLeft className="size-4" /> Quay lại
              </Button>
            ) : null}
            {isLastStep ? (
              <Button
                type="button"
                size="lg"
                disabled={busy}
                onClick={() => formRef.current?.requestSubmit()}
                className="flex-1"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {mode === "create" ? "Tạo chiến dịch" : "Lưu thay đổi"}
              </Button>
            ) : (
              <Button type="button" size="lg" onClick={next} className="flex-1">
                Tiếp tục <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
          {isLastStep && mode === "edit" ? (
            <PublishButton
              full
              disabled={!canPublish || busy}
              loading={isPublishing}
              locked={!canPublish}
              onClick={tryPublish}
            />
          ) : null}
        </div>
      </div>


      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xuất bản chiến dịch này?</AlertDialogTitle>
            <AlertDialogDescription>
              “{draft.name}” sẽ hiển thị công khai trên Discovery và creator có thể gửi hồ sơ ngay.
              Ngân sách {vnd(draft.budget)} · {draft.creatorCount} creator · hạn{" "}
              {formatDate(draft.deadline)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Xem lại</AlertDialogCancel>
            <AlertDialogAction onClick={() => publishMutation.mutate()}>
              Xuất bản ngay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function PublishButton({
  disabled,
  loading,
  locked,
  onClick,
  full,
}: {
  disabled?: boolean;
  loading?: boolean;
  locked?: boolean;
  onClick: () => void;
  full?: boolean;
}) {
  return (
    <div className={cn("flex flex-col items-stretch gap-1", full && "w-full")}>
      <Button
        type="button"
        size="lg"
        variant="outline"
        disabled={disabled}
        onClick={onClick}
        className={cn("border-primary/40 text-primary hover:bg-primary/10", full && "w-full")}
      >
        {loading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : locked ? (
          <Lock className="size-4" />
        ) : (
          <Rocket className="size-4" />
        )}
        {loading ? "Đang xuất bản…" : "Xuất bản chiến dịch"}
      </Button>
      {locked ? (
        <p className="text-center text-[11px] text-muted-foreground">Cần xác minh thương hiệu</p>
      ) : null}
    </div>
  );
}

function ComposerSkeleton() {
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="panel space-y-4 p-6">
          <Skeleton className="aspect-[4/3] w-full rounded-[22px]" />
          <Skeleton className="h-11 w-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
        </div>
        <div className="panel space-y-4 p-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Đang kiểm tra phiên đăng nhập và quyền xuất bản…
        </p>
      </div>
      <div className="hidden lg:block">
        <Skeleton className="h-[560px] w-full rounded-[22px]" />
      </div>
    </main>
  );
}

function StatusScreen({
  tone,
  icon,
  title,
  description,
  action,
}: {
  tone: "success" | "error" | "warn";
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <main className="hero-glow flex min-h-screen items-center justify-center px-4 py-16">
      <div className="panel w-full max-w-md p-8 text-center">
        <span
          className={cn(
            "mx-auto grid size-14 place-items-center rounded-2xl",
            tone === "success" && "bg-success/12 text-success",
            tone === "error" && "bg-destructive/10 text-destructive",
            tone === "warn" && "bg-warning/15 text-warning-foreground",
          )}
        >
          {icon}
        </span>
        <h1 className="mt-5 text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex justify-center">{action}</div>
      </div>
    </main>
  );
}
