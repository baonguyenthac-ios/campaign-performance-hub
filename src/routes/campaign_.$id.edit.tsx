import { createFileRoute } from "@tanstack/react-router";

import { CampaignComposer } from "@/components/campaign/composer/CampaignComposer";

export const Route = createFileRoute("/campaign_/$id/edit")({
  head: () => ({
    meta: [
      { title: "Hoàn thiện bản nháp chiến dịch · Castify" },
      {
        name: "description",
        content:
          "Chỉnh sửa bản nháp chiến dịch, lưu thay đổi, kiểm tra checklist và xuất bản chiến dịch lên Discovery của Castify.",
      },
      { property: "og:title", content: "Hoàn thiện bản nháp chiến dịch · Castify" },
      {
        property: "og:description",
        content: "Kiểm tra checklist trước khi xuất bản chiến dịch influencer lên Discovery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <CampaignComposer mode="edit" draftId={id} />;
}
