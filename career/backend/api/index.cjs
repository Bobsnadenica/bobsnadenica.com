const { randomUUID } = require("node:crypto");
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand
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
  allowedOrigin: process.env.ALLOWED_ORIGIN || "*"
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": env.allowedOrigin,
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
      "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS"
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
    throw new Error("Request body must be valid JSON.");
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

function normalizeStringList(value, fallback = []) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
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
  headline
}) {
  const baseName = String(name || email || "consultant").trim();
  const slug = String(baseName)
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, "-")
    .replace(/^-|-$/g, "");

  return {
    consultantId: `consultant-${randomUUID()}`,
    ownerUserId: userId,
    profileType: profileType || "consultant",
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
    avatarUrl: "",
    heroUrl: "",
    mapImageUrl: "",
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

  return response(200, decoratedItems);
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

  return response(200, await decorateConsultantMedia(consultant));
}

async function bootstrapUser(event) {
  const claims = requireAuth(event);
  const body = parseBody(event);
  const now = new Date().toISOString();

  const existing = await getUserBySub(claims.sub);
  const consultantVisibility = getConsultantVisibility(body.plan || existing?.plan || "free");
  const nextUser = {
    userId: claims.sub,
    email: claims.email || body.email || "",
    name: body.name || claims.name || existing?.name || "",
    role: body.role || existing?.role || "client",
    plan: body.plan || existing?.plan || "free",
    avatarUrl: existing?.avatarUrl || "",
    avatarStorageKey: existing?.avatarStorageKey || "",
    city: body.city ?? existing?.city ?? "",
    occupation: body.occupation ?? existing?.occupation ?? "",
    age: existing?.age ?? null,
    headline: body.headline ?? existing?.headline ?? "",
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
            profileType: body.consultantProfileType,
            city: nextUser.city,
            headline: nextUser.headline
          })
        })
      );
    } else {
      await dynamo.send(
        new PutCommand({
          TableName: env.consultantsTable,
          Item: {
            ...existingConsultant,
            profileType: body.consultantProfileType || existingConsultant.profileType || "consultant",
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
    name: body.name ?? current.name,
    avatarUrl: body.avatarUrl ?? current.avatarUrl ?? "",
    avatarStorageKey: body.avatarStorageKey ?? current.avatarStorageKey ?? "",
    city: body.city ?? current.city,
    occupation: body.occupation ?? current.occupation ?? "",
    age: body.age ?? current.age ?? null,
    headline: body.headline ?? current.headline,
    bio: body.bio ?? current.bio,
    experienceSummary: body.experienceSummary ?? current.experienceSummary ?? "",
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
    goals: body.goals ?? current.goals ?? "",
    preferredSessionModes: normalizeStringList(
      body.preferredSessionModes,
      current.preferredSessionModes ?? []
    ),
    plan: body.plan ?? current.plan,
    cvDocument: body.cvDocument ?? current.cvDocument,
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
      profileType: body.profileType,
      city: user.city,
      headline: user.headline
    });

  const consultantVisibility = getConsultantVisibility(user.plan);

  if (body.slug && current && body.slug !== current.slug) {
    const existingSlug = await getConsultantBySlug(body.slug);
    if (
      existingSlug &&
      (!current || existingSlug.consultantId !== current.consultantId)
    ) {
      return badRequest("This slug is already in use.");
    }
  }

  const nextConsultant = {
    ...baseConsultant,
    profileType: body.profileType ?? baseConsultant.profileType ?? "consultant",
    slug: body.slug ?? baseConsultant.slug,
    name: body.name ?? baseConsultant.name,
    headline: body.headline ?? baseConsultant.headline,
    bio: body.bio ?? baseConsultant.bio,
    experienceSummary:
      body.experienceSummary ?? baseConsultant.experienceSummary ?? "",
    experienceHighlights: normalizeStringList(
      body.experienceHighlights,
      baseConsultant.experienceHighlights ?? []
    ),
    educationHighlights: normalizeStringList(
      body.educationHighlights,
      baseConsultant.educationHighlights ?? []
    ),
    city: body.city ?? baseConsultant.city,
    experienceYears: body.experienceYears ?? baseConsultant.experienceYears ?? 0,
    priceBgn: body.priceBgn ?? baseConsultant.priceBgn ?? 0,
    featured: body.featured ?? baseConsultant.featured ?? false,
    rating: body.rating ?? baseConsultant.rating ?? 0,
    reviewCount: body.reviewCount ?? baseConsultant.reviewCount ?? 0,
    avatarUrl: body.avatarUrl ?? baseConsultant.avatarUrl ?? "",
    heroUrl: body.heroUrl ?? baseConsultant.heroUrl ?? "",
    avatarStorageKey: body.avatarStorageKey ?? baseConsultant.avatarStorageKey ?? "",
    heroStorageKey: body.heroStorageKey ?? baseConsultant.heroStorageKey ?? "",
    mapImageUrl: body.mapImageUrl ?? baseConsultant.mapImageUrl ?? "",
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
    workApproach: body.workApproach ?? baseConsultant.workApproach ?? "",
    sessionLengthMinutes:
      body.sessionLengthMinutes ?? baseConsultant.sessionLengthMinutes ?? 60,
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

  const booking = {
    bookingId: `booking-${randomUUID()}`,
    consultantId: consultant.consultantId,
    consultantName: consultant.name,
    clientId: user.userId,
    scheduledAt: body.scheduledAt,
    status: "requested",
    note: body.note || "",
    createdAt: new Date().toISOString()
  };

  await dynamo.send(
    new PutCommand({
      TableName: env.bookingsTable,
      Item: booking
    })
  );

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
  return response(200, { ok: true, service: "careerlane-api" });
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
    return response(statusCode, {
      message: error.message || "Unexpected server error."
    });
  }
};
