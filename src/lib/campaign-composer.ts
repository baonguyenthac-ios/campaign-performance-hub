// Domain data + fake API for the Castify campaign composer (draft -> publish flow).

export type Platform = "tiktok" | "instagram" | "facebook" | "youtube" | "threads";

export const PLATFORMS: Array<{ id: Platform; label: string }> = [
  { id: "tiktok", label: "TikTok" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "youtube", label: "YouTube" },
  { id: "threads", label: "Threads" },
];

export const CATEGORIES = [
  "Mỹ phẩm & Skincare",
  "Thời trang",
  "Ẩm thực & F&B",
  "Công nghệ",
  "Mẹ & Bé",
  "Du lịch",
  "Sức khoẻ & Thể thao",
  "Nhà cửa & Đời sống",
  "Tài chính",
  "Giáo dục",
];

export const PROVINCES = [
  "Không yêu cầu",
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Bình Dương",
  "Đồng Nai",
  "Khánh Hoà",
  "Lâm Đồng",
  "Thừa Thiên Huế",
  "Quảng Ninh",
  "Nghệ An",
];

export const SUGGESTED_TAGS = [
  "review",
  "unboxing",
  "livestream",
  "beauty",
  "lifestyle",
  "shorts",
  "giveaway",
  "tutorial",
];

export const FOLLOWER_PRESETS = [1000, 5000, 10000, 50000, 100000];

export const MIN_BUDGET = 100000;

export type CampaignDraft = {
  id: string;
  status: "draft" | "published";
  coverDataUrl: string | null;
  coverName: string | null;
  name: string;
  category: string;
  platforms: Platform[];
  budget: number | null;
  deadline: string | null; // yyyy-mm-dd
  creatorCount: number;
  deliverySummary: string;
  description: string; // rich text html
  minFollowers: number | null;
  region: string;
  tags: string[];
  creatorRequirements: string;
  contentGuidelines: string;
  updatedAt: string;
  publishedAt?: string;
};

export type DraftInput = Omit<CampaignDraft, "id" | "status" | "updatedAt" | "publishedAt">;

export const emptyDraft = (): DraftInput => ({
  coverDataUrl: null,
  coverName: null,
  name: "",
  category: "",
  platforms: [],
  budget: null,
  deadline: null,
  creatorCount: 1,
  deliverySummary: "",
  description: "",
  minFollowers: null,
  region: "Không yêu cầu",
  tags: [],
  creatorRequirements: "",
  contentGuidelines: "",
});

export type FieldKey = keyof DraftInput;

export const LIMITS = {
  name: { min: 3, max: 255 },
  deliverySummary: { min: 5, max: 2000 },
  description: { min: 10, max: 5000 },
  creatorRequirements: { max: 2000 },
  contentGuidelines: { max: 5000 },
  region: { max: 255 },
};

/** Order matters: used to scroll/focus the first invalid field. */
export const FIELD_ORDER: FieldKey[] = [
  "coverDataUrl",
  "name",
  "category",
  "platforms",
  "budget",
  "deadline",
  "creatorCount",
  "deliverySummary",
  "description",
  "minFollowers",
  "region",
  "creatorRequirements",
  "contentGuidelines",
];

export const richTextLength = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;

export type Errors = Partial<Record<FieldKey, string>>;

export function validateDraft(d: DraftInput): Errors {
  const e: Errors = {};
  if (!d.coverDataUrl) e.coverDataUrl = "Vui lòng tải lên ảnh bìa chiến dịch.";
  const name = d.name.trim();
  if (name.length < LIMITS.name.min) e.name = "Tên chiến dịch cần tối thiểu 3 ký tự.";
  else if (name.length > LIMITS.name.max) e.name = "Tên chiến dịch tối đa 255 ký tự.";
  if (!d.category) e.category = "Chọn 1 ngành hàng cho chiến dịch.";
  if (d.platforms.length < 1) e.platforms = "Chọn tối thiểu 1 nền tảng mục tiêu.";
  if (d.budget === null || Number.isNaN(d.budget)) e.budget = "Nhập ngân sách chiến dịch.";
  else if (!Number.isInteger(d.budget)) e.budget = "Ngân sách phải là số nguyên (VND).";
  else if (d.budget < MIN_BUDGET) e.budget = "Ngân sách tối thiểu là 100.000₫.";
  if (!d.deadline) e.deadline = "Chọn hạn nhận hồ sơ.";
  if (!Number.isInteger(d.creatorCount) || d.creatorCount < 1 || d.creatorCount > 500)
    e.creatorCount = "Số creator cần chọn từ 1 đến 500.";
  const ds = d.deliverySummary.trim();
  if (ds.length < LIMITS.deliverySummary.min)
    e.deliverySummary = "Tóm tắt nội dung bàn giao cần tối thiểu 5 ký tự.";
  else if (ds.length > LIMITS.deliverySummary.max)
    e.deliverySummary = "Tóm tắt nội dung bàn giao tối đa 2.000 ký tự.";
  const dl = richTextLength(d.description);
  if (dl < LIMITS.description.min) e.description = "Mô tả chiến dịch cần tối thiểu 10 ký tự.";
  else if (dl > LIMITS.description.max) e.description = "Mô tả chiến dịch tối đa 5.000 ký tự.";
  if (d.minFollowers !== null && (!Number.isInteger(d.minFollowers) || d.minFollowers < 0))
    e.minFollowers = "Số follower tối thiểu phải là số nguyên ≥ 0.";
  if (d.region.length > LIMITS.region.max) e.region = "Khu vực tối đa 255 ký tự.";
  if (d.creatorRequirements.length > LIMITS.creatorRequirements.max)
    e.creatorRequirements = "Yêu cầu thêm tối đa 2.000 ký tự.";
  if (d.contentGuidelines.length > LIMITS.contentGuidelines.max)
    e.contentGuidelines = "Yêu cầu nội dung chi tiết tối đa 5.000 ký tự.";
  return e;
}

export const vnd = (n: number | null) =>
  n === null || Number.isNaN(n) ? "—" : new Intl.NumberFormat("vi-VN").format(n) + "₫";

export const compactNumber = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K` : String(n);

export const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

// ---------------------------------------------------------------- fake backend

export type BrandSession = {
  brandName: string;
  verification: "verified" | "pending" | "missing";
  missingSteps: string[];
};

const KEY = "castify.drafts.v1";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function readStore(): Record<string, CampaignDraft> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(store: Record<string, CampaignDraft>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(store));
}

export async function fetchSession(): Promise<BrandSession> {
  await wait(700);
  const override =
    typeof window !== "undefined" ? window.localStorage.getItem("castify.verification") : null;
  const verification = (override as BrandSession["verification"]) || "verified";
  return {
    brandName: "Lumiè Beauty",
    verification,
    missingSteps:
      verification === "verified"
        ? []
        : [
            "Tải lên giấy phép kinh doanh",
            "Xác minh email doanh nghiệp",
            "Thêm phương thức thanh toán",
          ],
  };
}

export async function getDraft(id: string): Promise<CampaignDraft | null> {
  await wait(500);
  if (typeof window !== "undefined" && window.localStorage.getItem("castify.forceError") === "1")
    throw new Error("Không thể tải bản nháp. Kết nối tới Castify bị gián đoạn.");
  return readStore()[id] ?? null;
}

export async function saveDraft(input: DraftInput, id?: string): Promise<CampaignDraft> {
  await wait(900);
  if (typeof window !== "undefined" && window.localStorage.getItem("castify.forceError") === "1")
    throw new Error("Lưu bản nháp thất bại (mã 503). Vui lòng thử lại.");
  const store = readStore();
  const draftId = id ?? `dr-${Math.random().toString(36).slice(2, 8)}`;
  const draft: CampaignDraft = {
    ...input,
    id: draftId,
    status: store[draftId]?.status ?? "draft",
    updatedAt: new Date().toISOString(),
  };
  store[draftId] = draft;
  writeStore(store);
  return draft;
}

export async function publishDraft(id: string): Promise<CampaignDraft> {
  await wait(1300);
  const store = readStore();
  const draft = store[id];
  if (!draft) throw new Error("Không tìm thấy bản nháp để xuất bản.");
  const published: CampaignDraft = {
    ...draft,
    status: "published",
    publishedAt: new Date().toISOString(),
  };
  store[id] = published;
  writeStore(store);
  return published;
}

export const MAX_COVER_BYTES = 5 * 1024 * 1024;
export const COVER_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateCoverFile(file: File): string | null {
  if (!COVER_TYPES.includes(file.type)) return "Chỉ hỗ trợ JPEG, PNG, WebP hoặc GIF.";
  if (file.size > MAX_COVER_BYTES) return "Ảnh vượt quá 5 MB. Vui lòng chọn ảnh nhỏ hơn.";
  return null;
}
