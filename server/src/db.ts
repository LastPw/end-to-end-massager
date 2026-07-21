// @ts-nocheck
﻿import crypto from "node:crypto";
import { getPrisma } from "./prisma.js";

export type UserRow = {
  id: number;
  username: string;
  phone: string;
  first_name: string;
  last_name: string;
  password_hash: string;
  password_salt: string;
  two_factor_enabled: boolean;
  public_key: string;
  created_at: number;
  failed_login_count: number;
  locked_until: number | null;
  banned: boolean;
  can_send: boolean;
  can_create: boolean;
  avatar: string | null;
  bio: string | null;
  profile_public: boolean;
  allow_direct: boolean;
  allow_group_invite: boolean;
  privacy_defaults: {
    hide_online: boolean;
    hide_last_seen: boolean;
    hide_profile_photo: boolean;
    disable_read_receipts: boolean;
    disable_typing_indicator: boolean;
  };
  privacy_overrides: Record<string, Partial<UserRow["privacy_defaults"]>>;
};

export type SessionRow = {
  token_hash: string;
  user_id: number;
  device_id: string;
  device_name: string;
  ip: string;
  last_seen_at: number;
  created_at: number;
  access_expires_at: number;
  refresh_token_hash: string;
  refresh_expires_at: number;
  rotated_at: number;
};

export type ProfileEntry = {
  ip: string;
  userAgent: string;
  platform: string;
  language: string;
  deviceModel: string;
  at: number;
};

export type UserProfile = {
  id: number;
  user_id: number;
  username: string;
  last_ip: string;
  last_user_agent: string;
  last_platform: string;
  last_language: string;
  last_device_model: string;
  last_seen_at: number;
  history: ProfileEntry[];
};

export type UploadedFileRow = {
  key: string;
  owner_user_id: number;
  content_type: string;
  created_at: number;
};

export type ConversationType = "direct" | "group" | "channel";

export type ConversationRow = {
  id: number;
  type: ConversationType;
  name: string | null;
  owner_id: number;
  visibility: "public" | "private";
  forward_enabled: boolean;
  quiet_hours?: {
    enabled: boolean;
    start: string;
    end: string;
  } | null;
  created_at: number;
};

export type ConversationSettings = {
  forward_enabled: boolean;
  quiet_hours: {
    enabled: boolean;
    start: string;
    end: string;
  } | null;
};

export type MembershipRow = {
  conversation_id: number;
  user_id: number;
  role: "owner" | "admin" | "member";
  permissions?: {
    manage_members?: boolean;
    manage_invites?: boolean;
  };
};

export type MessageRow = {
  id: number;
  group_id: string;
  conversation_id: number;
  sender_id: number;
  sender_device_id: string;
  recipient_id: number;
  recipient_device_id: string;
  ciphertext: string;
  nonce: string;
  size_bytes: number;
  created_at: number;
  delivered_at: number | null;
  read_at: number | null;
  deleted_at: number | null;
  deleted_by: number | null;
};

export type BlockedEventRow = {
  id: number;
  conversation_id: number;
  user_id: number;
  reason: string;
  metadata?: Record<string, unknown> | null;
  created_at: number;
};

export type ScheduledPayload = {
  message_id: string;
  to_username: string;
  to_device_id: string;
  ciphertext: string;
  nonce: string;
};

export type ScheduledBatch = {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_device_id: string;
  scheduled_for: number;
  created_at: number;
  payloads: ScheduledPayload[];
};

export type ReportEvidence = {
  text?: string;
  attachments?: Array<{ name: string; kind: string }>;
};

export type ReportRow = {
  id: number;
  reporter_id: number;
  reported_user_id: number;
  conversation_id: number;
  message_id: number | null;
  group_id: string | null;
  reason: string;
  evidence: ReportEvidence | null;
  created_at: number;
  status: "open" | "approved" | "rejected";
  reviewed_at: number | null;
  action: "ban" | "restrict" | null;
};

export type OneTimePreKey = {
  id: number;
  key: string;
};

export type UserKeyBundle = {
  user_id: number;
  session_device_id: string;
  registration_id: number;
  device_id: number;
  identity_key: string;
  signed_prekey_id: number;
  signed_prekey: string;
  signed_prekey_sig: string;
  fallback_public_key: string;
  one_time_prekeys: OneTimePreKey[];
  updated_at: number;
};

export type InviteRow = {
  id: number;
  conversation_id: number;
  token: string;
  max_uses: number;
  uses: number;
  expires_at: number | null;
  created_by: number;
  created_at: number;
  revoked: boolean;
};

export type SocialPostKind = "post" | "reel" | "story";

export type SocialPost = {
  id: number;
  user_id: number;
  kind: SocialPostKind;
  media_url: string;
  media_type: "image" | "video";
  caption: string | null;
  tags: string[];
  visibility: "public" | "private";
  allowed_user_ids: number[];
  comment_visibility: "public" | "friends";
  created_at: number;
  publish_at: number | null;
  expires_at: number | null;
};

export type SocialLike = {
  id: number;
  post_id: number;
  user_id: number;
  created_at: number;
};

export type SocialSave = {
  id: number;
  post_id: number;
  user_id: number;
  created_at: number;
};

export type SocialView = {
  id: number;
  post_id: number;
  user_id: number;
  created_at: number;
};

export type SocialComment = {
  id: number;
  post_id: number;
  user_id: number;
  text: string;
  created_at: number;
};

export type SocialFollow = {
  id: number;
  follower_id: number;
  following_id: number;
  created_at: number;
};

export type SocialNotification = {
  id: number;
  user_id: number;
  actor_id: number;
  post_id: number | null;
  type: "like" | "comment" | "follow";
  created_at: number;
  seen_at: number | null;
};

type AdminUser = {
  id: number;
  username: string;
  password_hash: string;
  password_salt: string;
  role: "super" | "standard";
  permissions: string[];
  created_at: number;
  updated_at: number;
};

type AdminSession = {
  token_hash: string;
  admin_id: number;
  created_at: number;
  expires_at: number;
};
const BOOTSTRAP_ADMIN_USERNAME = process.env.APP_ADMIN_BOOTSTRAP_USERNAME?.trim().toLowerCase() || "";
const BOOTSTRAP_ADMIN_PASSWORD = process.env.APP_ADMIN_BOOTSTRAP_PASSWORD || "";
const SYSTEM_USERNAME = "system";
const SYSTEM_CONVERSATION_NAME = "System";
const DEFAULT_PRIVACY = {
    hide_online: false,
    hide_last_seen: false,
    hide_profile_photo: false,
    disable_read_receipts: false,
    disable_typing_indicator: false
};
function normalizeUsername(value) {
    return value.trim().toLowerCase();
}
function hashPassword(password, salt) {
    return crypto.scryptSync(password, salt, 32).toString("hex");
}
function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
function parseJsonValue(value, fallback) {
    if (value === null || value === undefined) {
        return fallback;
    }
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        }
        catch {
            return fallback;
        }
    }
    return value;
}
function stringifyJsonValue(value) {
    return JSON.stringify(value ?? null);
}

function toDbTime(ms) {
  if (ms === null || ms === undefined) return null;
  return Math.floor(Number(ms) / 1000);
}

function fromDbTime(sec) {
  if (sec === null || sec === undefined) return null;
  return Number(sec) * 1000;
}

function fromDbTimeValue(sec) {
  if (sec === null || sec === undefined) return 0;
  return Number(sec) * 1000;
}

function normalizeUser(user) {
    if (!user) {
        return null;
    }
    const privacyDefaults = parseJsonValue(user.privacy_defaults, {});
    const privacyOverrides = parseJsonValue(user.privacy_overrides, {});
    return {
        ...user,
        created_at: fromDbTimeValue(user.created_at),
        locked_until: fromDbTime(user.locked_until),
        phone: user.phone || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        two_factor_enabled: Boolean(user.two_factor_enabled),
        privacy_defaults: { ...DEFAULT_PRIVACY, ...privacyDefaults },
        privacy_overrides: privacyOverrides || {}
    };
}
function normalizeSocialPost(row) {
    return {
        ...row,
        created_at: fromDbTimeValue(row.created_at),
        tags: parseJsonValue(row.tags, []),
        visibility: row.visibility || "public",
        allowed_user_ids: parseJsonValue(row.allowed_user_ids, []),
        comment_visibility: row.comment_visibility || "public",
        publish_at: fromDbTime(row.publish_at),
        expires_at: fromDbTime(row.expires_at)
    };
}
function normalizeAdminUser(row) {
    return {
        ...row,
        permissions: parseJsonValue(row.permissions, []),
        created_at: fromDbTimeValue(row.created_at),
        updated_at: fromDbTimeValue(row.updated_at)
    };
}

function normalizeSessionRow(row) {
  return {
    ...row,
    last_seen_at: fromDbTimeValue(row.last_seen_at),
    created_at: fromDbTimeValue(row.created_at),
    access_expires_at: fromDbTimeValue(row.access_expires_at),
    refresh_expires_at: fromDbTimeValue(row.refresh_expires_at),
    rotated_at: fromDbTimeValue(row.rotated_at)
  };
}

function normalizeConversationRow(row) {
  return { ...row, created_at: fromDbTimeValue(row.created_at) };
}

function normalizeInviteRow(row) {
  return { ...row, created_at: fromDbTimeValue(row.created_at), expires_at: fromDbTime(row.expires_at) };
}

function normalizeMessageRow(row) {
  return {
    ...row,
    sender_username: row.sender?.username ?? row.sender_username,
    sender: undefined,
    created_at: fromDbTimeValue(row.created_at),
    delivered_at: fromDbTime(row.delivered_at),
    read_at: fromDbTime(row.read_at),
    deleted_at: fromDbTime(row.deleted_at)
  };
}

function normalizeReportRow(row) {
  return {
    ...row,
    created_at: fromDbTimeValue(row.created_at),
    reviewed_at: fromDbTime(row.reviewed_at),
    evidence: parseJsonValue(row.evidence, null)
  };
}

function normalizeBlockedEventRow(row) {
  return {
    ...row,
    created_at: fromDbTimeValue(row.created_at),
    metadata: parseJsonValue(row.metadata, null)
  };
}

function normalizeSocialNotification(row) {
  return {
    ...row,
    created_at: fromDbTimeValue(row.created_at),
    seen_at: fromDbTime(row.seen_at)
  };
}

function normalizeSocialCommentRow(row) {
  return { ...row, created_at: fromDbTimeValue(row.created_at) };
}

function normalizeAdminSession(row) {
  return {
    ...row,
    created_at: fromDbTimeValue(row.created_at),
    expires_at: fromDbTimeValue(row.expires_at)
  };
}

function normalizeUploadedFileRow(row) {
  if (!row) {
    return null;
  }
  return {
    ...row,
    created_at: fromDbTimeValue(row.created_at)
  };
}

export async function ensureDefaultAdmin() {
    const prisma = getPrisma();
    const existing = await prisma.admin_users.findFirst();
    if (existing) {
        return normalizeAdminUser(existing);
    }
    if (!BOOTSTRAP_ADMIN_USERNAME || BOOTSTRAP_ADMIN_PASSWORD.length < 12) {
        return null;
    }
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(BOOTSTRAP_ADMIN_PASSWORD, salt);
    const now = Date.now();
    const created = await prisma.admin_users.create({
        data: {
            username: BOOTSTRAP_ADMIN_USERNAME,
            password_hash: passwordHash,
            password_salt: salt,
            role: "super",
            permissions: stringifyJsonValue(["*"]),
            created_at: toDbTime(now),
            updated_at: toDbTime(now)
        }
    });
    return normalizeAdminUser(created);
}
export async function findAdminByUsername(username) {
    const prisma = getPrisma();
    const row = await prisma.admin_users.findUnique({ where: { username } });
    return row ? normalizeAdminUser(row) : null;
}
export async function listAdminUsers() {
    const prisma = getPrisma();
    const rows = await prisma.admin_users.findMany({ orderBy: { created_at: "asc" } });
    return rows.map((row) => normalizeAdminUser(row));
}
export async function createAdminUser(username, password, role, permissions) {
    const prisma = getPrisma();
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);
    const now = Date.now();
    const created = await prisma.admin_users.create({
        data: {
            username,
            password_hash: passwordHash,
            password_salt: salt,
            role,
            permissions: stringifyJsonValue(permissions),
            created_at: toDbTime(now),
            updated_at: now
        }
    });
    return normalizeAdminUser(created);
}
export async function updateAdminUserPassword(adminId, newPassword) {
    const prisma = getPrisma();
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(newPassword, salt);
    await prisma.admin_users.update({
        where: { id: adminId },
        data: {
            password_hash: passwordHash,
            password_salt: salt,
            updated_at: toDbTime(Date.now())
        }
    });
    await prisma.admin_sessions.deleteMany({ where: { admin_id: adminId } }).catch(() => null);
}
export async function updateAdminUserPermissions(adminId, permissions) {
    const prisma = getPrisma();
    await prisma.admin_users.update({
        where: { id: adminId },
        data: { permissions: stringifyJsonValue(permissions), updated_at: toDbTime(Date.now()) }
    });
}
export async function createAdminSession(token, adminId, expiresAt) {
    const prisma = getPrisma();
    await prisma.admin_sessions.create({
        data: {
            token_hash: hashToken(token),
            admin_id: adminId,
            created_at: toDbTime(Date.now()),
            expires_at: toDbTime(expiresAt)
        }
    });
}
export async function findAdminSession(token) {
    const prisma = getPrisma();
    const session = await prisma.admin_sessions.findUnique({ where: { token_hash: hashToken(token) } });
    if (!session) {
        return null;
    }
    if (fromDbTimeValue(session.expires_at) <= Date.now()) {
        await prisma.admin_sessions.delete({ where: { token_hash: session.token_hash } }).catch(() => null);
        return null;
    }
    const admin = await prisma.admin_users.findUnique({
        where: { id: session.admin_id }
    });
    if (!admin) {
        return null;
    }
    return { session: normalizeAdminSession(session), admin: normalizeAdminUser(admin) };
}
export async function removeAdminSession(token) {
    const prisma = getPrisma();
    await prisma.admin_sessions.delete({ where: { token_hash: hashToken(token) } }).catch(() => null);
}
export async function getAppSetting(key) {
    const prisma = getPrisma();
    const row = await prisma.app_settings.findUnique({ where: { key } });
    if (!row) {
        return null;
    }
    return parseJsonValue(row.value, row.value);
}
export async function registerUploadedFile(key, ownerUserId, contentType) {
    const prisma = getPrisma();
    const created = await prisma.uploaded_files.upsert({
        where: { key },
        update: {
            owner_user_id: ownerUserId,
            content_type: contentType,
            created_at: toDbTime(Date.now())
        },
        create: {
            key,
            owner_user_id: ownerUserId,
            content_type: contentType,
            created_at: toDbTime(Date.now())
        }
    });
    return normalizeUploadedFileRow(created);
}
export async function findUploadedFileByKey(key) {
    const prisma = getPrisma();
    const row = await prisma.uploaded_files.findUnique({ where: { key } });
    return normalizeUploadedFileRow(row);
}
export async function setAppSetting(key, value) {
    const prisma = getPrisma();
    await prisma.app_settings.upsert({
        where: { key },
        update: { value: stringifyJsonValue(value), updated_at: toDbTime(Date.now()) },
        create: { key, value: stringifyJsonValue(value), updated_at: toDbTime(Date.now()) }
    });
}
export async function createUser(username, phone, firstName, lastName, passwordHash, passwordSalt, twoFactorEnabled, publicKey) {
    const prisma = getPrisma();
    const now = Date.now();
    const created = await prisma.users.create({
        data: {
            username: normalizeUsername(username),
            phone,
            first_name: firstName,
            last_name: lastName,
            password_hash: passwordHash,
            password_salt: passwordSalt,
            two_factor_enabled: Boolean(twoFactorEnabled),
            public_key: publicKey,
            created_at: toDbTime(now),
            failed_login_count: 0,
            locked_until: null,
            banned: false,
            can_send: true,
            can_create: true,
            avatar: null,
            bio: null,
            profile_public: true,
            allow_direct: true,
            allow_group_invite: true,
            privacy_defaults: stringifyJsonValue(DEFAULT_PRIVACY),
            privacy_overrides: stringifyJsonValue({})
        }
    });
    return normalizeUser(created);
}
export async function ensureSystemUser() {
    const prisma = getPrisma();
    const existing = await prisma.users.findUnique({
        where: { username: SYSTEM_USERNAME }
    });
    if (existing) {
        return normalizeUser(existing);
    }
    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(crypto.randomBytes(16).toString("hex"), salt);
    const now = Date.now();
    const created = await prisma.users.create({
        data: {
            username: SYSTEM_USERNAME,
            phone: "",
            first_name: "",
            last_name: "",
            password_hash: passwordHash,
            password_salt: salt,
            two_factor_enabled: false,
            public_key: "",
            created_at: toDbTime(now),
            failed_login_count: 0,
            locked_until: null,
            banned: false,
            can_send: true,
            can_create: true,
            avatar: null,
            bio: null,
            profile_public: false,
            allow_direct: true,
            allow_group_invite: true,
            privacy_defaults: stringifyJsonValue(DEFAULT_PRIVACY),
            privacy_overrides: stringifyJsonValue({})
        }
    });
    return normalizeUser(created);
}
export async function findSystemConversation() {
    const prisma = getPrisma();
    return prisma.conversations.findFirst({
        where: {
            type: "channel",
            name: SYSTEM_CONVERSATION_NAME
        }
    });
}
export async function ensureSystemConversation() {
    const existing = await findSystemConversation();
    if (existing) {
        return existing;
    }
    const systemUser = await ensureSystemUser();
    return createConversation("channel", SYSTEM_CONVERSATION_NAME, systemUser.id, [], "public");
}
export async function addUserToSystemConversation(userId) {
    const systemConv = await ensureSystemConversation();
    await addMember(systemConv.id, userId, "member");
}
export async function findUserByUsername(username) {
    const prisma = getPrisma();
    const user = await prisma.users.findUnique({
        where: { username: normalizeUsername(username) }
    });
    return normalizeUser(user);
}
export async function findUserByPhone(phone) {
    const prisma = getPrisma();
    const user = await prisma.users.findFirst({ where: { phone } });
    return normalizeUser(user);
}
export async function findUserById(id) {
    const prisma = getPrisma();
    const user = await prisma.users.findUnique({ where: { id } });
    return normalizeUser(user);
}
export async function listUsers() {
    const prisma = getPrisma();
    const users = await prisma.users.findMany();
    return users.map((user) => normalizeUser(user));
}
export async function listUsersByUsernames(usernames) {
    if (!usernames.length) {
        return [];
    }
    const prisma = getPrisma();
    const users = await prisma.users.findMany({
        where: { username: { in: usernames } }
    });
    return users.map((user) => normalizeUser(user)).filter(Boolean);
}
export async function updateUserFlags(userId, updates) {
    const prisma = getPrisma();
    const updated = await prisma.users
        .update({
        where: { id: userId },
        data: {
            banned: updates.banned ?? undefined,
            can_send: updates.can_send ?? undefined,
            can_create: updates.can_create ?? undefined,
            allow_direct: updates.allow_direct ?? undefined,
            allow_group_invite: updates.allow_group_invite ?? undefined
        }
    })
        .catch(() => null);
    return normalizeUser(updated);
}
export async function recordFailedLogin(userId, lockUntil) {
    const prisma = getPrisma();
    await prisma.users
        .update({
        where: { id: userId },
        data: {
            failed_login_count: { increment: 1 },
            locked_until: lockUntil
        }
    })
        .catch(() => null);
}
export async function clearFailedLogins(userId) {
    const prisma = getPrisma();
    await prisma.users
        .update({
        where: { id: userId },
        data: {
            failed_login_count: 0,
            locked_until: null
        }
    })
        .catch(() => null);
}
export async function updateUserPassword(userId, passwordHash, passwordSalt) {
    const prisma = getPrisma();
    const updated = await prisma.users
        .update({
        where: { id: userId },
        data: {
            password_hash: passwordHash,
            password_salt: passwordSalt,
            two_factor_enabled: true
        }
    })
        .catch(() => null);
    return Boolean(updated);
}
export async function clearUserTwoFactor(userId) {
    const prisma = getPrisma();
    const updated = await prisma.users
        .update({
        where: { id: userId },
        data: {
            password_hash: "",
            password_salt: "",
            two_factor_enabled: false
        }
    })
        .catch(() => null);
    return Boolean(updated);
}
export async function updateUserAccount(userId, updates) {
    const prisma = getPrisma();
    const data = {};
    if (Object.prototype.hasOwnProperty.call(updates, "avatar")) {
        data.avatar = updates.avatar ?? null;
    }
    if (typeof updates.first_name === "string") {
        data.first_name = updates.first_name;
    }
    if (typeof updates.last_name === "string") {
        data.last_name = updates.last_name;
    }
    if (typeof updates.bio === "string") {
        data.bio = updates.bio;
    }
    if (typeof updates.profile_public === "boolean") {
        data.profile_public = updates.profile_public;
    }
    if (typeof updates.allow_direct === "boolean") {
        data.allow_direct = updates.allow_direct;
    }
    if (typeof updates.allow_group_invite === "boolean") {
        data.allow_group_invite = updates.allow_group_invite;
    }
    if (updates.privacy_defaults) {
        const current = await prisma.users.findUnique({ where: { id: userId } });
        const privacy = {
            ...DEFAULT_PRIVACY,
            ...parseJsonValue(current?.privacy_defaults, {}),
            ...updates.privacy_defaults
        };
        data.privacy_defaults = stringifyJsonValue(privacy);
    }
    const updated = await prisma.users
        .update({
        where: { id: userId },
        data
    })
        .catch(() => null);
    return normalizeUser(updated);
}
export async function updatePrivacyOverride(userId, targetUsername, updates) {
    const prisma = getPrisma();
    const current = await prisma.users.findUnique({ where: { id: userId } });
    if (!current) {
        return null;
    }
    const overrides = parseJsonValue(current.privacy_overrides, {});
    overrides[targetUsername] = {
        ...(overrides[targetUsername] || {}),
        ...updates
    };
    const updated = await prisma.users.update({
        where: { id: userId },
        data: { privacy_overrides: stringifyJsonValue(overrides) }
    });
    return normalizeUser(updated);
}
export async function deleteUserAndData(userId) {
    const prisma = getPrisma();
    const deleted = await prisma.users
        .delete({ where: { id: userId } })
        .catch(() => null);
    return Boolean(deleted);
}
export async function createSession(userId, token, deviceId, deviceName, ip, accessExpiresAt, refreshToken, refreshExpiresAt) {
    const prisma = getPrisma();
    const now = Date.now();
    const created = await prisma.sessions.create({
        data: {
            token_hash: hashToken(token),
            user_id: userId,
            device_id: deviceId,
            device_name: deviceName,
            ip,
            last_seen_at: toDbTime(now),
            created_at: toDbTime(now),
            access_expires_at: toDbTime(accessExpiresAt),
            refresh_token_hash: hashToken(refreshToken),
            refresh_expires_at: toDbTime(refreshExpiresAt),
            rotated_at: toDbTime(now)
        }
    });
    return normalizeSessionRow(created);
}
export async function findSession(token) {
    const prisma = getPrisma();
    const session = await prisma.sessions.findUnique({ where: { token_hash: hashToken(token) } });
    return session ? normalizeSessionRow(session) : null;
}
export async function findSessionByRefreshToken(token) {
    const prisma = getPrisma();
    const session = await prisma.sessions.findFirst({
        where: { refresh_token_hash: hashToken(token) }
    });
    return session ? normalizeSessionRow(session) : null;
}
export async function rotateSessionTokens(sessionTokenHash, newAccessToken, newAccessExpiresAt, newRefreshToken, newRefreshExpiresAt) {
    const prisma = getPrisma();
    const updated = await prisma.sessions
        .update({
        where: { token_hash: sessionTokenHash },
        data: {
            token_hash: hashToken(newAccessToken),
            access_expires_at: toDbTime(newAccessExpiresAt),
            refresh_token_hash: hashToken(newRefreshToken),
            refresh_expires_at: toDbTime(newRefreshExpiresAt),
            rotated_at: toDbTime(Date.now())
        }
    })
        .catch(() => null);
    return updated ? normalizeSessionRow(updated) : null;
}
export async function listSessionsForUser(userId) {
    const prisma = getPrisma();
    const sessions = await prisma.sessions.findMany({ where: { user_id: userId } });
    return sessions.map((row) => normalizeSessionRow(row));
}
export async function updateSessionLastSeen(token) {
    const prisma = getPrisma();
    await prisma.sessions
        .update({
        where: { token_hash: hashToken(token) },
        data: { last_seen_at: toDbTime(Date.now()) }
    })
        .catch(() => null);
}
export async function removeSessionsForUser(userId) {
    const prisma = getPrisma();
    await prisma.sessions.deleteMany({ where: { user_id: userId } });
}
export async function removeSessionForDevice(userId, deviceId) {
    const prisma = getPrisma();
    await prisma.sessions.deleteMany({
        where: { user_id: userId, device_id: deviceId }
    });
}
export async function updateUserProfile(userId, username, ip, info) {
    const prisma = getPrisma();
    const now = Date.now();
    const entry = {
        ip,
        userAgent: info.userAgent || "",
        platform: info.platform || "",
        language: info.language || "",
        deviceModel: info.deviceModel || "",
        at: now
    };
    const existing = await prisma.user_profiles.findUnique({
        where: { user_id: userId }
    });
    const history = parseJsonValue(existing?.history, []);
    history.push(entry);
    const trimmed = history.slice(-20);
    const data = {
        user_id: userId,
        username,
        last_ip: entry.ip,
        last_user_agent: entry.userAgent,
        last_platform: entry.platform,
        last_language: entry.language,
        last_device_model: entry.deviceModel,
        last_seen_at: toDbTime(entry.at),
        history: stringifyJsonValue(trimmed)
    };
    const profile = existing
        ? await prisma.user_profiles.update({
            where: { user_id: userId },
            data
        })
        : await prisma.user_profiles.create({ data });
    return {
        ...profile,
        last_seen_at: fromDbTimeValue(profile.last_seen_at),
        history: parseJsonValue(profile.history, [])
    };
}
export async function readUserProfileByUserId(userId) {
    const prisma = getPrisma();
    const profile = await prisma.user_profiles.findUnique({
        where: { user_id: userId }
    });
    if (!profile) {
        return null;
    }
    return {
        ...profile,
        last_seen_at: fromDbTimeValue(profile.last_seen_at),
        history: parseJsonValue(profile.history, [])
    };
}
export async function readUserProfileByUsername(username) {
    const prisma = getPrisma();
    const profile = await prisma.user_profiles.findFirst({
        where: { username }
    });
    if (!profile) {
        return null;
    }
    return {
        ...profile,
        last_seen_at: fromDbTimeValue(profile.last_seen_at),
        history: parseJsonValue(profile.history, [])
    };
}
export async function createConversation(type, name, ownerId, memberIds, visibility = "public") {
    const prisma = getPrisma();
    const now = Date.now();
    const conversation = await prisma.conversations.create({
        data: {
            type,
            name,
            owner_id: ownerId,
            visibility,
            created_at: toDbTime(now)
        }
    });
    const membershipIds = new Set(memberIds.concat(ownerId));
    await prisma.memberships.createMany({
        data: Array.from(membershipIds).map((user_id) => ({
            conversation_id: conversation.id,
            user_id,
            role: user_id === ownerId ? "owner" : "member",
            permissions: user_id === ownerId
                ? stringifyJsonValue({ manage_members: true, manage_invites: true })
                : undefined
        }))
    });
    return normalizeConversationRow(conversation);
}
export async function getConversationById(conversationId) {
    const prisma = getPrisma();
    const conversation = await prisma.conversations.findUnique({
        where: { id: conversationId }
    });
    if (!conversation) {
        return null;
    }
    return {
        ...conversation,
        quiet_hours: parseJsonValue(conversation.quiet_hours, null)
    };
}
export async function getConversationSettings(conversationId) {
    const prisma = getPrisma();
    const conversation = await prisma.conversations.findUnique({
        where: { id: conversationId },
        select: { forward_enabled: true, quiet_hours: true }
    });
    if (!conversation) {
        return null;
    }
    return {
        forward_enabled: Boolean(conversation.forward_enabled),
        quiet_hours: parseJsonValue(conversation.quiet_hours, null)
    };
}
export async function updateConversationSettings(conversationId, settings) {
    const prisma = getPrisma();
    await prisma.conversations.update({
        where: { id: conversationId },
        data: {
            forward_enabled: Boolean(settings.forward_enabled),
            quiet_hours: stringifyJsonValue(settings.quiet_hours)
        }
    });
}
export async function listConversations() {
    const prisma = getPrisma();
    const conversations = await prisma.conversations.findMany();
    return conversations.map((conversation) => ({
        ...conversation,
        quiet_hours: parseJsonValue(conversation.quiet_hours, null)
    }));
}
export async function listConversationsForUser(userId) {
    const prisma = getPrisma();
    const memberships = await prisma.memberships.findMany({
        where: { user_id: userId },
        include: { conversation: true }
    });
    return memberships.map((member) => {
        const convo = member.conversation;
        return {
            ...convo,
            quiet_hours: parseJsonValue(convo.quiet_hours, null)
        };
    });
}
export async function deleteConversation(conversationId) {
    const prisma = getPrisma();
    const deleted = await prisma.conversations
        .delete({ where: { id: conversationId } })
        .catch(() => null);
    return Boolean(deleted);
}
export async function getMembership(conversationId, userId) {
    const prisma = getPrisma();
    const membership = await prisma.memberships.findFirst({
        where: { conversation_id: conversationId, user_id: userId }
    });
    if (!membership) {
        return null;
    }
    return {
        conversation_id: membership.conversation_id,
        user_id: membership.user_id,
        role: membership.role,
        permissions: parseJsonValue(membership.permissions, undefined)
    };
}
export async function isMember(conversationId, userId) {
    const membership = await getMembership(conversationId, userId);
    return Boolean(membership);
}
export async function listMembers(conversationId) {
    const prisma = getPrisma();
    const memberships = await prisma.memberships.findMany({
        where: { conversation_id: conversationId },
        include: { user: true }
    });
    return memberships.map((member) => normalizeUser(member.user));
}
export async function listMemberships(conversationId) {
    const prisma = getPrisma();
    const memberships = await prisma.memberships.findMany({
        where: { conversation_id: conversationId },
        include: { user: true }
    });
    return memberships.map((member) => {
        const permissions = parseJsonValue(member.permissions, undefined);
        return {
            user: { id: member.user.id, username: member.user.username },
            role: member.role,
            permissions: permissions ?? null
        };
    });
}
export async function addMember(conversationId, userId, role = "member", permissions = null) {
    const prisma = getPrisma();
    const data = {
        conversation_id: conversationId,
        user_id: userId,
        role
    };
    if (permissions) {
        data.permissions = stringifyJsonValue(permissions);
    }
    else if (role === "admin") {
        data.permissions = stringifyJsonValue({
            manage_members: true,
            manage_invites: true
        });
    }
    const created = await prisma.memberships.create({ data });
    return {
        conversation_id: created.conversation_id,
        user_id: created.user_id,
        role: created.role,
        permissions: parseJsonValue(created.permissions, undefined)
    };
}
export async function removeMember(conversationId, userId) {
    const prisma = getPrisma();
    await prisma.memberships.deleteMany({
        where: { conversation_id: conversationId, user_id: userId }
    });
    return true;
}
export async function updateMemberRole(conversationId, userId, role, permissions) {
    const prisma = getPrisma();
    await prisma.memberships.updateMany({
        where: { conversation_id: conversationId, user_id: userId },
        data: {
            role,
            permissions: stringifyJsonValue(permissions ||
                (role === "admin"
                    ? { manage_members: true, manage_invites: true }
                    : null))
        }
    });
    return true;
}
export async function createInvite(conversationId, createdBy, maxUses, expiresAt) {
    const prisma = getPrisma();
    const token = crypto.randomBytes(12).toString("hex");
    const created = await prisma.invites.create({
        data: {
            conversation_id: conversationId,
            token,
            max_uses: maxUses,
            uses: 0,
            expires_at: expiresAt ? toDbTime(expiresAt) : null,
            created_by: createdBy,
            created_at: toDbTime(Date.now()),
            revoked: false
        }
    });
    return normalizeInviteRow(created);
}
export async function listInvites(conversationId) {
    const prisma = getPrisma();
    const invites = await prisma.invites.findMany({
        where: { conversation_id: conversationId }
    });
    return invites.map((row) => normalizeInviteRow(row));
}
export async function findInviteByToken(token) {
    const prisma = getPrisma();
    const invite = await prisma.invites.findUnique({ where: { token } });
    return invite ? normalizeInviteRow(invite) : null;
}
export async function revokeInvite(token) {
    const prisma = getPrisma();
    await prisma.invites
        .update({
        where: { token },
        data: { revoked: true }
    })
        .catch(() => null);
    return true;
}
export async function redeemInvite(token, userId) {
    const prisma = getPrisma();
    const invite = await prisma.invites.findUnique({ where: { token } });
    if (!invite) {
        return null;
    }
    if (invite.revoked) {
        return null;
    }
    if (invite.expires_at && invite.expires_at < Date.now()) {
        return null;
    }
    if (invite.uses >= invite.max_uses) {
        return null;
    }
    const existing = await prisma.memberships.findFirst({
        where: { conversation_id: invite.conversation_id, user_id: userId }
    });
    if (!existing) {
        await prisma.memberships.create({
            data: {
                conversation_id: invite.conversation_id,
                user_id: userId,
                role: "member"
            }
        });
    }
    const updated = await prisma.invites.update({
        where: { token },
        data: { uses: invite.uses + 1 }
    });
    return updated;
}
export async function createMessage(groupId, conversationId, senderId, senderDeviceId, recipientId, recipientDeviceId, ciphertext, nonce, sizeBytes) {
    const prisma = getPrisma();
    const created = await prisma.messages.create({
        data: {
            group_id: groupId,
            conversation_id: conversationId,
            sender_id: senderId,
            sender_device_id: senderDeviceId,
            recipient_id: recipientId,
            recipient_device_id: recipientDeviceId,
            ciphertext,
            nonce,
            size_bytes: sizeBytes,
            created_at: toDbTime(Date.now()),
            delivered_at: null,
            read_at: null,
            deleted_at: null,
            deleted_by: null
        }
    });
    return normalizeMessageRow(created);
}
export async function pollMessages(userId, deviceId, since, sinceId, limit) {
    const prisma = getPrisma();
    const rows = await prisma.messages.findMany({
        where: {
            recipient_id: userId,
            recipient_device_id: deviceId,
            deleted_at: null,
            OR: [
                { created_at: { gt: toDbTime(since) } },
                ...(sinceId
                    ? [{ created_at: toDbTime(since), id: { gt: sinceId } }]
                    : [])
            ]
        },
        orderBy: [{ created_at: "asc" }, { id: "asc" }],
        take: limit,
        include: {
            sender: {
                select: { username: true }
            }
        }
    });
    return rows.map((row) => normalizeMessageRow(row));
}
export async function listMessagesBefore(
  conversationId,
  recipientId,
  recipientDeviceId,
  senderId,
  before,
  limit
) {
    const prisma = getPrisma();
    const rows = await prisma.messages.findMany({
        where: {
            conversation_id: conversationId,
            OR: [
                {
                    recipient_id: recipientId,
                    recipient_device_id: recipientDeviceId
                },
                {
                    sender_id: senderId
                }
            ],
            created_at: { lt: toDbTime(before) },
            deleted_at: null
        },
        orderBy: [{ created_at: "desc" }, { id: "desc" }],
        take: limit,
        include: {
            sender: {
                select: { username: true }
            }
        }
    });
    const seenGroups = new Set();
    const deduped = [];
    for (const row of rows) {
        if (seenGroups.has(row.group_id)) {
            continue;
        }
        seenGroups.add(row.group_id);
        deduped.push(row);
    }
    return deduped.reverse().map((row) => normalizeMessageRow(row));
}
export async function markDelivered(messageIds) {
    const prisma = getPrisma();
    const now = toDbTime(Date.now());
    await prisma.messages.updateMany({
        where: { id: { in: messageIds }, delivered_at: null },
        data: { delivered_at: now }
    });
}
export async function markRead(conversationId, userId) {
    const prisma = getPrisma();
    const now = toDbTime(Date.now());
    await prisma.messages.updateMany({
        where: {
            conversation_id: conversationId,
            recipient_id: userId,
            read_at: null
        },
        data: { read_at: now }
    });
}
export async function listSentStatuses(senderId, senderDeviceId, since, limit) {
    const prisma = getPrisma();
    const rows = await prisma.messages.findMany({
        where: {
            sender_id: senderId,
            sender_device_id: senderDeviceId,
            created_at: { gt: toDbTime(since) }
        },
        orderBy: { created_at: "asc" },
        take: limit
    });
    return rows.map((row) => normalizeMessageRow(row));
}
export async function deleteMessageForAll(groupId, userId) {
    const prisma = getPrisma();
    const now = toDbTime(Date.now());
    await prisma.messages.updateMany({
        where: { group_id: groupId, deleted_at: null },
        data: { deleted_at: now, deleted_by: userId }
    });
    return true;
}
export async function deleteMessageForSelf(messageId, userId) {
    const prisma = getPrisma();
    const now = toDbTime(Date.now());
    await prisma.messages.updateMany({
        where: { id: messageId, recipient_id: userId, deleted_at: null },
        data: { deleted_at: now, deleted_by: userId }
    });
    return true;
}
export async function createScheduledBatch(input) {
    const prisma = getPrisma();
    const created = await prisma.scheduled_messages.create({
        data: {
            conversation_id: input.conversationId,
            sender_id: input.senderId,
            sender_device_id: input.senderDeviceId,
            scheduled_for: toDbTime(input.scheduledFor),
            created_at: toDbTime(Date.now()),
            payloads: stringifyJsonValue(input.payloads)
        }
    });
    return {
        ...created,
        scheduled_for: fromDbTimeValue(created.scheduled_for),
        created_at: fromDbTimeValue(created.created_at),
        payloads: parseJsonValue(created.payloads, [])
    };
}
export async function listDueScheduled(now) {
    const prisma = getPrisma();
    const rows = await prisma.scheduled_messages.findMany({
        where: { scheduled_for: { lte: toDbTime(now) } },
        orderBy: { scheduled_for: "asc" }
    });
    return rows.map((row) => ({
        id: row.id,
        conversation_id: row.conversation_id,
        sender_id: row.sender_id,
        sender_device_id: row.sender_device_id,
        scheduled_for: row.scheduled_for,
        created_at: row.created_at,
        payloads: parseJsonValue(row.payloads, [])
    }));
}
export async function removeScheduledBatch(id) {
    const prisma = getPrisma();
    await prisma.scheduled_messages.delete({ where: { id } }).catch(() => null);
}
export async function setUserKeyBundle(userId, input) {
    const prisma = getPrisma();
    const existing = await prisma.user_key_bundles.findFirst({
        where: { user_id: userId, session_device_id: input.sessionDeviceId }
    });
    const data = {
        user_id: userId,
        session_device_id: input.sessionDeviceId,
        registration_id: input.registrationId,
        device_id: input.deviceId,
        identity_key: input.identityKey,
        signed_prekey_id: input.signedPreKeyId,
        signed_prekey: input.signedPreKey,
        signed_prekey_sig: input.signedPreKeySig,
        fallback_public_key: input.fallbackPublicKey || "",
        one_time_prekeys: stringifyJsonValue(input.oneTimePreKeys),
        updated_at: toDbTime(Date.now())
    };
    const row = existing
        ? await prisma.user_key_bundles.update({ where: { id: existing.id }, data })
        : await prisma.user_key_bundles.create({ data });
    return row;
}
export async function listUserKeyBundles(userId) {
    const prisma = getPrisma();
    const rows = await prisma.user_key_bundles.findMany({ where: { user_id: userId } });
    return rows.map((row) => ({
        ...row,
        one_time_prekeys: parseJsonValue(row.one_time_prekeys, [])
    }));
}
export async function findUserKeyBundleBySession(userId, sessionDeviceId) {
    const prisma = getPrisma();
    const row = await prisma.user_key_bundles.findFirst({
        where: { user_id: userId, session_device_id: sessionDeviceId }
    });
    if (!row) {
        return null;
    }
    return {
        ...row,
        one_time_prekeys: parseJsonValue(row.one_time_prekeys, [])
    };
}
export async function popOneTimePreKey(userId, sessionDeviceId) {
    const prisma = getPrisma();
    const bundle = await prisma.user_key_bundles.findFirst({
        where: { user_id: userId, session_device_id: sessionDeviceId }
    });
    if (!bundle) {
        return null;
    }
    const preKeys = parseJsonValue(bundle.one_time_prekeys, []);
    if (!preKeys.length) {
        return null;
    }
    const key = preKeys.shift();
    await prisma.user_key_bundles.update({
        where: { id: bundle.id },
        data: { one_time_prekeys: stringifyJsonValue(preKeys), updated_at: toDbTime(Date.now()) }
    });
    return key;
}
export async function createReport(input) {
    const prisma = getPrisma();
    const created = await prisma.reports.create({
        data: {
            reporter_id: input.reporterId,
            reported_user_id: input.reportedUserId,
            conversation_id: input.conversationId,
            message_id: input.messageId,
            group_id: input.groupId,
            reason: input.reason,
            evidence: stringifyJsonValue(input.evidence),
            created_at: toDbTime(Date.now()),
            status: "open",
            reviewed_at: null,
            action: null
        }
    });
    return normalizeReportRow(created);
}
export async function listReports() {
    const prisma = getPrisma();
    const rows = await prisma.reports.findMany({ orderBy: { created_at: "desc" } });
    return rows.map((row) => normalizeReportRow(row));
}
export async function findReportById(reportId) {
    const prisma = getPrisma();
    const row = await prisma.reports.findUnique({ where: { id: reportId } });
    if (!row) {
        return null;
    }
    return normalizeReportRow(row);
}
export async function updateReportStatus(reportId, status, action) {
    const prisma = getPrisma();
    const updated = await prisma.reports
        .update({
        where: { id: reportId },
        data: {
            status,
            action,
            reviewed_at: toDbTime(Date.now())
        }
    })
        .catch(() => null);
    if (!updated) {
        return null;
    }
    return normalizeReportRow(updated);
}
export async function createBlockedEvent(input) {
    const prisma = getPrisma();
    const created = await prisma.blocked_events.create({
        data: {
            conversation_id: input.conversationId,
            user_id: input.userId,
            reason: input.reason,
            metadata: stringifyJsonValue(input.metadata ?? null),
            created_at: toDbTime(Date.now())
        }
    });
    return normalizeBlockedEventRow(created);
}
export async function listBlockedEvents(limit = 200) {
    const prisma = getPrisma();
    const rows = await prisma.blocked_events.findMany({
        orderBy: { created_at: "desc" },
        take: Math.min(Math.max(limit, 1), 500),
        include: { user: true, conversation: true }
    });
    return rows.map((row) => normalizeBlockedEventRow(row));
}
export async function createSocialPost(input) {
    const prisma = getPrisma();
    const created = await prisma.social_posts.create({
        data: {
            user_id: input.userId,
            kind: input.kind,
            media_url: input.mediaUrl,
            media_type: input.mediaType,
            caption: input.caption,
            tags: stringifyJsonValue(input.tags),
            visibility: input.visibility,
            allowed_user_ids: stringifyJsonValue(input.allowedUserIds),
            comment_visibility: input.commentVisibility,
            created_at: toDbTime(Date.now()),
            publish_at: input.publishAt ? toDbTime(input.publishAt) : null,
            expires_at: input.expiresAt ? toDbTime(input.expiresAt) : null
        }
    });
    return normalizeSocialPost(created);
}
export async function findSocialPostById(postId) {
    const prisma = getPrisma();
    const row = await prisma.social_posts.findUnique({ where: { id: postId } });
    return row ? normalizeSocialPost(row) : null;
}
export async function listSocialFeed(input) {
    const prisma = getPrisma();
    const now = Date.now();
    const nowDb = toDbTime(now);
    const posts = await prisma.social_posts.findMany({
        where: {
            kind: input.kind,
            created_at: input.before ? { lt: toDbTime(input.before) } : undefined,
            AND: [
                {
                    OR: [{ publish_at: null }, { publish_at: { lte: nowDb } }]
                },
                {
                    OR: [{ expires_at: null }, { expires_at: { gt: nowDb } }]
                }
            ]
        },
        orderBy: { created_at: "desc" },
        take: input.limit ?? 50,
        include: { user: true }
    });
    const normalized = posts.map((post) => normalizeSocialPost(post));
    const authorByPostId = new Map();
    for (const row of posts) {
        authorByPostId.set(row.id, normalizeUser(row.user));
    }
    const filtered = normalized.filter((post) => {
        if (!input.viewerId) {
            return post.visibility === "public";
        }
        if (post.user_id === input.viewerId) {
            return true;
        }
        if (post.visibility === "public") {
            return true;
        }
        return post.allowed_user_ids.includes(input.viewerId);
    });
    const postIds = filtered.map((post) => post.id);
    const [likes, comments, views, saved, saves] = await Promise.all([
        prisma.social_likes.findMany({ where: { post_id: { in: postIds } } }),
        prisma.social_comments.findMany({ where: { post_id: { in: postIds } } }),
        prisma.social_views.findMany({ where: { post_id: { in: postIds } } }),
        input.viewerId
            ? prisma.social_saves.findMany({ where: { post_id: { in: postIds }, user_id: input.viewerId } })
            : Promise.resolve([]),
        prisma.social_saves.findMany({ where: { post_id: { in: postIds } } })
    ]);
    const likeCounts = new Map();
    for (const like of likes) {
        likeCounts.set(like.post_id, (likeCounts.get(like.post_id) || 0) + 1);
    }
    const commentCounts = new Map();
    for (const comment of comments) {
        commentCounts.set(comment.post_id, (commentCounts.get(comment.post_id) || 0) + 1);
    }
    const viewCounts = new Map();
    for (const view of views) {
        viewCounts.set(view.post_id, (viewCounts.get(view.post_id) || 0) + 1);
    }
    const saveCounts = new Map();
    for (const save of saves) {
        saveCounts.set(save.post_id, (saveCounts.get(save.post_id) || 0) + 1);
    }
    const savedSet = new Set(saved.map((row) => row.post_id));
    const mapped = filtered.map((post) => ({
        post,
        author: authorByPostId.get(post.id),
        counts: {
            likes: likeCounts.get(post.id) || 0,
            comments: commentCounts.get(post.id) || 0,
            views: viewCounts.get(post.id) || 0,
            saves: saveCounts.get(post.id) || 0
        },
        viewer: {
            liked: input.viewerId
                ? likes.some((row) => row.post_id === post.id && row.user_id === input.viewerId)
                : false,
            saved: input.viewerId ? savedSet.has(post.id) : false
        }
    }));
    if (input.sort === "trending") {
        const scored = mapped.map((item) => {
            const ageHours = Math.max(1, (now - item.post.created_at) / (1000 * 60 * 60));
            const score = item.counts.likes * 3 +
                item.counts.comments * 4 +
                item.counts.views * 1 +
                item.counts.saves * 2;
            const decayed = score / Math.max(1, Math.pow(ageHours + 2, 1.2));
            return { item, score: decayed };
        });
        scored.sort((a, b) => b.score - a.score);
        return scored.map((row) => row.item);
    }
    return mapped;
}
export async function listSocialStories(input) {
    const prisma = getPrisma();
    const now = Date.now();
    const nowDb = toDbTime(now);
    const posts = await prisma.social_posts.findMany({
        where: {
            kind: "story",
            AND: [
                { OR: [{ publish_at: null }, { publish_at: { lte: nowDb } }] },
                { OR: [{ expires_at: null }, { expires_at: { gt: nowDb } }] }
            ]
        },
        orderBy: { created_at: "desc" },
        take: input.limit,
        include: { user: true }
    });
    const normalized = posts.map((post) => normalizeSocialPost(post));
    const authorByPostId = new Map();
    for (const row of posts) {
        authorByPostId.set(row.id, normalizeUser(row.user));
    }
    const filtered = normalized.filter((post) => {
        if (!input.viewerId) {
            return post.visibility === "public";
        }
        if (post.user_id === input.viewerId) {
            return true;
        }
        if (post.visibility === "public") {
            return true;
        }
        return post.allowed_user_ids.includes(input.viewerId);
    });
    const postIds = filtered.map((post) => post.id);
    const viewed = input.viewerId
        ? await prisma.social_views.findMany({
            where: { post_id: { in: postIds }, user_id: input.viewerId }
        })
        : [];
    const viewedSet = new Set(viewed.map((row) => row.post_id));
    return filtered.map((post) => ({
        post,
        author: authorByPostId.get(post.id),
        viewerViewed: viewedSet.has(post.id)
    }));
}
export async function toggleSocialLike(postId, userId) {
    const prisma = getPrisma();
    const existing = await prisma.social_likes.findFirst({
        where: { post_id: postId, user_id: userId }
    });
    if (existing) {
        await prisma.social_likes.delete({ where: { id: existing.id } });
        const count = await prisma.social_likes.count({ where: { post_id: postId } });
        return { liked: false, count };
    }
    await prisma.social_likes.create({
        data: { post_id: postId, user_id: userId, created_at: toDbTime(Date.now()) }
    });
    const count = await prisma.social_likes.count({ where: { post_id: postId } });
    return { liked: true, count };
}
export async function toggleSocialSave(postId, userId) {
    const prisma = getPrisma();
    const existing = await prisma.social_saves.findFirst({
        where: { post_id: postId, user_id: userId }
    });
    if (existing) {
        await prisma.social_saves.delete({ where: { id: existing.id } });
        const count = await prisma.social_saves.count({ where: { post_id: postId } });
        return { saved: false, count };
    }
    await prisma.social_saves.create({
        data: { post_id: postId, user_id: userId, created_at: toDbTime(Date.now()) }
    });
    const count = await prisma.social_saves.count({ where: { post_id: postId } });
    return { saved: true, count };
}
export async function addSocialView(postId, userId) {
    const prisma = getPrisma();
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const existing = await prisma.social_views.findFirst({
        where: { post_id: postId, user_id: userId, created_at: { gte: toDbTime(since) } }
    });
    if (!existing) {
        await prisma.social_views.create({
            data: { post_id: postId, user_id: userId, created_at: toDbTime(Date.now()) }
        });
    }
    const count = await prisma.social_views.count({ where: { post_id: postId } });
    return count;
}
export async function addSocialComment(postId, userId, text) {
    const prisma = getPrisma();
    const created = await prisma.social_comments.create({
        data: { post_id: postId, user_id: userId, text, created_at: toDbTime(Date.now()) }
    });
    return normalizeSocialCommentRow(created);
}
export async function listSocialComments(postId) {
    const prisma = getPrisma();
    const comments = await prisma.social_comments.findMany({
        where: { post_id: postId },
        orderBy: { created_at: "asc" },
        include: { user: true }
    });
    return comments.map((row) => ({
        comment: normalizeSocialCommentRow(row),
        author: normalizeUser(row.user)
    }));
}
export async function followUser(followerId, followingId) {
    const prisma = getPrisma();
    const existing = await prisma.social_follows.findFirst({
        where: { follower_id: followerId, following_id: followingId }
    });
    if (existing) {
        return false;
    }
    await prisma.social_follows.create({
        data: { follower_id: followerId, following_id: followingId, created_at: toDbTime(Date.now()) }
    });
    return true;
}
export async function unfollowUser(followerId, followingId) {
    const prisma = getPrisma();
    await prisma.social_follows.deleteMany({
        where: { follower_id: followerId, following_id: followingId }
    });
    return true;
}
export async function listFollows(userId) {
    const prisma = getPrisma();
    const [followers, following] = await Promise.all([
        prisma.social_follows.findMany({ where: { following_id: userId } }),
        prisma.social_follows.findMany({ where: { follower_id: userId } })
    ]);
    return {
        followers: followers.map((row) => row.follower_id),
        following: following.map((row) => row.following_id)
    };
}
export async function listFollowUserIds(userId) {
    return listFollows(userId);
}
export async function areFriends(userId, otherUserId) {
    const prisma = getPrisma();
    const [a, b] = await Promise.all([
        prisma.social_follows.findFirst({ where: { follower_id: userId, following_id: otherUserId } }),
        prisma.social_follows.findFirst({ where: { follower_id: otherUserId, following_id: userId } })
    ]);
    return Boolean(a && b);
}
export async function listSocialNotifications(userId) {
    const prisma = getPrisma();
    const rows = await prisma.social_notifications.findMany({
        where: { user_id: userId },
        orderBy: { created_at: "desc" },
        include: { actor: true, post: true }
    });
    return rows.map((row) => ({
        notification: normalizeSocialNotification(row),
        actor: normalizeUser(row.actor),
        post: row.post ? normalizeSocialPost(row.post) : null
    }));
}
export async function getSocialInsights(userId) {
    const prisma = getPrisma();
    const [posts, reels, stories, likes, comments, saves, views] = await Promise.all([
        prisma.social_posts.count({ where: { user_id: userId, kind: "post" } }),
        prisma.social_posts.count({ where: { user_id: userId, kind: "reel" } }),
        prisma.social_posts.count({ where: { user_id: userId, kind: "story" } }),
        prisma.social_likes.count({
            where: { post: { user_id: userId } }
        }),
        prisma.social_comments.count({
            where: { post: { user_id: userId } }
        }),
        prisma.social_saves.count({
            where: { post: { user_id: userId } }
        }),
        prisma.social_views.count({
            where: { post: { user_id: userId } }
        })
    ]);
    return { posts, reels, stories, likes, comments, saves, views };
}
export async function markSocialNotificationsSeen(userId) {
    const prisma = getPrisma();
    await prisma.social_notifications.updateMany({
        where: { user_id: userId, seen_at: null },
        data: { seen_at: toDbTime(Date.now()) }
    });
}
