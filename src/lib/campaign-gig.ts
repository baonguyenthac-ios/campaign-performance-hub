export type ApplyState =
  | "guest" // chưa đăng nhập
  | "eligible" // đủ điều kiện
  | "ineligible" // không đủ điều kiện
  | "applied" // đã ứng tuyển
  | "success" // ứng tuyển thành công (vừa submit)
  | "error"; // lỗi API

export interface Gig {
  id: string;
  name: string;
  brandName: string;
  brandVerified: boolean;
  category: string;
  description: string;
  brandBrief: string;
  deliverables: string[];
  creatorRequirements: string[];
  budget: number | null; // null = thỏa thuận
  platforms: string[];
  deadline: string;
  slotsTotal: number;
  slotsLeft: number;
  minFollowers: number;
  regions: string[];
  cover: string | null;
}

export const gigs: Gig[] = [
  {
    id: "cmp-aurora-glow",
    name: "Aurora Glow — Ra mắt serum vitamin C",
    brandName: "Lumière Cosmetics",
    brandVerified: true,
    category: "Làm đẹp",
    description:
      "Chiến dịch ra mắt dòng serum vitamin C mới của Lumière. Chúng tôi tìm kiếm các creator mảng làm đẹp có phong cách kể chuyện tự nhiên, chân thật để giới thiệu sản phẩm qua trải nghiệm 14 ngày sử dụng.",
    brandBrief:
      "Lumière là thương hiệu mỹ phẩm sạch từ Hàn Quốc, tập trung vào thành phần thiên nhiên và bao bì tái chế. Đối tượng mục tiêu: nữ 22–35 tuổi, quan tâm đến skincare routine khoa học.",
    deliverables: [
      "1 video TikTok/Reels 45–60 giây quay trải nghiệm 14 ngày",
      "1 bộ 3 ảnh tĩnh chụp sản phẩm concept ánh sáng tự nhiên",
      "1 story kèm link mua hàng và mã giảm giá cá nhân",
    ],
    creatorRequirements: [
      "Tối thiểu 20.000 followers trên nền tảng ứng tuyển",
      "Tỷ lệ tương tác trung bình ≥ 3%",
      "Nội dung kênh liên quan làm đẹp/skincare trong 90 ngày gần nhất",
      "Không hợp tác thương hiệu đối thủ trong 30 ngày",
    ],
    budget: 8_000_000,
    platforms: ["TikTok", "Instagram"],
    deadline: "15/09/2026",
    slotsTotal: 20,
    slotsLeft: 7,
    minFollowers: 20_000,
    regions: ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng"],
    cover: null,
  },
];

export const applyStates: Array<{ key: ApplyState; label: string }> = [
  { key: "eligible", label: "Đủ điều kiện" },
  { key: "guest", label: "Chưa đăng nhập" },
  { key: "ineligible", label: "Không đủ ĐK" },
  { key: "applied", label: "Đã ứng tuyển" },
  { key: "error", label: "Lỗi" },
];

export const platformColors: Record<string, string> = {
  TikTok: "bg-foreground text-background",
  Instagram: "bg-primary text-primary-foreground",
  YouTube: "bg-destructive text-destructive-foreground",
  Facebook: "bg-accent text-accent-foreground",
};

export function currency(v: number) {
  return v.toLocaleString("vi-VN") + "đ";
}

export function formatFollowers(v: number) {
  return v >= 1000 ? `${Math.round(v / 1000)}K` : String(v);
}

// Mock API: ứng tuyển
export async function submitApplication(
  state: ApplyState,
): Promise<{ ok: boolean; message: string }> {
  await new Promise((r) => setTimeout(r, 900));
  if (state === "error") {
    return {
      ok: false,
      message: "Không gửi được đơn ứng tuyển. Kết nối máy chủ gián đoạn, vui lòng thử lại.",
    };
  }
  return { ok: true, message: "Đơn ứng tuyển đã được gửi tới thương hiệu!" };
}
