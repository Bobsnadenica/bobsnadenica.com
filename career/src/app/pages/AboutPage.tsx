import PageScene from "../layout/PageScene";
import { AboutPage as LegacyAboutPage } from "../legacy/SiteAppLegacy";

export default function AboutPage() {
  return (
    <PageScene tone="company" pageKey="about">
      <LegacyAboutPage />
    </PageScene>
  );
}
