export type UserRole = "client" | "consultant";
export type PlanTier = "free" | "pro";
export type BookingStatus = "requested" | "confirmed" | "cancelled";
export type ConsultantProfileType = "consultant" | "mentor";
export type ConsultantMediaKind = "avatar" | "hero";
export type UserMediaKind = "user-avatar";

export interface UploadedDocument {
  fileName: string;
  storageKey: string;
  uploadedAt: string;
}

export interface ConsultantProfile {
  consultantId: string;
  ownerUserId: string;
  profileType?: ConsultantProfileType;
  slug: string;
  name: string;
  headline: string;
  bio: string;
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
  mapImageUrl: string;
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
  role: UserRole;
  plan: PlanTier;
  avatarUrl?: string;
  avatarStorageKey?: string;
  city?: string;
  occupation?: string;
  age?: number | null;
  headline?: string;
  bio?: string;
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
  scheduledAt: string;
  status: BookingStatus;
  note?: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}
