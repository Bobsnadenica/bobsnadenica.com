import PageScene from "../layout/PageScene";
import { ContactPage as LegacyContactPage } from "../legacy/SiteAppLegacy";

export default function ContactPage() {
  return (
    <PageScene tone="support" pageKey="contact">
      <LegacyContactPage />
    </PageScene>
  );
}
