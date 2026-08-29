import { useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  CircleCheck,
  Clock3,
  Loader2,
  Lock,
  LogIn,
  RefreshCw,
  Send,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  currency,
  formatFollowers,
  submitApplication,
  type ApplyState,
  type Gig,
} from "@/lib/campaign-gig";
import { cn } from "@/lib/utils";

export function ApplyPanel({ gig, state }: { gig: Gig; state: ApplyState }) {
  const [pitch, setPitch] = useState("");
  const [rate, setRate] = useState(gig.budget ? String(gig.budget) : "");
  const [phase, setPhase] = useState<"idle" | "sending" | "success">("idle");
  const [attempt, setAttempt] = useState(0);

  const disabled = state !== "eligible" || phase !== "idle";
  const pitchTooLong = pitch.length > 500;

  const submit = async () => {
    setPhase("sending");
    const res = await submitApplication(state);
    if (res.ok) setPhase("success");
    else {
      setPhase("idle");
      setAttempt((a) => a + 1);
    }
  };

  return (
    <aside className="panel sticky top-6 overflow-hidden">
      {/* Giá */}
      <div className="border-b border-border p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Ngân sách mỗi creator
        </p>
        <p className="num mt-1.5 text-3xl font-bold text-primary">
          {gig.budget ? currency(gig.budget) : "Thỏa thuận"}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="size-3.5" /> Hạn {gig.deadline}
          </span>
          <span className="inline-flex items-center gap-1">
            <BadgeCheck className="size-3.5 text-success" />
            Còn {gig.slotsLeft}/{gig.slotsTotal} slot
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        {/* Trạng thái theo luồng */}
        {state === "guest" && (
          <StatusBox tone="info" icon={<LogIn className="size-4" />} title="Bạn chưa đăng nhập">
            Đăng nhập tài khoản Creator để ứng tuyển chiến dịch này.
          </StatusBox>
        )}
        {state === "ineligible" && (
          <StatusBox
            tone="warn"
            icon={<Lock className="size-4" />}
            title="Chưa đủ điều kiện ứng tuyển"
          >
            Yêu cầu tối thiểu {formatFollowers(gig.minFollowers)} followers và tương tác ≥ 3%. Tài
            khoản của bạn chưa đạt một trong các tiêu chí.
          </StatusBox>
        )}
        {state === "applied" && phase !== "success" && (
          <StatusBox
            tone="good"
            icon={<CircleCheck className="size-4" />}
            title="Bạn đã ứng tuyển"
          >
            Đơn đang chờ thương hiệu duyệt. Kết quả sẽ gửi qua email trong 3–5 ngày làm việc.
          </StatusBox>
        )}
        {(phase === "success" || state === "success") && (
          <StatusBox
            tone="good"
            icon={<CircleCheck className="size-4" />}
            title="Ứng tuyển thành công!"
          >
            Thương hiệu đã nhận được đơn. Bạn có thể theo dõi trạng thái trong mục Đơn ứng tuyển.
          </StatusBox>
        )}
        {state === "error" && attempt >= 0 && phase === "idle" && (
          <StatusBox tone="bad" icon={<XCircle className="size-4" />} title="Có lỗi xảy ra">
            Không gửi được đơn ứng tuyển. Kết nối máy chủ gián đoạn, vui lòng thử lại.
          </StatusBox>
        )}

        {/* Form chỉ khi eligible */}
        {(state === "eligible" || state === "error") && (
          <>
            <div>
              <label
                htmlFor="pitch"
                className="mb-1.5 flex items-baseline justify-between text-sm font-semibold"
              >
                Pitch của bạn
                <span
                  className={cn(
                    "num text-xs font-normal",
                    pitchTooLong ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {pitch.length}/500
                </span>
              </label>
              <textarea
                id="pitch"
                rows={5}
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                placeholder="Giới thiệu ngắn về kênh, phong cách nội dung và ý tưởng của bạn cho chiến dịch này…"
                className={cn(
                  "w-full resize-none rounded-xl border bg-surface-2 px-3.5 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2",
                  pitchTooLong
                    ? "border-destructive focus:ring-destructive/30"
                    : "border-input focus:ring-primary/30",
                )}
              />
            </div>

            <div>
              <label htmlFor="rate" className="mb-1.5 block text-sm font-semibold">
                Mức giá đề xuất (VND)
              </label>
              <div className="relative">
                <input
                  id="rate"
                  inputMode="numeric"
                  value={rate}
                  onChange={(e) => setRate(e.target.value.replace(/[^\d]/g, ""))}
                  placeholder={gig.budget ? currency(gig.budget) : "Nhập mức giá mong muốn"}
                  className="num w-full rounded-xl border border-input bg-surface-2 px-3.5 py-3 pr-12 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/30"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  VND
                </span>
              </div>
              {gig.budget && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Ngân sách tham khảo của brand: {currency(gig.budget)}
                </p>
              )}
            </div>
          </>
        )}

        {/* CTA */}
        {state === "guest" ? (
          <Button className="h-12 w-full rounded-xl text-base font-semibold">
            <LogIn className="size-4" /> Đăng nhập để ứng tuyển
          </Button>
        ) : state === "ineligible" ? (
          <Button disabled className="h-12 w-full rounded-xl text-base font-semibold">
            <Lock className="size-4" /> Chưa đủ điều kiện
          </Button>
        ) : state === "applied" && phase !== "success" ? (
          <Button variant="outline" disabled className="h-12 w-full rounded-xl text-base font-semibold">
            <CircleCheck className="size-4 text-success" /> Đã ứng tuyển
          </Button>
        ) : phase === "success" || state === "success" ? (
          <Button variant="outline" className="h-12 w-full rounded-xl text-base font-semibold">
            Xem đơn ứng tuyển
          </Button>
        ) : (
          <Button
            onClick={submit}
            disabled={disabled || pitchTooLong || !pitch.trim() || !rate.trim()}
            className="h-12 w-full rounded-xl text-base font-semibold"
          >
            {phase === "sending" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Đang gửi…
              </>
            ) : state === "error" ? (
              <>
                <RefreshCw className="size-4" /> Thử lại ứng tuyển
              </>
            ) : (
              <>
                <Send className="size-4" /> Ứng tuyển ngay
              </>
            )}
          </Button>
        )}

        {state === "eligible" && (
          <p className="text-center text-xs text-muted-foreground">
            Không thu phí ứng tuyển · Thanh toán qua Castify khi hoàn thành
          </p>
        )}
      </div>
    </aside>
  );
}

function StatusBox({
  tone,
  icon,
  title,
  children,
}: {
  tone: "info" | "warn" | "good" | "bad";
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role={tone === "bad" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-xl border p-3.5",
        tone === "info" && "border-border bg-surface-2",
        tone === "warn" && "border-warning/30 bg-warning/10",
        tone === "good" && "border-success/30 bg-success/10",
        tone === "bad" && "border-destructive/30 bg-destructive/10",
      )}
    >
      <span
        className={cn(
          "mt-0.5 shrink-0",
          tone === "info" && "text-muted-foreground",
          tone === "warn" && "text-warning",
          tone === "good" && "text-success",
          tone === "bad" && "text-destructive",
        )}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}
