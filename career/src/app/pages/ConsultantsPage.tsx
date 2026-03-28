import PageScene from "../layout/PageScene";
import { ConsultantsPage as LegacyConsultantsPage } from "../legacy/SiteAppLegacy";

export default function ConsultantsPage() {
  return (
    <PageScene tone="consultant" pageKey="consultants">
      <LegacyConsultantsPage />
    </PageScene>
  );
}
