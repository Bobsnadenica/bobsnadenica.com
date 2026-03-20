export type UserRole = "client" | "consultant";
export type PlanTier = "free" | "pro";
export type BookingStatus = "requested" | "confirmed" | "cancelled";

export interface UploadedDocument {
  fileName: string;
  storageKey: string;
  uploadedAt: string;
}

export interface ConsultantProfile {
  consultantId: string;
  ownerUserId: string;
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
  mapImageUrl: string;
  tags: string[];
  availability: string[];
}

export interface UserProfile {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  plan: PlanTier;
  city?: string;
  headline?: string;
  bio?: string;
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
