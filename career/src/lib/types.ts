export type UserRole = "client" | "consultant";
export type PlanTier = "free" | "pro";
export type BookingStatus = "requested" | "confirmed" | "cancelled";
export type ConsultantProfileType = "consultant" | "mentor";
export type ConsultantProfileTheme = "violet" | "sky" | "rose" | "mint" | "amber";
export type ConsultantMediaKind = "avatar" | "hero";
export type UserMediaKind = "user-avatar";
export type ConsultantProfileStatus = "pending" | "approved" | "rejected";

export interface AdminConsultantSummary {
  consultantId: string;
  ownerUserId: string;
  slug: string;
  name: string;
  headline: string;
  city: string;
  profileType: ConsultantProfileType;
  profileStatus: ConsultantProfileStatus | "active";
  isPublic: boolean;
  membershipTier: string;
}

export interface UploadedDocument {
  fileName: string;
  storageKey: string;
  uploadedAt: string;
}

export interface ConsultantProfile {
  consultantId: string;
  ownerUserId: string;
  isDemo?: boolean;
  profileType?: ConsultantProfileType;
  theme?: ConsultantProfileTheme;
  profileStatus?: ConsultantProfileStatus | "active";
  isPublic?: boolean;
  slug: string;
  name: string;
  headline: string;
  bio: string;
  experienceSummary?: string;
  experienceHighlights?: string[];
  educationHighlights?: string[];
  city: string;
  languages: string[];
  specializations: string[];
  experienceYears: number;
  priceBgn: number;
  sessionModes: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  nextAvailable: string;
  avatarUrl: string;
  heroUrl: string;
  avatarStorageKey?: string;
  heroStorageKey?: string;
  tags: string[];
  availability: string[];
  idealFor?: string[];
  consultationTopics?: string[];
  workApproach?: string;
  sessionLengthMinutes?: number;
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  isDemo?: boolean;
  role: UserRole;
  plan: PlanTier;
  avatarUrl?: string;
  avatarStorageKey?: string;
  city?: string;
  occupation?: string;
  age?: number | null;
  headline?: string;
  bio?: string;
  experienceSummary?: string;
  experienceHighlights?: string[];
  educationHighlights?: string[];
  skills?: string[];
  interests?: string[];
  keywords?: string[];
  goals?: string;
  preferredSessionModes?: string[];
  cvDocument?: UploadedDocument | null;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  bookingId: string;
  consultantId: string;
  consultantName: string;
  clientId: string;
  clientName?: string;
  clientEmail?: string;
  scheduledAt: string;
  status: BookingStatus;
  note?: string;
  createdAt: string;
  cancelledAt?: string;
  cancelledBy?: "consultant" | "client";
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}
