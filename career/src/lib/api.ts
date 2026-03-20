import { config, isApiConfigured } from "./config";
import { demoBookings, demoConsultants, demoProfile } from "./demo";
import {
  buildPreviewConsultantProfile,
  buildPreviewUserProfile,
  readMockPreviewAccount
} from "./mock-preview";
import type {
  Booking,
  ConsultantProfile,
  PlanTier,
  UploadedDocument,
  UserProfile,
  UserRole
} from "./types";

const STORAGE_KEYS = {
  profiles: "careerdoc.mock.profiles",
  consultants: "careerdoc.mock.consultants",
  bookings: "careerdoc.mock.bookings",
  seedVersion: "careerdoc.mock.seed-version"
};

const MOCK_SEED_VERSION = "2026-03-20-brand-refresh-v3";
const DEFAULT_CONSULTANT_PORTRAIT =
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80";
const DEFAULT_WORKSPACE_SCENE =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=80";

type BootstrapInput = {
  email: string;
  name: string;
  role: UserRole;
  plan: PlanTier;
};

type UpdateProfileInput = Partial<
  Pick<
    UserProfile,
    | "name"
    | "city"
    | "occupation"
    | "age"
    | "headline"
    | "bio"
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
    | "city"
    | "experienceYears"
    | "priceBgn"
    | "featured"
    | "rating"
    | "reviewCount"
    | "nextAvailable"
    | "avatarUrl"
    | "heroUrl"
    | "mapImageUrl"
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

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);

  if (!raw) {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    window.localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

function seedMockStore() {
  const consultants = readStorage<ConsultantProfile[]>(
    STORAGE_KEYS.consultants,
    demoConsultants
  );
  const bookings = readStorage<Booking[]>(STORAGE_KEYS.bookings, demoBookings);
  const profiles = readStorage<UserProfile[]>(STORAGE_KEYS.profiles, [demoProfile]);

  if (typeof window === "undefined") {
    return;
  }

  const currentSeedVersion = window.localStorage.getItem(STORAGE_KEYS.seedVersion);

  if (currentSeedVersion !== MOCK_SEED_VERSION) {
    const customConsultants = consultants.filter(
      (consultant) =>
        !demoConsultants.some((demoConsultant) => demoConsultant.consultantId === consultant.consultantId)
    );

    writeStorage(STORAGE_KEYS.consultants, [...demoConsultants, ...customConsultants]);
    writeStorage(STORAGE_KEYS.bookings, bookings);
    writeStorage(STORAGE_KEYS.profiles, profiles);
    window.localStorage.setItem(STORAGE_KEYS.seedVersion, MOCK_SEED_VERSION);
  }
}

function getStoredConsultants() {
  seedMockStore();
  const storedConsultants = readStorage<ConsultantProfile[]>(
    STORAGE_KEYS.consultants,
    demoConsultants
  );
  const previewConsultant = buildPreviewConsultantProfile(readMockPreviewAccount());

  if (!previewConsultant) {
    return storedConsultants;
  }

  return [
    previewConsultant,
    ...storedConsultants.filter(
      (consultant) =>
        consultant.consultantId !== previewConsultant.consultantId &&
        consultant.slug !== previewConsultant.slug
    )
  ];
}

function filterConsultants(
  consultants: ConsultantProfile[],
  filters: { query?: string; city?: string } = {}
) {
  const query = (filters.query || "").toLowerCase().trim();
  const city = (filters.city || "").toLowerCase().trim();

  return consultants.filter((consultant) => {
    const matchesQuery =
      !query ||
      consultant.name.toLowerCase().includes(query) ||
      consultant.headline.toLowerCase().includes(query) ||
      consultant.specializations.join(" ").toLowerCase().includes(query) ||
      consultant.tags.join(" ").toLowerCase().includes(query) ||
      (consultant.consultationTopics || []).join(" ").toLowerCase().includes(query) ||
      (consultant.idealFor || []).join(" ").toLowerCase().includes(query);
    const matchesCity = !city || consultant.city.toLowerCase().includes(city);

    return matchesQuery && matchesCity;
  });
}

function getMockProfileByEmail(email: string) {
  seedMockStore();
  const profiles = readStorage<UserProfile[]>(STORAGE_KEYS.profiles, [demoProfile]);
  return profiles.find((profile) => profile.email === email) || null;
}

function updateMockProfile(email: string, updater: (profile: UserProfile) => UserProfile) {
  const profiles = readStorage<UserProfile[]>(STORAGE_KEYS.profiles, [demoProfile]);
  const nextProfiles = profiles.map((profile) =>
    profile.email === email ? updater(profile) : profile
  );
  writeStorage(STORAGE_KEYS.profiles, nextProfiles);
  return nextProfiles.find((profile) => profile.email === email) || null;
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers || {});

  headers.set("Content-Type", "application/json");

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
    if (!isApiConfigured) {
      return filterConsultants(getStoredConsultants(), filters);
    }

    const params = new URLSearchParams();
    if (filters.query) params.set("query", filters.query);
    if (filters.city) params.set("city", filters.city);
    const queryString = params.toString();

    try {
      return await request<ConsultantProfile[]>(
        `/consultants${queryString ? `?${queryString}` : ""}`
      );
    } catch (error) {
      console.warn("Falling back to mock consultant catalog.", error);
      return filterConsultants(getStoredConsultants(), filters);
    }
  },

  async getConsultant(slug: string) {
    if (!isApiConfigured) {
      const consultants = getStoredConsultants();
      const consultant = consultants.find((item) => item.slug === slug);

      if (!consultant) {
        throw new Error("Консултантът не беше намерен.");
      }

      return consultant;
    }

    try {
      return await request<ConsultantProfile>(`/consultants/${slug}`);
    } catch (error) {
      console.warn("Falling back to mock consultant profile.", error);
      const consultant = getStoredConsultants().find((item) => item.slug === slug);

      if (!consultant) {
        throw new Error("Консултантът не беше намерен.");
      }

      return consultant;
    }
  },

  async bootstrapUser(token: string, input: BootstrapInput) {
    if (!isApiConfigured) {
      seedMockStore();
      const existingProfile = getMockProfileByEmail(input.email);
      const now = new Date().toISOString();

      if (existingProfile) {
        return updateMockProfile(input.email, (profile) => ({
          ...profile,
          name: input.name,
          role: input.role,
          plan: input.plan,
          updatedAt: now
        }))!;
      }

      const profiles = readStorage<UserProfile[]>(STORAGE_KEYS.profiles, [demoProfile]);
      const nextProfile: UserProfile = {
        userId: `user-${Math.random().toString(36).slice(2, 10)}`,
        email: input.email,
        name: input.name,
        role: input.role,
        plan: input.plan,
        city: "",
        occupation: "",
        age: null,
        headline: "",
        bio: "",
        interests: [],
        keywords: [],
        goals: "",
        preferredSessionModes: [],
        cvDocument: null,
        createdAt: now,
        updatedAt: now
      };

      writeStorage(STORAGE_KEYS.profiles, [...profiles, nextProfile]);

      if (input.role === "consultant") {
        const consultants = readStorage<ConsultantProfile[]>(
          STORAGE_KEYS.consultants,
          demoConsultants
        );
        const slug = input.name
          .toLowerCase()
          .replace(/[^a-z0-9а-я]+/gi, "-")
          .replace(/^-|-$/g, "");
        const consultantProfile: ConsultantProfile = {
          consultantId: `consultant-${Math.random().toString(36).slice(2, 10)}`,
          ownerUserId: nextProfile.userId,
          slug,
          name: input.name,
          headline: "Нов кариерен консултант",
          bio: "Попълнете профила си от таблото.",
          city: "София",
          languages: ["Български"],
          specializations: ["Кариерна консултация"],
          experienceYears: 1,
          priceBgn: 80,
          sessionModes: ["Онлайн"],
          featured: false,
          rating: 5,
          reviewCount: 0,
          nextAvailable: new Date(Date.now() + 86_400_000).toISOString(),
          avatarUrl: DEFAULT_CONSULTANT_PORTRAIT,
          heroUrl: DEFAULT_CONSULTANT_PORTRAIT,
          mapImageUrl: DEFAULT_WORKSPACE_SCENE,
          tags: ["New"],
          availability: [new Date(Date.now() + 86_400_000).toISOString()],
          idealFor: ["Професионалисти в кариерен преход"],
          consultationTopics: ["Кариерна стратегия", "CV и профил"],
          workApproach:
            "Работим с ясен фокус върху следващата стъпка, профила и подготовката за разговори.",
          sessionLengthMinutes: 60
        };
        writeStorage(STORAGE_KEYS.consultants, [...consultants, consultantProfile]);
      }

      return nextProfile;
    }

    return request<UserProfile>(
      "/auth/bootstrap",
      { method: "POST", body: JSON.stringify(input) },
      token
    );
  },

  async getMyProfile(token: string) {
    if (!isApiConfigured) {
      seedMockStore();
      const profile = getMockProfileByEmail(token);

      if (!profile) {
        throw new Error("Няма активен профил.");
      }

      return profile;
    }

    return request<UserProfile>("/me/profile", undefined, token);
  },

  async updateMyProfile(token: string, input: UpdateProfileInput) {
    if (!isApiConfigured) {
      const profile = updateMockProfile(token, (currentProfile) => ({
        ...currentProfile,
        ...input,
        updatedAt: new Date().toISOString()
      }));

      if (!profile) {
        throw new Error("Профилът не беше намерен.");
      }

      return profile;
    }

    return request<UserProfile>(
      "/me/profile",
      { method: "PUT", body: JSON.stringify(input) },
      token
    );
  },

  async getMyConsultantProfile(token: string) {
    if (!isApiConfigured) {
      seedMockStore();
      const profile = getMockProfileByEmail(token);
      const consultants = getStoredConsultants();
      const consultant = consultants.find((item) => item.ownerUserId === profile?.userId);

      if (!consultant) {
        throw new Error("Консултантският профил не беше намерен.");
      }

      return consultant;
    }

    return request<ConsultantProfile>("/consultants/me", undefined, token);
  },

  async updateMyConsultantProfile(token: string, input: UpdateConsultantInput) {
    if (!isApiConfigured) {
      seedMockStore();
      const profile = getMockProfileByEmail(token);
      const consultants = readStorage<ConsultantProfile[]>(
        STORAGE_KEYS.consultants,
        demoConsultants
      );
      const nextConsultants = consultants.map((consultant) =>
        consultant.ownerUserId === profile?.userId
          ? {
              ...consultant,
              ...input,
              languages: input.languages || consultant.languages,
              specializations: input.specializations || consultant.specializations,
              sessionModes: input.sessionModes || consultant.sessionModes,
              tags: input.tags || consultant.tags,
              availability: input.availability || consultant.availability
            }
          : consultant
      );

      writeStorage(STORAGE_KEYS.consultants, nextConsultants);
      const updated = nextConsultants.find((consultant) => consultant.ownerUserId === profile?.userId);

      if (!updated) {
        throw new Error("Консултантският профил не беше намерен.");
      }

      return updated;
    }

    return request<ConsultantProfile>(
      "/consultants/me",
      { method: "PUT", body: JSON.stringify(input) },
      token
    );
  },

  async listBookings(token: string) {
    if (!isApiConfigured) {
      seedMockStore();
      const profile = getMockProfileByEmail(token);
      const consultants = readStorage<ConsultantProfile[]>(
        STORAGE_KEYS.consultants,
        demoConsultants
      );
      const bookings = readStorage<Booking[]>(STORAGE_KEYS.bookings, demoBookings);
      const consultant = consultants.find((item) => item.ownerUserId === profile?.userId);

      return bookings.filter(
        (booking) =>
          booking.clientId === profile?.userId ||
          (consultant && booking.consultantId === consultant.consultantId)
      );
    }

    return request<Booking[]>("/bookings", undefined, token);
  },

  async createBooking(
    token: string,
    input: { consultantId: string; scheduledAt: string; note?: string }
  ) {
    if (!isApiConfigured) {
      seedMockStore();
      const profile =
        getMockProfileByEmail(token) ||
        (() => {
          const previewAccount = readMockPreviewAccount();

          if (previewAccount && previewAccount.email === token) {
            return buildPreviewUserProfile(previewAccount);
          }

          return null;
        })();
      const consultants = readStorage<ConsultantProfile[]>(
        STORAGE_KEYS.consultants,
        demoConsultants
      );
      const consultant = consultants.find(
        (item) => item.consultantId === input.consultantId
      );

      if (!profile || !consultant) {
        throw new Error("Неуспешно създаване на резервация.");
      }

      const bookings = readStorage<Booking[]>(STORAGE_KEYS.bookings, demoBookings);
      const booking: Booking = {
        bookingId: `booking-${Math.random().toString(36).slice(2, 10)}`,
        consultantId: consultant.consultantId,
        consultantName: consultant.name,
        clientId: profile.userId,
        scheduledAt: input.scheduledAt,
        status: "requested",
        note: input.note,
        createdAt: new Date().toISOString()
      };
      writeStorage(STORAGE_KEYS.bookings, [booking, ...bookings]);
      return booking;
    }

    return request<Booking>(
      "/bookings",
      { method: "POST", body: JSON.stringify(input) },
      token
    );
  },

  async createCvUpload(token: string, file: File) {
    if (!isApiConfigured) {
      const storageKey = `mock/${token}/${Date.now()}-${file.name}`;
      return {
        uploadUrl: "",
        storageKey,
        document: {
          fileName: file.name,
          storageKey,
          uploadedAt: new Date().toISOString()
        } satisfies UploadedDocument
      };
    }

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
  }
};
