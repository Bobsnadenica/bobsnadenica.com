import { config, isApiConfigured } from "./config";
import type {
  Booking,
  ConsultantMediaKind,
  ConsultantProfile,
  ConsultantProfileType,
  PlanTier,
  UploadedDocument,
  UserProfile,
  UserRole
} from "./types";

type BootstrapInput = {
  email: string;
  name: string;
  role: UserRole;
  plan: PlanTier;
  city?: string;
  occupation?: string;
  headline?: string;
  consultantProfileType?: ConsultantProfileType;
};

type UpdateProfileInput = Partial<
  Pick<
    UserProfile,
    | "name"
    | "avatarUrl"
    | "avatarStorageKey"
    | "city"
    | "occupation"
    | "age"
    | "headline"
    | "bio"
    | "experienceSummary"
    | "experienceHighlights"
    | "educationHighlights"
    | "skills"
    | "interests"
    | "keywords"
    | "goals"
    | "preferredSessionModes"
    | "plan"
    | "cvDocument"
  >
>;

type UpdateConsultantInput = Partial<
  Pick<
    ConsultantProfile,
    | "slug"
    | "name"
    | "headline"
    | "bio"
    | "experienceSummary"
    | "experienceHighlights"
    | "educationHighlights"
    | "city"
    | "experienceYears"
    | "priceBgn"
    | "featured"
    | "rating"
    | "reviewCount"
    | "nextAvailable"
    | "avatarUrl"
    | "heroUrl"
    | "avatarStorageKey"
    | "heroStorageKey"
    | "mapImageUrl"
    | "profileType"
    | "idealFor"
    | "consultationTopics"
    | "workApproach"
    | "sessionLengthMinutes"
  >
> & {
  languages?: string[];
  specializations?: string[];
  sessionModes?: string[];
  tags?: string[];
  availability?: string[];
};

function requireBackend() {
  if (!isApiConfigured) {
    throw new Error("Backendът не е конфигуриран.");
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  requireBackend();

  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${config.apiBaseUrl}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "API request failed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const api = {
  async listConsultants(filters: { query?: string; city?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.city) params.set("city", filters.city);
    const queryString = params.toString();

    return request<ConsultantProfile[]>(
      `/consultants${queryString ? `?${queryString}` : ""}`
    );
  },

  async getConsultant(slug: string) {
    return request<ConsultantProfile>(`/consultants/${slug}`);
  },

  async bootstrapUser(token: string, input: BootstrapInput) {
    return request<UserProfile>(
      "/auth/bootstrap",
      { method: "POST", body: JSON.stringify(input) },
      token
    );
  },

  async getMyProfile(token: string) {
    return request<UserProfile>("/me/profile", undefined, token);
  },

  async updateMyProfile(token: string, input: UpdateProfileInput) {
    return request<UserProfile>(
      "/me/profile",
      { method: "PUT", body: JSON.stringify(input) },
      token
    );
  },

  async getMyConsultantProfile(token: string) {
    return request<ConsultantProfile>("/consultants/me", undefined, token);
  },

  async updateMyConsultantProfile(token: string, input: UpdateConsultantInput) {
    return request<ConsultantProfile>(
      "/consultants/me",
      { method: "PUT", body: JSON.stringify(input) },
      token
    );
  },

  async listBookings(token: string) {
    return request<Booking[]>("/bookings", undefined, token);
  },

  async createBooking(
    token: string,
    input: { consultantId: string; scheduledAt: string; note?: string }
  ) {
    return request<Booking>(
      "/bookings",
      { method: "POST", body: JSON.stringify(input) },
      token
    );
  },

  async createCvUpload(token: string, file: File) {
    return request<{
      uploadUrl: string;
      storageKey: string;
      document: UploadedDocument;
    }>(
      "/me/cv/upload-url",
      {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream"
        })
      },
      token
    );
  },

  async createConsultantMediaUpload(
    token: string,
    file: File,
    kind: ConsultantMediaKind
  ) {
    return request<{
      uploadUrl: string;
      storageKey: string;
    }>(
      "/me/cv/upload-url",
      {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          kind
        })
      },
      token
    );
  },

  async createUserAvatarUpload(token: string, file: File) {
    return request<{
      uploadUrl: string;
      storageKey: string;
    }>(
      "/me/cv/upload-url",
      {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          kind: "user-avatar"
        })
      },
      token
    );
  }
};
