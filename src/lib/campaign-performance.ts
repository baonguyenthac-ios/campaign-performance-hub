export type DataState = "ready" | "loading" | "empty" | "error";

export type CreatorRow = {
  id: string;
  name: string;
  handle: string;
  tier: "Mega" | "Macro" | "Micro" | "Nano";
  bookings: number;
  completionRate: number;
  onTimeRate: number;
  firstApprovalRate: number;
  revisions: number;
  rating: number;
  paidCost: number;
  status: "on_track" | "at_risk" | "late";
};

export type CampaignPerformance = {
  campaign: {
    name: string;
    brand: string;
    period: string;
    lastSyncedAt: string;
    dataCoverage: number;
  };
  overview: {
    bookings: number;
    bookingsDelta: number;
    completionRate: number;
    onTimeRate: number;
    firstApprovalRate: number;
    rating: number;
    ratingCount: number;
    paidCost: number;
    budget: number;
  };
  content: {
    delivered: number;
    posted: number;
    pendingReview: number;
    revisions: number;
    revisionRate: number;
  };
  qualityAlerts: Array<{
    id: string;
    level: "critical" | "warning" | "info";
    title: string;
    detail: string;
  }>;
  creators: CreatorRow[];
};

const data: CampaignPerformance = {
  campaign: {
    name: "Summer Glow Launch",
    brand: "Lumiè Beauty",
    period: "01/06 – 31/08/2026",
    lastSyncedAt: "22/08/2026 18:40",
    dataCoverage: 94,
  },
  overview: {
    bookings: 128,
    bookingsDelta: 12,
    completionRate: 87.5,
    onTimeRate: 78.9,
    firstApprovalRate: 64.2,
    rating: 4.6,
    ratingCount: 112,
    paidCost: 1_284_000_000,
    budget: 1_600_000_000,
  },
  content: {
    delivered: 214,
    posted: 186,
    pendingReview: 12,
    revisions: 63,
    revisionRate: 29.4,
  },
  qualityAlerts: [
    {
      id: "a1",
      level: "critical",
      title: "9 booking trễ deadline trên 48 giờ",
      detail: "Tập trung ở nhóm Micro tuần 32 – cần nhắc lịch bàn giao lại.",
    },
    {
      id: "a2",
      level: "warning",
      title: "Tỷ lệ duyệt lần đầu dưới ngưỡng 70%",
      detail: "Brief hình ảnh bị hiểu sai ở 14 nội dung, trung bình 1.8 lượt sửa.",
    },
    {
      id: "a3",
      level: "info",
      title: "6% dữ liệu chưa đồng bộ",
      detail: "Chỉ số lượt đăng của 3 creator TikTok đang chờ API trả về.",
    },
  ],
  creators: [
    { id: "c1", name: "Mai Anh", handle: "@maianh.daily", tier: "Macro", bookings: 18, completionRate: 100, onTimeRate: 94, firstApprovalRate: 83, revisions: 4, rating: 4.9, paidCost: 268_000_000, status: "on_track" },
    { id: "c2", name: "Trần Duy", handle: "@duytran.fit", tier: "Micro", bookings: 22, completionRate: 91, onTimeRate: 72, firstApprovalRate: 61, revisions: 13, rating: 4.4, paidCost: 176_000_000, status: "at_risk" },
    { id: "c3", name: "Linh Chi", handle: "@linhchi.beauty", tier: "Mega", bookings: 9, completionRate: 100, onTimeRate: 100, firstApprovalRate: 89, revisions: 2, rating: 4.8, paidCost: 412_000_000, status: "on_track" },
    { id: "c4", name: "Hoàng Nam", handle: "@namhoang.review", tier: "Micro", bookings: 26, completionRate: 76, onTimeRate: 58, firstApprovalRate: 47, revisions: 21, rating: 3.9, paidCost: 148_000_000, status: "late" },
    { id: "c5", name: "Thu Hà", handle: "@thuha.lifestyle", tier: "Macro", bookings: 15, completionRate: 93, onTimeRate: 87, firstApprovalRate: 71, revisions: 8, rating: 4.6, paidCost: 132_000_000, status: "on_track" },
    { id: "c6", name: "Bảo Trân", handle: "@baotran.skin", tier: "Nano", bookings: 38, completionRate: 82, onTimeRate: 69, firstApprovalRate: 55, revisions: 15, rating: 4.2, paidCost: 148_000_000, status: "at_risk" },
  ],
};

export async function fetchCampaignPerformance(state: DataState): Promise<CampaignPerformance> {
  await new Promise((r) => setTimeout(r, state === "loading" ? 100000 : 450));
  if (state === "error") throw new Error("Không thể tải dữ liệu hiệu suất chiến dịch (503).");
  if (state === "empty") {
    return {
      ...data,
      campaign: { ...data.campaign, dataCoverage: 0 },
      overview: { bookings: 0, bookingsDelta: 0, completionRate: 0, onTimeRate: 0, firstApprovalRate: 0, rating: 0, ratingCount: 0, paidCost: 0, budget: data.overview.budget },
      content: { delivered: 0, posted: 0, pendingReview: 0, revisions: 0, revisionRate: 0 },
      qualityAlerts: [],
      creators: [],
    };
  }
  return data;
}

export const currency = (v: number) =>
  new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 }).format(v) + "₫";

export const pct = (v: number) => `${v.toFixed(1)}%`;
