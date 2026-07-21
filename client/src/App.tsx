
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode
} from "react";
import {
  adminDownloadUserMetadata,
  adminDeleteConversation,
  adminDeleteUser,
  adminCreateAdmin,
  API_BASE,
  adminGetLockdown,
  adminListAdmins,
  adminListBlockedEvents,
  adminListConversations,
  adminListUsers,
  adminLogin,
  adminResetUserPassword,
  adminSendSystemMessage,
  adminUploadDirect,
  adminSetLockdown,
  adminUpdateAdminPermissions,
  adminUpdatePassword,
  adminUpdateUserFlags,
  addConversationMember,
  addSocialView,
  answerCall,
  createUpload,
  createDownloadUrl,
  uploadDirect,
  createConversation,
  fetchConversationSettings,
  createSocialComment,
  createSocialPost,
  createInviteLink,
  deleteMessage,
  disableTwoFactor,
  endCall,
  enableTwoFactor,
  fetchKeyBundle,
  fetchLinkPreview,
  fetchMembers,
  fetchMessageHistory,
  fetchProfile,
  fetchPublicProfile,
  fetchRoster,
  updateConversationSettings,
  fetchSocialComments,
  fetchSocialFeed,
  fetchSocialFollows,
  fetchSocialNotifications,
  fetchSocialStories,
  fetchSocialInsights,
  fetchUserStatus,
  fetchTyping,
  followSocialUser,
  listConversations,
  listDevices,
  listInviteLinks,
  login,
  logoutAllDevices,
  logoutDevice,
  markRead,
  pollCalls,
  publishKeyBundle,
  pollMessages,
  pollSentStatuses,
  redeemInviteLink,
  removeConversationMember,
  revokeInviteLink,
  sendIceCandidate,
  sendMessage,
  scheduleMessage,
  setAdminToken,
  setAuthSession,
  setTyping,
  signup,
  startCall,
  toggleSocialLike,
  toggleSocialSave,
  unfollowSocialUser,
  updateConversationRole,
  updateContactPrivacy,
  updateProfile,
  refreshSession,
  requestWsTicket,
  reportDecryptFailure
} from "./api";
import { mergeMessages } from "./messageUtils";
import {
  decryptSignalMessage,
  encryptSignalMessage,
  ensureLocalKeys,
  ensureSession,
  hasLocalKeys,
  isSignalSupported,
  exportSignalState,
  importSignalState,
  resetSignalState
} from "./signal";
import {
  cacheEncryptedMessages,
  cacheDecryptedMessage,
  cacheMediaItems,
  clearCachedMedia,
  clearCachedMessages,
  getCacheStats,
  loadCachedMessages,
  loadCachedMedia,
  pruneCachedMedia,
  pruneCachedMessages
} from "./messageCache";
import { countries, defaultCountry, type Country } from "./countries";

type IconName =
  | "chats"
  | "social"
  | "media"
  | "saved"
  | "settings"
  | "privacy"
  | "manage"
  | "focus"
  | "call"
  | "video"
  | "info"
  | "message"
  | "send";

function UiIcon({ name }: { name: IconName }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  switch (name) {
    case "chats":
      return <svg {...common}><path d="M7 10h10M7 14h6" /><path d="M5 19l-1-4a8 8 0 1 1 3 3z" /></svg>;
    case "social":
      return <svg {...common}><circle cx="12" cy="12" r="3.5" /><path d="M19.4 15a7.97 7.97 0 0 0 0-6M4.6 9a7.97 7.97 0 0 0 0 6M15 4.6a7.97 7.97 0 0 0-6 0M9 19.4a7.97 7.97 0 0 0 6 0" /></svg>;
    case "media":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m9 10 2.5 2.5L14 10l4 5H6z" /></svg>;
    case "saved":
      return <svg {...common}><path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1z" /></svg>;
    case "settings":
      return <svg {...common}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-.4-1 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1-.4 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 .4 1 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.28.3.48.64.6 1 .08.32.09.65.09 1 0 .35-.01.68-.09 1-.12.36-.32.7-.6 1Z" /></svg>;
    case "privacy":
      return <svg {...common}><path d="M12 3 5 6v6c0 5 3.4 8.74 7 9 3.6-.26 7-4 7-9V6z" /><path d="M9.5 12a2.5 2.5 0 1 1 5 0v2h-5z" /></svg>;
    case "manage":
      return <svg {...common}><path d="M4 7h16M4 12h16M4 17h10" /></svg>;
    case "focus":
      return <svg {...common}><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 3" /></svg>;
    case "call":
      return <svg {...common}><path d="M5 4h4l2 5-2.5 1.5a15 15 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>;
    case "video":
      return <svg {...common}><rect x="3" y="6" width="13" height="12" rx="3" /><path d="m16 10 5-3v10l-5-3z" /></svg>;
    case "info":
      return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 10v6M12 7h.01" /></svg>;
    case "message":
      return <svg {...common}><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 2 1.3-4A8.5 8.5 0 1 1 21 11.5Z" /></svg>;
    case "send":
      return <svg {...common}><path d="M22 2 11 13" /><path d="m22 2-7 20-4-9-9-4z" /></svg>;
  }
}

const STORAGE_KEYS = {
  username: "messager.username",
  token: "messager.token",
  refreshToken: "messager.refreshToken",
  tokenExpires: "messager.tokenExpires",
  keyTrustPrefix: "messager.keys.trust.",
  pinnedPrefix: "messager.pinned.",
  starredPrefix: "messager.starred.",
  savedPrefix: "messager.saved.",
  chatMediaPrefix: "messager.chatmedia.",
  focusPrefix: "messager.focus.",
  settingsPrefix: "messager.settings.",
  settingsUiPrefix: "messager.settings.ui.",
  keyBackupPrefix: "messager.keys.backup.",
  pollCursorPrefix: "messager.poll.cursor.",
  keyVerifyPrefix: "messager.keys.verify.",
  socialCollectionsPrefix: "messager.social.collections.",
  socialPinnedPrefix: "messager.social.pinned.",
  draftsPrefix: "messager.drafts.",
  quickReplies: "messager.quickReplies",
  quietHoursPrefix: "messager.quiet.",
  pinnedMediaPrefix: "messager.pinned.media.",
  forwardRulesPrefix: "messager.forward.rules.",
  templatesKey: "messager.chat.templates",
  outboxPrefix: "messager.outbox."
};

function readStoredAccessToken(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return (
    window.sessionStorage.getItem(STORAGE_KEYS.token) ||
    localStorage.getItem(STORAGE_KEYS.token) ||
    ""
  );
}

function persistAccessToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.removeItem(STORAGE_KEYS.token);
}

function clearStoredAccessToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.token);
}

const ADMIN_PERMISSION_OPTIONS: { key: AdminPermission; label: string }[] = [
  { key: "manage_users", label: "Manage users" },
  { key: "manage_conversations", label: "Manage conversations" },
  { key: "manage_reports", label: "Manage reports" },
  { key: "manage_system", label: "Manage system" },
  { key: "manage_settings", label: "Manage settings" },
  { key: "manage_social", label: "Manage social" },
  { key: "manage_admins", label: "Manage admins" }
];

const MAX_TEXT_LENGTH = 4000;
const INLINE_ATTACHMENT_LIMIT = 5 * 1024 * 1024;
const LIVE_LOCATION_DURATION_MINUTES = 15;
const LIVE_LOCATION_THROTTLE_MS = 12000;

type Attachment = {
  kind: "image" | "audio" | "video" | "file" | "location";
  name: string;
  data: string;
  storageKey?: string;
  contentType?: string;
};

type LocationAttachmentData = {
  lat: number;
  lng: number;
  accuracy?: number;
  live?: boolean;
  liveId?: string;
  expiresAt?: number;
  label?: string;
};

type UploadQueueItem = {
  id: string;
  file: File;
  name: string;
  progress: number;
  status: "queued" | "uploading" | "done" | "failed";
  error?: string;
};

type LinkPreview = {
  url: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  siteName?: string | null;
};

type MessagePayload = {
  text: string;
  attachments: Attachment[];
  oneTime?: boolean;
  linkPreview?: LinkPreview | null;
  forwardedFrom?: string;
};

type OutboxItem = {
  id: string;
  conversationId: number;
  payload: MessagePayload;
  messageId: string;
  createdAt: number;
  attempts: number;
  nextAttemptAt: number;
  lastError?: string;
};

type OutboxStatus = "queued" | "retrying" | "failed";

type ChatMessage = {
  id: number | string;
  groupId: string;
  conversationId: number;
  sender: string;
  payload: MessagePayload;
  createdAt: number;
  deletedAt: number | null;
  encrypted?: {
    ciphertext: string;
    nonce: string;
    senderDeviceId: number;
  };
};

type SavedMessage = {
  id: string;
  conversationId: number;
  sender: string;
  payload: MessagePayload;
  createdAt: number;
};

type Conversation = {
  id: number;
  type: "direct" | "group" | "channel";
  name: string | null;
  ownerId: number;
  visibility: "public" | "private";
  forwardEnabled?: boolean;
  quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
  } | null;
  members: Array<{ username: string; publicKey: string }>;
};

type StatusRow = {
  deliveredAt: number | null;
  readAt: number | null;
  deletedAt: number | null;
};

type UserFlags = {
  banned: boolean;
  canSend: boolean;
  canCreate: boolean;
  allowDirect: boolean;
  allowGroupInvite: boolean;
};

type PrivacySettings = {
  hide_online: boolean;
  hide_last_seen: boolean;
  hide_profile_photo: boolean;
  disable_read_receipts: boolean;
  disable_typing_indicator: boolean;
};

type QuietHours = {
  enabled: boolean;
  start: string;
  end: string;
};

type AdminPermission =
  | "manage_users"
  | "manage_conversations"
  | "manage_reports"
  | "manage_system"
  | "manage_settings"
  | "manage_social"
  | "manage_admins";

type AdminAccount = {
  id: number;
  username: string;
  role: "super" | "standard";
  permissions: string[];
  createdAt: number;
  updatedAt: number;
};

type AdminUser = {
  id: number;
  username: string;
  phone: string;
  firstName: string;
  lastName: string;
  createdAt: number;
  banned: boolean;
  canSend: boolean;
  canCreate: boolean;
  allowDirect: boolean;
  allowGroupInvite: boolean;
  avatar: string | null;
  bio: string | null;
  profilePublic: boolean;
  profile: {
    last_ip: string;
    last_user_agent: string;
    last_platform: string;
    last_language: string;
    last_device_model: string;
    last_seen_at: number;
  } | null;
};

type AdminConversation = {
  id: number;
  type: string;
  name: string | null;
  ownerId: number;
  createdAt: number;
  members: string[];
  visibility?: "public" | "private";
};

type AdminBlockedEvent = {
  id: number;
  reason: string;
  createdAt: number;
  metadata: Record<string, unknown> | null;
  conversation: {
    id: number;
    name: string | null;
    type: string;
  };
  user: {
    id: number;
    username: string;
  };
};

type ProfileState = {
  avatar: string | null;
  bio: string;
  profilePublic: boolean;
  allowDirect: boolean;
  allowGroupInvite: boolean;
  privacy: PrivacySettings;
};

type PublicProfile = {
  avatar: string | null;
  bio: string | null;
};

type DeviceInfo = {
  deviceId: string;
  deviceName: string;
  ip: string;
  lastSeenAt: number;
  createdAt: number;
  current: boolean;
};

type SocialPost = {
  id: number;
  user_id: number;
  kind: "post" | "reel" | "story";
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

type SocialFeedItem = {
  post: SocialPost;
  author: { username: string; avatar: string | null; bio?: string | null };
  counts: { likes: number; comments: number; saves: number; views: number };
  viewer: { liked: boolean; saved: boolean };
};

type SocialStoryItem = {
  post: SocialPost;
  author: { username: string; avatar: string | null };
  viewerViewed: boolean;
};

type SocialCommentItem = {
  comment: {
    id: number;
    post_id: number;
    user_id: number;
    text: string;
    created_at: number;
  };
  author: { username: string; avatar: string | null };
};

type SocialNotificationItem = {
  id: number;
  type: "like" | "comment" | "follow";
  createdAt: number;
  seenAt: number | null;
  actor: { username: string; avatar: string | null };
  post: { id: number; mediaUrl: string } | null;
};

type ChatMediaItem = {
  id: string;
  conversationId: number;
  sender: string;
  kind: "image" | "video" | "audio" | "file";
  url: string;
  createdAt: number;
  storageKey?: string;
  contentType?: string;
};

type SettingsPage =
  | "root"
  | "account"
  | "privacy"
  | "notifications"
  | "data"
  | "appearance"
  | "language"
  | "chat"
  | "stickers"
  | "advanced"
  | "about";

type SettingsPrefs = {
  notifications: {
    privateChats: boolean;
    groups: boolean;
    channels: boolean;
    inAppSounds: boolean;
    vibration: boolean;
    messagePreview: boolean;
    callNotifications: boolean;
  };
  data: {
    autoDownloadWifi: boolean;
    autoDownloadMobile: boolean;
    saveToGallery: boolean;
    streaming: boolean;
    keepMediaDays: number;
    cacheMessages: boolean;
    cacheMedia: boolean;
    cacheTtlDays: number;
    cacheMaxMessages: number;
    cacheMediaTtlDays: number;
    cacheMediaMax: number;
  };
  appearance: {
    themeMode: "light" | "dark" | "system";
    accent: "teal" | "blue" | "green" | "amber";
    bubble: "rounded" | "classic";
    fontSize: "small" | "medium" | "large";
    animations: boolean;
    nightMode: "off" | "auto";
  };
  language: {
    app: "auto" | "fa" | "en";
    rtl: boolean;
    region: "auto" | "ir" | "eu" | "us";
  };
  chat: {
    enterToSend: boolean;
    swipeGestures: boolean;
    chatFolders: boolean;
    archivedChats: boolean;
    pinnedChats: boolean;
    chatPreview: boolean;
    allowMentionsDuringQuiet: boolean;
  };
  stickers: {
    emojiStyle: "native" | "apple" | "google";
    animatedEmoji: boolean;
    stickerSets: boolean;
    trending: boolean;
    reactions: boolean;
  };
  advanced: {
    developerMode: boolean;
    debugLogs: boolean;
    experimental: boolean;
    autoTranslate: boolean;
    translationEndpoint: string;
  };
};

const DEFAULT_PREFS: SettingsPrefs = {
  notifications: {
    privateChats: true,
    groups: true,
    channels: true,
    inAppSounds: true,
    vibration: true,
    messagePreview: true,
    callNotifications: true
  },
  data: {
    autoDownloadWifi: true,
    autoDownloadMobile: false,
    saveToGallery: false,
    streaming: true,
    keepMediaDays: 30,
    cacheMessages: true,
    cacheMedia: false,
    cacheTtlDays: 30,
    cacheMaxMessages: 2000,
    cacheMediaTtlDays: 30,
    cacheMediaMax: 800
  },
  appearance: {
    themeMode: "system",
    accent: "teal",
    bubble: "rounded",
    fontSize: "medium",
    animations: true,
    nightMode: "off"
  },
  language: {
    app: "auto",
    rtl: false,
    region: "auto"
  },
  chat: {
    enterToSend: true,
    swipeGestures: true,
    chatFolders: true,
    archivedChats: true,
    pinnedChats: true,
    chatPreview: true,
    allowMentionsDuringQuiet: false
  },
  stickers: {
    emojiStyle: "native",
    animatedEmoji: true,
    stickerSets: true,
    trending: true,
    reactions: true
  },
  advanced: {
    developerMode: false,
    debugLogs: false,
    experimental: false,
    autoTranslate: false,
    translationEndpoint: ""
  }
};

const ACCENT_MAP: Record<
  SettingsPrefs["appearance"]["accent"],
  { accent: string; strong: string; ring: string }
> = {
  teal: { accent: "#5ad6a8", strong: "#19c3a5", ring: "rgba(25,195,165,0.35)" },
  blue: { accent: "#4da3ff", strong: "#3b82f6", ring: "rgba(59,130,246,0.35)" },
  green: { accent: "#5bd39c", strong: "#22c55e", ring: "rgba(34,197,94,0.35)" },
  amber: { accent: "#f6c453", strong: "#f59e0b", ring: "rgba(245,158,11,0.35)" }
};

const SETTINGS_TITLES: Record<SettingsPage, string> = {
  root: "Settings",
  account: "Account",
  privacy: "Privacy & Security",
  notifications: "Notifications & Sounds",
  data: "Data and Storage",
  appearance: "Appearance",
  language: "Language",
  chat: "Chat Settings",
  stickers: "Stickers & Emoji",
  advanced: "Advanced",
  about: "About"
};

type SettingsItemProps = {
  title: string;
  subtitle?: string;
  onClick?: () => void;
  right?: ReactNode;
  danger?: boolean;
};

function SettingsItem({
  title,
  subtitle,
  onClick,
  right,
  danger
}: SettingsItemProps) {
  const wrapperProps = onClick ? { type: "button" as const } : {};
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      {...wrapperProps}
      className={`settings-item${danger ? " danger" : ""}`}
      onClick={onClick}
    >
      <div className="settings-item-text">
        <span className="settings-item-title">{title}</span>
        {subtitle && <span className="settings-item-subtitle">{subtitle}</span>}
      </div>
      <div className="settings-item-right">{right}</div>
    </Wrapper>
  );
}

type SettingsToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
};

function SettingsToggle({ checked, onChange }: SettingsToggleProps) {
  return (
    <label className="tg-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span />
    </label>
  );
}
type RosterMember = {
  id: number;
  username: string;
  role: "owner" | "admin" | "member";
  permissions: { manage_members?: boolean; manage_invites?: boolean } | null;
};

type InviteLink = {
  token: string;
  maxUses: number;
  uses: number;
  expiresAt: number | null;
  revoked: boolean;
  createdAt: number;
};

type CallEvent = {
  id: number;
  callId: string;
  type: "offer" | "answer" | "ice" | "end";
  payload: {
    fromUsername?: string;
    fromDeviceId?: string;
    media?: "audio" | "video";
    offer?: string;
    answer?: string;
    candidate?: string;
    conversationId?: number;
  };
};

type CallState = {
  status: "idle" | "outgoing" | "incoming" | "active";
  callId: string | null;
  peerUsername: string | null;
  media: "audio" | "video";
  conversationId: number | null;
};

type TabFilter = "all" | Conversation["type"];

const tabs: TabFilter[] = ["all", "group", "channel", "direct"];

const defaultPrivacy: PrivacySettings = {
  hide_online: false,
  hide_last_seen: false,
  hide_profile_photo: false,
  disable_read_receipts: false,
  disable_typing_indicator: false
};

function getConversationTitle(conversation: Conversation, self: string): string {
  if (conversation.type === "direct") {
    const other = conversation.members.find((m) => m.username !== self);
    return other ? other.username : "Direct";
  }
  return conversation.name || "Untitled";
}

function parseLocationData(value: string): LocationAttachmentData | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value) as Partial<LocationAttachmentData>;
    const lat = Number(parsed.lat);
    const lng = Number(parsed.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return null;
    }
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return null;
    }
    const accuracy = Number(parsed.accuracy);
    const expiresAt = Number(parsed.expiresAt);
    return {
      lat,
      lng,
      accuracy: Number.isFinite(accuracy) ? accuracy : undefined,
      live: Boolean(parsed.live),
      liveId: typeof parsed.liveId === "string" ? parsed.liveId : undefined,
      expiresAt: Number.isFinite(expiresAt) ? expiresAt : undefined,
      label: typeof parsed.label === "string" ? parsed.label : undefined
    };
  } catch {
    return null;
  }
}

function getPreview(payload: MessagePayload): string {
  const trimmed = payload.text.trim();
  if (trimmed) {
    const text = trimmed.length > 40 ? `${trimmed.slice(0, 40)}...` : trimmed;
    return payload.oneTime ? `One-time: ${text}` : text;
  }
  if (payload.linkPreview) {
    const title = payload.linkPreview.title || payload.linkPreview.siteName;
    if (title) {
      return `[Link] ${title}`;
    }
    return `[Link] ${payload.linkPreview.url}`;
  }
  if (payload.attachments.length === 0) {
    return payload.oneTime ? "One-time message" : "";
  }
  const first = payload.attachments[0];
  const label =
    first.kind === "image"
      ? "Image"
      : first.kind === "video"
        ? "Video"
        : first.kind === "audio"
          ? "Audio"
          : first.kind === "location"
            ? parseLocationData(first.data)?.live
              ? "Live location"
              : "Location"
            : "File";
  if (payload.attachments.length === 1) {
    return `[${label}]`;
  }
  return `[${label} +${payload.attachments.length - 1}]`;
}

function parsePayload(text: string): MessagePayload {
  try {
    const parsed = JSON.parse(text) as MessagePayload & { oneTime?: boolean };
    if (typeof parsed.text === "string" && Array.isArray(parsed.attachments)) {
      return {
        text: sanitizeText(parsed.text),
        attachments: parsed.attachments
          .map((entry) => normalizeAttachment(entry))
          .filter((entry): entry is Attachment => Boolean(entry)),
        oneTime: Boolean(parsed.oneTime),
        linkPreview: parsed.linkPreview || null
      };
    }
  } catch {
    // fall back to plain text
  }
  return {
    text: sanitizeText(text),
    attachments: [],
    oneTime: false,
    linkPreview: null
  };
}

function sanitizeText(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, MAX_TEXT_LENGTH);
}

function isSafeUrl(value: string): boolean {
  return /^(https?:|data:|blob:)/i.test(value);
}

function normalizeAttachment(raw: unknown): Attachment | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const entry = raw as Partial<Attachment> & {
    storageKey?: string;
    contentType?: string;
  };
  const kind = entry.kind;
  if (
    kind !== "image" &&
    kind !== "audio" &&
    kind !== "video" &&
    kind !== "file" &&
    kind !== "location"
  ) {
    return null;
  }
  const data = typeof entry.data === "string" ? entry.data : "";
  if (kind === "location") {
    const location = parseLocationData(data);
    if (!location) {
      return null;
    }
    const fallbackName = location.live ? "Live location" : "Location";
    const name = sanitizeFilename(entry.name || fallbackName);
    return {
      kind,
      name,
      data
    };
  }
  const name = sanitizeFilename(entry.name || "attachment");
  const safeData = data && isSafeUrl(data) ? data : "";
  const storageKey =
    typeof entry.storageKey === "string" && entry.storageKey.length > 0
      ? entry.storageKey
      : undefined;
  const contentType =
    typeof entry.contentType === "string" && entry.contentType.length > 0
      ? entry.contentType
      : undefined;
  if (!safeData && !storageKey) {
    return null;
  }
  return {
    kind,
    name,
    data: safeData,
    storageKey,
    contentType
  };
}

function needsAttachmentUrl(
  attachment: Attachment,
  cache: Record<string, { url: string; expiresAt: number }>
): boolean {
  if (attachment.data && isSafeUrl(attachment.data)) {
    return false;
  }
  if (!attachment.storageKey) {
    return false;
  }
  const cached = cache[attachment.storageKey];
  return !cached || cached.expiresAt <= Date.now();
}

function extractFirstUrl(value: string): string | null {
  const match = value.match(/https?:\/\/[^\s]+/i);
  return match ? match[0] : null;
}

function extractTagsFromCaption(value: string): string[] {
  const matches = value.match(/#[a-zA-Z0-9_]+/g) || [];
  const tags = new Set<string>();
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

function getPostTags(post: SocialPost): string[] {
  if (Array.isArray(post.tags) && post.tags.length > 0) {
    return post.tags.map((tag) => tag.toLowerCase());
  }
  return extractTagsFromCaption(post.caption || "");
}

function sanitizeFilename(value: string): string {
  return value
    .replace(/[\\/:*?"<>|]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function isAllowedMime(type: string): boolean {
  return true;
}

function normalizeContentType(type: string): string {
  if (!type || type === "image/svg+xml") {
    return "application/octet-stream";
  }
  return type;
}

function resolveAttachmentKind(type: string): Attachment["kind"] {
  if (type.startsWith("image/") && type !== "image/svg+xml") return "image";
  if (type.startsWith("video/")) return "video";
  if (type.startsWith("audio/")) return "audio";
  return "file";
}


function renderInlineText(text: string, keyPrefix: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return (
        <strong key={`${keyPrefix}-b-${index}`}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return (
        <em key={`${keyPrefix}-i-${index}`}>
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
      return (
        <code key={`${keyPrefix}-c-${index}`}>
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={`${keyPrefix}-t-${index}`}>{part}</span>;
  });
}

function renderInlineSegment(text: string, keyPrefix: string, query: string) {
  if (!query.trim()) {
    return renderInlineText(text, keyPrefix);
  }
  if (text.includes("**") || text.includes("`") || text.includes("*")) {
    return renderInlineText(text, keyPrefix);
  }
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(escaped, "gi");
  const parts = text.split(regex);
  const matches = text.match(regex);
  if (!matches) {
    return renderInlineText(text, keyPrefix);
  }
  return parts.flatMap((part, index) => {
    const nodes: Array<JSX.Element> = [
      <span key={`${keyPrefix}-p-${index}`}>{part}</span>
    ];
    if (matches[index]) {
      nodes.push(
        <mark key={`${keyPrefix}-m-${index}`} className="text-highlight">
          {matches[index]}
        </mark>
      );
    }
    return nodes;
  });
}

function renderMessageText(text: string, query = "") {
  const lines = text.split("\n");
  const urlRegex = /(https?:\/\/[^\s]+)/i;
  return lines.map((line, lineIndex) => {
    const parts = line.split(/(https?:\/\/[^\s]+)/gi);
    const rendered = parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return (
          <a
            key={`url-${lineIndex}-${index}`}
            href={part}
            target="_blank"
            rel="noreferrer"
          >
            {part}
          </a>
        );
      }
      const mentionParts = part.split(/(@[a-zA-Z0-9_]{3,32})/g);
      return (
        <span key={`span-${lineIndex}-${index}`}>
          {mentionParts.map((chunk, mentionIndex) => {
            if (chunk.startsWith("@")) {
              return (
                <span key={`mention-${lineIndex}-${index}-${mentionIndex}`} className="mention">
                  {chunk}
                </span>
              );
            }
            return (
              <span key={`text-${lineIndex}-${index}-${mentionIndex}`}>
                {renderInlineSegment(
                  chunk,
                  `inline-${lineIndex}-${index}-${mentionIndex}`,
                  query
                )}
              </span>
            );
          })}
        </span>
      );
    });
    return (
      <span key={`line-${lineIndex}`}>
        {rendered}
        {lineIndex < lines.length - 1 && <br />}
      </span>
    );
  });
}

type SignalEnvelope =
  | { kind: "chat"; payload: MessagePayload }
  | {
      kind: "sender-key";
      senderKey: string;
    };

function parseSignalEnvelope(text: string): SignalEnvelope | null {
  try {
    const parsed = JSON.parse(text) as SignalEnvelope;
    if (parsed?.kind === "chat" && parsed.payload) {
      return parsed;
    }
    if (
      parsed?.kind === "sender-key" &&
      typeof parsed.senderKey === "string"
    ) {
      return parsed;
    }
  } catch {
    return null;
  }
  return null;
}

function matchesQuery(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase());
}

function attachmentKey(messageId: number | string, index: number): string {
  return `${messageId}-${index}`;
}

function extractMentions(text: string): string[] {
  const matches = text.match(/@[a-zA-Z0-9_]{3,32}/g);
  if (!matches) {
    return [];
  }
  return Array.from(new Set(matches.map((item) => item.slice(1).toLowerCase())));
}

function toMinutes(value: string): number | null {
  const [h, m] = value.split(":").map((part) => Number(part));
  if (!Number.isFinite(h) || !Number.isFinite(m)) {
    return null;
  }
  return h * 60 + m;
}

function isQuietHoursActive(settings: QuietHours | undefined): boolean {
  if (!settings || !settings.enabled) {
    return false;
  }
  const start = toMinutes(settings.start);
  const end = toMinutes(settings.end);
  if (start === null || end === null) {
    return false;
  }
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  if (start === end) {
    return true;
  }
  if (start < end) {
    return current >= start && current < end;
  }
  return current >= start || current < end;
}

function spamScore(text: string): number {
  const lowered = text.toLowerCase();
  const urlCount = (lowered.match(/https?:\/\//g) || []).length;
  const repeated = (lowered.match(/(.)\1{6,}/g) || []).length;
  const emojiBurst = (lowered.match(/[\u{1F300}-\u{1FAFF}]/gu) || []).length;
  let score = 0;
  score += urlCount * 3;
  score += repeated * 2;
  score += Math.floor(emojiBurst / 6);
  score += lowered.length > 400 ? 2 : 0;
  return score;
}

function getDeviceInfo() {
  const anyNavigator = navigator as typeof navigator & {
    userAgentData?: { platform?: string; model?: string };
  };

  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    deviceModel: anyNavigator.userAgentData?.model || ""
  };
}

function getDeviceId(): string {
  const key = "messager.deviceId";
  const existing = localStorage.getItem(key);
  if (existing) {
    return existing;
  }
  const generated = crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
  localStorage.setItem(key, generated);
  return generated;
}

function getDeviceName(): string {
  const anyNavigator = navigator as typeof navigator & {
    userAgentData?: { platform?: string; model?: string };
  };
  const platform = anyNavigator.userAgentData?.platform || navigator.platform;
  const model = anyNavigator.userAgentData?.model || "";
  return `${platform}${model ? ` ${model}` : ""}`.trim() || "Browser";
}

function getTimeZoneForRegion(region: SettingsPrefs["language"]["region"]): string | undefined {
  switch (region) {
    case "ir":
      return "Asia/Tehran";
    case "eu":
      return "Europe/Berlin";
    case "us":
      return "America/New_York";
    default:
      return undefined;
  }
}

function formatTime(timestamp: number, timeZone?: string): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {})
  });
}

function formatDateLabel(timestamp: number, timeZone?: string): string {
  return new Date(timestamp).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(timeZone ? { timeZone } : {})
  });
}

function formatLastSeen(value: number | null): string {
  if (!value) {
    return "Last seen recently";
  }
  return `Last seen ${new Date(value).toLocaleString()}`;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(value < 10 && index > 0 ? 1 : 0)} ${units[index]}`;
}

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

async function fingerprintKey(base64: string): Promise<string> {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  const digest = await crypto.subtle.digest("SHA-256", bytes.buffer);
  const hash = Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
  return hash.slice(0, 16);
}

export default function App() {
  const [adminRoute, setAdminRoute] = useState(
    window.location.hash === "#admin"
  );
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("messager.theme") || "dark"
  );
  const [settingsStack, setSettingsStack] = useState<SettingsPage[]>(["root"]);
  const settingsPage = settingsStack[settingsStack.length - 1];

  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState(defaultCountry.code);
  const [authStep, setAuthStep] = useState<"phone" | "details">("phone");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [enable2fa, setEnable2fa] = useState(false);
  const [sessionUsername, setSessionUsername] = useState(
    localStorage.getItem(STORAGE_KEYS.username) || ""
  );
  const [token, setToken] = useState(readStoredAccessToken);
  const isLoggedIn = Boolean(token && sessionUsername);
  const [tokenExpiresAt, setTokenExpiresAt] = useState(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.tokenExpires) || "";
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  });
  useEffect(() => {
    if (token) {
      persistAccessToken(token);
    } else {
      clearStoredAccessToken();
    }
  }, [token]);
  const [userFlags, setUserFlags] = useState<UserFlags>({
    banned: false,
    canSend: true,
    canCreate: true,
    allowDirect: true,
    allowGroupInvite: true
  });
  const [profileState, setProfileState] = useState<ProfileState>({
    avatar: null,
    bio: "",
    profilePublic: true,
    allowDirect: true,
    allowGroupInvite: true,
    privacy: { ...defaultPrivacy }
  });
  const [profileIdentity, setProfileIdentity] = useState({
    firstName: "",
    lastName: "",
    phone: ""
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [publicProfiles, setPublicProfiles] = useState<
    Record<string, PublicProfile>
  >({});
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  const [tab, setTab] = useState<TabFilter>("all");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [showConversationInfo, setShowConversationInfo] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [draftsByConversation, setDraftsByConversation] = useState<
    Record<number, string>
  >({});
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [outbox, setOutbox] = useState<OutboxItem[]>([]);
  const [outboxStatusByGroupId, setOutboxStatusByGroupId] = useState<
    Record<string, { status: OutboxStatus; attempts: number; lastError?: string }>
  >({});
  const [connectionStatus, setConnectionStatus] = useState<
    "online" | "reconnecting" | "offline"
  >("online");
  const outboxRef = useRef<OutboxItem[]>([]);
  const outboxSendingRef = useRef(false);
  const [liveLocationActive, setLiveLocationActive] = useState(false);
  const [liveLocationExpiresAt, setLiveLocationExpiresAt] = useState<number | null>(
    null
  );
  const liveLocationWatchRef = useRef<number | null>(null);
  const liveLocationTimerRef = useRef<number | null>(null);
  const liveLocationIdRef = useRef<string | null>(null);
  const liveLocationConversationRef = useRef<number | null>(null);
  const liveLocationLastSentRef = useRef<number>(0);
  const liveLocationActiveRef = useRef(false);
  const [attachmentUrlCache, setAttachmentUrlCache] = useState<
    Record<string, { url: string; expiresAt: number }>
  >({});
  const attachmentUrlPendingRef = useRef<Set<string>>(new Set());
  const translationPendingRef = useRef<Set<string>>(new Set());
  const initialHistoryLoadedRef = useRef<Set<number>>(new Set());
  const [showKeyBackupWarning, setShowKeyBackupWarning] = useState(false);
  const [settingsPrefs, setSettingsPrefs] = useState<SettingsPrefs>(DEFAULT_PREFS);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyCursorByConversation, setHistoryCursorByConversation] = useState<
    Record<number, number>
  >({});
  const [historyExhausted, setHistoryExhausted] = useState<
    Record<number, boolean>
  >({});
  const [status, setStatus] = useState<string | null>(null);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const [directUsername, setDirectUsername] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState("");
  const [groupVisibility, setGroupVisibility] = useState<"public" | "private">(
    "public"
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [conversationQuery, setConversationQuery] = useState("");
  const [messageQuery, setMessageQuery] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [audioDurations, setAudioDurations] = useState<Record<string, number>>(
    {}
  );
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [savedMessages, setSavedMessages] = useState<SavedMessage[]>([]);
  const [activeView, setActiveView] = useState<
    "chat" | "saved" | "explore" | "chat-feed"
  >("chat");
  const [mainSection, setMainSection] = useState<"messages" | "social">(
    "messages"
  );
  const [socialFeedKind, setSocialFeedKind] = useState<"post" | "reel">("post");
  const [socialComposeKind, setSocialComposeKind] = useState<
    "post" | "reel" | "story"
  >("post");
  const [socialFeed, setSocialFeed] = useState<SocialFeedItem[]>([]);
  const [socialStories, setSocialStories] = useState<SocialStoryItem[]>([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [socialSort, setSocialSort] = useState<"latest" | "trending">("latest");
  const [socialCaption, setSocialCaption] = useState("");
  const [socialMedia, setSocialMedia] = useState<File | null>(null);
  const [socialMediaPreview, setSocialMediaPreview] = useState<string | null>(
    null
  );
  const [socialPublishing, setSocialPublishing] = useState(false);
  const [socialVisibility, setSocialVisibility] = useState<"public" | "private">(
    "public"
  );
  const [socialAllowedUsers, setSocialAllowedUsers] = useState<string[]>([]);
  const [socialCommentVisibility, setSocialCommentVisibility] = useState<
    "public" | "friends"
  >("public");
  const [socialTimed, setSocialTimed] = useState(false);
  const [socialScheduleAt, setSocialScheduleAt] = useState<string>("");
  const [socialFilter, setSocialFilter] = useState<"all" | "saved">("all");
  const [socialTagFilter, setSocialTagFilter] = useState<string>("");
  const [socialCollections, setSocialCollections] = useState<
    Record<string, number[]>
  >({});
  const [socialActiveCollection, setSocialActiveCollection] = useState("Saved");
  const [socialNewCollection, setSocialNewCollection] = useState("");
  const [socialPinnedIds, setSocialPinnedIds] = useState<Set<number>>(new Set());
  const [reelMuted, setReelMuted] = useState(true);
  const [socialInsights, setSocialInsights] = useState<{
    posts: number;
    reels: number;
    stories: number;
    likes: number;
    comments: number;
    saves: number;
    views: number;
  } | null>(null);
  const [socialComments, setSocialComments] = useState<
    Record<number, SocialCommentItem[]>
  >({});
  const [activeStory, setActiveStory] = useState<SocialStoryItem | null>(null);
  const [activeCommentsPost, setActiveCommentsPost] = useState<number | null>(
    null
  );
  const [commentDraft, setCommentDraft] = useState("");
  const [storyReplyText, setStoryReplyText] = useState("");
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [socialFollowers, setSocialFollowers] = useState<string[]>([]);
  const [activeReel, setActiveReel] = useState<SocialFeedItem | null>(null);
  const [socialNotifications, setSocialNotifications] = useState<
    SocialNotificationItem[]
  >([]);
  const [chatMediaFeed, setChatMediaFeed] = useState<ChatMediaItem[]>([]);
  const [socialSearch, setSocialSearch] = useState("");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [newQuickReply, setNewQuickReply] = useState("");
  const [quietHoursByConversation, setQuietHoursByConversation] = useState<
    Record<number, QuietHours>
  >({});
  const [pinnedMediaByConversation, setPinnedMediaByConversation] = useState<
    Record<number, string[]>
  >({});
  const [forwardRulesByConversation, setForwardRulesByConversation] = useState<
    Record<number, boolean>
  >({});
  const [pendingForwardMessage, setPendingForwardMessage] =
    useState<ChatMessage | null>(null);
  const [forwardTargetId, setForwardTargetId] = useState<number | null>(null);
  const [chatTemplates, setChatTemplates] = useState<
    Array<{ id: string; name: string; visibility: "public" | "private" }>
  >([]);
  const [translationCache, setTranslationCache] = useState<
    Record<string, string>
  >({});

  const adminHasPermission = (perm: AdminPermission) =>
    adminRole === "super" || adminPermissions.includes(perm);
  const [messageFilters, setMessageFilters] = useState<{
    type:
      | "all"
      | "text"
      | "link"
      | "image"
      | "video"
      | "audio"
      | "file"
      | "location";
    sender: string;
    from: string;
    to: string;
  }>({
    type: "all",
    sender: "",
    from: "",
    to: ""
  });
  const [scheduledAt, setScheduledAt] = useState("");
  const [focusByConversation, setFocusByConversation] = useState<
    Record<number, { mutedUntil: number | null }>
  >({});
  const [focusMinutes, setFocusMinutes] = useState(30);
  const [unreadByConversation, setUnreadByConversation] = useState<
    Record<number, number>
  >({});
  const [lastMessageByConversation, setLastMessageByConversation] = useState<
    Record<number, { sender: string; payload: MessagePayload; createdAt: number }>
  >({});
  const [statusByGroupId, setStatusByGroupId] = useState<
    Record<string, StatusRow>
  >({});
  const [statusByUser, setStatusByUser] = useState<
    Record<string, { online: boolean; lastSeen: number | null }>
  >({});
  const [showContactPrivacy, setShowContactPrivacy] = useState(false);
  const [contactPrivacy, setContactPrivacy] = useState<PrivacySettings>({
    ...defaultPrivacy
  });
  const [showManagePanel, setShowManagePanel] = useState(false);
  const [roster, setRoster] = useState<RosterMember[]>([]);
  const [inviteLinks, setInviteLinks] = useState<InviteLink[]>([]);
  const [manageUsername, setManageUsername] = useState("");
  const [inviteMaxUses, setInviteMaxUses] = useState(1);
  const [inviteExpiresMinutes, setInviteExpiresMinutes] = useState(60);
  const [inviteToken, setInviteToken] = useState("");
  const [pendingInviteToken, setPendingInviteToken] = useState<string | null>(null);

  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminTokenState, setAdminTokenState] = useState<string | null>(null);
  const isAdmin = Boolean(adminTokenState);
  const [adminRole, setAdminRole] = useState<"super" | "standard" | null>(null);
  const [adminPermissions, setAdminPermissions] = useState<string[]>([]);
  const [adminAdmins, setAdminAdmins] = useState<AdminAccount[]>([]);
  const [adminLockdown, setAdminLockdown] = useState(false);
  const [adminLockdownPending, setAdminLockdownPending] = useState(false);
  const [adminLockdownSaving, setAdminLockdownSaving] = useState(false);
  const [adminLockdownAllowIds, setAdminLockdownAllowIds] = useState<number[]>(
    []
  );
  const [adminLockdownAllowInput, setAdminLockdownAllowInput] = useState("");
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminConversations, setAdminConversations] = useState<
    AdminConversation[]
  >([]);
  const [adminBlockedEvents, setAdminBlockedEvents] = useState<
    AdminBlockedEvent[]
  >([]);
  const [adminPermissionEdits, setAdminPermissionEdits] = useState<
    Record<number, string[]>
  >({});
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminAccountUsername, setNewAdminAccountUsername] = useState("");
  const [newAdminAccountPassword, setNewAdminAccountPassword] = useState("");
  const [newAdminAccountRole, setNewAdminAccountRole] = useState<
    "super" | "standard"
  >("standard");
  const [newAdminAccountPermissions, setNewAdminAccountPermissions] = useState<
    string[]
  >([]);
  const [systemMessage, setSystemMessage] = useState("");
  const [systemMessageAttachments, setSystemMessageAttachments] = useState<
    Attachment[]
  >([]);
  const [systemMessageUploading, setSystemMessageUploading] = useState(false);
  const [systemMessageSending, setSystemMessageSending] = useState(false);
  const [showBlueTeam, setShowBlueTeam] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [callState, setCallState] = useState<CallState>({
    status: "idle",
    callId: null,
    peerUsername: null,
    media: "audio",
    conversationId: null
  });
  const [incomingCall, setIncomingCall] = useState<CallEvent | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [importingKeys, setImportingKeys] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const signalSupported = isSignalSupported();
  const [oneTimeMode, setOneTimeMode] = useState(false);
  const [cacheStats, setCacheStats] = useState<{
    messages: number;
    media: number;
    bytes: number;
  } | null>(null);
  const [fingerprintsByUser, setFingerprintsByUser] = useState<
    Record<string, string>
  >({});
  const [verifiedKeysByUser, setVerifiedKeysByUser] = useState<
    Record<string, { fingerprint: string; verifiedAt: number }>
  >({});

  const selectedCountry: Country =
    countries.find((item) => item.code === countryCode) || defaultCountry;
  const phoneDigits = phoneNumber.replace(/\D/g, "");
  const phoneComplete = phoneDigits.length >= 8;
  const displayName =
    [profileIdentity.firstName, profileIdentity.lastName]
      .filter(Boolean)
      .join(" ") || sessionUsername;
  const settingsTitle = SETTINGS_TITLES[settingsPage];
  const displayTimeZone =
    settingsPrefs.language.region === "auto"
      ? settingsPrefs.language.app === "fa" || navigator.language.startsWith("fa")
        ? "Asia/Tehran"
        : undefined
      : getTimeZoneForRegion(settingsPrefs.language.region);

  const lastPollRef = useRef(0);
  const lastPollIdRef = useRef(0);
  const lastStatusPollRef = useRef(0);
  const lastCallPollRef = useRef(0);
  const selectedConversationRef = useRef<number | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const pollDelayRef = useRef(2500);
  const pollIdleRef = useRef(0);
  const pollErrorRef = useRef(0);
  const wsConnectedRef = useRef(false);
  const wsReconnectAttemptsRef = useRef(0);
  const wsRetryTimerRef = useRef<number | null>(null);
  const decryptReportRef = useRef(0);
  const keyBundleCacheRef = useRef(
    new Map<string, { at: number; data: { devices?: any[] } }>()
  );
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const retryDecryptRef = useRef(false);
  const processingMessageIdsRef = useRef<Set<number>>(new Set());
  const processedOneTimeRef = useRef<Set<string>>(new Set());
  const callPeerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const callStateRef = useRef<CallState>(callState);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);
  const callTimeoutRef = useRef<number | null>(null);
  const callStartRef = useRef<number | null>(null);
  const callConversationRef = useRef<number | null>(null);
  const profileLoadedRef = useRef(false);

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash || "";
      if (hash.startsWith("#invite=")) {
        const tokenValue = hash.replace("#invite=", "").trim();
        setAdminRoute(false);
        if (tokenValue) {
          setInviteToken(tokenValue);
          setPendingInviteToken(tokenValue);
        }
        return;
      }
      setAdminRoute(hash === "#admin");
    };
    window.addEventListener("hashchange", onHashChange);
    onHashChange();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("messager.theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!settingsPrefs.appearance) {
      return;
    }
    if (settingsPrefs.appearance.themeMode === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const apply = () => setTheme(media.matches ? "dark" : "light");
      apply();
      const listener = () => apply();
      media.addEventListener?.("change", listener);
      return () => media.removeEventListener?.("change", listener);
    }
    setTheme(settingsPrefs.appearance.themeMode);
    return undefined;
  }, [settingsPrefs.appearance.themeMode]);

  useEffect(() => {
    const palette = ACCENT_MAP[settingsPrefs.appearance.accent];
    document.documentElement.style.setProperty("--accent", palette.accent);
    document.documentElement.style.setProperty("--accent-strong", palette.strong);
    document.documentElement.style.setProperty("--ring", palette.ring);
  }, [settingsPrefs.appearance.accent]);

  useEffect(() => {
    const scale =
      settingsPrefs.appearance.fontSize === "small"
        ? 0.95
        : settingsPrefs.appearance.fontSize === "large"
        ? 1.06
        : 1;
    document.documentElement.style.setProperty("--app-font-scale", String(scale));
  }, [settingsPrefs.appearance.fontSize]);

  useEffect(() => {
    document.documentElement.dataset.bubble = settingsPrefs.appearance.bubble;
    document.documentElement.dataset.animations = settingsPrefs.appearance.animations
      ? "on"
      : "off";
  }, [settingsPrefs.appearance.bubble, settingsPrefs.appearance.animations]);

  useEffect(() => {
    document.documentElement.dir = settingsPrefs.language.rtl ? "rtl" : "ltr";
  }, [settingsPrefs.language.rtl]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    const key = `${STORAGE_KEYS.settingsPrefix}${sessionUsername}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      setOneTimeMode(false);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { oneTimeMode?: boolean };
      setOneTimeMode(Boolean(parsed.oneTimeMode));
    } catch {
      setOneTimeMode(false);
    }
  }, [sessionUsername]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    const key = `${STORAGE_KEYS.settingsPrefix}${sessionUsername}`;
    localStorage.setItem(
      key,
      JSON.stringify({ oneTimeMode: Boolean(oneTimeMode) })
    );
  }, [sessionUsername, oneTimeMode]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    const key = `${STORAGE_KEYS.settingsUiPrefix}${sessionUsername}`;
    const raw = localStorage.getItem(key);
    if (!raw) {
      setSettingsPrefs(DEFAULT_PREFS);
      return;
    }
    try {
      const parsed = JSON.parse(raw) as SettingsPrefs;
      setSettingsPrefs({
        ...DEFAULT_PREFS,
        ...parsed,
        notifications: { ...DEFAULT_PREFS.notifications, ...parsed.notifications },
        data: { ...DEFAULT_PREFS.data, ...parsed.data },
        appearance: { ...DEFAULT_PREFS.appearance, ...parsed.appearance },
        language: { ...DEFAULT_PREFS.language, ...parsed.language },
        chat: { ...DEFAULT_PREFS.chat, ...parsed.chat },
        stickers: { ...DEFAULT_PREFS.stickers, ...parsed.stickers },
        advanced: { ...DEFAULT_PREFS.advanced, ...parsed.advanced }
      });
    } catch {
      setSettingsPrefs(DEFAULT_PREFS);
    }
  }, [sessionUsername]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    const key = `${STORAGE_KEYS.settingsUiPrefix}${sessionUsername}`;
    localStorage.setItem(key, JSON.stringify(settingsPrefs));
  }, [sessionUsername, settingsPrefs]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    localStorage.setItem(
      `${STORAGE_KEYS.draftsPrefix}${sessionUsername}`,
      JSON.stringify(draftsByConversation)
    );
  }, [sessionUsername, draftsByConversation]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.quickReplies,
      JSON.stringify(quickReplies)
    );
  }, [quickReplies]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    localStorage.setItem(
      `${STORAGE_KEYS.quietHoursPrefix}${sessionUsername}`,
      JSON.stringify(quietHoursByConversation)
    );
  }, [sessionUsername, quietHoursByConversation]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    localStorage.setItem(
      `${STORAGE_KEYS.pinnedMediaPrefix}${sessionUsername}`,
      JSON.stringify(pinnedMediaByConversation)
    );
  }, [sessionUsername, pinnedMediaByConversation]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    localStorage.setItem(
      `${STORAGE_KEYS.forwardRulesPrefix}${sessionUsername}`,
      JSON.stringify(forwardRulesByConversation)
    );
  }, [sessionUsername, forwardRulesByConversation]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.templatesKey,
      JSON.stringify(chatTemplates)
    );
  }, [chatTemplates]);

  useEffect(() => {
    if (!showSettings) {
      return;
    }
    setSettingsStack(["root"]);
  }, [showSettings]);

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }
    const draft = draftsByConversation[selectedConversationId] || "";
    setMessageText(draft);
  }, [selectedConversationId]);

  useEffect(() => {
    if (!selectedConversationId) {
      return;
    }
    setDraftsByConversation((prev) => ({
      ...prev,
      [selectedConversationId]: messageText
    }));
  }, [messageText, selectedConversationId]);

  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const el = messageListRef.current;
    if (!el) {
      return;
    }
    const handler = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
      setShowJumpToBottom(!nearBottom);
    };
    handler();
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, [selectedConversationId, activeView, showSettings]);

  useEffect(() => {
    if (!settingsPrefs.advanced.autoTranslate) {
      return;
    }
    const endpoint = settingsPrefs.advanced.translationEndpoint.trim();
    if (!endpoint) {
      return;
    }
    const target =
      settingsPrefs.language.app === "auto"
        ? navigator.language
        : settingsPrefs.language.app;
    for (const message of messages) {
      const text = message.payload?.text;
      if (!text) {
        continue;
      }
      const key = `${message.id}:${text}`;
      if (translationCache[key] || translationPendingRef.current.has(key)) {
        continue;
      }
      translationPendingRef.current.add(key);
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, target })
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          const translation =
            typeof data?.translation === "string" ? data.translation : "";
          if (translation) {
            setTranslationCache((prev) => ({ ...prev, [key]: translation }));
          }
        })
        .catch(() => undefined)
        .finally(() => {
          translationPendingRef.current.delete(key);
        });
    }
  }, [
    messages,
    settingsPrefs.advanced.autoTranslate,
    settingsPrefs.advanced.translationEndpoint,
    settingsPrefs.language.app,
    translationCache
  ]);

  useEffect(() => {
    setAuthSession(token || null, null, tokenExpiresAt || null);
  }, [token, tokenExpiresAt]);

  useEffect(() => {
    setAdminToken(adminTokenState || null);
  }, [adminTokenState]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    const pinnedRaw = localStorage.getItem(
      `${STORAGE_KEYS.pinnedPrefix}${sessionUsername}`
    );
    const starredRaw = localStorage.getItem(
      `${STORAGE_KEYS.starredPrefix}${sessionUsername}`
    );
    const savedRaw = localStorage.getItem(
      `${STORAGE_KEYS.savedPrefix}${sessionUsername}`
    );
    const chatMediaRaw = localStorage.getItem(
      `${STORAGE_KEYS.chatMediaPrefix}${sessionUsername}`
    );
    const focusRaw = localStorage.getItem(
      `${STORAGE_KEYS.focusPrefix}${sessionUsername}`
    );
    const socialCollectionsRaw = localStorage.getItem(
      `${STORAGE_KEYS.socialCollectionsPrefix}${sessionUsername}`
    );
    const socialPinnedRaw = localStorage.getItem(
      `${STORAGE_KEYS.socialPinnedPrefix}${sessionUsername}`
    );
    const draftsRaw = localStorage.getItem(
      `${STORAGE_KEYS.draftsPrefix}${sessionUsername}`
    );
    const quickRepliesRaw = localStorage.getItem(STORAGE_KEYS.quickReplies);
    const quietRaw = localStorage.getItem(
      `${STORAGE_KEYS.quietHoursPrefix}${sessionUsername}`
    );
    const pinnedMediaRaw = localStorage.getItem(
      `${STORAGE_KEYS.pinnedMediaPrefix}${sessionUsername}`
    );
    const forwardRulesRaw = localStorage.getItem(
      `${STORAGE_KEYS.forwardRulesPrefix}${sessionUsername}`
    );
    const outboxRaw = localStorage.getItem(
      `${STORAGE_KEYS.outboxPrefix}${sessionUsername}`
    );
    const templatesRaw = localStorage.getItem(STORAGE_KEYS.templatesKey);
    setPinnedIds(new Set(pinnedRaw ? JSON.parse(pinnedRaw) : []));
    setStarredIds(new Set(starredRaw ? JSON.parse(starredRaw) : []));
    setSavedMessages(savedRaw ? JSON.parse(savedRaw) : []);
    setChatMediaFeed(chatMediaRaw ? JSON.parse(chatMediaRaw) : []);
    setFocusByConversation(focusRaw ? JSON.parse(focusRaw) : {});
    setSocialCollections(socialCollectionsRaw ? JSON.parse(socialCollectionsRaw) : {});
    setSocialPinnedIds(new Set(socialPinnedRaw ? JSON.parse(socialPinnedRaw) : []));
    setDraftsByConversation(draftsRaw ? JSON.parse(draftsRaw) : {});
    setQuickReplies(quickRepliesRaw ? JSON.parse(quickRepliesRaw) : []);
    setQuietHoursByConversation(quietRaw ? JSON.parse(quietRaw) : {});
    setPinnedMediaByConversation(pinnedMediaRaw ? JSON.parse(pinnedMediaRaw) : {});
    setForwardRulesByConversation(
      forwardRulesRaw ? JSON.parse(forwardRulesRaw) : {}
    );
    setOutbox(outboxRaw ? JSON.parse(outboxRaw) : []);
    setChatTemplates(
      templatesRaw
        ? JSON.parse(templatesRaw)
        : [
            { id: "team", name: "Team updates", visibility: "private" },
            { id: "announcements", name: "Announcements", visibility: "public" },
            { id: "support", name: "Support queue", visibility: "public" }
          ]
    );
  }, [sessionUsername]);

  useEffect(() => {
    if (!isLoggedIn || !sessionUsername) {
      return;
    }
    if (!settingsPrefs.data.cacheMessages) {
      return;
    }
    const ttlMs = settingsPrefs.data.cacheTtlDays * 24 * 60 * 60 * 1000;
    loadCachedMessages(
      sessionUsername,
      Math.min(settingsPrefs.data.cacheMaxMessages, 2000),
      ttlMs
    )
      .then((rows) => {
        if (!rows.length) {
          return;
        }
        const cached = rows.map((row) => {
          const envelope = row.plaintext
            ? parseSignalEnvelope(row.plaintext)
            : null;
          const payload = row.plaintext
            ? envelope?.kind === "chat"
              ? envelope.payload
              : parsePayload(row.plaintext)
            : { text: "Encrypted message", attachments: [] };
          return {
            id: row.id,
            groupId: row.groupId,
            conversationId: row.conversationId,
            sender: row.sender,
            payload,
            createdAt: row.createdAt,
            deletedAt: row.deletedAt,
            encrypted: row.plaintext
              ? undefined
              : {
                  ciphertext: row.ciphertext,
                  nonce: row.nonce,
                  senderDeviceId: row.senderDeviceId
                }
          };
        });
        setMessages((prev) => mergeMessages(prev, cached));
      })
      .catch(() => undefined);
  }, [
    isLoggedIn,
    sessionUsername,
    settingsPrefs.data.cacheMessages,
    settingsPrefs.data.cacheTtlDays,
    settingsPrefs.data.cacheMaxMessages
  ]);

  useEffect(() => {
    if (!isLoggedIn || !sessionUsername) {
      return;
    }
    if (!settingsPrefs.data.cacheMedia) {
      return;
    }
    const ttlDays = Math.min(
      settingsPrefs.data.cacheMediaTtlDays,
      settingsPrefs.data.keepMediaDays
    );
    const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
    loadCachedMedia(
      sessionUsername,
      Math.min(settingsPrefs.data.cacheMediaMax, 800),
      ttlMs
    )
      .then((rows) => {
        if (!rows.length) {
          return;
        }
        setChatMediaFeed((prev) => {
          const existing = new Set(prev.map((entry) => entry.id));
          const next = [...prev];
          for (const row of rows) {
            if (existing.has(row.id)) {
              continue;
            }
            next.push({
              id: row.id,
              conversationId: row.conversationId,
              sender: row.sender,
              kind: row.kind,
              url: row.url,
              createdAt: row.createdAt,
              storageKey: (row as { storageKey?: string }).storageKey,
              contentType: (row as { contentType?: string }).contentType
            });
            existing.add(row.id);
          }
          next.sort((a, b) => b.createdAt - a.createdAt);
          return next.slice(0, 500);
        });
      })
      .catch(() => undefined);
  }, [
    isLoggedIn,
    sessionUsername,
    settingsPrefs.data.cacheMedia,
    settingsPrefs.data.cacheMediaTtlDays,
    settingsPrefs.data.cacheMediaMax,
    settingsPrefs.data.keepMediaDays
  ]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    if (!settingsPrefs.data.cacheMessages) {
      clearCachedMessages(sessionUsername).catch(() => undefined);
      localStorage.removeItem(
        `${STORAGE_KEYS.pollCursorPrefix}${sessionUsername}`
      );
    }
  }, [sessionUsername, settingsPrefs.data.cacheMessages]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    if (!settingsPrefs.data.cacheMedia) {
      clearCachedMedia(sessionUsername).catch(() => undefined);
      localStorage.removeItem(
        `${STORAGE_KEYS.chatMediaPrefix}${sessionUsername}`
      );
    }
  }, [sessionUsername, settingsPrefs.data.cacheMedia]);

  useEffect(() => {
    if (!sessionUsername || !settingsPrefs.data.cacheMedia) {
      return;
    }
    const ttlDays = Math.min(
      settingsPrefs.data.cacheMediaTtlDays,
      settingsPrefs.data.keepMediaDays
    );
    const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
    pruneCachedMedia(
      sessionUsername,
      settingsPrefs.data.cacheMediaMax,
      ttlMs
    ).catch(() => undefined);
  }, [
    sessionUsername,
    settingsPrefs.data.cacheMedia,
    settingsPrefs.data.cacheMediaTtlDays,
    settingsPrefs.data.cacheMediaMax,
    settingsPrefs.data.keepMediaDays
  ]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    const raw = localStorage.getItem(
      `${STORAGE_KEYS.pollCursorPrefix}${sessionUsername}`
    );
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as { since: number; sinceId?: number };
      if (Number.isFinite(parsed.since) && parsed.since > lastPollRef.current) {
        lastPollRef.current = parsed.since;
      }
      if (Number.isFinite(parsed.sinceId)) {
        lastPollIdRef.current = parsed.sinceId as number;
      }
    } catch {
      const cursor = Number(raw);
      if (Number.isFinite(cursor) && cursor > lastPollRef.current) {
        lastPollRef.current = cursor;
      }
    }
  }, [sessionUsername]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    localStorage.setItem(
      `${STORAGE_KEYS.savedPrefix}${sessionUsername}`,
      JSON.stringify(savedMessages)
    );
  }, [sessionUsername, savedMessages]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    localStorage.setItem(
      `${STORAGE_KEYS.socialCollectionsPrefix}${sessionUsername}`,
      JSON.stringify(socialCollections)
    );
  }, [sessionUsername, socialCollections]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    if (!socialCollections["Saved"]) {
      setSocialCollections((prev) => ({ ...prev, Saved: prev["Saved"] || [] }));
    }
  }, [sessionUsername, socialCollections]);

  useEffect(() => {
    if (!socialCollections[socialActiveCollection]) {
      setSocialActiveCollection("Saved");
    }
  }, [socialCollections, socialActiveCollection]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    localStorage.setItem(
      `${STORAGE_KEYS.socialPinnedPrefix}${sessionUsername}`,
      JSON.stringify(Array.from(socialPinnedIds))
    );
  }, [sessionUsername, socialPinnedIds]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    localStorage.setItem(
      `${STORAGE_KEYS.chatMediaPrefix}${sessionUsername}`,
      JSON.stringify(chatMediaFeed)
    );
  }, [sessionUsername, chatMediaFeed]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    localStorage.setItem(
      `${STORAGE_KEYS.outboxPrefix}${sessionUsername}`,
      JSON.stringify(outbox)
    );
  }, [sessionUsername, outbox]);

  useEffect(() => {
    if (!sessionUsername || outbox.length === 0) {
      return;
    }
    const pendingMessages = outbox.map((item) => ({
      id: `local-${item.messageId}`,
      groupId: item.messageId,
      conversationId: item.conversationId,
      sender: sessionUsername,
      payload: item.payload,
      createdAt: item.createdAt,
      deletedAt: null
    }));
    setMessages((prev) => mergeMessages(prev, pendingMessages));
    appendChatMedia(pendingMessages);
    setLastMessageByConversation((prev) => {
      const next = { ...prev };
      for (const item of outbox) {
        next[item.conversationId] = {
          sender: sessionUsername,
          payload: item.payload,
          createdAt: item.createdAt
        };
      }
      return next;
    });
  }, [sessionUsername, outbox]);

  useEffect(() => {
    outboxRef.current = outbox;
  }, [outbox]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    localStorage.setItem(
      `${STORAGE_KEYS.focusPrefix}${sessionUsername}`,
      JSON.stringify(focusByConversation)
    );
  }, [sessionUsername, focusByConversation]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setFocusByConversation((prev) => {
        let changed = false;
        const next: Record<number, { mutedUntil: number | null }> = {
          ...prev
        };
        const now = Date.now();
        for (const [key, value] of Object.entries(next)) {
          if (value.mutedUntil && value.mutedUntil <= now) {
            next[Number(key)] = { mutedUntil: null };
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    }, 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    selectedConversationRef.current = selectedConversationId;
    setShowConversationInfo(false);
    if (selectedConversationId) {
      setUnreadByConversation((prev) => ({
        ...prev,
        [selectedConversationId]: 0
      }));
      markRead(selectedConversationId).catch(() => undefined);
    }
  }, [selectedConversationId]);

  useEffect(() => {
    setShowContactPrivacy(false);
    setShowManagePanel(false);
    const convo = conversations.find((item) => item.id === selectedConversationId);
    if (convo?.type === "direct") {
      setContactPrivacy({ ...defaultPrivacy });
    }
  }, [selectedConversationId, conversations]);

  useEffect(() => {
    if (!selectedConversationId || !sessionUsername) {
      return;
    }
    const convo = conversations.find((item) => item.id === selectedConversationId);
    if (!convo || convo.type !== "direct") {
      return;
    }
    const other = convo.members.find((member) => member.username !== sessionUsername);
    if (!other) {
      return;
    }
    getCachedKeyBundle(other.username).catch(() => undefined);
  }, [selectedConversationId, conversations, sessionUsername]);

  const socialAudienceOptions = Array.from(
    new Set([...socialFollowers, ...Array.from(followingUsers)])
  ).sort();
  const mySocialItems = socialFeed.filter(
    (item) => item.author.username === sessionUsername
  );
  const myPostCount = mySocialItems.filter((item) => item.post.kind === "post")
    .length;
  const myReelCount = mySocialItems.filter((item) => item.post.kind === "reel")
    .length;
  const myStoryCount = socialStories.filter(
    (item) => item.author.username === sessionUsername
  ).length;
  const socialTagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of socialFeed) {
      for (const tag of getPostTags(item.post)) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [socialFeed]);

  const activeCollectionIds =
    socialCollections[socialActiveCollection] || [];

  const filteredSocialFeed = socialFeed.filter((item) => {
    if (socialFilter === "saved" && !item.viewer.saved) {
      return false;
    }
    if (
      socialFilter === "saved" &&
      activeCollectionIds.length > 0 &&
      !activeCollectionIds.includes(item.post.id)
    ) {
      return false;
    }
    if (socialTagFilter) {
      const tags = getPostTags(item.post);
      if (!tags.includes(socialTagFilter)) {
        return false;
      }
    }
    if (socialSearch) {
      const needle = socialSearch.toLowerCase();
      return (
        item.author.username.toLowerCase().includes(needle) ||
        (item.post.caption || "").toLowerCase().includes(needle)
      );
    }
    return true;
  });

  const appendChatMedia = (items: ChatMessage[]) => {
    if (items.length === 0) {
      return;
    }
    const newEntries: ChatMediaItem[] = [];
    setChatMediaFeed((prev) => {
      const existing = new Set(prev.map((entry) => entry.id));
      const next = [...prev];
      for (const message of items) {
        if (!message.payload?.attachments?.length) {
          continue;
        }
        message.payload.attachments.forEach((attachment, index) => {
          if (attachment.kind === "location") {
            return;
          }
          const id = `${message.id}-${index}`;
          if (existing.has(id)) {
            return;
          }
          const entry = {
            id,
            conversationId: message.conversationId,
            sender: message.sender,
            kind: attachment.kind,
            url: attachment.data,
            storageKey: attachment.storageKey,
            contentType: attachment.contentType,
            createdAt: message.createdAt
          };
          next.unshift(entry);
          newEntries.push(entry);
          existing.add(id);
        });
      }
      return next.slice(0, 500);
    });
    if (settingsPrefs.data.cacheMedia && sessionUsername && newEntries.length) {
      const ttlDays = Math.min(
        settingsPrefs.data.cacheMediaTtlDays,
        settingsPrefs.data.keepMediaDays
      );
      const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
      cacheMediaItems(sessionUsername, newEntries).catch(() => undefined);
      pruneCachedMedia(
        sessionUsername,
        settingsPrefs.data.cacheMediaMax,
        ttlMs
      ).catch(() => undefined);
    }
  };

  const resolveAttachmentUrl = (attachment: Attachment): string | null => {
    if (attachment.data && isSafeUrl(attachment.data)) {
      return attachment.data;
    }
    if (attachment.storageKey) {
      const cached = attachmentUrlCache[attachment.storageKey];
      if (cached && cached.expiresAt > Date.now()) {
        return cached.url;
      }
    }
    return null;
  };

  const ensureAttachmentUrl = async (attachment: Attachment) => {
    if (!attachment.storageKey) {
      return;
    }
    const key = attachment.storageKey;
    const cached = attachmentUrlCache[key];
    if (cached && cached.expiresAt > Date.now()) {
      return;
    }
    if (attachmentUrlPendingRef.current.has(key)) {
      return;
    }
    attachmentUrlPendingRef.current.add(key);
    try {
      const data = await createDownloadUrl(key);
      const expiresAt =
        Date.now() + Math.max(30, data.expiresIn - 5) * 1000;
      setAttachmentUrlCache((prev) => ({
        ...prev,
        [key]: { url: data.url, expiresAt }
      }));
    } catch (error) {
      setStatus((error as Error).message || "Attachment download failed");
    } finally {
      attachmentUrlPendingRef.current.delete(key);
    }
  };

  const resolveChatMediaUrl = (item: ChatMediaItem): string | null => {
    if (item.url && isSafeUrl(item.url)) {
      return item.url;
    }
    if (item.storageKey) {
      const cached = attachmentUrlCache[item.storageKey];
      if (cached && cached.expiresAt > Date.now()) {
        return cached.url;
      }
    }
    return null;
  };

  const computePollDelay = () => {
    const hidden = document.visibilityState !== "visible";
    let delay = hidden ? 6000 : 1200;
    if (wsConnectedRef.current) {
      delay = Math.max(delay, hidden ? 8000 : 4000);
    }
    delay += Math.min(pollIdleRef.current * 400, 3000);
    if (!navigator.onLine) {
      delay = Math.max(delay, 15000);
    }
    delay += Math.min(pollErrorRef.current * 900, 4500);
    return delay;
  };

  useEffect(() => {
    if (!socialMedia) {
      setSocialMediaPreview(null);
      return;
    }
    const previewUrl = URL.createObjectURL(socialMedia);
    setSocialMediaPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [socialMedia]);

  useEffect(() => {
    return () => {
      stopLiveLocationShare(false);
    };
  }, []);

  useEffect(() => {
    const update = () => {
      setConnectionStatus(navigator.onLine ? "online" : "offline");
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  useEffect(() => {
    if (
      !isLoggedIn ||
      showSettings ||
      activeView !== "explore" ||
      mainSection !== "social"
    ) {
      return;
    }
    loadSocial();
  }, [activeView, isLoggedIn, showSettings, socialFeedKind, socialSort, mainSection]);

  const refreshConversations = async () => {
    try {
      const data = await listConversations();
      setConversations(data.conversations || []);
      if (!selectedConversationId && data.conversations?.length) {
        setSelectedConversationId(data.conversations[0].id);
      }
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const refreshAdminData = async (
    permissions: string[] = adminPermissions,
    role: "super" | "standard" | null = adminRole
  ) => {
    const hasPermission = (perm: AdminPermission) =>
      role === "super" || permissions.includes(perm);
    try {
      if (hasPermission("manage_users")) {
        const usersData = await adminListUsers();
        setAdminUsers(usersData.users || []);
      } else {
        setAdminUsers([]);
      }

      if (hasPermission("manage_conversations")) {
        const conversationsData = await adminListConversations();
        setAdminConversations(conversationsData.conversations || []);
      } else {
        setAdminConversations([]);
      }

      if (hasPermission("manage_admins")) {
        const adminData = await adminListAdmins();
        setAdminAdmins(adminData.admins || []);
      } else {
        setAdminAdmins([]);
      }

      if (hasPermission("manage_settings")) {
        const lockdown = await adminGetLockdown();
        setAdminLockdown(Boolean(lockdown.enabled));
        const allowIds = Array.isArray(lockdown.allowConversationIds)
          ? lockdown.allowConversationIds
          : [];
        setAdminLockdownAllowIds(allowIds);
        setAdminLockdownAllowInput(allowIds.join(", "));
      }

      if (hasPermission("manage_system")) {
        const blocked = await adminListBlockedEvents(200);
        setAdminBlockedEvents(blocked.items || []);
      } else {
        setAdminBlockedEvents([]);
      }
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    refreshConversations();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !pendingInviteToken) {
      return;
    }
    const run = async () => {
      try {
        const data = await redeemInviteLink(pendingInviteToken);
        await refreshConversations();
        if (typeof data.conversationId === "number") {
          setSelectedConversationId(data.conversationId);
        }
        setStatus("Joined with invite");
      } catch (error) {
        setStatus((error as Error).message);
      } finally {
        setPendingInviteToken(null);
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
    };
    run();
  }, [isLoggedIn, pendingInviteToken]);

  useEffect(() => {
    if (!showManagePanel || !selectedConversationId) {
      return;
    }
    fetchConversationSettings(selectedConversationId)
      .then((data) => {
        if (typeof data.forwardEnabled === "boolean") {
          setForwardRulesByConversation((prev) => ({
            ...prev,
            [selectedConversationId]: data.forwardEnabled
          }));
        }
        if (data.quietHours) {
          setQuietHoursByConversation((prev) => ({
            ...prev,
            [selectedConversationId]: data.quietHours
          }));
        }
      })
      .catch(() => undefined);
  }, [showManagePanel, selectedConversationId]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    refreshAdminData();
  }, [isAdmin]);

  useEffect(() => {
    setMainSection("messages");
  }, []);
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    fetchProfile()
      .then((data) => {
        setProfileState({
          avatar: data.avatar ?? null,
          bio: data.bio || "",
          profilePublic: Boolean(data.profilePublic),
          allowDirect: Boolean(data.allowDirect),
          allowGroupInvite: Boolean(data.allowGroupInvite),
          privacy: {
            ...defaultPrivacy,
            ...(data.privacy || {})
          }
        });
        setProfileIdentity({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || ""
        });
        setTwoFactorEnabled(Boolean(data.twoFactorEnabled));
        profileLoadedRef.current = true;
      })
      .catch(() => undefined);
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || !profileLoadedRef.current || !showSettings) {
      return undefined;
    }
    const timer = window.setTimeout(async () => {
      setProfileSaving(true);
      try {
        await updateProfile({
          firstName: profileIdentity.firstName,
          lastName: profileIdentity.lastName,
          avatar: profileState.avatar,
          bio: profileState.bio,
          profilePublic: profileState.profilePublic,
          allowDirect: profileState.allowDirect,
          allowGroupInvite: profileState.allowGroupInvite,
          privacy: profileState.privacy
        });
      } catch {
        // ignore background save errors
      } finally {
        setProfileSaving(false);
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [isLoggedIn, showSettings, profileState, profileIdentity]);

  useEffect(() => {
    if (!isLoggedIn || !signalSupported) {
      return;
    }
    setEncryptionReady(false);
    hasLocalKeys(sessionUsername)
      .then(async (exists) => {
        if (!exists) {
          setEncryptionReady(false);
          setStatus(
            "Encryption keys missing on this device. Import backup or reset encryption."
          );
          return;
        }
        const bundle = await ensureLocalKeys(sessionUsername, false);
        if (!bundle) {
          setEncryptionReady(false);
          setStatus("No local keys found. Import backup or reset encryption.");
          return;
        }
        const backupKey = `${STORAGE_KEYS.keyBackupPrefix}${sessionUsername}`;
        setShowKeyBackupWarning(!localStorage.getItem(backupKey));
        await publishKeyBundle({
          ...bundle,
          sessionDeviceId: getDeviceId()
        });
        keyBundleCacheRef.current.clear();
        setEncryptionReady(true);
      })
      .catch((error) => {
        setEncryptionReady(false);
        setStatus((error as Error).message || "Encryption setup failed.");
      });
  }, [isLoggedIn, sessionUsername]);

  useEffect(() => {
    if (!isLoggedIn || !("Notification" in window)) {
      return;
    }
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => undefined);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!sessionUsername) {
      return;
    }
    if (token && tokenExpiresAt > Date.now()) {
      return;
    }
    refreshSession(getDeviceId())
      .then((data) => {
        setToken(data.token);
        setTokenExpiresAt(data.expiresAt || 0);
        persistAccessToken(data.token);
        localStorage.setItem(
          STORAGE_KEYS.tokenExpires,
          String(data.expiresAt || 0)
        );
      })
      .catch(() => undefined);
  }, [sessionUsername, token, tokenExpiresAt]);

  useEffect(() => {
    if (!token || !tokenExpiresAt) {
      return;
    }
    const interval = window.setInterval(async () => {
      const now = Date.now();
      if (tokenExpiresAt - now > 2 * 60 * 1000) {
        return;
      }
      try {
        const data = await refreshSession(getDeviceId());
        setToken(data.token);
        setTokenExpiresAt(data.expiresAt || 0);
        persistAccessToken(data.token);
        localStorage.setItem(
          STORAGE_KEYS.tokenExpires,
          String(data.expiresAt || 0)
        );
      } catch {
        // ignore refresh errors; next request will fail and user can re-login
      }
    }, 60 * 1000);
    return () => window.clearInterval(interval);
  }, [token, tokenExpiresAt]);

  useEffect(() => {
    if (!isLoggedIn || !showSettings) {
      return;
    }
    setDevicesLoading(true);
    listDevices()
      .then((data) => setDevices(data.devices || []))
      .catch(() => undefined)
      .finally(() => setDevicesLoading(false));
  }, [isLoggedIn, showSettings]);

  useEffect(() => {
    if (!isLoggedIn || !showSettings || !sessionUsername) {
      return;
    }
    let active = true;
    const refresh = () => {
      getCacheStats(sessionUsername)
        .then((stats) => {
          if (active) {
            setCacheStats(stats);
          }
        })
        .catch(() => undefined);
    };
    refresh();
    const interval = window.setInterval(refresh, 8000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isLoggedIn, showSettings, sessionUsername]);

  useEffect(() => {
    if (!token || !sessionUsername) {
      return undefined;
    }

    let isMounted = true;
    const handleIncomingMessage = async (msg: {
      id: number;
      group_id: string;
      conversation_id: number;
      sender_username: string;
      sender_device_id?: string;
      ciphertext: string;
      nonce: string;
      created_at: number;
      deleted_at?: number | null;
    }) => {
      if (
        processingMessageIdsRef.current.has(msg.id) ||
        messagesRef.current.some((item) => item.id === msg.id)
      ) {
        return;
      }
      processingMessageIdsRef.current.add(msg.id);

      if (settingsPrefs.data.cacheMessages) {
        cacheEncryptedMessages(sessionUsername, [msg]).catch(() => undefined);
        const ttlMs = settingsPrefs.data.cacheTtlDays * 24 * 60 * 60 * 1000;
        pruneCachedMessages(
          sessionUsername,
          settingsPrefs.data.cacheMaxMessages,
          ttlMs
        ).catch(() => undefined);
      }
      if (
        messagesRef.current.some(
          (item) =>
            typeof item.id === "string" &&
            item.id.startsWith("local-") &&
            item.groupId === msg.group_id &&
            item.sender === msg.sender_username
        )
      ) {
        return;
      }

      let payload: MessagePayload = { text: "Encrypted message", attachments: [] };
      let encrypted: ChatMessage["encrypted"];
      try {
        let plaintext = "";
        if (msg.nonce?.startsWith("signal:")) {
          if (!signalSupported || !encryptionReady) {
            throw new Error("decrypt not available");
          }
          plaintext = await decryptSignalMessage(
            sessionUsername,
            msg.sender_username,
            Number(msg.sender_device_id) || 1,
            msg.ciphertext,
            msg.nonce
          );
        } else {
          plaintext = msg.ciphertext;
        }
        const envelope = parseSignalEnvelope(plaintext);
        if (envelope?.kind === "sender-key") {
          return;
        }
        payload =
          envelope?.kind === "chat"
            ? envelope.payload
            : parsePayload(plaintext);
        if (settingsPrefs.data.cacheMessages) {
          cacheDecryptedMessage(sessionUsername, msg.id, plaintext, msg).catch(
            () => undefined
          );
        }
      } catch (error) {
        const now = Date.now();
        if (now - decryptReportRef.current > 15000) {
          decryptReportRef.current = now;
          reportDecryptFailure({
            error: (error as Error).message,
            sender: msg.sender_username,
            senderDeviceId: Number(msg.sender_device_id) || 1,
            messageId: msg.id,
            nonce: msg.nonce
          }).catch(() => undefined);
        }
        encrypted = {
          ciphertext: msg.ciphertext,
          nonce: msg.nonce,
          senderDeviceId: Number(msg.sender_device_id) || 1
        };
      }

      const nextMessage: ChatMessage = {
        id: msg.id,
        groupId: msg.group_id,
        conversationId: msg.conversation_id,
        sender: msg.sender_username,
        payload,
        createdAt: msg.created_at,
        deletedAt: msg.deleted_at ?? null,
        encrypted
      };

      setMessages((prev) => mergeMessages(prev, [nextMessage]));
      appendChatMedia([nextMessage]);
      setUnreadByConversation((prev) => {
        const next = { ...prev };
        if (
          msg.sender_username !== sessionUsername &&
          msg.conversation_id !== selectedConversationRef.current
        ) {
          next[msg.conversation_id] = (next[msg.conversation_id] || 0) + 1;
        }
        return next;
      });
      setLastMessageByConversation((prev) => ({
        ...prev,
        [msg.conversation_id]: {
          sender: msg.sender_username,
          payload,
          createdAt: msg.created_at
        }
      }));
      if (
        msg.created_at > lastPollRef.current ||
        (msg.created_at === lastPollRef.current && msg.id > lastPollIdRef.current)
      ) {
        lastPollRef.current = msg.created_at;
        lastPollIdRef.current = msg.id;
        localStorage.setItem(
          `${STORAGE_KEYS.pollCursorPrefix}${sessionUsername}`,
          JSON.stringify({
            since: lastPollRef.current,
            sinceId: lastPollIdRef.current
          })
        );
      }
      if (selectedConversationRef.current === msg.conversation_id) {
        markRead(msg.conversation_id).catch(() => undefined);
      }
    };
    const poller = async () => {
      try {
        const data = await pollMessages(
          lastPollRef.current,
          lastPollIdRef.current,
          50
        );
        if (!isMounted || !data.messages?.length) {
          pollIdleRef.current += 1;
          pollDelayRef.current = computePollDelay();
          return;
        }

        if (settingsPrefs.data.cacheMessages) {
          const ttlMs = settingsPrefs.data.cacheTtlDays * 24 * 60 * 60 * 1000;
          cacheEncryptedMessages(sessionUsername, data.messages).catch(() => undefined);
          pruneCachedMessages(
            sessionUsername,
            settingsPrefs.data.cacheMaxMessages,
            ttlMs
          ).catch(() => undefined);
        }

        const decrypted: ChatMessage[] = [];

        for (const msg of data.messages) {
          if (
            processingMessageIdsRef.current.has(msg.id) ||
            messagesRef.current.some((item) => item.id === msg.id)
          ) {
            continue;
          }
          processingMessageIdsRef.current.add(msg.id);

          if (msg.deleted_at) {
            decrypted.push({
              id: msg.id,
              groupId: msg.group_id,
              conversationId: msg.conversation_id,
              sender: msg.sender_username,
              payload: { text: "[Deleted]", attachments: [] },
              createdAt: msg.created_at,
              deletedAt: msg.deleted_at
            });
            continue;
          }

          try {
            let plaintext = "";
            if (msg.nonce?.startsWith("signal:")) {
              if (!signalSupported || !encryptionReady) {
                throw new Error("decrypt not available");
              }
              plaintext = await decryptSignalMessage(
                sessionUsername,
                msg.sender_username,
                Number(msg.sender_device_id) || 1,
                msg.ciphertext,
                msg.nonce
              );
            } else {
              plaintext = msg.ciphertext;
            }

            const envelope = parseSignalEnvelope(plaintext);
            if (envelope?.kind === "sender-key") {
              continue;
            }

            const payload =
              envelope?.kind === "chat"
                ? envelope.payload
                : parsePayload(plaintext);
            if (settingsPrefs.data.cacheMessages) {
              cacheDecryptedMessage(sessionUsername, msg.id, plaintext, msg).catch(
                () => undefined
              );
            }

            decrypted.push({
              id: msg.id,
              groupId: msg.group_id,
              conversationId: msg.conversation_id,
              sender: msg.sender_username,
              payload,
              createdAt: msg.created_at,
              deletedAt: msg.deleted_at
            });
          } catch (error) {
            const now = Date.now();
            if (now - decryptReportRef.current > 15000) {
              decryptReportRef.current = now;
              reportDecryptFailure({
                error: (error as Error).message,
                sender: msg.sender_username,
                senderDeviceId: Number(msg.sender_device_id) || 1,
                messageId: msg.id,
                nonce: msg.nonce
              }).catch(() => undefined);
            }
            decrypted.push({
              id: msg.id,
              groupId: msg.group_id,
              conversationId: msg.conversation_id,
              sender: msg.sender_username,
              payload: { text: "Encrypted message", attachments: [] },
              createdAt: msg.created_at,
              deletedAt: msg.deleted_at,
              encrypted: {
                ciphertext: msg.ciphertext,
                nonce: msg.nonce,
                senderDeviceId: Number(msg.sender_device_id) || 1
              }
            });
          }
        }

        setMessages((prev) => mergeMessages(prev, decrypted));
        appendChatMedia(decrypted);
        setUnreadByConversation((prev) => {
          const next = { ...prev };
          for (const msg of decrypted) {
            if (
              msg.sender !== sessionUsername &&
              msg.conversationId !== selectedConversationRef.current
            ) {
              next[msg.conversationId] = (next[msg.conversationId] || 0) + 1;
            }
          }
          return next;
        });
        setLastMessageByConversation((prev) => {
          const next = { ...prev };
          for (const msg of decrypted) {
            next[msg.conversationId] = {
              sender: msg.sender,
              payload: msg.payload,
              createdAt: msg.createdAt
            };
          }
          return next;
        });
        if (
          selectedConversationRef.current &&
          decrypted.some(
            (msg) => msg.conversationId === selectedConversationRef.current
          )
        ) {
          markRead(selectedConversationRef.current).catch(() => undefined);
        }
        if (
          decrypted.length > 0 &&
          document.visibilityState !== "visible" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          const latest = decrypted[decrypted.length - 1];
          if (latest.sender === sessionUsername) {
            return;
          }
          const hasMention =
            typeof latest.payload?.text === "string" &&
            extractMentions(latest.payload.text).includes(
              sessionUsername.toLowerCase()
            );
          if (
            isQuietHoursActive(
              quietHoursByConversation[latest.conversationId]
            ) &&
            !(settingsPrefs.chat.allowMentionsDuringQuiet && hasMention)
          ) {
            return;
          }
          new Notification(`New message from ${latest.sender}`, {
            body: hasMention
              ? "You were mentioned"
              : getPreview(latest.payload) || "New message"
          });
        }
        const lastMessage = data.messages[data.messages.length - 1];
        lastPollRef.current = lastMessage.created_at;
        lastPollIdRef.current = lastMessage.id;
        localStorage.setItem(
          `${STORAGE_KEYS.pollCursorPrefix}${sessionUsername}`,
          JSON.stringify({
            since: lastPollRef.current,
            sinceId: lastPollIdRef.current
          })
        );
        pollIdleRef.current = 0;
        pollErrorRef.current = 0;
        pollDelayRef.current = computePollDelay();
      } catch (error) {
        pollErrorRef.current += 1;
        pollDelayRef.current = computePollDelay();
        const message = (error as Error).message || "";
        if (message.includes("unauthorized")) {
          refreshAuth().catch(() => undefined);
          return;
        }
        if (!/internal server error|failed to fetch|networkerror/i.test(message)) {
          setStatus(message);
        }
      }
    };

    let timer: number | undefined;
    const schedule = () => {
      timer = window.setTimeout(async () => {
        await poller();
        if (isMounted) {
          schedule();
        }
      }, pollDelayRef.current);
    };
    const triggerImmediateSync = () => {
      if (!isMounted) {
        return;
      }
      if (timer) {
        window.clearTimeout(timer);
      }
      pollDelayRef.current = 0;
      schedule();
    };
    poller().then(schedule).catch(schedule);

    const scheduleReconnect = () => {
      if (wsRetryTimerRef.current) {
        return;
      }
      const attempt = wsReconnectAttemptsRef.current;
      const delay = Math.min(15000, 1000 * Math.pow(2, attempt));
      wsReconnectAttemptsRef.current += 1;
      wsRetryTimerRef.current = window.setTimeout(() => {
        wsRetryTimerRef.current = null;
        connectWs();
      }, delay);
    };

    const connectWs = async () => {
      if (!token) {
        return;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      try {
        const wsTicket = await requestWsTicket();
        const apiUrl = new URL(API_BASE || window.location.origin, window.location.origin);
        const wsUrl = new URL(window.location.origin);
        wsUrl.protocol = apiUrl.protocol === "https:" ? "wss:" : "ws:";
        wsUrl.host = apiUrl.host;
        wsUrl.pathname = "/ws";
        wsUrl.search = `ticket=${encodeURIComponent(wsTicket.ticket)}`;
        const ws = new WebSocket(wsUrl.toString());
        ws.onopen = () => {
          wsConnectedRef.current = true;
          wsReconnectAttemptsRef.current = 0;
          pollDelayRef.current = computePollDelay();
          setConnectionStatus("online");
        };
        ws.onclose = () => {
          wsConnectedRef.current = false;
          pollDelayRef.current = computePollDelay();
          setConnectionStatus(navigator.onLine ? "reconnecting" : "offline");
          scheduleReconnect();
        };
        ws.onerror = () => {
          wsConnectedRef.current = false;
          setConnectionStatus(navigator.onLine ? "reconnecting" : "offline");
          try {
            ws.close();
          } catch {
            // ignore
          }
        };
        ws.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data as string) as {
              type: string;
              message?: {
                id: number;
                group_id: string;
                conversation_id: number;
                sender_username: string;
                sender_device_id?: string;
                ciphertext: string;
                nonce: string;
                created_at: number;
                deleted_at?: number | null;
              };
            };
            if (payload.type === "message" && payload.message) {
              handleIncomingMessage(payload.message).catch(() => undefined);
            }
          } catch {
            // ignore
          }
        };
        wsRef.current = ws;
      } catch {
        scheduleReconnect();
      }
    };

    connectWs();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        triggerImmediateSync();
      }
    };
    const onWindowFocus = () => {
      triggerImmediateSync();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onWindowFocus);

    return () => {
      isMounted = false;
      if (timer) {
        window.clearTimeout(timer);
      }
      if (wsRetryTimerRef.current) {
        window.clearTimeout(wsRetryTimerRef.current);
        wsRetryTimerRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onWindowFocus);
    };
  }, [
    sessionUsername,
    token,
    encryptionReady,
    settingsPrefs.data.cacheMessages,
    settingsPrefs.data.cacheTtlDays,
    settingsPrefs.data.cacheMaxMessages,
    settingsPrefs.data.cacheMedia,
    settingsPrefs.data.cacheMediaTtlDays,
    settingsPrefs.data.cacheMediaMax,
    settingsPrefs.data.keepMediaDays
  ]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const retryEncryptedMessages = async () => {
      if (
        retryDecryptRef.current ||
        !sessionUsername ||
        !signalSupported ||
        !encryptionReady
      ) {
        return;
      }
      const encryptedMessages = messagesRef.current.filter(
        (message) => Boolean(message.encrypted)
      );
      if (encryptedMessages.length === 0) {
        return;
      }
      retryDecryptRef.current = true;
      try {
        const updates = new Map<number | string, MessagePayload>();
        for (const message of encryptedMessages) {
          const encrypted = message.encrypted;
          if (!encrypted) {
            continue;
          }
          try {
            const plaintext = await decryptSignalMessage(
              sessionUsername,
              message.sender,
              encrypted.senderDeviceId,
              encrypted.ciphertext,
              encrypted.nonce
            );
            const envelope = parseSignalEnvelope(plaintext);
            const payload =
              envelope?.kind === "chat"
                ? envelope.payload
                : parsePayload(plaintext);
            if (settingsPrefs.data.cacheMessages) {
              cacheDecryptedMessage(sessionUsername, message.id, plaintext).catch(
                () => undefined
              );
            }
            updates.set(message.id, payload);
          } catch {
            // keep encrypted placeholder
          }
        }
        if (updates.size > 0) {
          setMessages((prev) =>
            prev.map((message) =>
              updates.has(message.id)
                ? {
                    ...message,
                    payload: updates.get(message.id) || message.payload,
                    encrypted: undefined
                  }
                : message
            )
          );
          setLastMessageByConversation((prev) => {
            const next = { ...prev };
            for (const message of encryptedMessages) {
              const payload = updates.get(message.id);
              if (!payload) {
                continue;
              }
              const current = next[message.conversationId];
              if (!current || current.createdAt <= message.createdAt) {
                next[message.conversationId] = {
                  sender: message.sender,
                  payload,
                  createdAt: message.createdAt
                };
              }
            }
            return next;
          });
        }
      } finally {
        retryDecryptRef.current = false;
      }
    };
    const retryInterval = setInterval(retryEncryptedMessages, 8000);
    retryEncryptedMessages().catch(() => undefined);

    let isMounted = true;
    const poller = async () => {
      try {
        if (document.visibilityState !== "visible") {
          return;
        }
        const data = await pollSentStatuses(lastStatusPollRef.current, 50);
        if (!isMounted || !data.statuses?.length) {
          return;
        }

        setStatusByGroupId((prev) => {
          const next = { ...prev };
          for (const row of data.statuses) {
            next[row.group_id] = {
              deliveredAt: row.delivered_at ?? null,
              readAt: row.read_at ?? null,
              deletedAt: row.deleted_at ?? null
            };
          }
          return next;
        });
        setOutboxStatusByGroupId((prev) => {
          const next = { ...prev };
          for (const row of data.statuses) {
            if (row.delivered_at || row.read_at) {
              delete next[row.group_id];
            }
          }
          return next;
        });

        lastStatusPollRef.current =
          data.statuses[data.statuses.length - 1].updated_at;
      } catch (error) {
        const message = (error as Error).message || "";
        if (message.includes("unauthorized")) {
          refreshAuth().catch(() => undefined);
          return;
        }
        setStatus(message);
      }
    };

    const interval = setInterval(poller, 4000);
    poller();

    return () => {
      isMounted = false;
      clearInterval(retryInterval);
      clearInterval(interval);
    };
  }, [
    token,
    sessionUsername,
    signalSupported,
    encryptionReady,
    settingsPrefs.data.cacheMessages
  ]);

  useEffect(() => {
    if (!isLoggedIn || !sessionUsername) {
      return;
    }
    const interval = window.setInterval(async () => {
      if (outboxSendingRef.current) {
        return;
      }
      if (!navigator.onLine) {
        setConnectionStatus("offline");
        return;
      }
      const pending = outboxRef.current.filter(
        (item) => item.nextAttemptAt <= Date.now()
      );
      if (pending.length === 0) {
        return;
      }
      outboxSendingRef.current = true;
      try {
        for (const item of pending) {
          const conversation = conversations.find(
            (conv) => conv.id === item.conversationId
          );
          if (!conversation) {
            setOutboxStatus(item.messageId, "failed", item.attempts + 1);
            continue;
          }
          setOutboxStatus(item.messageId, "retrying", item.attempts + 1);
          try {
            const envelope = { kind: "chat", payload: item.payload };
            const payloads = await buildEncryptedPayloads(
              conversation,
              envelope,
              item.messageId
            );
            if (payloads.length === 0) {
              setOutboxStatus(item.messageId, "failed", item.attempts + 1);
              continue;
            }
            await sendMessage(conversation.id, payloads);
            setOutbox((prev) =>
              prev.filter((entry) => entry.messageId !== item.messageId)
            );
            clearOutboxStatus(item.messageId);
            setConnectionStatus("online");
          } catch (error) {
            const attempts = item.attempts + 1;
            const delay = computeOutboxBackoff(attempts);
            setOutbox((prev) =>
              prev.map((entry) =>
                entry.messageId === item.messageId
                  ? {
                      ...entry,
                      attempts,
                      nextAttemptAt: Date.now() + delay,
                      lastError: (error as Error).message || "retry failed"
                    }
                  : entry
              )
            );
            setOutboxStatus(item.messageId, "queued", attempts);
            setConnectionStatus("reconnecting");
          }
        }
      } finally {
        outboxSendingRef.current = false;
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [isLoggedIn, sessionUsername, conversations]);

  useEffect(() => {
    if (!selectedConversationId || !token) {
      setTypingUsers([]);
      return undefined;
    }

    let isMounted = true;
    const poller = async () => {
      try {
        const data = await fetchTyping(selectedConversationId);
        if (!isMounted) {
          return;
        }
        setTypingUsers(data.users || []);
      } catch (error) {
        const message = (error as Error).message || "";
        if (message.includes("unauthorized")) {
          refreshAuth().catch(() => undefined);
        }
      }
    };

    const interval = setInterval(poller, 2000);
    poller();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedConversationId, token]);

  useEffect(() => {
    if (!showManagePanel || !selectedConversationId) {
      return;
    }
    const load = async () => {
      try {
        const data = await fetchRoster(selectedConversationId);
        setRoster(data.members || []);
        const invitesData = await listInviteLinks(selectedConversationId);
        setInviteLinks(invitesData.invites || []);
      } catch (error) {
        setStatus((error as Error).message);
      }
    };
    load();
  }, [showManagePanel, selectedConversationId]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let isMounted = true;
    const poller = async () => {
      try {
        const data = await pollCalls(lastCallPollRef.current);
        if (!isMounted || !data.events?.length) {
          return;
        }
        const events = data.events as CallEvent[];
        for (const event of events) {
          if (event.type === "offer") {
            if (callStateRef.current.status !== "idle") {
              continue;
            }
            setIncomingCall(event);
            setCallState({
              status: "incoming",
              callId: event.callId,
              peerUsername: event.payload.fromUsername || null,
              media: event.payload.media || "audio",
              conversationId:
                typeof event.payload.conversationId === "number"
                  ? event.payload.conversationId
                  : null
            });
            if (
              typeof event.payload.conversationId === "number" &&
              event.payload.conversationId !== selectedConversationId
            ) {
              setSelectedConversationId(event.payload.conversationId);
            }
          } else if (event.type === "answer") {
            if (
              event.callId !== callStateRef.current.callId ||
              !callPeerRef.current
            ) {
              continue;
            }
            if (event.payload.answer) {
              await callPeerRef.current.setRemoteDescription(
                new RTCSessionDescription(JSON.parse(event.payload.answer))
              );
              await flushPendingIce();
              setCallState((prev) =>
                prev.status === "outgoing"
                  ? { ...prev, status: "active" }
                  : prev
              );
              callStartRef.current = Date.now();
              if (callTimeoutRef.current) {
                window.clearTimeout(callTimeoutRef.current);
                callTimeoutRef.current = null;
              }
            }
          } else if (event.type === "ice") {
            if (
              event.callId !== callStateRef.current.callId ||
              !callPeerRef.current
            ) {
              continue;
            }
            if (event.payload.candidate) {
              const candidate = JSON.parse(event.payload.candidate);
              if (!callPeerRef.current.remoteDescription) {
                pendingIceRef.current.push(candidate);
              } else {
                await callPeerRef.current.addIceCandidate(
                  new RTCIceCandidate(candidate)
                );
              }
            }
          } else if (event.type === "end") {
            if (event.callId !== callStateRef.current.callId) {
              continue;
            }
            finalizeCallLog();
            resetCallState();
            setStatus("Call ended");
          }
        }
        lastCallPollRef.current = events[events.length - 1].id;
      } catch {
        // ignore
      }
    };

    const interval = setInterval(poller, 1500);
    poller();

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token]);

  useEffect(() => {
    if (!selectedConversationId || !token) {
      return;
    }
    const conversation = conversations.find(
      (item) => item.id === selectedConversationId
    );
    if (!conversation || conversation.type !== "direct") {
      return;
    }
    const other = conversation.members.find(
      (member) => member.username !== sessionUsername
    );
    if (!other) {
      return;
    }
    let isMounted = true;
    const poller = async () => {
      try {
        const data = await fetchUserStatus(other.username);
        if (!isMounted) {
          return;
        }
        setStatusByUser((prev) => ({
          ...prev,
          [other.username]: {
            online: Boolean(data.online),
            lastSeen: typeof data.lastSeen === "number" ? data.lastSeen : null
          }
        }));
      } catch {
        // ignore
      }
    };
    const interval = setInterval(poller, 8000);
    poller();
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedConversationId, conversations, sessionUsername, token]);

  useEffect(() => {
    const handler = () => {
      if (callStateRef.current.callId) {
        endCall({ callId: callStateRef.current.callId }).catch(() => undefined);
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);
  useEffect(() => {
    if (!conversations.length) {
      return;
    }
    const directUsers = conversations
      .filter((conv) => conv.type === "direct")
      .map((conv) => getConversationTitle(conv, sessionUsername))
      .filter((name) => name && name !== "Direct" && name !== sessionUsername);

    directUsers.forEach((name) => {
      if (publicProfiles[name]) {
        return;
      }
      fetchPublicProfile(name)
        .then((data) => {
          setPublicProfiles((prev) => ({
            ...prev,
            [name]: {
              avatar: data.avatar ?? null,
              bio: data.bio ?? null
            }
          }));
        })
        .catch(() => undefined);
    });
  }, [conversations, sessionUsername, publicProfiles]);

  useEffect(() => {
    if (!selectedConversationId || !sessionUsername) {
      return;
    }
    const toDelete = messages.filter(
      (msg) =>
        msg.conversationId === selectedConversationId &&
        msg.payload.oneTime &&
        msg.sender !== sessionUsername &&
        !msg.deletedAt &&
        !processedOneTimeRef.current.has(msg.groupId)
    );
    if (toDelete.length === 0) {
      return;
    }
    for (const msg of toDelete) {
      processedOneTimeRef.current.add(msg.groupId);
      deleteMessage({ scope: "all", groupId: msg.groupId }).catch(
        () => undefined
      );
    }
    setMessages((prev) =>
      prev.map((msg) =>
        toDelete.some((item) => item.id === msg.id)
          ? {
              ...msg,
              payload: { text: "[Deleted]", attachments: [] },
              deletedAt: Date.now()
            }
          : msg
      )
    );
  }, [messages, selectedConversationId, sessionUsername]);

  const handleSignup = async () => {
    setStatus(null);
    try {
      const deviceId = getDeviceId();
      const deviceName = getDeviceName();
      const phoneDigits = phoneNumber.replace(/\D/g, "");
      const fullPhone = `${selectedCountry.dialCode}${phoneDigits}`;
      const normalizedUsername = username.trim().toLowerCase();
      if (!phoneDigits || !firstName || !lastName || !username) {
        setStatus("Phone, name, and username are required.");
        return;
      }
      if (enable2fa && password.length < 6) {
        setStatus("2FA password must be at least 6 characters.");
        return;
      }
      if (!signalSupported) {
        setStatus("Encryption requires HTTPS. Please use the secure domain.");
        return;
      }
      const bundle = await ensureLocalKeys(normalizedUsername, true);
      if (!bundle) {
        setStatus("Failed to create local keys.");
        return;
      }
      const publicKey = bundle.identityKey;
      const data = await signup(
        fullPhone,
        firstName,
        lastName,
        normalizedUsername,
        enable2fa ? password : null,
        publicKey,
        deviceId,
        deviceName,
        getDeviceInfo()
      );

      setSessionUsername(data.username);
      setToken(data.token);
      setTokenExpiresAt(data.expiresAt || 0);
      setUserFlags({
        banned: data.banned,
        canSend: data.canSend,
        canCreate: data.canCreate,
        allowDirect: data.allowDirect,
        allowGroupInvite: data.allowGroupInvite
      });
      setProfileState({
        avatar: data.avatar ?? null,
        bio: data.bio || "",
        profilePublic: Boolean(data.profilePublic),
        allowDirect: Boolean(data.allowDirect),
        allowGroupInvite: Boolean(data.allowGroupInvite),
        privacy: {
          ...defaultPrivacy,
          ...(data.privacy || {})
        }
      });
      setTwoFactorEnabled(Boolean(data.twoFactorEnabled));

      setAuthSession(data.token, null, data.expiresAt || null);
      if (signalSupported) {
        await publishKeyBundle({
          ...bundle,
          sessionDeviceId: deviceId
        });
        keyBundleCacheRef.current.clear();
        setEncryptionReady(true);
      }

      localStorage.setItem(STORAGE_KEYS.username, data.username);
      persistAccessToken(data.token);
      localStorage.setItem(
        STORAGE_KEYS.tokenExpires,
        String(data.expiresAt || 0)
      );

      setStatus("Signup complete");
      setShowSettings(false);
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleLogin = async () => {
    setStatus(null);
    try {
      const deviceId = getDeviceId();
      const deviceName = getDeviceName();
      const phoneDigits = phoneNumber.replace(/\D/g, "");
      const fullPhone = `${selectedCountry.dialCode}${phoneDigits}`;
      if (!phoneDigits) {
        setStatus("Phone is required.");
        return;
      }

      const data = await login(
        fullPhone,
        password,
        deviceId,
        deviceName,
        getDeviceInfo()
      );
      setSessionUsername(data.username);
      setToken(data.token);
      setTokenExpiresAt(data.expiresAt || 0);
      setUserFlags({
        banned: data.banned,
        canSend: data.canSend,
        canCreate: data.canCreate,
        allowDirect: data.allowDirect,
        allowGroupInvite: data.allowGroupInvite
      });
      setProfileState({
        avatar: data.avatar ?? null,
        bio: data.bio || "",
        profilePublic: Boolean(data.profilePublic),
        allowDirect: Boolean(data.allowDirect),
        allowGroupInvite: Boolean(data.allowGroupInvite),
        privacy: {
          ...defaultPrivacy,
          ...(data.privacy || {})
        }
      });
      setTwoFactorEnabled(Boolean(data.twoFactorEnabled));
      localStorage.setItem(STORAGE_KEYS.username, data.username);
      persistAccessToken(data.token);
      localStorage.setItem(
        STORAGE_KEYS.tokenExpires,
        String(data.expiresAt || 0)
      );

      setAuthSession(data.token, null, data.expiresAt || null);
      if (!signalSupported) {
        setStatus("Encryption requires HTTPS. Please use the secure domain.");
        return;
      }
      const keysExist = await hasLocalKeys(data.username);
      if (!keysExist) {
        setEncryptionReady(false);
        setStatus(
          "Encryption keys missing on this device. Import backup or reset encryption."
        );
        return;
      }
      const bundle = await ensureLocalKeys(data.username, false);
      if (!bundle) {
        setEncryptionReady(false);
        setStatus("Failed to load local keys.");
        return;
      }
      await publishKeyBundle({
        ...bundle,
        sessionDeviceId: deviceId
      });
      keyBundleCacheRef.current.clear();
      setEncryptionReady(true);

      setStatus(
        data.newDevice
          ? "Login complete. New device detected."
          : "Login complete"
      );
      setShowSettings(false);
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleAdminLogin = async () => {
    setStatus(null);
    try {
      const data = await adminLogin(adminUsername, adminPassword);
      setAdminTokenState(data.token);
      setAdminToken(data.token);
      setAdminUsername(data.username);
      setAdminRole(data.role || "standard");
      setAdminPermissions(Array.isArray(data.permissions) ? data.permissions : []);
      setAdminPassword("");
      setStatus("Admin login complete");
      await refreshAdminData(
        Array.isArray(data.permissions) ? data.permissions : [],
        data.role || "standard"
      );
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleAdminLogout = () => {
    setAdminTokenState(null);
    setAdminToken(null);
    setAdminRole(null);
    setAdminPermissions([]);
    setAdminAdmins([]);
    setAdminLockdown(false);
    setAdminLockdownAllowIds([]);
    setAdminLockdownAllowInput("");
    setAdminUsers([]);
    setAdminConversations([]);
    setStatus("Admin logged out");
  };

  const handleAdminPasswordChange = async () => {
    setStatus(null);
    try {
      await adminUpdatePassword(newAdminPassword);
      setNewAdminPassword("");
      setStatus("Admin password updated");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleSendSystemMessage = async () => {
    const text = systemMessage.trim();
    if (!text && systemMessageAttachments.length === 0) {
      return;
    }
    setStatus(null);
    setSystemMessageSending(true);
    try {
      const result = await adminSendSystemMessage({
        text,
        attachments: systemMessageAttachments.map((attachment) => ({
          kind:
            attachment.kind === "location" ? "file" : attachment.kind,
          name: attachment.name,
          data: attachment.data,
          storageKey: attachment.storageKey,
          contentType: attachment.contentType
        }))
      });
      setSystemMessage("");
      setSystemMessageAttachments([]);
      setStatus(`System message sent to ${result.sent ?? 0} users`);
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setSystemMessageSending(false);
    }
  };

  const handleSystemMessageMedia = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []).slice(
      0,
      Math.max(0, 10 - systemMessageAttachments.length)
    );
    event.target.value = "";
    if (files.length === 0) {
      return;
    }
    setStatus(null);
    setSystemMessageUploading(true);
    try {
      const uploaded: Attachment[] = [];
      for (const file of files) {
        const safeName = sanitizeFilename(file.name || "attachment");
        const contentType = normalizeContentType(file.type || "");
        try {
          const result = await adminUploadDirect(file);
          uploaded.push({
            kind: resolveAttachmentKind(result.contentType || contentType),
            name: safeName,
            data: result.publicUrl,
            storageKey: result.key,
            contentType: result.contentType || contentType
          });
        } catch (error) {
          if (file.size > INLINE_ATTACHMENT_LIMIT) {
            throw error;
          }
          const data = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to read media"));
            reader.readAsDataURL(file);
          });
          uploaded.push({
            kind: resolveAttachmentKind(contentType),
            name: safeName,
            data,
            contentType
          });
        }
      }
      setSystemMessageAttachments((prev) => [...prev, ...uploaded].slice(0, 10));
    } catch (error) {
      setStatus((error as Error).message || "Media upload failed");
    } finally {
      setSystemMessageUploading(false);
    }
  };

  const handleAdminToggle = async (
    user: AdminUser,
    key: "banned" | "canSend" | "canCreate" | "allowDirect" | "allowGroupInvite"
  ) => {
    setStatus(null);
    try {
      const payload = {
        banned: key === "banned" ? !user.banned : user.banned,
        canSend: key === "canSend" ? !user.canSend : user.canSend,
        canCreate: key === "canCreate" ? !user.canCreate : user.canCreate,
        allowDirect:
          key === "allowDirect" ? !user.allowDirect : user.allowDirect,
        allowGroupInvite:
          key === "allowGroupInvite" ? !user.allowGroupInvite : user.allowGroupInvite
      };
      await adminUpdateUserFlags(user.id, payload);
      await refreshAdminData();
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleAdminResetPassword = async (userId: number) => {
    const nextPassword = window.prompt("New password for user:");
    if (!nextPassword) {
      return;
    }
    setStatus(null);
    try {
      await adminResetUserPassword(userId, nextPassword);
      setStatus("Password updated");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleAdminDeleteUser = async (userId: number) => {
    if (!window.confirm("Delete this user and all data?")) {
      return;
    }
    setStatus(null);
    try {
      await adminDeleteUser(userId);
      await refreshAdminData();
      setStatus("User deleted");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleAdminDeleteConversation = async (conversationId: number) => {
    if (!window.confirm("Delete this conversation?")) {
      return;
    }
    setStatus(null);
    try {
      await adminDeleteConversation(conversationId);
      await refreshAdminData();
      setStatus("Conversation deleted");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleAdminDownloadMetadata = async (user: AdminUser) => {
    setStatus(null);
    try {
      const blob = await adminDownloadUserMetadata(user.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${user.username}-metadata.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleProfileSave = async () => {
    setProfileSaving(true);
    setStatus(null);
    try {
      await updateProfile({
        firstName: profileIdentity.firstName,
        lastName: profileIdentity.lastName,
        avatar: profileState.avatar,
        bio: profileState.bio,
        profilePublic: profileState.profilePublic,
        allowDirect: profileState.allowDirect,
        allowGroupInvite: profileState.allowGroupInvite,
        privacy: profileState.privacy
      });
      setUserFlags((prev) => ({
        ...prev,
        allowDirect: profileState.allowDirect,
        allowGroupInvite: profileState.allowGroupInvite
      }));
      setStatus("Profile updated");
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleResetEncryption = async () => {
    if (
      !window.confirm(
        "Reset encryption keys on this device? Old messages may become unreadable."
      )
    ) {
      return;
    }
    setStatus(null);
    try {
      await resetSignalState();
      const bundle = await ensureLocalKeys(sessionUsername, true);
      if (!bundle) {
        setStatus("Failed to recreate keys.");
        return;
      }
      await publishKeyBundle({
        ...bundle,
        sessionDeviceId: getDeviceId()
      });
      setEncryptionReady(true);
      setStatus("Encryption keys reset.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleExportKeys = async () => {
    setStatus(null);
    try {
      const data = await exportSignalState();
      const blob = new Blob([JSON.stringify(data)], {
        type: "application/json"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pakeger-keys-${sessionUsername || "device"}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      if (sessionUsername) {
        localStorage.setItem(
          `${STORAGE_KEYS.keyBackupPrefix}${sessionUsername}`,
          "1"
        );
        setShowKeyBackupWarning(false);
      }
      setStatus("Key backup downloaded.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleAdminToggleLockdown = async () => {
    if (!adminHasPermission("manage_settings")) {
      return;
    }
    setAdminLockdownPending(true);
    setStatus(null);
    try {
      const next = !adminLockdown;
      await adminSetLockdown({
        enabled: next,
        allowConversationIds: adminLockdownAllowIds
      });
      setAdminLockdown(next);
      setStatus(next ? "Global lockdown enabled" : "Global lockdown disabled");
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setAdminLockdownPending(false);
    }
  };

  const parseLockdownAllowInput = (value: string) =>
    Array.from(
      new Set(
        value
          .split(",")
          .map((item) => Number(item.trim()))
          .filter((item) => Number.isFinite(item) && item > 0)
          .map((item) => Math.floor(item))
      )
    );

  const handleAdminSaveLockdownAllow = async () => {
    if (!adminHasPermission("manage_settings")) {
      return;
    }
    setAdminLockdownSaving(true);
    setStatus(null);
    try {
      const parsed = parseLockdownAllowInput(adminLockdownAllowInput);
      setAdminLockdownAllowIds(parsed);
      await adminSetLockdown({
        enabled: adminLockdown,
        allowConversationIds: parsed
      });
      setAdminLockdownAllowInput(parsed.join(", "));
      setStatus("Lockdown exceptions saved");
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setAdminLockdownSaving(false);
    }
  };

  const toggleLockdownAllowedConversation = (conversationId: number) => {
    setAdminLockdownAllowIds((prev) => {
      const next = prev.includes(conversationId)
        ? prev.filter((id) => id !== conversationId)
        : [...prev, conversationId];
      setAdminLockdownAllowInput(next.join(", "));
      return next;
    });
  };

  const handleAdminCreateAccount = async () => {
    const username = newAdminAccountUsername.trim();
    const password = newAdminAccountPassword.trim();
    if (!username || !password) {
      setStatus("Admin username and password are required.");
      return;
    }
    setStatus(null);
    try {
      await adminCreateAdmin({
        username,
        password,
        role: newAdminAccountRole,
        permissions: newAdminAccountPermissions
      });
      setNewAdminAccountUsername("");
      setNewAdminAccountPassword("");
      setNewAdminAccountRole("standard");
      setNewAdminAccountPermissions([]);
      await refreshAdminData();
      setStatus("Admin created");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleAdminSavePermissions = async (adminId: number) => {
    const permissions = adminPermissionEdits[adminId] || [];
    setStatus(null);
    try {
      await adminUpdateAdminPermissions({ adminId, permissions });
      await refreshAdminData();
      setStatus("Admin permissions updated");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const toggleNewAdminPermission = (perm: AdminPermission) => {
    setNewAdminAccountPermissions((prev) =>
      prev.includes(perm) ? prev.filter((value) => value !== perm) : [...prev, perm]
    );
  };

  const toggleAdminPermissionEdit = (adminId: number, perm: AdminPermission) => {
    setAdminPermissionEdits((prev) => {
      const base =
        prev[adminId] ??
        adminAdmins.find((admin) => admin.id === adminId)?.permissions ??
        [];
      const next = base.includes(perm)
        ? base.filter((value) => value !== perm)
        : [...base, perm];
      return { ...prev, [adminId]: next };
    });
  };

  const handleImportKeys = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setImportingKeys(true);
    setStatus(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Record<string, string>;
      await importSignalState(parsed);
      const bundle = await ensureLocalKeys(sessionUsername, false);
      if (bundle) {
        await publishKeyBundle({
          ...bundle,
          sessionDeviceId: getDeviceId()
        });
      }
      setEncryptionReady(true);
      if (sessionUsername) {
        localStorage.setItem(
          `${STORAGE_KEYS.keyBackupPrefix}${sessionUsername}`,
          "1"
        );
        setShowKeyBackupWarning(false);
      }
      setStatus("Key backup imported.");
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setImportingKeys(false);
      event.target.value = "";
    }
  };

  const handleDeviceLogout = async (deviceId: string) => {
    setStatus(null);
    try {
      await logoutDevice(deviceId);
      const data = await listDevices();
      setDevices(data.devices || []);
      setStatus("Device logged out");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!window.confirm("Log out from all devices?")) {
      return;
    }
    setStatus(null);
    try {
      await logoutAllDevices();
      setDevices([]);
      setToken("");
      setTokenExpiresAt(0);
      clearStoredAccessToken();
      localStorage.removeItem(STORAGE_KEYS.tokenExpires);
      setEncryptionReady(false);
      setStatus("Logged out from all devices");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleContactPrivacySave = async () => {
    if (!selectedConversation || selectedConversation.type !== "direct") {
      return;
    }
    const other = selectedConversation.members.find(
      (member) => member.username !== sessionUsername
    );
    if (!other) {
      return;
    }
    setStatus(null);
    try {
      await updateContactPrivacy({
        username: other.username,
        privacy: contactPrivacy
      });
      setStatus("Contact privacy updated");
      setShowContactPrivacy(false);
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleEnableTwoFactor = async () => {
    if (twoFactorPassword.length < 6) {
      setStatus("2FA password must be at least 6 characters.");
      return;
    }
    setStatus(null);
    try {
      const data = await enableTwoFactor(twoFactorPassword);
      setTwoFactorEnabled(true);
      setTwoFactorPassword("");
      setToken(data.token);
      setTokenExpiresAt(data.expiresAt || 0);
      setAuthSession(data.token, null, data.expiresAt || null);
      persistAccessToken(data.token);
      localStorage.setItem(STORAGE_KEYS.tokenExpires, String(data.expiresAt || 0));
      setStatus("Two-step verification enabled.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!twoFactorPassword) {
      setStatus("Enter current 2FA password to disable.");
      return;
    }
    setStatus(null);
    try {
      const data = await disableTwoFactor(twoFactorPassword);
      setTwoFactorEnabled(false);
      setTwoFactorPassword("");
      setToken(data.token);
      setTokenExpiresAt(data.expiresAt || 0);
      setAuthSession(data.token, null, data.expiresAt || null);
      persistAccessToken(data.token);
      localStorage.setItem(STORAGE_KEYS.tokenExpires, String(data.expiresAt || 0));
      setStatus("Two-step verification disabled.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setStatus("Avatar too large (max 2MB).");
      return;
    }
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
    setProfileState((prev) => ({ ...prev, avatar: data }));
    event.target.value = "";
  };

  const handleClearAvatar = () => {
    setProfileState((prev) => ({ ...prev, avatar: null }));
  };

  const handleClearCache = () => {
    if (sessionUsername) {
      clearCachedMessages(sessionUsername).catch(() => undefined);
      clearCachedMedia(sessionUsername).catch(() => undefined);
      localStorage.removeItem(
        `${STORAGE_KEYS.pollCursorPrefix}${sessionUsername}`
      );
      localStorage.removeItem(`${STORAGE_KEYS.chatMediaPrefix}${sessionUsername}`);
      setChatMediaFeed([]);
    }
    setCacheStats(null);
    setStatus("Cache cleared.");
  };

  const refreshAuth = async () => {
    try {
      const data = await refreshSession(getDeviceId());
      setToken(data.token);
      setTokenExpiresAt(data.expiresAt || 0);
      persistAccessToken(data.token);
      localStorage.setItem(
        STORAGE_KEYS.tokenExpires,
        String(data.expiresAt || 0)
      );
    } catch (error) {
      setStatus((error as Error).message || "Session expired");
      handleLogout();
    }
  };

  const handleVerifyKey = (username: string, deviceId = 1) => {
    const fingerprint = fingerprintsByUser[username];
    if (!fingerprint || !sessionUsername) {
      return;
    }
    const verifyKey = `${STORAGE_KEYS.keyVerifyPrefix}${sessionUsername}:${username}:${deviceId}`;
    const payload = {
      fingerprint,
      verifiedAt: Date.now()
    };
    localStorage.setItem(verifyKey, JSON.stringify(payload));
    setVerifiedKeysByUser((prev) => ({
      ...prev,
      [username]: payload
    }));
  };

  const handleClearVerifiedKey = (username: string, deviceId = 1) => {
    if (!sessionUsername) {
      return;
    }
    const verifyKey = `${STORAGE_KEYS.keyVerifyPrefix}${sessionUsername}:${username}:${deviceId}`;
    localStorage.removeItem(verifyKey);
    setVerifiedKeysByUser((prev) => {
      const next = { ...prev };
      delete next[username];
      return next;
    });
  };

  const getCachedKeyBundle = async (username: string) => {
    const cache = keyBundleCacheRef.current;
    const existing = cache.get(username);
    const now = Date.now();
    if (existing && now - existing.at < 10 * 1000) {
      return existing.data;
    }
    const data = await fetchKeyBundle(username);
    if (data?.devices?.length) {
      const first = data.devices[0];
      if (first?.identityKey) {
        try {
          const fingerprint = await fingerprintKey(first.identityKey);
          const trustKey = `${STORAGE_KEYS.keyTrustPrefix}${sessionUsername}:${username}:${first.deviceId}`;
          const verifyKey = `${STORAGE_KEYS.keyVerifyPrefix}${sessionUsername}:${username}:${first.deviceId}`;
          const previous = localStorage.getItem(trustKey);
          if (previous && previous !== fingerprint) {
            setStatus(`Security warning: ${username} encryption key changed.`);
            localStorage.removeItem(verifyKey);
            setVerifiedKeysByUser((prev) => {
              const next = { ...prev };
              delete next[username];
              return next;
            });
          }
          localStorage.setItem(trustKey, fingerprint);
          setFingerprintsByUser((prev) => ({ ...prev, [username]: fingerprint }));
          const verifyRaw = localStorage.getItem(verifyKey);
          if (verifyRaw) {
            try {
              const parsed = JSON.parse(verifyRaw) as {
                fingerprint: string;
                verifiedAt: number;
              };
              if (parsed.fingerprint === fingerprint) {
                setVerifiedKeysByUser((prev) => ({
                  ...prev,
                  [username]: {
                    fingerprint,
                    verifiedAt: parsed.verifiedAt || Date.now()
                  }
                }));
              } else {
                localStorage.removeItem(verifyKey);
              }
            } catch {
              localStorage.removeItem(verifyKey);
            }
          }
        } catch {
          // ignore fingerprint errors
        }
      }
    }
    cache.set(username, { at: now, data });
    return data;
  };

  const buildEncryptedPayloads = async (
    conversation: Conversation,
    envelope: { kind: string; payload: MessagePayload },
    messageId: string
  ) => {
    let members = conversation.members;
    if (!members.length) {
      const memberData = await fetchMembers(conversation.id);
      members = memberData.members || [];
    }

    const recipients = members.filter(
      (member) => member.username !== sessionUsername
    );

    if (!signalSupported) {
      throw new Error("Encryption requires HTTPS. Please use the secure domain.");
    }

    const payloads: Array<{
      messageId: string;
      toUsername: string;
      toDeviceId: string;
      ciphertext: string;
      nonce: string;
    }> = [];

    if (conversation.type === "direct") {
      for (const member of recipients) {
        const bundle = await getCachedKeyBundle(member.username);
        const devices = bundle.devices || [];
        for (const device of devices) {
          await ensureSession(sessionUsername, member.username, device);
          const encrypted = await encryptSignalMessage(
            sessionUsername,
            member.username,
            device.deviceId,
            JSON.stringify(envelope),
            device.fallbackPublicKey
          );
          payloads.push({
            messageId,
            toUsername: member.username,
            toDeviceId: String(device.sessionDeviceId ?? device.deviceId),
            ciphertext: encrypted.ciphertext,
            nonce: encrypted.nonce
          });
        }
      }
    } else {
      const recipientDevices: Array<{
        username: string;
        sessionDeviceId: string;
        bundle: {
          registrationId: number;
          deviceId: number;
          identityKey: string;
          signedPreKeyId: number;
          signedPreKey: string;
          signedPreKeySig: string;
          fallbackPublicKey?: string;
          preKeys?: Array<{ id: number; key: string }>;
        };
      }> = [];
      for (const member of recipients) {
        const bundle = await getCachedKeyBundle(member.username);
        const devices = bundle.devices || [];
        for (const device of devices) {
          recipientDevices.push({
            username: member.username,
            sessionDeviceId: String(device.sessionDeviceId ?? device.deviceId),
            bundle: device
          });
        }
      }
      for (const device of recipientDevices) {
        await ensureSession(sessionUsername, device.username, device.bundle);
        const encrypted = await encryptSignalMessage(
          sessionUsername,
          device.username,
          device.bundle.deviceId,
          JSON.stringify(envelope),
          device.bundle.fallbackPublicKey
        );
        payloads.push({
          messageId,
          toUsername: device.username,
          toDeviceId: device.sessionDeviceId,
          ciphertext: encrypted.ciphertext,
          nonce: encrypted.nonce
        });
      }
    }

    try {
      const selfBundle = await ensureLocalKeys(sessionUsername, false);
      if (selfBundle) {
        await ensureSession(sessionUsername, sessionUsername, {
          registrationId: selfBundle.registrationId,
          deviceId: selfBundle.deviceId,
          sessionDeviceId: getDeviceId(),
          identityKey: selfBundle.identityKey,
          signedPreKeyId: selfBundle.signedPreKeyId,
          signedPreKey: selfBundle.signedPreKey,
          signedPreKeySig: selfBundle.signedPreKeySig,
          fallbackPublicKey: selfBundle.fallbackPublicKey,
          oneTimePreKey: null
        });
        const encrypted = await encryptSignalMessage(
          sessionUsername,
          sessionUsername,
          selfBundle.deviceId,
          JSON.stringify(envelope),
          selfBundle.fallbackPublicKey
        );
        payloads.push({
          messageId,
          toUsername: sessionUsername,
          toDeviceId: getDeviceId(),
          ciphertext: encrypted.ciphertext,
          nonce: encrypted.nonce
        });
      }
    } catch {
      // ignore self-encrypted copy failures
    }

    return payloads;
  };

  const computeOutboxBackoff = (attempts: number) => {
    const base = 1500;
    return Math.min(30000, base * Math.pow(2, Math.min(attempts, 5)));
  };

  const setOutboxStatus = (
    groupId: string,
    status: OutboxStatus,
    attempts: number,
    lastError?: string
  ) => {
    setOutboxStatusByGroupId((prev) => ({
      ...prev,
      [groupId]: { status, attempts, lastError }
    }));
  };

  const clearOutboxStatus = (groupId: string) => {
    setOutboxStatusByGroupId((prev) => {
      if (!prev[groupId]) {
        return prev;
      }
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
  };

  const sendPayloadNow = async (
    conversation: Conversation,
    payload: MessagePayload
  ): Promise<string | null> => {
    const envelope = { kind: "chat", payload };
    const messageId = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;

    const payloads = await buildEncryptedPayloads(conversation, envelope, messageId);
    if (payloads.length === 0) {
      setStatus("No recipients available in this conversation.");
      return null;
    }

    let sendSucceeded = false;
    try {
      if (!navigator.onLine) {
        throw new Error("offline");
      }
      await sendMessage(conversation.id, payloads);
      sendSucceeded = true;
    } catch (error) {
      const retryDelay = computeOutboxBackoff(0);
      const queuedItem: OutboxItem = {
        id: `outbox-${messageId}`,
        conversationId: conversation.id,
        payload,
        messageId,
        createdAt: Date.now(),
        attempts: 0,
        nextAttemptAt: Date.now() + retryDelay,
        lastError: (error as Error).message || "send failed"
      };
      setOutbox((prev) => {
        if (prev.find((item) => item.messageId === messageId)) {
          return prev;
        }
        return [...prev, queuedItem];
      });
      setOutboxStatus(messageId, "queued", 0, queuedItem.lastError);
      setConnectionStatus(navigator.onLine ? "reconnecting" : "offline");
    }

    const localId = `local-${Date.now()}`;
    const localMessage = {
      id: localId,
      groupId: messageId,
      conversationId: conversation.id,
      sender: sessionUsername,
      payload,
      createdAt: Date.now(),
      deletedAt: null
    };
    setMessages((prev) => [...prev, localMessage]);
    appendChatMedia([localMessage]);
    setLastMessageByConversation((prev) => ({
      ...prev,
      [conversation.id]: {
        sender: sessionUsername,
        payload,
        createdAt: Date.now()
      }
    }));
    setStatusByGroupId((prev) => ({
      ...prev,
      [messageId]: {
        deliveredAt: null,
        readAt: null,
        deletedAt: null
      }
    }));
    if (sendSucceeded) {
      clearOutboxStatus(messageId);
    }
    return messageId;
  };

  const handleSend = async () => {
    if (!selectedConversationId) {
      return;
    }
    if (!encryptionReady) {
      setStatus(
        "Encryption keys missing. Import backup or reset encryption before sending."
      );
      return;
    }

    const conversation = conversations.find(
      (item) => item.id === selectedConversationId
    );
    if (!conversation) {
      return;
    }

    setStatus(null);
    try {
      const safeText = sanitizeText(messageText);
      const riskScore = spamScore(safeText);
      if (
        conversation.type !== "direct" &&
        riskScore >= 6 &&
        !window.confirm("This message looks spammy. Send anyway?")
      ) {
        return;
      }

      const payload: MessagePayload = {
        text: safeText,
        attachments,
        oneTime: oneTimeMode,
        linkPreview: null
      };
      const previewUrl = safeText ? extractFirstUrl(safeText) : null;
      if (previewUrl) {
        try {
          const previewResponse = await fetchLinkPreview(previewUrl);
          if (previewResponse?.ok && previewResponse.preview) {
            payload.linkPreview = previewResponse.preview;
          }
        } catch {
          payload.linkPreview = null;
        }
      }

      const scheduleFor = scheduledAt ? new Date(scheduledAt).getTime() : null;
      if (scheduleFor && Number.isFinite(scheduleFor)) {
        if (scheduleFor <= Date.now()) {
          setStatus("Schedule time must be in the future.");
          return;
        }
        const envelope = { kind: "chat", payload };
        const messageId = crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
        const payloads = await buildEncryptedPayloads(
          conversation,
          envelope,
          messageId
        );
        if (payloads.length === 0) {
          setStatus("No recipients available in this conversation.");
          return;
        }
        await scheduleMessage(conversation.id, scheduleFor, payloads);
        setStatus(
          `Message scheduled for ${new Date(scheduleFor).toLocaleString()}.`
        );
        setMessageText("");
        setAttachments([]);
        setScheduledAt("");
        setTyping(conversation.id, false).catch(() => undefined);
        return;
      }

      await sendPayloadNow(conversation, payload);
      setMessageText("");
      setAttachments([]);
      setTyping(conversation.id, false).catch(() => undefined);
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleLogout = () => {
    const currentDeviceId = getDeviceId();
    logoutDevice(currentDeviceId).catch(() => undefined);
    setToken("");
    setTokenExpiresAt(0);
    clearStoredAccessToken();
    localStorage.removeItem(STORAGE_KEYS.tokenExpires);
    if (sessionUsername) {
      localStorage.removeItem(`${STORAGE_KEYS.outboxPrefix}${sessionUsername}`);
    }
    initialHistoryLoadedRef.current.clear();
    setAttachmentUrlCache({});
    setFingerprintsByUser({});
    setVerifiedKeysByUser({});
    setEncryptionReady(false);
    setStatus("Logged out");
  };

  const loadOlderMessages = async () => {
    if (!selectedConversationId || historyLoading) {
      return;
    }
    const conversationId = selectedConversationId;
    const oldest = messages
      .filter((msg) => msg.conversationId === conversationId)
      .reduce((min, msg) => (msg.createdAt < min ? msg.createdAt : min), Date.now());
    const before =
      historyCursorByConversation[conversationId] ??
      (Number.isFinite(oldest) ? oldest : Date.now());
    if (!before) {
      return;
    }
    setHistoryLoading(true);
    try {
      const data = await fetchMessageHistory(conversationId, before, 50);
      if (!data.messages?.length) {
        setHistoryExhausted((prev) => ({ ...prev, [conversationId]: true }));
        return;
      }
      const decrypted: ChatMessage[] = [];
      for (const msg of data.messages) {
        if (msg.deleted_at) {
          decrypted.push({
            id: msg.id,
            groupId: msg.group_id,
            conversationId: msg.conversation_id,
            sender: msg.sender_username,
            payload: { text: "[Deleted]", attachments: [] },
            createdAt: msg.created_at,
            deletedAt: msg.deleted_at
          });
          continue;
        }
        try {
          let plaintext = "";
          if (msg.nonce?.startsWith("signal:")) {
            if (!signalSupported || !encryptionReady) {
              throw new Error("decrypt not available");
            }
            plaintext = await decryptSignalMessage(
              sessionUsername,
              msg.sender_username,
              Number(msg.sender_device_id) || 1,
              msg.ciphertext,
              msg.nonce
            );
          } else {
            plaintext = msg.ciphertext;
          }
          const envelope = parseSignalEnvelope(plaintext);
          if (envelope?.kind === "sender-key") {
            continue;
          }
          const payload =
            envelope?.kind === "chat"
              ? envelope.payload
              : parsePayload(plaintext);
          if (settingsPrefs.data.cacheMessages) {
            cacheEncryptedMessages(sessionUsername, [msg]).catch(
              () => undefined
            );
            cacheDecryptedMessage(sessionUsername, msg.id, plaintext, msg).catch(
              () => undefined
            );
          }
          decrypted.push({
            id: msg.id,
            groupId: msg.group_id,
            conversationId: msg.conversation_id,
            sender: msg.sender_username,
            payload,
            createdAt: msg.created_at,
            deletedAt: msg.deleted_at ?? null
          });
        } catch (error) {
          const now = Date.now();
          if (now - decryptReportRef.current > 15000) {
            decryptReportRef.current = now;
            reportDecryptFailure({
              error: (error as Error).message,
              sender: msg.sender_username,
              senderDeviceId: Number(msg.sender_device_id) || 1,
              messageId: msg.id,
              nonce: msg.nonce
            }).catch(() => undefined);
          }
          decrypted.push({
            id: msg.id,
            groupId: msg.group_id,
            conversationId: msg.conversation_id,
            sender: msg.sender_username,
            payload: { text: "Encrypted message", attachments: [] },
            createdAt: msg.created_at,
            deletedAt: msg.deleted_at ?? null,
            encrypted: {
              ciphertext: msg.ciphertext,
              nonce: msg.nonce,
              senderDeviceId: Number(msg.sender_device_id) || 1
            }
          });
        }
      }
      setMessages((prev) => mergeMessages(prev, decrypted));
      appendChatMedia(decrypted);
      const oldestInBatch = data.messages[0];
      setHistoryCursorByConversation((prev) => ({
        ...prev,
        [conversationId]: oldestInBatch.created_at
      }));
    } catch (error) {
      setStatus((error as Error).message);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !selectedConversationId || !sessionUsername) {
      return;
    }
    if (initialHistoryLoadedRef.current.has(selectedConversationId)) {
      return;
    }
    const hasMessagesForConversation = messages.some(
      (message) => message.conversationId === selectedConversationId
    );
    if (hasMessagesForConversation) {
      initialHistoryLoadedRef.current.add(selectedConversationId);
      return;
    }
    initialHistoryLoadedRef.current.add(selectedConversationId);
    loadOlderMessages().catch(() => {
      initialHistoryLoadedRef.current.delete(selectedConversationId);
    });
  }, [isLoggedIn, selectedConversationId, sessionUsername, messages.length]);

  const handleForwardSelect = (message: ChatMessage) => {
    if (!selectedConversationId) {
      return;
    }
    const allowed = forwardRulesByConversation[selectedConversationId] ?? true;
    if (!allowed) {
      setStatus("Forwarding is disabled for this conversation.");
      return;
    }
    setPendingForwardMessage(message);
    setForwardTargetId(null);
  };

  const handleForwardSend = async () => {
    if (!pendingForwardMessage || !forwardTargetId) {
      return;
    }
    if (!encryptionReady) {
      setStatus(
        "Encryption keys missing. Import backup or reset encryption before sending."
      );
      return;
    }
    const conversation = conversations.find(
      (item) => item.id === forwardTargetId
    );
    if (!conversation) {
      return;
    }
    setStatus(null);
    try {
      const payload: MessagePayload = {
        ...pendingForwardMessage.payload,
        forwardedFrom: pendingForwardMessage.sender
      };
      const envelope = { kind: "chat", payload };
      const messageId = crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
      const payloads = await buildEncryptedPayloads(
        conversation,
        envelope,
        messageId
      );
      if (payloads.length === 0) {
        setStatus("No recipients available in this conversation.");
        return;
      }
      await sendMessage(conversation.id, payloads, true);
      const localId = `local-${Date.now()}`;
      const localMessage = {
        id: localId,
        groupId: messageId,
        conversationId: conversation.id,
        sender: sessionUsername,
        payload,
        createdAt: Date.now(),
        deletedAt: null
      };
      setMessages((prev) => [...prev, localMessage]);
      appendChatMedia([localMessage]);
      setLastMessageByConversation((prev) => ({
        ...prev,
        [conversation.id]: {
          sender: sessionUsername,
          payload,
          createdAt: Date.now()
        }
      }));
      setStatusByGroupId((prev) => ({
        ...prev,
        [messageId]: {
          deliveredAt: null,
          readAt: null,
          deletedAt: null
        }
      }));
      setPendingForwardMessage(null);
      setForwardTargetId(null);
      setStatus("Message forwarded");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const requestCurrentPosition = (): Promise<GeolocationPosition> =>
    new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) {
        reject(new Error("Location is not supported in this browser."));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000
      });
    });

  const buildLocationAttachment = (
    position: GeolocationPosition,
    options: { live: boolean; liveId?: string; expiresAt?: number }
  ): Attachment => {
    const payload: LocationAttachmentData = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      live: options.live,
      liveId: options.liveId,
      expiresAt: options.expiresAt
    };
    return {
      kind: "location",
      name: options.live ? "Live location" : "Location",
      data: JSON.stringify(payload)
    };
  };

  const sendLocationPayload = async (
    conversation: Conversation,
    attachment: Attachment,
    oneTime: boolean
  ) => {
    const payload: MessagePayload = {
      text: "",
      attachments: [attachment],
      oneTime,
      linkPreview: null
    };
    await sendPayloadNow(conversation, payload);
  };

  const stopLiveLocationShare = (showStatus: boolean) => {
    if (liveLocationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(liveLocationWatchRef.current);
      liveLocationWatchRef.current = null;
    }
    if (liveLocationTimerRef.current !== null) {
      window.clearTimeout(liveLocationTimerRef.current);
      liveLocationTimerRef.current = null;
    }
    liveLocationIdRef.current = null;
    liveLocationConversationRef.current = null;
    liveLocationLastSentRef.current = 0;
    liveLocationActiveRef.current = false;
    setLiveLocationActive(false);
    setLiveLocationExpiresAt(null);
    if (showStatus) {
      setStatus("Live location sharing stopped.");
    }
  };

  const startLiveLocationShare = async () => {
    if (liveLocationActiveRef.current) {
      return;
    }
    if (!selectedConversationId) {
      return;
    }
    if (!encryptionReady) {
      setStatus(
        "Encryption keys missing. Import backup or reset encryption before sending."
      );
      return;
    }
    const conversation = conversations.find(
      (item) => item.id === selectedConversationId
    );
    if (!conversation) {
      return;
    }

    setStatus(null);
    try {
      const initialPosition = await requestCurrentPosition();
      const liveId = crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
      const expiresAt =
        Date.now() + LIVE_LOCATION_DURATION_MINUTES * 60 * 1000;

      liveLocationActiveRef.current = true;
      liveLocationIdRef.current = liveId;
      liveLocationConversationRef.current = conversation.id;
      liveLocationLastSentRef.current = 0;
      setLiveLocationActive(true);
      setLiveLocationExpiresAt(expiresAt);

      const firstAttachment = buildLocationAttachment(initialPosition, {
        live: true,
        liveId,
        expiresAt
      });
      await sendLocationPayload(conversation, firstAttachment, false);
      liveLocationLastSentRef.current = Date.now();

      liveLocationWatchRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          if (!liveLocationActiveRef.current) {
            return;
          }
          if (Date.now() > expiresAt) {
            stopLiveLocationShare(false);
            return;
          }
          if (
            Date.now() - liveLocationLastSentRef.current <
            LIVE_LOCATION_THROTTLE_MS
          ) {
            return;
          }
          const updateAttachment = buildLocationAttachment(position, {
            live: true,
            liveId,
            expiresAt
          });
          try {
            const activeConversationId = liveLocationConversationRef.current;
            const activeConversation = conversations.find(
              (item) => item.id === activeConversationId
            );
            if (!activeConversation) {
              return;
            }
            await sendLocationPayload(activeConversation, updateAttachment, false);
            liveLocationLastSentRef.current = Date.now();
          } catch {
            // ignore live update failures
          }
        },
        (error) => {
          setStatus(error.message || "Live location failed.");
          stopLiveLocationShare(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 12000
        }
      );

      liveLocationTimerRef.current = window.setTimeout(() => {
        stopLiveLocationShare(false);
      }, expiresAt - Date.now());
    } catch (error) {
      setStatus((error as Error).message);
      stopLiveLocationShare(false);
    }
  };

  const handleSendLocation = async () => {
    if (!selectedConversationId) {
      return;
    }
    if (!encryptionReady) {
      setStatus(
        "Encryption keys missing. Import backup or reset encryption before sending."
      );
      return;
    }
    const conversation = conversations.find(
      (item) => item.id === selectedConversationId
    );
    if (!conversation) {
      return;
    }
    setStatus(null);
    try {
      const position = await requestCurrentPosition();
      const attachment = buildLocationAttachment(position, { live: false });
      await sendLocationPayload(conversation, attachment, oneTimeMode);
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleSaveConversationSettings = async () => {
    if (!selectedConversationId || !selectedConversation) {
      return;
    }
    setStatus(null);
    try {
      const quiet = quietHoursByConversation[selectedConversationId] || null;
      await updateConversationSettings(selectedConversationId, {
        forwardEnabled:
          forwardRulesByConversation[selectedConversationId] ?? true,
        quietHours: quiet
          ? {
              enabled: Boolean(quiet.enabled),
              start: quiet.start,
              end: quiet.end
            }
          : null
      });
      setStatus("Conversation settings saved.");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const pushSettingsPage = (page: SettingsPage) => {
    setSettingsStack((prev) => [...prev, page]);
  };

  const popSettingsPage = () => {
    setSettingsStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  };

  const updatePrefs = <K extends keyof SettingsPrefs>(
    section: K,
    key: keyof SettingsPrefs[K],
    value: SettingsPrefs[K][keyof SettingsPrefs[K]]
  ) => {
    setSettingsPrefs((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const renderSettingsPage = () => {
    const notificationToggles: Array<{
      key: keyof SettingsPrefs["notifications"];
      title: string;
    }> = [
      { key: "privateChats", title: "Private chats" },
      { key: "groups", title: "Group notifications" },
      { key: "channels", title: "Channel notifications" },
      { key: "inAppSounds", title: "In-app sounds" },
      { key: "vibration", title: "Vibration" },
      { key: "messagePreview", title: "Message preview" },
      { key: "callNotifications", title: "Call notifications" }
    ];

    const dataToggles: Array<{
      key: "autoDownloadWifi" | "autoDownloadMobile" | "saveToGallery" | "streaming";
      title: string;
    }> = [
      { key: "autoDownloadWifi", title: "Auto-download over Wi-Fi" },
      { key: "autoDownloadMobile", title: "Auto-download over mobile" },
      { key: "saveToGallery", title: "Save to gallery" },
      { key: "streaming", title: "Streaming media" }
    ];

    const chatToggles: Array<{
      key: keyof SettingsPrefs["chat"];
      title: string;
    }> = [
      { key: "enterToSend", title: "Enter to send" },
      { key: "swipeGestures", title: "Swipe gestures" },
      { key: "chatFolders", title: "Chat folders" },
      { key: "archivedChats", title: "Archived chats" },
      { key: "pinnedChats", title: "Pinned chats" },
      { key: "chatPreview", title: "Chat previews" },
      { key: "allowMentionsDuringQuiet", title: "Allow mentions during quiet hours" }
    ];

    const stickerToggles: Array<{
      key: keyof SettingsPrefs["stickers"];
      title: string;
    }> = [
      { key: "animatedEmoji", title: "Animated emoji" },
      { key: "stickerSets", title: "Sticker sets" },
      { key: "trending", title: "Trending stickers" },
      { key: "reactions", title: "Emoji reactions" }
    ];

    const advancedToggles: Array<{
      key: keyof SettingsPrefs["advanced"];
      title: string;
    }> = [
      { key: "developerMode", title: "Developer mode" },
      { key: "debugLogs", title: "Debug logs" },
      { key: "experimental", title: "Experimental features" }
    ];

    switch (settingsPage) {
      case "root":
        return (
          <div className="settings-root">
            <button
              className="settings-profile-card"
              onClick={() => pushSettingsPage("account")}
            >
              <div className="avatar large">
                {profileState.avatar ? (
                  <img src={profileState.avatar} alt={sessionUsername} />
                ) : (
                  <span>{getInitials(sessionUsername)}</span>
                )}
              </div>
              <div className="settings-profile-text">
                <div className="settings-profile-name">{displayName}</div>
                <div className="settings-profile-sub">@{sessionUsername}</div>
              </div>
              <span className="settings-chevron">{">"}</span>
            </button>

            <div className="settings-section-block">
              <SettingsItem
                title="Account"
                subtitle="Profile, username, devices"
                onClick={() => pushSettingsPage("account")}
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Privacy & Security"
                subtitle="Last seen, blocking, 2FA"
                onClick={() => pushSettingsPage("privacy")}
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Notifications & Sounds"
                subtitle="Chat alerts and previews"
                onClick={() => pushSettingsPage("notifications")}
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Data and Storage"
                subtitle="Media auto-download and cache"
                onClick={() => pushSettingsPage("data")}
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Appearance"
                subtitle="Theme, accent, bubbles"
                onClick={() => pushSettingsPage("appearance")}
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Language"
                subtitle="App language and region"
                onClick={() => pushSettingsPage("language")}
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Chat Settings"
                subtitle="Enter to send, chat previews"
                onClick={() => pushSettingsPage("chat")}
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Stickers & Emoji"
                subtitle="Reactions and animated emoji"
                onClick={() => pushSettingsPage("stickers")}
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Advanced"
                subtitle="Encryption and experimental tools"
                onClick={() => pushSettingsPage("advanced")}
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="About"
                subtitle="Version, policies, support"
                onClick={() => pushSettingsPage("about")}
                right={<span className="settings-chevron">{">"}</span>}
              />
            </div>
          </div>
        );
      case "account":
        return (
          <div className="settings-subpage">
            <div className="settings-card">
              <div className="settings-avatar-row">
                <div className="avatar large">
                  {profileState.avatar ? (
                    <img src={profileState.avatar} alt="avatar" />
                  ) : (
                    <span>{getInitials(sessionUsername)}</span>
                  )}
                </div>
                <div className="settings-avatar-actions">
                  <label className="file-input small">
                    Change photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                  <button className="secondary" onClick={handleClearAvatar}>
                    Remove
                  </button>
                </div>
              </div>
              <div className="settings-field-grid">
                <label className="settings-field">
                  First name
                  <input
                    value={profileIdentity.firstName}
                    onChange={(event) =>
                      setProfileIdentity((prev) => ({
                        ...prev,
                        firstName: event.target.value
                      }))
                    }
                  />
                </label>
                <label className="settings-field">
                  Last name
                  <input
                    value={profileIdentity.lastName}
                    onChange={(event) =>
                      setProfileIdentity((prev) => ({
                        ...prev,
                        lastName: event.target.value
                      }))
                    }
                  />
                </label>
              </div>
              <label className="settings-field">
                Username
                <input value={`@${sessionUsername}`} readOnly />
              </label>
              <label className="settings-field">
                Bio
                <textarea
                  value={profileState.bio}
                  onChange={(event) =>
                    setProfileState((prev) => ({
                      ...prev,
                      bio: event.target.value
                    }))
                  }
                  placeholder="Tell people about you"
                />
              </label>
              <label className="settings-field">
                Phone number
                <input value={profileIdentity.phone || "Not set"} readOnly />
              </label>
              <div className="settings-actions">
                <button onClick={handleProfileSave} disabled={profileSaving}>
                  {profileSaving ? "Saving..." : "Save changes"}
                </button>
                <button
                  className="secondary"
                  onClick={() =>
                    setStatus("Number change requires OTP verification.")
                  }
                >
                  Change number
                </button>
              </div>
            </div>

            <div className="settings-section-block">
              <h4>Devices</h4>
              <div className="settings-card">
                {devicesLoading && <p className="muted">Loading devices...</p>}
                {!devicesLoading && devices.length === 0 && (
                  <p className="muted">No active devices found.</p>
                )}
                {devices.map((device) => (
                  <div key={device.deviceId} className="device-item">
                    <div>
                      <strong>{device.deviceName}</strong>
                      <div className="muted">
                        {device.ip} - Last seen{" "}
                        {new Date(device.lastSeenAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="row">
                      {device.current ? (
                        <span className="badge">This device</span>
                      ) : (
                        <button
                          className="secondary"
                          onClick={() => handleDeviceLogout(device.deviceId)}
                        >
                          Log out
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button className="danger" onClick={handleLogoutAllDevices}>
                Terminate all sessions
              </button>
              <button
                className="danger ghost"
                onClick={() =>
                  setStatus("Account deletion requires admin approval.")
                }
              >
                Delete account
              </button>
            </div>
          </div>
        );
      case "privacy":
        return (
          <div className="settings-subpage">
            <div className="settings-section-block">
              <h4>Privacy</h4>
              <SettingsItem
                title="Last seen & online"
                subtitle={
                  profileState.privacy.hide_online ||
                  profileState.privacy.hide_last_seen
                    ? "Hidden"
                    : "Visible"
                }
                right={
                  <SettingsToggle
                    checked={!profileState.privacy.hide_online}
                    onChange={(value) =>
                      setProfileState((prev) => ({
                        ...prev,
                        privacy: {
                          ...prev.privacy,
                          hide_online: !value,
                          hide_last_seen: !value
                        }
                      }))
                    }
                  />
                }
              />
              <SettingsItem
                title="Profile photo visibility"
                subtitle={
                  profileState.privacy.hide_profile_photo ? "Nobody" : "Everyone"
                }
                right={
                  <SettingsToggle
                    checked={!profileState.privacy.hide_profile_photo}
                    onChange={(value) =>
                      setProfileState((prev) => ({
                        ...prev,
                        privacy: {
                          ...prev.privacy,
                          hide_profile_photo: !value
                        }
                      }))
                    }
                  />
                }
              />
              <SettingsItem
                title="Bio visibility"
                subtitle={profileState.profilePublic ? "Public" : "Private"}
                right={
                  <SettingsToggle
                    checked={profileState.profilePublic}
                    onChange={(value) =>
                      setProfileState((prev) => ({
                        ...prev,
                        profilePublic: value
                      }))
                    }
                  />
                }
              />
              <SettingsItem
                title="Read receipts"
                subtitle={
                  profileState.privacy.disable_read_receipts ? "Off" : "On"
                }
                right={
                  <SettingsToggle
                    checked={!profileState.privacy.disable_read_receipts}
                    onChange={(value) =>
                      setProfileState((prev) => ({
                        ...prev,
                        privacy: {
                          ...prev.privacy,
                          disable_read_receipts: !value
                        }
                      }))
                    }
                  />
                }
              />
              <SettingsItem
                title="Typing indicator"
                subtitle={
                  profileState.privacy.disable_typing_indicator ? "Off" : "On"
                }
                right={
                  <SettingsToggle
                    checked={!profileState.privacy.disable_typing_indicator}
                    onChange={(value) =>
                      setProfileState((prev) => ({
                        ...prev,
                        privacy: {
                          ...prev.privacy,
                          disable_typing_indicator: !value
                        }
                      }))
                    }
                  />
                }
              />
              <SettingsItem
                title="Who can message me"
                subtitle={profileState.allowDirect ? "Everyone" : "Contacts"}
                right={
                  <SettingsToggle
                    checked={profileState.allowDirect}
                    onChange={(value) =>
                      setProfileState((prev) => ({
                        ...prev,
                        allowDirect: value
                      }))
                    }
                  />
                }
              />
              <SettingsItem
                title="Who can add me to groups"
                subtitle={profileState.allowGroupInvite ? "Everyone" : "Contacts"}
                right={
                  <SettingsToggle
                    checked={profileState.allowGroupInvite}
                    onChange={(value) =>
                      setProfileState((prev) => ({
                        ...prev,
                        allowGroupInvite: value
                      }))
                    }
                  />
                }
              />
            </div>
            <div className="settings-section-block">
              <h4>Security</h4>
              <div className="settings-card">
                <label className="settings-field">
                  {twoFactorEnabled
                    ? "Current 2FA password"
                    : "New 2FA password"}
                  <input
                    type="password"
                    value={twoFactorPassword}
                    onChange={(event) => setTwoFactorPassword(event.target.value)}
                    placeholder="min 6 characters"
                  />
                </label>
                <div className="settings-actions">
                  {twoFactorEnabled ? (
                    <button className="secondary" onClick={handleDisableTwoFactor}>
                      Disable 2FA
                    </button>
                  ) : (
                    <button onClick={handleEnableTwoFactor}>Enable 2FA</button>
                  )}
                  <button
                    className="secondary"
                    onClick={() =>
                      setStatus("Security alerts are not configured yet.")
                    }
                  >
                    Security alerts
                  </button>
                </div>
              </div>
              <SettingsItem
                title="Blocked users"
                subtitle="Manage block list"
                onClick={() => setStatus("Blocked users list is empty.")}
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Passcode lock"
                subtitle="Requires device support"
                onClick={() => setStatus("Passcode lock is not available yet.")}
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Safety center"
                subtitle="Reports, restrictions, and blocked users"
                onClick={() => setStatus("No safety reports available yet.")}
                right={<span className="settings-chevron">{">"}</span>}
              />
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="settings-subpage">
            <div className="settings-section-block">
              <h4>Notifications</h4>
              <SettingsItem
                title="Browser notifications"
                subtitle={
                  typeof Notification === "undefined"
                    ? "Unavailable"
                    : Notification.permission === "granted"
                    ? "Enabled"
                    : Notification.permission === "denied"
                    ? "Blocked"
                    : "Not enabled"
                }
                onClick={() => {
                  if (typeof Notification === "undefined") {
                    return;
                  }
                  Notification.requestPermission().catch(() => undefined);
                }}
                right={<span className="settings-chevron">{">"}</span>}
              />
              {notificationToggles.map((item) => (
                <SettingsItem
                  key={item.key}
                  title={item.title}
                  right={
                    <SettingsToggle
                      checked={settingsPrefs.notifications[item.key]}
                      onChange={(value) =>
                        updatePrefs("notifications", item.key, value)
                      }
                    />
                  }
                />
              ))}
            </div>
          </div>
        );
      case "data":
        return (
          <div className="settings-subpage">
            <div className="settings-section-block">
              <h4>Storage</h4>
              {dataToggles.map((item) => (
                <SettingsItem
                  key={item.key}
                  title={item.title}
                  right={
                    <SettingsToggle
                      checked={settingsPrefs.data[item.key]}
                      onChange={(value) => updatePrefs("data", item.key, value)}
                    />
                  }
                />
              ))}
              <SettingsItem
                title="Cache usage"
                subtitle={
                  cacheStats
                    ? `${cacheStats.messages} messages - ${cacheStats.media} media - ${formatBytes(
                        cacheStats.bytes
                      )}`
                    : "Calculating..."
                }
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Offline message cache"
                subtitle="Store encrypted messages on this device"
                right={
                  <SettingsToggle
                    checked={settingsPrefs.data.cacheMessages}
                    onChange={(value) =>
                      updatePrefs("data", "cacheMessages", value)
                    }
                  />
                }
              />
              <SettingsItem
                title="Cache decrypted media"
                subtitle="Stores media previews locally for faster browsing"
                right={
                  <SettingsToggle
                    checked={settingsPrefs.data.cacheMedia}
                    onChange={(value) => updatePrefs("data", "cacheMedia", value)}
                  />
                }
              />
              <SettingsItem
                title="Message cache retention"
                subtitle={`${settingsPrefs.data.cacheTtlDays} days`}
                onClick={() =>
                  updatePrefs(
                    "data",
                    "cacheTtlDays",
                    settingsPrefs.data.cacheTtlDays === 7
                      ? 30
                      : settingsPrefs.data.cacheTtlDays === 30
                      ? 90
                      : 7
                  )
                }
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Message cache size"
                subtitle={`${settingsPrefs.data.cacheMaxMessages} messages`}
                onClick={() =>
                  updatePrefs(
                    "data",
                    "cacheMaxMessages",
                    settingsPrefs.data.cacheMaxMessages === 500
                      ? 2000
                      : settingsPrefs.data.cacheMaxMessages === 2000
                      ? 5000
                      : 500
                  )
                }
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Media cache retention"
                subtitle={`${settingsPrefs.data.cacheMediaTtlDays} days`}
                onClick={() =>
                  updatePrefs(
                    "data",
                    "cacheMediaTtlDays",
                    settingsPrefs.data.cacheMediaTtlDays === 7
                      ? 30
                      : settingsPrefs.data.cacheMediaTtlDays === 30
                      ? 90
                      : 7
                  )
                }
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Media cache size"
                subtitle={`${settingsPrefs.data.cacheMediaMax} items`}
                onClick={() =>
                  updatePrefs(
                    "data",
                    "cacheMediaMax",
                    settingsPrefs.data.cacheMediaMax === 200
                      ? 800
                      : settingsPrefs.data.cacheMediaMax === 800
                      ? 2000
                      : 200
                  )
                }
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Keep media for"
                subtitle={`${settingsPrefs.data.keepMediaDays} days`}
                onClick={() =>
                  setSettingsPrefs((prev) => ({
                    ...prev,
                    data: {
                      ...prev.data,
                      keepMediaDays: prev.data.keepMediaDays === 30 ? 7 : 30
                    }
                  }))
                }
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Clear cache"
                subtitle="Remove local cached data"
                onClick={handleClearCache}
                right={<span className="settings-chevron">{">"}</span>}
              />
            </div>
          </div>
        );
      case "appearance":
        return (
          <div className="settings-subpage">
            <div className="settings-section-block">
              <h4>Theme</h4>
              <div className="settings-card">
                <div className="settings-choice-row">
                  {(["light", "dark", "system"] as const).map((mode) => (
                    <button
                      key={mode}
                      className={
                        settingsPrefs.appearance.themeMode === mode
                          ? "choice active"
                          : "choice"
                      }
                      onClick={() => updatePrefs("appearance", "themeMode", mode)}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
              <h4>Accent color</h4>
              <div className="settings-card">
                <div className="settings-choice-row">
                  {(["teal", "blue", "green", "amber"] as const).map((accent) => (
                    <button
                      key={accent}
                      className={
                        settingsPrefs.appearance.accent === accent
                          ? "choice active"
                          : "choice"
                      }
                      onClick={() => updatePrefs("appearance", "accent", accent)}
                    >
                      {accent}
                    </button>
                  ))}
                </div>
              </div>
              <SettingsItem
                title="Chat bubble style"
                subtitle={settingsPrefs.appearance.bubble}
                onClick={() =>
                  updatePrefs(
                    "appearance",
                    "bubble",
                    settingsPrefs.appearance.bubble === "rounded"
                      ? "classic"
                      : "rounded"
                  )
                }
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Font size"
                subtitle={settingsPrefs.appearance.fontSize}
                onClick={() =>
                  updatePrefs(
                    "appearance",
                    "fontSize",
                    settingsPrefs.appearance.fontSize === "medium"
                      ? "large"
                      : settingsPrefs.appearance.fontSize === "large"
                      ? "small"
                      : "medium"
                  )
                }
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Animations"
                right={
                  <SettingsToggle
                    checked={settingsPrefs.appearance.animations}
                    onChange={(value) =>
                      updatePrefs("appearance", "animations", value)
                    }
                  />
                }
              />
            </div>
          </div>
        );
      case "language":
        return (
          <div className="settings-subpage">
            <div className="settings-section-block">
              <SettingsItem
                title="App language"
                subtitle={settingsPrefs.language.app.toUpperCase()}
                onClick={() =>
                  updatePrefs(
                    "language",
                    "app",
                    settingsPrefs.language.app === "auto"
                      ? "fa"
                      : settingsPrefs.language.app === "fa"
                      ? "en"
                      : "auto"
                  )
                }
                right={<span className="settings-chevron">{">"}</span>}
              />
              <SettingsItem
                title="Right-to-left layout"
                right={
                  <SettingsToggle
                    checked={settingsPrefs.language.rtl}
                    onChange={(value) => updatePrefs("language", "rtl", value)}
                  />
                }
              />
              <SettingsItem
                title="Region formatting"
                subtitle={settingsPrefs.language.region.toUpperCase()}
                onClick={() =>
                  updatePrefs(
                    "language",
                    "region",
                    settingsPrefs.language.region === "auto"
                      ? "ir"
                      : settingsPrefs.language.region === "ir"
                      ? "eu"
                      : settingsPrefs.language.region === "eu"
                      ? "us"
                      : "auto"
                  )
                }
                right={<span className="settings-chevron">{">"}</span>}
              />
            </div>
          </div>
        );
      case "chat":
        return (
          <div className="settings-subpage">
            <div className="settings-section-block">
              {chatToggles.map((item) => (
                <SettingsItem
                  key={item.key}
                  title={item.title}
                  subtitle={
                    item.key === "enterToSend"
                      ? settingsPrefs.chat.enterToSend
                        ? "On"
                        : "Off"
                      : undefined
                  }
                  right={
                    <SettingsToggle
                      checked={settingsPrefs.chat[item.key]}
                      onChange={(value) => updatePrefs("chat", item.key, value)}
                    />
                  }
                />
              ))}
              <SettingsItem
                title="One-time messages"
                subtitle={oneTimeMode ? "Enabled" : "Disabled"}
                right={
                  <SettingsToggle
                    checked={oneTimeMode}
                    onChange={(value) => setOneTimeMode(value)}
                  />
                }
              />
              <div className="settings-card">
                <h4>Quick replies</h4>
                <div className="row">
                  <input
                    value={newQuickReply}
                    onChange={(event) => setNewQuickReply(event.target.value)}
                    placeholder="Add a quick reply"
                  />
                  <button
                    onClick={() => {
                      const value = newQuickReply.trim();
                      if (!value) {
                        return;
                      }
                      setQuickReplies((prev) => [...prev, value].slice(0, 20));
                      setNewQuickReply("");
                    }}
                  >
                    Add
                  </button>
                </div>
                <div className="quick-replies">
                  {quickReplies.length === 0 && (
                    <span className="muted">No quick replies yet.</span>
                  )}
                  {quickReplies.map((reply, index) => (
                    <button
                      key={`qr-${index}`}
                      className="secondary"
                      onClick={() =>
                        setQuickReplies((prev) =>
                          prev.filter((_, idx) => idx !== index)
                        )
                      }
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case "stickers":
        return (
          <div className="settings-subpage">
            <div className="settings-section-block">
              <SettingsItem
                title="Emoji style"
                subtitle={settingsPrefs.stickers.emojiStyle}
                onClick={() =>
                  updatePrefs(
                    "stickers",
                    "emojiStyle",
                    settingsPrefs.stickers.emojiStyle === "native"
                      ? "apple"
                      : settingsPrefs.stickers.emojiStyle === "apple"
                      ? "google"
                      : "native"
                  )
                }
                right={<span className="settings-chevron">{">"}</span>}
              />
              {stickerToggles.map((item) => (
                <SettingsItem
                  key={item.key}
                  title={item.title}
                  right={
                    <SettingsToggle
                      checked={Boolean(settingsPrefs.stickers[item.key])}
                      onChange={(value) =>
                        updatePrefs("stickers", item.key, value)
                      }
                    />
                  }
                />
              ))}
            </div>
          </div>
        );
      case "advanced":
        return (
          <div className="settings-subpage">
            <div className="settings-section-block">
              <h4>Encryption</h4>
              <div className="settings-card">
                <div className="row">
                  <button className="secondary" onClick={handleExportKeys}>
                    Export keys
                  </button>
                  <label className="file-input secondary">
                    Import keys
                    <input
                      type="file"
                      accept="application/json"
                      onChange={handleImportKeys}
                      disabled={importingKeys}
                    />
                  </label>
                </div>
                <button className="danger" onClick={handleResetEncryption}>
                  Reset encryption keys
                </button>
              </div>
              <h4>Experimental</h4>
              {advancedToggles.map((item) => (
                <SettingsItem
                  key={item.key}
                  title={item.title}
                  right={
                    <SettingsToggle
                      checked={Boolean(settingsPrefs.advanced[item.key])}
                      onChange={(value) =>
                        updatePrefs("advanced", item.key, value)
                      }
                    />
                  }
                />
              ))}
              <div className="settings-card">
                <h4>Auto-translate</h4>
                <SettingsItem
                  title="Translate incoming messages"
                  right={
                    <SettingsToggle
                      checked={settingsPrefs.advanced.autoTranslate}
                      onChange={(value) =>
                        updatePrefs("advanced", "autoTranslate", value)
                      }
                    />
                  }
                />
                <label>
                  Translation endpoint
                  <input
                    value={settingsPrefs.advanced.translationEndpoint}
                    onChange={(event) =>
                      updatePrefs(
                        "advanced",
                        "translationEndpoint",
                        event.target.value
                      )
                    }
                    placeholder="https://your-translation-service"
                  />
                </label>
              </div>
              <SettingsItem
                title="Reset local data"
                subtitle="Clears local settings cache"
                danger
                onClick={() => {
                  localStorage.removeItem(
                    `${STORAGE_KEYS.settingsUiPrefix}${sessionUsername}`
                  );
                  setSettingsPrefs(DEFAULT_PREFS);
                  setStatus("Local settings reset.");
                }}
                right={<span className="settings-chevron">{">"}</span>}
              />
            </div>
          </div>
        );
      case "about":
        return (
          <div className="settings-subpage">
            <div className="settings-section-block">
              <SettingsItem title="App version" subtitle="0.1.0" />
              <SettingsItem title="Terms of service" subtitle="Review" />
              <SettingsItem title="Privacy policy" subtitle="Review" />
              <SettingsItem title="FAQ" subtitle="Common questions" />
              <SettingsItem title="Contact support" subtitle="support@local" />
              <SettingsItem title="Open-source licenses" subtitle="View" />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const loadSocial = async () => {
    setSocialLoading(true);
    setSocialError(null);
    try {
      const [feedRes, storyRes, followsRes, notifyRes, insightsRes] = await Promise.all([
        fetchSocialFeed({ kind: socialFeedKind, limit: 50, sort: socialSort }),
        fetchSocialStories(20),
        fetchSocialFollows(),
        fetchSocialNotifications(),
        fetchSocialInsights()
      ]);
      setSocialFeed(feedRes.items || []);
      setSocialStories(storyRes.items || []);
      setFollowingUsers(new Set(followsRes.following || []));
      setSocialFollowers(followsRes.followers || []);
      setSocialNotifications(notifyRes.items || []);
      setSocialInsights(insightsRes.insights || null);
      const usernames = Array.from(
        new Set<string>(
          (feedRes.items || []).map(
            (item: SocialFeedItem) => item.author.username
          )
        )
      );
      if (usernames.length > 0) {
        const updates: Record<string, { online: boolean; lastSeen: number | null }> = {};
        await Promise.all(
          usernames.map(async (name: string) => {
            try {
              const status = await fetchUserStatus(name);
              updates[name] = status;
            } catch {
              updates[name] = { online: false, lastSeen: null };
            }
          })
        );
        setStatusByUser((prev) => ({ ...prev, ...updates }));
      }
    } catch (error) {
      setSocialError((error as Error).message);
    } finally {
      setSocialLoading(false);
    }
  };

  const handleSocialMediaChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSocialMedia(file);
  };

  const handleSocialPublish = async () => {
    if (!socialMedia) {
      setSocialError("Select a file first.");
      return;
    }
    if (socialVisibility === "private" && socialAllowedUsers.length === 0) {
      setSocialError("Choose at least one follower or following.");
      return;
    }
    setSocialPublishing(true);
    setSocialError(null);
    try {
      const upload = await uploadDirect(socialMedia);
      const mediaType = socialMedia.type.startsWith("video")
        ? "video"
        : "image";
      const publishAt = socialScheduleAt
        ? new Date(socialScheduleAt).getTime()
        : undefined;
      await createSocialPost({
        kind: socialComposeKind,
        mediaUrl: upload.publicUrl,
        mediaType,
        caption: socialCaption.trim() || undefined,
        visibility: socialVisibility,
        allowedUsers: socialVisibility === "private" ? socialAllowedUsers : [],
        commentVisibility: socialCommentVisibility,
        expiresInMinutes: socialTimed ? 60 : undefined,
        publishAt: publishAt && Number.isFinite(publishAt) ? publishAt : undefined
      });
      setSocialCaption("");
      setSocialMedia(null);
      setSocialComposeKind("post");
      setSocialVisibility("public");
      setSocialAllowedUsers([]);
      setSocialCommentVisibility("public");
      setSocialTimed(false);
      setSocialScheduleAt("");
      await loadSocial();
    } catch (error) {
      setSocialError((error as Error).message);
    } finally {
      setSocialPublishing(false);
    }
  };

  const handleSocialLike = async (postId: number) => {
    try {
      const result = await toggleSocialLike(postId);
      setSocialFeed((prev) =>
        prev.map((item) =>
          item.post.id === postId
            ? {
                ...item,
                counts: { ...item.counts, likes: result.count },
                viewer: { ...item.viewer, liked: result.liked }
              }
            : item
        )
      );
    } catch (error) {
      setSocialError((error as Error).message);
    }
  };

  const handleSocialSave = async (postId: number) => {
    try {
      const result = await toggleSocialSave(postId);
      setSocialFeed((prev) =>
        prev.map((item) =>
          item.post.id === postId
            ? {
                ...item,
                counts: { ...item.counts, saves: result.count },
                viewer: { ...item.viewer, saved: result.saved }
              }
            : item
        )
      );
      if (result.saved) {
        const targetCollection =
          socialActiveCollection.trim() || "Saved";
        addPostToCollection(targetCollection, postId);
      } else {
        removePostFromCollections(postId);
      }
    } catch (error) {
      setSocialError((error as Error).message);
    }
  };

  const handleSocialView = async (postId: number) => {
    try {
      const result = await addSocialView(postId);
      setSocialFeed((prev) =>
        prev.map((item) =>
          item.post.id === postId
            ? {
                ...item,
                counts: { ...item.counts, views: result.views }
              }
            : item
        )
      );
    } catch (error) {
      setSocialError((error as Error).message);
    }
  };

  const handleSocialCommentsOpen = async (postId: number) => {
    setActiveCommentsPost(postId);
    setCommentDraft("");
    if (socialComments[postId]) {
      return;
    }
    try {
      const result = await fetchSocialComments(postId);
      setSocialComments((prev) => ({
        ...prev,
        [postId]: result.items || []
      }));
    } catch (error) {
      setSocialError((error as Error).message);
    }
  };

  const handleSocialCommentSend = async (postId: number) => {
    const text = commentDraft.trim();
    if (!text) {
      return;
    }
    try {
      const result = await createSocialComment(postId, text);
      setSocialComments((prev) => ({
        ...prev,
        [postId]: [
          ...(prev[postId] || []),
          {
            comment: result.comment,
            author: { username: sessionUsername, avatar: profileState.avatar }
          }
        ]
      }));
      setSocialFeed((prev) =>
        prev.map((item) =>
          item.post.id === postId
            ? {
                ...item,
                counts: { ...item.counts, comments: item.counts.comments + 1 }
              }
            : item
        )
      );
      setCommentDraft("");
    } catch (error) {
      setSocialError((error as Error).message);
    }
  };

  const handleStoryReply = async () => {
    if (!activeStory) {
      return;
    }
    const text = storyReplyText.trim();
    if (!text) {
      return;
    }
    try {
      await createSocialComment(activeStory.post.id, text);
      setStoryReplyText("");
      setActiveStory(null);
    } catch (error) {
      setSocialError((error as Error).message);
    }
  };

  const handleSocialShare = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Copied share link.");
    } catch {
      setStatus("Unable to copy link.");
    }
  };

  const addPostToCollection = (name: string, postId: number) => {
    setSocialCollections((prev) => {
      const existing = prev[name] || [];
      if (existing.includes(postId)) {
        return prev;
      }
      return {
        ...prev,
        [name]: [...existing, postId]
      };
    });
  };

  const removePostFromCollections = (postId: number) => {
    setSocialCollections((prev) => {
      const next: Record<string, number[]> = {};
      for (const [name, ids] of Object.entries(prev)) {
        const filtered = ids.filter((id) => id !== postId);
        if (filtered.length > 0) {
          next[name] = filtered;
        }
      }
      return next;
    });
  };

  const handleCreateCollection = () => {
    const name = socialNewCollection.trim();
    if (!name) {
      return;
    }
    setSocialCollections((prev) => {
      if (prev[name]) {
        return prev;
      }
      return { ...prev, [name]: [] };
    });
    setSocialActiveCollection(name);
    setSocialNewCollection("");
  };

  const togglePinnedPost = (postId: number) => {
    setSocialPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  };

  const handleSocialFollow = async (usernameToFollow: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await unfollowSocialUser(usernameToFollow);
        setFollowingUsers((prev) => {
          const next = new Set(prev);
          next.delete(usernameToFollow);
          return next;
        });
      } else {
        await followSocialUser(usernameToFollow);
        setFollowingUsers((prev) => {
          const next = new Set(prev);
          next.add(usernameToFollow);
          return next;
        });
      }
    } catch (error) {
      setSocialError((error as Error).message);
    }
  };

  const handleCreateConversation = async () => {
    setStatus(null);
    try {
      if (tab === "direct") {
        await createConversation("direct", null, [directUsername]);
        setDirectUsername("");
      } else if (tab === "group" || tab === "channel") {
        const members = groupMembers
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
        const membersToSend = groupVisibility === "private" ? [] : members;
        await createConversation(tab, groupName, membersToSend, groupVisibility);
        setGroupName("");
        setGroupMembers("");
        setGroupVisibility("public");
      } else {
        setStatus("Select a conversation type first.");
        return;
      }
      await refreshConversations();
      setStatus("Conversation created");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const uploadWithProgress = (
    url: string,
    method: string,
    headers: Record<string, string>,
    body: Blob | FormData,
    onProgress: (progress: number) => void
  ): Promise<{ status: number; responseText: string }> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      xhr.onload = () => {
        resolve({ status: xhr.status, responseText: xhr.responseText });
      };
      xhr.onerror = () => reject(new Error("upload failed"));
      xhr.send(body);
    });

  const processUploadQueue = async (items: UploadQueueItem[]) => {
    for (const item of items) {
      setUploadQueue((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: "uploading", progress: 0, error: undefined }
            : entry
        )
      );
      const safeName = sanitizeFilename(item.file.name || "attachment");
      const contentType = normalizeContentType(item.file.type || "");
      try {
        const directResult = await uploadWithProgress(
          `${API_BASE}/api/uploads/direct`,
          "POST",
          {},
          (() => {
            const form = new FormData();
            form.append("file", item.file);
            return form;
          })(),
          (progress) =>
            setUploadQueue((prev) =>
              prev.map((entry) =>
                entry.id === item.id ? { ...entry, progress } : entry
              )
            )
        );
        if (directResult.status >= 200 && directResult.status < 300) {
          const parsed = JSON.parse(directResult.responseText) as {
            publicUrl: string;
            contentType: string;
            key?: string;
          };
          setAttachments((prev) => [
            ...prev,
            {
              kind: resolveAttachmentKind(parsed.contentType || contentType),
              name: safeName,
              data: parsed.publicUrl,
              storageKey: parsed.key,
              contentType: parsed.contentType || contentType
            }
          ]);
          setUploadQueue((prev) =>
            prev.map((entry) =>
              entry.id === item.id
                ? { ...entry, status: "done", progress: 100 }
                : entry
            )
          );
          continue;
        }
        throw new Error("direct upload failed");
      } catch {
        try {
          const upload = await createUpload({
            filename: safeName,
            contentType,
            size: item.file.size
          });
          const presignedResult = await uploadWithProgress(
            upload.url,
            upload.method || "PUT",
            upload.headers || {},
            item.file,
            (progress) =>
              setUploadQueue((prev) =>
                prev.map((entry) =>
                  entry.id === item.id ? { ...entry, progress } : entry
                )
              )
          );
          if (presignedResult.status >= 200 && presignedResult.status < 300) {
            setAttachments((prev) => [
              ...prev,
              {
                kind: resolveAttachmentKind(contentType),
                name: safeName,
                data: upload.publicUrl,
                storageKey: upload.key,
                contentType
              }
            ]);
            setUploadQueue((prev) =>
              prev.map((entry) =>
                entry.id === item.id
                  ? { ...entry, status: "done", progress: 100 }
                  : entry
              )
            );
            continue;
          }
          throw new Error("presigned upload failed");
        } catch {
          if (item.file.size > INLINE_ATTACHMENT_LIMIT) {
            setUploadQueue((prev) =>
              prev.map((entry) =>
                entry.id === item.id
                  ? {
                      ...entry,
                      status: "failed",
                      error: "Large file requires storage config."
                    }
                  : entry
              )
            );
            continue;
          }
        }
      }

      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(item.file);
      });

      setAttachments((prev) => [
        ...prev,
        {
          kind: resolveAttachmentKind(contentType),
          name: safeName,
          data,
          contentType
        }
      ]);
      setUploadQueue((prev) =>
        prev.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: "done", progress: 100 }
            : entry
        )
      );
    }
  };

  const retryUpload = async (id: string) => {
    const target = uploadQueue.find((item) => item.id === id);
    if (!target) {
      return;
    }
    await processUploadQueue([target]);
  };

  const handleAttachmentChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const queuedItems = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      file,
      name: sanitizeFilename(file.name || "attachment"),
      progress: 0,
      status: "queued" as const
    }));

    setUploadQueue((prev) => [...prev, ...queuedItems]);
    await processUploadQueue(queuedItems);
    event.target.value = "";
  };

  const handleTyping = () => {
    if (!selectedConversationId) {
      return;
    }
    if (profileState.privacy.disable_typing_indicator) {
      return;
    }
    setTyping(selectedConversationId, true).catch(() => undefined);
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      setTyping(selectedConversationId, false).catch(() => undefined);
    }, 2000);
  };

  const handleTogglePinned = (messageId: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      localStorage.setItem(
        `${STORAGE_KEYS.pinnedPrefix}${sessionUsername}`,
        JSON.stringify(Array.from(next))
      );
      return next;
    });
  };

  const handleTogglePinnedMedia = (message: ChatMessage, index: number) => {
    if (!selectedConversationId) {
      return;
    }
    const key = attachmentKey(message.id, index);
    setPinnedMediaByConversation((prev) => {
      const current = prev[selectedConversationId] || [];
      const next = current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key];
      return { ...prev, [selectedConversationId]: next };
    });
  };

  const handleToggleStarred = (message: ChatMessage) => {
    const messageId = String(message.id);
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(messageId)) {
        next.delete(messageId);
      } else {
        next.add(messageId);
      }
      localStorage.setItem(
        `${STORAGE_KEYS.starredPrefix}${sessionUsername}`,
        JSON.stringify(Array.from(next))
      );
      return next;
    });

    setSavedMessages((prev) => {
      const exists = prev.find((item) => item.id === messageId);
      if (exists) {
        return prev.filter((item) => item.id !== messageId);
      }
      return [
        {
          id: messageId,
          conversationId: message.conversationId,
          sender: message.sender,
          payload: message.payload,
          createdAt: message.createdAt
        },
        ...prev
      ];
    });
  };

  const handleToggleFocus = () => {
    if (!selectedConversationId) {
      return;
    }
    setFocusByConversation((prev) => {
      const current = prev[selectedConversationId];
      const isActive =
        current?.mutedUntil && current.mutedUntil > Date.now();
      const nextValue = isActive
        ? { mutedUntil: null }
        : {
            mutedUntil: Date.now() + Math.max(1, focusMinutes) * 60 * 1000
          };
      return {
        ...prev,
        [selectedConversationId]: nextValue
      };
    });
  };

  const handleDelete = async (message: ChatMessage) => {
    try {
      if (message.sender === sessionUsername) {
        await deleteMessage({ scope: "all", groupId: message.groupId });
      } else if (typeof message.id === "number") {
        await deleteMessage({ scope: "self", messageId: message.id });
      }
      setMessages((prev) =>
        prev.map((item) =>
          item.id === message.id
            ? {
                ...item,
                payload: { text: "[Deleted]", attachments: [] },
                deletedAt: Date.now()
              }
            : item
        )
      );
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const refreshRoster = async (conversationId: number) => {
    const data = await fetchRoster(conversationId);
    setRoster(data.members || []);
    const invitesData = await listInviteLinks(conversationId);
    setInviteLinks(invitesData.invites || []);
  };

  const handleAddMember = async () => {
    if (!selectedConversationId || !manageUsername) {
      return;
    }
    setStatus(null);
    try {
      await addConversationMember(selectedConversationId, manageUsername);
      setManageUsername("");
      await refreshRoster(selectedConversationId);
      setStatus("Member added");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleRemoveMember = async (username: string) => {
    if (!selectedConversationId) {
      return;
    }
    setStatus(null);
    try {
      await removeConversationMember(selectedConversationId, username);
      await refreshRoster(selectedConversationId);
      setStatus("Member removed");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handlePromoteMember = async (username: string) => {
    if (!selectedConversationId) {
      return;
    }
    setStatus(null);
    try {
      await updateConversationRole(selectedConversationId, username, "admin", {
        manage_members: true,
        manage_invites: true
      });
      await refreshRoster(selectedConversationId);
      setStatus("Admin updated");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleDemoteMember = async (username: string) => {
    if (!selectedConversationId) {
      return;
    }
    setStatus(null);
    try {
      await updateConversationRole(selectedConversationId, username, "member");
      await refreshRoster(selectedConversationId);
      setStatus("Admin removed");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleUpdateAdminPerms = async (
    username: string,
    permissions: { manage_members?: boolean; manage_invites?: boolean }
  ) => {
    if (!selectedConversationId) {
      return;
    }
    setStatus(null);
    try {
      await updateConversationRole(
        selectedConversationId,
        username,
        "admin",
        permissions
      );
      await refreshRoster(selectedConversationId);
      setStatus("Permissions updated");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleCreateInvite = async () => {
    if (!selectedConversationId) {
      return;
    }
    setStatus(null);
    try {
      await createInviteLink(
        selectedConversationId,
        Math.max(1, inviteMaxUses),
        Math.max(1, inviteExpiresMinutes)
      );
      await refreshRoster(selectedConversationId);
      setStatus("Invite created");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleRevokeInvite = async (token: string) => {
    setStatus(null);
    try {
      await revokeInviteLink(token);
      if (selectedConversationId) {
        await refreshRoster(selectedConversationId);
      }
      setStatus("Invite revoked");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const handleRedeemInvite = async () => {
    if (!inviteToken) {
      return;
    }
    const tokenValue = inviteToken.includes("#invite=")
      ? inviteToken.split("#invite=")[1]
      : inviteToken;
    const trimmed = tokenValue.trim();
    if (!trimmed) {
      return;
    }
    setStatus(null);
    try {
      const data = await redeemInviteLink(trimmed);
      setInviteToken("");
      await refreshConversations();
      if (typeof data.conversationId === "number") {
        setSelectedConversationId(data.conversationId);
      }
      setStatus("Joined with invite");
    } catch (error) {
      setStatus((error as Error).message);
    }
  };

  const resetCallState = () => {
    if (callTimeoutRef.current) {
      window.clearTimeout(callTimeoutRef.current);
      callTimeoutRef.current = null;
    }
    callPeerRef.current?.close();
    callPeerRef.current = null;
    pendingIceRef.current = [];
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    remoteStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setIncomingCall(null);
    setCallError(null);
    setMicMuted(false);
    setCallState({
      status: "idle",
      callId: null,
      peerUsername: null,
      media: "audio",
      conversationId: null
    });
  };

  const appendCallEndedMessage = (conversationId: number, durationMs: number) => {
    const payload = {
      text: `Call ended (${formatDuration(durationMs)})`,
      attachments: []
    };
    setMessages((prev) => [
      ...prev,
      {
        id: `call-${Date.now()}`,
        groupId: `call-${Date.now()}`,
        conversationId,
        sender: "system",
        payload,
        createdAt: Date.now(),
        deletedAt: null
      }
    ]);
    setLastMessageByConversation((prev) => ({
      ...prev,
      [conversationId]: {
        sender: "system",
        payload,
        createdAt: Date.now()
      }
    }));
  };

  const finalizeCallLog = () => {
    if (callStartRef.current && callConversationRef.current) {
      appendCallEndedMessage(
        callConversationRef.current,
        Date.now() - callStartRef.current
      );
    }
    callStartRef.current = null;
    callConversationRef.current = null;
  };

  const handleToggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) {
      return;
    }
    const tracks = stream.getAudioTracks();
    if (!tracks.length) {
      return;
    }
    const nextMuted = !micMuted;
    tracks.forEach((track) => {
      track.enabled = !nextMuted;
    });
    setMicMuted(nextMuted);
  };

  const flushPendingIce = async () => {
    if (!callPeerRef.current || !callPeerRef.current.remoteDescription) {
      return;
    }
    const pending = [...pendingIceRef.current];
    pendingIceRef.current = [];
    for (const candidate of pending) {
      try {
        await callPeerRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch {
        // ignore invalid candidates
      }
    }
  };

  const createPeerConnection = (callId: string, target: "caller" | "callee") => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        sendIceCandidate({
          callId,
          target,
          candidate: JSON.stringify(event.candidate)
        }).catch(() => undefined);
      }
    };
    peer.ontrack = (event) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
      }
      remoteStreamRef.current.addTrack(event.track);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreamRef.current;
      }
    };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === "failed") {
        setCallError("Call failed.");
        finalizeCallLog();
        resetCallState();
      }
    };
    peer.oniceconnectionstatechange = () => {
      if (
        peer.iceConnectionState === "failed" ||
        peer.iceConnectionState === "disconnected"
      ) {
        setCallError("Connection lost.");
        finalizeCallLog();
        resetCallState();
      }
    };
    callPeerRef.current = peer;
    return peer;
  };

  const handleStartCall = async (media: "audio" | "video") => {
    if (!selectedConversation || selectedConversation.type !== "direct") {
      return;
    }
    if (callState.status !== "idle") {
      return;
    }
    const other = selectedConversation.members.find(
      (member) => member.username !== sessionUsername
    );
    if (!other) {
      return;
    }
    setCallError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCallError("Media devices are not available in this browser.");
        return;
      }
      const bundle = await getCachedKeyBundle(other.username);
      const devices = bundle.devices || [];
      const target = devices[0];
      if (!target) {
        setStatus("No device available for this user.");
        return;
      }

      const callId = crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`;
      callConversationRef.current = selectedConversation.id;
      const peer = createPeerConnection(callId, "callee");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: media === "video"
      });
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      await startCall({
        callId,
        conversationId: selectedConversation.id,
        toUsername: other.username,
        toDeviceId: String(target.sessionDeviceId ?? target.deviceId),
        media,
        offer: JSON.stringify(offer)
      });
      setCallState({
        status: "outgoing",
        callId,
        peerUsername: other.username,
        media,
        conversationId: selectedConversation.id
      });
      setMicMuted(false);
      if (callTimeoutRef.current) {
        window.clearTimeout(callTimeoutRef.current);
      }
      callTimeoutRef.current = window.setTimeout(() => {
        if (callStateRef.current.status === "outgoing") {
          setCallError("No answer.");
          handleEndCall();
        }
      }, 30000);
    } catch (error) {
      setCallError((error as Error).message);
      resetCallState();
    }
  };

  const handleAcceptCall = async () => {
    if (!incomingCall) {
      return;
    }
    const offerRaw = incomingCall.payload.offer;
    const callId = incomingCall.callId;
    const media = incomingCall.payload.media || "audio";
    const conversationId =
      incomingCall.payload.conversationId ?? selectedConversationId ?? null;
    if (!offerRaw) {
      setCallError("Missing offer.");
      resetCallState();
      return;
    }
    setCallError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCallError("Media devices are not available in this browser.");
        resetCallState();
        return;
      }
      if (typeof conversationId === "number") {
        callConversationRef.current = conversationId;
      }
      const peer = createPeerConnection(callId, "caller");
      await peer.setRemoteDescription(
        new RTCSessionDescription(JSON.parse(offerRaw))
      );
      await flushPendingIce();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: media === "video"
      });
      localStreamRef.current = stream;
      stream.getTracks().forEach((track) => peer.addTrack(track, stream));
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      await answerCall({ callId, answer: JSON.stringify(answer) });
      setCallState({
        status: "active",
        callId,
        peerUsername: incomingCall.payload.fromUsername || null,
        media,
        conversationId: typeof conversationId === "number" ? conversationId : null
      });
      callStartRef.current = Date.now();
      setMicMuted(false);
      if (callTimeoutRef.current) {
        window.clearTimeout(callTimeoutRef.current);
        callTimeoutRef.current = null;
      }
      setIncomingCall(null);
    } catch (error) {
      setCallError((error as Error).message);
      resetCallState();
    }
  };

  const handleDeclineCall = async () => {
    if (!incomingCall) {
      return;
    }
    try {
      await endCall({ callId: incomingCall.callId });
    } catch {
      // ignore
    }
    resetCallState();
  };

  const handleEndCall = async () => {
    if (!callState.callId) {
      return;
    }
    try {
      await endCall({ callId: callState.callId });
    } catch {
      // ignore
    }
    finalizeCallLog();
    resetCallState();
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (tab !== "all" && conv.type !== tab) {
        return false;
      }
      if (!conversationQuery) {
        return true;
      }
      const title = getConversationTitle(conv, sessionUsername);
      const members = conv.members.map((member) => member.username).join(", ");
      return (
        matchesQuery(title, conversationQuery) ||
        matchesQuery(members, conversationQuery)
      );
    });
  }, [conversations, tab, conversationQuery, sessionUsername]);

  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      const aTime = lastMessageByConversation[a.id]?.createdAt ?? 0;
      const bTime = lastMessageByConversation[b.id]?.createdAt ?? 0;
      return bTime - aTime;
    });
  }, [filteredConversations, lastMessageByConversation]);

  const selectedConversation = conversations.find(
    (item) => item.id === selectedConversationId
  );
  const focusState = selectedConversationId
    ? focusByConversation[selectedConversationId]
    : null;
  const focusActive = Boolean(
    focusState?.mutedUntil && focusState.mutedUntil > Date.now()
  );
  const focusUntilLabel = focusState?.mutedUntil
    ? new Date(focusState.mutedUntil).toLocaleTimeString()
    : null;
  const directPartner =
    selectedConversation?.type === "direct"
      ? selectedConversation.members.find(
          (member) => member.username !== sessionUsername
        )?.username || null
      : null;
  const directStatus = directPartner ? statusByUser[directPartner] : null;
  const currentMemberRole =
    roster.find((member) => member.username === sessionUsername)?.role || null;
  const canManageConversation =
    currentMemberRole === "owner" || currentMemberRole === "admin";
  const quietHoursActive = selectedConversationId
    ? isQuietHoursActive(quietHoursByConversation[selectedConversationId])
    : false;
  const locationSupported =
    typeof navigator !== "undefined" && "geolocation" in navigator;

  const activeMessages = useMemo(
    () =>
      messages.filter((msg) => msg.conversationId === selectedConversationId),
    [messages, selectedConversationId]
  );

  const searchedMessages = useMemo(() => {
    return activeMessages.filter((msg) => {
      if (messageFilters.sender) {
        if (!matchesQuery(msg.sender, messageFilters.sender)) {
          return false;
        }
      }
      if (messageFilters.from) {
        const fromTime = new Date(messageFilters.from).getTime();
        if (Number.isFinite(fromTime) && msg.createdAt < fromTime) {
          return false;
        }
      }
      if (messageFilters.to) {
        const toTime = new Date(messageFilters.to).getTime();
        if (Number.isFinite(toTime) && msg.createdAt > toTime + 24 * 60 * 60 * 1000) {
          return false;
        }
      }
      if (messageFilters.type !== "all") {
        const type = messageFilters.type;
        const hasText = Boolean(msg.payload.text?.trim());
        const hasLink = Boolean(
          msg.payload.linkPreview || extractFirstUrl(msg.payload.text || "")
        );
        const hasAttachment = msg.payload.attachments.some(
          (attachment) => attachment.kind === type
        );
        if (type === "text" && !hasText) {
          return false;
        }
        if (type === "link" && !hasLink) {
          return false;
        }
        if (
          ["image", "video", "audio", "file", "location"].includes(type) &&
          !hasAttachment
        ) {
          return false;
        }
      }

      if (messageQuery) {
        const textMatch = matchesQuery(msg.payload.text || "", messageQuery);
        const attachmentMatch = msg.payload.attachments.some((attachment) =>
          matchesQuery(attachment.name, messageQuery)
        );
        const previewMatch =
          (msg.payload.linkPreview?.title &&
            matchesQuery(msg.payload.linkPreview.title, messageQuery)) ||
          (msg.payload.linkPreview?.description &&
            matchesQuery(msg.payload.linkPreview.description, messageQuery)) ||
          (msg.payload.linkPreview?.siteName &&
            matchesQuery(msg.payload.linkPreview.siteName, messageQuery)) ||
          (msg.payload.linkPreview?.url &&
            matchesQuery(msg.payload.linkPreview.url, messageQuery));
        return textMatch || attachmentMatch || previewMatch;
      }

      return true;
    });
  }, [activeMessages, messageFilters, messageQuery]);

  const orderedMessages = useMemo(() => {
    return [...searchedMessages].sort((a, b) => a.createdAt - b.createdAt);
  }, [searchedMessages]);

  const messageItems = useMemo(() => {
    const items: Array<
      | { kind: "date"; id: string; label: string }
      | { kind: "message"; message: ChatMessage }
    > = [];
    let lastDateKey = "";
    for (const message of orderedMessages) {
      const dateKey = new Date(message.createdAt).toDateString();
      if (dateKey !== lastDateKey) {
        items.push({
          kind: "date",
          id: `date-${dateKey}`,
          label: formatDateLabel(message.createdAt, displayTimeZone)
        });
        lastDateKey = dateKey;
      }
      items.push({ kind: "message", message });
    }
    return items;
  }, [orderedMessages]);

  useEffect(() => {
    if (!selectedConversationId || activeView !== "chat") {
      return;
    }
    const pending: Attachment[] = [];
    for (const item of messageItems) {
      if (item.kind !== "message") {
        continue;
      }
      if (item.message.conversationId !== selectedConversationId) {
        continue;
      }
      for (const attachment of item.message.payload.attachments) {
        if (needsAttachmentUrl(attachment, attachmentUrlCache)) {
          pending.push(attachment);
        }
      }
    }
    if (pending.length === 0) {
      return;
    }
    const maxPrefetch = 6;
    pending.slice(0, maxPrefetch).forEach((attachment) => {
      ensureAttachmentUrl(attachment).catch(() => undefined);
    });
  }, [
    messageItems,
    selectedConversationId,
    activeView,
    attachmentUrlCache,
    ensureAttachmentUrl
  ]);

  const pinnedMessages = useMemo(
    () => activeMessages.filter((msg) => pinnedIds.has(String(msg.id))),
    [activeMessages, pinnedIds]
  );

  const composerSpamScore = useMemo(
    () => (messageText ? spamScore(messageText) : 0),
    [messageText]
  );

  const pinnedMediaItems = useMemo(() => {
    if (!selectedConversationId) {
      return [];
    }
    const pinnedKeys = pinnedMediaByConversation[selectedConversationId] || [];
    if (pinnedKeys.length === 0) {
      return [];
    }
    const items: Array<{
      key: string;
      attachment: Attachment;
      message: ChatMessage;
      index: number;
    }> = [];
    for (const message of activeMessages) {
      if (message.conversationId !== selectedConversationId) {
        continue;
      }
      message.payload.attachments.forEach((attachment, index) => {
        if (attachment.kind === "location") {
          return;
        }
        const key = attachmentKey(message.id, index);
        if (pinnedKeys.includes(key)) {
          items.push({ key, attachment, message, index });
        }
      });
    }
    return items;
  }, [activeMessages, pinnedMediaByConversation, selectedConversationId]);

  const sharedAttachmentItems = useMemo(() => {
    return activeMessages
      .flatMap((message) =>
        message.payload.attachments.map((attachment, index) => ({
          key: `${message.id}-${index}`,
          message,
          attachment,
          index
        }))
      )
      .filter((item) => item.attachment.kind !== "location")
      .reverse();
  }, [activeMessages]);

  const sharedMediaPreviewItems = useMemo(
    () =>
      sharedAttachmentItems
        .filter(
          (item) =>
            item.attachment.kind === "image" || item.attachment.kind === "video"
        )
        .slice(0, 8),
    [sharedAttachmentItems]
  );

  const sharedFilePreviewItems = useMemo(
    () =>
      sharedAttachmentItems
        .filter(
          (item) =>
            item.attachment.kind === "file" || item.attachment.kind === "audio"
        )
        .slice(0, 4),
    [sharedAttachmentItems]
  );

  const activeProfileAvatar =
    (directPartner && publicProfiles[directPartner]?.avatar) || profileState.avatar || null;
  const activeProfileName = directPartner
    ? directPartner
    : selectedConversation
    ? getConversationTitle(selectedConversation, sessionUsername)
    : sessionUsername;
  const activeProfileHandle = directPartner
    ? `@${directPartner}`
    : selectedConversation
    ? `${selectedConversation.type} room`
    : `@${sessionUsername}`;
  const activeProfileBio = directPartner
    ? publicProfiles[directPartner]?.bio || "Encrypted thread in focus."
    : selectedConversation?.type === "group"
    ? `${selectedConversation.members.length} members in this room`
    : selectedConversation?.type === "channel"
    ? "Broadcast-style conversation space"
    : "Private conversation";
  const activeProfileStatus = directStatus?.online
    ? "Online"
    : directStatus
    ? formatLastSeen(directStatus.lastSeen)
    : selectedConversation
    ? `${selectedConversation.members.length} members`
    : "Idle";

  const savedFilteredMessages = savedMessages.filter((msg) => {
    if (messageFilters.sender) {
      if (!matchesQuery(msg.sender, messageFilters.sender)) {
        return false;
      }
    }
    if (messageFilters.from) {
      const fromTime = new Date(messageFilters.from).getTime();
      if (Number.isFinite(fromTime) && msg.createdAt < fromTime) {
        return false;
      }
    }
    if (messageFilters.to) {
      const toTime = new Date(messageFilters.to).getTime();
      if (Number.isFinite(toTime) && msg.createdAt > toTime + 24 * 60 * 60 * 1000) {
        return false;
      }
    }
    if (messageFilters.type !== "all") {
      const type = messageFilters.type;
      const hasText = Boolean(msg.payload.text?.trim());
      const hasLink = Boolean(msg.payload.linkPreview || extractFirstUrl(msg.payload.text || ""));
      const hasAttachment = msg.payload.attachments.some(
        (attachment) => attachment.kind === type
      );
      if (type === "text" && !hasText) {
        return false;
      }
      if (type === "link" && !hasLink) {
        return false;
      }
      if (
        ["image", "video", "audio", "file", "location"].includes(type) &&
        !hasAttachment
      ) {
        return false;
      }
    }

    if (messageQuery) {
      const textMatch = matchesQuery(msg.payload.text || "", messageQuery);
      const attachmentMatch = msg.payload.attachments.some((attachment) =>
        matchesQuery(attachment.name, messageQuery)
      );
      const previewMatch =
        (msg.payload.linkPreview?.title &&
          matchesQuery(msg.payload.linkPreview.title, messageQuery)) ||
        (msg.payload.linkPreview?.description &&
          matchesQuery(msg.payload.linkPreview.description, messageQuery)) ||
        (msg.payload.linkPreview?.siteName &&
          matchesQuery(msg.payload.linkPreview.siteName, messageQuery)) ||
        (msg.payload.linkPreview?.url &&
          matchesQuery(msg.payload.linkPreview.url, messageQuery));
      return textMatch || attachmentMatch || previewMatch;
    }

    return true;
  });

  const getStatusMark = (groupId: string) => {
    const statusRow = statusByGroupId[groupId];
    if (!statusRow) {
      return "";
    }
    if (statusRow.readAt) {
      return "\u2713\u2713";
    }
    if (statusRow.deliveredAt) {
      return "\u2713\u2713";
    }
    return "\u2713";
  };

  useEffect(() => {
    if (!messageEndRef.current) {
      return;
    }
    messageEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [orderedMessages.length, selectedConversationId]);

  const unreadTotal = Object.values(unreadByConversation).reduce(
    (sum, value) => sum + value,
    0
  );
  const workspaceLabel = showSettings
    ? "Settings cockpit"
    : activeView === "saved"
    ? "Saved archive"
    : activeView === "chat-feed"
    ? "Media gallery"
    : "Message control";
  const workspaceTitle = showSettings
    ? settingsTitle
    : selectedConversation
    ? getConversationTitle(selectedConversation, sessionUsername)
    : "Choose a thread and start moving";
  const workspaceDescription = showSettings
    ? "Tune privacy, devices, backups, and your overall experience from one focused place."
    : selectedConversation
    ? "Everything around the active conversation is now staged as a focused workspace."
    : "Conversations, saved items, and media tools now live inside one redesigned command surface.";

  return (
    <div className="app app-shell">
      <div className="shell-ambient shell-ambient-a" />
      <div className="shell-ambient shell-ambient-b" />
      {(!isLoggedIn || adminRoute) && <header className="topbar shell-topbar">
        <div className="brand brand-lockup">
          <div className="logo">
            <img src="/logo.png" alt="Pakeger logo" />
          </div>
          <div className="brand-copy">
            <span className="brand-eyebrow">Messaging Reframed</span>
            <h1>Pakeger</h1>
            <p>Secure collaboration with a sharper cockpit and cleaner rhythm.</p>
          </div>
        </div>
        <div className="topbar-summary">
          <div className="summary-pill">
            <strong>{sortedConversations.length}</strong>
            <span>threads</span>
          </div>
          <div className="summary-pill">
            <strong>{unreadTotal}</strong>
            <span>unread</span>
          </div>
          <div className="summary-pill">
            <strong>{savedMessages.length}</strong>
            <span>saved</span>
          </div>
        </div>
        <div className="topbar-actions control-dock">
          <button
            className="ghost"
            onClick={() =>
              setTheme((prev) => (prev === "dark" ? "light" : "dark"))
            }
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          {isLoggedIn && !adminRoute && (
            <button
              className="ghost"
              onClick={() => setShowSettings((v) => !v)}
            >
              {showSettings ? "Back to chats" : "Settings"}
            </button>
          )}
        </div>
      </header>}

      {adminRoute && !isAdmin && (
        <section className="card auth-card hero-auth-card admin-access-card">
          <span className="panel-kicker">Restricted zone</span>
          <h2>Admin Access</h2>
          <p className="note">
            Enter the control layer for moderation, policy switches, and platform operations.
          </p>
          <label>
            Username
            <input
              value={adminUsername}
              onChange={(event) => setAdminUsername(event.target.value)}
              placeholder=""
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={adminPassword}
              onChange={(event) => setAdminPassword(event.target.value)}
              placeholder=""
            />
          </label>
          <div className="row">
            <button onClick={handleAdminLogin} disabled={!adminUsername || !adminPassword}>
              Admin login
            </button>
          </div>
        </section>
      )}

      {adminRoute && isAdmin && (
        <section className="admin-panel card command-center">
          <div className="admin-header">
            <div>
              <span className="panel-kicker">Operations</span>
              <h2>Admin Panel</h2>
              <p className="muted">Moderation, users, and conversations.</p>
            </div>
            <div className="row">
              <input
                value={newAdminPassword}
                onChange={(event) => setNewAdminPassword(event.target.value)}
                placeholder="new admin password"
                type="password"
              />
              <button
                onClick={handleAdminPasswordChange}
                disabled={!newAdminPassword}
              >
                Change password
              </button>
              <button className="secondary" onClick={() => refreshAdminData()}>
                Refresh
              </button>
              <button
                className="secondary"
                onClick={() => setShowBlueTeam((prev) => !prev)}
              >
                Blue Team
              </button>
              <button className="secondary" onClick={handleAdminLogout}>
                Log out
              </button>
            </div>
          </div>

          {showBlueTeam && (
            <div className="admin-block">
              <h3>Blue Team Center</h3>
              <p className="muted">
                Security dashboard and gateway controls.
              </p>
              <div className="admin-actions">
                <a className="link-button" href="/admin" target="_blank" rel="noreferrer">
                  Gateway Dashboard
                </a>
                <a className="link-button" href="/admin/domains" target="_blank" rel="noreferrer">
                  Domain Verify
                </a>
                <a className="link-button" href="/admin/waf" target="_blank" rel="noreferrer">
                  WAF Rules
                </a>
                <a className="link-button" href="/admin/bot" target="_blank" rel="noreferrer">
                  Bot Controls
                </a>
                <a className="link-button" href="/admin/geo" target="_blank" rel="noreferrer">
                  Geo Policies
                </a>
                <a className="link-button" href="/admin/reports" target="_blank" rel="noreferrer">
                  Security Reports
                </a>
                <a className="link-button" href="/admin/experiments" target="_blank" rel="noreferrer">
                  Experiments
                </a>
                <a className="link-button" href="/reports/hourly.pdf" target="_blank" rel="noreferrer">
                  Hourly PDF
                </a>
                <a className="link-button" href="/static/behavior.js" target="_blank" rel="noreferrer">
                  behavior.js
                </a>
              </div>
            </div>
          )}

          {adminHasPermission("manage_settings") && (
            <div className="admin-block">
              <h3>Global Lockdown</h3>
              <p className="muted">
                Pause all new messages, posts, stories, and comments.
              </p>
              <div className="row">
                <span className={adminLockdown ? "tag danger" : "tag"}>
                  {adminLockdown ? "Enabled" : "Disabled"}
                </span>
                <button
                  className={adminLockdown ? "danger" : "secondary"}
                  onClick={handleAdminToggleLockdown}
                  disabled={adminLockdownPending}
                >
                  {adminLockdown ? "Disable lockdown" : "Enable lockdown"}
                </button>
              </div>
              <div className="admin-block">
                <h4>Lockdown exceptions</h4>
                <p className="muted">
                  Allow messaging only inside selected channels or groups.
                </p>
                {adminConversations.length === 0 ? (
                  <p className="muted">
                    Load conversations (manage_conversations permission required) or
                    paste conversation IDs.
                  </p>
                ) : (
                  <div className="admin-permissions">
                    {adminConversations
                      .filter((conv) => conv.type !== "direct")
                      .map((conv) => (
                        <label
                          key={`lockdown-${conv.id}`}
                          className="checkbox-row"
                        >
                          <input
                            type="checkbox"
                            checked={adminLockdownAllowIds.includes(conv.id)}
                            onChange={() =>
                              toggleLockdownAllowedConversation(conv.id)
                            }
                          />
                          <span>
                            {conv.name || "Untitled"} ({conv.type} #{conv.id})
                          </span>
                        </label>
                      ))}
                  </div>
                )}
                <div className="row">
                  <input
                    value={adminLockdownAllowInput}
                    onChange={(event) =>
                      setAdminLockdownAllowInput(event.target.value)
                    }
                    placeholder="Allowed conversation IDs (comma separated)"
                  />
                  <button
                    className="secondary"
                    onClick={handleAdminSaveLockdownAllow}
                    disabled={adminLockdownSaving}
                  >
                    Save exceptions
                  </button>
                </div>
              </div>
            </div>
          )}

          {adminHasPermission("manage_system") && (
            <div className="admin-block">
              <h3>System Messages</h3>
              <p className="muted">Broadcast read-only messages to all users.</p>
              <div className="row">
                <input
                  value={systemMessage}
                  onChange={(event) => setSystemMessage(event.target.value)}
                  placeholder="Write a system announcement..."
                />
                <label className="file-input">
                  {systemMessageUploading ? "Uploading..." : "Add media"}
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.zip,.txt"
                    onChange={handleSystemMessageMedia}
                    disabled={systemMessageUploading || systemMessageSending}
                  />
                </label>
                <button
                  onClick={handleSendSystemMessage}
                  disabled={
                    systemMessageSending ||
                    systemMessageUploading ||
                    (!systemMessage.trim() &&
                      systemMessageAttachments.length === 0)
                  }
                >
                  {systemMessageSending ? "Sending..." : "Send"}
                </button>
              </div>
              {systemMessageAttachments.length > 0 && (
                <div className="attachments-preview">
                  {systemMessageAttachments.map((attachment, index) => (
                    <button
                      key={`${attachment.name}-${index}`}
                      className="secondary"
                      onClick={() =>
                        setSystemMessageAttachments((prev) =>
                          prev.filter((_, itemIndex) => itemIndex !== index)
                        )
                      }
                      disabled={systemMessageSending}
                      title="Remove attachment"
                    >
                      {attachment.kind}: {attachment.name} ×
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {adminHasPermission("manage_system") && (
            <div className="admin-block">
              <h3>Blocked messages</h3>
              <p className="muted">
                Server-side rejections (quiet hours, forwarding disabled).
              </p>
              <div className="admin-list">
                {adminBlockedEvents.length === 0 && (
                  <p className="muted">No blocked events yet.</p>
                )}
                {adminBlockedEvents.map((event) => (
                  <div key={`blocked-${event.id}`} className="admin-item">
                    <div className="admin-main">
                      <div>
                        <strong>{event.user.username}</strong>
                        <span className="muted">
                          {event.conversation.name || "Untitled"} (
                          {event.conversation.type}) • {event.reason}
                        </span>
                      </div>
                      <span className="tag warn">
                        {new Date(event.createdAt).toLocaleString()}
                      </span>
                    </div>
                    {event.metadata && (
                      <div className="admin-meta">
                        <span>{JSON.stringify(event.metadata)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {adminHasPermission("manage_admins") && (
            <div className="admin-block">
              <h3>Admin Access</h3>
              <p className="muted">
                Create new admins and assign permissions.
              </p>
              <div className="row">
                <input
                  value={newAdminAccountUsername}
                  onChange={(event) => setNewAdminAccountUsername(event.target.value)}
                  placeholder="username"
                />
                <input
                  type="password"
                  value={newAdminAccountPassword}
                  onChange={(event) => setNewAdminAccountPassword(event.target.value)}
                  placeholder="password"
                />
                <select
                  value={newAdminAccountRole}
                  onChange={(event) =>
                    setNewAdminAccountRole(event.target.value as "super" | "standard")
                  }
                >
                  <option value="standard">Standard</option>
                  <option value="super">Super</option>
                </select>
                <button onClick={handleAdminCreateAccount}>Create admin</button>
              </div>
              <div className="admin-permissions">
                {ADMIN_PERMISSION_OPTIONS.map((perm) => (
                  <label key={`new-admin-${perm.key}`} className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={newAdminAccountPermissions.includes(perm.key)}
                      onChange={() => toggleNewAdminPermission(perm.key)}
                    />
                    <span>{perm.label}</span>
                  </label>
                ))}
              </div>

              <div className="admin-list">
                {adminAdmins.length === 0 && (
                  <p className="muted">No additional admins yet.</p>
                )}
                {adminAdmins.map((admin) => {
                  const activePermissions =
                    adminPermissionEdits[admin.id] || admin.permissions || [];
                  return (
                    <div key={`admin-${admin.id}`} className="admin-item">
                      <div className="admin-main">
                        <div>
                          <strong>{admin.username}</strong>
                          <span className="muted">
                            Role: {admin.role} | ID {admin.id}
                          </span>
                        </div>
                        <div className="admin-tags">
                          {activePermissions.length === 0 ? (
                            <span className="tag warn">No permissions</span>
                          ) : (
                            activePermissions.map((perm) => (
                              <span key={`${admin.id}-${perm}`} className="tag">
                                {perm}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="admin-permissions">
                        {ADMIN_PERMISSION_OPTIONS.map((perm) => (
                          <label
                            key={`${admin.id}-${perm.key}`}
                            className="checkbox-row"
                          >
                            <input
                              type="checkbox"
                              checked={activePermissions.includes(perm.key)}
                              onChange={() =>
                                toggleAdminPermissionEdit(admin.id, perm.key)
                              }
                            />
                            <span>{perm.label}</span>
                          </label>
                        ))}
                      </div>
                      <div className="admin-actions">
                        <button onClick={() => handleAdminSavePermissions(admin.id)}>
                          Save permissions
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="admin-grid">
            {adminHasPermission("manage_users") && (
              <div className="admin-block">
                <h3>Users</h3>
                <div className="admin-list">
                  {adminUsers.map((user) => (
                    <div key={user.id} className="admin-item">
                      <div className="admin-main">
                        <div>
                          <strong>{user.username}</strong>
                          <span className="muted">
                            ID {user.id} | {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                          <span className="muted">
                            {user.firstName} {user.lastName} | {user.phone || "No phone"}
                          </span>
                        </div>
                        <div className="admin-tags">
                          <span className={user.banned ? "tag danger" : "tag"}>
                            {user.banned ? "Banned" : "Active"}
                          </span>
                          <span className={user.canSend ? "tag" : "tag warn"}>
                            Send {user.canSend ? "On" : "Off"}
                          </span>
                          <span className={user.canCreate ? "tag" : "tag warn"}>
                            Create {user.canCreate ? "On" : "Off"}
                          </span>
                          <span className={user.allowDirect ? "tag" : "tag warn"}>
                            Direct {user.allowDirect ? "On" : "Off"}
                          </span>
                          <span className={user.allowGroupInvite ? "tag" : "tag warn"}>
                            Invites {user.allowGroupInvite ? "On" : "Off"}
                          </span>
                        </div>
                      </div>
                      {user.profile && (
                        <div className="admin-meta">
                          <span>IP: {user.profile.last_ip}</span>
                          <span>Device: {user.profile.last_device_model || "unknown"}</span>
                          <span>Platform: {user.profile.last_platform || "unknown"}</span>
                          <span>Seen: {new Date(user.profile.last_seen_at).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="admin-actions">
                        <button onClick={() => handleAdminToggle(user, "banned")}>
                          {user.banned ? "Unban" : "Ban"}
                        </button>
                        <button onClick={() => handleAdminToggle(user, "canSend")}>
                          {user.canSend ? "Disable Send" : "Enable Send"}
                        </button>
                        <button onClick={() => handleAdminToggle(user, "canCreate")}>
                          {user.canCreate ? "Disable Create" : "Enable Create"}
                        </button>
                        <button onClick={() => handleAdminToggle(user, "allowDirect")}>
                          {user.allowDirect ? "Disable Direct" : "Enable Direct"}
                        </button>
                        <button onClick={() => handleAdminToggle(user, "allowGroupInvite")}>
                          {user.allowGroupInvite ? "Disable Invites" : "Enable Invites"}
                        </button>
                        <button
                          className="secondary"
                          onClick={() => handleAdminResetPassword(user.id)}
                        >
                          Reset Password
                        </button>
                        <button
                          className="secondary"
                          onClick={() => handleAdminDownloadMetadata(user)}
                        >
                          Download JSON
                        </button>
                        <button
                          className="danger"
                          onClick={() => handleAdminDeleteUser(user.id)}
                        >
                          Delete User
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {adminHasPermission("manage_conversations") && (
              <div className="admin-block">
                <h3>Conversations</h3>
                <div className="admin-list">
                  {adminConversations.map((conv) => (
                    <div key={conv.id} className="admin-item">
                      <div className="admin-main">
                        <div>
                          <strong>{conv.name || "Untitled"}</strong>
                          <span className="muted">
                            {conv.type} | ID {conv.id} | Members {conv.members.length}
                          </span>
                        </div>
                        <button
                          className="danger"
                          onClick={() => handleAdminDeleteConversation(conv.id)}
                        >
                          Delete
                        </button>
                      </div>
                      <div className="admin-meta">
                        <span>Members: {conv.members.join(", ")}</span>
                        {conv.visibility && <span>Visibility: {conv.visibility}</span>}
                        <span>Created: {new Date(conv.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {!adminRoute && !isLoggedIn && (
        <section className="auth-shell">
          <div className="auth-showcase card">
            <div className="auth-showcase-badge">Nova mode</div>
            <div className="auth-showcase-copy">
              <h2>
                {authStep === "phone"
                  ? "A chat-first entrance that already feels like the product."
                  : "Finish your identity inside the same visual world."}
              </h2>
              <p>
                Neon surfaces, focused conversation flow, and encrypted messaging
                from the first screen onward.
              </p>
            </div>
            <div className="auth-preview-window">
              <div className="auth-preview-sidebar">
                <span className="auth-preview-chip active">Chats</span>
                <span className="auth-preview-chip">Calls</span>
                <span className="auth-preview-chip">Saved</span>
              </div>
              <div className="auth-preview-chat">
                <div className="auth-preview-head">
                  <div className="auth-preview-avatar" />
                  <div>
                    <strong>Sara</strong>
                    <span>Online now</span>
                  </div>
                </div>
                <div className="auth-preview-bubble">It&apos;s going amazing!</div>
                <div className="auth-preview-bubble ghost">
                  We rebuilt the chat layout from the ground up.
                </div>
                <div className="auth-preview-composer">
                  <span>Type a message...</span>
                  <button type="button">↑</button>
                </div>
              </div>
            </div>
          </div>

          <section className="card auth-card auth-screen hero-auth-card auth-form-card">
            <div className="auth-hero">
              <span className="panel-kicker">Fresh Interface</span>
              <h2>
                {authStep === "phone"
                  ? "Step into a redesigned messaging space"
                  : "Build your identity before you enter"}
              </h2>
              <p className="note">
                The login flow now lives in the same family as the main chat experience.
              </p>
            </div>
            {authStep === "phone" ? (
              <>
                <h3>Your phone number</h3>
                <p className="note auth-note">
                  Please confirm your country code and enter your phone number.
                </p>

                <div className="auth-field">
                  <label>Country</label>
                  <div className="country-select">
                    <select
                      value={countryCode}
                      onChange={(event) => setCountryCode(event.target.value)}
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.flag} {country.name} ({country.dialCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="auth-field">
                  <label>Phone number</label>
                  <div className="phone-row">
                    <span className="phone-code">
                      {selectedCountry.flag} {selectedCountry.dialCode}
                    </span>
                    <input
                      value={phoneNumber}
                      onChange={(event) =>
                        setPhoneNumber(event.target.value.replace(/[^\d\s]/g, ""))
                      }
                      placeholder="Phone number"
                      inputMode="numeric"
                    />
                  </div>
                </div>

                <label>
                  Password (if enabled)
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="optional"
                  />
                </label>

                <div className="auth-actions">
                  <button
                    className="auth-next"
                    onClick={() => setAuthStep("details")}
                    disabled={!phoneComplete}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Finish signup</h3>
                <p className="note auth-note">Add name and username to create account.</p>

                <div className="auth-field">
                  <label>Phone</label>
                  <div className="phone-row">
                    <span className="phone-code">
                      {selectedCountry.flag} {selectedCountry.dialCode}
                    </span>
                    <input value={phoneNumber} readOnly />
                  </div>
                </div>

                <label>
                  First name
                  <input
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="First name"
                  />
                </label>
                <label>
                  Last name
                  <input
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Last name"
                  />
                </label>
                <label>
                  Username
                  <input
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value.toLowerCase())
                    }
                    placeholder="username (5-32 chars)"
                  />
                </label>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={enable2fa}
                    onChange={(event) => setEnable2fa(event.target.checked)}
                  />
                  <span>Enable 2-step verification (password)</span>
                </label>
                <label>
                  2FA password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="optional"
                  />
                </label>
                <div className="row">
                  <button className="secondary" onClick={() => setAuthStep("phone")}>
                    Back
                  </button>
                  <button
                    onClick={handleSignup}
                    disabled={
                      !phoneComplete ||
                      !firstName ||
                      !lastName ||
                      !username ||
                      (enable2fa && password.length < 6)
                    }
                  >
                    Sign up
                  </button>
                </div>
                <p className="note">
                  Your encryption keys stay in this browser (IndexedDB).
                </p>
              </>
            )}
          </section>
        </section>
      )}

      {!adminRoute && isLoggedIn && (
        <div className="layout layout-shell">
          <aside className="sidebar card shell-sidebar">
            <div className="sidebar-panel">
              <div className="sidebar-section-switch">
                <button
                  className={mainSection === "messages" ? "active" : ""}
                  onClick={() => setMainSection("messages")}
                >
                  Chats
                </button>
                <button
                  className={activeView === "chat-feed" ? "active" : ""}
                  onClick={() => {
                    setActiveView("chat-feed");
                    setMainSection("messages");
                    setSelectedConversationId(null);
                  }}
                >
                  Media
                </button>
                <button
                  className={activeView === "saved" ? "active" : ""}
                  onClick={() => {
                    setActiveView("saved");
                    setMainSection("messages");
                    setSelectedConversationId(null);
                  }}
                >
                  Saved
                </button>
                <button
                  className={showSettings ? "active" : ""}
                  onClick={() => setShowSettings((v) => !v)}
                >
                  Settings
                </button>
              </div>
              <div className="sidebar-top sidebar-hero">
              <div className="profile-card spotlight-card">
                <div className="avatar">
                  {profileState.avatar ? (
                    <img src={profileState.avatar} alt="avatar" />
                  ) : (
                    <span>{getInitials(sessionUsername)}</span>
                  )}
                </div>
                <div>
                  <div className="profile-name">{sessionUsername}</div>
                  <div className="muted">{profileState.bio || "No bio yet"}</div>
                </div>
              </div>
              <div className="sidebar-panel-actions">
                <button
                  className="ghost small"
                  onClick={() =>
                    setTheme((prev) => (prev === "dark" ? "light" : "dark"))
                  }
                >
                  {theme === "dark" ? "Light" : "Dark"}
                </button>
              </div>
            </div>

            {mainSection === "messages" && (
              <>
                <div className="sidebar-search-row">
                  <input
                    className="search"
                    value={conversationQuery}
                    onChange={(event) => setConversationQuery(event.target.value)}
                    placeholder="Search chats"
                  />
                  <button className="ghost small sidebar-filter-button">
                    Tune
                  </button>
                </div>
                <div className="tabs">
                  {tabs.map((item) => (
                    <button
                      key={item}
                      className={item === tab ? "active" : ""}
                      onClick={() => setTab(item)}
                    >
                      {item === "direct"
                        ? "Personal"
                        : item === "all"
                        ? "All"
                        : item}
                    </button>
                  ))}
                </div>

                <div className="conversation-list">
                  {sortedConversations.length === 0 && (
                    <p className="muted">No conversations yet.</p>
                  )}
                  {sortedConversations.map((conv) => {
                    const title = getConversationTitle(conv, sessionUsername);
                    const profile = publicProfiles[title];
                    const presence =
                      conv.type === "direct" ? statusByUser[title] : null;
                    return (
                      <button
                        key={conv.id}
                        className={
                          conv.id === selectedConversationId
                            ? "conversation active"
                            : "conversation"
                        }
                        onClick={() => {
                          setSelectedConversationId(conv.id);
                          setActiveView("chat");
                        }}
                      >
                        <div className="conversation-left">
                          <div className="avatar small avatar-wrap">
                            {profile?.avatar ? (
                              <img src={profile.avatar} alt={title} />
                            ) : (
                              <span>{getInitials(title)}</span>
                            )}
                            {presence && (
                              <span
                                className={
                                  presence.online
                                    ? "status-dot online"
                                    : "status-dot"
                                }
                              />
                            )}
                          </div>
                          <div>
                            <div className="title">{title}</div>
                            <div className="meta">
                              {lastMessageByConversation[conv.id]
                                ? `${lastMessageByConversation[conv.id].sender}: ${getPreview(
                                    lastMessageByConversation[conv.id].payload
                                  )}`
                                : conv.members.map((member) => member.username).join(", ")}
                            </div>
                          </div>
                        </div>
                        <div className="conversation-right">
                          <span className="time">
                            {lastMessageByConversation[conv.id]
                              ? formatTime(
                                  lastMessageByConversation[conv.id].createdAt,
                                  displayTimeZone
                                )
                              : ""}
                          </span>
                          {unreadByConversation[conv.id] ? (
                        <span className="badge">{unreadByConversation[conv.id]}</span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="divider" />

            <div className="create-block">
              {tab === "direct" ? (
                <>
                  <h3>New direct chat</h3>
                  <input
                    value={directUsername}
                    onChange={(event) => setDirectUsername(event.target.value)}
                    placeholder="username"
                  />
                </>
              ) : tab === "all" ? (
                <p className="muted">Choose a tab to create a chat.</p>
              ) : (
                <>
                  <h3>New {tab}</h3>
                  <label>
                    Template
                    <select
                      value={selectedTemplateId}
                      onChange={(event) => {
                        const value = event.target.value;
                        setSelectedTemplateId(value);
                        const template = chatTemplates.find(
                          (item) => item.id === value
                        );
                        if (template) {
                          setGroupName(template.name);
                          setGroupVisibility(template.visibility);
                        }
                      }}
                    >
                      <option value="">No template</option>
                      {chatTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name} ({template.visibility})
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="row">
                    <button
                      type="button"
                      className={groupVisibility === "public" ? "" : "secondary"}
                      onClick={() => setGroupVisibility("public")}
                    >
                      Public
                    </button>
                    <button
                      type="button"
                      className={groupVisibility === "private" ? "" : "secondary"}
                      onClick={() => setGroupVisibility("private")}
                    >
                      Private
                    </button>
                  </div>
                  <input
                    value={groupName}
                    onChange={(event) => setGroupName(event.target.value)}
                    placeholder="name"
                  />
                  {groupVisibility === "public" ? (
                    <textarea
                      value={groupMembers}
                      onChange={(event) => setGroupMembers(event.target.value)}
                      placeholder="members (comma separated)"
                    />
                  ) : (
                    <p className="note">
                      Private chats use invite links. Create the group first,
                      then generate a one-time link in the manage panel.
                    </p>
                  )}
                </>
              )}
              <button
                onClick={handleCreateConversation}
                disabled={
                  tab === "all"
                    ? true
                    : tab === "direct"
                    ? !directUsername
                    : !groupName || (groupVisibility === "public" && !groupMembers)
                }
              >
                Create
              </button>
            </div>

            <div className="divider" />

            <div className="create-block">
              <h3>Join with invite</h3>
              <input
                value={inviteToken}
                onChange={(event) => setInviteToken(event.target.value)}
                placeholder="invite token"
              />
              <button onClick={handleRedeemInvite} disabled={!inviteToken}>
                Join
              </button>
            </div>
            </>
          )}

            <button className="secondary" onClick={handleLogout}>
              Log out
            </button>
            </div>
          </aside>

          <main className="main card shell-main">
            {!(activeView === "chat" && mainSection === "messages" && selectedConversation && !showSettings) && (
            <section className="workspace-banner">
              <div className="workspace-copy">
                <span className="panel-kicker">{workspaceLabel}</span>
                <h2>{workspaceTitle}</h2>
                <p>{workspaceDescription}</p>
              </div>
              <div className="workspace-chips">
                <span className="workspace-chip">
                  {mainSection === "social" ? "Social mode" : "Messaging mode"}
                </span>
                <span className="workspace-chip">
                  {showSettings ? "Settings open" : activeView.replace("-", " ")}
                </span>
                <span className="workspace-chip">
                  {theme === "dark" ? "Night palette" : "Day palette"}
                </span>
              </div>
            </section>
            )}
            {showSettings && (
              <div className="settings-panel">
                <header className="settings-top">
                  {settingsPage !== "root" ? (
                    <button className="settings-nav" onClick={popSettingsPage}>
                      &lt;
                    </button>
                  ) : (
                    <span className="settings-nav-spacer" />
                  )}
                  <div className="settings-title">{settingsTitle}</div>
                  <span className="settings-nav-spacer" />
                </header>
                <div
                  key={settingsPage}
                  className={`settings-page${
                    settingsPrefs.appearance.animations ? " animate" : ""
                  }`}
                >
                  {renderSettingsPage()}
                </div>
              </div>
            )}

            {!showSettings && activeView === "explore" && mainSection === "social" && (
              <div className="explore-panel">
                <div className="explore-header">
                  <div>
                    <h2>Explore</h2>
                    <p className="muted">Stories, reels, and posts.</p>
                  </div>
                  <div className="explore-tabs">
                    <button
                      className={socialSort === "latest" ? "active" : ""}
                      onClick={() => setSocialSort("latest")}
                    >
                      Latest
                    </button>
                    <button
                      className={socialSort === "trending" ? "active" : ""}
                      onClick={() => setSocialSort("trending")}
                    >
                      Trending
                    </button>
                    <button
                      className={socialFeedKind === "post" ? "active" : ""}
                      onClick={() => setSocialFeedKind("post")}
                    >
                      Posts
                    </button>
                    <button
                      className={socialFeedKind === "reel" ? "active" : ""}
                      onClick={() => setSocialFeedKind("reel")}
                    >
                      Reels
                    </button>
                    <button
                      className={socialFilter === "saved" ? "active" : ""}
                      onClick={() =>
                        setSocialFilter((prev) => (prev === "saved" ? "all" : "saved"))
                      }
                    >
                      Saved
                    </button>
                  </div>
                </div>
                <div className="explore-search">
                  <input
                    className="search"
                    value={socialSearch}
                    onChange={(event) => setSocialSearch(event.target.value)}
                    placeholder="Search captions or usernames"
                  />
                </div>
                {socialTagCounts.length > 0 && (
                  <div className="tag-rail">
                    <button
                      className={!socialTagFilter ? "active" : ""}
                      onClick={() => setSocialTagFilter("")}
                    >
                      All tags
                    </button>
                    {socialTagCounts.map(([tag]) => (
                      <button
                        key={`tag-${tag}`}
                        className={socialTagFilter === tag ? "active" : ""}
                        onClick={() => setSocialTagFilter(tag)}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
                <div className="social-profile-card">
                  <div className="social-profile-header">
                    <div className="avatar">
                      {profileState.avatar ? (
                        <img src={profileState.avatar} alt={sessionUsername} />
                      ) : (
                        <span>{getInitials(sessionUsername)}</span>
                      )}
                    </div>
                    <div>
                      <div className="profile-name">{sessionUsername}</div>
                      <div className="muted">{profileState.bio || "No bio yet"}</div>
                    </div>
                  </div>
                  <div className="social-profile-stats">
                    <div>
                      <strong>{myPostCount}</strong>
                      <span>Posts</span>
                    </div>
                    <div>
                      <strong>{myReelCount}</strong>
                      <span>Reels</span>
                    </div>
                    <div>
                      <strong>{myStoryCount}</strong>
                      <span>Stories</span>
                    </div>
                    <div>
                      <strong>{socialFollowers.length}</strong>
                      <span>Followers</span>
                    </div>
                    <div>
                      <strong>{followingUsers.size}</strong>
                      <span>Following</span>
                    </div>
                  </div>
                  {socialInsights && (
                    <div className="social-insights">
                      <div>
                        <strong>{socialInsights.views}</strong>
                        <span>Views</span>
                      </div>
                      <div>
                        <strong>{socialInsights.likes}</strong>
                        <span>Likes</span>
                      </div>
                      <div>
                        <strong>{socialInsights.comments}</strong>
                        <span>Comments</span>
                      </div>
                      <div>
                        <strong>{socialInsights.saves}</strong>
                        <span>Saves</span>
                      </div>
                    </div>
                  )}
                  {extractFirstUrl(profileState.bio || "") && (
                    <a
                      className="profile-link"
                      href={extractFirstUrl(profileState.bio || "") || "#"}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {extractFirstUrl(profileState.bio || "")}
                    </a>
                  )}
                  <div className="social-collections">
                    <div className="row">
                      <input
                        value={socialNewCollection}
                        onChange={(event) => setSocialNewCollection(event.target.value)}
                        placeholder="New collection"
                      />
                      <button className="secondary" onClick={handleCreateCollection}>
                        Add
                      </button>
                    </div>
                    <div className="collection-list">
                      {Object.keys(socialCollections).length === 0 && (
                        <span className="muted">No collections yet.</span>
                      )}
                      {Object.entries(socialCollections).map(([name, ids]) => (
                        <button
                          key={`collection-${name}`}
                          className={socialActiveCollection === name ? "active" : ""}
                          onClick={() => setSocialActiveCollection(name)}
                        >
                          {name} ({ids.length})
                        </button>
                      ))}
                    </div>
                  </div>
                  {socialPinnedIds.size > 0 && (
                    <div className="social-pinned">
                      <h4>Pinned</h4>
                      <div className="pinned-grid">
                        {Array.from(socialPinnedIds)
                          .map((id) => socialFeed.find((item) => item.post.id === id))
                          .filter(Boolean)
                          .slice(0, 4)
                          .map((item) => (
                            <button
                              key={`pin-${item!.post.id}`}
                              onClick={() => {
                                if (item!.post.kind === "reel") {
                                  setActiveReel(item!);
                                }
                              }}
                              className="pinned-card"
                            >
                              {item!.post.media_type === "video" ? (
                                <video src={item!.post.media_url} muted />
                              ) : (
                                <img src={item!.post.media_url} alt="pinned" />
                              )}
                            </button>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="story-rail">
                  {socialStories.length === 0 && (
                    <p className="muted">No stories yet.</p>
                  )}
                  {socialStories.map((story) => (
                    <button
                      key={`story-${story.post.id}`}
                      className={story.viewerViewed ? "story viewed" : "story"}
                      onClick={() => {
                        setActiveStory(story);
                        handleSocialView(story.post.id);
                      }}
                    >
                      <div className="avatar small avatar-wrap">
                        {story.author.avatar ? (
                          <img src={story.author.avatar} alt={story.author.username} />
                        ) : (
                          <span>{getInitials(story.author.username)}</span>
                        )}
                      </div>
                      <span>{story.author.username}</span>
                    </button>
                  ))}
                </div>

                <div className="social-composer">
                  <div className="composer-header">
                    <h3>Create</h3>
                    <div className="composer-kind">
                      <button
                        className={socialComposeKind === "post" ? "active" : ""}
                        onClick={() => setSocialComposeKind("post")}
                      >
                        Post
                      </button>
                      <button
                        className={socialComposeKind === "reel" ? "active" : ""}
                        onClick={() => setSocialComposeKind("reel")}
                      >
                        Reel
                      </button>
                      <button
                        className={socialComposeKind === "story" ? "active" : ""}
                        onClick={() => setSocialComposeKind("story")}
                      >
                        Story
                      </button>
                    </div>
                  </div>
                  <div className="composer-body">
                    <div className="composer-row">
                      <label>
                        Visibility
                        <select
                          value={socialVisibility}
                          onChange={(event) =>
                            setSocialVisibility((prev) => {
                              const next =
                                event.target.value === "private"
                                  ? "private"
                                  : "public";
                              if (prev !== next && next === "public") {
                                setSocialAllowedUsers([]);
                              }
                              return next;
                            })
                          }
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                        </select>
                      </label>
                      <label>
                        Comments
                        <select
                          value={socialCommentVisibility}
                          onChange={(event) =>
                            setSocialCommentVisibility(
                              event.target.value === "friends"
                                ? "friends"
                                : "public"
                            )
                          }
                        >
                          <option value="public">Everyone</option>
                          <option value="friends">Friends only</option>
                        </select>
                      </label>
                    </div>
                    {socialVisibility === "private" && (
                      <div className="composer-audience">
                        <p className="muted">Select followers or following:</p>
                        <div className="audience-list">
                          {socialAudienceOptions.length === 0 && (
                            <span className="muted">No followers yet.</span>
                          )}
                          {socialAudienceOptions.map((name) => {
                            const selected = socialAllowedUsers.includes(name);
                            return (
                              <button
                                key={`aud-${name}`}
                                type="button"
                                className={selected ? "selected" : ""}
                                onClick={() =>
                                  setSocialAllowedUsers((prev) =>
                                    prev.includes(name)
                                      ? prev.filter((item) => item !== name)
                                      : [...prev, name]
                                  )
                                }
                              >
                                {name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    <label>
                      Schedule (optional)
                      <input
                        type="datetime-local"
                        value={socialScheduleAt}
                        onChange={(event) => setSocialScheduleAt(event.target.value)}
                      />
                    </label>
                    <label className="file-input">
                      Select media
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleSocialMediaChange}
                      />
                    </label>
                    {socialMediaPreview && (
                      <div className="composer-preview">
                        {socialMedia?.type.startsWith("video") ? (
                          <video src={socialMediaPreview} controls />
                        ) : (
                          <img src={socialMediaPreview} alt="preview" />
                        )}
                      </div>
                    )}
                    <textarea
                      value={socialCaption}
                      onChange={(event) => setSocialCaption(event.target.value)}
                      placeholder="Write a caption..."
                    />
                    <div className="composer-actions">
                      <button
                        onClick={handleSocialPublish}
                        disabled={socialPublishing}
                      >
                        {socialPublishing ? "Publishing..." : "Publish"}
                      </button>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={socialTimed}
                          onChange={(event) => setSocialTimed(event.target.checked)}
                        />
                        <span>Timed (1h)</span>
                      </label>
                      {socialComposeKind === "story" && (
                        <span className="muted">Stories expire in 24h.</span>
                      )}
                      {socialScheduleAt && (
                        <span className="muted">
                          Scheduled for {new Date(socialScheduleAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {socialError && <p className="status error">{socialError}</p>}
                  </div>
                </div>

                {socialLoading && <p className="muted">Loading feed...</p>}
                {!socialLoading && filteredSocialFeed.length === 0 && (
                  <p className="muted">
                    {socialSearch ? "No matches found." : "No posts yet."}
                  </p>
                )}
                <div className="social-feed">
                  {filteredSocialFeed.map((item) => {
                    const isFollowing = followingUsers.has(item.author.username);
                    const isSelf = item.author.username === sessionUsername;
                    const presence = statusByUser[item.author.username];
                    return (
                      <article key={`post-${item.post.id}`} className="social-card">
                        <header className="social-meta">
                          <div className="social-author">
                            <div className="avatar small avatar-wrap">
                              {item.author.avatar ? (
                                <img src={item.author.avatar} alt={item.author.username} />
                              ) : (
                                <span>{getInitials(item.author.username)}</span>
                              )}
                              {presence && (
                                <span
                                  className={
                                    presence.online ? "status-dot online" : "status-dot"
                                  }
                                />
                              )}
                            </div>
                            <div>
                              <div className="profile-name">{item.author.username}</div>
                              {item.author.bio && (
                                <div className="muted">{item.author.bio}</div>
                              )}
                            </div>
                          </div>
                          {!isSelf && (
                            <button
                              className={isFollowing ? "secondary" : ""}
                              onClick={() =>
                                handleSocialFollow(item.author.username, isFollowing)
                              }
                            >
                              {isFollowing ? "Following" : "Follow"}
                            </button>
                          )}
                        </header>
                        <div className="social-media">
                          {item.post.media_type === "video" ? (
                            item.post.kind === "reel" ? (
                              <video
                                src={item.post.media_url}
                                autoPlay
                                loop
                                muted={reelMuted}
                                playsInline
                              />
                            ) : (
                              <video src={item.post.media_url} controls />
                            )
                          ) : (
                            <img src={item.post.media_url} alt={item.post.caption || "post"} />
                          )}
                        </div>
                        <div className="social-actions">
                          <button
                            className={item.viewer.liked ? "active" : ""}
                            onClick={() => handleSocialLike(item.post.id)}
                          >
                            {item.viewer.liked ? "Liked" : "Like"} ({item.counts.likes})
                          </button>
                          <button onClick={() => handleSocialCommentsOpen(item.post.id)}>
                            Comment ({item.counts.comments})
                          </button>
                          <button onClick={() => handleSocialShare(item.post.media_url)}>
                            Share
                          </button>
                          <button
                            className={item.viewer.saved ? "active" : ""}
                            onClick={() => handleSocialSave(item.post.id)}
                          >
                            {item.viewer.saved ? "Saved" : "Save"}
                          </button>
                          {isSelf && (
                            <button
                              className={socialPinnedIds.has(item.post.id) ? "active" : ""}
                              onClick={() => togglePinnedPost(item.post.id)}
                            >
                              {socialPinnedIds.has(item.post.id) ? "Pinned" : "Pin"}
                            </button>
                          )}
                          {item.post.kind === "reel" && (
                            <button onClick={() => setReelMuted((prev) => !prev)}>
                              {reelMuted ? "Sound off" : "Sound on"}
                            </button>
                          )}
                          <button onClick={() => handleSocialView(item.post.id)}>
                            View ({item.counts.views})
                          </button>
                          {item.post.kind === "reel" && (
                            <button onClick={() => setActiveReel(item)}>
                              Open reel
                            </button>
                          )}
                        </div>
                        {item.post.caption && (
                          <p className="social-caption">{item.post.caption}</p>
                        )}
                        {getPostTags(item.post).length > 0 && (
                          <div className="tag-list">
                            {getPostTags(item.post).map((tag) => (
                              <button
                                key={`post-tag-${item.post.id}-${tag}`}
                                onClick={() => setSocialTagFilter(tag)}
                              >
                                #{tag}
                              </button>
                            ))}
                          </div>
                        )}
                        {item.post.comment_visibility === "friends" && (
                          <p className="muted">Comments: friends only</p>
                        )}
                        {activeCommentsPost === item.post.id && (
                          <div className="social-comments">
                            <div className="comment-list">
                              {(socialComments[item.post.id] || []).map((entry) => (
                                <div
                                  key={`comment-${entry.comment.id}`}
                                  className="comment"
                                >
                                  <strong>{entry.author.username}</strong>
                                  <span>{entry.comment.text}</span>
                                </div>
                              ))}
                            </div>
                            <div className="comment-input">
                              <input
                                value={commentDraft}
                                onChange={(event) => setCommentDraft(event.target.value)}
                                placeholder="Write a comment..."
                              />
                              <button
                                onClick={() => handleSocialCommentSend(item.post.id)}
                              >
                                Send
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
                <div className="notifications">
                  <h3>Activity</h3>
                  {socialNotifications.length === 0 && (
                    <p className="muted">No activity yet.</p>
                  )}
                  <div className="notification-list">
                    {socialNotifications.map((note) => (
                      <div key={`note-${note.id}`} className="notification-item">
                        <strong>{note.actor.username}</strong>
                        <span>
                          {note.type === "like"
                            ? " liked your post"
                            : note.type === "comment"
                            ? " commented on your post"
                            : " followed you"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {activeStory && (
                  <div className="story-modal" onClick={() => setActiveStory(null)}>
                    <div className="story-card" onClick={(event) => event.stopPropagation()}>
                      <button
                        className="ghost small"
                        onClick={() => setActiveStory(null)}
                      >
                        Close
                      </button>
                      <div className="story-media">
                        {activeStory.post.media_type === "video" ? (
                          <video src={activeStory.post.media_url} controls autoPlay />
                        ) : (
                          <img
                            src={activeStory.post.media_url}
                            alt={activeStory.author.username}
                          />
                        )}
                      </div>
                      <div className="story-reactions">
                        {["like", "fire", "wow"].map((reaction) => (
                          <button
                            key={`reaction-${reaction}`}
                            className="secondary"
                            onClick={async () => {
                              if (!activeStory) {
                                return;
                              }
                              try {
                                await createSocialComment(
                                  activeStory.post.id,
                                  reaction
                                );
                                setActiveStory(null);
                              } catch (error) {
                                setSocialError((error as Error).message);
                              }
                            }}
                          >
                            {reaction}
                          </button>
                        ))}
                      </div>
                      <div className="story-reply">
                        <input
                          value={storyReplyText}
                          onChange={(event) => setStoryReplyText(event.target.value)}
                          placeholder="Reply to story..."
                        />
                        <button onClick={handleStoryReply}>Send</button>
                      </div>
                    </div>
                  </div>
                )}
                {activeReel && (
                  <div className="reel-modal" onClick={() => setActiveReel(null)}>
                    <div className="reel-card" onClick={(event) => event.stopPropagation()}>
                      <button
                        className="ghost small"
                        onClick={() => setActiveReel(null)}
                      >
                        Close
                      </button>
                      <video
                        src={activeReel.post.media_url}
                        controls
                        autoPlay
                        muted={reelMuted}
                        playsInline
                      />
                      <button
                        className="secondary"
                        onClick={() => setReelMuted((prev) => !prev)}
                      >
                        {reelMuted ? "Sound off" : "Sound on"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!showSettings && activeView === "chat-feed" && mainSection === "messages" && (
              <div className="chat-feed-panel">
                <div className="thread-header">
                  <div>
                    <h2>Chat feed</h2>
                    <p className="muted">Media shared in your chats.</p>
                  </div>
                </div>
                {chatMediaFeed.length === 0 && (
                  <p className="muted">No media yet.</p>
                )}
                <div className="chat-media-grid">
                  {chatMediaFeed.map((item) => (
                    <div key={item.id} className="chat-media-card">
                      {(() => {
                        const mediaUrl = resolveChatMediaUrl(item);
                        if (!mediaUrl && item.storageKey) {
                          return (
                            <button
                              className="secondary"
                              onClick={() =>
                                ensureAttachmentUrl({
                                  kind: item.kind,
                                  name: item.id,
                                  data: item.url,
                                  storageKey: item.storageKey,
                                  contentType: item.contentType
                                })
                              }
                            >
                              Load media
                            </button>
                          );
                        }
                        if (!mediaUrl) {
                          return <div className="muted">Media unavailable</div>;
                        }
                        if (item.kind === "image") {
                          return <img src={mediaUrl} alt="chat media" />;
                        }
                        if (item.kind === "video") {
                          return <video src={mediaUrl} controls />;
                        }
                        if (item.kind === "audio") {
                          return <audio src={mediaUrl} controls />;
                        }
                        return (
                          <a href={mediaUrl} target="_blank" rel="noreferrer">
                            Download file
                          </a>
                        );
                      })()}
                      <div className="muted">
                        {item.sender} - {formatTime(item.createdAt, displayTimeZone)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!showSettings && activeView === "saved" && mainSection === "messages" && (
              <div className="saved-panel">
                <div className="thread-header">
                  <div>
                    <h2>Saved messages</h2>
                    <p className="muted">
                      Starred messages saved on this device.
                    </p>
                  </div>
                </div>
                <div className="search-panel">
                  <input
                    className="search"
                    value={messageQuery}
                    onChange={(event) => setMessageQuery(event.target.value)}
                    placeholder="Search saved messages"
                  />
                  <div className="filter-row">
                    <select
                      value={messageFilters.type}
                      onChange={(event) =>
                        setMessageFilters((prev) => ({
                          ...prev,
                          type: event.target.value as typeof prev.type
                        }))
                      }
                    >
                      <option value="all">All</option>
                      <option value="text">Text</option>
                      <option value="link">Links</option>
                      <option value="image">Images</option>
                      <option value="video">Videos</option>
                      <option value="audio">Audio</option>
                      <option value="file">Files</option>
                      <option value="location">Locations</option>
                    </select>
                    <input
                      value={messageFilters.sender}
                      onChange={(event) =>
                        setMessageFilters((prev) => ({
                          ...prev,
                          sender: event.target.value
                        }))
                      }
                      placeholder="Sender"
                    />
                    <input
                      type="date"
                      value={messageFilters.from}
                      onChange={(event) =>
                        setMessageFilters((prev) => ({
                          ...prev,
                          from: event.target.value
                        }))
                      }
                    />
                    <input
                      type="date"
                      value={messageFilters.to}
                      onChange={(event) =>
                        setMessageFilters((prev) => ({
                          ...prev,
                          to: event.target.value
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="messages">
                  {savedFilteredMessages.length === 0 && (
                    <p className="muted">No saved messages yet.</p>
                  )}
                  {savedFilteredMessages.map((item) => (
                    <div key={`saved-${item.id}`} className="message">
                      <div className="meta">
                        <span className="sender">{item.sender}</span>
                        <span className="meta-right">
                          <span>
                            {formatTime(item.createdAt, displayTimeZone)} -{" "}
                            {formatDateLabel(item.createdAt, displayTimeZone)}
                          </span>
                        </span>
                      </div>
                      {item.payload.text && (
                        <div className="text">
                          {renderMessageText(item.payload.text, messageQuery)}
                        </div>
                      )}
                      {item.payload.linkPreview && (
                        <div className="link-preview">
                          {item.payload.linkPreview.image && (
                            <img
                              src={item.payload.linkPreview.image}
                              alt={item.payload.linkPreview.title || "preview"}
                            />
                          )}
                          <div>
                            <strong>
                              {item.payload.linkPreview.title ||
                                item.payload.linkPreview.siteName ||
                                "Link preview"}
                            </strong>
                            {item.payload.linkPreview.description && (
                              <div className="muted">
                                {item.payload.linkPreview.description}
                              </div>
                            )}
                            <a
                              href={item.payload.linkPreview.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {item.payload.linkPreview.url}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!showSettings &&
              activeView === "chat" &&
              mainSection === "messages" &&
              !selectedConversation && (
                <div className="empty">Select a conversation to start.</div>
              )}
            {!showSettings &&
              activeView === "chat" &&
              mainSection === "messages" &&
              selectedConversation && (
              <>
                <div className="chat-stage">
                <section className="chat-center-column">
                <div className="thread-header thread-header-chat">
                  <div>
                    <h2>
                      {getConversationTitle(selectedConversation, sessionUsername)}
                    </h2>
                    {!encryptionReady && (
                      <p className="note">
                        Encryption keys missing on this device. Import backup or
                        reset encryption to read old messages.
                      </p>
                    )}
                    {directStatus && (
                      <p className="presence">
                        <span
                          className={
                            directStatus.online ? "dot online" : "dot offline"
                          }
                        />
                        {directStatus.online
                          ? "Online"
                          : formatLastSeen(directStatus.lastSeen)}
                      </p>
                    )}
                    {quietHoursActive && (
                      <p className="presence quiet-hours">
                        Quiet hours active — notifications are muted.
                      </p>
                    )}
    {!focusActive && typingUsers.length > 0 && (
      <p className="typing">
        {typingUsers.join(", ")} typing...
      </p>
    )}
    {focusActive && (
      <p className="presence">
        Focus mode on - muted until {focusUntilLabel}
      </p>
                    )}
                  </div>
                  <div className="thread-actions">
                    {selectedConversation.type === "direct" && (
                      <button
                        className="secondary"
                        onClick={() =>
                          setShowContactPrivacy((prev) => !prev)
                        }
                      >
                        <span className="icon-label"><UiIcon name="privacy" /></span>
                        <span>Privacy</span>
                      </button>
                    )}
                    {selectedConversation.type !== "direct" && (
                      <button
                        className="secondary"
                        onClick={() => setShowManagePanel((prev) => !prev)}
                      >
                        <span className="icon-label"><UiIcon name="manage" /></span>
                        {showManagePanel ? "Close" : "Manage"}
                      </button>
                    )}
                    <select
                      value={focusMinutes}
                      onChange={(event) => setFocusMinutes(Number(event.target.value))}
                    >
                      <option value={15}>15m</option>
                      <option value={30}>30m</option>
                      <option value={60}>1h</option>
                      <option value={180}>3h</option>
                    </select>
                    <button className="secondary" onClick={handleToggleFocus}>
                      <span className="icon-label"><UiIcon name="focus" /></span>
                      {focusActive ? "Disable focus" : "Enable focus"}
                    </button>
                    {selectedConversation.type === "direct" && (
                      <>
                        <button
                          className="secondary"
                          onClick={() => handleStartCall("audio")}
                          disabled={callState.status !== "idle"}
                        >
                          <span className="icon-label"><UiIcon name="call" /></span>
                          Call
                        </button>
                        <button
                          className="secondary"
                          onClick={() => handleStartCall("video")}
                          disabled={callState.status !== "idle"}
                        >
                          <span className="icon-label"><UiIcon name="video" /></span>
                          Video
                        </button>
                      </>
                    )}
                    <button
                      className="secondary"
                      onClick={() => setShowConversationInfo((prev) => !prev)}
                    >
                      <span className="icon-label"><UiIcon name="info" /></span>
                      {showConversationInfo ? "Hide info" : "Info"}
                    </button>
                    <span className="thread-type">
                      {selectedConversation.type}
                    </span>
                  </div>
                </div>

                {callState.status !== "idle" && (
                  <div className="call-panel card">
                    <div className="call-header">
                      <div>
                        <strong>
                          {callState.peerUsername
                            ? `Call with ${callState.peerUsername}`
                            : "Call"}
                        </strong>
                        <p className="muted">
                          {callState.media} - {callState.status}
                        </p>
                      </div>
                      <div className="row">
                        {callState.status === "incoming" && (
                          <>
                            <button onClick={handleAcceptCall}>Accept</button>
                            <button
                              className="secondary"
                              onClick={handleDeclineCall}
                            >
                              Decline
                            </button>
                          </>
                        )}
                        <button
                          className="secondary"
                          onClick={handleToggleMic}
                        >
                          {micMuted ? "Mic off" : "Mic on"}
                        </button>
                        <button className="danger" onClick={handleEndCall}>
                          End call
                        </button>
                      </div>
                    </div>
                    {callError && <p className="note">{callError}</p>}
                    <div
                      className={
                        callState.media === "video"
                          ? "call-videos"
                          : "call-audio"
                      }
                    >
                      <video ref={remoteVideoRef} autoPlay playsInline />
                      <video ref={localVideoRef} autoPlay playsInline muted />
                    </div>
                  </div>
                )}

                {showContactPrivacy && selectedConversation.type === "direct" && (
                  <div className="contact-privacy card">
                    <h4>Per-contact privacy</h4>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={contactPrivacy.hide_online}
                        onChange={(event) =>
                          setContactPrivacy((prev) => ({
                            ...prev,
                            hide_online: event.target.checked
                          }))
                        }
                      />
                      <span>Hide online status</span>
                    </label>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={contactPrivacy.hide_last_seen}
                        onChange={(event) =>
                          setContactPrivacy((prev) => ({
                            ...prev,
                            hide_last_seen: event.target.checked
                          }))
                        }
                      />
                      <span>Hide last seen</span>
                    </label>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={contactPrivacy.hide_profile_photo}
                        onChange={(event) =>
                          setContactPrivacy((prev) => ({
                            ...prev,
                            hide_profile_photo: event.target.checked
                          }))
                        }
                      />
                      <span>Hide profile photo</span>
                    </label>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={contactPrivacy.disable_read_receipts}
                        onChange={(event) =>
                          setContactPrivacy((prev) => ({
                            ...prev,
                            disable_read_receipts: event.target.checked
                          }))
                        }
                      />
                      <span>Disable read receipts</span>
                    </label>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={contactPrivacy.disable_typing_indicator}
                        onChange={(event) =>
                          setContactPrivacy((prev) => ({
                            ...prev,
                            disable_typing_indicator: event.target.checked
                          }))
                        }
                      />
                      <span>Disable typing indicator</span>
                    </label>
                    {directPartner && fingerprintsByUser[directPartner] && (
                      <div className="security-section">
                        <h5>Security</h5>
                        <div className="muted">
                          Key fingerprint: {fingerprintsByUser[directPartner]}
                        </div>
                        {verifiedKeysByUser[directPartner] ? (
                          <div className="note">
                            Verified{" "}
                            {new Date(
                              verifiedKeysByUser[directPartner].verifiedAt
                            ).toLocaleDateString()}
                            <button
                              className="ghost small"
                              onClick={() => handleClearVerifiedKey(directPartner, 1)}
                            >
                              Clear verification
                            </button>
                          </div>
                        ) : (
                          <button
                            className="secondary"
                            onClick={() => handleVerifyKey(directPartner, 1)}
                          >
                            Mark key verified
                          </button>
                        )}
                      </div>
                    )}
                    <div className="row">
                      <button onClick={handleContactPrivacySave}>Save</button>
                      <button
                        className="secondary"
                        onClick={() => setShowContactPrivacy(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {showManagePanel && selectedConversation.type !== "direct" && (
                  <div className="manage-panel card">
                    <div className="manage-header">
                      <div>
                        <h4>Manage {selectedConversation.type}</h4>
                        <p className="muted">
                          Visibility: {selectedConversation.visibility}
                        </p>
                      </div>
                      <button
                        className="secondary"
                        onClick={() =>
                          refreshRoster(selectedConversation.id).catch(() => undefined)
                        }
                      >
                        Refresh
                      </button>
                    </div>

                    <div className="manage-grid">
                      <div>
                        <h5>Local controls</h5>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={
                              forwardRulesByConversation[selectedConversation.id] ??
                              true
                            }
                            onChange={(event) =>
                              setForwardRulesByConversation((prev) => ({
                                ...prev,
                                [selectedConversation.id]: event.target.checked
                              }))
                            }
                          />
                          <span>Allow forwarding</span>
                        </label>
                        <label className="toggle">
                          <input
                            type="checkbox"
                            checked={
                              quietHoursByConversation[selectedConversation.id]
                                ?.enabled || false
                            }
                            onChange={(event) =>
                              setQuietHoursByConversation((prev) => ({
                                ...prev,
                                [selectedConversation.id]: {
                                  enabled: event.target.checked,
                                  start:
                                    prev[selectedConversation.id]?.start || "22:00",
                                  end:
                                    prev[selectedConversation.id]?.end || "08:00"
                                }
                              }))
                            }
                          />
                          <span>Quiet hours</span>
                        </label>
                        <div className="row">
                          <input
                            type="time"
                            value={
                              quietHoursByConversation[selectedConversation.id]
                                ?.start || "22:00"
                            }
                            onChange={(event) =>
                              setQuietHoursByConversation((prev) => ({
                                ...prev,
                                [selectedConversation.id]: {
                                  enabled:
                                    prev[selectedConversation.id]?.enabled || false,
                                  start: event.target.value,
                                  end:
                                    prev[selectedConversation.id]?.end || "08:00"
                                }
                              }))
                            }
                          />
                          <input
                            type="time"
                            value={
                              quietHoursByConversation[selectedConversation.id]
                                ?.end || "08:00"
                            }
                            onChange={(event) =>
                              setQuietHoursByConversation((prev) => ({
                                ...prev,
                                [selectedConversation.id]: {
                                  enabled:
                                    prev[selectedConversation.id]?.enabled || false,
                                  start:
                                    prev[selectedConversation.id]?.start || "22:00",
                                  end: event.target.value
                                }
                              }))
                            }
                          />
                        </div>
                        <div className="muted">
                          Server rules apply when you save settings.
                        </div>
                        <button
                          className="secondary"
                          onClick={handleSaveConversationSettings}
                          disabled={!canManageConversation}
                        >
                          Save settings
                        </button>
                      </div>

                      <div>
                        <h5>Members</h5>
                        {selectedConversation.visibility === "public" ? (
                          <div className="row">
                            <input
                              value={manageUsername}
                              onChange={(event) =>
                                setManageUsername(event.target.value)
                              }
                              placeholder="username"
                            />
                            <button onClick={handleAddMember}>Add</button>
                          </div>
                        ) : (
                          <p className="note">
                            Private chats accept members via invite links.
                          </p>
                        )}
                        <div className="manage-list">
                          {roster.map((member) => (
                            <div key={member.id} className="manage-item">
                              <div>
                                <strong>{member.username}</strong>
                                <span className="muted">
                                  {member.role}
                                </span>
                              </div>
                              <div className="manage-actions">
                                {member.role === "member" && (
                                  <button
                                    className="secondary"
                                    onClick={() =>
                                      handlePromoteMember(member.username)
                                    }
                                  >
                                    Make admin
                                  </button>
                                )}
                                {member.role === "admin" && (
                                  <>
                                    <button
                                      className="secondary"
                                      onClick={() =>
                                        handleDemoteMember(member.username)
                                      }
                                    >
                                      Remove admin
                                    </button>
                                    <label className="toggle inline">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(
                                          member.permissions?.manage_members
                                        )}
                                        onChange={(event) =>
                                          handleUpdateAdminPerms(
                                            member.username,
                                            {
                                              manage_members: event.target.checked,
                                              manage_invites:
                                                member.permissions?.manage_invites
                                            }
                                          )
                                        }
                                      />
                                      <span>Manage members</span>
                                    </label>
                                    <label className="toggle inline">
                                      <input
                                        type="checkbox"
                                        checked={Boolean(
                                          member.permissions?.manage_invites
                                        )}
                                        onChange={(event) =>
                                          handleUpdateAdminPerms(
                                            member.username,
                                            {
                                              manage_members:
                                                member.permissions?.manage_members,
                                              manage_invites: event.target.checked
                                            }
                                          )
                                        }
                                      />
                                      <span>Manage invites</span>
                                    </label>
                                  </>
                                )}
                                {member.role !== "owner" && (
                                  <button
                                    className="danger"
                                    onClick={() =>
                                      handleRemoveMember(member.username)
                                    }
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {selectedConversation.visibility === "private" && (
                        <div>
                          <h5>Invite links</h5>
                          <div className="row">
                            <input
                              type="number"
                              value={inviteMaxUses}
                              min={1}
                              onChange={(event) =>
                                setInviteMaxUses(Number(event.target.value))
                              }
                              placeholder="max uses"
                            />
                            <input
                              type="number"
                              value={inviteExpiresMinutes}
                              min={1}
                              onChange={(event) =>
                                setInviteExpiresMinutes(
                                  Number(event.target.value)
                                )
                              }
                              placeholder="expires (minutes)"
                            />
                            <button onClick={handleCreateInvite}>
                              Create link
                            </button>
                          </div>
                          <div className="manage-list">
                            {inviteLinks.map((invite) => (
                              <div key={invite.token} className="manage-item">
                                <div>
                                  <strong>
                                    {`${window.location.origin}/#invite=${invite.token}`}
                                  </strong>
                                  <span className="muted">
                                    Uses {invite.uses}/{invite.maxUses}
                                  </span>
                                  <span className="muted">
                                    Expires{" "}
                                    {invite.expiresAt
                                      ? new Date(invite.expiresAt).toLocaleString()
                                      : "never"}
                                  </span>
                                </div>
                                <div className="manage-actions">
                                  <button
                                    className="secondary"
                                    onClick={() =>
                                      navigator.clipboard
                                        .writeText(
                                          `${window.location.origin}/#invite=${invite.token}`
                                        )
                                        .catch(() => undefined)
                                    }
                                  >
                                    Copy
                                  </button>
                                  <button
                                    className="danger"
                                    onClick={() => handleRevokeInvite(invite.token)}
                                  >
                                    Revoke
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="search-panel">
                  <input
                    className="search"
                    value={messageQuery}
                    onChange={(event) => setMessageQuery(event.target.value)}
                    placeholder="Search in messages"
                  />
                  <div className="filter-row">
                    <select
                      value={messageFilters.type}
                      onChange={(event) =>
                        setMessageFilters((prev) => ({
                          ...prev,
                          type: event.target.value as typeof prev.type
                        }))
                      }
                    >
                      <option value="all">All</option>
                      <option value="text">Text</option>
                      <option value="link">Links</option>
                      <option value="image">Images</option>
                      <option value="video">Videos</option>
                      <option value="audio">Audio</option>
                      <option value="file">Files</option>
                      <option value="location">Locations</option>
                    </select>
                    <input
                      value={messageFilters.sender}
                      onChange={(event) =>
                        setMessageFilters((prev) => ({
                          ...prev,
                          sender: event.target.value
                        }))
                      }
                      placeholder="Sender"
                    />
                    <input
                      type="date"
                      value={messageFilters.from}
                      onChange={(event) =>
                        setMessageFilters((prev) => ({
                          ...prev,
                          from: event.target.value
                        }))
                      }
                    />
                    <input
                      type="date"
                      value={messageFilters.to}
                      onChange={(event) =>
                        setMessageFilters((prev) => ({
                          ...prev,
                          to: event.target.value
                        }))
                      }
                    />
                  </div>
                </div>

                {pinnedMessages.length > 0 && (
                  <div className="pinned">
                    <h4>Pinned</h4>
                    {pinnedMessages.map((msg) => (
                      <div key={`pin-${msg.id}`} className="pinned-item">
                        <span>{msg.sender}:</span>
                        <span>{getPreview(msg.payload)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {quietHoursActive && (
                  <div className="quiet-hours-banner">
                    Quiet hours are active for this chat. Messages will be muted.
                  </div>
                )}

                {pinnedMediaItems.length > 0 && (
                  <div className="pinned-media">
                    <h4>Pinned media</h4>
                    <div className="pinned-media-list">
                      {pinnedMediaItems.map((item) => {
                        const url = resolveAttachmentUrl(item.attachment);
                        return (
                          <div key={item.key} className="pinned-media-item">
                            {item.attachment.kind === "image" && url && (
                              <img
                                src={url}
                                alt={item.attachment.name}
                                onClick={() => setLightboxSrc(url)}
                              />
                            )}
                            {item.attachment.kind === "video" && url && (
                              <video src={url} controls />
                            )}
                            {item.attachment.kind === "audio" && url && (
                              <audio src={url} controls />
                            )}
                            {item.attachment.kind === "file" && url && (
                              <a href={url} target="_blank" rel="noreferrer">
                                {item.attachment.name}
                              </a>
                            )}
                            {!url && item.attachment.storageKey && (
                              <button
                                className="secondary"
                                onClick={() => ensureAttachmentUrl(item.attachment)}
                              >
                                Load
                              </button>
                            )}
                            <button
                              className="secondary"
                              onClick={() =>
                                handleTogglePinnedMedia(item.message, item.index)
                              }
                            >
                              Unpin
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="messages" ref={messageListRef}>
                  {selectedConversationId &&
                    !historyExhausted[selectedConversationId] && (
                      <button
                        className="load-older"
                        onClick={loadOlderMessages}
                        disabled={historyLoading}
                      >
                        {historyLoading ? "Loading..." : "Load older messages"}
                      </button>
                    )}
                  {messageItems.length === 0 && (
                    <p className="muted">No messages yet.</p>
                  )}
                  {messageItems.map((item) =>
                    item.kind === "date" ? (
                      <div key={item.id} className="date-separator">
                        <span>{item.label}</span>
                      </div>
                    ) : (
                      <div
                        key={item.message.id}
                        className={
                          item.message.sender === sessionUsername
                            ? "message own"
                            : "message"
                        }
                      >
                        <div className="meta">
                          <span className="sender">
                            {item.message.sender}
                            {item.message.sender === "system" && (
                              <span className="verified-badge" title="Verified system">
                                ok
                              </span>
                            )}
                          </span>
                        <span className="meta-right">
                          <span title={new Date(item.message.createdAt).toLocaleString()}>
                              {formatTime(item.message.createdAt, displayTimeZone)} - {formatDateLabel(item.message.createdAt, displayTimeZone)}
                            </span>
                            {item.message.sender === sessionUsername && (
                              <span className="tick">
                                {getStatusMark(item.message.groupId)}
                              </span>
                            )}
                          </span>
                        </div>
                        {item.message.payload.oneTime && (
                          <div className="one-time-badge">One-time message</div>
                        )}
                        {item.message.payload.forwardedFrom && (
                          <div className="one-time-badge">
                            Forwarded from {item.message.payload.forwardedFrom}
                          </div>
                        )}
                        {item.message.payload.text && (
                          <div className="text">
                            {renderMessageText(item.message.payload.text, messageQuery)}
                          </div>
                        )}
                        {settingsPrefs.advanced.autoTranslate &&
                          item.message.payload.text &&
                          translationCache[
                            `${item.message.id}:${item.message.payload.text}`
                          ] && (
                            <div className="translation">
                              {
                                translationCache[
                                  `${item.message.id}:${item.message.payload.text}`
                                ]
                              }
                            </div>
                          )}
                        {item.message.payload.linkPreview && (
                          <div className="link-preview">
                            {item.message.payload.linkPreview.image && (
                              <img
                                src={item.message.payload.linkPreview.image}
                                alt={
                                  item.message.payload.linkPreview.title || "preview"
                                }
                              />
                            )}
                            <div>
                              <strong>
                                {item.message.payload.linkPreview.title ||
                                  item.message.payload.linkPreview.siteName ||
                                  "Link preview"}
                              </strong>
                              {item.message.payload.linkPreview.description && (
                                <div className="muted">
                                  {item.message.payload.linkPreview.description}
                                </div>
                              )}
                              <a
                                href={item.message.payload.linkPreview.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {item.message.payload.linkPreview.url}
                              </a>
                            </div>
                          </div>
                        )}
                        {item.message.payload.attachments.map((attachment, index) => {
                          const attachmentUrl = resolveAttachmentUrl(attachment);
                          const needsLoad = !attachmentUrl && attachment.storageKey;
                          const isPinnedMedia =
                            selectedConversationId &&
                            (pinnedMediaByConversation[selectedConversationId] || []).includes(
                              attachmentKey(item.message.id, index)
                            );
                          const location =
                            attachment.kind === "location"
                              ? parseLocationData(attachment.data)
                              : null;
                          const mapUrl =
                            location
                              ? `https://www.openstreetmap.org/?mlat=${encodeURIComponent(
                                  String(location.lat)
                                )}&mlon=${encodeURIComponent(
                                  String(location.lng)
                                )}#map=16/${encodeURIComponent(
                                  String(location.lat)
                                )}/${encodeURIComponent(String(location.lng))}`
                              : null;
                          return (
                            <div
                              key={`${item.message.id}-${index}`}
                              className="attachment"
                            >
                              {needsLoad && (
                                <button
                                  className="secondary"
                                  onClick={() => ensureAttachmentUrl(attachment)}
                                >
                                  Load attachment
                                </button>
                              )}
                              {attachment.kind === "image" && attachmentUrl && (
                                <img
                                  src={attachmentUrl}
                                  alt={attachment.name}
                                  onClick={() => setLightboxSrc(attachmentUrl)}
                                />
                              )}
                              {attachment.kind === "audio" && attachmentUrl && (
                                <audio
                                  controls
                                  src={attachmentUrl}
                                  onLoadedMetadata={(event) => {
                                    const key = `${item.message.id}-${index}`;
                                    setAudioDurations((prev) => ({
                                      ...prev,
                                      [key]: event.currentTarget.duration
                                    }));
                                  }}
                                />
                              )}
                              {attachment.kind === "video" && attachmentUrl && (
                                <video controls src={attachmentUrl} />
                              )}
                              {attachment.kind === "file" && attachmentUrl && (
                                <a
                                  className="file-link"
                                  href={attachmentUrl}
                                  download={attachment.name}
                                >
                                  {attachment.name}
                                </a>
                              )}
                              {attachment.kind === "location" && (
                                <div className="location-card">
                                  <div className="location-title">
                                    {location?.live ? "Live location" : "Location"}
                                    {location?.live && (
                                      <span className="live-pill">LIVE</span>
                                    )}
                                  </div>
                                  <div className="location-meta">
                                    {location
                                      ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                                      : "Location data unavailable"}
                                    {location?.accuracy &&
                                      ` · ±${Math.round(location.accuracy)}m`}
                                  </div>
                                  {location?.expiresAt && (
                                    <div className="location-meta">
                                      Updates until{" "}
                                      {new Date(location.expiresAt).toLocaleTimeString()}
                                    </div>
                                  )}
                                  {mapUrl && (
                                    <div className="location-actions">
                                      <a href={mapUrl} target="_blank" rel="noreferrer">
                                        Open map
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )}
                              {attachment.kind === "audio" &&
                                audioDurations[`${item.message.id}-${index}`] && (
                                  <div className="file-name">
                                    {attachment.name} - {audioDurations[
                                      `${item.message.id}-${index}`
                                    ].toFixed(1)}s
                                  </div>
                                )}
                              {attachment.kind === "video" && (
                                <div className="file-name">{attachment.name}</div>
                              )}
                              {attachment.kind === "file" && (
                                <div className="file-name">{attachment.name}</div>
                              )}
                              {attachment.kind === "image" && (
                                <div className="file-name">{attachment.name}</div>
                              )}
                              {attachment.kind !== "location" && (
                                <button
                                  className="secondary"
                                  onClick={() =>
                                    handleTogglePinnedMedia(item.message, index)
                                  }
                                >
                                  {isPinnedMedia ? "Unpin media" : "Pin media"}
                                </button>
                              )}
                            </div>
                          );
                        })}
                        <div className="message-actions">
                          <button
                            className={
                              pinnedIds.has(String(item.message.id))
                                ? "action active"
                                : "action"
                            }
                            onClick={() => handleTogglePinned(String(item.message.id))}
                          >
                            Pin
                          </button>
                          <button
                            className={
                              starredIds.has(String(item.message.id))
                                ? "action active"
                                : "action"
                            }
                            onClick={() => handleToggleStarred(item.message)}
                          >
                            Star
                          </button>
                          <button
                            className="action"
                            onClick={() => handleForwardSelect(item.message)}
                          >
                            Forward
                          </button>
                          <button
                            className="action danger"
                            onClick={() => handleDelete(item.message)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  )}
                  <div ref={messageEndRef} />
                </div>
                {showJumpToBottom && (
                  <button
                    className="jump-bottom"
                    onClick={() =>
                      messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Jump to latest
                  </button>
                )}

                {selectedConversation?.type === "channel" &&
                selectedConversation.name === "System" ? (
                  <div className="note">
                    System channel is read-only. You can view announcements here.
                  </div>
                ) : (
                  <div className="composer">
                    <div className="composer-bar">
                      <label className="file-input">
                        Add files
                        <input
                          type="file"
                          multiple
                          accept="*/*"
                          onChange={handleAttachmentChange}
                        />
                      </label>
                      <label className="schedule-input">
                        Schedule
                        <input
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(event) => setScheduledAt(event.target.value)}
                        />
                      </label>
                      {scheduledAt && (
                        <button
                          className="secondary"
                          onClick={() => setScheduledAt("")}
                        >
                          Clear schedule
                        </button>
                      )}
                      <button
                        className="secondary location-button"
                        onClick={handleSendLocation}
                        disabled={!selectedConversationId || !locationSupported}
                      >
                        Send location
                      </button>
                      <button
                        className={
                          liveLocationActive
                            ? "secondary location-button live"
                            : "secondary location-button"
                        }
                        onClick={() =>
                          liveLocationActive
                            ? stopLiveLocationShare(true)
                            : startLiveLocationShare()
                        }
                        disabled={!selectedConversationId || !locationSupported}
                      >
                        {liveLocationActive ? "Stop live" : "Live location"}
                      </button>
                    </div>
                    {quickReplies.length > 0 && (
                      <div className="quick-replies">
                        {quickReplies.map((reply, index) => (
                          <button
                            key={`quick-${index}`}
                            className="secondary"
                            onClick={() =>
                              setMessageText((prev) =>
                                prev ? `${prev} ${reply}` : reply
                              )
                            }
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    )}
                    {liveLocationActive && liveLocationExpiresAt && (
                      <div className="live-location-banner">
                        <span>
                          Live location active until{" "}
                          {new Date(liveLocationExpiresAt).toLocaleTimeString()}
                        </span>
                        <button
                          className="secondary"
                          onClick={() => stopLiveLocationShare(true)}
                        >
                          Stop
                        </button>
                      </div>
                    )}
                    <div className="composer-main">
                      <textarea
                        value={messageText}
                        onChange={(event) => {
                          setMessageText(event.target.value);
                          handleTyping();
                        }}
                        onKeyDown={(event) => {
                          const enterToSend = settingsPrefs.chat.enterToSend;
                          const shouldSend = enterToSend
                            ? event.key === "Enter" && !event.shiftKey
                            : event.key === "Enter" && event.ctrlKey;
                          if (shouldSend) {
                            event.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder="Type a message (emoji supported)"
                      />
                      <button
                        className="send"
                        onClick={handleSend}
                        disabled={
                          (!messageText && attachments.length === 0) ||
                          uploadQueue.some((item) => item.status === "uploading") ||
                          !selectedConversationId
                        }
                      >
                        <UiIcon name="send" />
                      </button>
                    </div>
                    {selectedConversation &&
                      selectedConversation.type !== "direct" &&
                      composerSpamScore >= 6 && (
                        <div className="spam-warning">
                          High spam score detected. Review before sending.
                        </div>
                      )}
                  {showKeyBackupWarning && (
                    <div className="note warning">
                      Export your encryption keys in Settings to keep access to
                      past messages after reinstall or browser reset.
                    </div>
                  )}
                  {attachments.length > 0 && (
                    <div className="attachments-preview">
                      {attachments.map((file, index) => (
                        <span key={`${file.name}-${index}`}>{file.name}</span>
                      ))}
                    </div>
                  )}
                  {uploadQueue.length > 0 && (
                    <div className="attachments-preview uploads">
                      {uploadQueue.map((item) => (
                        <div key={item.id} className="upload-item">
                          <span>{item.name}</span>
                          <span>
                            {item.status === "uploading" && `${item.progress}%`}
                            {item.status === "done" && "Done"}
                            {item.status === "failed" && "Failed"}
                          </span>
                          {item.status === "failed" && (
                            <button
                              className="link"
                              onClick={() => retryUpload(item.id)}
                            >
                              Retry
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {scheduledAt && (
                    <div className="note">
                      Scheduled for {new Date(scheduledAt).toLocaleString()}
                    </div>
                  )}
                  </div>
                )}
                </section>

                <aside className="chat-side-column">
                  <div className="chat-profile-card card">
                    <div className="chat-profile-art">
                      <div className="chat-profile-backdrop" />
                      <div className="avatar large chat-profile-avatar">
                        {activeProfileAvatar ? (
                          <img src={activeProfileAvatar} alt={activeProfileName} />
                        ) : (
                          <span>{getInitials(activeProfileName)}</span>
                        )}
                      </div>
                    </div>
                    <div className="chat-profile-copy">
                      <h3>{activeProfileName}</h3>
                      <span className="chat-profile-handle">{activeProfileHandle}</span>
                      <p>{activeProfileBio}</p>
                      <div className="chat-profile-presence">
                        <span className={directStatus?.online ? "dot online" : "dot"} />
                        {activeProfileStatus}
                      </div>
                    </div>
                    <div className="chat-profile-actions">
                      <button
                        className="secondary"
                        onClick={() => setShowConversationInfo((prev) => !prev)}
                      >
                        <span className="icon-label"><UiIcon name="message" /></span>
                        Message
                      </button>
                      {selectedConversation.type === "direct" && (
                        <>
                          <button
                            className="secondary"
                            onClick={() => handleStartCall("audio")}
                            disabled={callState.status !== "idle"}
                          >
                            <span className="icon-label"><UiIcon name="call" /></span>
                            Call
                          </button>
                          <button
                            className="secondary"
                            onClick={() => handleStartCall("video")}
                            disabled={callState.status !== "idle"}
                          >
                            <span className="icon-label"><UiIcon name="video" /></span>
                            Video
                          </button>
                        </>
                      )}
                      {selectedConversation.type !== "direct" && (
                        <button
                          className="secondary"
                          onClick={() => setShowManagePanel((prev) => !prev)}
                        >
                          <span className="icon-label"><UiIcon name="manage" /></span>
                          Manage
                        </button>
                      )}
                    </div>
                  </div>

                  {showConversationInfo && (
                    <div className="conversation-info card conversation-info-side">
                      {selectedConversation.type === "direct" && directPartner ? (
                        <>
                          <div className="conversation-info-profile">
                            <div className="avatar large">
                              {publicProfiles[directPartner]?.avatar ? (
                                <img
                                  src={publicProfiles[directPartner].avatar || ""}
                                  alt={directPartner}
                                />
                              ) : (
                                <span>{getInitials(directPartner)}</span>
                              )}
                            </div>
                            <div>
                              <h3>@{directPartner}</h3>
                              <p className="muted">
                                {directStatus?.online
                                  ? "Online"
                                  : directStatus
                                    ? formatLastSeen(directStatus.lastSeen)
                                    : "Status unavailable"}
                              </p>
                            </div>
                          </div>
                          <p>{publicProfiles[directPartner]?.bio || "No bio yet"}</p>
                        </>
                      ) : (
                        <>
                          <h3>
                            {getConversationTitle(
                              selectedConversation,
                              sessionUsername
                            )}
                          </h3>
                          <p className="muted">
                            {selectedConversation.type} ·{" "}
                            {selectedConversation.members.length} members
                          </p>
                          <div className="conversation-info-members">
                            {selectedConversation.members.map((member) => (
                              <span key={member.username}>@{member.username}</span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {sharedMediaPreviewItems.length > 0 && (
                    <div className="chat-side-card card">
                      <div className="chat-side-header">
                        <h4>Media</h4>
                        <span>Recent</span>
                      </div>
                      <div className="chat-media-grid">
                        {sharedMediaPreviewItems.map((item) => {
                          const url = resolveAttachmentUrl(item.attachment);
                          if (!url && item.attachment.storageKey) {
                            return (
                              <button
                                key={item.key}
                                className="chat-media-tile loading"
                                onClick={() => ensureAttachmentUrl(item.attachment)}
                              >
                                Load
                              </button>
                            );
                          }
                          return (
                            <button
                              key={item.key}
                              className="chat-media-tile"
                              onClick={() => url && setLightboxSrc(url)}
                            >
                              {item.attachment.kind === "video" && url ? (
                                <video src={url} muted />
                              ) : url ? (
                                <img src={url} alt={item.attachment.name} />
                              ) : (
                                <span>{item.attachment.name}</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {sharedFilePreviewItems.length > 0 && (
                    <div className="chat-side-card card">
                      <div className="chat-side-header">
                        <h4>Files</h4>
                        <span>Shared</span>
                      </div>
                      <div className="chat-file-list">
                        {sharedFilePreviewItems.map((item) => {
                          const url = resolveAttachmentUrl(item.attachment);
                          return (
                            <div key={item.key} className="chat-file-row">
                              <div>
                                <strong>{item.attachment.name}</strong>
                                <span>{item.attachment.kind}</span>
                              </div>
                              {url ? (
                                <a href={url} target="_blank" rel="noreferrer">
                                  Open
                                </a>
                              ) : item.attachment.storageKey ? (
                                <button
                                  className="secondary"
                                  onClick={() => ensureAttachmentUrl(item.attachment)}
                                >
                                  Load
                                </button>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </aside>
                </div>
              </>
            )}
          </main>
        </div>
      )}

      {pendingForwardMessage && (
        <div
          className="forward-modal"
          onClick={() => setPendingForwardMessage(null)}
        >
          <div className="forward-card" onClick={(event) => event.stopPropagation()}>
            <h3>Forward message</h3>
            <p className="muted">
              Choose a conversation to forward to.
            </p>
            <div className="forward-list">
              {conversations.map((conv) => (
                <button
                  key={`forward-${conv.id}`}
                  className={forwardTargetId === conv.id ? "secondary" : "ghost"}
                  onClick={() => setForwardTargetId(conv.id)}
                  disabled={conv.forwardEnabled === false}
                >
                  {getConversationTitle(conv, sessionUsername)}
                  {conv.forwardEnabled === false && " (Forwarding disabled)"}
                </button>
              ))}
            </div>
            <div className="row">
              <button
                onClick={handleForwardSend}
                disabled={!forwardTargetId}
              >
                Forward
              </button>
              <button
                className="secondary"
                onClick={() => setPendingForwardMessage(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {status && <div className="status">{status}</div>}

      {lightboxSrc && (
        <div className="lightbox" onClick={() => setLightboxSrc(null)}>
          <img src={lightboxSrc} alt="Preview" />
        </div>
      )}
    </div>
  );
}

      
