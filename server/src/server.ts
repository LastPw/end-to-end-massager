import Fastify from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import websocket from "@fastify/websocket";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import dns from "node:dns/promises";
import net from "node:net";
import type { WebSocket } from "ws";
import { z } from "zod";
import {
  clearUserTwoFactor,
  createAdminSession,
  createAdminUser,
  createConversation,
  createMessage,
  createScheduledBatch,
  createBlockedEvent,
  createReport,
  createSession,
  clearFailedLogins,
  createUser,
  ensureSystemConversation,
  ensureSystemUser,
  addUserToSystemConversation,
  areFriends,
  deleteConversation,
  deleteMessageForAll,
  deleteMessageForSelf,
  deleteUserAndData,
  addMember,
  createInvite,
  createSocialPost,
  findAdminSession,
  findAdminByUsername,
  findUploadedFileByKey,
  findSession,
  findSessionByRefreshToken,
  findReportById,
  findSocialPostById,
  findUserById,
  findUserByPhone,
  findUserByUsername,
  findUserKeyBundleBySession,
  findInviteByToken,
  getMembership,
  ensureDefaultAdmin,
  getAppSetting,
  getConversationById,
  getConversationSettings,
  isMember,
  listMemberships,
  listInvites,
  listConversations,
  listConversationsForUser,
  listBlockedEvents,
  listMessagesBefore,
  listMembers,
  listReports,
  listSocialComments,
  listSocialFeed,
  listSocialNotifications,
  listSocialStories,
  listAdminUsers,
  getSocialInsights,
  listDueScheduled,
  listSentStatuses,
  listSessionsForUser,
  listUserKeyBundles,
  listUsers,
  listUsersByUsernames,
  listFollows,
  listFollowUserIds,
  markDelivered,
  markRead,
  markSocialNotificationsSeen,
  recordFailedLogin,
  registerUploadedFile,
  rotateSessionTokens,
  toggleSocialLike,
  toggleSocialSave,
  addSocialComment,
  addSocialView,
  followUser,
  unfollowUser,
  popOneTimePreKey,
  pollMessages,
  redeemInvite,
  removeSessionForDevice,
  removeSessionsForUser,
  removeMember,
  removeScheduledBatch,
  revokeInvite,
  setUserKeyBundle,
  readUserProfileByUserId,
  updateUserProfile,
  updateReportStatus,
  updateMemberRole,
  updateAdminUserPassword,
  updateAdminUserPermissions,
  updatePrivacyOverride,
  updateSessionLastSeen,
  updateUserAccount,
  updateUserFlags,
  updateUserPassword,
  setAppSetting,
  updateConversationSettings,
  type ConversationType
} from "./db.js";
import { createPresignedDownload, createPresignedUpload, uploadAndScanFile } from "./uploads.js";
import {
  parseBody,
  parseParams,
  parseQuery,
  zBio,
  zCiphertext,
  zConversationId,
  zDeviceId,
  zDeviceInfo,
  zDeviceName,
  zFileName,
  zUploadKey,
  zGroupName,
  zLimit,
  zMessageId,
  zName,
  zNonce,
  zOptionalBoolean,
  zPhone,
  zReason,
  zSince,
  zUrl,
  zUsername,
  zVisibility
} from "./validation.js";

const server = Fastify({ logger: true, bodyLimit: 1024 * 1024 * 1024 });

if (!process.env.APP_MASTER_KEY) {
  throw new Error("APP_MASTER_KEY is required.");
}

await server.register(cors, {
  origin: true,
  credentials: true,
  methods: ["GET", "POST"]
});

const connectSources = ["'self'"];
if (process.env.APP_CONNECT_SRC) {
  connectSources.push(process.env.APP_CONNECT_SRC);
}

await server.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      formAction: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:"],
      styleSrc: ["'self'"],
      connectSrc: connectSources
    }
  },
  hsts:
    process.env.APP_HSTS === "1"
      ? { maxAge: 15552000, includeSubDomains: true, preload: false }
      : false
});

await server.register(rateLimit, {
  global: true,
  max: 300,
  timeWindow: "1 minute"
});

await server.register(multipart, {
  limits: {
    fileSize: 1024 * 1024 * 1024
  }
});

await server.register(websocket);

server.addHook("onSend", (request, reply, payload, done) => {
  reply.header("X-Content-Type-Options", "nosniff");
  reply.header("X-Frame-Options", "DENY");
  reply.header("Referrer-Policy", "no-referrer");
  reply.header("X-Request-Id", request.id);
  reply.header(
    "Permissions-Policy",
    "camera=(self), microphone=(self), geolocation=()"
  );
  reply.header("Cross-Origin-Resource-Policy", "same-origin");
  done(null, payload);
});

const metrics = {
  requests: 0,
  errors: 0,
  decryptFailures: 0,
  latencyMsTotal: 0
};

server.addHook("onResponse", (request, reply, done) => {
  metrics.requests += 1;
  if (reply.statusCode >= 400) {
    metrics.errors += 1;
  }
  metrics.latencyMsTotal += reply.getResponseTime();
  const safeUrl = request.url.startsWith("/ws")
    ? request.url.replace(/\?.*$/, "")
    : request.url;
  server.log.info(
    {
      requestId: request.id,
      method: request.method,
      url: safeUrl,
      statusCode: reply.statusCode,
      responseTime: reply.getResponseTime()
    },
    "request"
  );
  done();
});

server.addHook("preHandler", async (request) => {
  const authHeader = request.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    await updateSessionLastSeen(token);
  }
});

const typingState = new Map<
  number,
  Map<number, { username: string; lastTypedAt: number }>
>();

const TYPING_TTL_MS = 6000;
const USERNAME_RE = /^[a-zA-Z0-9_]{5,32}$/;
const PHONE_RE = /^\+?\d{10,15}$/;
const MAX_MESSAGE_ID = 64;
const MAX_CIPHERTEXT = 1024 * 1024 * 1024;
const MAX_NONCE = 512;
const MAX_GROUP_NAME = 40;
const MAX_BIO = 160;
const MAX_AVATAR = 3 * 1024 * 1024;
const MAX_KEY_FIELD = 5120;
const MAX_PREKEYS = 100;
const MAX_DEVICES = 3;
const ONLINE_WINDOW_MS = 60 * 1000;
const MAX_PAYLOADS = 200;
const MAX_SCHEDULED_DELAY_MS = 30 * 24 * 60 * 60 * 1000;
const CALL_EVENT_TTL_MS = 5 * 60 * 1000;
const MAX_CALL_EVENTS = 1000;
const MAX_LINK_PREVIEW_BYTES = 256 * 1024;
const MAX_SOCIAL_CAPTION = 2200;
const MAX_SOCIAL_COMMENT = 500;
const MAX_MEDIA_URL = 2048;
const ACCESS_TTL_MS = 15 * 60 * 1000;
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const ADMIN_SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const REFRESH_COOKIE_NAME = "messager_refresh";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000;
const GLOBAL_LOCK_KEY = "global_lockdown";
const GLOBAL_LOCK_TTL_MS = 5000;
const SOCIAL_MEDIA_HOSTS = (process.env.SOCIAL_MEDIA_HOSTS || "")
  .split(",")
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);
const S3_PUBLIC_BASE = process.env.S3_PUBLIC_BASE || "";
const ADMIN_PERMISSIONS = [
  "manage_users",
  "manage_conversations",
  "manage_reports",
  "manage_system",
  "manage_settings",
  "manage_social",
  "manage_admins"
] as const;
type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

const zIdParam = z.object({ id: zConversationId }).strict();
const zUsernameParam = z.object({ username: zUsername }).strict();
const zToken = z.string().min(8).max(128);
const zDeviceIdParam = z.object({ deviceId: zDeviceId }).strict();
const zNumericIdParam = z.object({ id: z.coerce.number().int().positive() }).strict();
const STORY_TTL_MS = 24 * 60 * 60 * 1000;
const REPORT_REASONS = new Set([
  "porn",
  "dangerous_link",
  "threat",
  "abuse"
]);

type CallEvent = {
  id: number;
  callId: string;
  targetUserId: number;
  targetDeviceId: string;
  type: "offer" | "answer" | "ice" | "end";
  payload: Record<string, unknown>;
  createdAt: number;
};

type CallSession = {
  callId: string;
  conversationId: number;
  fromUserId: number;
  fromUsername: string;
  fromDeviceId: string;
  toUserId: number;
  toUsername: string;
  toDeviceId: string;
  media: "audio" | "video";
  createdAt: number;
};

const callEvents: CallEvent[] = [];
const callSessions = new Map<string, CallSession>();
const wsClients = new Map<string, Set<WebSocket>>();
const WS_HEARTBEAT_MS = 30000;
const wsTickets = new Map<string, { userId: number; deviceId: string; expiresAt: number }>();
const WS_TICKET_TTL_MS = 60 * 1000;

function isAllowedMediaUrl(value: string, requestHost: string): boolean {
  if (!value || value.length > MAX_MEDIA_URL) {
    return false;
  }
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const host = parsed.hostname.toLowerCase();
    if (host === requestHost.toLowerCase()) {
      return true;
    }
    if (S3_PUBLIC_BASE) {
      try {
        const baseHost = new URL(S3_PUBLIC_BASE).hostname.toLowerCase();
        if (host === baseHost) {
          return true;
        }
      } catch {
        // ignore invalid base
      }
    }
    return SOCIAL_MEDIA_HOSTS.includes(host);
  } catch {
    return false;
  }
}

function wsKey(userId: number, deviceId: string): string {
  return `${userId}:${deviceId}`;
}

function registerSocket(userId: number, deviceId: string, socket: WebSocket) {
  const key = wsKey(userId, deviceId);
  if (!wsClients.has(key)) {
    wsClients.set(key, new Set());
  }


  (socket as WebSocket & { isAlive?: boolean }).isAlive = true;
  socket.on("pong", () => {
    (socket as WebSocket & { isAlive?: boolean }).isAlive = true;
  });
  wsClients.get(key)!.add(socket);
  socket.on("close", () => {
    const set = wsClients.get(key);
    if (!set) {
      return;
    }
    set.delete(socket);
    if (set.size === 0) {
      wsClients.delete(key);
    }
  });
}

function issueWsTicket(userId: number, deviceId: string): string {
  const now = Date.now();
  for (const [ticket, value] of wsTickets.entries()) {
    if (value.expiresAt <= now) {
      wsTickets.delete(ticket);
    }
  }
  const ticket = crypto.randomBytes(18).toString("hex");
  wsTickets.set(ticket, {
    userId,
    deviceId,
    expiresAt: now + WS_TICKET_TTL_MS
  });
  return ticket;
}

function consumeWsTicket(ticket: string): { userId: number; deviceId: string } | null {
  const entry = wsTickets.get(ticket);
  if (!entry) {
    return null;
  }
  wsTickets.delete(ticket);
  if (entry.expiresAt <= Date.now()) {
    return null;
  }
  return {
    userId: entry.userId,
    deviceId: entry.deviceId
  };
}

function startWsHeartbeat() {
  setInterval(() => {
    for (const sockets of wsClients.values()) {
      for (const socket of sockets) {
        const tracked = socket as WebSocket & { isAlive?: boolean };
        if (tracked.isAlive === false) {
          try {
            socket.terminate();
          } catch {}
          sockets.delete(socket);
          continue;
        }
        tracked.isAlive = false;
        try {
          socket.ping();
        } catch {}
      }
    }
  }, WS_HEARTBEAT_MS);
}

startWsHeartbeat();


function sendWs(userId: number, deviceId: string, payload: unknown) {
  const data = JSON.stringify(payload);
  if (deviceId === "*") {
    for (const [key, sockets] of wsClients.entries()) {
      if (!key.startsWith(`${userId}:`)) {
        continue;
      }
      for (const socket of sockets) {
        try {
          socket.send(data);
        } catch {
          // ignore
        }
      }
    }
    return;
  }
  const key = wsKey(userId, deviceId);
  const sockets = wsClients.get(key);
  if (!sockets) {
    return;
  }
  for (const socket of sockets) {
    try {
      socket.send(data);
    } catch {
      // ignore
    }
  }
}

function canViewSocialPost(
  post: { user_id: number; visibility: "public" | "private"; allowed_user_ids: number[] },
  viewerId: number
): boolean {
  if (post.visibility === "public") {
    return true;
  }
  if (post.user_id === viewerId) {
    return true;
  }
  return post.allowed_user_ids?.includes(viewerId) ?? false;
}

function pushCallEvent(event: CallEvent): void {
  callEvents.push(event);
  const cutoff = Date.now() - CALL_EVENT_TTL_MS;
  while (callEvents.length > MAX_CALL_EVENTS) {
    callEvents.shift();
  }
  while (callEvents.length && callEvents[0].createdAt < cutoff) {
    callEvents.shift();
  }
}

async function deliverScheduledBatch(batch: {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_device_id: string;
  scheduled_for: number;
  payloads: Array<{
    message_id: string;
    to_username: string;
    to_device_id: string;
    ciphertext: string;
    nonce: string;
  }>;
}) {
  const conversation = await getConversationById(batch.conversation_id);
  if (!conversation) {
    return;
  }

  const sender = await findUserById(batch.sender_id);
  if (!sender) {
    return;
  }

  const members = await listMembers(batch.conversation_id);
  const memberUsernames = new Set(members.map((member) => member.username));

  for (const payload of batch.payloads) {
    if (!memberUsernames.has(payload.to_username)) {
      continue;
    }
    const recipient = await findUserByUsername(payload.to_username);
    if (!recipient) {
      continue;
    }
    const stored = await createMessage(
      payload.message_id,
      batch.conversation_id,
      batch.sender_id,
      batch.sender_device_id,
      recipient.id,
      payload.to_device_id,
      payload.ciphertext,
      payload.nonce,
      payload.ciphertext.length
    );
    sendWs(recipient.id, payload.to_device_id, {
      type: "message",
      message: {
        id: stored.id,
        group_id: stored.group_id,
        conversation_id: stored.conversation_id,
        sender_username: sender.username,
        sender_device_id: stored.sender_device_id,
        ciphertext: stored.ciphertext,
        nonce: stored.nonce,
        created_at: stored.created_at,
        delivered_at: stored.delivered_at,
        read_at: stored.read_at,
        deleted_at: stored.deleted_at,
        deleted_by: stored.deleted_by
      }
    });
  }
}

let scheduledFlushActive = false;
async function flushScheduledBatches(): Promise<void> {
  if (scheduledFlushActive) {
    return;
  }
  scheduledFlushActive = true;
  try {
    const due = await listDueScheduled(Date.now());
    for (const batch of due) {
      await deliverScheduledBatch(batch);
      await removeScheduledBatch(batch.id);
    }
  } finally {
    scheduledFlushActive = false;
  }
}

function generateToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

function parseCookies(header?: string): Record<string, string> {
  if (!header) {
    return {};
  }
  return header.split(";").reduce<Record<string, string>>((acc, part) => {
    const index = part.indexOf("=");
    if (index <= 0) {
      return acc;
    }
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (!key) {
      return acc;
    }
    acc[key] = decodeURIComponent(value);
    return acc;
  }, {});
}

function appendCookie(reply: FastifyReply, cookie: string): void {
  const current = reply.getHeader("Set-Cookie");
  if (!current) {
    reply.header("Set-Cookie", cookie);
    return;
  }
  const next = Array.isArray(current) ? [...current, cookie] : [String(current), cookie];
  reply.header("Set-Cookie", next);
}

function isSecureRequest(request: FastifyRequest): boolean {
  const proto = request.headers["x-forwarded-proto"];
  if (typeof proto === "string") {
    return proto.split(",")[0].trim().toLowerCase() === "https";
  }
  return process.env.NODE_ENV === "production";
}

function serializeRefreshCookie(
  token: string,
  maxAgeMs: number,
  secure: boolean
): string {
  const parts = [
    `${REFRESH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${Math.max(0, Math.floor(maxAgeMs / 1000))}`
  ];
  if (secure) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

function setRefreshCookie(reply: FastifyReply, request: FastifyRequest, token: string, expiresAt: number): void {
  appendCookie(reply, serializeRefreshCookie(token, expiresAt - Date.now(), isSecureRequest(request)));
}

function clearRefreshCookie(reply: FastifyReply, request: FastifyRequest): void {
  appendCookie(reply, serializeRefreshCookie("", 0, isSecureRequest(request)));
}

function getRefreshTokenFromRequest(request: FastifyRequest): string {
  const cookies = parseCookies(request.headers.cookie);
  return cookies[REFRESH_COOKIE_NAME] || "";
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 32).toString("hex");
}

async function getAuthSession(authHeader?: string): Promise<{
  userId: number;
  token: string;
  deviceId: string;
  deviceName: string;
} | null> {
  if (!authHeader) {
    return null;
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }
  const session = await findSession(parts[1]);
  if (!session) {
    return null;
  }
  if (session.access_expires_at && session.access_expires_at < Date.now()) {
    return null;
  }
  return {
    userId: session.user_id,
    token: parts[1],
    deviceId: session.device_id || "legacy",
    deviceName: session.device_name || "Unknown device"
  };
}

function getAdminToken(authHeader?: string): string | null {
  if (!authHeader) {
    return null;
  }
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }
  return parts[1];
}

function normalizeAdminPermissions(admin: { role: string; permissions: unknown }): string[] {
  if (admin.role === "super") {
    return ["*"];
  }
  if (typeof admin.permissions === "string") {
    try {
      const parsed = JSON.parse(admin.permissions);
      if (Array.isArray(parsed)) {
        return parsed.filter((value) => typeof value === "string");
      }
    } catch {
      return [];
    }
  }
  if (Array.isArray(admin.permissions)) {
    return admin.permissions.filter((value) => typeof value === "string");
  }
  return [];
}

function adminHasPermission(admin: { role: string; permissions: unknown }, perm: AdminPermission): boolean {
  const perms = normalizeAdminPermissions(admin);
  return perms.includes("*") || perms.includes(perm);
}

async function requireAdmin(
  request: FastifyRequest,
  reply: FastifyReply,
  perm?: AdminPermission
): Promise<{ token: string; admin: { id: number; username: string; role: string; permissions: unknown } } | null> {
  const token = getAdminToken(request.headers.authorization);
  if (!token) {
    reply.status(401).send({ error: "unauthorized" });
    return null;
  }
  const session = await findAdminSession(token);
  if (!session) {
    reply.status(401).send({ error: "unauthorized" });
    return null;
  }
  const admin = session.admin;
  if (perm && !adminHasPermission(admin, perm)) {
    reply.status(403).send({ error: "forbidden" });
    return null;
  }
  return { token, admin };
}

type LockdownConfig = {
  enabled: boolean;
  allowConversationIds: number[];
};

let globalLockCache: { value: LockdownConfig; at: number } = {
  value: { enabled: false, allowConversationIds: [] },
  at: 0
};

function sanitizeConversationIds(value: unknown): number[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const ids = value
    .map((item) => (typeof item === "number" ? item : Number(item)))
    .filter((item) => Number.isInteger(item) && item > 0);
  return Array.from(new Set(ids)).slice(0, 500);
}

async function getGlobalLockdown(): Promise<LockdownConfig> {
  const now = Date.now();
  if (now - globalLockCache.at < GLOBAL_LOCK_TTL_MS) {
    return globalLockCache.value;
  }
  const stored = await getAppSetting(GLOBAL_LOCK_KEY) as Partial<LockdownConfig> | null;
  const value = {
    enabled: Boolean(stored?.enabled),
    allowConversationIds: sanitizeConversationIds(stored?.allowConversationIds)
  };
  globalLockCache = { value, at: now };
  return value;
}

async function setGlobalLockdown(config: LockdownConfig): Promise<void> {
  await setAppSetting(GLOBAL_LOCK_KEY, {
    enabled: Boolean(config.enabled),
    allowConversationIds: sanitizeConversationIds(config.allowConversationIds)
  });
  globalLockCache = {
    value: {
      enabled: Boolean(config.enabled),
      allowConversationIds: sanitizeConversationIds(config.allowConversationIds)
    },
    at: Date.now()
  };
}

async function assertNotLocked(
  request: FastifyRequest,
  reply: FastifyReply,
  conversationId?: number
): Promise<boolean> {
  const config = await getGlobalLockdown();
  if (config.enabled) {
    if (
      typeof conversationId === "number" &&
      config.allowConversationIds.includes(conversationId)
    ) {
      return true;
    }
    reply.status(403).send({ error: "global lockdown enabled" });
    return false;
  }
  return true;
}

function isPrivateIp(address: string): boolean {
  const ipType = net.isIP(address);
  if (ipType === 4) {
    const parts = address.split(".").map((value) => Number(value));
    const [a, b] = parts;
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }
  if (ipType === 6) {
    const normalized = address.toLowerCase();
    if (normalized === "::1") return true;
    if (normalized.startsWith("fe80:")) return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  }
  return false;
}

function parseQuietMinutes(value: string): number | null {
  const [h, m] = value.split(":").map((part) => Number(part));
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return null;
  }
  if (h < 0 || h > 23 || m < 0 || m > 59) {
    return null;
  }
  return h * 60 + m;
}

function isQuietHoursActiveAt(
  quiet: { enabled: boolean; start: string; end: string } | null | undefined,
  timestamp: number
): boolean {
  if (!quiet || !quiet.enabled) {
    return false;
  }
  const start = parseQuietMinutes(quiet.start);
  const end = parseQuietMinutes(quiet.end);
  if (start === null || end === null) {
    return false;
  }
  const date = new Date(timestamp);
  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  if (start === end) {
    return true;
  }
  if (start < end) {
    return nowMinutes >= start && nowMinutes < end;
  }
  return nowMinutes >= start || nowMinutes < end;
}

async function isPublicHost(hostname: string): Promise<boolean> {
  const lower = hostname.toLowerCase();
  if (lower === "localhost" || lower.endsWith(".localhost")) {
    return false;
  }
  if (net.isIP(hostname)) {
    return !isPrivateIp(hostname);
  }
  try {
    const lookups = await dns.lookup(hostname, { all: true });
    return lookups.every((entry) => !isPrivateIp(entry.address));
  } catch {
    return false;
  }
}

function extractMetaContent(html: string, pattern: RegExp): string | null {
  const match = pattern.exec(html);
  if (!match || !match[1]) {
    return null;
  }
  return match[1].replace(/\s+/g, " ").trim();
}

function extractTagsFromCaption(caption: string): string[] {
  const tags = new Set<string>();
  const matches = caption.match(/#[a-zA-Z0-9_]+/g) || [];
  for (const raw of matches) {
    const tag = raw.slice(1).toLowerCase();
    if (!tag) {
      continue;
    }
    tags.add(tag);
    if (tags.size >= 8) {
      break;
    }
  }
  return Array.from(tags);
}

function buildLinkPreview(html: string, url: string) {
  const title =
    extractMetaContent(
      html,
      /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ) ||
    extractMetaContent(
      html,
      /<title[^>]*>([^<]+)<\/title>/i
    );
  const description =
    extractMetaContent(
      html,
      /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i
    ) ||
    extractMetaContent(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i
    );
  const image = extractMetaContent(
    html,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );
  const siteName = extractMetaContent(
    html,
    /<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["'][^>]*>/i
  );

  if (!title && !description && !image) {
    return null;
  }

  return {
    url,
    title: title ? title.slice(0, 120) : null,
    description: description ? description.slice(0, 200) : null,
    image: image ? image.slice(0, 300) : null,
    siteName: siteName ? siteName.slice(0, 60) : null
  };
}

async function fetchLinkPreview(urlValue: string) {
  const url = new URL(urlValue);
  if (!["http:", "https:"].includes(url.protocol)) {
    return null;
  }
  const safe = await isPublicHost(url.hostname);
  if (!safe) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000);
  try {
    const response = await fetch(url.toString(), {
      redirect: "follow",
      headers: {
        "User-Agent": "PakegerPreviewBot/1.0"
      },
      signal: controller.signal
    });

    const finalUrl = new URL(response.url);
    const finalHostSafe = await isPublicHost(finalUrl.hostname);
    if (!finalHostSafe) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return null;
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > MAX_LINK_PREVIEW_BYTES) {
      return null;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      return null;
    }
    let total = 0;
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      if (value) {
        total += value.length;
        if (total > MAX_LINK_PREVIEW_BYTES) {
          return null;
        }
        chunks.push(value);
      }
    }
    const buffer = Buffer.concat(chunks);
    const html = buffer.toString("utf8");
    return buildLinkPreview(html, response.url);
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

server.get("/health", async () => ({ ok: true }));

server.post("/api/auth/ws-ticket", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  return {
    ticket: issueWsTicket(session.userId, session.deviceId),
    expiresAt: Date.now() + WS_TICKET_TTL_MS
  };
});

server.get("/api/link-preview", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const query = parseQuery(z.object({ url: zUrl }).strict(), request.query);
  const target = query.url;

  let preview: Awaited<ReturnType<typeof fetchLinkPreview>> = null;
  try {
    preview = await fetchLinkPreview(target);
  } catch {
    preview = null;
  }

  if (!preview) {
    return { ok: false };
  }

  return { ok: true, preview };
});

server.get("/ws", { websocket: true }, async (connection, request) => {
  const rawUrl = request.raw.url ?? "/";
  const host = request.headers.host || "localhost";
  const url = new URL(rawUrl, `http://${host}`);
  const ticket = url.searchParams.get("ticket") || "";
  const wsSession = ticket ? consumeWsTicket(ticket) : null;
  const socket = (connection as any).socket ?? (connection as any);
  if (!wsSession) {
    socket.close();
    return;
  }
  registerSocket(wsSession.userId, wsSession.deviceId || "legacy", socket as WebSocket);
});

server.post(
  "/api/auth/signup",
  { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const body = parseBody(
    z
      .object({
        username: zUsername,
        password: z.union([z.string().min(6).max(200), z.null()]).optional(),
        phone: zPhone,
        firstName: zName,
        lastName: zName,
        publicKey: z.string().min(16).max(MAX_KEY_FIELD),
        deviceId: zDeviceId,
        deviceName: zDeviceName.optional(),
        deviceInfo: zDeviceInfo
      })
      .strict(),
    request.body
  );
  const username = body.username;
  const password = body.password ?? undefined;
  const phone = body.phone;
  const firstName = body.firstName;
  const lastName = body.lastName;
  const publicKey = body.publicKey.trim();
  const deviceId = body.deviceId;
  const deviceName = body.deviceName || "Unknown device";

  const existing = await findUserByUsername(username);
  if (existing) {
    return reply.status(409).send({ error: "username already exists" });
  }
  const existingPhone = await findUserByPhone(phone);
  if (existingPhone) {
    return reply.status(409).send({ error: "phone already exists" });
  }

  let salt = "";
  let passwordHash = "";
  const twoFactorEnabled = Boolean(password);
  if (password) {
    salt = crypto.randomBytes(16).toString("hex");
    passwordHash = hashPassword(password, salt);
  }

  const user = await createUser(
    username,
    phone,
    firstName,
    lastName,
    passwordHash,
    salt,
    twoFactorEnabled,
    publicKey
  );
  await addUserToSystemConversation(user.id);
  const token = generateToken();
  const refreshToken = generateToken();
  const accessExpiresAt = Date.now() + ACCESS_TTL_MS;
  const refreshExpiresAt = Date.now() + REFRESH_TTL_MS;
  const existingSessions = await listSessionsForUser(user.id);
  const deviceCount = existingSessions.reduce(
    (count, session) =>
      session.device_id === deviceId ? count : count + 1,
    0
  );
  if (deviceCount >= MAX_DEVICES) {
    return reply.status(403).send({ error: "device limit reached" });
  }
  await createSession(
    user.id,
    token,
    deviceId,
    deviceName,
    request.ip,
    accessExpiresAt,
    refreshToken,
    refreshExpiresAt
  );

  await updateUserProfile(user.id, user.username, request.ip, body.deviceInfo || {});
  setRefreshCookie(reply, request, refreshToken, refreshExpiresAt);

  return {
    userId: user.id,
    token,
    expiresAt: accessExpiresAt,
    username: user.username,
    phone: user.phone,
    firstName: user.first_name,
    lastName: user.last_name,
    banned: user.banned,
    canSend: user.can_send,
    canCreate: user.can_create,
    avatar: user.avatar,
    bio: user.bio,
    profilePublic: user.profile_public,
    allowDirect: user.allow_direct,
    allowGroupInvite: user.allow_group_invite,
    privacy: user.privacy_defaults,
    twoFactorEnabled: user.two_factor_enabled,
    newDevice: true
  };
});

server.post(
  "/api/auth/login",
  { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const body = parseBody(
    z
      .object({
        phone: zPhone,
        password: z.union([z.string().min(6).max(200), z.null()]).optional(),
        deviceId: zDeviceId,
        deviceName: zDeviceName.optional(),
        deviceInfo: zDeviceInfo
      })
      .strict(),
    request.body
  );
  const phone = body.phone;
  const password = body.password ?? undefined;
  const deviceId = body.deviceId;
  const deviceName = body.deviceName || "Unknown device";

  const user = await findUserByPhone(phone);
  if (!user) {
    return reply.status(404).send({ error: "user not found" });
  }
  if (user.locked_until && user.locked_until > Date.now()) {
    return reply.status(429).send({ error: "account locked, retry later" });
  }

  if (user.two_factor_enabled) {
    if (!password) {
      return reply.status(401).send({ error: "2fa required" });
    }
    const passwordHash = hashPassword(password, user.password_salt);
    if (
      !crypto.timingSafeEqual(
        Buffer.from(passwordHash, "hex"),
        Buffer.from(user.password_hash, "hex")
      )
    ) {
      const nextCount = user.failed_login_count + 1;
      const lockUntil =
        nextCount >= MAX_LOGIN_ATTEMPTS ? Date.now() + LOCKOUT_MS : null;
      await recordFailedLogin(user.id, lockUntil);
      return reply.status(401).send({ error: "invalid credentials" });
    }
  }

  await clearFailedLogins(user.id);
  const token = generateToken();
  const refreshToken = generateToken();
  const accessExpiresAt = Date.now() + ACCESS_TTL_MS;
  const refreshExpiresAt = Date.now() + REFRESH_TTL_MS;
  const sessions = await listSessionsForUser(user.id);
  const hasDevice = sessions.some((session) => session.device_id === deviceId);
  const deviceCount = sessions.reduce(
    (count, session) =>
      session.device_id === deviceId ? count : count + 1,
    0
  );
  if (!hasDevice && deviceCount >= MAX_DEVICES) {
    return reply.status(403).send({ error: "device limit reached" });
  }
  await createSession(
    user.id,
    token,
    deviceId,
    deviceName,
    request.ip,
    accessExpiresAt,
    refreshToken,
    refreshExpiresAt
  );

  await updateUserProfile(user.id, user.username, request.ip, body.deviceInfo || {});
  setRefreshCookie(reply, request, refreshToken, refreshExpiresAt);

  return {
    userId: user.id,
    token,
    expiresAt: accessExpiresAt,
    username: user.username,
    phone: user.phone,
    firstName: user.first_name,
    lastName: user.last_name,
    banned: user.banned,
    canSend: user.can_send,
    canCreate: user.can_create,
    avatar: user.avatar,
    bio: user.bio,
    profilePublic: user.profile_public,
    allowDirect: user.allow_direct,
    allowGroupInvite: user.allow_group_invite,
    privacy: user.privacy_defaults,
    twoFactorEnabled: user.two_factor_enabled,
    newDevice: !hasDevice
  };
});

server.post(
  "/api/auth/refresh",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const body = parseBody(
    z.object({ refreshToken: z.string().min(16).max(128).optional(), deviceId: zDeviceId }).strict(),
    request.body
  );
  const refreshToken = getRefreshTokenFromRequest(request) || body.refreshToken || "";
  if (!refreshToken) {
    clearRefreshCookie(reply, request);
    return reply.status(401).send({ error: "refresh token missing" });
  }
  const session = await findSessionByRefreshToken(refreshToken);
  if (!session) {
    clearRefreshCookie(reply, request);
    return reply.status(401).send({ error: "invalid refresh token" });
  }
  if (session.device_id !== body.deviceId) {
    clearRefreshCookie(reply, request);
    return reply.status(401).send({ error: "device mismatch" });
  }
  if (session.refresh_expires_at < Date.now()) {
    clearRefreshCookie(reply, request);
    return reply.status(401).send({ error: "refresh expired" });
  }

  const newAccess = generateToken();
  const newRefresh = generateToken();
  const accessExpiresAt = Date.now() + ACCESS_TTL_MS;
  const refreshExpiresAt = Date.now() + REFRESH_TTL_MS;
  const updated = await rotateSessionTokens(
    session.token_hash,
    newAccess,
    accessExpiresAt,
    newRefresh,
    refreshExpiresAt
  );
  if (!updated) {
    clearRefreshCookie(reply, request);
    return reply.status(401).send({ error: "refresh failed" });
  }
  setRefreshCookie(reply, request, newRefresh, refreshExpiresAt);
  return {
    token: newAccess,
    expiresAt: accessExpiresAt
  };
});

server.get("/api/users/:username/public-key", async (request, reply) => {
  const { username } = parseParams(zUsernameParam, request.params);
  const user = await findUserByUsername(username);
  if (!user) {
    return reply.status(404).send({ error: "user not found" });
  }
  return { username: user.username, publicKey: user.public_key };
});

server.post("/api/auth/2fa/enable", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const body = parseBody(
    z.object({ password: z.string().min(6).max(200) }).strict(),
    request.body
  );
  const password = body.password;
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const ok = await updateUserPassword(session.userId, passwordHash, salt);
  if (!ok) {
    return reply.status(404).send({ error: "user not found" });
  }
  await removeSessionsForUser(session.userId);
  const token = generateToken();
  const refreshToken = generateToken();
  const accessExpiresAt = Date.now() + ACCESS_TTL_MS;
  const refreshExpiresAt = Date.now() + REFRESH_TTL_MS;
  await createSession(
    session.userId,
    token,
    session.deviceId,
    session.deviceName,
    request.ip,
    accessExpiresAt,
    refreshToken,
    refreshExpiresAt
  );
  setRefreshCookie(reply, request, refreshToken, refreshExpiresAt);
  return { ok: true, token, expiresAt: accessExpiresAt };
});

server.post("/api/auth/2fa/disable", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const body = parseBody(
    z.object({ password: z.union([z.string().min(6).max(200), z.null()]).optional() }).strict(),
    request.body
  );
  const password = body.password ?? undefined;
  const user = await findUserById(session.userId);
  if (!user) {
    return reply.status(404).send({ error: "user not found" });
  }
  if (user.two_factor_enabled) {
    if (!password) {
      return reply.status(400).send({ error: "password required" });
    }
    const passwordHash = hashPassword(password, user.password_salt);
    if (
      !crypto.timingSafeEqual(
        Buffer.from(passwordHash, "hex"),
        Buffer.from(user.password_hash, "hex")
      )
    ) {
      return reply.status(401).send({ error: "invalid credentials" });
    }
  }
  const ok = await clearUserTwoFactor(session.userId);
  if (!ok) {
    return reply.status(404).send({ error: "user not found" });
  }
  await removeSessionsForUser(session.userId);
  const token = generateToken();
  const refreshToken = generateToken();
  const accessExpiresAt = Date.now() + ACCESS_TTL_MS;
  const refreshExpiresAt = Date.now() + REFRESH_TTL_MS;
  await createSession(
    session.userId,
    token,
    session.deviceId,
    session.deviceName,
    request.ip,
    accessExpiresAt,
    refreshToken,
    refreshExpiresAt
  );
  setRefreshCookie(reply, request, refreshToken, refreshExpiresAt);
  return { ok: true, token, expiresAt: accessExpiresAt };
});

server.get("/api/users/:username/profile", async (request, reply) => {
  const { username } = parseParams(zUsernameParam, request.params);
  const user = await findUserByUsername(username);
  if (!user) {
    return reply.status(404).send({ error: "user not found" });
  }
  if (!user.profile_public) {
    return reply.status(403).send({ error: "profile not public" });
  }
  return {
    username: user.username,
    avatar: user.privacy_defaults.hide_profile_photo ? null : user.avatar,
    bio: user.bio
  };
});

server.get("/api/profile", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const user = await findUserById(session.userId);
  if (!user) {
    return reply.status(404).send({ error: "user not found" });
  }
  return {
    username: user.username,
    phone: user.phone,
    firstName: user.first_name,
    lastName: user.last_name,
    avatar: user.avatar,
    bio: user.bio,
    profilePublic: user.profile_public,
    allowDirect: user.allow_direct,
    allowGroupInvite: user.allow_group_invite,
    privacy: user.privacy_defaults,
    twoFactorEnabled: user.two_factor_enabled
  };
});

server.post("/api/profile", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const body = parseBody(
    z
      .object({
        firstName: zName.optional(),
        lastName: zName.optional(),
        avatar: z.union([z.string().max(MAX_AVATAR), z.null()]).optional(),
        bio: zBio.optional(),
        profilePublic: zOptionalBoolean,
        allowDirect: zOptionalBoolean,
        allowGroupInvite: zOptionalBoolean,
        privacy: z
          .object({
            hide_online: zOptionalBoolean,
            hide_last_seen: zOptionalBoolean,
            hide_profile_photo: zOptionalBoolean,
            disable_read_receipts: zOptionalBoolean,
            disable_typing_indicator: zOptionalBoolean
          })
          .strict()
          .optional()
      })
      .strict(),
    request.body
  );

  if (typeof body.avatar === "string" && !body.avatar.startsWith("data:image/")) {
    return reply.status(400).send({ error: "invalid avatar format" });
  }

  const updated = await updateUserAccount(session.userId, {
    first_name: typeof body.firstName === "string" ? body.firstName : undefined,
    last_name: typeof body.lastName === "string" ? body.lastName : undefined,
    avatar:
      typeof body.avatar === "string" || body.avatar === null
        ? body.avatar
        : undefined,
    bio: typeof body.bio === "string" ? body.bio : undefined,
    profile_public: typeof body.profilePublic === "boolean" ? body.profilePublic : undefined,
    allow_direct: typeof body.allowDirect === "boolean" ? body.allowDirect : undefined,
    allow_group_invite: typeof body.allowGroupInvite === "boolean" ? body.allowGroupInvite : undefined,
    privacy_defaults: body.privacy
  });

  if (!updated) {
    return reply.status(404).send({ error: "user not found" });
  }

  return { ok: true };
});

server.post("/api/privacy/contact", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const body = parseBody(
    z
      .object({
        username: zUsername,
        privacy: z
          .object({
            hide_online: zOptionalBoolean,
            hide_last_seen: zOptionalBoolean,
            hide_profile_photo: zOptionalBoolean,
            disable_read_receipts: zOptionalBoolean,
            disable_typing_indicator: zOptionalBoolean
          })
          .strict()
      })
      .strict(),
    request.body
  );
  const updated = await updatePrivacyOverride(session.userId, body.username, body.privacy);
  if (!updated) {
    return reply.status(404).send({ error: "user not found" });
  }
  return { ok: true };
});

server.get("/api/users/:username/profile-private", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const { username } = parseParams(zUsernameParam, request.params);
  const user = await findUserByUsername(username);
  if (!user) {
    return reply.status(404).send({ error: "user not found" });
  }
  const viewer = await findUserById(session.userId);
  const override = viewer
    ? user.privacy_overrides[viewer.username] || {}
    : {};
  const privacy = { ...user.privacy_defaults, ...override };
  return {
    username: user.username,
    avatar: privacy.hide_profile_photo ? null : user.avatar,
    bio: user.bio
  };
});

server.get("/api/users/:username/status", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const { username } = parseParams(zUsernameParam, request.params);
  const user = await findUserByUsername(username);
  if (!user) {
    return reply.status(404).send({ error: "user not found" });
  }
  const viewer = await findUserById(session.userId);
  const override = viewer
    ? user.privacy_overrides[viewer.username] || {}
    : {};
  const privacy = { ...user.privacy_defaults, ...override };
  if (privacy.hide_online && privacy.hide_last_seen) {
    return { online: false, lastSeen: null };
  }
  const sessions = await listSessionsForUser(user.id);
  const latest = sessions
    .map((row) => row.last_seen_at)
    .sort((a, b) => b - a)[0];
  const online = latest ? Date.now() - latest < ONLINE_WINDOW_MS : false;
  return {
    online: privacy.hide_online ? false : online,
    lastSeen: privacy.hide_last_seen ? null : latest ?? null
  };
});

server.get(
  "/api/social/feed",
  { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  if (!(await assertNotLocked(request, reply))) {
    return;
  }
  const query = parseQuery(
    z
      .object({
        kind: z.enum(["post", "reel"]).optional(),
        before: z.coerce.number().int().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        sort: z.enum(["latest", "trending"]).optional()
      })
      .strict(),
    request.query
  );
  const kind = query.kind;
  const before = query.before;
  const limit = query.limit;
  const sort = query.sort || "latest";
  const feed = await listSocialFeed({
    viewerId: session.userId,
    kind,
    before,
    limit,
    sort
  });
  return reply.send({ items: feed });
});

server.get(
  "/api/social/stories",
  { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  if (!(await assertNotLocked(request, reply))) {
    return;
  }
  const query = parseQuery(
    z.object({ limit: z.coerce.number().int().min(1).max(100).optional() }).strict(),
    request.query
  );
  const limit = query.limit;
  const stories = await listSocialStories({ viewerId: session.userId, limit: limit ?? 20 });
  return reply.send({ items: stories });
});

server.post(
  "/api/social/posts",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  if (!(await assertNotLocked(request, reply))) {
    return;
  }
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const body = parseBody(
    z
      .object({
        kind: z.enum(["post", "reel", "story"]),
        mediaUrl: zUrl,
        mediaType: z.enum(["image", "video"]),
        caption: z.string().max(MAX_SOCIAL_CAPTION).optional(),
        visibility: z.enum(["public", "private"]).optional(),
        allowedUsers: z.array(zUsername).max(200).optional(),
        commentVisibility: z.enum(["public", "friends"]).optional(),
        expiresInMinutes: z.coerce.number().int().min(1).max(60 * 24 * 30).optional(),
        publishAt: z.coerce.number().int().min(0).optional()
      })
      .strict(),
    request.body
  );
  if (!isAllowedMediaUrl(body.mediaUrl, request.hostname)) {
    return reply.status(400).send({ error: "invalid media url" });
  }
  const kind = body.kind;
  const mediaType = body.mediaType;
  const caption = body.caption?.trim() ?? "";
  const expiresAt =
    typeof body.expiresInMinutes === "number" && body.expiresInMinutes > 0
      ? Date.now() + body.expiresInMinutes * 60 * 1000
      : kind === "story"
      ? Date.now() + STORY_TTL_MS
      : null;
  const visibility =
    body.visibility === "private" ? "private" : "public";
  const commentVisibility =
    body.commentVisibility === "friends" ? "friends" : "public";
  const publishAt =
    typeof body.publishAt === "number" && body.publishAt > Date.now()
      ? body.publishAt
      : null;
  const tags = extractTagsFromCaption(caption);
  let allowedUserIds: number[] = [];
  if (visibility === "private") {
    const allowedUsers = Array.isArray(body.allowedUsers) ? body.allowedUsers : [];
    const { followers, following } = await listFollowUserIds(session.userId);
    const allowedSet = new Set([...followers, ...following]);
    const users = await listUsersByUsernames(allowedUsers);
    allowedUserIds = users
      .map((user) => user.id)
      .filter((id) => allowedSet.has(id));
    if (allowedUserIds.length === 0) {
      return reply.status(400).send({ error: "private audience required" });
    }
  }
  const post = await createSocialPost({
    userId: session.userId,
    kind,
    mediaUrl: body.mediaUrl,
    mediaType,
    caption: caption || null,
    tags,
    visibility,
    allowedUserIds,
    commentVisibility,
    publishAt,
    expiresAt
  });
  return reply.send({ post });
});

server.post(
  "/api/social/posts/:id/like",
  { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  if (!(await assertNotLocked(request, reply))) {
    return;
  }
  const { id } = parseParams(zIdParam, request.params);
  const postId = id;
  const post = await findSocialPostById(postId);
  if (!post) {
    return reply.status(404).send({ error: "post not found" });
  }
  if (!canViewSocialPost(post, session.userId)) {
    return reply.status(403).send({ error: "forbidden" });
  }
  const result = await toggleSocialLike(postId, session.userId);
  return reply.send(result);
});

server.post(
  "/api/social/posts/:id/save",
  { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  if (!(await assertNotLocked(request, reply))) {
    return;
  }
  const { id } = parseParams(zIdParam, request.params);
  const postId = id;
  const post = await findSocialPostById(postId);
  if (!post) {
    return reply.status(404).send({ error: "post not found" });
  }
  if (!canViewSocialPost(post, session.userId)) {
    return reply.status(403).send({ error: "forbidden" });
  }
  const result = await toggleSocialSave(postId, session.userId);
  return reply.send(result);
});

server.post(
  "/api/social/posts/:id/view",
  { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  if (!(await assertNotLocked(request, reply))) {
    return;
  }
  const { id } = parseParams(zIdParam, request.params);
  const postId = id;
  const post = await findSocialPostById(postId);
  if (!post) {
    return reply.status(404).send({ error: "post not found" });
  }
  if (!canViewSocialPost(post, session.userId)) {
    return reply.status(403).send({ error: "forbidden" });
  }
  const count = await addSocialView(postId, session.userId);
  return reply.send({ views: count });
});

server.get(
  "/api/social/posts/:id/comments",
  { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  if (!(await assertNotLocked(request, reply))) {
    return;
  }
  const { id } = parseParams(zIdParam, request.params);
  const postId = id;
  const post = await findSocialPostById(postId);
  if (!post) {
    return reply.status(404).send({ error: "post not found" });
  }
  if (!canViewSocialPost(post, session.userId)) {
    return reply.status(403).send({ error: "forbidden" });
  }
  const comments = await listSocialComments(postId);
  return reply.send({ items: comments });
});

server.post(
  "/api/social/posts/:id/comments",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  if (!(await assertNotLocked(request, reply))) {
    return;
  }
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const { id } = parseParams(zIdParam, request.params);
  const postId = id;
  const post = await findSocialPostById(postId);
  if (!post) {
    return reply.status(404).send({ error: "post not found" });
  }
  if (!canViewSocialPost(post, session.userId)) {
    return reply.status(403).send({ error: "forbidden" });
  }
  if (
    post.comment_visibility === "friends" &&
    post.user_id !== session.userId &&
    !(await areFriends(post.user_id, session.userId))
  ) {
    return reply.status(403).send({ error: "comments restricted" });
  }
  const body = parseBody(
    z.object({ text: z.string().min(1).max(MAX_SOCIAL_COMMENT) }).strict(),
    request.body
  );
  const text = body.text.trim();
  const comment = await addSocialComment(postId, session.userId, text);
  return reply.send({ comment });
});

server.post(
  "/api/social/follow",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  if (!(await assertNotLocked(request, reply))) {
    return;
  }
  const body = parseBody(
    z.object({ username: zUsername }).strict(),
    request.body
  );
  const username = body.username;
  const target = await findUserByUsername(username);
  if (!target) {
    return reply.status(404).send({ error: "user not found" });
  }
  if (target.id === session.userId) {
    return reply.status(400).send({ error: "cannot follow self" });
  }
  const ok = await followUser(session.userId, target.id);
  return reply.send({ ok });
});

server.post(
  "/api/social/unfollow",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  if (!(await assertNotLocked(request, reply))) {
    return;
  }
  const body = parseBody(
    z.object({ username: zUsername }).strict(),
    request.body
  );
  const username = body.username;
  const target = await findUserByUsername(username);
  if (!target) {
    return reply.status(404).send({ error: "user not found" });
  }
  const ok = await unfollowUser(session.userId, target.id);
  return reply.send({ ok });
});

server.get(
  "/api/social/follows",
  { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  if (!(await assertNotLocked(request, reply))) {
    return;
  }
  const { followers, following } = await listFollows(session.userId);
  const users = await listUsers();
  const toUsername = (id: number) =>
    users.find((user) => user.id === id)?.username ?? "unknown";
  return reply.send({
    followers: followers.map(toUsername),
    following: following.map(toUsername)
  });
});

server.get(
  "/api/social/notifications",
  { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  if (!(await assertNotLocked(request, reply))) {
    return;
  }
  const items = (await listSocialNotifications(session.userId)).map((entry) => ({
    id: entry.notification.id,
    type: entry.notification.type,
    createdAt: entry.notification.created_at,
    seenAt: entry.notification.seen_at,
    actor: {
      username: entry.actor.username,
      avatar: entry.actor.avatar
    },
    post: entry.post
      ? { id: entry.post.id, mediaUrl: entry.post.media_url }
      : null
  }));
  await markSocialNotificationsSeen(session.userId);
  return reply.send({ items });
});

server.get(
  "/api/social/insights",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  if (!(await assertNotLocked(request, reply))) {
    return;
  }
  const insights = await getSocialInsights(session.userId);
  return reply.send({ insights });
});

server.post("/api/keys/publish", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const body = parseBody(
    z
      .object({
        identityKey: z.string().min(16).max(MAX_KEY_FIELD),
        registrationId: z.number().int().min(1),
        deviceId: z.number().int().min(1),
        sessionDeviceId: zDeviceId,
        signedPreKeyId: z.number().int().min(1),
        signedPreKey: z.string().min(16).max(MAX_KEY_FIELD),
        signedPreKeySig: z.string().min(16).max(MAX_KEY_FIELD),
        fallbackPublicKey: z.string().min(16).max(MAX_KEY_FIELD),
        oneTimePreKeys: z
          .array(
            z
              .object({
                id: z.number().int().min(1),
                key: z.string().min(16).max(MAX_KEY_FIELD)
              })
              .strict()
          )
          .max(MAX_PREKEYS)
          .optional()
      })
      .strict(),
    request.body
  );

  const oneTimePreKeys = body.oneTimePreKeys || [];

  await setUserKeyBundle(session.userId, {
    sessionDeviceId: body.sessionDeviceId,
    registrationId: body.registrationId,
    deviceId: body.deviceId,
    identityKey: body.identityKey,
    signedPreKeyId: body.signedPreKeyId,
    signedPreKey: body.signedPreKey,
    signedPreKeySig: body.signedPreKeySig,
    fallbackPublicKey: body.fallbackPublicKey,
    oneTimePreKeys: oneTimePreKeys.map((entry) => ({
      id: entry.id,
      key: entry.key
    }))
  });

  return { ok: true };
});

server.post(
  "/api/uploads/presign",
  { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const body = parseBody(
    z
      .object({
        filename: zFileName,
        contentType: z.string().min(1).max(120),
        size: z.number().int().min(1).max(1024 * 1024 * 1024)
      })
      .strict(),
    request.body
  );
  const filename = body.filename;
  const contentType = body.contentType.trim() || "application/octet-stream";
  const size = body.size;

  try {
    const upload = await createPresignedUpload({
      filename,
      contentType,
      size
    });
    await registerUploadedFile(upload.key, session.userId, contentType);
    return upload;
  } catch (error) {
    const message = (error as Error).message || "upload init failed";
    if (message === "uploads_not_configured") {
      return reply.status(503).send({ error: "uploads not configured" });
    }
    return reply.status(500).send({ error: "upload init failed" });
  }
});

server.post(
  "/api/uploads/presign-download",
  { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const body = parseBody(
    z
      .object({
        key: zUploadKey
      })
      .strict(),
    request.body
  );

  try {
    const file = await findUploadedFileByKey(body.key);
    if (!file || file.owner_user_id !== session.userId) {
      return reply.status(404).send({ error: "file not found" });
    }
    return await createPresignedDownload(body.key);
  } catch (error) {
    const message = (error as Error).message || "download init failed";
    if (message === "uploads_not_configured") {
      return reply.status(503).send({ error: "uploads not configured" });
    }
    return reply.status(500).send({ error: "download init failed" });
  }
});

server.post(
  "/api/uploads/direct",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const part = await (request as typeof request & {
    file: () => Promise<{
      filename: string;
      mimetype: string;
      file: NodeJS.ReadableStream;
    } | undefined>;
  }).file();
  if (!part) {
    return reply.status(400).send({ error: "file required" });
  }

  let filename = (part.filename || "file").toString();
  try {
    filename = zFileName.parse(filename);
  } catch {
    return reply.status(400).send({ error: "invalid filename" });
  }
  const tmpPath = path.join(
    os.tmpdir(),
    `upload-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
  await fs.promises.mkdir(path.dirname(tmpPath), { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const stream = fs.createWriteStream(tmpPath);
    part.file.on("error", reject);
    stream.on("error", reject);
    stream.on("finish", resolve);
    part.file.pipe(stream);
  });

  try {
    const upload = await uploadAndScanFile({
      filename,
      contentType: part.mimetype,
      tmpPath
    });
    await registerUploadedFile(upload.key, session.userId, upload.contentType);
    return {
      publicUrl: upload.publicUrl,
      contentType: upload.contentType,
      key: upload.key
    };
  } catch (error) {
    const message = (error as Error).message;
    if (message === "malicious_file") {
      return reply.status(400).send({ error: "malicious file detected" });
    }
    if (message === "uploads_not_configured") {
      return reply.status(503).send({ error: "uploads not configured" });
    }
    return reply.status(500).send({ error: "upload failed" });
  } finally {
    fs.promises.unlink(tmpPath).catch(() => undefined);
  }
});

server.get("/api/keys/bundle/:username", async (request, reply) => {
  const { username } = parseParams(zUsernameParam, request.params);
  const user = await findUserByUsername(username);
  if (!user) {
    return reply.status(404).send({ error: "user not found" });
  }

  const activeSessionDeviceIds = new Set(
    (await listSessionsForUser(user.id))
      .filter((session) => session.refresh_expires_at > Date.now())
      .map((session) => session.device_id)
  );
  const bundles = (await listUserKeyBundles(user.id)).filter((bundle) =>
    activeSessionDeviceIds.has(bundle.session_device_id)
  );
  if (bundles.length === 0) {
    return reply.status(404).send({ error: "keys not available" });
  }

  const devices = await Promise.all(
    bundles.map(async (bundle) => ({
      registrationId: bundle.registration_id ?? 1,
      deviceId: bundle.device_id ?? 1,
      sessionDeviceId: bundle.session_device_id,
      identityKey: bundle.identity_key,
      signedPreKeyId: bundle.signed_prekey_id,
      signedPreKey: bundle.signed_prekey,
      signedPreKeySig: bundle.signed_prekey_sig,
      fallbackPublicKey: bundle.fallback_public_key || "",
      oneTimePreKey: await popOneTimePreKey(user.id, bundle.session_device_id)
    }))
  );

  return { username: user.username, devices };
});

server.get("/api/conversations", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const conversations = await Promise.all(
    (await listConversationsForUser(session.userId)).map(async (conv) => {
      const members = (await listMembers(conv.id)).map((member) => ({
        username: member.username,
        publicKey: member.public_key
      }));
      return {
        id: conv.id,
        type: conv.type,
        name: conv.name,
        ownerId: conv.owner_id,
        visibility: conv.visibility,
        forwardEnabled: conv.forward_enabled,
        quietHours: conv.quiet_hours ?? null,
        members
      };
    })
  );

  return { conversations };
});

server.post("/api/conversations", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const user = await findUserById(session.userId);
  if (!user || user.banned) {
    return reply.status(403).send({ error: "user banned" });
  }
  if (!user.can_create) {
    return reply.status(403).send({ error: "user cannot create" });
  }

  const body = parseBody(
    z
      .object({
        type: z.enum(["direct", "group", "channel"]),
        name: zGroupName.optional().nullable(),
        members: z.array(zUsername).max(200).optional(),
        visibility: zVisibility
      })
      .strict(),
    request.body
  );

  const type = body.type;
  const name = body.name ?? null;
  const members = body.members || [];
  const visibility = body.visibility === "private" ? "private" : "public";

  if (type !== "direct" && !name) {
    return reply.status(400).send({ error: "name required" });
  }

  if (type === "direct" && members.length !== 1) {
    return reply
      .status(400)
      .send({ error: "direct requires exactly one member" });
  }

  const uniqueMembers = Array.from(new Set(members)).filter(Boolean);
  const memberUsers = (await Promise.all(
    uniqueMembers.map((memberUsername) => findUserByUsername(memberUsername))
  )).filter(Boolean) as Array<{
    id: number;
    username: string;
    banned: boolean;
    allow_direct: boolean;
    allow_group_invite: boolean;
  }>;

  if (memberUsers.length !== uniqueMembers.length) {
    return reply.status(404).send({ error: "one or more users not found" });
  }

  const blockedMember = memberUsers.find((member) => member.banned);
  if (blockedMember) {
    return reply.status(403).send({ error: "member banned" });
  }

  if (type === "direct" && memberUsers.some((member) => !member.allow_direct)) {
    return reply.status(403).send({ error: "member disabled direct chats" });
  }

  if (
    type !== "direct" &&
    memberUsers.some((member) => !member.allow_group_invite)
  ) {
    return reply.status(403).send({ error: "member disabled group invites" });
  }

  const conversation = await createConversation(
    type,
    name,
    session.userId,
    memberUsers.map((member) => member.id),
    type === "direct" ? "private" : visibility
  );

  return { conversationId: conversation.id };
});

server.get("/api/conversations/:id/members", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const { id } = parseParams(zIdParam, request.params);
  const conversationId = id;
  const conversation = await getConversationById(conversationId);
  const senderUser = await findUserById(session.userId);
  if (!conversation) {
    return reply.status(404).send({ error: "conversation not found" });
  }
  if (conversation.visibility === "private") {
    return reply.status(403).send({ error: "private chat requires invite link" });
  }

  if (!(await isMember(conversationId, session.userId))) {
    return reply.status(403).send({ error: "forbidden" });
  }

  const members = (await listMembers(conversationId)).map((member) => ({
    username: member.username,
    publicKey: member.public_key
  }));

  return { members };
});

server.get("/api/conversations/:id/settings", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const { id } = parseParams(zIdParam, request.params);
  if (!(await isMember(id, session.userId))) {
    return reply.status(403).send({ error: "forbidden" });
  }
  const settings = await getConversationSettings(id);
  if (!settings) {
    return reply.status(404).send({ error: "conversation not found" });
  }
  return {
    forwardEnabled: settings.forward_enabled,
    quietHours: settings.quiet_hours ?? null
  };
});

server.post("/api/conversations/:id/settings", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const { id } = parseParams(zIdParam, request.params);
  const membership = await getMembership(id, session.userId);
  if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
    return reply.status(403).send({ error: "forbidden" });
  }
  const body = parseBody(
    z
      .object({
        forwardEnabled: z.boolean().optional(),
        quietHours: z
          .object({
            enabled: z.boolean(),
            start: z.string().regex(/^\d{2}:\d{2}$/),
            end: z.string().regex(/^\d{2}:\d{2}$/)
          })
          .nullable()
          .optional()
      })
      .strict(),
    request.body
  );
  const current = await getConversationSettings(id);
  if (!current) {
    return reply.status(404).send({ error: "conversation not found" });
  }
  await updateConversationSettings(id, {
    forward_enabled:
      typeof body.forwardEnabled === "boolean"
        ? body.forwardEnabled
        : current.forward_enabled,
    quiet_hours:
      body.quietHours !== undefined ? body.quietHours : current.quiet_hours ?? null
  });
  return { ok: true };
});

server.get("/api/conversations/:id/roster", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const { id } = parseParams(zIdParam, request.params);
  const conversationId = id;
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    return reply.status(404).send({ error: "conversation not found" });
  }
  if (!(await isMember(conversationId, session.userId))) {
    return reply.status(403).send({ error: "forbidden" });
  }

  const roster = (await listMemberships(conversationId)).map((entry) => ({
    id: entry.user.id,
    username: entry.user.username,
    role: entry.role,
    permissions: entry.permissions || null
  }));

  return { members: roster, visibility: conversation.visibility };
});

server.post("/api/conversations/:id/members/add", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const { id } = parseParams(zIdParam, request.params);
  const conversationId = id;
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    return reply.status(404).send({ error: "conversation not found" });
  }

  const membership = await getMembership(conversationId, session.userId);
  if (!membership) {
    return reply.status(403).send({ error: "forbidden" });
  }
  const canManage =
    membership.role === "owner" ||
    (membership.role === "admin" &&
      membership.permissions?.manage_members);
  if (!canManage) {
    return reply.status(403).send({ error: "insufficient permissions" });
  }

  const body = parseBody(
    z.object({ username: zUsername }).strict(),
    request.body
  );
  const target = await findUserByUsername(body.username);
  if (!target) {
    return reply.status(404).send({ error: "user not found" });
  }
  if (target.banned) {
    return reply.status(403).send({ error: "user banned" });
  }

  if (conversation.type !== "direct" && !target.allow_group_invite) {
    return reply.status(403).send({ error: "user disabled group invites" });
  }

  addMember(conversationId, target.id, "member");
  return { ok: true };
});

server.post("/api/conversations/:id/members/remove", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const { id } = parseParams(zIdParam, request.params);
  const conversationId = id;
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    return reply.status(404).send({ error: "conversation not found" });
  }

  const membership = await getMembership(conversationId, session.userId);
  if (!membership) {
    return reply.status(403).send({ error: "forbidden" });
  }
  const canManage =
    membership.role === "owner" ||
    (membership.role === "admin" &&
      membership.permissions?.manage_members);
  if (!canManage) {
    return reply.status(403).send({ error: "insufficient permissions" });
  }

  const body = parseBody(
    z.object({ username: zUsername }).strict(),
    request.body
  );
  const target = await findUserByUsername(body.username);
  if (!target) {
    return reply.status(404).send({ error: "user not found" });
  }
  if (target.id === conversation.owner_id) {
    return reply.status(403).send({ error: "cannot remove owner" });
  }

  const ok = await removeMember(conversationId, target.id);
  if (!ok) {
    return reply.status(404).send({ error: "member not found" });
  }
  return { ok: true };
});

server.post("/api/conversations/:id/role", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const { id } = parseParams(zIdParam, request.params);
  const conversationId = id;
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    return reply.status(404).send({ error: "conversation not found" });
  }

  if (conversation.owner_id !== session.userId) {
    return reply.status(403).send({ error: "owner only" });
  }

  const body = parseBody(
    z
      .object({
        username: zUsername,
        role: z.enum(["admin", "member"]),
        permissions: z
          .object({
            manage_members: zOptionalBoolean,
            manage_invites: zOptionalBoolean
          })
          .strict()
          .optional()
      })
      .strict(),
    request.body
  );
  const target = await findUserByUsername(body.username);
  const role = body.role;
  if (!target) {
    return reply.status(404).send({ error: "user not found" });
  }
  if (target.id === conversation.owner_id) {
    return reply.status(400).send({ error: "owner role cannot be changed" });
  }

  const updated = await updateMemberRole(
    conversationId,
    target.id,
    role,
    body.permissions
  );
  if (!updated) {
    return reply.status(404).send({ error: "member not found" });
  }

  return { ok: true };
});

server.post("/api/conversations/:id/invites", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const { id } = parseParams(zIdParam, request.params);
  const conversationId = id;
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    return reply.status(404).send({ error: "conversation not found" });
  }

  const membership = await getMembership(conversationId, session.userId);
  if (!membership) {
    return reply.status(403).send({ error: "forbidden" });
  }
  const canInvite =
    membership.role === "owner" ||
    (membership.role === "admin" &&
      membership.permissions?.manage_invites);
  if (!canInvite) {
    return reply.status(403).send({ error: "insufficient permissions" });
  }

  const body = parseBody(
    z
      .object({
        maxUses: z.number().int().min(1).max(1000).optional(),
        expiresInMinutes: z.number().int().min(1).max(24 * 60).optional()
      })
      .strict(),
    request.body
  );
  const maxUses = body.maxUses ?? 1;
  const expiresInMinutes = body.expiresInMinutes ?? 60;
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

  const invite = await createInvite(
    conversationId,
    session.userId,
    maxUses,
    expiresAt
  );
  return { token: invite.token, expiresAt: invite.expires_at, maxUses };
});

server.get("/api/conversations/:id/invites", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const { id } = parseParams(zIdParam, request.params);
  const conversationId = id;
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    return reply.status(404).send({ error: "conversation not found" });
  }

  const membership = await getMembership(conversationId, session.userId);
  if (!membership) {
    return reply.status(403).send({ error: "forbidden" });
  }
  const canInvite =
    membership.role === "owner" ||
    (membership.role === "admin" &&
      membership.permissions?.manage_invites);
  if (!canInvite) {
    return reply.status(403).send({ error: "insufficient permissions" });
  }

  const invites = (await listInvites(conversationId)).map((invite) => ({
    token: invite.token,
    maxUses: invite.max_uses,
    uses: invite.uses,
    expiresAt: invite.expires_at,
    revoked: invite.revoked,
    createdAt: invite.created_at
  }));

  return { invites };
});

server.post("/api/conversations/invites/revoke", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const body = parseBody(
    z.object({ token: zToken }).strict(),
    request.body
  );
  const token = body.token;

  const invite = await findInviteByToken(token);
  if (!invite) {
    return reply.status(404).send({ error: "invite not found" });
  }

  const membership = await getMembership(invite.conversation_id, session.userId);
  if (!membership) {
    return reply.status(403).send({ error: "forbidden" });
  }
  const canInvite =
    membership.role === "owner" ||
    (membership.role === "admin" &&
      membership.permissions?.manage_invites);
  if (!canInvite) {
    return reply.status(403).send({ error: "insufficient permissions" });
  }

  const ok = await revokeInvite(token);
  if (!ok) {
    return reply.status(404).send({ error: "invite not found" });
  }

  return { ok: true };
});

server.post("/api/invites/redeem", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const body = parseBody(
    z.object({ token: zToken }).strict(),
    request.body
  );
  const token = body.token;

  const invite = await redeemInvite(token, session.userId);
  if (!invite) {
    return reply.status(400).send({ error: "invalid or expired invite" });
  }

  return { ok: true, conversationId: invite.conversation_id };
});

server.post(
  "/api/messages/send",
  { config: { rateLimit: { max: 300, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const user = await findUserById(session.userId);
  if (!user || user.banned) {
    return reply.status(403).send({ error: "user banned" });
  }

  const body = parseBody(
    z
      .object({
        conversationId: zConversationId,
        forwarded: z.boolean().optional(),
        payloads: z
          .array(
            z
              .object({
                messageId: zMessageId,
                toUsername: zUsername,
                toDeviceId: zDeviceId,
                ciphertext: zCiphertext,
                nonce: zNonce
              })
              .strict()
          )
          .min(1)
          .max(MAX_PAYLOADS)
      })
      .strict(),
    request.body
  );

  const conversationId = body.conversationId;
  const payloads = body.payloads;
  const forwarded = Boolean(body.forwarded);

  if (!(await assertNotLocked(request, reply, conversationId))) {
    return;
  }

  const conversation = await getConversationById(conversationId);
  const senderUser = await findUserById(session.userId);
  if (!conversation) {
    return reply.status(404).send({ error: "conversation not found" });
  }

  if (!(await isMember(conversationId, session.userId))) {
    return reply.status(403).send({ error: "forbidden" });
  }

  const settings = await getConversationSettings(conversationId);
  if (
    settings?.quiet_hours &&
    isQuietHoursActiveAt(settings.quiet_hours, Date.now())
  ) {
    await createBlockedEvent({
      conversationId,
      userId: session.userId,
      reason: "quiet_hours",
      metadata: {
        at: Date.now(),
        payloadCount: payloads.length,
        conversationType: conversation.type,
        senderDeviceId: session.deviceId,
        clientIp: request.ip
      }
    });
    return reply.status(403).send({ error: "quiet hours active" });
  }
  if (forwarded && settings && !settings.forward_enabled) {
    await createBlockedEvent({
      conversationId,
      userId: session.userId,
      reason: "forwarding_disabled",
      metadata: {
        forwarded: true,
        payloadCount: payloads.length,
        conversationType: conversation.type,
        senderDeviceId: session.deviceId,
        clientIp: request.ip
      }
    });
    return reply.status(403).send({ error: "forwarding disabled" });
  }

  if (conversation.type === "channel") {
    const membership = await getMembership(conversationId, session.userId);
    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return reply.status(403).send({ error: "channel is read-only" });
    }
  }

  const members = await listMembers(conversationId);
  const memberUsernames = new Set(members.map((member) => member.username));
  const senderBundle = await findUserKeyBundleBySession(
    session.userId,
    session.deviceId
  );
  const senderSignalDeviceId = String(senderBundle?.device_id ?? 1);

  for (const payload of payloads) {
    const messageId = payload.messageId;
    const toUsername = payload.toUsername;
    const toDeviceId = payload.toDeviceId;
    const ciphertext = payload.ciphertext;
    const nonce = payload.nonce;

    if (!memberUsernames.has(toUsername)) {
      return reply.status(400).send({ error: "recipient not in conversation" });
    }

    const recipient = await findUserByUsername(toUsername);
    if (!recipient) {
      return reply.status(404).send({ error: "recipient not found" });
    }

    const stored = await createMessage(
      messageId,
      conversationId,
      session.userId,
      senderSignalDeviceId,
      recipient.id,
      toDeviceId,
      ciphertext,
      nonce,
      ciphertext.length
    );
    sendWs(recipient.id, toDeviceId, {
      type: "message",
      message: {
        id: stored.id,
        group_id: stored.group_id,
        conversation_id: stored.conversation_id,
        sender_username: senderUser?.username ?? "unknown",
        sender_device_id: stored.sender_device_id,
        ciphertext: stored.ciphertext,
        nonce: stored.nonce,
        created_at: stored.created_at,
        delivered_at: stored.delivered_at,
        read_at: stored.read_at,
        deleted_at: stored.deleted_at,
        deleted_by: stored.deleted_by
      }
    });
  }

  return { ok: true };
});

server.post(
  "/api/messages/schedule",
  { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const user = await findUserById(session.userId);
  if (!user || user.banned) {
    return reply.status(403).send({ error: "user banned" });
  }

  const body = parseBody(
    z
      .object({
        conversationId: zConversationId,
        scheduledFor: z.number().int().min(1),
        forwarded: z.boolean().optional(),
        payloads: z
          .array(
            z
              .object({
                messageId: zMessageId,
                toUsername: zUsername,
                toDeviceId: zDeviceId,
                ciphertext: zCiphertext,
                nonce: zNonce
              })
              .strict()
          )
          .min(1)
          .max(MAX_PAYLOADS)
      })
      .strict(),
    request.body
  );

  const conversationId = body.conversationId;
  const scheduledFor = body.scheduledFor;
  const payloads = body.payloads;
  const forwarded = Boolean(body.forwarded);

  if (!(await assertNotLocked(request, reply, conversationId))) {
    return;
  }

  const now = Date.now();
  if (scheduledFor < now + 1000) {
    return reply.status(400).send({ error: "schedule must be in the future" });
  }
  if (scheduledFor - now > MAX_SCHEDULED_DELAY_MS) {
    return reply.status(400).send({ error: "schedule too far" });
  }

  const settings = await getConversationSettings(conversationId);
  if (
    settings?.quiet_hours &&
    isQuietHoursActiveAt(settings.quiet_hours, scheduledFor)
  ) {
    await createBlockedEvent({
      conversationId,
      userId: session.userId,
      reason: "quiet_hours",
      metadata: {
        scheduledFor,
        payloadCount: payloads.length,
        senderDeviceId: session.deviceId,
        clientIp: request.ip
      }
    });
    return reply.status(403).send({ error: "quiet hours active" });
  }
  if (forwarded && settings && !settings.forward_enabled) {
    await createBlockedEvent({
      conversationId,
      userId: session.userId,
      reason: "forwarding_disabled",
      metadata: {
        forwarded: true,
        scheduledFor,
        payloadCount: payloads.length,
        senderDeviceId: session.deviceId,
        clientIp: request.ip
      }
    });
    return reply.status(403).send({ error: "forwarding disabled" });
  }

  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    return reply.status(404).send({ error: "conversation not found" });
  }

  if (!(await isMember(conversationId, session.userId))) {
    return reply.status(403).send({ error: "forbidden" });
  }

  if (conversation.type === "channel") {
    const membership = await getMembership(conversationId, session.userId);
    if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
      return reply.status(403).send({ error: "channel is read-only" });
    }
  }

  const members = await listMembers(conversationId);
  const memberUsernames = new Set(members.map((member) => member.username));
  const senderBundle = await findUserKeyBundleBySession(
    session.userId,
    session.deviceId
  );
  const senderSignalDeviceId = String(senderBundle?.device_id ?? 1);

  const scheduledPayloads: Array<{
    message_id: string;
    to_username: string;
    to_device_id: string;
    ciphertext: string;
    nonce: string;
  }> = [];

  for (const payload of payloads) {
    const messageId = payload.messageId;
    const toUsername = payload.toUsername;
    const toDeviceId = payload.toDeviceId;
    const ciphertext = payload.ciphertext;
    const nonce = payload.nonce;

    if (!memberUsernames.has(toUsername)) {
      return reply.status(400).send({ error: "recipient not in conversation" });
    }

    const recipient = await findUserByUsername(toUsername);
    if (!recipient) {
      return reply.status(404).send({ error: "recipient not found" });
    }

    scheduledPayloads.push({
      message_id: messageId,
      to_username: toUsername,
      to_device_id: toDeviceId,
      ciphertext,
      nonce
    });
  }

  const batch = await createScheduledBatch({
    conversationId: conversationId,
    senderId: session.userId,
    senderDeviceId: senderSignalDeviceId,
    scheduledFor: scheduledFor,
    payloads: scheduledPayloads
  });

  return { ok: true, scheduledId: batch.id };
});

server.get(
  "/api/messages/poll",
  { config: { rateLimit: { max: 180, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const query = parseQuery(
    z
      .object({
        since: zSince.optional(),
        sinceId: z.coerce.number().int().positive().optional(),
        limit: zLimit.optional()
      })
      .strict(),
    request.query
  );
  const since = query.since ?? 0;
  const sinceId = query.sinceId ?? null;
  const limit = query.limit ?? 50;

  const messages = await pollMessages(
    session.userId,
    session.deviceId,
    Number.isFinite(since) ? since : 0,
    sinceId,
    limit
  );
  await markDelivered(messages.map((msg) => msg.id));

  return { messages };
});

server.get(
  "/api/messages/history",
  { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const query = parseQuery(
    z
      .object({
        conversationId: zConversationId,
        before: zSince.optional(),
        limit: zLimit.optional()
      })
      .strict(),
    request.query
  );
  const conversationId = query.conversationId;
  const conversation = await getConversationById(conversationId);
  if (!conversation) {
    return reply.status(404).send({ error: "conversation not found" });
  }
  if (!(await isMember(conversationId, session.userId))) {
    return reply.status(403).send({ error: "forbidden" });
  }
  const before = query.before ?? Date.now();
  const limit = Math.min(query.limit ?? 50, 200);
  const messages = await listMessagesBefore(
    conversationId,
    session.userId,
    session.deviceId,
    session.userId,
    before,
    limit
  );
  return { messages };
});

server.get(
  "/api/messages/sent",
  { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const query = parseQuery(
    z.object({ since: zSince.optional(), limit: zLimit.optional() }).strict(),
    request.query
  );
  const since = query.since ?? 0;
  const limit = query.limit ?? 50;

  const statuses = await listSentStatuses(
    session.userId,
    session.deviceId,
    Number.isFinite(since) ? since : 0,
    limit
  );
  return { statuses };
});

server.post("/api/messages/read", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const body = parseBody(
    z.object({ conversationId: zConversationId }).strict(),
    request.body
  );

  if (!(await isMember(body.conversationId, session.userId))) {
    return reply.status(403).send({ error: "forbidden" });
  }

  const user = await findUserById(session.userId);
  if (!user) {
    return reply.status(404).send({ error: "user not found" });
  }
  if (user.privacy_defaults.disable_read_receipts) {
    return { ok: true };
  }
  const conversation = await getConversationById(body.conversationId);
  if (conversation?.type === "direct") {
    const members = await listMembers(body.conversationId);
    const other = members.find((member) => member.id !== session.userId);
    if (other) {
      const override = user.privacy_overrides[other.username];
      if (override?.disable_read_receipts) {
        return { ok: true };
      }
    }
  }
  await markRead(body.conversationId, session.userId);
  return { ok: true };
});

server.post("/api/messages/delete", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const body = parseBody(
    z
      .object({
        scope: z.enum(["self", "all"]),
        groupId: z.string().min(1).max(128).optional(),
        messageId: z.number().int().positive().optional()
      })
      .strict(),
    request.body
  );

  if (body.scope === "all") {
    if (!body.groupId) {
      return reply.status(400).send({ error: "groupId required" });
    }
    const updated = await deleteMessageForAll(body.groupId, session.userId);
    if (!updated) {
      return reply.status(403).send({ error: "cannot delete this message" });
    }
    return { ok: true };
  }

  if (body.scope === "self") {
    if (!body.messageId) {
      return reply.status(400).send({ error: "messageId required" });
    }
    deleteMessageForSelf(body.messageId, session.userId);
    return { ok: true };
  }

  return reply.status(400).send({ error: "invalid scope" });
});

server.post(
  "/api/typing",
  { config: { rateLimit: { max: 180, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const body = parseBody(
    z.object({ conversationId: zConversationId, isTyping: z.boolean() }).strict(),
    request.body
  );

  if (!(await assertNotLocked(request, reply, body.conversationId))) {
    return;
  }

  if (!(await isMember(body.conversationId, session.userId))) {
    return reply.status(403).send({ error: "forbidden" });
  }

  if (!typingState.has(body.conversationId)) {
    typingState.set(body.conversationId, new Map());
  }

  const conversationTyping = typingState.get(body.conversationId)!;
  if (!body.isTyping) {
    conversationTyping.delete(session.userId);
    return { ok: true };
  }

  const user = await findUserById(session.userId);
  if (user?.privacy_defaults.disable_typing_indicator) {
    return { ok: true };
  }
  conversationTyping.set(session.userId, {
    username: user?.username ?? "unknown",
    lastTypedAt: Date.now()
  });

  return { ok: true };
});

server.get(
  "/api/typing",
  { config: { rateLimit: { max: 180, timeWindow: "1 minute" } } },
  async (request, reply) => {
    const session = await getAuthSession(request.headers.authorization);
    if (!session) {
      return reply.status(401).send({ error: "unauthorized" });
    }

    const query = parseQuery(
      z.object({ conversationId: zConversationId }).strict(),
      request.query
    );
    const conversationId = query.conversationId;

    if (!(await isMember(conversationId, session.userId))) {
      return reply.status(403).send({ error: "forbidden" });
    }

    const now = Date.now();
    const conversationTyping = typingState.get(conversationId);
    if (!conversationTyping) {
      return { users: [] };
    }

    const viewer = await findUserById(session.userId);
    const users: string[] = [];
    for (const [id, entry] of conversationTyping.entries()) {
      if (id === session.userId || now - entry.lastTypedAt >= TYPING_TTL_MS) {
        continue;
      }
      const typingUser = await findUserById(id);
      if (!typingUser) {
        continue;
      }
      const override = viewer
        ? typingUser.privacy_overrides[viewer.username] || {}
        : {};
      const privacy = { ...typingUser.privacy_defaults, ...override };
      if (!privacy.disable_typing_indicator) {
        users.push(entry.username);
      }
    }

    return { users };
  });

server.post(
  "/api/reports/create",
  { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const body = parseBody(
    z
      .object({
        conversationId: zConversationId,
        reportedUsername: zUsername,
        messageId: z.number().int().positive().optional(),
        groupId: z.string().min(1).max(128).optional(),
        reason: zReason,
        evidence: z
          .object({
            text: z.string().max(2000).optional(),
            attachments: z
              .array(
                z
                  .object({
                    name: zFileName,
                    kind: z.string().max(20)
                  })
                  .strict()
              )
              .max(10)
              .optional()
          })
          .strict()
          .optional()
      })
      .strict(),
    request.body
  );

  const conversationId = body.conversationId;
  const reportedUsername = body.reportedUsername;
  const reason = body.reason;

  if (!(await isMember(conversationId, session.userId))) {
    return reply.status(403).send({ error: "forbidden" });
  }

  const reported = await findUserByUsername(reportedUsername);
  if (!reported) {
    return reply.status(404).send({ error: "reported user not found" });
  }

  if (!(await isMember(conversationId, reported.id))) {
    return reply.status(400).send({ error: "reported user not in conversation" });
  }

  const evidence = body.evidence
    ? {
        text: body.evidence.text,
        attachments: body.evidence.attachments
      }
    : null;

  const report = await createReport({
    reporterId: session.userId,
    reportedUserId: reported.id,
    conversationId: conversationId,
    messageId: body.messageId || null,
    groupId: body.groupId || null,
    reason,
    evidence: evidence || null
  });

  return { ok: true, reportId: report.id };
});

server.post(
  "/api/calls/start",
  { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const body = parseBody(
    z
      .object({
        callId: z.string().min(8).max(120),
        conversationId: zConversationId,
        toUsername: zUsername,
        toDeviceId: zDeviceId,
        media: z.enum(["audio", "video"]),
        offer: z.string().min(1).max(20000)
      })
      .strict(),
    request.body
  );

  const callId = body.callId;
  const conversationId = body.conversationId;
  const toUsername = body.toUsername;
  const toDeviceId = body.toDeviceId;
  const media = body.media;
  const offer = body.offer;

  const conversation = await getConversationById(conversationId);
  if (!conversation || conversation.type !== "direct") {
    return reply.status(400).send({ error: "direct conversation required" });
  }

  if (!(await isMember(conversationId, session.userId))) {
    return reply.status(403).send({ error: "forbidden" });
  }

  const recipient = await findUserByUsername(toUsername);
  if (!recipient) {
    return reply.status(404).send({ error: "recipient not found" });
  }

  const caller = await findUserById(session.userId);
  if (!caller) {
    return reply.status(404).send({ error: "user not found" });
  }

  const callSession: CallSession = {
    callId,
    conversationId,
    fromUserId: caller.id,
    fromUsername: caller.username,
    fromDeviceId: session.deviceId,
    toUserId: recipient.id,
    toUsername: recipient.username,
    toDeviceId,
    media,
    createdAt: Date.now()
  };
  callSessions.set(callId, callSession);

  pushCallEvent({
    id: Date.now(),
    callId,
    targetUserId: recipient.id,
    targetDeviceId: toDeviceId,
    type: "offer",
    payload: {
      fromUsername: caller.username,
      fromDeviceId: session.deviceId,
      media,
      offer,
      conversationId
    },
    createdAt: Date.now()
  });

  return { ok: true };
});

server.post(
  "/api/calls/answer",
  { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const body = parseBody(
    z
      .object({
        callId: z.string().min(8).max(120),
        answer: z.string().min(1).max(20000)
      })
      .strict(),
    request.body
  );
  const callId = body.callId;
  const answer = body.answer;

  const call = callSessions.get(callId);
  if (!call || call.toUserId !== session.userId) {
    return reply.status(404).send({ error: "call not found" });
  }

  pushCallEvent({
    id: Date.now(),
    callId,
    targetUserId: call.fromUserId,
    targetDeviceId: call.fromDeviceId,
    type: "answer",
    payload: {
      answer,
      fromUsername: call.toUsername,
      fromDeviceId: session.deviceId
    },
    createdAt: Date.now()
  });

  return { ok: true };
});

server.post(
  "/api/calls/ice",
  { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const body = parseBody(
    z
      .object({
        callId: z.string().min(8).max(120),
        candidate: z.string().min(1).max(20000),
        target: z.enum(["caller", "callee"])
      })
      .strict(),
    request.body
  );
  const callId = body.callId;
  const candidate = body.candidate;
  const target = body.target;

  const call = callSessions.get(callId);
  if (!call) {
    return reply.status(404).send({ error: "call not found" });
  }

  const targetUserId =
    target === "caller" ? call.fromUserId : call.toUserId;
  const targetDeviceId =
    target === "caller" ? call.fromDeviceId : call.toDeviceId;

  pushCallEvent({
    id: Date.now(),
    callId,
    targetUserId,
    targetDeviceId,
    type: "ice",
    payload: {
      candidate,
      fromDeviceId: session.deviceId
    },
    createdAt: Date.now()
  });

  return { ok: true };
});

server.post(
  "/api/calls/end",
  { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const body = parseBody(
    z.object({ callId: z.string().min(8).max(120) }).strict(),
    request.body
  );
  const callId = body.callId;

  const call = callSessions.get(callId);
  if (!call) {
    return reply.status(404).send({ error: "call not found" });
  }

  const targetUserId =
    call.fromUserId === session.userId ? call.toUserId : call.fromUserId;
  const targetDeviceId =
    call.fromUserId === session.userId ? call.toDeviceId : call.fromDeviceId;

  pushCallEvent({
    id: Date.now(),
    callId,
    targetUserId,
    targetDeviceId,
    type: "end",
    payload: {},
    createdAt: Date.now()
  });

  callSessions.delete(callId);

  return { ok: true };
});

server.get(
  "/api/calls/poll",
  { config: { rateLimit: { max: 120, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }

  const query = parseQuery(
    z.object({ since: zSince.optional() }).strict(),
    request.query
  );
  const since = query.since ?? 0;
  const cutoff = Date.now() - CALL_EVENT_TTL_MS;

  const events = callEvents.filter((event) => {
    if (event.createdAt < cutoff) {
      return false;
    }
    if (event.createdAt <= (Number.isFinite(since) ? since : 0)) {
      return false;
    }
    return (
      event.targetUserId === session.userId &&
      event.targetDeviceId === session.deviceId
    );
  });

  return { events };
});

server.get("/api/devices", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const sessions = await listSessionsForUser(session.userId);
  return {
    devices: sessions.map((row) => ({
      deviceId: row.device_id,
      deviceName: row.device_name,
      ip: row.ip,
      lastSeenAt: row.last_seen_at,
      createdAt: row.created_at,
      current: row.device_id === session.deviceId
    }))
  };
});

server.post("/api/devices/logout-all", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  await removeSessionsForUser(session.userId);
  clearRefreshCookie(reply, request);
  return { ok: true };
});

server.post("/api/devices/:deviceId/logout", async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const { deviceId } = parseParams(zDeviceIdParam, request.params);
  await removeSessionForDevice(session.userId, deviceId);
  if (deviceId === session.deviceId) {
    clearRefreshCookie(reply, request);
  }
  return { ok: true };
});

server.post(
  "/api/admin/login",
  { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const body = parseBody(
    z
      .object({
        username: zUsername,
        password: z.string().min(6).max(200)
      })
      .strict(),
    request.body
  );
  const username = body.username;
  const password = body.password;

  const bootstrapAdmin = await ensureDefaultAdmin();
  const anyAdmin = bootstrapAdmin || await findAdminByUsername(username);
  if (!anyAdmin && !process.env.APP_ADMIN_BOOTSTRAP_USERNAME) {
    return reply.status(503).send({ error: "admin bootstrap required" });
  }
  const admin = await findAdminByUsername(username);
  if (!admin) {
    return reply.status(401).send({ error: "invalid credentials" });
  }
  const passwordHash = hashPassword(password, admin.password_salt);
  if (
    !crypto.timingSafeEqual(
      Buffer.from(passwordHash, "hex"),
      Buffer.from(admin.password_hash, "hex")
    )
  ) {
    return reply.status(401).send({ error: "invalid credentials" });
  }

  const token = generateToken();
  await createAdminSession(token, admin.id, Date.now() + ADMIN_SESSION_TTL_MS);
  return {
    token,
    username: admin.username,
    role: admin.role,
    permissions: normalizeAdminPermissions(admin),
    expiresAt: Date.now() + ADMIN_SESSION_TTL_MS
  };
});

server.post(
  "/api/admin/password",
  { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply);
  if (!ctx) {
    return;
  }

  const body = parseBody(
    z.object({ password: z.string().min(6).max(200) }).strict(),
    request.body
  );
  const password = body.password;

  await updateAdminUserPassword(ctx.admin.id, password);
  return { ok: true };
});

server.get(
  "/api/admin/admins",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_admins");
  if (!ctx) {
    return;
  }
  const admins = await listAdminUsers();
  return {
    admins: admins.map((admin) => ({
      id: admin.id,
      username: admin.username,
      role: admin.role,
      permissions: normalizeAdminPermissions(admin),
      createdAt: admin.created_at,
      updatedAt: admin.updated_at
    }))
  };
});

server.post(
  "/api/admin/admins",
  { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_admins");
  if (!ctx) {
    return;
  }
  const body = parseBody(
    z
      .object({
        username: zUsername,
        password: z.string().min(6).max(200),
        role: z.enum(["super", "standard"]).optional(),
        permissions: z.array(z.enum(ADMIN_PERMISSIONS)).optional()
      })
      .strict(),
    request.body
  );
  const existing = await findAdminByUsername(body.username);
  if (existing) {
    return reply.status(409).send({ error: "admin already exists" });
  }
  const role = body.role === "super" ? "super" : "standard";
  const permissions =
    role === "super" ? ["*"] : Array.from(new Set(body.permissions || []));
  const created = await createAdminUser(body.username, body.password, role, permissions);
  return {
    admin: {
      id: created.id,
      username: created.username,
      role: created.role,
      permissions: normalizeAdminPermissions(created),
      createdAt: created.created_at
    }
  };
});

server.post(
  "/api/admin/admins/:id/permissions",
  { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_admins");
  if (!ctx) {
    return;
  }
  const { id } = parseParams(zNumericIdParam, request.params);
  const body = parseBody(
    z
      .object({
        permissions: z.array(z.enum(ADMIN_PERMISSIONS)).optional()
      })
      .strict(),
    request.body
  );
  const permissions = Array.from(new Set(body.permissions || []));
  await updateAdminUserPermissions(id, permissions);
  return { ok: true };
});

server.get(
  "/api/admin/settings/lockdown",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_settings");
  if (!ctx) {
    return;
  }
  const config = await getGlobalLockdown();
  return { enabled: config.enabled, allowConversationIds: config.allowConversationIds };
});

server.post(
  "/api/admin/settings/lockdown",
  { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_settings");
  if (!ctx) {
    return;
  }
  const body = parseBody(
    z
      .object({
        enabled: z.boolean(),
        allowConversationIds: z.array(zConversationId).max(500).optional()
      })
      .strict(),
    request.body
  );
  const current = await getGlobalLockdown();
  const allowConversationIds =
    body.allowConversationIds ?? current.allowConversationIds;
  await setGlobalLockdown({
    enabled: body.enabled,
    allowConversationIds
  });
  return { ok: true };
});

server.get(
  "/api/admin/users",
  { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_users");
  if (!ctx) {
    return;
  }

  const users = await Promise.all(
    (await listUsers()).map(async (user) => {
      const profile = await readUserProfileByUserId(user.id);
      return {
        id: user.id,
        username: user.username,
        phone: user.phone,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
        banned: user.banned,
        canSend: user.can_send,
        canCreate: user.can_create,
        allowDirect: user.allow_direct,
        allowGroupInvite: user.allow_group_invite,
        avatar: user.avatar,
        bio: user.bio,
        profilePublic: user.profile_public,
        profile
      };
    })
  );

  return { users };
});

server.get(
  "/api/admin/reports",
  { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_reports");
  if (!ctx) {
    return;
  }

  const reports = await Promise.all((await listReports()).map(async (report) => {
    const reporter = await findUserById(report.reporter_id);
    const reported = await findUserById(report.reported_user_id);
    return {
      id: report.id,
      reporterUsername: reporter?.username ?? "unknown",
      reportedUsername: reported?.username ?? "unknown",
      conversationId: report.conversation_id,
      messageId: report.message_id,
      groupId: report.group_id,
      reason: report.reason,
      evidence: report.evidence,
      status: report.status,
      createdAt: report.created_at,
      reviewedAt: report.reviewed_at,
      action: report.action
    };
  }));

  return { reports };
});

server.post(
  "/api/admin/uploads/direct",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_system");
  if (!ctx) {
    return;
  }

  const part = await (request as typeof request & {
    file: () => Promise<{
      filename: string;
      mimetype: string;
      file: NodeJS.ReadableStream;
    } | undefined>;
  }).file();
  if (!part) {
    return reply.status(400).send({ error: "file required" });
  }

  let filename = (part.filename || "file").toString();
  try {
    filename = zFileName.parse(filename);
  } catch {
    return reply.status(400).send({ error: "invalid filename" });
  }
  const tmpPath = path.join(
    os.tmpdir(),
    `admin-upload-${Date.now()}-${Math.random().toString(16).slice(2)}`
  );
  await fs.promises.mkdir(path.dirname(tmpPath), { recursive: true });
  await new Promise<void>((resolve, reject) => {
    const stream = fs.createWriteStream(tmpPath);
    part.file.on("error", reject);
    stream.on("error", reject);
    stream.on("finish", resolve);
    part.file.pipe(stream);
  });

  try {
    const upload = await uploadAndScanFile({
      filename,
      contentType: part.mimetype,
      tmpPath
    });
    return {
      publicUrl: upload.publicUrl,
      contentType: upload.contentType,
      key: upload.key
    };
  } catch (error) {
    const message = (error as Error).message;
    if (message === "malicious_file") {
      return reply.status(400).send({ error: "malicious file detected" });
    }
    if (message === "uploads_not_configured") {
      return reply.status(503).send({ error: "uploads not configured" });
    }
    return reply.status(500).send({ error: "upload failed" });
  } finally {
    fs.promises.unlink(tmpPath).catch(() => undefined);
  }
});

server.post(
  "/api/admin/system-message",
  { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_system");
  if (!ctx) {
    return;
  }

  const body = parseBody(
    z
      .object({
        text: z.string().max(2000).default(""),
        attachments: z
          .array(
            z
              .object({
                kind: z.enum(["image", "audio", "video", "file"]),
                name: z.string().min(1).max(120),
                data: z.string().min(1).max(8 * 1024 * 1024),
                storageKey: z.string().max(512).optional(),
                contentType: z.string().max(120).optional()
              })
              .strict()
          )
          .max(10)
          .default([])
      })
      .strict()
      .refine(
        (value) => value.text.trim().length > 0 || value.attachments.length > 0,
        { message: "text or attachment required" }
      ),
    request.body
  );
  const text = (body.text || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim();

  const systemUser = await ensureSystemUser();
  const systemConversation = await ensureSystemConversation();
  const messageId = crypto.randomUUID();
  const envelope = JSON.stringify({
    kind: "chat",
    payload: { text, attachments: body.attachments, oneTime: false }
  });

  const recipients = (await listUsers()).filter(
    (user) => user.id !== systemUser.id
  );
  let sentUsers = 0;

  for (const user of recipients) {
    await addUserToSystemConversation(user.id);
    const deviceIds = new Set(
      (await listUserKeyBundles(user.id)).map(
        (bundle) => bundle.session_device_id
      )
    );
    for (const session of await listSessionsForUser(user.id)) {
      if (session.refresh_expires_at > Date.now()) {
        deviceIds.add(session.device_id);
      }
    }
    if (deviceIds.size > 0) {
      sentUsers += 1;
    }
    for (const deviceId of deviceIds) {
      const stored = await createMessage(
        messageId,
        systemConversation.id,
        systemUser.id,
        "system",
        user.id,
        deviceId,
        envelope,
        "plain:system",
        envelope.length
      );
      sendWs(user.id, deviceId, {
        type: "message",
        message: {
          id: stored.id,
          group_id: stored.group_id,
          conversation_id: stored.conversation_id,
          sender_username: systemUser.username,
          sender_device_id: stored.sender_device_id,
          ciphertext: stored.ciphertext,
          nonce: stored.nonce,
          created_at: stored.created_at,
          delivered_at: stored.delivered_at,
          read_at: stored.read_at,
          deleted_at: stored.deleted_at,
          deleted_by: stored.deleted_by
        }
      });
    }
  }

  return { ok: true, sent: sentUsers };
});

server.post(
  "/api/admin/reports/:id/approve",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_reports");
  if (!ctx) {
    return;
  }

  const { id } = parseParams(zNumericIdParam, request.params);
  const reportId = id;
  const report = await findReportById(reportId);
  if (!report) {
    return reply.status(404).send({ error: "report not found" });
  }
  const body = parseBody(
    z.object({ action: z.enum(["ban", "restrict"]).optional() }).strict(),
    request.body
  );
  const action = body.action === "restrict" ? "restrict" : "ban";
  await updateReportStatus(reportId, "approved", action);

  if (action === "ban") {
    await updateUserFlags(report.reported_user_id, {
      banned: true,
      can_send: false,
      can_create: false
    });
    await removeSessionsForUser(report.reported_user_id);
  } else {
    await updateUserFlags(report.reported_user_id, {
      banned: false,
      can_send: false,
      can_create: false
    });
  }

  return { ok: true };
});

server.post(
  "/api/admin/reports/:id/reject",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_reports");
  if (!ctx) {
    return;
  }

  const { id } = parseParams(zNumericIdParam, request.params);
  const reportId = id;
  const report = await findReportById(reportId);
  if (!report) {
    return reply.status(404).send({ error: "report not found" });
  }

  await updateReportStatus(reportId, "rejected", null);
  return { ok: true };
});

server.get(
  "/api/admin/users/:id/profile-json",
  { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_users");
  if (!ctx) {
    return;
  }

  const { id } = parseParams(zNumericIdParam, request.params);
  const userId = id;
  const user = await findUserById(userId);
  if (!user) {
    return reply.status(404).send({ error: "user not found" });
  }

  const profile = await readUserProfileByUserId(user.id);
  const payload = {
    user: {
      id: user.id,
      username: user.username,
      phone: user.phone,
      firstName: user.first_name,
      lastName: user.last_name,
      createdAt: user.created_at
    },
    profile
  };

  reply.header("Content-Type", "application/json");
  reply.header(
    "Content-Disposition",
    `attachment; filename="${user.username}-metadata.json"`
  );
  return payload;
});

server.post(
  "/api/admin/users/:id/flags",
  { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_users");
  if (!ctx) {
    return;
  }

  const { id } = parseParams(zNumericIdParam, request.params);
  const userId = id;
  const body = parseBody(
    z
      .object({
        banned: zOptionalBoolean,
        canSend: zOptionalBoolean,
        canCreate: zOptionalBoolean,
        allowDirect: zOptionalBoolean,
        allowGroupInvite: zOptionalBoolean
      })
      .strict(),
    request.body
  );

  const user = await updateUserFlags(userId, {
    banned: body.banned,
    can_send: body.canSend,
    can_create: body.canCreate,
    allow_direct: body.allowDirect,
    allow_group_invite: body.allowGroupInvite
  });

  if (!user) {
    return reply.status(404).send({ error: "user not found" });
  }

  return { ok: true };
});

server.post(
  "/api/admin/users/:id/password",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_users");
  if (!ctx) {
    return;
  }

  const { id } = parseParams(zNumericIdParam, request.params);
  const userId = id;
  const body = parseBody(
    z.object({ password: z.string().min(6).max(200) }).strict(),
    request.body
  );
  const password = body.password;

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const ok = await updateUserPassword(userId, passwordHash, salt);
  if (!ok) {
    return reply.status(404).send({ error: "user not found" });
  }
  await removeSessionsForUser(userId);

  return { ok: true };
});

server.post(
  "/api/admin/users/:id/delete",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_users");
  if (!ctx) {
    return;
  }

  const { id } = parseParams(zNumericIdParam, request.params);
  const userId = id;
  const ok = await deleteUserAndData(userId);
  if (!ok) {
    return reply.status(404).send({ error: "user not found" });
  }

  return { ok: true };
});

server.get(
  "/api/admin/conversations",
  { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_conversations");
  if (!ctx) {
    return;
  }

  const conversations = await Promise.all(
    (await listConversations()).map(async (conv) => {
      const members = (await listMembers(conv.id)).map((member) => member.username);
      return {
        id: conv.id,
        type: conv.type,
        name: conv.name,
        ownerId: conv.owner_id,
        visibility: conv.visibility,
        createdAt: conv.created_at,
        members
      };
    })
  );

  return { conversations };
});

server.get(
  "/api/admin/metrics",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_system");
  if (!ctx) {
    return;
  }
  const avgLatency =
    metrics.requests > 0 ? metrics.latencyMsTotal / metrics.requests : 0;
  return {
    requests: metrics.requests,
    errors: metrics.errors,
    decryptFailures: metrics.decryptFailures,
    avgLatencyMs: Number(avgLatency.toFixed(2))
  };
});

server.get(
  "/api/admin/blocked",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_system");
  if (!ctx) {
    return;
  }
  const query = parseQuery(
    z.object({ limit: z.coerce.number().int().min(1).max(500).optional() }).strict(),
    request.query
  );
  const rows = await listBlockedEvents(query.limit ?? 200);
  return {
    items: rows.map((row) => ({
      id: row.id,
      reason: row.reason,
      createdAt: row.created_at,
      metadata: row.metadata ?? null,
      conversation: {
        id: row.conversation_id,
        name: row.conversation?.name ?? null,
        type: row.conversation?.type ?? "unknown"
      },
      user: {
        id: row.user_id,
        username: row.user?.username ?? "unknown"
      }
    }))
  };
});

server.post(
  "/api/metrics/decrypt-failed",
  { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const session = await getAuthSession(request.headers.authorization);
  if (!session) {
    return reply.status(401).send({ error: "unauthorized" });
  }
  const body = parseBody(
    z
      .object({
        error: z.string().max(500).optional(),
        sender: z.string().max(32).optional(),
        senderDeviceId: z.number().int().positive().optional(),
        messageId: z.union([z.number().int().positive(), z.string().max(128)]).optional(),
        nonce: z.string().max(128).optional()
      })
      .strict(),
    request.body || {}
  );
  metrics.decryptFailures += 1;
  server.log.warn(
    {
      decryptFailures: metrics.decryptFailures,
      userId: session.userId,
      receiverDeviceId: session.deviceId,
      ...body
    },
    "decrypt failure"
  );
  return { ok: true };
});

server.post(
  "/api/admin/conversations/:id/delete",
  { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
  async (request, reply) => {
  const ctx = await requireAdmin(request, reply, "manage_conversations");
  if (!ctx) {
    return;
  }

  const { id } = parseParams(zIdParam, request.params);
  const conversationId = id;
  const ok = await deleteConversation(conversationId);
  if (!ok) {
    return reply.status(404).send({ error: "conversation not found" });
  }

  return { ok: true };
});

const port = Number(process.env.PORT || 3001);
setInterval(() => {
  flushScheduledBatches().catch(() => undefined);
}, 2000);

server
  .listen({ port, host: "0.0.0.0" })
  .catch((err) => {
    server.log.error(err);
    process.exit(1);
  });
