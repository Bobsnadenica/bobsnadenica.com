const { randomUUID } = require("node:crypto");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  TransactWriteCommand
} = require("@aws-sdk/lib-dynamodb");
const {
  S3Client,
  GetObjectCommand,
  PutObjectCommand
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const s3 = new S3Client({});

const env = {
  usersTable: process.env.USERS_TABLE,
  consultantsTable: process.env.CONSULTANTS_TABLE,
  bookingsTable: process.env.BOOKINGS_TABLE,
  cvBucket: process.env.CV_BUCKET,
  allowedOrigin: process.env.ALLOWED_ORIGIN || "https://www.bobsnadenica.com"
};

const CONSULTANT_PROFILE_THEMES = new Set(["violet", "sky", "rose", "mint", "amber"]);
const USER_ROLES = new Set(["client", "consultant"]);
const CONSULTANT_PROFILE_TYPES = new Set(["consultant", "mentor"]);
const PLAN_TIERS = new Set(["free", "pro"]);
const ALLOWED_PROFILE_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function response(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": env.allowedOrigin,
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
      ...extraHeaders
    },
    body: JSON.stringify(body)
  };
}

function badRequest(message) {
  return response(400, { message });
}

function forbidden(message) {
  return response(403, { message });
}

function notFound(message) {
  return response(404, { message });
}

function parseBody(event) {
  if (!event.body) {
    return {};
  }

  try {
    return JSON.parse(event.body);
  } catch {
    throw Object.assign(new Error("Request body must be valid JSON."), {
      statusCode: 400
    });
  }
}

function getClaims(event) {
  return event.requestContext?.authorizer?.jwt?.claims || null;
}

function requireAuth(event) {
  const claims = getClaims(event);

  if (!claims || !claims.sub) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  }

  return claims;
}

async function getUserBySub(userId) {
  const result = await dynamo.send(
    new GetCommand({
      TableName: env.usersTable,
      Key: { userId }
    })
  );

  return result.Item || null;
}

async function getConsultantBySlug(slug) {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: env.consultantsTable,
      IndexName: "slug-index",
      KeyConditionExpression: "slug = :slug",
      ExpressionAttributeValues: {
        ":slug": slug
      },
      Limit: 1
    })
  );

  return result.Items?.[0] || null;
}

async function getConsultantByOwner(ownerUserId) {
  const result = await dynamo.send(
    new QueryCommand({
      TableName: env.consultantsTable,
      IndexName: "owner-index",
      KeyConditionExpression: "ownerUserId = :ownerUserId",
      ExpressionAttributeValues: {
        ":ownerUserId": ownerUserId
      },
      Limit: 1
    })
  );

  return result.Items?.[0] || null;
}

function normalizeStringList(value, fallback = [], limit = 24, maxLength = 120) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return Array.from(
    new Set(
      value
        .map((item) => String(item || "").trim().slice(0, maxLength))
        .filter(Boolean)
    )
  ).slice(0, limit);
}

function normalizeText(value, fallback = "", maxLength = 1200) {
  if (typeof value === "undefined" || value === null) {
    return fallback;
  }

  return String(value).trim().slice(0, maxLength);
}

function normalizeBoundedNumber(value, fallback, { min = 0, max = 1000, integer = false } = {}) {
  if (typeof value === "undefined" || value === null || value === "") {
    return fallback;
  }

  const number = Number(value);
  if (!Number.isFinite(number)) {
    return fallback;
  }

  const bounded = Math.min(max, Math.max(min, number));
  return integer ? Math.round(bounded) : Math.round(bounded * 100) / 100;
}

function normalizeUserRole(value, fallback = "client") {
  const role = String(value || "").trim().toLowerCase();
  return USER_ROLES.has(role) ? role : fallback;
}

function normalizePlanTier(value, fallback = "free") {
  const plan = String(value || "").trim().toLowerCase();
  return PLAN_TIERS.has(plan) ? plan : fallback;
}

function normalizeConsultantProfileType(value, fallback = "consultant") {
  const profileType = String(value || "").trim().toLowerCase();
  return CONSULTANT_PROFILE_TYPES.has(profileType) ? profileType : fallback;
}

function normalizeConsultantTheme(value, fallback = "") {
  if (typeof value === "undefined") {
    return fallback;
  }

  if (value === null || value === "") {
    return "";
  }

  const theme = String(value || "").trim().toLowerCase();
  return CONSULTANT_PROFILE_THEMES.has(theme) ? theme : fallback;
}

function normalizeAvailabilitySlots(value, fallback = []) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return Array.from(
    new Set(
      value
        .map((item) => String(item || "").trim())
        .filter(Boolean)
        .filter((item) => !Number.isNaN(new Date(item).getTime()))
    )
  ).sort((left, right) => new Date(left).getTime() - new Date(right).getTime());
}

function getNextAvailableSlot(value, fallback = "") {
  const availability = normalizeAvailabilitySlots(value, []);
  const cutoff = Date.now() - 5 * 60 * 1000;

  return (
    availability.find((item) => new Date(item).getTime() >= cutoff) ||
    availability[0] ||
    fallback
  );
}

function sanitizeFileName(fileName) {
  const normalized = String(fileName || "upload")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "upload";
}

function normalizeUploadKind(value) {
  const kind = String(value || "cv").trim().toLowerCase();

  if (
    kind === "cv" ||
    kind === "avatar" ||
    kind === "hero" ||
    kind === "user-avatar"
  ) {
    return kind;
  }

  return null;
}

function assertOwnedStorageKey(value, fallback, allowedPrefixes, label = "storage key") {
  if (typeof value === "undefined") {
    return fallback || "";
  }

  if (value === null || value === "") {
    return "";
  }

  const storageKey = String(value || "").trim();
  const isOwned = allowedPrefixes.some((prefix) => storageKey.startsWith(prefix));

  if (!storageKey || !isOwned) {
    throw Object.assign(new Error(`Invalid ${label}.`), { statusCode: 400 });
  }

  return storageKey;
}

function normalizeCvDocument(value, fallback, userId) {
  if (typeof value === "undefined") {
    return fallback ?? null;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "object" || Array.isArray(value) || !value.storageKey) {
    throw Object.assign(new Error("Invalid CV document."), { statusCode: 400 });
  }

  const storageKey = assertOwnedStorageKey(
    value.storageKey,
    "",
    [`profiles/${userId}/documents/`],
    "CV storage key"
  );

  return {
    fileName: sanitizeFileName(value.fileName || fallback?.fileName || "cv"),
    storageKey,
    uploadedAt:
      normalizeText(value.uploadedAt, fallback?.uploadedAt || "", 40) ||
      new Date().toISOString()
  };
}

function normalizeSlug(value, fallback = "") {
  const normalized = String(value || fallback || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-|-$/g, "");

  return normalized || fallback || "";
}

function validateUploadRequest({ kind, contentType, fileSize }) {
  const safeContentType = String(contentType || "").trim().toLowerCase();
  const safeFileSize = Number(fileSize || 0);

  if (!safeContentType) {
    return "contentType is required.";
  }

  if (!Number.isFinite(safeFileSize) || safeFileSize <= 0) {
    return "fileSize must be a positive number.";
  }

  if (kind === "cv") {
    const allowedDocumentTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]);

    if (!allowedDocumentTypes.has(safeContentType)) {
      return "Unsupported CV file type.";
    }

    if (safeFileSize > 8 * 1024 * 1024) {
      return "CV files must be 8 MB or smaller.";
    }

    return null;
  }

  if (!ALLOWED_PROFILE_IMAGE_TYPES.has(safeContentType)) {
    return "Profile media must be a JPEG, PNG, or WebP image.";
  }

  if (safeFileSize > 5 * 1024 * 1024) {
    return "Profile images must be 5 MB or smaller.";
  }

  return null;
}

async function getSignedObjectUrl(storageKey) {
  if (!storageKey) {
    return "";
  }

  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: env.cvBucket,
      Key: storageKey
    }),
    { expiresIn: 3600 }
  );
}

async function decorateConsultantMedia(consultant) {
  if (!consultant) {
    return consultant;
  }

  const availability = normalizeAvailabilitySlots(consultant.availability || [], []);
  const languages = normalizeStringList(consultant.languages, []);
  const specializations = normalizeStringList(consultant.specializations, []);
  const sessionModes = normalizeStringList(consultant.sessionModes, ["Онлайн"]);
  const tags = normalizeStringList(consultant.tags, []);
  const idealFor = normalizeStringList(consultant.idealFor, []);
  const consultationTopics = normalizeStringList(consultant.consultationTopics, []);
  const experienceHighlights = normalizeStringList(consultant.experienceHighlights, []);
  const educationHighlights = normalizeStringList(consultant.educationHighlights, []);
  const [avatarUrl, heroUrl] = await Promise.all([
    consultant.avatarStorageKey
      ? getSignedObjectUrl(consultant.avatarStorageKey)
      : Promise.resolve(""),
    consultant.heroStorageKey
      ? getSignedObjectUrl(consultant.heroStorageKey)
      : Promise.resolve("")
  ]);

  return {
    ...consultant,
    bio: consultant.bio || "",
    experienceSummary: consultant.experienceSummary || "",
    experienceHighlights,
    educationHighlights,
    theme: normalizeConsultantTheme(consultant.theme),
    languages,
    specializations,
    sessionModes,
    tags,
    idealFor,
    consultationTopics,
    workApproach: consultant.workApproach || "",
    availability,
    nextAvailable: getNextAvailableSlot(availability, consultant.nextAvailable || ""),
    avatarUrl: avatarUrl || consultant.avatarUrl,
    heroUrl: heroUrl || consultant.heroUrl
  };
}

async function decorateUserMedia(user) {
  if (!user) {
    return user;
  }

  const avatarUrl = user.avatarStorageKey
    ? await getSignedObjectUrl(user.avatarStorageKey)
    : "";

  return {
    ...user,
    headline: user.headline || "",
    bio: user.bio || "",
    experienceSummary: user.experienceSummary || "",
    experienceHighlights: normalizeStringList(user.experienceHighlights, []),
    educationHighlights: normalizeStringList(user.educationHighlights, []),
    skills: normalizeStringList(user.skills, []),
    interests: normalizeStringList(user.interests, []),
    keywords: normalizeStringList(user.keywords, []),
    preferredSessionModes: normalizeStringList(user.preferredSessionModes, []),
    avatarUrl: avatarUrl || user.avatarUrl || ""
  };
}

function getConsultantVisibility(plan) {
  return {
    isPublic: true,
    profileStatus: "active",
    subscriptionStatus: "active",
    membershipTier: plan === "pro" ? "enhanced" : "standard"
  };
}

function createConsultantDraft({
  userId,
  name,
  email,
  plan,
  profileType,
  city,
  headline,
  avatarUrl
}) {
  const baseName = String(name || email || "consultant").trim();
  const slug = normalizeSlug(baseName);

  return {
    consultantId: `consultant-${randomUUID()}`,
    ownerUserId: userId,
    profileType: normalizeConsultantProfileType(profileType),
    slug: slug || `consultant-${Date.now()}`,
    name: baseName || "Нов профил",
    headline: String(headline || "").trim() || "Кариерен консултант",
    bio: "",
    experienceSummary: "",
    experienceHighlights: [],
    educationHighlights: [],
    city: String(city || "").trim(),
    languages: [],
    specializations: [],
    experienceYears: 0,
    priceBgn: 0,
    sessionModes: ["Онлайн"],
    featured: false,
    rating: 0,
    reviewCount: 0,
    nextAvailable: "",
    avatarUrl: String(avatarUrl || "").trim(),
    heroUrl: "",
    theme: "",
    tags: [],
    availability: [],
    idealFor: [],
    consultationTopics: [],
    workApproach: "",
    sessionLengthMinutes: 60,
    ...getConsultantVisibility(plan || "free")
  };
}

async function listConsultants(event) {
  const query = String(event.queryStringParameters?.query || "")
    .trim()
    .toLowerCase();
  const city = String(event.queryStringParameters?.city || "")
    .trim()
    .toLowerCase();

  const result = await dynamo.send(
    new ScanCommand({
      TableName: env.consultantsTable
    })
  );

  const items = (result.Items || []).filter((item) => {
    if (item.isPublic === false) {
      return false;
    }

    const matchesQuery =
      !query ||
      item.name?.toLowerCase().includes(query) ||
      item.headline?.toLowerCase().includes(query) ||
      item.experienceSummary?.toLowerCase().includes(query) ||
      (item.specializations || []).join(" ").toLowerCase().includes(query) ||
      (item.tags || []).join(" ").toLowerCase().includes(query) ||
      (item.experienceHighlights || []).join(" ").toLowerCase().includes(query) ||
      (item.educationHighlights || []).join(" ").toLowerCase().includes(query) ||
      (item.consultationTopics || []).join(" ").toLowerCase().includes(query) ||
      (item.idealFor || []).join(" ").toLowerCase().includes(query);
    const matchesCity = !city || item.city?.toLowerCase().includes(city);
    return matchesQuery && matchesCity;
  });

  const orderedItems = [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    if ((right.reviewCount || 0) !== (left.reviewCount || 0)) {
      return (right.reviewCount || 0) - (left.reviewCount || 0);
    }

    if ((right.rating || 0) !== (left.rating || 0)) {
      return (right.rating || 0) - (left.rating || 0);
    }

    return String(left.name || "").localeCompare(String(right.name || ""), "bg");
  });

  const decoratedItems = await Promise.all(
    orderedItems.map((item) => decorateConsultantMedia(item))
  );

  return response(200, decoratedItems, {
    "Cache-Control": "public, max-age=60, stale-while-revalidate=300"
  });
}

async function getConsultant(event) {
  const slug = event.pathParameters?.slug;

  if (!slug) {
    return badRequest("Consultant slug is required.");
  }

  const consultant = await getConsultantBySlug(slug);

  if (!consultant || consultant.isPublic === false) {
    return notFound("Consultant profile not found.");
  }

  return response(200, await decorateConsultantMedia(consultant), {
    "Cache-Control": "public, max-age=120, stale-while-revalidate=600"
  });
}

async function bootstrapUser(event) {
  const claims = requireAuth(event);
  const body = parseBody(event);
  const now = new Date().toISOString();

  const existing = await getUserBySub(claims.sub);
  const currentPlan = normalizePlanTier(existing?.plan, "free");
  const currentRole = normalizeUserRole(existing?.role, "client");
  const requestedRole = existing
    ? currentRole
    : normalizeUserRole(body.role, currentRole);
  const requestedConsultantProfileType =
    typeof body.consultantProfileType === "undefined"
      ? null
      : normalizeConsultantProfileType(body.consultantProfileType, "consultant");
  const nextUser = {
    userId: claims.sub,
    email: claims.email || normalizeText(body.email, "", 320),
    name: normalizeText(body.name || claims.name, existing?.name || "", 120),
    role: requestedRole,
    plan: currentPlan,
    avatarUrl: normalizeText(
      body.avatarUrl ?? claims.picture,
      existing?.avatarUrl ?? "",
      2000
    ),
    avatarStorageKey: existing?.avatarStorageKey || "",
    city: normalizeText(body.city, existing?.city ?? "", 120),
    occupation: normalizeText(body.occupation, existing?.occupation ?? "", 140),
    age: existing?.age ?? null,
    headline: normalizeText(body.headline, existing?.headline ?? "", 180),
    bio: existing?.bio || "",
    experienceSummary: existing?.experienceSummary || "",
    experienceHighlights: existing?.experienceHighlights || [],
    educationHighlights: existing?.educationHighlights || [],
    skills: existing?.skills || [],
    interests: existing?.interests || [],
    keywords: existing?.keywords || [],
    goals: existing?.goals || "",
    preferredSessionModes: existing?.preferredSessionModes || [],
    cvDocument: existing?.cvDocument || null,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };
  const consultantVisibility = getConsultantVisibility(nextUser.plan);

  await dynamo.send(
    new PutCommand({
      TableName: env.usersTable,
      Item: nextUser
    })
  );

  if (nextUser.role === "consultant") {
    const existingConsultant = await getConsultantByOwner(claims.sub);

    if (!existingConsultant) {
      await dynamo.send(
        new PutCommand({
          TableName: env.consultantsTable,
          Item: createConsultantDraft({
            userId: claims.sub,
            name: nextUser.name,
            email: claims.email || body.email || "",
            plan: nextUser.plan,
            profileType: requestedConsultantProfileType || "consultant",
            city: nextUser.city,
            headline: nextUser.headline,
            avatarUrl: nextUser.avatarUrl
          })
        })
      );
    } else {
      await dynamo.send(
        new PutCommand({
          TableName: env.consultantsTable,
          Item: {
            ...existingConsultant,
            profileType:
              requestedConsultantProfileType ||
              existingConsultant.profileType ||
              "consultant",
            avatarUrl:
              body.avatarUrl ??
              existingConsultant.avatarUrl ??
              nextUser.avatarUrl ??
              "",
            ...consultantVisibility
          }
        })
      );
    }
  }

  return response(200, await decorateUserMedia(nextUser));
}

async function getMeProfile(event) {
  const claims = requireAuth(event);
  const user = await getUserBySub(claims.sub);

  if (!user) {
    return notFound("Profile not found. Call /auth/bootstrap first.");
  }

  return response(200, await decorateUserMedia(user));
}

async function updateMeProfile(event) {
  const claims = requireAuth(event);
  const body = parseBody(event);
  const current = await getUserBySub(claims.sub);

  if (!current) {
    return notFound("Profile not found.");
  }

  const nextUser = {
    ...current,
    name: normalizeText(body.name, current.name, 120),
    avatarUrl: normalizeText(body.avatarUrl, current.avatarUrl ?? "", 2000),
    avatarStorageKey: assertOwnedStorageKey(
      body.avatarStorageKey,
      current.avatarStorageKey,
      [`profiles/${claims.sub}/avatar/`],
      "avatar storage key"
    ),
    city: normalizeText(body.city, current.city, 120),
    occupation: normalizeText(body.occupation, current.occupation ?? "", 140),
    age:
      body.age === null
        ? null
        : normalizeBoundedNumber(body.age, current.age ?? null, {
            min: 13,
            max: 120,
            integer: true
          }),
    headline: normalizeText(body.headline, current.headline, 180),
    bio: normalizeText(body.bio, current.bio, 2400),
    experienceSummary: normalizeText(
      body.experienceSummary,
      current.experienceSummary ?? "",
      1200
    ),
    experienceHighlights: normalizeStringList(
      body.experienceHighlights,
      current.experienceHighlights ?? []
    ),
    educationHighlights: normalizeStringList(
      body.educationHighlights,
      current.educationHighlights ?? []
    ),
    skills: normalizeStringList(body.skills, current.skills ?? []),
    interests: normalizeStringList(body.interests, current.interests ?? []),
    keywords: normalizeStringList(body.keywords, current.keywords ?? []),
    goals: normalizeText(body.goals, current.goals ?? "", 1600),
    preferredSessionModes: normalizeStringList(
      body.preferredSessionModes,
      current.preferredSessionModes ?? []
    ),
    plan: normalizePlanTier(current.plan, "free"),
    cvDocument: normalizeCvDocument(body.cvDocument, current.cvDocument, claims.sub),
    updatedAt: new Date().toISOString()
  };

  await dynamo.send(
    new PutCommand({
      TableName: env.usersTable,
      Item: nextUser
    })
  );

  return response(200, await decorateUserMedia(nextUser));
}

async function getMyConsultant(event) {
  const claims = requireAuth(event);
  const consultant = await getConsultantByOwner(claims.sub);

  if (!consultant) {
    return notFound("Consultant profile not found.");
  }

  return response(200, await decorateConsultantMedia(consultant));
}

async function updateMyConsultant(event) {
  const claims = requireAuth(event);
  const body = parseBody(event);
  const user = await getUserBySub(claims.sub);

  if (!user || user.role !== "consultant") {
    return forbidden("Only consultant accounts can manage consultant profiles.");
  }

  const current = await getConsultantByOwner(claims.sub);
  const baseConsultant =
    current ||
    createConsultantDraft({
      userId: claims.sub,
      name: user.name,
      email: user.email,
      plan: user.plan,
      profileType: normalizeConsultantProfileType(body.profileType),
      city: user.city,
      headline: user.headline
    });

  const consultantVisibility = getConsultantVisibility(user.plan);
  const requestedTheme = normalizeConsultantTheme(body.theme, baseConsultant.theme || "");

  const normalizedSlug = body.slug ? normalizeSlug(body.slug, baseConsultant.slug) : null;

  if (normalizedSlug && current && normalizedSlug !== current.slug) {
    const existingSlug = await getConsultantBySlug(normalizedSlug);
    if (
      existingSlug &&
      (!current || existingSlug.consultantId !== current.consultantId)
    ) {
      return badRequest("This slug is already in use.");
    }
  }

  const { mapImageUrl, ...baseConsultantWithoutDeprecatedMedia } = baseConsultant;

  const nextConsultant = {
    ...baseConsultantWithoutDeprecatedMedia,
    profileType: normalizeConsultantProfileType(
      body.profileType,
      baseConsultant.profileType ?? "consultant"
    ),
    slug: normalizedSlug || baseConsultant.slug,
    name: normalizeText(body.name, baseConsultant.name, 120),
    headline: normalizeText(body.headline, baseConsultant.headline, 180),
    bio: normalizeText(body.bio, baseConsultant.bio, 2800),
    experienceSummary: normalizeText(
      body.experienceSummary,
      baseConsultant.experienceSummary ?? "",
      1400
    ),
    experienceHighlights: normalizeStringList(
      body.experienceHighlights,
      baseConsultant.experienceHighlights ?? []
    ),
    educationHighlights: normalizeStringList(
      body.educationHighlights,
      baseConsultant.educationHighlights ?? []
    ),
    city: normalizeText(body.city, baseConsultant.city, 120),
    experienceYears: normalizeBoundedNumber(
      body.experienceYears,
      baseConsultant.experienceYears ?? 0,
      { min: 0, max: 70, integer: true }
    ),
    priceBgn: normalizeBoundedNumber(body.priceBgn, baseConsultant.priceBgn ?? 0, {
      min: 0,
      max: 5000
    }),
    featured: baseConsultant.featured ?? false,
    rating: baseConsultant.rating ?? 0,
    reviewCount: baseConsultant.reviewCount ?? 0,
    theme: normalizePlanTier(user.plan, "free") === "pro" ? requestedTheme : "",
    avatarUrl: normalizeText(body.avatarUrl, baseConsultant.avatarUrl ?? "", 2000),
    heroUrl: normalizeText(body.heroUrl, baseConsultant.heroUrl ?? "", 2000),
    avatarStorageKey: assertOwnedStorageKey(
      body.avatarStorageKey,
      baseConsultant.avatarStorageKey,
      [`consultants/${claims.sub}/avatar/`],
      "consultant avatar storage key"
    ),
    heroStorageKey: assertOwnedStorageKey(
      body.heroStorageKey,
      baseConsultant.heroStorageKey,
      [`consultants/${claims.sub}/hero/`],
      "consultant banner storage key"
    ),
    languages: normalizeStringList(body.languages, baseConsultant.languages ?? []),
    specializations: normalizeStringList(
      body.specializations,
      baseConsultant.specializations ?? []
    ),
    sessionModes: normalizeStringList(
      body.sessionModes,
      baseConsultant.sessionModes ?? ["Онлайн"]
    ),
    tags: normalizeStringList(body.tags, baseConsultant.tags ?? []),
    idealFor: normalizeStringList(body.idealFor, baseConsultant.idealFor ?? []),
    consultationTopics: normalizeStringList(
      body.consultationTopics,
      baseConsultant.consultationTopics ?? []
    ),
    workApproach: normalizeText(
      body.workApproach,
      baseConsultant.workApproach ?? "",
      1800
    ),
    sessionLengthMinutes: normalizeBoundedNumber(
      body.sessionLengthMinutes,
      baseConsultant.sessionLengthMinutes ?? 60,
      { min: 15, max: 240, integer: true }
    ),
    availability: normalizeAvailabilitySlots(
      body.availability ?? baseConsultant.availability ?? [],
      []
    ),
    ...consultantVisibility
  };

  nextConsultant.nextAvailable = getNextAvailableSlot(
    nextConsultant.availability,
    baseConsultant.nextAvailable || ""
  );

  await dynamo.send(
    new PutCommand({
      TableName: env.consultantsTable,
      Item: nextConsultant
    })
  );

  return response(200, await decorateConsultantMedia(nextConsultant));
}

async function createUploadUrl(event) {
  const claims = requireAuth(event);
  const body = parseBody(event);

  if (!body.fileName) {
    return badRequest("fileName is required.");
  }

  const kind = normalizeUploadKind(body.kind);

  if (!kind) {
    return badRequest("Invalid upload kind.");
  }

  const uploadValidationError = validateUploadRequest({
    kind,
    contentType: body.contentType,
    fileSize: body.fileSize
  });

  if (uploadValidationError) {
    return badRequest(uploadValidationError);
  }

  const safeFileName = sanitizeFileName(body.fileName);
  const storageKey =
    kind === "cv"
      ? `profiles/${claims.sub}/documents/${Date.now()}-${safeFileName}`
      : kind === "user-avatar"
        ? `profiles/${claims.sub}/avatar/${Date.now()}-${safeFileName}`
      : `consultants/${claims.sub}/${kind}/${Date.now()}-${safeFileName}`;
  const command = new PutObjectCommand({
    Bucket: env.cvBucket,
    Key: storageKey,
    ContentType: body.contentType || "application/octet-stream"
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

  return response(200, {
    uploadUrl,
    storageKey,
    document: {
      fileName: body.fileName,
      storageKey,
      uploadedAt: new Date().toISOString()
    }
  });
}

async function createBooking(event) {
  const claims = requireAuth(event);
  const body = parseBody(event);

  if (!body.consultantId || !body.scheduledAt) {
    return badRequest("consultantId and scheduledAt are required.");
  }

  const scheduledDate = new Date(String(body.scheduledAt || ""));

  if (Number.isNaN(scheduledDate.getTime())) {
    return badRequest("scheduledAt must be a valid ISO date.");
  }

  if (scheduledDate.getTime() <= Date.now() + 5 * 60 * 1000) {
    return badRequest("The selected booking time must be in the future.");
  }

  const user = await getUserBySub(claims.sub);

  if (!user) {
    return notFound("User profile not found.");
  }

  if (user.role !== "client") {
    return forbidden("Only users can create consultation bookings.");
  }

  const consultantResult = await dynamo.send(
    new GetCommand({
      TableName: env.consultantsTable,
      Key: { consultantId: body.consultantId }
    })
  );
  const consultant = consultantResult.Item;

  if (!consultant) {
    return notFound("Consultant not found.");
  }

  if (consultant.isPublic === false) {
    return badRequest("Consultant profile is not public yet.");
  }

  if (consultant.ownerUserId === user.userId) {
    return badRequest("You cannot book your own consultant profile.");
  }

  const normalizedAvailability = normalizeAvailabilitySlots(consultant.availability || [], []);
  const normalizedScheduledAt = scheduledDate.toISOString();

  if (!normalizedAvailability.includes(normalizedScheduledAt)) {
    return badRequest("The selected slot is no longer available.");
  }

  const existingBookings = await dynamo.send(
    new QueryCommand({
      TableName: env.bookingsTable,
      IndexName: "consultant-index",
      KeyConditionExpression: "consultantId = :consultantId",
      ExpressionAttributeValues: {
        ":consultantId": consultant.consultantId
      }
    })
  );

  const hasConflictingBooking = (existingBookings.Items || []).some(
    (item) =>
      item.scheduledAt === normalizedScheduledAt &&
      item.status !== "cancelled"
  );

  if (hasConflictingBooking) {
    return badRequest("The selected slot already has an active booking request.");
  }

  const booking = {
    bookingId: `booking-${randomUUID()}`,
    consultantId: consultant.consultantId,
    consultantName: consultant.name,
    clientId: user.userId,
    scheduledAt: normalizedScheduledAt,
    status: "requested",
    note: String(body.note || "").trim().slice(0, 1200),
    createdAt: new Date().toISOString()
  };

  try {
    await dynamo.send(
      new TransactWriteCommand({
        TransactItems: [
          {
            Update: {
              TableName: env.consultantsTable,
              Key: { consultantId: consultant.consultantId },
              UpdateExpression:
                "SET bookedSlots = list_append(if_not_exists(bookedSlots, :emptySlots), :slotList)",
              ConditionExpression:
                "contains(availability, :scheduledAt) AND (attribute_not_exists(bookedSlots) OR NOT contains(bookedSlots, :scheduledAt))",
              ExpressionAttributeValues: {
                ":scheduledAt": normalizedScheduledAt,
                ":emptySlots": [],
                ":slotList": [normalizedScheduledAt]
              }
            }
          },
          {
            Put: {
              TableName: env.bookingsTable,
              Item: booking,
              ConditionExpression: "attribute_not_exists(bookingId)"
            }
          }
        ]
      })
    );
  } catch (error) {
    if (error.name === "TransactionCanceledException") {
      return badRequest("The selected slot already has an active booking request.");
    }

    throw error;
  }

  return response(201, booking);
}

async function listBookings(event) {
  const claims = requireAuth(event);
  const user = await getUserBySub(claims.sub);

  if (!user) {
    return notFound("Profile not found.");
  }

  if (user.role === "consultant") {
    const consultant = await getConsultantByOwner(claims.sub);

    if (!consultant) {
      return response(200, []);
    }

    const result = await dynamo.send(
      new QueryCommand({
        TableName: env.bookingsTable,
        IndexName: "consultant-index",
        KeyConditionExpression: "consultantId = :consultantId",
        ExpressionAttributeValues: {
          ":consultantId": consultant.consultantId
        }
      })
    );

    return response(200, result.Items || []);
  }

  const result = await dynamo.send(
    new QueryCommand({
      TableName: env.bookingsTable,
      IndexName: "client-index",
      KeyConditionExpression: "clientId = :clientId",
      ExpressionAttributeValues: {
        ":clientId": user.userId
      }
    })
  );

  return response(200, result.Items || []);
}

function health() {
  return response(200, { ok: true, service: "careerlane-api" }, {
    "Cache-Control": "no-store"
  });
}

exports.handler = async (event) => {
  try {
    if (event.requestContext?.http?.method === "OPTIONS") {
      return response(204, {});
    }

    const method = event.requestContext?.http?.method;
    const path = event.rawPath;

    if (method === "GET" && path === "/health") return health();
    if (method === "GET" && path === "/consultants") return listConsultants(event);
    if (method === "GET" && path === "/consultants/me") return getMyConsultant(event);
    if (method === "PUT" && path === "/consultants/me") return updateMyConsultant(event);
    if (method === "GET" && /^\/consultants\/[^/]+$/.test(path)) return getConsultant(event);
    if (method === "POST" && path === "/auth/bootstrap") return bootstrapUser(event);
    if (method === "GET" && path === "/me/profile") return getMeProfile(event);
    if (method === "PUT" && path === "/me/profile") return updateMeProfile(event);
    if (method === "POST" && path === "/me/cv/upload-url") return createUploadUrl(event);
    if (method === "GET" && path === "/bookings") return listBookings(event);
    if (method === "POST" && path === "/bookings") return createBooking(event);

    return notFound("Route not found.");
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
      console.error(error);
    }
    return response(statusCode, {
      message:
        statusCode >= 500
          ? "Unexpected server error."
          : error.message || "Unexpected server error."
    });
  }
};
