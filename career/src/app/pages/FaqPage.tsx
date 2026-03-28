import PageScene from "../layout/PageScene";
import { FaqPage as LegacyFaqPage } from "../legacy/SiteAppLegacy";

export default function FaqPage() {
  return (
    <PageScene tone="support" pageKey="faq">
      <LegacyFaqPage />
    </PageScene>
  );
}
