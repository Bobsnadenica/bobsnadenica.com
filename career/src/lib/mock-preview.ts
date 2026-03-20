import type { PlanTier, UserRole } from "./types";

export type MockBillingCycle = "monthly" | "yearly";
export type MockSubscriptionStatus = "inactive" | "active" | "cancelled";

export interface MockPreviewAccount {
  name: string;
  email: string;
  role: UserRole;
  plan: PlanTier;
  city: string;
  headline: string;
  billingCycle: MockBillingCycle;
  subscriptionStatus: MockSubscriptionStatus;
  paymentLast4: string | null;
  startedAt: string;
  nextBillingAt: string | null;
}

const STORAGE_KEY = "careerdoc.mock.preview-account";
const PREVIEW_EVENT = "careerdoc:mock-preview-change";

function emitMockPreviewChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PREVIEW_EVENT));
  }
}

export function readMockPreviewAccount() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as MockPreviewAccount;
  } catch {
    return null;
  }
}

export function writeMockPreviewAccount(account: MockPreviewAccount) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
    emitMockPreviewChange();
  }
}

export function clearMockPreviewAccount() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
    emitMockPreviewChange();
  }
}

export function subscribeMockPreviewAccount(listener: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  window.addEventListener(PREVIEW_EVENT, listener);
  return () => window.removeEventListener(PREVIEW_EVENT, listener);
}
