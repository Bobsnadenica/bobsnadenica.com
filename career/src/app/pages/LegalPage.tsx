import PageScene from "../layout/PageScene";
import { LegalPage as LegacyLegalPage } from "../legacy/SiteAppLegacy";

export default function LegalPage() {
  return (
    <PageScene tone="support" pageKey="legal">
      <LegacyLegalPage />
    </PageScene>
  );
}
