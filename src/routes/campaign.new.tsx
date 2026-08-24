import { createFileRoute } from "@tanstack/react-router";

import { CampaignComposer } from "@/components/campaign/composer/CampaignComposer";

export const Route = createFileRoute("/campaign/new")({
  head: () => ({
    meta: [
      { title: "Tạo chiến dịch · Castify for Brands" },
      {
        name: "description",
        content:
          "Tạo bản nháp chiến dịch influencer trên Castify: ảnh bìa 4:3, ngành hàng, nền tảng, ngân sách VND, hạn nhận hồ sơ và mô tả chi tiết.",
      },
      { property: "og:title", content: "Tạo chiến dịch · Castify for Brands" },
      {
        property: "og:description",
        content: "Composer marketplace giúp brand tạo và hoàn thiện chiến dịch trước khi xuất bản.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CampaignComposer mode="create" />,
});
