import type {
  ConsultantProfile,
  ConsultantProfileType,
  PlanTier,
  UploadedDocument,
  UserProfile,
  UserRole
} from "./types";

export type MockBillingCycle = "monthly" | "yearly";
export type MockSubscriptionStatus = "inactive" | "active" | "cancelled";

export interface MockPreviewAccount {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  plan: PlanTier;
  city: string;
  occupation?: string;
  age?: number | null;
  headline: string;
  bio?: string;
  interests?: string[];
  keywords?: string[];
  goals?: string;
  preferredSessionModes?: string[];
  billingCycle: MockBillingCycle;
  subscriptionStatus: MockSubscriptionStatus;
  paymentLast4: string | null;
  startedAt: string;
  nextBillingAt: string | null;
  consultantProfileType?: ConsultantProfileType;
  consultantSlug?: string;
  consultantDisplayName?: string;
  consultantBio?: string;
  consultantExperienceYears?: number;
  consultantLanguages?: string[];
  consultantSpecializations?: string[];
  consultantSessionModes?: string[];
  consultantTags?: string[];
  consultantIdealFor?: string[];
  consultantConsultationTopics?: string[];
  consultantWorkApproach?: string;
  consultantAvailability?: string[];
  consultantSessionLengthMinutes?: number;
}

const STORAGE_KEY = "careerdoc.mock.preview-account";
const PREVIEW_EVENT = "careerdoc:mock-preview-change";
const PREVIEW_AVATAR =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80";
const PREVIEW_SCENE =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80";

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-|-$/g, "");
}

function normalizeList(values?: string[]) {
  return values?.filter(Boolean) || [];
}

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

export function buildPreviewUserProfile(account: MockPreviewAccount): UserProfile {
  return {
    userId: `preview-${account.email}`,
    email: account.email,
    name: account.name,
    role: account.role,
    plan: account.plan,
    city: account.city,
    occupation: account.occupation || "",
    age: account.age ?? null,
    headline: account.headline,
    bio: account.bio || "",
    interests: normalizeList(account.interests),
    keywords: normalizeList(account.keywords),
    goals: account.goals || "",
    preferredSessionModes: normalizeList(account.preferredSessionModes),
    cvDocument: null as UploadedDocument | null,
    createdAt: account.startedAt,
    updatedAt: account.startedAt
  };
}

export function buildPreviewConsultantProfile(account: MockPreviewAccount) {
  if (account.role !== "consultant") {
    return null;
  }

  const availability = normalizeList(account.consultantAvailability);
  const specializations = normalizeList(account.consultantSpecializations);
  const tags = normalizeList(account.consultantTags);

  return {
    consultantId: `preview-consultant-${account.email}`,
    ownerUserId: `preview-${account.email}`,
    profileType: account.consultantProfileType || "consultant",
    slug: account.consultantSlug || slugify(account.consultantDisplayName || account.name),
    name: account.consultantDisplayName || account.name,
    headline: account.headline,
    bio:
      account.consultantBio ||
      account.bio ||
      "Профилът се дооформя в CareerLane с ясно описание на темите, подхода и свободните часове.",
    city: account.city,
    languages: normalizeList(account.consultantLanguages).length
      ? normalizeList(account.consultantLanguages)
      : ["Български"],
    specializations: specializations.length
      ? specializations
      : normalizeList(account.keywords).slice(0, 3).length
        ? normalizeList(account.keywords).slice(0, 3)
        : ["Кариерна стратегия"],
    experienceYears: account.consultantExperienceYears || 1,
    priceBgn: 0,
    sessionModes: normalizeList(account.consultantSessionModes).length
      ? normalizeList(account.consultantSessionModes)
      : normalizeList(account.preferredSessionModes).length
        ? normalizeList(account.preferredSessionModes)
        : ["Онлайн"],
    featured: false,
    rating: 5,
    reviewCount: 0,
    nextAvailable:
      availability[0] || new Date(Date.now() + 86_400_000).toISOString(),
    avatarUrl: PREVIEW_AVATAR,
    heroUrl: PREVIEW_AVATAR,
    mapImageUrl: PREVIEW_SCENE,
    tags: tags.length ? tags : ["CareerLane"],
    availability:
      availability.length ? availability : [new Date(Date.now() + 86_400_000).toISOString()],
    idealFor: normalizeList(account.consultantIdealFor),
    consultationTopics: normalizeList(account.consultantConsultationTopics),
    workApproach:
      account.consultantWorkApproach ||
      "Работим в ясен процес: профил, цели, следващи стъпки и конкретна подготовка.",
    sessionLengthMinutes: account.consultantSessionLengthMinutes || 60
  } satisfies ConsultantProfile;
}

export function isPublicConsultantPreview(account: MockPreviewAccount | null) {
  return Boolean(
    account &&
      account.role === "consultant" &&
      account.plan === "pro" &&
      account.subscriptionStatus === "active"
  );
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
