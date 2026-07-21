import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from "react";
import { adminDownloadUserMetadata, adminDeleteConversation, adminDeleteUser, adminCreateAdmin, API_BASE, adminGetLockdown, adminListAdmins, adminListBlockedEvents, adminListConversations, adminListUsers, adminLogin, adminResetUserPassword, adminSendSystemMessage, adminUploadDirect, adminSetLockdown, adminUpdateAdminPermissions, adminUpdatePassword, adminUpdateUserFlags, addConversationMember, addSocialView, answerCall, createUpload, createDownloadUrl, uploadDirect, createConversation, fetchConversationSettings, createSocialComment, createSocialPost, createInviteLink, deleteMessage, disableTwoFactor, endCall, enableTwoFactor, fetchKeyBundle, fetchLinkPreview, fetchMembers, fetchMessageHistory, fetchProfile, fetchPublicProfile, fetchRoster, updateConversationSettings, fetchSocialComments, fetchSocialFeed, fetchSocialFollows, fetchSocialNotifications, fetchSocialStories, fetchSocialInsights, fetchUserStatus, fetchTyping, followSocialUser, listConversations, listDevices, listInviteLinks, login, logoutAllDevices, logoutDevice, markRead, pollCalls, publishKeyBundle, pollMessages, pollSentStatuses, redeemInviteLink, removeConversationMember, revokeInviteLink, sendIceCandidate, sendMessage, scheduleMessage, setAdminToken, setAuthSession, setTyping, signup, startCall, toggleSocialLike, toggleSocialSave, unfollowSocialUser, updateConversationRole, updateContactPrivacy, updateProfile, refreshSession, requestWsTicket, reportDecryptFailure } from "./api";
import { mergeMessages } from "./messageUtils";
import { decryptSignalMessage, encryptSignalMessage, ensureLocalKeys, ensureSession, hasLocalKeys, isSignalSupported, exportSignalState, importSignalState, resetSignalState } from "./signal";
import { cacheEncryptedMessages, cacheDecryptedMessage, cacheMediaItems, clearCachedMedia, clearCachedMessages, getCacheStats, loadCachedMessages, loadCachedMedia, pruneCachedMedia, pruneCachedMessages } from "./messageCache";
import { countries, defaultCountry } from "./countries";
function UiIcon({ name }) {
    const common = {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 1.8,
        strokeLinecap: "round",
        strokeLinejoin: "round"
    };
    switch (name) {
        case "chats":
            return _jsxs("svg", { ...common, children: [_jsx("path", { d: "M7 10h10M7 14h6" }), _jsx("path", { d: "M5 19l-1-4a8 8 0 1 1 3 3z" })] });
        case "social":
            return _jsxs("svg", { ...common, children: [_jsx("circle", { cx: "12", cy: "12", r: "3.5" }), _jsx("path", { d: "M19.4 15a7.97 7.97 0 0 0 0-6M4.6 9a7.97 7.97 0 0 0 0 6M15 4.6a7.97 7.97 0 0 0-6 0M9 19.4a7.97 7.97 0 0 0 6 0" })] });
        case "media":
            return _jsxs("svg", { ...common, children: [_jsx("rect", { x: "3", y: "5", width: "18", height: "14", rx: "3" }), _jsx("path", { d: "m9 10 2.5 2.5L14 10l4 5H6z" })] });
        case "saved":
            return _jsx("svg", { ...common, children: _jsx("path", { d: "M7 4h10a1 1 0 0 1 1 1v15l-6-3-6 3V5a1 1 0 0 1 1-1z" }) });
        case "settings":
            return _jsxs("svg", { ...common, children: [_jsx("circle", { cx: "12", cy: "12", r: "3.2" }), _jsx("path", { d: "M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-.4-1 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1-.4H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1-.4 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 .4 1 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.28.3.48.64.6 1 .08.32.09.65.09 1 0 .35-.01.68-.09 1-.12.36-.32.7-.6 1Z" })] });
        case "privacy":
            return _jsxs("svg", { ...common, children: [_jsx("path", { d: "M12 3 5 6v6c0 5 3.4 8.74 7 9 3.6-.26 7-4 7-9V6z" }), _jsx("path", { d: "M9.5 12a2.5 2.5 0 1 1 5 0v2h-5z" })] });
        case "manage":
            return _jsx("svg", { ...common, children: _jsx("path", { d: "M4 7h16M4 12h16M4 17h10" }) });
        case "focus":
            return _jsxs("svg", { ...common, children: [_jsx("circle", { cx: "12", cy: "12", r: "8" }), _jsx("path", { d: "M12 8v4l3 3" })] });
        case "call":
            return _jsx("svg", { ...common, children: _jsx("path", { d: "M5 4h4l2 5-2.5 1.5a15 15 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" }) });
        case "video":
            return _jsxs("svg", { ...common, children: [_jsx("rect", { x: "3", y: "6", width: "13", height: "12", rx: "3" }), _jsx("path", { d: "m16 10 5-3v10l-5-3z" })] });
        case "info":
            return _jsxs("svg", { ...common, children: [_jsx("circle", { cx: "12", cy: "12", r: "9" }), _jsx("path", { d: "M12 10v6M12 7h.01" })] });
        case "message":
            return _jsx("svg", { ...common, children: _jsx("path", { d: "M21 11.5a8.5 8.5 0 0 1-8.5 8.5H7l-4 2 1.3-4A8.5 8.5 0 1 1 21 11.5Z" }) });
        case "send":
            return _jsxs("svg", { ...common, children: [_jsx("path", { d: "M22 2 11 13" }), _jsx("path", { d: "m22 2-7 20-4-9-9-4z" })] });
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
function readStoredAccessToken() {
    if (typeof window === "undefined") {
        return "";
    }
    return (window.sessionStorage.getItem(STORAGE_KEYS.token) ||
        localStorage.getItem(STORAGE_KEYS.token) ||
        "");
}
function persistAccessToken(token) {
    if (typeof window === "undefined") {
        return;
    }
    window.sessionStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.removeItem(STORAGE_KEYS.token);
}
function clearStoredAccessToken() {
    if (typeof window === "undefined") {
        return;
    }
    window.sessionStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.token);
}
const ADMIN_PERMISSION_OPTIONS = [
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
const DEFAULT_PREFS = {
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
const ACCENT_MAP = {
    teal: { accent: "#5ad6a8", strong: "#19c3a5", ring: "rgba(25,195,165,0.35)" },
    blue: { accent: "#4da3ff", strong: "#3b82f6", ring: "rgba(59,130,246,0.35)" },
    green: { accent: "#5bd39c", strong: "#22c55e", ring: "rgba(34,197,94,0.35)" },
    amber: { accent: "#f6c453", strong: "#f59e0b", ring: "rgba(245,158,11,0.35)" }
};
const SETTINGS_TITLES = {
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
function SettingsItem({ title, subtitle, onClick, right, danger }) {
    const wrapperProps = onClick ? { type: "button" } : {};
    const Wrapper = onClick ? "button" : "div";
    return (_jsxs(Wrapper, { ...wrapperProps, className: `settings-item${danger ? " danger" : ""}`, onClick: onClick, children: [_jsxs("div", { className: "settings-item-text", children: [_jsx("span", { className: "settings-item-title", children: title }), subtitle && _jsx("span", { className: "settings-item-subtitle", children: subtitle })] }), _jsx("div", { className: "settings-item-right", children: right })] }));
}
function SettingsToggle({ checked, onChange }) {
    return (_jsxs("label", { className: "tg-toggle", children: [_jsx("input", { type: "checkbox", checked: checked, onChange: (event) => onChange(event.target.checked) }), _jsx("span", {})] }));
}
const tabs = ["all", "group", "channel", "direct"];
const defaultPrivacy = {
    hide_online: false,
    hide_last_seen: false,
    hide_profile_photo: false,
    disable_read_receipts: false,
    disable_typing_indicator: false
};
function getConversationTitle(conversation, self) {
    if (conversation.type === "direct") {
        const other = conversation.members.find((m) => m.username !== self);
        return other ? other.username : "Direct";
    }
    return conversation.name || "Untitled";
}
function parseLocationData(value) {
    if (!value) {
        return null;
    }
    try {
        const parsed = JSON.parse(value);
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
    }
    catch {
        return null;
    }
}
function getPreview(payload) {
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
    const label = first.kind === "image"
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
function parsePayload(text) {
    try {
        const parsed = JSON.parse(text);
        if (typeof parsed.text === "string" && Array.isArray(parsed.attachments)) {
            return {
                text: sanitizeText(parsed.text),
                attachments: parsed.attachments
                    .map((entry) => normalizeAttachment(entry))
                    .filter((entry) => Boolean(entry)),
                oneTime: Boolean(parsed.oneTime),
                linkPreview: parsed.linkPreview || null
            };
        }
    }
    catch {
        // fall back to plain text
    }
    return {
        text: sanitizeText(text),
        attachments: [],
        oneTime: false,
        linkPreview: null
    };
}
function sanitizeText(value) {
    return value.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, MAX_TEXT_LENGTH);
}
function isSafeUrl(value) {
    return /^(https?:|data:|blob:)/i.test(value);
}
function normalizeAttachment(raw) {
    if (!raw || typeof raw !== "object") {
        return null;
    }
    const entry = raw;
    const kind = entry.kind;
    if (kind !== "image" &&
        kind !== "audio" &&
        kind !== "video" &&
        kind !== "file" &&
        kind !== "location") {
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
    const storageKey = typeof entry.storageKey === "string" && entry.storageKey.length > 0
        ? entry.storageKey
        : undefined;
    const contentType = typeof entry.contentType === "string" && entry.contentType.length > 0
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
function needsAttachmentUrl(attachment, cache) {
    if (attachment.data && isSafeUrl(attachment.data)) {
        return false;
    }
    if (!attachment.storageKey) {
        return false;
    }
    const cached = cache[attachment.storageKey];
    return !cached || cached.expiresAt <= Date.now();
}
function extractFirstUrl(value) {
    const match = value.match(/https?:\/\/[^\s]+/i);
    return match ? match[0] : null;
}
function extractTagsFromCaption(value) {
    const matches = value.match(/#[a-zA-Z0-9_]+/g) || [];
    const tags = new Set();
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
function getPostTags(post) {
    if (Array.isArray(post.tags) && post.tags.length > 0) {
        return post.tags.map((tag) => tag.toLowerCase());
    }
    return extractTagsFromCaption(post.caption || "");
}
function sanitizeFilename(value) {
    return value
        .replace(/[\\/:*?"<>|]/g, "_")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 120);
}
function isAllowedMime(type) {
    return true;
}
function normalizeContentType(type) {
    if (!type || type === "image/svg+xml") {
        return "application/octet-stream";
    }
    return type;
}
function resolveAttachmentKind(type) {
    if (type.startsWith("image/") && type !== "image/svg+xml")
        return "image";
    if (type.startsWith("video/"))
        return "video";
    if (type.startsWith("audio/"))
        return "audio";
    return "file";
}
function renderInlineText(text, keyPrefix) {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return (_jsx("strong", { children: part.slice(2, -2) }, `${keyPrefix}-b-${index}`));
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
            return (_jsx("em", { children: part.slice(1, -1) }, `${keyPrefix}-i-${index}`));
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
            return (_jsx("code", { children: part.slice(1, -1) }, `${keyPrefix}-c-${index}`));
        }
        return _jsx("span", { children: part }, `${keyPrefix}-t-${index}`);
    });
}
function renderInlineSegment(text, keyPrefix, query) {
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
        const nodes = [
            _jsx("span", { children: part }, `${keyPrefix}-p-${index}`)
        ];
        if (matches[index]) {
            nodes.push(_jsx("mark", { className: "text-highlight", children: matches[index] }, `${keyPrefix}-m-${index}`));
        }
        return nodes;
    });
}
function renderMessageText(text, query = "") {
    const lines = text.split("\n");
    const urlRegex = /(https?:\/\/[^\s]+)/i;
    return lines.map((line, lineIndex) => {
        const parts = line.split(/(https?:\/\/[^\s]+)/gi);
        const rendered = parts.map((part, index) => {
            if (urlRegex.test(part)) {
                return (_jsx("a", { href: part, target: "_blank", rel: "noreferrer", children: part }, `url-${lineIndex}-${index}`));
            }
            const mentionParts = part.split(/(@[a-zA-Z0-9_]{3,32})/g);
            return (_jsx("span", { children: mentionParts.map((chunk, mentionIndex) => {
                    if (chunk.startsWith("@")) {
                        return (_jsx("span", { className: "mention", children: chunk }, `mention-${lineIndex}-${index}-${mentionIndex}`));
                    }
                    return (_jsx("span", { children: renderInlineSegment(chunk, `inline-${lineIndex}-${index}-${mentionIndex}`, query) }, `text-${lineIndex}-${index}-${mentionIndex}`));
                }) }, `span-${lineIndex}-${index}`));
        });
        return (_jsxs("span", { children: [rendered, lineIndex < lines.length - 1 && _jsx("br", {})] }, `line-${lineIndex}`));
    });
}
function parseSignalEnvelope(text) {
    try {
        const parsed = JSON.parse(text);
        if (parsed?.kind === "chat" && parsed.payload) {
            return parsed;
        }
        if (parsed?.kind === "sender-key" &&
            typeof parsed.senderKey === "string") {
            return parsed;
        }
    }
    catch {
        return null;
    }
    return null;
}
function matchesQuery(value, query) {
    return value.toLowerCase().includes(query.toLowerCase());
}
function attachmentKey(messageId, index) {
    return `${messageId}-${index}`;
}
function extractMentions(text) {
    const matches = text.match(/@[a-zA-Z0-9_]{3,32}/g);
    if (!matches) {
        return [];
    }
    return Array.from(new Set(matches.map((item) => item.slice(1).toLowerCase())));
}
function toMinutes(value) {
    const [h, m] = value.split(":").map((part) => Number(part));
    if (!Number.isFinite(h) || !Number.isFinite(m)) {
        return null;
    }
    return h * 60 + m;
}
function isQuietHoursActive(settings) {
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
function spamScore(text) {
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
    const anyNavigator = navigator;
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        deviceModel: anyNavigator.userAgentData?.model || ""
    };
}
function getDeviceId() {
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
function getDeviceName() {
    const anyNavigator = navigator;
    const platform = anyNavigator.userAgentData?.platform || navigator.platform;
    const model = anyNavigator.userAgentData?.model || "";
    return `${platform}${model ? ` ${model}` : ""}`.trim() || "Browser";
}
function getTimeZoneForRegion(region) {
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
function formatTime(timestamp, timeZone) {
    return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        ...(timeZone ? { timeZone } : {})
    });
}
function formatDateLabel(timestamp, timeZone) {
    return new Date(timestamp).toLocaleDateString([], {
        weekday: "short",
        month: "short",
        day: "numeric",
        ...(timeZone ? { timeZone } : {})
    });
}
function formatLastSeen(value) {
    if (!value) {
        return "Last seen recently";
    }
    return `Last seen ${new Date(value).toLocaleString()}`;
}
function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
function formatBytes(bytes) {
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
function getInitials(username) {
    return username.slice(0, 2).toUpperCase();
}
async function fingerprintKey(base64) {
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
    const [adminRoute, setAdminRoute] = useState(window.location.hash === "#admin");
    const [showSettings, setShowSettings] = useState(false);
    const [theme, setTheme] = useState(localStorage.getItem("messager.theme") || "dark");
    const [settingsStack, setSettingsStack] = useState(["root"]);
    const settingsPage = settingsStack[settingsStack.length - 1];
    const [phoneNumber, setPhoneNumber] = useState("");
    const [countryCode, setCountryCode] = useState(defaultCountry.code);
    const [authStep, setAuthStep] = useState("phone");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [enable2fa, setEnable2fa] = useState(false);
    const [sessionUsername, setSessionUsername] = useState(localStorage.getItem(STORAGE_KEYS.username) || "");
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
        }
        else {
            clearStoredAccessToken();
        }
    }, [token]);
    const [userFlags, setUserFlags] = useState({
        banned: false,
        canSend: true,
        canCreate: true,
        allowDirect: true,
        allowGroupInvite: true
    });
    const [profileState, setProfileState] = useState({
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
    const [publicProfiles, setPublicProfiles] = useState({});
    const [devices, setDevices] = useState([]);
    const [devicesLoading, setDevicesLoading] = useState(false);
    const [tab, setTab] = useState("all");
    const [conversations, setConversations] = useState([]);
    const [selectedConversationId, setSelectedConversationId] = useState(null);
    const [showConversationInfo, setShowConversationInfo] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [draftsByConversation, setDraftsByConversation] = useState({});
    const [attachments, setAttachments] = useState([]);
    const [uploadQueue, setUploadQueue] = useState([]);
    const [outbox, setOutbox] = useState([]);
    const [outboxStatusByGroupId, setOutboxStatusByGroupId] = useState({});
    const [connectionStatus, setConnectionStatus] = useState("online");
    const outboxRef = useRef([]);
    const outboxSendingRef = useRef(false);
    const [liveLocationActive, setLiveLocationActive] = useState(false);
    const [liveLocationExpiresAt, setLiveLocationExpiresAt] = useState(null);
    const liveLocationWatchRef = useRef(null);
    const liveLocationTimerRef = useRef(null);
    const liveLocationIdRef = useRef(null);
    const liveLocationConversationRef = useRef(null);
    const liveLocationLastSentRef = useRef(0);
    const liveLocationActiveRef = useRef(false);
    const [attachmentUrlCache, setAttachmentUrlCache] = useState({});
    const attachmentUrlPendingRef = useRef(new Set());
    const translationPendingRef = useRef(new Set());
    const initialHistoryLoadedRef = useRef(new Set());
    const [showKeyBackupWarning, setShowKeyBackupWarning] = useState(false);
    const [settingsPrefs, setSettingsPrefs] = useState(DEFAULT_PREFS);
    const [messages, setMessages] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyCursorByConversation, setHistoryCursorByConversation] = useState({});
    const [historyExhausted, setHistoryExhausted] = useState({});
    const [status, setStatus] = useState(null);
    const [showJumpToBottom, setShowJumpToBottom] = useState(false);
    const [directUsername, setDirectUsername] = useState("");
    const [groupName, setGroupName] = useState("");
    const [groupMembers, setGroupMembers] = useState("");
    const [groupVisibility, setGroupVisibility] = useState("public");
    const [selectedTemplateId, setSelectedTemplateId] = useState("");
    const [conversationQuery, setConversationQuery] = useState("");
    const [messageQuery, setMessageQuery] = useState("");
    const [typingUsers, setTypingUsers] = useState([]);
    const [lightboxSrc, setLightboxSrc] = useState(null);
    const [audioDurations, setAudioDurations] = useState({});
    const [pinnedIds, setPinnedIds] = useState(new Set());
    const [starredIds, setStarredIds] = useState(new Set());
    const [savedMessages, setSavedMessages] = useState([]);
    const [activeView, setActiveView] = useState("chat");
    const [mainSection, setMainSection] = useState("messages");
    const [socialFeedKind, setSocialFeedKind] = useState("post");
    const [socialComposeKind, setSocialComposeKind] = useState("post");
    const [socialFeed, setSocialFeed] = useState([]);
    const [socialStories, setSocialStories] = useState([]);
    const [socialLoading, setSocialLoading] = useState(false);
    const [socialError, setSocialError] = useState(null);
    const [socialSort, setSocialSort] = useState("latest");
    const [socialCaption, setSocialCaption] = useState("");
    const [socialMedia, setSocialMedia] = useState(null);
    const [socialMediaPreview, setSocialMediaPreview] = useState(null);
    const [socialPublishing, setSocialPublishing] = useState(false);
    const [socialVisibility, setSocialVisibility] = useState("public");
    const [socialAllowedUsers, setSocialAllowedUsers] = useState([]);
    const [socialCommentVisibility, setSocialCommentVisibility] = useState("public");
    const [socialTimed, setSocialTimed] = useState(false);
    const [socialScheduleAt, setSocialScheduleAt] = useState("");
    const [socialFilter, setSocialFilter] = useState("all");
    const [socialTagFilter, setSocialTagFilter] = useState("");
    const [socialCollections, setSocialCollections] = useState({});
    const [socialActiveCollection, setSocialActiveCollection] = useState("Saved");
    const [socialNewCollection, setSocialNewCollection] = useState("");
    const [socialPinnedIds, setSocialPinnedIds] = useState(new Set());
    const [reelMuted, setReelMuted] = useState(true);
    const [socialInsights, setSocialInsights] = useState(null);
    const [socialComments, setSocialComments] = useState({});
    const [activeStory, setActiveStory] = useState(null);
    const [activeCommentsPost, setActiveCommentsPost] = useState(null);
    const [commentDraft, setCommentDraft] = useState("");
    const [storyReplyText, setStoryReplyText] = useState("");
    const [followingUsers, setFollowingUsers] = useState(new Set());
    const [socialFollowers, setSocialFollowers] = useState([]);
    const [activeReel, setActiveReel] = useState(null);
    const [socialNotifications, setSocialNotifications] = useState([]);
    const [chatMediaFeed, setChatMediaFeed] = useState([]);
    const [socialSearch, setSocialSearch] = useState("");
    const [quickReplies, setQuickReplies] = useState([]);
    const [newQuickReply, setNewQuickReply] = useState("");
    const [quietHoursByConversation, setQuietHoursByConversation] = useState({});
    const [pinnedMediaByConversation, setPinnedMediaByConversation] = useState({});
    const [forwardRulesByConversation, setForwardRulesByConversation] = useState({});
    const [pendingForwardMessage, setPendingForwardMessage] = useState(null);
    const [forwardTargetId, setForwardTargetId] = useState(null);
    const [chatTemplates, setChatTemplates] = useState([]);
    const [translationCache, setTranslationCache] = useState({});
    const adminHasPermission = (perm) => adminRole === "super" || adminPermissions.includes(perm);
    const [messageFilters, setMessageFilters] = useState({
        type: "all",
        sender: "",
        from: "",
        to: ""
    });
    const [scheduledAt, setScheduledAt] = useState("");
    const [focusByConversation, setFocusByConversation] = useState({});
    const [focusMinutes, setFocusMinutes] = useState(30);
    const [unreadByConversation, setUnreadByConversation] = useState({});
    const [lastMessageByConversation, setLastMessageByConversation] = useState({});
    const [statusByGroupId, setStatusByGroupId] = useState({});
    const [statusByUser, setStatusByUser] = useState({});
    const [showContactPrivacy, setShowContactPrivacy] = useState(false);
    const [contactPrivacy, setContactPrivacy] = useState({
        ...defaultPrivacy
    });
    const [showManagePanel, setShowManagePanel] = useState(false);
    const [roster, setRoster] = useState([]);
    const [inviteLinks, setInviteLinks] = useState([]);
    const [manageUsername, setManageUsername] = useState("");
    const [inviteMaxUses, setInviteMaxUses] = useState(1);
    const [inviteExpiresMinutes, setInviteExpiresMinutes] = useState(60);
    const [inviteToken, setInviteToken] = useState("");
    const [pendingInviteToken, setPendingInviteToken] = useState(null);
    const [adminUsername, setAdminUsername] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [adminTokenState, setAdminTokenState] = useState(null);
    const isAdmin = Boolean(adminTokenState);
    const [adminRole, setAdminRole] = useState(null);
    const [adminPermissions, setAdminPermissions] = useState([]);
    const [adminAdmins, setAdminAdmins] = useState([]);
    const [adminLockdown, setAdminLockdown] = useState(false);
    const [adminLockdownPending, setAdminLockdownPending] = useState(false);
    const [adminLockdownSaving, setAdminLockdownSaving] = useState(false);
    const [adminLockdownAllowIds, setAdminLockdownAllowIds] = useState([]);
    const [adminLockdownAllowInput, setAdminLockdownAllowInput] = useState("");
    const [adminUsers, setAdminUsers] = useState([]);
    const [adminConversations, setAdminConversations] = useState([]);
    const [adminBlockedEvents, setAdminBlockedEvents] = useState([]);
    const [adminPermissionEdits, setAdminPermissionEdits] = useState({});
    const [newAdminPassword, setNewAdminPassword] = useState("");
    const [newAdminAccountUsername, setNewAdminAccountUsername] = useState("");
    const [newAdminAccountPassword, setNewAdminAccountPassword] = useState("");
    const [newAdminAccountRole, setNewAdminAccountRole] = useState("standard");
    const [newAdminAccountPermissions, setNewAdminAccountPermissions] = useState([]);
    const [systemMessage, setSystemMessage] = useState("");
    const [systemMessageAttachments, setSystemMessageAttachments] = useState([]);
    const [systemMessageUploading, setSystemMessageUploading] = useState(false);
    const [systemMessageSending, setSystemMessageSending] = useState(false);
    const [showBlueTeam, setShowBlueTeam] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [twoFactorPassword, setTwoFactorPassword] = useState("");
    const [encryptionReady, setEncryptionReady] = useState(false);
    const [callState, setCallState] = useState({
        status: "idle",
        callId: null,
        peerUsername: null,
        media: "audio",
        conversationId: null
    });
    const [incomingCall, setIncomingCall] = useState(null);
    const [callError, setCallError] = useState(null);
    const [importingKeys, setImportingKeys] = useState(false);
    const [micMuted, setMicMuted] = useState(false);
    const signalSupported = isSignalSupported();
    const [oneTimeMode, setOneTimeMode] = useState(false);
    const [cacheStats, setCacheStats] = useState(null);
    const [fingerprintsByUser, setFingerprintsByUser] = useState({});
    const [verifiedKeysByUser, setVerifiedKeysByUser] = useState({});
    const selectedCountry = countries.find((item) => item.code === countryCode) || defaultCountry;
    const phoneDigits = phoneNumber.replace(/\D/g, "");
    const phoneComplete = phoneDigits.length >= 8;
    const displayName = [profileIdentity.firstName, profileIdentity.lastName]
        .filter(Boolean)
        .join(" ") || sessionUsername;
    const settingsTitle = SETTINGS_TITLES[settingsPage];
    const displayTimeZone = settingsPrefs.language.region === "auto"
        ? settingsPrefs.language.app === "fa" || navigator.language.startsWith("fa")
            ? "Asia/Tehran"
            : undefined
        : getTimeZoneForRegion(settingsPrefs.language.region);
    const lastPollRef = useRef(0);
    const lastPollIdRef = useRef(0);
    const lastStatusPollRef = useRef(0);
    const lastCallPollRef = useRef(0);
    const selectedConversationRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const pollDelayRef = useRef(2500);
    const pollIdleRef = useRef(0);
    const pollErrorRef = useRef(0);
    const wsConnectedRef = useRef(false);
    const wsReconnectAttemptsRef = useRef(0);
    const wsRetryTimerRef = useRef(null);
    const decryptReportRef = useRef(0);
    const keyBundleCacheRef = useRef(new Map());
    const messageEndRef = useRef(null);
    const messageListRef = useRef(null);
    const messagesRef = useRef([]);
    const wsRef = useRef(null);
    const retryDecryptRef = useRef(false);
    const processingMessageIdsRef = useRef(new Set());
    const processedOneTimeRef = useRef(new Set());
    const callPeerRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const callStateRef = useRef(callState);
    const pendingIceRef = useRef([]);
    const callTimeoutRef = useRef(null);
    const callStartRef = useRef(null);
    const callConversationRef = useRef(null);
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
        const scale = settingsPrefs.appearance.fontSize === "small"
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
            const parsed = JSON.parse(raw);
            setOneTimeMode(Boolean(parsed.oneTimeMode));
        }
        catch {
            setOneTimeMode(false);
        }
    }, [sessionUsername]);
    useEffect(() => {
        if (!sessionUsername) {
            return;
        }
        const key = `${STORAGE_KEYS.settingsPrefix}${sessionUsername}`;
        localStorage.setItem(key, JSON.stringify({ oneTimeMode: Boolean(oneTimeMode) }));
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
            const parsed = JSON.parse(raw);
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
        }
        catch {
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
        localStorage.setItem(`${STORAGE_KEYS.draftsPrefix}${sessionUsername}`, JSON.stringify(draftsByConversation));
    }, [sessionUsername, draftsByConversation]);
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.quickReplies, JSON.stringify(quickReplies));
    }, [quickReplies]);
    useEffect(() => {
        if (!sessionUsername) {
            return;
        }
        localStorage.setItem(`${STORAGE_KEYS.quietHoursPrefix}${sessionUsername}`, JSON.stringify(quietHoursByConversation));
    }, [sessionUsername, quietHoursByConversation]);
    useEffect(() => {
        if (!sessionUsername) {
            return;
        }
        localStorage.setItem(`${STORAGE_KEYS.pinnedMediaPrefix}${sessionUsername}`, JSON.stringify(pinnedMediaByConversation));
    }, [sessionUsername, pinnedMediaByConversation]);
    useEffect(() => {
        if (!sessionUsername) {
            return;
        }
        localStorage.setItem(`${STORAGE_KEYS.forwardRulesPrefix}${sessionUsername}`, JSON.stringify(forwardRulesByConversation));
    }, [sessionUsername, forwardRulesByConversation]);
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.templatesKey, JSON.stringify(chatTemplates));
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
        const target = settingsPrefs.language.app === "auto"
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
                const translation = typeof data?.translation === "string" ? data.translation : "";
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
        const pinnedRaw = localStorage.getItem(`${STORAGE_KEYS.pinnedPrefix}${sessionUsername}`);
        const starredRaw = localStorage.getItem(`${STORAGE_KEYS.starredPrefix}${sessionUsername}`);
        const savedRaw = localStorage.getItem(`${STORAGE_KEYS.savedPrefix}${sessionUsername}`);
        const chatMediaRaw = localStorage.getItem(`${STORAGE_KEYS.chatMediaPrefix}${sessionUsername}`);
        const focusRaw = localStorage.getItem(`${STORAGE_KEYS.focusPrefix}${sessionUsername}`);
        const socialCollectionsRaw = localStorage.getItem(`${STORAGE_KEYS.socialCollectionsPrefix}${sessionUsername}`);
        const socialPinnedRaw = localStorage.getItem(`${STORAGE_KEYS.socialPinnedPrefix}${sessionUsername}`);
        const draftsRaw = localStorage.getItem(`${STORAGE_KEYS.draftsPrefix}${sessionUsername}`);
        const quickRepliesRaw = localStorage.getItem(STORAGE_KEYS.quickReplies);
        const quietRaw = localStorage.getItem(`${STORAGE_KEYS.quietHoursPrefix}${sessionUsername}`);
        const pinnedMediaRaw = localStorage.getItem(`${STORAGE_KEYS.pinnedMediaPrefix}${sessionUsername}`);
        const forwardRulesRaw = localStorage.getItem(`${STORAGE_KEYS.forwardRulesPrefix}${sessionUsername}`);
        const outboxRaw = localStorage.getItem(`${STORAGE_KEYS.outboxPrefix}${sessionUsername}`);
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
        setForwardRulesByConversation(forwardRulesRaw ? JSON.parse(forwardRulesRaw) : {});
        setOutbox(outboxRaw ? JSON.parse(outboxRaw) : []);
        setChatTemplates(templatesRaw
            ? JSON.parse(templatesRaw)
            : [
                { id: "team", name: "Team updates", visibility: "private" },
                { id: "announcements", name: "Announcements", visibility: "public" },
                { id: "support", name: "Support queue", visibility: "public" }
            ]);
    }, [sessionUsername]);
    useEffect(() => {
        if (!isLoggedIn || !sessionUsername) {
            return;
        }
        if (!settingsPrefs.data.cacheMessages) {
            return;
        }
        const ttlMs = settingsPrefs.data.cacheTtlDays * 24 * 60 * 60 * 1000;
        loadCachedMessages(sessionUsername, Math.min(settingsPrefs.data.cacheMaxMessages, 2000), ttlMs)
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
        const ttlDays = Math.min(settingsPrefs.data.cacheMediaTtlDays, settingsPrefs.data.keepMediaDays);
        const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
        loadCachedMedia(sessionUsername, Math.min(settingsPrefs.data.cacheMediaMax, 800), ttlMs)
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
                        storageKey: row.storageKey,
                        contentType: row.contentType
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
            localStorage.removeItem(`${STORAGE_KEYS.pollCursorPrefix}${sessionUsername}`);
        }
    }, [sessionUsername, settingsPrefs.data.cacheMessages]);
    useEffect(() => {
        if (!sessionUsername) {
            return;
        }
        if (!settingsPrefs.data.cacheMedia) {
            clearCachedMedia(sessionUsername).catch(() => undefined);
            localStorage.removeItem(`${STORAGE_KEYS.chatMediaPrefix}${sessionUsername}`);
        }
    }, [sessionUsername, settingsPrefs.data.cacheMedia]);
    useEffect(() => {
        if (!sessionUsername || !settingsPrefs.data.cacheMedia) {
            return;
        }
        const ttlDays = Math.min(settingsPrefs.data.cacheMediaTtlDays, settingsPrefs.data.keepMediaDays);
        const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
        pruneCachedMedia(sessionUsername, settingsPrefs.data.cacheMediaMax, ttlMs).catch(() => undefined);
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
        const raw = localStorage.getItem(`${STORAGE_KEYS.pollCursorPrefix}${sessionUsername}`);
        if (!raw) {
            return;
        }
        try {
            const parsed = JSON.parse(raw);
            if (Number.isFinite(parsed.since) && parsed.since > lastPollRef.current) {
                lastPollRef.current = parsed.since;
            }
            if (Number.isFinite(parsed.sinceId)) {
                lastPollIdRef.current = parsed.sinceId;
            }
        }
        catch {
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
        localStorage.setItem(`${STORAGE_KEYS.savedPrefix}${sessionUsername}`, JSON.stringify(savedMessages));
    }, [sessionUsername, savedMessages]);
    useEffect(() => {
        if (!sessionUsername) {
            return;
        }
        localStorage.setItem(`${STORAGE_KEYS.socialCollectionsPrefix}${sessionUsername}`, JSON.stringify(socialCollections));
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
        localStorage.setItem(`${STORAGE_KEYS.socialPinnedPrefix}${sessionUsername}`, JSON.stringify(Array.from(socialPinnedIds)));
    }, [sessionUsername, socialPinnedIds]);
    useEffect(() => {
        if (!sessionUsername) {
            return;
        }
        localStorage.setItem(`${STORAGE_KEYS.chatMediaPrefix}${sessionUsername}`, JSON.stringify(chatMediaFeed));
    }, [sessionUsername, chatMediaFeed]);
    useEffect(() => {
        if (!sessionUsername) {
            return;
        }
        localStorage.setItem(`${STORAGE_KEYS.outboxPrefix}${sessionUsername}`, JSON.stringify(outbox));
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
        localStorage.setItem(`${STORAGE_KEYS.focusPrefix}${sessionUsername}`, JSON.stringify(focusByConversation));
    }, [sessionUsername, focusByConversation]);
    useEffect(() => {
        const interval = window.setInterval(() => {
            setFocusByConversation((prev) => {
                let changed = false;
                const next = {
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
    const socialAudienceOptions = Array.from(new Set([...socialFollowers, ...Array.from(followingUsers)])).sort();
    const mySocialItems = socialFeed.filter((item) => item.author.username === sessionUsername);
    const myPostCount = mySocialItems.filter((item) => item.post.kind === "post")
        .length;
    const myReelCount = mySocialItems.filter((item) => item.post.kind === "reel")
        .length;
    const myStoryCount = socialStories.filter((item) => item.author.username === sessionUsername).length;
    const socialTagCounts = useMemo(() => {
        const counts = new Map();
        for (const item of socialFeed) {
            for (const tag of getPostTags(item.post)) {
                counts.set(tag, (counts.get(tag) || 0) + 1);
            }
        }
        return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
    }, [socialFeed]);
    const activeCollectionIds = socialCollections[socialActiveCollection] || [];
    const filteredSocialFeed = socialFeed.filter((item) => {
        if (socialFilter === "saved" && !item.viewer.saved) {
            return false;
        }
        if (socialFilter === "saved" &&
            activeCollectionIds.length > 0 &&
            !activeCollectionIds.includes(item.post.id)) {
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
            return (item.author.username.toLowerCase().includes(needle) ||
                (item.post.caption || "").toLowerCase().includes(needle));
        }
        return true;
    });
    const appendChatMedia = (items) => {
        if (items.length === 0) {
            return;
        }
        const newEntries = [];
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
            const ttlDays = Math.min(settingsPrefs.data.cacheMediaTtlDays, settingsPrefs.data.keepMediaDays);
            const ttlMs = ttlDays * 24 * 60 * 60 * 1000;
            cacheMediaItems(sessionUsername, newEntries).catch(() => undefined);
            pruneCachedMedia(sessionUsername, settingsPrefs.data.cacheMediaMax, ttlMs).catch(() => undefined);
        }
    };
    const resolveAttachmentUrl = (attachment) => {
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
    const ensureAttachmentUrl = async (attachment) => {
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
            const expiresAt = Date.now() + Math.max(30, data.expiresIn - 5) * 1000;
            setAttachmentUrlCache((prev) => ({
                ...prev,
                [key]: { url: data.url, expiresAt }
            }));
        }
        catch (error) {
            setStatus(error.message || "Attachment download failed");
        }
        finally {
            attachmentUrlPendingRef.current.delete(key);
        }
    };
    const resolveChatMediaUrl = (item) => {
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
        if (!isLoggedIn ||
            showSettings ||
            activeView !== "explore" ||
            mainSection !== "social") {
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
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const refreshAdminData = async (permissions = adminPermissions, role = adminRole) => {
        const hasPermission = (perm) => role === "super" || permissions.includes(perm);
        try {
            if (hasPermission("manage_users")) {
                const usersData = await adminListUsers();
                setAdminUsers(usersData.users || []);
            }
            else {
                setAdminUsers([]);
            }
            if (hasPermission("manage_conversations")) {
                const conversationsData = await adminListConversations();
                setAdminConversations(conversationsData.conversations || []);
            }
            else {
                setAdminConversations([]);
            }
            if (hasPermission("manage_admins")) {
                const adminData = await adminListAdmins();
                setAdminAdmins(adminData.admins || []);
            }
            else {
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
            }
            else {
                setAdminBlockedEvents([]);
            }
        }
        catch (error) {
            setStatus(error.message);
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
            }
            catch (error) {
                setStatus(error.message);
            }
            finally {
                setPendingInviteToken(null);
                window.history.replaceState(null, "", window.location.pathname + window.location.search);
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
            }
            catch {
                // ignore background save errors
            }
            finally {
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
                setStatus("Encryption keys missing on this device. Import backup or reset encryption.");
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
            setStatus(error.message || "Encryption setup failed.");
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
            localStorage.setItem(STORAGE_KEYS.tokenExpires, String(data.expiresAt || 0));
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
                localStorage.setItem(STORAGE_KEYS.tokenExpires, String(data.expiresAt || 0));
            }
            catch {
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
        const handleIncomingMessage = async (msg) => {
            if (processingMessageIdsRef.current.has(msg.id) ||
                messagesRef.current.some((item) => item.id === msg.id)) {
                return;
            }
            processingMessageIdsRef.current.add(msg.id);
            if (settingsPrefs.data.cacheMessages) {
                cacheEncryptedMessages(sessionUsername, [msg]).catch(() => undefined);
                const ttlMs = settingsPrefs.data.cacheTtlDays * 24 * 60 * 60 * 1000;
                pruneCachedMessages(sessionUsername, settingsPrefs.data.cacheMaxMessages, ttlMs).catch(() => undefined);
            }
            if (messagesRef.current.some((item) => typeof item.id === "string" &&
                item.id.startsWith("local-") &&
                item.groupId === msg.group_id &&
                item.sender === msg.sender_username)) {
                return;
            }
            let payload = { text: "Encrypted message", attachments: [] };
            let encrypted;
            try {
                let plaintext = "";
                if (msg.nonce?.startsWith("signal:")) {
                    if (!signalSupported || !encryptionReady) {
                        throw new Error("decrypt not available");
                    }
                    plaintext = await decryptSignalMessage(sessionUsername, msg.sender_username, Number(msg.sender_device_id) || 1, msg.ciphertext, msg.nonce);
                }
                else {
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
                    cacheDecryptedMessage(sessionUsername, msg.id, plaintext, msg).catch(() => undefined);
                }
            }
            catch (error) {
                const now = Date.now();
                if (now - decryptReportRef.current > 15000) {
                    decryptReportRef.current = now;
                    reportDecryptFailure({
                        error: error.message,
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
            const nextMessage = {
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
                if (msg.sender_username !== sessionUsername &&
                    msg.conversation_id !== selectedConversationRef.current) {
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
            if (msg.created_at > lastPollRef.current ||
                (msg.created_at === lastPollRef.current && msg.id > lastPollIdRef.current)) {
                lastPollRef.current = msg.created_at;
                lastPollIdRef.current = msg.id;
                localStorage.setItem(`${STORAGE_KEYS.pollCursorPrefix}${sessionUsername}`, JSON.stringify({
                    since: lastPollRef.current,
                    sinceId: lastPollIdRef.current
                }));
            }
            if (selectedConversationRef.current === msg.conversation_id) {
                markRead(msg.conversation_id).catch(() => undefined);
            }
        };
        const poller = async () => {
            try {
                const data = await pollMessages(lastPollRef.current, lastPollIdRef.current, 50);
                if (!isMounted || !data.messages?.length) {
                    pollIdleRef.current += 1;
                    pollDelayRef.current = computePollDelay();
                    return;
                }
                if (settingsPrefs.data.cacheMessages) {
                    const ttlMs = settingsPrefs.data.cacheTtlDays * 24 * 60 * 60 * 1000;
                    cacheEncryptedMessages(sessionUsername, data.messages).catch(() => undefined);
                    pruneCachedMessages(sessionUsername, settingsPrefs.data.cacheMaxMessages, ttlMs).catch(() => undefined);
                }
                const decrypted = [];
                for (const msg of data.messages) {
                    if (processingMessageIdsRef.current.has(msg.id) ||
                        messagesRef.current.some((item) => item.id === msg.id)) {
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
                            plaintext = await decryptSignalMessage(sessionUsername, msg.sender_username, Number(msg.sender_device_id) || 1, msg.ciphertext, msg.nonce);
                        }
                        else {
                            plaintext = msg.ciphertext;
                        }
                        const envelope = parseSignalEnvelope(plaintext);
                        if (envelope?.kind === "sender-key") {
                            continue;
                        }
                        const payload = envelope?.kind === "chat"
                            ? envelope.payload
                            : parsePayload(plaintext);
                        if (settingsPrefs.data.cacheMessages) {
                            cacheDecryptedMessage(sessionUsername, msg.id, plaintext, msg).catch(() => undefined);
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
                    }
                    catch (error) {
                        const now = Date.now();
                        if (now - decryptReportRef.current > 15000) {
                            decryptReportRef.current = now;
                            reportDecryptFailure({
                                error: error.message,
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
                        if (msg.sender !== sessionUsername &&
                            msg.conversationId !== selectedConversationRef.current) {
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
                if (selectedConversationRef.current &&
                    decrypted.some((msg) => msg.conversationId === selectedConversationRef.current)) {
                    markRead(selectedConversationRef.current).catch(() => undefined);
                }
                if (decrypted.length > 0 &&
                    document.visibilityState !== "visible" &&
                    "Notification" in window &&
                    Notification.permission === "granted") {
                    const latest = decrypted[decrypted.length - 1];
                    if (latest.sender === sessionUsername) {
                        return;
                    }
                    const hasMention = typeof latest.payload?.text === "string" &&
                        extractMentions(latest.payload.text).includes(sessionUsername.toLowerCase());
                    if (isQuietHoursActive(quietHoursByConversation[latest.conversationId]) &&
                        !(settingsPrefs.chat.allowMentionsDuringQuiet && hasMention)) {
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
                localStorage.setItem(`${STORAGE_KEYS.pollCursorPrefix}${sessionUsername}`, JSON.stringify({
                    since: lastPollRef.current,
                    sinceId: lastPollIdRef.current
                }));
                pollIdleRef.current = 0;
                pollErrorRef.current = 0;
                pollDelayRef.current = computePollDelay();
            }
            catch (error) {
                pollErrorRef.current += 1;
                pollDelayRef.current = computePollDelay();
                const message = error.message || "";
                if (message.includes("unauthorized")) {
                    refreshAuth().catch(() => undefined);
                    return;
                }
                if (!/internal server error|failed to fetch|networkerror/i.test(message)) {
                    setStatus(message);
                }
            }
        };
        let timer;
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
                    }
                    catch {
                        // ignore
                    }
                };
                ws.onmessage = (event) => {
                    try {
                        const payload = JSON.parse(event.data);
                        if (payload.type === "message" && payload.message) {
                            handleIncomingMessage(payload.message).catch(() => undefined);
                        }
                    }
                    catch {
                        // ignore
                    }
                };
                wsRef.current = ws;
            }
            catch {
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
            if (retryDecryptRef.current ||
                !sessionUsername ||
                !signalSupported ||
                !encryptionReady) {
                return;
            }
            const encryptedMessages = messagesRef.current.filter((message) => Boolean(message.encrypted));
            if (encryptedMessages.length === 0) {
                return;
            }
            retryDecryptRef.current = true;
            try {
                const updates = new Map();
                for (const message of encryptedMessages) {
                    const encrypted = message.encrypted;
                    if (!encrypted) {
                        continue;
                    }
                    try {
                        const plaintext = await decryptSignalMessage(sessionUsername, message.sender, encrypted.senderDeviceId, encrypted.ciphertext, encrypted.nonce);
                        const envelope = parseSignalEnvelope(plaintext);
                        const payload = envelope?.kind === "chat"
                            ? envelope.payload
                            : parsePayload(plaintext);
                        if (settingsPrefs.data.cacheMessages) {
                            cacheDecryptedMessage(sessionUsername, message.id, plaintext).catch(() => undefined);
                        }
                        updates.set(message.id, payload);
                    }
                    catch {
                        // keep encrypted placeholder
                    }
                }
                if (updates.size > 0) {
                    setMessages((prev) => prev.map((message) => updates.has(message.id)
                        ? {
                            ...message,
                            payload: updates.get(message.id) || message.payload,
                            encrypted: undefined
                        }
                        : message));
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
            }
            finally {
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
            }
            catch (error) {
                const message = error.message || "";
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
            const pending = outboxRef.current.filter((item) => item.nextAttemptAt <= Date.now());
            if (pending.length === 0) {
                return;
            }
            outboxSendingRef.current = true;
            try {
                for (const item of pending) {
                    const conversation = conversations.find((conv) => conv.id === item.conversationId);
                    if (!conversation) {
                        setOutboxStatus(item.messageId, "failed", item.attempts + 1);
                        continue;
                    }
                    setOutboxStatus(item.messageId, "retrying", item.attempts + 1);
                    try {
                        const envelope = { kind: "chat", payload: item.payload };
                        const payloads = await buildEncryptedPayloads(conversation, envelope, item.messageId);
                        if (payloads.length === 0) {
                            setOutboxStatus(item.messageId, "failed", item.attempts + 1);
                            continue;
                        }
                        await sendMessage(conversation.id, payloads);
                        setOutbox((prev) => prev.filter((entry) => entry.messageId !== item.messageId));
                        clearOutboxStatus(item.messageId);
                        setConnectionStatus("online");
                    }
                    catch (error) {
                        const attempts = item.attempts + 1;
                        const delay = computeOutboxBackoff(attempts);
                        setOutbox((prev) => prev.map((entry) => entry.messageId === item.messageId
                            ? {
                                ...entry,
                                attempts,
                                nextAttemptAt: Date.now() + delay,
                                lastError: error.message || "retry failed"
                            }
                            : entry));
                        setOutboxStatus(item.messageId, "queued", attempts);
                        setConnectionStatus("reconnecting");
                    }
                }
            }
            finally {
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
            }
            catch (error) {
                const message = error.message || "";
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
            }
            catch (error) {
                setStatus(error.message);
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
                const events = data.events;
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
                            conversationId: typeof event.payload.conversationId === "number"
                                ? event.payload.conversationId
                                : null
                        });
                        if (typeof event.payload.conversationId === "number" &&
                            event.payload.conversationId !== selectedConversationId) {
                            setSelectedConversationId(event.payload.conversationId);
                        }
                    }
                    else if (event.type === "answer") {
                        if (event.callId !== callStateRef.current.callId ||
                            !callPeerRef.current) {
                            continue;
                        }
                        if (event.payload.answer) {
                            await callPeerRef.current.setRemoteDescription(new RTCSessionDescription(JSON.parse(event.payload.answer)));
                            await flushPendingIce();
                            setCallState((prev) => prev.status === "outgoing"
                                ? { ...prev, status: "active" }
                                : prev);
                            callStartRef.current = Date.now();
                            if (callTimeoutRef.current) {
                                window.clearTimeout(callTimeoutRef.current);
                                callTimeoutRef.current = null;
                            }
                        }
                    }
                    else if (event.type === "ice") {
                        if (event.callId !== callStateRef.current.callId ||
                            !callPeerRef.current) {
                            continue;
                        }
                        if (event.payload.candidate) {
                            const candidate = JSON.parse(event.payload.candidate);
                            if (!callPeerRef.current.remoteDescription) {
                                pendingIceRef.current.push(candidate);
                            }
                            else {
                                await callPeerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                            }
                        }
                    }
                    else if (event.type === "end") {
                        if (event.callId !== callStateRef.current.callId) {
                            continue;
                        }
                        finalizeCallLog();
                        resetCallState();
                        setStatus("Call ended");
                    }
                }
                lastCallPollRef.current = events[events.length - 1].id;
            }
            catch {
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
        const conversation = conversations.find((item) => item.id === selectedConversationId);
        if (!conversation || conversation.type !== "direct") {
            return;
        }
        const other = conversation.members.find((member) => member.username !== sessionUsername);
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
            }
            catch {
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
        const toDelete = messages.filter((msg) => msg.conversationId === selectedConversationId &&
            msg.payload.oneTime &&
            msg.sender !== sessionUsername &&
            !msg.deletedAt &&
            !processedOneTimeRef.current.has(msg.groupId));
        if (toDelete.length === 0) {
            return;
        }
        for (const msg of toDelete) {
            processedOneTimeRef.current.add(msg.groupId);
            deleteMessage({ scope: "all", groupId: msg.groupId }).catch(() => undefined);
        }
        setMessages((prev) => prev.map((msg) => toDelete.some((item) => item.id === msg.id)
            ? {
                ...msg,
                payload: { text: "[Deleted]", attachments: [] },
                deletedAt: Date.now()
            }
            : msg));
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
            const data = await signup(fullPhone, firstName, lastName, normalizedUsername, enable2fa ? password : null, publicKey, deviceId, deviceName, getDeviceInfo());
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
            localStorage.setItem(STORAGE_KEYS.tokenExpires, String(data.expiresAt || 0));
            setStatus("Signup complete");
            setShowSettings(false);
        }
        catch (error) {
            setStatus(error.message);
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
            const data = await login(fullPhone, password, deviceId, deviceName, getDeviceInfo());
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
            localStorage.setItem(STORAGE_KEYS.tokenExpires, String(data.expiresAt || 0));
            setAuthSession(data.token, null, data.expiresAt || null);
            if (!signalSupported) {
                setStatus("Encryption requires HTTPS. Please use the secure domain.");
                return;
            }
            const keysExist = await hasLocalKeys(data.username);
            if (!keysExist) {
                setEncryptionReady(false);
                setStatus("Encryption keys missing on this device. Import backup or reset encryption.");
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
            setStatus(data.newDevice
                ? "Login complete. New device detected."
                : "Login complete");
            setShowSettings(false);
        }
        catch (error) {
            setStatus(error.message);
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
            await refreshAdminData(Array.isArray(data.permissions) ? data.permissions : [], data.role || "standard");
        }
        catch (error) {
            setStatus(error.message);
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
        }
        catch (error) {
            setStatus(error.message);
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
                    kind: attachment.kind === "location" ? "file" : attachment.kind,
                    name: attachment.name,
                    data: attachment.data,
                    storageKey: attachment.storageKey,
                    contentType: attachment.contentType
                }))
            });
            setSystemMessage("");
            setSystemMessageAttachments([]);
            setStatus(`System message sent to ${result.sent ?? 0} users`);
        }
        catch (error) {
            setStatus(error.message);
        }
        finally {
            setSystemMessageSending(false);
        }
    };
    const handleSystemMessageMedia = async (event) => {
        const files = Array.from(event.target.files || []).slice(0, Math.max(0, 10 - systemMessageAttachments.length));
        event.target.value = "";
        if (files.length === 0) {
            return;
        }
        setStatus(null);
        setSystemMessageUploading(true);
        try {
            const uploaded = [];
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
                }
                catch (error) {
                    if (file.size > INLINE_ATTACHMENT_LIMIT) {
                        throw error;
                    }
                    const data = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
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
        }
        catch (error) {
            setStatus(error.message || "Media upload failed");
        }
        finally {
            setSystemMessageUploading(false);
        }
    };
    const handleAdminToggle = async (user, key) => {
        setStatus(null);
        try {
            const payload = {
                banned: key === "banned" ? !user.banned : user.banned,
                canSend: key === "canSend" ? !user.canSend : user.canSend,
                canCreate: key === "canCreate" ? !user.canCreate : user.canCreate,
                allowDirect: key === "allowDirect" ? !user.allowDirect : user.allowDirect,
                allowGroupInvite: key === "allowGroupInvite" ? !user.allowGroupInvite : user.allowGroupInvite
            };
            await adminUpdateUserFlags(user.id, payload);
            await refreshAdminData();
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const handleAdminResetPassword = async (userId) => {
        const nextPassword = window.prompt("New password for user:");
        if (!nextPassword) {
            return;
        }
        setStatus(null);
        try {
            await adminResetUserPassword(userId, nextPassword);
            setStatus("Password updated");
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const handleAdminDeleteUser = async (userId) => {
        if (!window.confirm("Delete this user and all data?")) {
            return;
        }
        setStatus(null);
        try {
            await adminDeleteUser(userId);
            await refreshAdminData();
            setStatus("User deleted");
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const handleAdminDeleteConversation = async (conversationId) => {
        if (!window.confirm("Delete this conversation?")) {
            return;
        }
        setStatus(null);
        try {
            await adminDeleteConversation(conversationId);
            await refreshAdminData();
            setStatus("Conversation deleted");
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const handleAdminDownloadMetadata = async (user) => {
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
        }
        catch (error) {
            setStatus(error.message);
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
        }
        catch (error) {
            setStatus(error.message);
        }
        finally {
            setProfileSaving(false);
        }
    };
    const handleResetEncryption = async () => {
        if (!window.confirm("Reset encryption keys on this device? Old messages may become unreadable.")) {
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
        }
        catch (error) {
            setStatus(error.message);
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
                localStorage.setItem(`${STORAGE_KEYS.keyBackupPrefix}${sessionUsername}`, "1");
                setShowKeyBackupWarning(false);
            }
            setStatus("Key backup downloaded.");
        }
        catch (error) {
            setStatus(error.message);
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
        }
        catch (error) {
            setStatus(error.message);
        }
        finally {
            setAdminLockdownPending(false);
        }
    };
    const parseLockdownAllowInput = (value) => Array.from(new Set(value
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isFinite(item) && item > 0)
        .map((item) => Math.floor(item))));
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
        }
        catch (error) {
            setStatus(error.message);
        }
        finally {
            setAdminLockdownSaving(false);
        }
    };
    const toggleLockdownAllowedConversation = (conversationId) => {
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
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const handleAdminSavePermissions = async (adminId) => {
        const permissions = adminPermissionEdits[adminId] || [];
        setStatus(null);
        try {
            await adminUpdateAdminPermissions({ adminId, permissions });
            await refreshAdminData();
            setStatus("Admin permissions updated");
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const toggleNewAdminPermission = (perm) => {
        setNewAdminAccountPermissions((prev) => prev.includes(perm) ? prev.filter((value) => value !== perm) : [...prev, perm]);
    };
    const toggleAdminPermissionEdit = (adminId, perm) => {
        setAdminPermissionEdits((prev) => {
            const base = prev[adminId] ??
                adminAdmins.find((admin) => admin.id === adminId)?.permissions ??
                [];
            const next = base.includes(perm)
                ? base.filter((value) => value !== perm)
                : [...base, perm];
            return { ...prev, [adminId]: next };
        });
    };
    const handleImportKeys = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        setImportingKeys(true);
        setStatus(null);
        try {
            const text = await file.text();
            const parsed = JSON.parse(text);
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
                localStorage.setItem(`${STORAGE_KEYS.keyBackupPrefix}${sessionUsername}`, "1");
                setShowKeyBackupWarning(false);
            }
            setStatus("Key backup imported.");
        }
        catch (error) {
            setStatus(error.message);
        }
        finally {
            setImportingKeys(false);
            event.target.value = "";
        }
    };
    const handleDeviceLogout = async (deviceId) => {
        setStatus(null);
        try {
            await logoutDevice(deviceId);
            const data = await listDevices();
            setDevices(data.devices || []);
            setStatus("Device logged out");
        }
        catch (error) {
            setStatus(error.message);
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
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const handleContactPrivacySave = async () => {
        if (!selectedConversation || selectedConversation.type !== "direct") {
            return;
        }
        const other = selectedConversation.members.find((member) => member.username !== sessionUsername);
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
        }
        catch (error) {
            setStatus(error.message);
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
        }
        catch (error) {
            setStatus(error.message);
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
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const handleAvatarChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setStatus("Avatar too large (max 2MB).");
            return;
        }
        const data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
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
            localStorage.removeItem(`${STORAGE_KEYS.pollCursorPrefix}${sessionUsername}`);
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
            localStorage.setItem(STORAGE_KEYS.tokenExpires, String(data.expiresAt || 0));
        }
        catch (error) {
            setStatus(error.message || "Session expired");
            handleLogout();
        }
    };
    const handleVerifyKey = (username, deviceId = 1) => {
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
    const handleClearVerifiedKey = (username, deviceId = 1) => {
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
    const getCachedKeyBundle = async (username) => {
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
                            const parsed = JSON.parse(verifyRaw);
                            if (parsed.fingerprint === fingerprint) {
                                setVerifiedKeysByUser((prev) => ({
                                    ...prev,
                                    [username]: {
                                        fingerprint,
                                        verifiedAt: parsed.verifiedAt || Date.now()
                                    }
                                }));
                            }
                            else {
                                localStorage.removeItem(verifyKey);
                            }
                        }
                        catch {
                            localStorage.removeItem(verifyKey);
                        }
                    }
                }
                catch {
                    // ignore fingerprint errors
                }
            }
        }
        cache.set(username, { at: now, data });
        return data;
    };
    const buildEncryptedPayloads = async (conversation, envelope, messageId) => {
        let members = conversation.members;
        if (!members.length) {
            const memberData = await fetchMembers(conversation.id);
            members = memberData.members || [];
        }
        const recipients = members.filter((member) => member.username !== sessionUsername);
        if (!signalSupported) {
            throw new Error("Encryption requires HTTPS. Please use the secure domain.");
        }
        const payloads = [];
        if (conversation.type === "direct") {
            for (const member of recipients) {
                const bundle = await getCachedKeyBundle(member.username);
                const devices = bundle.devices || [];
                for (const device of devices) {
                    await ensureSession(sessionUsername, member.username, device);
                    const encrypted = await encryptSignalMessage(sessionUsername, member.username, device.deviceId, JSON.stringify(envelope), device.fallbackPublicKey);
                    payloads.push({
                        messageId,
                        toUsername: member.username,
                        toDeviceId: String(device.sessionDeviceId ?? device.deviceId),
                        ciphertext: encrypted.ciphertext,
                        nonce: encrypted.nonce
                    });
                }
            }
        }
        else {
            const recipientDevices = [];
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
                const encrypted = await encryptSignalMessage(sessionUsername, device.username, device.bundle.deviceId, JSON.stringify(envelope), device.bundle.fallbackPublicKey);
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
                const encrypted = await encryptSignalMessage(sessionUsername, sessionUsername, selfBundle.deviceId, JSON.stringify(envelope), selfBundle.fallbackPublicKey);
                payloads.push({
                    messageId,
                    toUsername: sessionUsername,
                    toDeviceId: getDeviceId(),
                    ciphertext: encrypted.ciphertext,
                    nonce: encrypted.nonce
                });
            }
        }
        catch {
            // ignore self-encrypted copy failures
        }
        return payloads;
    };
    const computeOutboxBackoff = (attempts) => {
        const base = 1500;
        return Math.min(30000, base * Math.pow(2, Math.min(attempts, 5)));
    };
    const setOutboxStatus = (groupId, status, attempts, lastError) => {
        setOutboxStatusByGroupId((prev) => ({
            ...prev,
            [groupId]: { status, attempts, lastError }
        }));
    };
    const clearOutboxStatus = (groupId) => {
        setOutboxStatusByGroupId((prev) => {
            if (!prev[groupId]) {
                return prev;
            }
            const next = { ...prev };
            delete next[groupId];
            return next;
        });
    };
    const sendPayloadNow = async (conversation, payload) => {
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
        }
        catch (error) {
            const retryDelay = computeOutboxBackoff(0);
            const queuedItem = {
                id: `outbox-${messageId}`,
                conversationId: conversation.id,
                payload,
                messageId,
                createdAt: Date.now(),
                attempts: 0,
                nextAttemptAt: Date.now() + retryDelay,
                lastError: error.message || "send failed"
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
            setStatus("Encryption keys missing. Import backup or reset encryption before sending.");
            return;
        }
        const conversation = conversations.find((item) => item.id === selectedConversationId);
        if (!conversation) {
            return;
        }
        setStatus(null);
        try {
            const safeText = sanitizeText(messageText);
            const riskScore = spamScore(safeText);
            if (conversation.type !== "direct" &&
                riskScore >= 6 &&
                !window.confirm("This message looks spammy. Send anyway?")) {
                return;
            }
            const payload = {
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
                }
                catch {
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
                const payloads = await buildEncryptedPayloads(conversation, envelope, messageId);
                if (payloads.length === 0) {
                    setStatus("No recipients available in this conversation.");
                    return;
                }
                await scheduleMessage(conversation.id, scheduleFor, payloads);
                setStatus(`Message scheduled for ${new Date(scheduleFor).toLocaleString()}.`);
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
        }
        catch (error) {
            setStatus(error.message);
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
        const before = historyCursorByConversation[conversationId] ??
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
            const decrypted = [];
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
                        plaintext = await decryptSignalMessage(sessionUsername, msg.sender_username, Number(msg.sender_device_id) || 1, msg.ciphertext, msg.nonce);
                    }
                    else {
                        plaintext = msg.ciphertext;
                    }
                    const envelope = parseSignalEnvelope(plaintext);
                    if (envelope?.kind === "sender-key") {
                        continue;
                    }
                    const payload = envelope?.kind === "chat"
                        ? envelope.payload
                        : parsePayload(plaintext);
                    if (settingsPrefs.data.cacheMessages) {
                        cacheEncryptedMessages(sessionUsername, [msg]).catch(() => undefined);
                        cacheDecryptedMessage(sessionUsername, msg.id, plaintext, msg).catch(() => undefined);
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
                }
                catch (error) {
                    const now = Date.now();
                    if (now - decryptReportRef.current > 15000) {
                        decryptReportRef.current = now;
                        reportDecryptFailure({
                            error: error.message,
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
        }
        catch (error) {
            setStatus(error.message);
        }
        finally {
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
        const hasMessagesForConversation = messages.some((message) => message.conversationId === selectedConversationId);
        if (hasMessagesForConversation) {
            initialHistoryLoadedRef.current.add(selectedConversationId);
            return;
        }
        initialHistoryLoadedRef.current.add(selectedConversationId);
        loadOlderMessages().catch(() => {
            initialHistoryLoadedRef.current.delete(selectedConversationId);
        });
    }, [isLoggedIn, selectedConversationId, sessionUsername, messages.length]);
    const handleForwardSelect = (message) => {
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
            setStatus("Encryption keys missing. Import backup or reset encryption before sending.");
            return;
        }
        const conversation = conversations.find((item) => item.id === forwardTargetId);
        if (!conversation) {
            return;
        }
        setStatus(null);
        try {
            const payload = {
                ...pendingForwardMessage.payload,
                forwardedFrom: pendingForwardMessage.sender
            };
            const envelope = { kind: "chat", payload };
            const messageId = crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`;
            const payloads = await buildEncryptedPayloads(conversation, envelope, messageId);
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
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const requestCurrentPosition = () => new Promise((resolve, reject) => {
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
    const buildLocationAttachment = (position, options) => {
        const payload = {
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
    const sendLocationPayload = async (conversation, attachment, oneTime) => {
        const payload = {
            text: "",
            attachments: [attachment],
            oneTime,
            linkPreview: null
        };
        await sendPayloadNow(conversation, payload);
    };
    const stopLiveLocationShare = (showStatus) => {
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
            setStatus("Encryption keys missing. Import backup or reset encryption before sending.");
            return;
        }
        const conversation = conversations.find((item) => item.id === selectedConversationId);
        if (!conversation) {
            return;
        }
        setStatus(null);
        try {
            const initialPosition = await requestCurrentPosition();
            const liveId = crypto.randomUUID
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random()}`;
            const expiresAt = Date.now() + LIVE_LOCATION_DURATION_MINUTES * 60 * 1000;
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
            liveLocationWatchRef.current = navigator.geolocation.watchPosition(async (position) => {
                if (!liveLocationActiveRef.current) {
                    return;
                }
                if (Date.now() > expiresAt) {
                    stopLiveLocationShare(false);
                    return;
                }
                if (Date.now() - liveLocationLastSentRef.current <
                    LIVE_LOCATION_THROTTLE_MS) {
                    return;
                }
                const updateAttachment = buildLocationAttachment(position, {
                    live: true,
                    liveId,
                    expiresAt
                });
                try {
                    const activeConversationId = liveLocationConversationRef.current;
                    const activeConversation = conversations.find((item) => item.id === activeConversationId);
                    if (!activeConversation) {
                        return;
                    }
                    await sendLocationPayload(activeConversation, updateAttachment, false);
                    liveLocationLastSentRef.current = Date.now();
                }
                catch {
                    // ignore live update failures
                }
            }, (error) => {
                setStatus(error.message || "Live location failed.");
                stopLiveLocationShare(false);
            }, {
                enableHighAccuracy: true,
                maximumAge: 10000,
                timeout: 12000
            });
            liveLocationTimerRef.current = window.setTimeout(() => {
                stopLiveLocationShare(false);
            }, expiresAt - Date.now());
        }
        catch (error) {
            setStatus(error.message);
            stopLiveLocationShare(false);
        }
    };
    const handleSendLocation = async () => {
        if (!selectedConversationId) {
            return;
        }
        if (!encryptionReady) {
            setStatus("Encryption keys missing. Import backup or reset encryption before sending.");
            return;
        }
        const conversation = conversations.find((item) => item.id === selectedConversationId);
        if (!conversation) {
            return;
        }
        setStatus(null);
        try {
            const position = await requestCurrentPosition();
            const attachment = buildLocationAttachment(position, { live: false });
            await sendLocationPayload(conversation, attachment, oneTimeMode);
        }
        catch (error) {
            setStatus(error.message);
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
                forwardEnabled: forwardRulesByConversation[selectedConversationId] ?? true,
                quietHours: quiet
                    ? {
                        enabled: Boolean(quiet.enabled),
                        start: quiet.start,
                        end: quiet.end
                    }
                    : null
            });
            setStatus("Conversation settings saved.");
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const pushSettingsPage = (page) => {
        setSettingsStack((prev) => [...prev, page]);
    };
    const popSettingsPage = () => {
        setSettingsStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
    };
    const updatePrefs = (section, key, value) => {
        setSettingsPrefs((prev) => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };
    const renderSettingsPage = () => {
        const notificationToggles = [
            { key: "privateChats", title: "Private chats" },
            { key: "groups", title: "Group notifications" },
            { key: "channels", title: "Channel notifications" },
            { key: "inAppSounds", title: "In-app sounds" },
            { key: "vibration", title: "Vibration" },
            { key: "messagePreview", title: "Message preview" },
            { key: "callNotifications", title: "Call notifications" }
        ];
        const dataToggles = [
            { key: "autoDownloadWifi", title: "Auto-download over Wi-Fi" },
            { key: "autoDownloadMobile", title: "Auto-download over mobile" },
            { key: "saveToGallery", title: "Save to gallery" },
            { key: "streaming", title: "Streaming media" }
        ];
        const chatToggles = [
            { key: "enterToSend", title: "Enter to send" },
            { key: "swipeGestures", title: "Swipe gestures" },
            { key: "chatFolders", title: "Chat folders" },
            { key: "archivedChats", title: "Archived chats" },
            { key: "pinnedChats", title: "Pinned chats" },
            { key: "chatPreview", title: "Chat previews" },
            { key: "allowMentionsDuringQuiet", title: "Allow mentions during quiet hours" }
        ];
        const stickerToggles = [
            { key: "animatedEmoji", title: "Animated emoji" },
            { key: "stickerSets", title: "Sticker sets" },
            { key: "trending", title: "Trending stickers" },
            { key: "reactions", title: "Emoji reactions" }
        ];
        const advancedToggles = [
            { key: "developerMode", title: "Developer mode" },
            { key: "debugLogs", title: "Debug logs" },
            { key: "experimental", title: "Experimental features" }
        ];
        switch (settingsPage) {
            case "root":
                return (_jsxs("div", { className: "settings-root", children: [_jsxs("button", { className: "settings-profile-card", onClick: () => pushSettingsPage("account"), children: [_jsx("div", { className: "avatar large", children: profileState.avatar ? (_jsx("img", { src: profileState.avatar, alt: sessionUsername })) : (_jsx("span", { children: getInitials(sessionUsername) })) }), _jsxs("div", { className: "settings-profile-text", children: [_jsx("div", { className: "settings-profile-name", children: displayName }), _jsxs("div", { className: "settings-profile-sub", children: ["@", sessionUsername] })] }), _jsx("span", { className: "settings-chevron", children: ">" })] }), _jsxs("div", { className: "settings-section-block", children: [_jsx(SettingsItem, { title: "Account", subtitle: "Profile, username, devices", onClick: () => pushSettingsPage("account"), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Privacy & Security", subtitle: "Last seen, blocking, 2FA", onClick: () => pushSettingsPage("privacy"), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Notifications & Sounds", subtitle: "Chat alerts and previews", onClick: () => pushSettingsPage("notifications"), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Data and Storage", subtitle: "Media auto-download and cache", onClick: () => pushSettingsPage("data"), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Appearance", subtitle: "Theme, accent, bubbles", onClick: () => pushSettingsPage("appearance"), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Language", subtitle: "App language and region", onClick: () => pushSettingsPage("language"), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Chat Settings", subtitle: "Enter to send, chat previews", onClick: () => pushSettingsPage("chat"), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Stickers & Emoji", subtitle: "Reactions and animated emoji", onClick: () => pushSettingsPage("stickers"), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Advanced", subtitle: "Encryption and experimental tools", onClick: () => pushSettingsPage("advanced"), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "About", subtitle: "Version, policies, support", onClick: () => pushSettingsPage("about"), right: _jsx("span", { className: "settings-chevron", children: ">" }) })] })] }));
            case "account":
                return (_jsxs("div", { className: "settings-subpage", children: [_jsxs("div", { className: "settings-card", children: [_jsxs("div", { className: "settings-avatar-row", children: [_jsx("div", { className: "avatar large", children: profileState.avatar ? (_jsx("img", { src: profileState.avatar, alt: "avatar" })) : (_jsx("span", { children: getInitials(sessionUsername) })) }), _jsxs("div", { className: "settings-avatar-actions", children: [_jsxs("label", { className: "file-input small", children: ["Change photo", _jsx("input", { type: "file", accept: "image/*", onChange: handleAvatarChange })] }), _jsx("button", { className: "secondary", onClick: handleClearAvatar, children: "Remove" })] })] }), _jsxs("div", { className: "settings-field-grid", children: [_jsxs("label", { className: "settings-field", children: ["First name", _jsx("input", { value: profileIdentity.firstName, onChange: (event) => setProfileIdentity((prev) => ({
                                                        ...prev,
                                                        firstName: event.target.value
                                                    })) })] }), _jsxs("label", { className: "settings-field", children: ["Last name", _jsx("input", { value: profileIdentity.lastName, onChange: (event) => setProfileIdentity((prev) => ({
                                                        ...prev,
                                                        lastName: event.target.value
                                                    })) })] })] }), _jsxs("label", { className: "settings-field", children: ["Username", _jsx("input", { value: `@${sessionUsername}`, readOnly: true })] }), _jsxs("label", { className: "settings-field", children: ["Bio", _jsx("textarea", { value: profileState.bio, onChange: (event) => setProfileState((prev) => ({
                                                ...prev,
                                                bio: event.target.value
                                            })), placeholder: "Tell people about you" })] }), _jsxs("label", { className: "settings-field", children: ["Phone number", _jsx("input", { value: profileIdentity.phone || "Not set", readOnly: true })] }), _jsxs("div", { className: "settings-actions", children: [_jsx("button", { onClick: handleProfileSave, disabled: profileSaving, children: profileSaving ? "Saving..." : "Save changes" }), _jsx("button", { className: "secondary", onClick: () => setStatus("Number change requires OTP verification."), children: "Change number" })] })] }), _jsxs("div", { className: "settings-section-block", children: [_jsx("h4", { children: "Devices" }), _jsxs("div", { className: "settings-card", children: [devicesLoading && _jsx("p", { className: "muted", children: "Loading devices..." }), !devicesLoading && devices.length === 0 && (_jsx("p", { className: "muted", children: "No active devices found." })), devices.map((device) => (_jsxs("div", { className: "device-item", children: [_jsxs("div", { children: [_jsx("strong", { children: device.deviceName }), _jsxs("div", { className: "muted", children: [device.ip, " - Last seen", " ", new Date(device.lastSeenAt).toLocaleString()] })] }), _jsx("div", { className: "row", children: device.current ? (_jsx("span", { className: "badge", children: "This device" })) : (_jsx("button", { className: "secondary", onClick: () => handleDeviceLogout(device.deviceId), children: "Log out" })) })] }, device.deviceId)))] }), _jsx("button", { className: "danger", onClick: handleLogoutAllDevices, children: "Terminate all sessions" }), _jsx("button", { className: "danger ghost", onClick: () => setStatus("Account deletion requires admin approval."), children: "Delete account" })] })] }));
            case "privacy":
                return (_jsxs("div", { className: "settings-subpage", children: [_jsxs("div", { className: "settings-section-block", children: [_jsx("h4", { children: "Privacy" }), _jsx(SettingsItem, { title: "Last seen & online", subtitle: profileState.privacy.hide_online ||
                                        profileState.privacy.hide_last_seen
                                        ? "Hidden"
                                        : "Visible", right: _jsx(SettingsToggle, { checked: !profileState.privacy.hide_online, onChange: (value) => setProfileState((prev) => ({
                                            ...prev,
                                            privacy: {
                                                ...prev.privacy,
                                                hide_online: !value,
                                                hide_last_seen: !value
                                            }
                                        })) }) }), _jsx(SettingsItem, { title: "Profile photo visibility", subtitle: profileState.privacy.hide_profile_photo ? "Nobody" : "Everyone", right: _jsx(SettingsToggle, { checked: !profileState.privacy.hide_profile_photo, onChange: (value) => setProfileState((prev) => ({
                                            ...prev,
                                            privacy: {
                                                ...prev.privacy,
                                                hide_profile_photo: !value
                                            }
                                        })) }) }), _jsx(SettingsItem, { title: "Bio visibility", subtitle: profileState.profilePublic ? "Public" : "Private", right: _jsx(SettingsToggle, { checked: profileState.profilePublic, onChange: (value) => setProfileState((prev) => ({
                                            ...prev,
                                            profilePublic: value
                                        })) }) }), _jsx(SettingsItem, { title: "Read receipts", subtitle: profileState.privacy.disable_read_receipts ? "Off" : "On", right: _jsx(SettingsToggle, { checked: !profileState.privacy.disable_read_receipts, onChange: (value) => setProfileState((prev) => ({
                                            ...prev,
                                            privacy: {
                                                ...prev.privacy,
                                                disable_read_receipts: !value
                                            }
                                        })) }) }), _jsx(SettingsItem, { title: "Typing indicator", subtitle: profileState.privacy.disable_typing_indicator ? "Off" : "On", right: _jsx(SettingsToggle, { checked: !profileState.privacy.disable_typing_indicator, onChange: (value) => setProfileState((prev) => ({
                                            ...prev,
                                            privacy: {
                                                ...prev.privacy,
                                                disable_typing_indicator: !value
                                            }
                                        })) }) }), _jsx(SettingsItem, { title: "Who can message me", subtitle: profileState.allowDirect ? "Everyone" : "Contacts", right: _jsx(SettingsToggle, { checked: profileState.allowDirect, onChange: (value) => setProfileState((prev) => ({
                                            ...prev,
                                            allowDirect: value
                                        })) }) }), _jsx(SettingsItem, { title: "Who can add me to groups", subtitle: profileState.allowGroupInvite ? "Everyone" : "Contacts", right: _jsx(SettingsToggle, { checked: profileState.allowGroupInvite, onChange: (value) => setProfileState((prev) => ({
                                            ...prev,
                                            allowGroupInvite: value
                                        })) }) })] }), _jsxs("div", { className: "settings-section-block", children: [_jsx("h4", { children: "Security" }), _jsxs("div", { className: "settings-card", children: [_jsxs("label", { className: "settings-field", children: [twoFactorEnabled
                                                    ? "Current 2FA password"
                                                    : "New 2FA password", _jsx("input", { type: "password", value: twoFactorPassword, onChange: (event) => setTwoFactorPassword(event.target.value), placeholder: "min 6 characters" })] }), _jsxs("div", { className: "settings-actions", children: [twoFactorEnabled ? (_jsx("button", { className: "secondary", onClick: handleDisableTwoFactor, children: "Disable 2FA" })) : (_jsx("button", { onClick: handleEnableTwoFactor, children: "Enable 2FA" })), _jsx("button", { className: "secondary", onClick: () => setStatus("Security alerts are not configured yet."), children: "Security alerts" })] })] }), _jsx(SettingsItem, { title: "Blocked users", subtitle: "Manage block list", onClick: () => setStatus("Blocked users list is empty."), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Passcode lock", subtitle: "Requires device support", onClick: () => setStatus("Passcode lock is not available yet."), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Safety center", subtitle: "Reports, restrictions, and blocked users", onClick: () => setStatus("No safety reports available yet."), right: _jsx("span", { className: "settings-chevron", children: ">" }) })] })] }));
            case "notifications":
                return (_jsx("div", { className: "settings-subpage", children: _jsxs("div", { className: "settings-section-block", children: [_jsx("h4", { children: "Notifications" }), _jsx(SettingsItem, { title: "Browser notifications", subtitle: typeof Notification === "undefined"
                                    ? "Unavailable"
                                    : Notification.permission === "granted"
                                        ? "Enabled"
                                        : Notification.permission === "denied"
                                            ? "Blocked"
                                            : "Not enabled", onClick: () => {
                                    if (typeof Notification === "undefined") {
                                        return;
                                    }
                                    Notification.requestPermission().catch(() => undefined);
                                }, right: _jsx("span", { className: "settings-chevron", children: ">" }) }), notificationToggles.map((item) => (_jsx(SettingsItem, { title: item.title, right: _jsx(SettingsToggle, { checked: settingsPrefs.notifications[item.key], onChange: (value) => updatePrefs("notifications", item.key, value) }) }, item.key)))] }) }));
            case "data":
                return (_jsx("div", { className: "settings-subpage", children: _jsxs("div", { className: "settings-section-block", children: [_jsx("h4", { children: "Storage" }), dataToggles.map((item) => (_jsx(SettingsItem, { title: item.title, right: _jsx(SettingsToggle, { checked: settingsPrefs.data[item.key], onChange: (value) => updatePrefs("data", item.key, value) }) }, item.key))), _jsx(SettingsItem, { title: "Cache usage", subtitle: cacheStats
                                    ? `${cacheStats.messages} messages - ${cacheStats.media} media - ${formatBytes(cacheStats.bytes)}`
                                    : "Calculating...", right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Offline message cache", subtitle: "Store encrypted messages on this device", right: _jsx(SettingsToggle, { checked: settingsPrefs.data.cacheMessages, onChange: (value) => updatePrefs("data", "cacheMessages", value) }) }), _jsx(SettingsItem, { title: "Cache decrypted media", subtitle: "Stores media previews locally for faster browsing", right: _jsx(SettingsToggle, { checked: settingsPrefs.data.cacheMedia, onChange: (value) => updatePrefs("data", "cacheMedia", value) }) }), _jsx(SettingsItem, { title: "Message cache retention", subtitle: `${settingsPrefs.data.cacheTtlDays} days`, onClick: () => updatePrefs("data", "cacheTtlDays", settingsPrefs.data.cacheTtlDays === 7
                                    ? 30
                                    : settingsPrefs.data.cacheTtlDays === 30
                                        ? 90
                                        : 7), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Message cache size", subtitle: `${settingsPrefs.data.cacheMaxMessages} messages`, onClick: () => updatePrefs("data", "cacheMaxMessages", settingsPrefs.data.cacheMaxMessages === 500
                                    ? 2000
                                    : settingsPrefs.data.cacheMaxMessages === 2000
                                        ? 5000
                                        : 500), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Media cache retention", subtitle: `${settingsPrefs.data.cacheMediaTtlDays} days`, onClick: () => updatePrefs("data", "cacheMediaTtlDays", settingsPrefs.data.cacheMediaTtlDays === 7
                                    ? 30
                                    : settingsPrefs.data.cacheMediaTtlDays === 30
                                        ? 90
                                        : 7), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Media cache size", subtitle: `${settingsPrefs.data.cacheMediaMax} items`, onClick: () => updatePrefs("data", "cacheMediaMax", settingsPrefs.data.cacheMediaMax === 200
                                    ? 800
                                    : settingsPrefs.data.cacheMediaMax === 800
                                        ? 2000
                                        : 200), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Keep media for", subtitle: `${settingsPrefs.data.keepMediaDays} days`, onClick: () => setSettingsPrefs((prev) => ({
                                    ...prev,
                                    data: {
                                        ...prev.data,
                                        keepMediaDays: prev.data.keepMediaDays === 30 ? 7 : 30
                                    }
                                })), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Clear cache", subtitle: "Remove local cached data", onClick: handleClearCache, right: _jsx("span", { className: "settings-chevron", children: ">" }) })] }) }));
            case "appearance":
                return (_jsx("div", { className: "settings-subpage", children: _jsxs("div", { className: "settings-section-block", children: [_jsx("h4", { children: "Theme" }), _jsx("div", { className: "settings-card", children: _jsx("div", { className: "settings-choice-row", children: ["light", "dark", "system"].map((mode) => (_jsx("button", { className: settingsPrefs.appearance.themeMode === mode
                                            ? "choice active"
                                            : "choice", onClick: () => updatePrefs("appearance", "themeMode", mode), children: mode }, mode))) }) }), _jsx("h4", { children: "Accent color" }), _jsx("div", { className: "settings-card", children: _jsx("div", { className: "settings-choice-row", children: ["teal", "blue", "green", "amber"].map((accent) => (_jsx("button", { className: settingsPrefs.appearance.accent === accent
                                            ? "choice active"
                                            : "choice", onClick: () => updatePrefs("appearance", "accent", accent), children: accent }, accent))) }) }), _jsx(SettingsItem, { title: "Chat bubble style", subtitle: settingsPrefs.appearance.bubble, onClick: () => updatePrefs("appearance", "bubble", settingsPrefs.appearance.bubble === "rounded"
                                    ? "classic"
                                    : "rounded"), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Font size", subtitle: settingsPrefs.appearance.fontSize, onClick: () => updatePrefs("appearance", "fontSize", settingsPrefs.appearance.fontSize === "medium"
                                    ? "large"
                                    : settingsPrefs.appearance.fontSize === "large"
                                        ? "small"
                                        : "medium"), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Animations", right: _jsx(SettingsToggle, { checked: settingsPrefs.appearance.animations, onChange: (value) => updatePrefs("appearance", "animations", value) }) })] }) }));
            case "language":
                return (_jsx("div", { className: "settings-subpage", children: _jsxs("div", { className: "settings-section-block", children: [_jsx(SettingsItem, { title: "App language", subtitle: settingsPrefs.language.app.toUpperCase(), onClick: () => updatePrefs("language", "app", settingsPrefs.language.app === "auto"
                                    ? "fa"
                                    : settingsPrefs.language.app === "fa"
                                        ? "en"
                                        : "auto"), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), _jsx(SettingsItem, { title: "Right-to-left layout", right: _jsx(SettingsToggle, { checked: settingsPrefs.language.rtl, onChange: (value) => updatePrefs("language", "rtl", value) }) }), _jsx(SettingsItem, { title: "Region formatting", subtitle: settingsPrefs.language.region.toUpperCase(), onClick: () => updatePrefs("language", "region", settingsPrefs.language.region === "auto"
                                    ? "ir"
                                    : settingsPrefs.language.region === "ir"
                                        ? "eu"
                                        : settingsPrefs.language.region === "eu"
                                            ? "us"
                                            : "auto"), right: _jsx("span", { className: "settings-chevron", children: ">" }) })] }) }));
            case "chat":
                return (_jsx("div", { className: "settings-subpage", children: _jsxs("div", { className: "settings-section-block", children: [chatToggles.map((item) => (_jsx(SettingsItem, { title: item.title, subtitle: item.key === "enterToSend"
                                    ? settingsPrefs.chat.enterToSend
                                        ? "On"
                                        : "Off"
                                    : undefined, right: _jsx(SettingsToggle, { checked: settingsPrefs.chat[item.key], onChange: (value) => updatePrefs("chat", item.key, value) }) }, item.key))), _jsx(SettingsItem, { title: "One-time messages", subtitle: oneTimeMode ? "Enabled" : "Disabled", right: _jsx(SettingsToggle, { checked: oneTimeMode, onChange: (value) => setOneTimeMode(value) }) }), _jsxs("div", { className: "settings-card", children: [_jsx("h4", { children: "Quick replies" }), _jsxs("div", { className: "row", children: [_jsx("input", { value: newQuickReply, onChange: (event) => setNewQuickReply(event.target.value), placeholder: "Add a quick reply" }), _jsx("button", { onClick: () => {
                                                    const value = newQuickReply.trim();
                                                    if (!value) {
                                                        return;
                                                    }
                                                    setQuickReplies((prev) => [...prev, value].slice(0, 20));
                                                    setNewQuickReply("");
                                                }, children: "Add" })] }), _jsxs("div", { className: "quick-replies", children: [quickReplies.length === 0 && (_jsx("span", { className: "muted", children: "No quick replies yet." })), quickReplies.map((reply, index) => (_jsx("button", { className: "secondary", onClick: () => setQuickReplies((prev) => prev.filter((_, idx) => idx !== index)), children: reply }, `qr-${index}`)))] })] })] }) }));
            case "stickers":
                return (_jsx("div", { className: "settings-subpage", children: _jsxs("div", { className: "settings-section-block", children: [_jsx(SettingsItem, { title: "Emoji style", subtitle: settingsPrefs.stickers.emojiStyle, onClick: () => updatePrefs("stickers", "emojiStyle", settingsPrefs.stickers.emojiStyle === "native"
                                    ? "apple"
                                    : settingsPrefs.stickers.emojiStyle === "apple"
                                        ? "google"
                                        : "native"), right: _jsx("span", { className: "settings-chevron", children: ">" }) }), stickerToggles.map((item) => (_jsx(SettingsItem, { title: item.title, right: _jsx(SettingsToggle, { checked: Boolean(settingsPrefs.stickers[item.key]), onChange: (value) => updatePrefs("stickers", item.key, value) }) }, item.key)))] }) }));
            case "advanced":
                return (_jsx("div", { className: "settings-subpage", children: _jsxs("div", { className: "settings-section-block", children: [_jsx("h4", { children: "Encryption" }), _jsxs("div", { className: "settings-card", children: [_jsxs("div", { className: "row", children: [_jsx("button", { className: "secondary", onClick: handleExportKeys, children: "Export keys" }), _jsxs("label", { className: "file-input secondary", children: ["Import keys", _jsx("input", { type: "file", accept: "application/json", onChange: handleImportKeys, disabled: importingKeys })] })] }), _jsx("button", { className: "danger", onClick: handleResetEncryption, children: "Reset encryption keys" })] }), _jsx("h4", { children: "Experimental" }), advancedToggles.map((item) => (_jsx(SettingsItem, { title: item.title, right: _jsx(SettingsToggle, { checked: Boolean(settingsPrefs.advanced[item.key]), onChange: (value) => updatePrefs("advanced", item.key, value) }) }, item.key))), _jsxs("div", { className: "settings-card", children: [_jsx("h4", { children: "Auto-translate" }), _jsx(SettingsItem, { title: "Translate incoming messages", right: _jsx(SettingsToggle, { checked: settingsPrefs.advanced.autoTranslate, onChange: (value) => updatePrefs("advanced", "autoTranslate", value) }) }), _jsxs("label", { children: ["Translation endpoint", _jsx("input", { value: settingsPrefs.advanced.translationEndpoint, onChange: (event) => updatePrefs("advanced", "translationEndpoint", event.target.value), placeholder: "https://your-translation-service" })] })] }), _jsx(SettingsItem, { title: "Reset local data", subtitle: "Clears local settings cache", danger: true, onClick: () => {
                                    localStorage.removeItem(`${STORAGE_KEYS.settingsUiPrefix}${sessionUsername}`);
                                    setSettingsPrefs(DEFAULT_PREFS);
                                    setStatus("Local settings reset.");
                                }, right: _jsx("span", { className: "settings-chevron", children: ">" }) })] }) }));
            case "about":
                return (_jsx("div", { className: "settings-subpage", children: _jsxs("div", { className: "settings-section-block", children: [_jsx(SettingsItem, { title: "App version", subtitle: "0.1.0" }), _jsx(SettingsItem, { title: "Terms of service", subtitle: "Review" }), _jsx(SettingsItem, { title: "Privacy policy", subtitle: "Review" }), _jsx(SettingsItem, { title: "FAQ", subtitle: "Common questions" }), _jsx(SettingsItem, { title: "Contact support", subtitle: "support@local" }), _jsx(SettingsItem, { title: "Open-source licenses", subtitle: "View" })] }) }));
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
            const usernames = Array.from(new Set((feedRes.items || []).map((item) => item.author.username)));
            if (usernames.length > 0) {
                const updates = {};
                await Promise.all(usernames.map(async (name) => {
                    try {
                        const status = await fetchUserStatus(name);
                        updates[name] = status;
                    }
                    catch {
                        updates[name] = { online: false, lastSeen: null };
                    }
                }));
                setStatusByUser((prev) => ({ ...prev, ...updates }));
            }
        }
        catch (error) {
            setSocialError(error.message);
        }
        finally {
            setSocialLoading(false);
        }
    };
    const handleSocialMediaChange = (event) => {
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
        }
        catch (error) {
            setSocialError(error.message);
        }
        finally {
            setSocialPublishing(false);
        }
    };
    const handleSocialLike = async (postId) => {
        try {
            const result = await toggleSocialLike(postId);
            setSocialFeed((prev) => prev.map((item) => item.post.id === postId
                ? {
                    ...item,
                    counts: { ...item.counts, likes: result.count },
                    viewer: { ...item.viewer, liked: result.liked }
                }
                : item));
        }
        catch (error) {
            setSocialError(error.message);
        }
    };
    const handleSocialSave = async (postId) => {
        try {
            const result = await toggleSocialSave(postId);
            setSocialFeed((prev) => prev.map((item) => item.post.id === postId
                ? {
                    ...item,
                    counts: { ...item.counts, saves: result.count },
                    viewer: { ...item.viewer, saved: result.saved }
                }
                : item));
            if (result.saved) {
                const targetCollection = socialActiveCollection.trim() || "Saved";
                addPostToCollection(targetCollection, postId);
            }
            else {
                removePostFromCollections(postId);
            }
        }
        catch (error) {
            setSocialError(error.message);
        }
    };
    const handleSocialView = async (postId) => {
        try {
            const result = await addSocialView(postId);
            setSocialFeed((prev) => prev.map((item) => item.post.id === postId
                ? {
                    ...item,
                    counts: { ...item.counts, views: result.views }
                }
                : item));
        }
        catch (error) {
            setSocialError(error.message);
        }
    };
    const handleSocialCommentsOpen = async (postId) => {
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
        }
        catch (error) {
            setSocialError(error.message);
        }
    };
    const handleSocialCommentSend = async (postId) => {
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
            setSocialFeed((prev) => prev.map((item) => item.post.id === postId
                ? {
                    ...item,
                    counts: { ...item.counts, comments: item.counts.comments + 1 }
                }
                : item));
            setCommentDraft("");
        }
        catch (error) {
            setSocialError(error.message);
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
        }
        catch (error) {
            setSocialError(error.message);
        }
    };
    const handleSocialShare = async (url) => {
        try {
            await navigator.clipboard.writeText(url);
            setStatus("Copied share link.");
        }
        catch {
            setStatus("Unable to copy link.");
        }
    };
    const addPostToCollection = (name, postId) => {
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
    const removePostFromCollections = (postId) => {
        setSocialCollections((prev) => {
            const next = {};
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
    const togglePinnedPost = (postId) => {
        setSocialPinnedIds((prev) => {
            const next = new Set(prev);
            if (next.has(postId)) {
                next.delete(postId);
            }
            else {
                next.add(postId);
            }
            return next;
        });
    };
    const handleSocialFollow = async (usernameToFollow, isFollowing) => {
        try {
            if (isFollowing) {
                await unfollowSocialUser(usernameToFollow);
                setFollowingUsers((prev) => {
                    const next = new Set(prev);
                    next.delete(usernameToFollow);
                    return next;
                });
            }
            else {
                await followSocialUser(usernameToFollow);
                setFollowingUsers((prev) => {
                    const next = new Set(prev);
                    next.add(usernameToFollow);
                    return next;
                });
            }
        }
        catch (error) {
            setSocialError(error.message);
        }
    };
    const handleCreateConversation = async () => {
        setStatus(null);
        try {
            if (tab === "direct") {
                await createConversation("direct", null, [directUsername]);
                setDirectUsername("");
            }
            else if (tab === "group" || tab === "channel") {
                const members = groupMembers
                    .split(",")
                    .map((item) => item.trim())
                    .filter(Boolean);
                const membersToSend = groupVisibility === "private" ? [] : members;
                await createConversation(tab, groupName, membersToSend, groupVisibility);
                setGroupName("");
                setGroupMembers("");
                setGroupVisibility("public");
            }
            else {
                setStatus("Select a conversation type first.");
                return;
            }
            await refreshConversations();
            setStatus("Conversation created");
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const uploadWithProgress = (url, method, headers, body, onProgress) => new Promise((resolve, reject) => {
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
    const processUploadQueue = async (items) => {
        for (const item of items) {
            setUploadQueue((prev) => prev.map((entry) => entry.id === item.id
                ? { ...entry, status: "uploading", progress: 0, error: undefined }
                : entry));
            const safeName = sanitizeFilename(item.file.name || "attachment");
            const contentType = normalizeContentType(item.file.type || "");
            try {
                const directResult = await uploadWithProgress(`${API_BASE}/api/uploads/direct`, "POST", {}, (() => {
                    const form = new FormData();
                    form.append("file", item.file);
                    return form;
                })(), (progress) => setUploadQueue((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, progress } : entry)));
                if (directResult.status >= 200 && directResult.status < 300) {
                    const parsed = JSON.parse(directResult.responseText);
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
                    setUploadQueue((prev) => prev.map((entry) => entry.id === item.id
                        ? { ...entry, status: "done", progress: 100 }
                        : entry));
                    continue;
                }
                throw new Error("direct upload failed");
            }
            catch {
                try {
                    const upload = await createUpload({
                        filename: safeName,
                        contentType,
                        size: item.file.size
                    });
                    const presignedResult = await uploadWithProgress(upload.url, upload.method || "PUT", upload.headers || {}, item.file, (progress) => setUploadQueue((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, progress } : entry)));
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
                        setUploadQueue((prev) => prev.map((entry) => entry.id === item.id
                            ? { ...entry, status: "done", progress: 100 }
                            : entry));
                        continue;
                    }
                    throw new Error("presigned upload failed");
                }
                catch {
                    if (item.file.size > INLINE_ATTACHMENT_LIMIT) {
                        setUploadQueue((prev) => prev.map((entry) => entry.id === item.id
                            ? {
                                ...entry,
                                status: "failed",
                                error: "Large file requires storage config."
                            }
                            : entry));
                        continue;
                    }
                }
            }
            const data = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
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
            setUploadQueue((prev) => prev.map((entry) => entry.id === item.id
                ? { ...entry, status: "done", progress: 100 }
                : entry));
        }
    };
    const retryUpload = async (id) => {
        const target = uploadQueue.find((item) => item.id === id);
        if (!target) {
            return;
        }
        await processUploadQueue([target]);
    };
    const handleAttachmentChange = async (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) {
            return;
        }
        const queuedItems = Array.from(files).map((file) => ({
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            file,
            name: sanitizeFilename(file.name || "attachment"),
            progress: 0,
            status: "queued"
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
    const handleTogglePinned = (messageId) => {
        setPinnedIds((prev) => {
            const next = new Set(prev);
            if (next.has(messageId)) {
                next.delete(messageId);
            }
            else {
                next.add(messageId);
            }
            localStorage.setItem(`${STORAGE_KEYS.pinnedPrefix}${sessionUsername}`, JSON.stringify(Array.from(next)));
            return next;
        });
    };
    const handleTogglePinnedMedia = (message, index) => {
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
    const handleToggleStarred = (message) => {
        const messageId = String(message.id);
        setStarredIds((prev) => {
            const next = new Set(prev);
            if (next.has(messageId)) {
                next.delete(messageId);
            }
            else {
                next.add(messageId);
            }
            localStorage.setItem(`${STORAGE_KEYS.starredPrefix}${sessionUsername}`, JSON.stringify(Array.from(next)));
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
            const isActive = current?.mutedUntil && current.mutedUntil > Date.now();
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
    const handleDelete = async (message) => {
        try {
            if (message.sender === sessionUsername) {
                await deleteMessage({ scope: "all", groupId: message.groupId });
            }
            else if (typeof message.id === "number") {
                await deleteMessage({ scope: "self", messageId: message.id });
            }
            setMessages((prev) => prev.map((item) => item.id === message.id
                ? {
                    ...item,
                    payload: { text: "[Deleted]", attachments: [] },
                    deletedAt: Date.now()
                }
                : item));
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const refreshRoster = async (conversationId) => {
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
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const handleRemoveMember = async (username) => {
        if (!selectedConversationId) {
            return;
        }
        setStatus(null);
        try {
            await removeConversationMember(selectedConversationId, username);
            await refreshRoster(selectedConversationId);
            setStatus("Member removed");
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const handlePromoteMember = async (username) => {
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
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const handleDemoteMember = async (username) => {
        if (!selectedConversationId) {
            return;
        }
        setStatus(null);
        try {
            await updateConversationRole(selectedConversationId, username, "member");
            await refreshRoster(selectedConversationId);
            setStatus("Admin removed");
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const handleUpdateAdminPerms = async (username, permissions) => {
        if (!selectedConversationId) {
            return;
        }
        setStatus(null);
        try {
            await updateConversationRole(selectedConversationId, username, "admin", permissions);
            await refreshRoster(selectedConversationId);
            setStatus("Permissions updated");
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const handleCreateInvite = async () => {
        if (!selectedConversationId) {
            return;
        }
        setStatus(null);
        try {
            await createInviteLink(selectedConversationId, Math.max(1, inviteMaxUses), Math.max(1, inviteExpiresMinutes));
            await refreshRoster(selectedConversationId);
            setStatus("Invite created");
        }
        catch (error) {
            setStatus(error.message);
        }
    };
    const handleRevokeInvite = async (token) => {
        setStatus(null);
        try {
            await revokeInviteLink(token);
            if (selectedConversationId) {
                await refreshRoster(selectedConversationId);
            }
            setStatus("Invite revoked");
        }
        catch (error) {
            setStatus(error.message);
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
        }
        catch (error) {
            setStatus(error.message);
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
    const appendCallEndedMessage = (conversationId, durationMs) => {
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
            appendCallEndedMessage(callConversationRef.current, Date.now() - callStartRef.current);
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
                await callPeerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
            catch {
                // ignore invalid candidates
            }
        }
    };
    const createPeerConnection = (callId, target) => {
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
            if (peer.iceConnectionState === "failed" ||
                peer.iceConnectionState === "disconnected") {
                setCallError("Connection lost.");
                finalizeCallLog();
                resetCallState();
            }
        };
        callPeerRef.current = peer;
        return peer;
    };
    const handleStartCall = async (media) => {
        if (!selectedConversation || selectedConversation.type !== "direct") {
            return;
        }
        if (callState.status !== "idle") {
            return;
        }
        const other = selectedConversation.members.find((member) => member.username !== sessionUsername);
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
        }
        catch (error) {
            setCallError(error.message);
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
        const conversationId = incomingCall.payload.conversationId ?? selectedConversationId ?? null;
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
            await peer.setRemoteDescription(new RTCSessionDescription(JSON.parse(offerRaw)));
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
        }
        catch (error) {
            setCallError(error.message);
            resetCallState();
        }
    };
    const handleDeclineCall = async () => {
        if (!incomingCall) {
            return;
        }
        try {
            await endCall({ callId: incomingCall.callId });
        }
        catch {
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
        }
        catch {
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
            return (matchesQuery(title, conversationQuery) ||
                matchesQuery(members, conversationQuery));
        });
    }, [conversations, tab, conversationQuery, sessionUsername]);
    const sortedConversations = useMemo(() => {
        return [...filteredConversations].sort((a, b) => {
            const aTime = lastMessageByConversation[a.id]?.createdAt ?? 0;
            const bTime = lastMessageByConversation[b.id]?.createdAt ?? 0;
            return bTime - aTime;
        });
    }, [filteredConversations, lastMessageByConversation]);
    const selectedConversation = conversations.find((item) => item.id === selectedConversationId);
    const focusState = selectedConversationId
        ? focusByConversation[selectedConversationId]
        : null;
    const focusActive = Boolean(focusState?.mutedUntil && focusState.mutedUntil > Date.now());
    const focusUntilLabel = focusState?.mutedUntil
        ? new Date(focusState.mutedUntil).toLocaleTimeString()
        : null;
    const directPartner = selectedConversation?.type === "direct"
        ? selectedConversation.members.find((member) => member.username !== sessionUsername)?.username || null
        : null;
    const directStatus = directPartner ? statusByUser[directPartner] : null;
    const currentMemberRole = roster.find((member) => member.username === sessionUsername)?.role || null;
    const canManageConversation = currentMemberRole === "owner" || currentMemberRole === "admin";
    const quietHoursActive = selectedConversationId
        ? isQuietHoursActive(quietHoursByConversation[selectedConversationId])
        : false;
    const locationSupported = typeof navigator !== "undefined" && "geolocation" in navigator;
    const activeMessages = useMemo(() => messages.filter((msg) => msg.conversationId === selectedConversationId), [messages, selectedConversationId]);
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
                const hasLink = Boolean(msg.payload.linkPreview || extractFirstUrl(msg.payload.text || ""));
                const hasAttachment = msg.payload.attachments.some((attachment) => attachment.kind === type);
                if (type === "text" && !hasText) {
                    return false;
                }
                if (type === "link" && !hasLink) {
                    return false;
                }
                if (["image", "video", "audio", "file", "location"].includes(type) &&
                    !hasAttachment) {
                    return false;
                }
            }
            if (messageQuery) {
                const textMatch = matchesQuery(msg.payload.text || "", messageQuery);
                const attachmentMatch = msg.payload.attachments.some((attachment) => matchesQuery(attachment.name, messageQuery));
                const previewMatch = (msg.payload.linkPreview?.title &&
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
        const items = [];
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
        const pending = [];
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
    const pinnedMessages = useMemo(() => activeMessages.filter((msg) => pinnedIds.has(String(msg.id))), [activeMessages, pinnedIds]);
    const composerSpamScore = useMemo(() => (messageText ? spamScore(messageText) : 0), [messageText]);
    const pinnedMediaItems = useMemo(() => {
        if (!selectedConversationId) {
            return [];
        }
        const pinnedKeys = pinnedMediaByConversation[selectedConversationId] || [];
        if (pinnedKeys.length === 0) {
            return [];
        }
        const items = [];
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
            .flatMap((message) => message.payload.attachments.map((attachment, index) => ({
            key: `${message.id}-${index}`,
            message,
            attachment,
            index
        })))
            .filter((item) => item.attachment.kind !== "location")
            .reverse();
    }, [activeMessages]);
    const sharedMediaPreviewItems = useMemo(() => sharedAttachmentItems
        .filter((item) => item.attachment.kind === "image" || item.attachment.kind === "video")
        .slice(0, 8), [sharedAttachmentItems]);
    const sharedFilePreviewItems = useMemo(() => sharedAttachmentItems
        .filter((item) => item.attachment.kind === "file" || item.attachment.kind === "audio")
        .slice(0, 4), [sharedAttachmentItems]);
    const activeProfileAvatar = (directPartner && publicProfiles[directPartner]?.avatar) || profileState.avatar || null;
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
            const hasAttachment = msg.payload.attachments.some((attachment) => attachment.kind === type);
            if (type === "text" && !hasText) {
                return false;
            }
            if (type === "link" && !hasLink) {
                return false;
            }
            if (["image", "video", "audio", "file", "location"].includes(type) &&
                !hasAttachment) {
                return false;
            }
        }
        if (messageQuery) {
            const textMatch = matchesQuery(msg.payload.text || "", messageQuery);
            const attachmentMatch = msg.payload.attachments.some((attachment) => matchesQuery(attachment.name, messageQuery));
            const previewMatch = (msg.payload.linkPreview?.title &&
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
    const getStatusMark = (groupId) => {
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
    const unreadTotal = Object.values(unreadByConversation).reduce((sum, value) => sum + value, 0);
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
    return (_jsxs("div", { className: "app app-shell", children: [_jsx("div", { className: "shell-ambient shell-ambient-a" }), _jsx("div", { className: "shell-ambient shell-ambient-b" }), (!isLoggedIn || adminRoute) && _jsxs("header", { className: "topbar shell-topbar", children: [_jsxs("div", { className: "brand brand-lockup", children: [_jsx("div", { className: "logo", children: _jsx("img", { src: "/logo.png", alt: "Pakeger logo" }) }), _jsxs("div", { className: "brand-copy", children: [_jsx("span", { className: "brand-eyebrow", children: "Messaging Reframed" }), _jsx("h1", { children: "Pakeger" }), _jsx("p", { children: "Secure collaboration with a sharper cockpit and cleaner rhythm." })] })] }), _jsxs("div", { className: "topbar-summary", children: [_jsxs("div", { className: "summary-pill", children: [_jsx("strong", { children: sortedConversations.length }), _jsx("span", { children: "threads" })] }), _jsxs("div", { className: "summary-pill", children: [_jsx("strong", { children: unreadTotal }), _jsx("span", { children: "unread" })] }), _jsxs("div", { className: "summary-pill", children: [_jsx("strong", { children: savedMessages.length }), _jsx("span", { children: "saved" })] })] }), _jsxs("div", { className: "topbar-actions control-dock", children: [_jsx("button", { className: "ghost", onClick: () => setTheme((prev) => (prev === "dark" ? "light" : "dark")), children: theme === "dark" ? "Light mode" : "Dark mode" }), isLoggedIn && !adminRoute && (_jsx("button", { className: "ghost", onClick: () => setShowSettings((v) => !v), children: showSettings ? "Back to chats" : "Settings" }))] })] }), adminRoute && !isAdmin && (_jsxs("section", { className: "card auth-card hero-auth-card admin-access-card", children: [_jsx("span", { className: "panel-kicker", children: "Restricted zone" }), _jsx("h2", { children: "Admin Access" }), _jsx("p", { className: "note", children: "Enter the control layer for moderation, policy switches, and platform operations." }), _jsxs("label", { children: ["Username", _jsx("input", { value: adminUsername, onChange: (event) => setAdminUsername(event.target.value), placeholder: "" })] }), _jsxs("label", { children: ["Password", _jsx("input", { type: "password", value: adminPassword, onChange: (event) => setAdminPassword(event.target.value), placeholder: "" })] }), _jsx("div", { className: "row", children: _jsx("button", { onClick: handleAdminLogin, disabled: !adminUsername || !adminPassword, children: "Admin login" }) })] })), adminRoute && isAdmin && (_jsxs("section", { className: "admin-panel card command-center", children: [_jsxs("div", { className: "admin-header", children: [_jsxs("div", { children: [_jsx("span", { className: "panel-kicker", children: "Operations" }), _jsx("h2", { children: "Admin Panel" }), _jsx("p", { className: "muted", children: "Moderation, users, and conversations." })] }), _jsxs("div", { className: "row", children: [_jsx("input", { value: newAdminPassword, onChange: (event) => setNewAdminPassword(event.target.value), placeholder: "new admin password", type: "password" }), _jsx("button", { onClick: handleAdminPasswordChange, disabled: !newAdminPassword, children: "Change password" }), _jsx("button", { className: "secondary", onClick: () => refreshAdminData(), children: "Refresh" }), _jsx("button", { className: "secondary", onClick: () => setShowBlueTeam((prev) => !prev), children: "Blue Team" }), _jsx("button", { className: "secondary", onClick: handleAdminLogout, children: "Log out" })] })] }), showBlueTeam && (_jsxs("div", { className: "admin-block", children: [_jsx("h3", { children: "Blue Team Center" }), _jsx("p", { className: "muted", children: "Security dashboard and gateway controls." }), _jsxs("div", { className: "admin-actions", children: [_jsx("a", { className: "link-button", href: "/admin", target: "_blank", rel: "noreferrer", children: "Gateway Dashboard" }), _jsx("a", { className: "link-button", href: "/admin/domains", target: "_blank", rel: "noreferrer", children: "Domain Verify" }), _jsx("a", { className: "link-button", href: "/admin/waf", target: "_blank", rel: "noreferrer", children: "WAF Rules" }), _jsx("a", { className: "link-button", href: "/admin/bot", target: "_blank", rel: "noreferrer", children: "Bot Controls" }), _jsx("a", { className: "link-button", href: "/admin/geo", target: "_blank", rel: "noreferrer", children: "Geo Policies" }), _jsx("a", { className: "link-button", href: "/admin/reports", target: "_blank", rel: "noreferrer", children: "Security Reports" }), _jsx("a", { className: "link-button", href: "/admin/experiments", target: "_blank", rel: "noreferrer", children: "Experiments" }), _jsx("a", { className: "link-button", href: "/reports/hourly.pdf", target: "_blank", rel: "noreferrer", children: "Hourly PDF" }), _jsx("a", { className: "link-button", href: "/static/behavior.js", target: "_blank", rel: "noreferrer", children: "behavior.js" })] })] })), adminHasPermission("manage_settings") && (_jsxs("div", { className: "admin-block", children: [_jsx("h3", { children: "Global Lockdown" }), _jsx("p", { className: "muted", children: "Pause all new messages, posts, stories, and comments." }), _jsxs("div", { className: "row", children: [_jsx("span", { className: adminLockdown ? "tag danger" : "tag", children: adminLockdown ? "Enabled" : "Disabled" }), _jsx("button", { className: adminLockdown ? "danger" : "secondary", onClick: handleAdminToggleLockdown, disabled: adminLockdownPending, children: adminLockdown ? "Disable lockdown" : "Enable lockdown" })] }), _jsxs("div", { className: "admin-block", children: [_jsx("h4", { children: "Lockdown exceptions" }), _jsx("p", { className: "muted", children: "Allow messaging only inside selected channels or groups." }), adminConversations.length === 0 ? (_jsx("p", { className: "muted", children: "Load conversations (manage_conversations permission required) or paste conversation IDs." })) : (_jsx("div", { className: "admin-permissions", children: adminConversations
                                            .filter((conv) => conv.type !== "direct")
                                            .map((conv) => (_jsxs("label", { className: "checkbox-row", children: [_jsx("input", { type: "checkbox", checked: adminLockdownAllowIds.includes(conv.id), onChange: () => toggleLockdownAllowedConversation(conv.id) }), _jsxs("span", { children: [conv.name || "Untitled", " (", conv.type, " #", conv.id, ")"] })] }, `lockdown-${conv.id}`))) })), _jsxs("div", { className: "row", children: [_jsx("input", { value: adminLockdownAllowInput, onChange: (event) => setAdminLockdownAllowInput(event.target.value), placeholder: "Allowed conversation IDs (comma separated)" }), _jsx("button", { className: "secondary", onClick: handleAdminSaveLockdownAllow, disabled: adminLockdownSaving, children: "Save exceptions" })] })] })] })), adminHasPermission("manage_system") && (_jsxs("div", { className: "admin-block", children: [_jsx("h3", { children: "System Messages" }), _jsx("p", { className: "muted", children: "Broadcast read-only messages to all users." }), _jsxs("div", { className: "row", children: [_jsx("input", { value: systemMessage, onChange: (event) => setSystemMessage(event.target.value), placeholder: "Write a system announcement..." }), _jsxs("label", { className: "file-input", children: [systemMessageUploading ? "Uploading..." : "Add media", _jsx("input", { type: "file", multiple: true, accept: "image/*,video/*,audio/*,.pdf,.zip,.txt", onChange: handleSystemMessageMedia, disabled: systemMessageUploading || systemMessageSending })] }), _jsx("button", { onClick: handleSendSystemMessage, disabled: systemMessageSending ||
                                            systemMessageUploading ||
                                            (!systemMessage.trim() &&
                                                systemMessageAttachments.length === 0), children: systemMessageSending ? "Sending..." : "Send" })] }), systemMessageAttachments.length > 0 && (_jsx("div", { className: "attachments-preview", children: systemMessageAttachments.map((attachment, index) => (_jsxs("button", { className: "secondary", onClick: () => setSystemMessageAttachments((prev) => prev.filter((_, itemIndex) => itemIndex !== index)), disabled: systemMessageSending, title: "Remove attachment", children: [attachment.kind, ": ", attachment.name, " \u00D7"] }, `${attachment.name}-${index}`))) }))] })), adminHasPermission("manage_system") && (_jsxs("div", { className: "admin-block", children: [_jsx("h3", { children: "Blocked messages" }), _jsx("p", { className: "muted", children: "Server-side rejections (quiet hours, forwarding disabled)." }), _jsxs("div", { className: "admin-list", children: [adminBlockedEvents.length === 0 && (_jsx("p", { className: "muted", children: "No blocked events yet." })), adminBlockedEvents.map((event) => (_jsxs("div", { className: "admin-item", children: [_jsxs("div", { className: "admin-main", children: [_jsxs("div", { children: [_jsx("strong", { children: event.user.username }), _jsxs("span", { className: "muted", children: [event.conversation.name || "Untitled", " (", event.conversation.type, ") \u2022 ", event.reason] })] }), _jsx("span", { className: "tag warn", children: new Date(event.createdAt).toLocaleString() })] }), event.metadata && (_jsx("div", { className: "admin-meta", children: _jsx("span", { children: JSON.stringify(event.metadata) }) }))] }, `blocked-${event.id}`)))] })] })), adminHasPermission("manage_admins") && (_jsxs("div", { className: "admin-block", children: [_jsx("h3", { children: "Admin Access" }), _jsx("p", { className: "muted", children: "Create new admins and assign permissions." }), _jsxs("div", { className: "row", children: [_jsx("input", { value: newAdminAccountUsername, onChange: (event) => setNewAdminAccountUsername(event.target.value), placeholder: "username" }), _jsx("input", { type: "password", value: newAdminAccountPassword, onChange: (event) => setNewAdminAccountPassword(event.target.value), placeholder: "password" }), _jsxs("select", { value: newAdminAccountRole, onChange: (event) => setNewAdminAccountRole(event.target.value), children: [_jsx("option", { value: "standard", children: "Standard" }), _jsx("option", { value: "super", children: "Super" })] }), _jsx("button", { onClick: handleAdminCreateAccount, children: "Create admin" })] }), _jsx("div", { className: "admin-permissions", children: ADMIN_PERMISSION_OPTIONS.map((perm) => (_jsxs("label", { className: "checkbox-row", children: [_jsx("input", { type: "checkbox", checked: newAdminAccountPermissions.includes(perm.key), onChange: () => toggleNewAdminPermission(perm.key) }), _jsx("span", { children: perm.label })] }, `new-admin-${perm.key}`))) }), _jsxs("div", { className: "admin-list", children: [adminAdmins.length === 0 && (_jsx("p", { className: "muted", children: "No additional admins yet." })), adminAdmins.map((admin) => {
                                        const activePermissions = adminPermissionEdits[admin.id] || admin.permissions || [];
                                        return (_jsxs("div", { className: "admin-item", children: [_jsxs("div", { className: "admin-main", children: [_jsxs("div", { children: [_jsx("strong", { children: admin.username }), _jsxs("span", { className: "muted", children: ["Role: ", admin.role, " | ID ", admin.id] })] }), _jsx("div", { className: "admin-tags", children: activePermissions.length === 0 ? (_jsx("span", { className: "tag warn", children: "No permissions" })) : (activePermissions.map((perm) => (_jsx("span", { className: "tag", children: perm }, `${admin.id}-${perm}`)))) })] }), _jsx("div", { className: "admin-permissions", children: ADMIN_PERMISSION_OPTIONS.map((perm) => (_jsxs("label", { className: "checkbox-row", children: [_jsx("input", { type: "checkbox", checked: activePermissions.includes(perm.key), onChange: () => toggleAdminPermissionEdit(admin.id, perm.key) }), _jsx("span", { children: perm.label })] }, `${admin.id}-${perm.key}`))) }), _jsx("div", { className: "admin-actions", children: _jsx("button", { onClick: () => handleAdminSavePermissions(admin.id), children: "Save permissions" }) })] }, `admin-${admin.id}`));
                                    })] })] })), _jsxs("div", { className: "admin-grid", children: [adminHasPermission("manage_users") && (_jsxs("div", { className: "admin-block", children: [_jsx("h3", { children: "Users" }), _jsx("div", { className: "admin-list", children: adminUsers.map((user) => (_jsxs("div", { className: "admin-item", children: [_jsxs("div", { className: "admin-main", children: [_jsxs("div", { children: [_jsx("strong", { children: user.username }), _jsxs("span", { className: "muted", children: ["ID ", user.id, " | ", new Date(user.createdAt).toLocaleDateString()] }), _jsxs("span", { className: "muted", children: [user.firstName, " ", user.lastName, " | ", user.phone || "No phone"] })] }), _jsxs("div", { className: "admin-tags", children: [_jsx("span", { className: user.banned ? "tag danger" : "tag", children: user.banned ? "Banned" : "Active" }), _jsxs("span", { className: user.canSend ? "tag" : "tag warn", children: ["Send ", user.canSend ? "On" : "Off"] }), _jsxs("span", { className: user.canCreate ? "tag" : "tag warn", children: ["Create ", user.canCreate ? "On" : "Off"] }), _jsxs("span", { className: user.allowDirect ? "tag" : "tag warn", children: ["Direct ", user.allowDirect ? "On" : "Off"] }), _jsxs("span", { className: user.allowGroupInvite ? "tag" : "tag warn", children: ["Invites ", user.allowGroupInvite ? "On" : "Off"] })] })] }), user.profile && (_jsxs("div", { className: "admin-meta", children: [_jsxs("span", { children: ["IP: ", user.profile.last_ip] }), _jsxs("span", { children: ["Device: ", user.profile.last_device_model || "unknown"] }), _jsxs("span", { children: ["Platform: ", user.profile.last_platform || "unknown"] }), _jsxs("span", { children: ["Seen: ", new Date(user.profile.last_seen_at).toLocaleString()] })] })), _jsxs("div", { className: "admin-actions", children: [_jsx("button", { onClick: () => handleAdminToggle(user, "banned"), children: user.banned ? "Unban" : "Ban" }), _jsx("button", { onClick: () => handleAdminToggle(user, "canSend"), children: user.canSend ? "Disable Send" : "Enable Send" }), _jsx("button", { onClick: () => handleAdminToggle(user, "canCreate"), children: user.canCreate ? "Disable Create" : "Enable Create" }), _jsx("button", { onClick: () => handleAdminToggle(user, "allowDirect"), children: user.allowDirect ? "Disable Direct" : "Enable Direct" }), _jsx("button", { onClick: () => handleAdminToggle(user, "allowGroupInvite"), children: user.allowGroupInvite ? "Disable Invites" : "Enable Invites" }), _jsx("button", { className: "secondary", onClick: () => handleAdminResetPassword(user.id), children: "Reset Password" }), _jsx("button", { className: "secondary", onClick: () => handleAdminDownloadMetadata(user), children: "Download JSON" }), _jsx("button", { className: "danger", onClick: () => handleAdminDeleteUser(user.id), children: "Delete User" })] })] }, user.id))) })] })), adminHasPermission("manage_conversations") && (_jsxs("div", { className: "admin-block", children: [_jsx("h3", { children: "Conversations" }), _jsx("div", { className: "admin-list", children: adminConversations.map((conv) => (_jsxs("div", { className: "admin-item", children: [_jsxs("div", { className: "admin-main", children: [_jsxs("div", { children: [_jsx("strong", { children: conv.name || "Untitled" }), _jsxs("span", { className: "muted", children: [conv.type, " | ID ", conv.id, " | Members ", conv.members.length] })] }), _jsx("button", { className: "danger", onClick: () => handleAdminDeleteConversation(conv.id), children: "Delete" })] }), _jsxs("div", { className: "admin-meta", children: [_jsxs("span", { children: ["Members: ", conv.members.join(", ")] }), conv.visibility && _jsxs("span", { children: ["Visibility: ", conv.visibility] }), _jsxs("span", { children: ["Created: ", new Date(conv.createdAt).toLocaleString()] })] })] }, conv.id))) })] }))] })] })), !adminRoute && !isLoggedIn && (_jsxs("section", { className: "auth-shell", children: [_jsxs("div", { className: "auth-showcase card", children: [_jsx("div", { className: "auth-showcase-badge", children: "Nova mode" }), _jsxs("div", { className: "auth-showcase-copy", children: [_jsx("h2", { children: authStep === "phone"
                                            ? "A chat-first entrance that already feels like the product."
                                            : "Finish your identity inside the same visual world." }), _jsx("p", { children: "Neon surfaces, focused conversation flow, and encrypted messaging from the first screen onward." })] }), _jsxs("div", { className: "auth-preview-window", children: [_jsxs("div", { className: "auth-preview-sidebar", children: [_jsx("span", { className: "auth-preview-chip active", children: "Chats" }), _jsx("span", { className: "auth-preview-chip", children: "Calls" }), _jsx("span", { className: "auth-preview-chip", children: "Saved" })] }), _jsxs("div", { className: "auth-preview-chat", children: [_jsxs("div", { className: "auth-preview-head", children: [_jsx("div", { className: "auth-preview-avatar" }), _jsxs("div", { children: [_jsx("strong", { children: "Sara" }), _jsx("span", { children: "Online now" })] })] }), _jsx("div", { className: "auth-preview-bubble", children: "It's going amazing!" }), _jsx("div", { className: "auth-preview-bubble ghost", children: "We rebuilt the chat layout from the ground up." }), _jsxs("div", { className: "auth-preview-composer", children: [_jsx("span", { children: "Type a message..." }), _jsx("button", { type: "button", children: "\u2191" })] })] })] })] }), _jsxs("section", { className: "card auth-card auth-screen hero-auth-card auth-form-card", children: [_jsxs("div", { className: "auth-hero", children: [_jsx("span", { className: "panel-kicker", children: "Fresh Interface" }), _jsx("h2", { children: authStep === "phone"
                                            ? "Step into a redesigned messaging space"
                                            : "Build your identity before you enter" }), _jsx("p", { className: "note", children: "The login flow now lives in the same family as the main chat experience." })] }), authStep === "phone" ? (_jsxs(_Fragment, { children: [_jsx("h3", { children: "Your phone number" }), _jsx("p", { className: "note auth-note", children: "Please confirm your country code and enter your phone number." }), _jsxs("div", { className: "auth-field", children: [_jsx("label", { children: "Country" }), _jsx("div", { className: "country-select", children: _jsx("select", { value: countryCode, onChange: (event) => setCountryCode(event.target.value), children: countries.map((country) => (_jsxs("option", { value: country.code, children: [country.flag, " ", country.name, " (", country.dialCode, ")"] }, country.code))) }) })] }), _jsxs("div", { className: "auth-field", children: [_jsx("label", { children: "Phone number" }), _jsxs("div", { className: "phone-row", children: [_jsxs("span", { className: "phone-code", children: [selectedCountry.flag, " ", selectedCountry.dialCode] }), _jsx("input", { value: phoneNumber, onChange: (event) => setPhoneNumber(event.target.value.replace(/[^\d\s]/g, "")), placeholder: "Phone number", inputMode: "numeric" })] })] }), _jsxs("label", { children: ["Password (if enabled)", _jsx("input", { type: "password", value: password, onChange: (event) => setPassword(event.target.value), placeholder: "optional" })] }), _jsx("div", { className: "auth-actions", children: _jsx("button", { className: "auth-next", onClick: () => setAuthStep("details"), disabled: !phoneComplete, children: "Next" }) })] })) : (_jsxs(_Fragment, { children: [_jsx("h3", { children: "Finish signup" }), _jsx("p", { className: "note auth-note", children: "Add name and username to create account." }), _jsxs("div", { className: "auth-field", children: [_jsx("label", { children: "Phone" }), _jsxs("div", { className: "phone-row", children: [_jsxs("span", { className: "phone-code", children: [selectedCountry.flag, " ", selectedCountry.dialCode] }), _jsx("input", { value: phoneNumber, readOnly: true })] })] }), _jsxs("label", { children: ["First name", _jsx("input", { value: firstName, onChange: (event) => setFirstName(event.target.value), placeholder: "First name" })] }), _jsxs("label", { children: ["Last name", _jsx("input", { value: lastName, onChange: (event) => setLastName(event.target.value), placeholder: "Last name" })] }), _jsxs("label", { children: ["Username", _jsx("input", { value: username, onChange: (event) => setUsername(event.target.value.toLowerCase()), placeholder: "username (5-32 chars)" })] }), _jsxs("label", { className: "toggle", children: [_jsx("input", { type: "checkbox", checked: enable2fa, onChange: (event) => setEnable2fa(event.target.checked) }), _jsx("span", { children: "Enable 2-step verification (password)" })] }), _jsxs("label", { children: ["2FA password", _jsx("input", { type: "password", value: password, onChange: (event) => setPassword(event.target.value), placeholder: "optional" })] }), _jsxs("div", { className: "row", children: [_jsx("button", { className: "secondary", onClick: () => setAuthStep("phone"), children: "Back" }), _jsx("button", { onClick: handleSignup, disabled: !phoneComplete ||
                                                    !firstName ||
                                                    !lastName ||
                                                    !username ||
                                                    (enable2fa && password.length < 6), children: "Sign up" })] }), _jsx("p", { className: "note", children: "Your encryption keys stay in this browser (IndexedDB)." })] }))] })] })), !adminRoute && isLoggedIn && (_jsxs("div", { className: "layout layout-shell", children: [_jsx("aside", { className: "sidebar card shell-sidebar", children: _jsxs("div", { className: "sidebar-panel", children: [_jsxs("div", { className: "sidebar-section-switch", children: [_jsx("button", { className: mainSection === "messages" ? "active" : "", onClick: () => setMainSection("messages"), children: "Chats" }), _jsx("button", { className: activeView === "chat-feed" ? "active" : "", onClick: () => {
                                                setActiveView("chat-feed");
                                                setMainSection("messages");
                                                setSelectedConversationId(null);
                                            }, children: "Media" }), _jsx("button", { className: activeView === "saved" ? "active" : "", onClick: () => {
                                                setActiveView("saved");
                                                setMainSection("messages");
                                                setSelectedConversationId(null);
                                            }, children: "Saved" }), _jsx("button", { className: showSettings ? "active" : "", onClick: () => setShowSettings((v) => !v), children: "Settings" })] }), _jsxs("div", { className: "sidebar-top sidebar-hero", children: [_jsxs("div", { className: "profile-card spotlight-card", children: [_jsx("div", { className: "avatar", children: profileState.avatar ? (_jsx("img", { src: profileState.avatar, alt: "avatar" })) : (_jsx("span", { children: getInitials(sessionUsername) })) }), _jsxs("div", { children: [_jsx("div", { className: "profile-name", children: sessionUsername }), _jsx("div", { className: "muted", children: profileState.bio || "No bio yet" })] })] }), _jsx("div", { className: "sidebar-panel-actions", children: _jsx("button", { className: "ghost small", onClick: () => setTheme((prev) => (prev === "dark" ? "light" : "dark")), children: theme === "dark" ? "Light" : "Dark" }) })] }), mainSection === "messages" && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "sidebar-search-row", children: [_jsx("input", { className: "search", value: conversationQuery, onChange: (event) => setConversationQuery(event.target.value), placeholder: "Search chats" }), _jsx("button", { className: "ghost small sidebar-filter-button", children: "Tune" })] }), _jsx("div", { className: "tabs", children: tabs.map((item) => (_jsx("button", { className: item === tab ? "active" : "", onClick: () => setTab(item), children: item === "direct"
                                                    ? "Personal"
                                                    : item === "all"
                                                        ? "All"
                                                        : item }, item))) }), _jsxs("div", { className: "conversation-list", children: [sortedConversations.length === 0 && (_jsx("p", { className: "muted", children: "No conversations yet." })), sortedConversations.map((conv) => {
                                                    const title = getConversationTitle(conv, sessionUsername);
                                                    const profile = publicProfiles[title];
                                                    const presence = conv.type === "direct" ? statusByUser[title] : null;
                                                    return (_jsxs("button", { className: conv.id === selectedConversationId
                                                            ? "conversation active"
                                                            : "conversation", onClick: () => {
                                                            setSelectedConversationId(conv.id);
                                                            setActiveView("chat");
                                                        }, children: [_jsxs("div", { className: "conversation-left", children: [_jsxs("div", { className: "avatar small avatar-wrap", children: [profile?.avatar ? (_jsx("img", { src: profile.avatar, alt: title })) : (_jsx("span", { children: getInitials(title) })), presence && (_jsx("span", { className: presence.online
                                                                                    ? "status-dot online"
                                                                                    : "status-dot" }))] }), _jsxs("div", { children: [_jsx("div", { className: "title", children: title }), _jsx("div", { className: "meta", children: lastMessageByConversation[conv.id]
                                                                                    ? `${lastMessageByConversation[conv.id].sender}: ${getPreview(lastMessageByConversation[conv.id].payload)}`
                                                                                    : conv.members.map((member) => member.username).join(", ") })] })] }), _jsxs("div", { className: "conversation-right", children: [_jsx("span", { className: "time", children: lastMessageByConversation[conv.id]
                                                                            ? formatTime(lastMessageByConversation[conv.id].createdAt, displayTimeZone)
                                                                            : "" }), unreadByConversation[conv.id] ? (_jsx("span", { className: "badge", children: unreadByConversation[conv.id] })) : null] })] }, conv.id));
                                                })] }), _jsx("div", { className: "divider" }), _jsxs("div", { className: "create-block", children: [tab === "direct" ? (_jsxs(_Fragment, { children: [_jsx("h3", { children: "New direct chat" }), _jsx("input", { value: directUsername, onChange: (event) => setDirectUsername(event.target.value), placeholder: "username" })] })) : tab === "all" ? (_jsx("p", { className: "muted", children: "Choose a tab to create a chat." })) : (_jsxs(_Fragment, { children: [_jsxs("h3", { children: ["New ", tab] }), _jsxs("label", { children: ["Template", _jsxs("select", { value: selectedTemplateId, onChange: (event) => {
                                                                        const value = event.target.value;
                                                                        setSelectedTemplateId(value);
                                                                        const template = chatTemplates.find((item) => item.id === value);
                                                                        if (template) {
                                                                            setGroupName(template.name);
                                                                            setGroupVisibility(template.visibility);
                                                                        }
                                                                    }, children: [_jsx("option", { value: "", children: "No template" }), chatTemplates.map((template) => (_jsxs("option", { value: template.id, children: [template.name, " (", template.visibility, ")"] }, template.id)))] })] }), _jsxs("div", { className: "row", children: [_jsx("button", { type: "button", className: groupVisibility === "public" ? "" : "secondary", onClick: () => setGroupVisibility("public"), children: "Public" }), _jsx("button", { type: "button", className: groupVisibility === "private" ? "" : "secondary", onClick: () => setGroupVisibility("private"), children: "Private" })] }), _jsx("input", { value: groupName, onChange: (event) => setGroupName(event.target.value), placeholder: "name" }), groupVisibility === "public" ? (_jsx("textarea", { value: groupMembers, onChange: (event) => setGroupMembers(event.target.value), placeholder: "members (comma separated)" })) : (_jsx("p", { className: "note", children: "Private chats use invite links. Create the group first, then generate a one-time link in the manage panel." }))] })), _jsx("button", { onClick: handleCreateConversation, disabled: tab === "all"
                                                        ? true
                                                        : tab === "direct"
                                                            ? !directUsername
                                                            : !groupName || (groupVisibility === "public" && !groupMembers), children: "Create" })] }), _jsx("div", { className: "divider" }), _jsxs("div", { className: "create-block", children: [_jsx("h3", { children: "Join with invite" }), _jsx("input", { value: inviteToken, onChange: (event) => setInviteToken(event.target.value), placeholder: "invite token" }), _jsx("button", { onClick: handleRedeemInvite, disabled: !inviteToken, children: "Join" })] })] })), _jsx("button", { className: "secondary", onClick: handleLogout, children: "Log out" })] }) }), _jsxs("main", { className: "main card shell-main", children: [!(activeView === "chat" && mainSection === "messages" && selectedConversation && !showSettings) && (_jsxs("section", { className: "workspace-banner", children: [_jsxs("div", { className: "workspace-copy", children: [_jsx("span", { className: "panel-kicker", children: workspaceLabel }), _jsx("h2", { children: workspaceTitle }), _jsx("p", { children: workspaceDescription })] }), _jsxs("div", { className: "workspace-chips", children: [_jsx("span", { className: "workspace-chip", children: mainSection === "social" ? "Social mode" : "Messaging mode" }), _jsx("span", { className: "workspace-chip", children: showSettings ? "Settings open" : activeView.replace("-", " ") }), _jsx("span", { className: "workspace-chip", children: theme === "dark" ? "Night palette" : "Day palette" })] })] })), showSettings && (_jsxs("div", { className: "settings-panel", children: [_jsxs("header", { className: "settings-top", children: [settingsPage !== "root" ? (_jsx("button", { className: "settings-nav", onClick: popSettingsPage, children: "<" })) : (_jsx("span", { className: "settings-nav-spacer" })), _jsx("div", { className: "settings-title", children: settingsTitle }), _jsx("span", { className: "settings-nav-spacer" })] }), _jsx("div", { className: `settings-page${settingsPrefs.appearance.animations ? " animate" : ""}`, children: renderSettingsPage() }, settingsPage)] })), !showSettings && activeView === "explore" && mainSection === "social" && (_jsxs("div", { className: "explore-panel", children: [_jsxs("div", { className: "explore-header", children: [_jsxs("div", { children: [_jsx("h2", { children: "Explore" }), _jsx("p", { className: "muted", children: "Stories, reels, and posts." })] }), _jsxs("div", { className: "explore-tabs", children: [_jsx("button", { className: socialSort === "latest" ? "active" : "", onClick: () => setSocialSort("latest"), children: "Latest" }), _jsx("button", { className: socialSort === "trending" ? "active" : "", onClick: () => setSocialSort("trending"), children: "Trending" }), _jsx("button", { className: socialFeedKind === "post" ? "active" : "", onClick: () => setSocialFeedKind("post"), children: "Posts" }), _jsx("button", { className: socialFeedKind === "reel" ? "active" : "", onClick: () => setSocialFeedKind("reel"), children: "Reels" }), _jsx("button", { className: socialFilter === "saved" ? "active" : "", onClick: () => setSocialFilter((prev) => (prev === "saved" ? "all" : "saved")), children: "Saved" })] })] }), _jsx("div", { className: "explore-search", children: _jsx("input", { className: "search", value: socialSearch, onChange: (event) => setSocialSearch(event.target.value), placeholder: "Search captions or usernames" }) }), socialTagCounts.length > 0 && (_jsxs("div", { className: "tag-rail", children: [_jsx("button", { className: !socialTagFilter ? "active" : "", onClick: () => setSocialTagFilter(""), children: "All tags" }), socialTagCounts.map(([tag]) => (_jsxs("button", { className: socialTagFilter === tag ? "active" : "", onClick: () => setSocialTagFilter(tag), children: ["#", tag] }, `tag-${tag}`)))] })), _jsxs("div", { className: "social-profile-card", children: [_jsxs("div", { className: "social-profile-header", children: [_jsx("div", { className: "avatar", children: profileState.avatar ? (_jsx("img", { src: profileState.avatar, alt: sessionUsername })) : (_jsx("span", { children: getInitials(sessionUsername) })) }), _jsxs("div", { children: [_jsx("div", { className: "profile-name", children: sessionUsername }), _jsx("div", { className: "muted", children: profileState.bio || "No bio yet" })] })] }), _jsxs("div", { className: "social-profile-stats", children: [_jsxs("div", { children: [_jsx("strong", { children: myPostCount }), _jsx("span", { children: "Posts" })] }), _jsxs("div", { children: [_jsx("strong", { children: myReelCount }), _jsx("span", { children: "Reels" })] }), _jsxs("div", { children: [_jsx("strong", { children: myStoryCount }), _jsx("span", { children: "Stories" })] }), _jsxs("div", { children: [_jsx("strong", { children: socialFollowers.length }), _jsx("span", { children: "Followers" })] }), _jsxs("div", { children: [_jsx("strong", { children: followingUsers.size }), _jsx("span", { children: "Following" })] })] }), socialInsights && (_jsxs("div", { className: "social-insights", children: [_jsxs("div", { children: [_jsx("strong", { children: socialInsights.views }), _jsx("span", { children: "Views" })] }), _jsxs("div", { children: [_jsx("strong", { children: socialInsights.likes }), _jsx("span", { children: "Likes" })] }), _jsxs("div", { children: [_jsx("strong", { children: socialInsights.comments }), _jsx("span", { children: "Comments" })] }), _jsxs("div", { children: [_jsx("strong", { children: socialInsights.saves }), _jsx("span", { children: "Saves" })] })] })), extractFirstUrl(profileState.bio || "") && (_jsx("a", { className: "profile-link", href: extractFirstUrl(profileState.bio || "") || "#", target: "_blank", rel: "noreferrer", children: extractFirstUrl(profileState.bio || "") })), _jsxs("div", { className: "social-collections", children: [_jsxs("div", { className: "row", children: [_jsx("input", { value: socialNewCollection, onChange: (event) => setSocialNewCollection(event.target.value), placeholder: "New collection" }), _jsx("button", { className: "secondary", onClick: handleCreateCollection, children: "Add" })] }), _jsxs("div", { className: "collection-list", children: [Object.keys(socialCollections).length === 0 && (_jsx("span", { className: "muted", children: "No collections yet." })), Object.entries(socialCollections).map(([name, ids]) => (_jsxs("button", { className: socialActiveCollection === name ? "active" : "", onClick: () => setSocialActiveCollection(name), children: [name, " (", ids.length, ")"] }, `collection-${name}`)))] })] }), socialPinnedIds.size > 0 && (_jsxs("div", { className: "social-pinned", children: [_jsx("h4", { children: "Pinned" }), _jsx("div", { className: "pinned-grid", children: Array.from(socialPinnedIds)
                                                            .map((id) => socialFeed.find((item) => item.post.id === id))
                                                            .filter(Boolean)
                                                            .slice(0, 4)
                                                            .map((item) => (_jsx("button", { onClick: () => {
                                                                if (item.post.kind === "reel") {
                                                                    setActiveReel(item);
                                                                }
                                                            }, className: "pinned-card", children: item.post.media_type === "video" ? (_jsx("video", { src: item.post.media_url, muted: true })) : (_jsx("img", { src: item.post.media_url, alt: "pinned" })) }, `pin-${item.post.id}`))) })] }))] }), _jsxs("div", { className: "story-rail", children: [socialStories.length === 0 && (_jsx("p", { className: "muted", children: "No stories yet." })), socialStories.map((story) => (_jsxs("button", { className: story.viewerViewed ? "story viewed" : "story", onClick: () => {
                                                    setActiveStory(story);
                                                    handleSocialView(story.post.id);
                                                }, children: [_jsx("div", { className: "avatar small avatar-wrap", children: story.author.avatar ? (_jsx("img", { src: story.author.avatar, alt: story.author.username })) : (_jsx("span", { children: getInitials(story.author.username) })) }), _jsx("span", { children: story.author.username })] }, `story-${story.post.id}`)))] }), _jsxs("div", { className: "social-composer", children: [_jsxs("div", { className: "composer-header", children: [_jsx("h3", { children: "Create" }), _jsxs("div", { className: "composer-kind", children: [_jsx("button", { className: socialComposeKind === "post" ? "active" : "", onClick: () => setSocialComposeKind("post"), children: "Post" }), _jsx("button", { className: socialComposeKind === "reel" ? "active" : "", onClick: () => setSocialComposeKind("reel"), children: "Reel" }), _jsx("button", { className: socialComposeKind === "story" ? "active" : "", onClick: () => setSocialComposeKind("story"), children: "Story" })] })] }), _jsxs("div", { className: "composer-body", children: [_jsxs("div", { className: "composer-row", children: [_jsxs("label", { children: ["Visibility", _jsxs("select", { value: socialVisibility, onChange: (event) => setSocialVisibility((prev) => {
                                                                            const next = event.target.value === "private"
                                                                                ? "private"
                                                                                : "public";
                                                                            if (prev !== next && next === "public") {
                                                                                setSocialAllowedUsers([]);
                                                                            }
                                                                            return next;
                                                                        }), children: [_jsx("option", { value: "public", children: "Public" }), _jsx("option", { value: "private", children: "Private" })] })] }), _jsxs("label", { children: ["Comments", _jsxs("select", { value: socialCommentVisibility, onChange: (event) => setSocialCommentVisibility(event.target.value === "friends"
                                                                            ? "friends"
                                                                            : "public"), children: [_jsx("option", { value: "public", children: "Everyone" }), _jsx("option", { value: "friends", children: "Friends only" })] })] })] }), socialVisibility === "private" && (_jsxs("div", { className: "composer-audience", children: [_jsx("p", { className: "muted", children: "Select followers or following:" }), _jsxs("div", { className: "audience-list", children: [socialAudienceOptions.length === 0 && (_jsx("span", { className: "muted", children: "No followers yet." })), socialAudienceOptions.map((name) => {
                                                                        const selected = socialAllowedUsers.includes(name);
                                                                        return (_jsx("button", { type: "button", className: selected ? "selected" : "", onClick: () => setSocialAllowedUsers((prev) => prev.includes(name)
                                                                                ? prev.filter((item) => item !== name)
                                                                                : [...prev, name]), children: name }, `aud-${name}`));
                                                                    })] })] })), _jsxs("label", { children: ["Schedule (optional)", _jsx("input", { type: "datetime-local", value: socialScheduleAt, onChange: (event) => setSocialScheduleAt(event.target.value) })] }), _jsxs("label", { className: "file-input", children: ["Select media", _jsx("input", { type: "file", accept: "image/*,video/*", onChange: handleSocialMediaChange })] }), socialMediaPreview && (_jsx("div", { className: "composer-preview", children: socialMedia?.type.startsWith("video") ? (_jsx("video", { src: socialMediaPreview, controls: true })) : (_jsx("img", { src: socialMediaPreview, alt: "preview" })) })), _jsx("textarea", { value: socialCaption, onChange: (event) => setSocialCaption(event.target.value), placeholder: "Write a caption..." }), _jsxs("div", { className: "composer-actions", children: [_jsx("button", { onClick: handleSocialPublish, disabled: socialPublishing, children: socialPublishing ? "Publishing..." : "Publish" }), _jsxs("label", { className: "toggle", children: [_jsx("input", { type: "checkbox", checked: socialTimed, onChange: (event) => setSocialTimed(event.target.checked) }), _jsx("span", { children: "Timed (1h)" })] }), socialComposeKind === "story" && (_jsx("span", { className: "muted", children: "Stories expire in 24h." })), socialScheduleAt && (_jsxs("span", { className: "muted", children: ["Scheduled for ", new Date(socialScheduleAt).toLocaleString()] }))] }), socialError && _jsx("p", { className: "status error", children: socialError })] })] }), socialLoading && _jsx("p", { className: "muted", children: "Loading feed..." }), !socialLoading && filteredSocialFeed.length === 0 && (_jsx("p", { className: "muted", children: socialSearch ? "No matches found." : "No posts yet." })), _jsx("div", { className: "social-feed", children: filteredSocialFeed.map((item) => {
                                            const isFollowing = followingUsers.has(item.author.username);
                                            const isSelf = item.author.username === sessionUsername;
                                            const presence = statusByUser[item.author.username];
                                            return (_jsxs("article", { className: "social-card", children: [_jsxs("header", { className: "social-meta", children: [_jsxs("div", { className: "social-author", children: [_jsxs("div", { className: "avatar small avatar-wrap", children: [item.author.avatar ? (_jsx("img", { src: item.author.avatar, alt: item.author.username })) : (_jsx("span", { children: getInitials(item.author.username) })), presence && (_jsx("span", { className: presence.online ? "status-dot online" : "status-dot" }))] }), _jsxs("div", { children: [_jsx("div", { className: "profile-name", children: item.author.username }), item.author.bio && (_jsx("div", { className: "muted", children: item.author.bio }))] })] }), !isSelf && (_jsx("button", { className: isFollowing ? "secondary" : "", onClick: () => handleSocialFollow(item.author.username, isFollowing), children: isFollowing ? "Following" : "Follow" }))] }), _jsx("div", { className: "social-media", children: item.post.media_type === "video" ? (item.post.kind === "reel" ? (_jsx("video", { src: item.post.media_url, autoPlay: true, loop: true, muted: reelMuted, playsInline: true })) : (_jsx("video", { src: item.post.media_url, controls: true }))) : (_jsx("img", { src: item.post.media_url, alt: item.post.caption || "post" })) }), _jsxs("div", { className: "social-actions", children: [_jsxs("button", { className: item.viewer.liked ? "active" : "", onClick: () => handleSocialLike(item.post.id), children: [item.viewer.liked ? "Liked" : "Like", " (", item.counts.likes, ")"] }), _jsxs("button", { onClick: () => handleSocialCommentsOpen(item.post.id), children: ["Comment (", item.counts.comments, ")"] }), _jsx("button", { onClick: () => handleSocialShare(item.post.media_url), children: "Share" }), _jsx("button", { className: item.viewer.saved ? "active" : "", onClick: () => handleSocialSave(item.post.id), children: item.viewer.saved ? "Saved" : "Save" }), isSelf && (_jsx("button", { className: socialPinnedIds.has(item.post.id) ? "active" : "", onClick: () => togglePinnedPost(item.post.id), children: socialPinnedIds.has(item.post.id) ? "Pinned" : "Pin" })), item.post.kind === "reel" && (_jsx("button", { onClick: () => setReelMuted((prev) => !prev), children: reelMuted ? "Sound off" : "Sound on" })), _jsxs("button", { onClick: () => handleSocialView(item.post.id), children: ["View (", item.counts.views, ")"] }), item.post.kind === "reel" && (_jsx("button", { onClick: () => setActiveReel(item), children: "Open reel" }))] }), item.post.caption && (_jsx("p", { className: "social-caption", children: item.post.caption })), getPostTags(item.post).length > 0 && (_jsx("div", { className: "tag-list", children: getPostTags(item.post).map((tag) => (_jsxs("button", { onClick: () => setSocialTagFilter(tag), children: ["#", tag] }, `post-tag-${item.post.id}-${tag}`))) })), item.post.comment_visibility === "friends" && (_jsx("p", { className: "muted", children: "Comments: friends only" })), activeCommentsPost === item.post.id && (_jsxs("div", { className: "social-comments", children: [_jsx("div", { className: "comment-list", children: (socialComments[item.post.id] || []).map((entry) => (_jsxs("div", { className: "comment", children: [_jsx("strong", { children: entry.author.username }), _jsx("span", { children: entry.comment.text })] }, `comment-${entry.comment.id}`))) }), _jsxs("div", { className: "comment-input", children: [_jsx("input", { value: commentDraft, onChange: (event) => setCommentDraft(event.target.value), placeholder: "Write a comment..." }), _jsx("button", { onClick: () => handleSocialCommentSend(item.post.id), children: "Send" })] })] }))] }, `post-${item.post.id}`));
                                        }) }), _jsxs("div", { className: "notifications", children: [_jsx("h3", { children: "Activity" }), socialNotifications.length === 0 && (_jsx("p", { className: "muted", children: "No activity yet." })), _jsx("div", { className: "notification-list", children: socialNotifications.map((note) => (_jsxs("div", { className: "notification-item", children: [_jsx("strong", { children: note.actor.username }), _jsx("span", { children: note.type === "like"
                                                                ? " liked your post"
                                                                : note.type === "comment"
                                                                    ? " commented on your post"
                                                                    : " followed you" })] }, `note-${note.id}`))) })] }), activeStory && (_jsx("div", { className: "story-modal", onClick: () => setActiveStory(null), children: _jsxs("div", { className: "story-card", onClick: (event) => event.stopPropagation(), children: [_jsx("button", { className: "ghost small", onClick: () => setActiveStory(null), children: "Close" }), _jsx("div", { className: "story-media", children: activeStory.post.media_type === "video" ? (_jsx("video", { src: activeStory.post.media_url, controls: true, autoPlay: true })) : (_jsx("img", { src: activeStory.post.media_url, alt: activeStory.author.username })) }), _jsx("div", { className: "story-reactions", children: ["like", "fire", "wow"].map((reaction) => (_jsx("button", { className: "secondary", onClick: async () => {
                                                            if (!activeStory) {
                                                                return;
                                                            }
                                                            try {
                                                                await createSocialComment(activeStory.post.id, reaction);
                                                                setActiveStory(null);
                                                            }
                                                            catch (error) {
                                                                setSocialError(error.message);
                                                            }
                                                        }, children: reaction }, `reaction-${reaction}`))) }), _jsxs("div", { className: "story-reply", children: [_jsx("input", { value: storyReplyText, onChange: (event) => setStoryReplyText(event.target.value), placeholder: "Reply to story..." }), _jsx("button", { onClick: handleStoryReply, children: "Send" })] })] }) })), activeReel && (_jsx("div", { className: "reel-modal", onClick: () => setActiveReel(null), children: _jsxs("div", { className: "reel-card", onClick: (event) => event.stopPropagation(), children: [_jsx("button", { className: "ghost small", onClick: () => setActiveReel(null), children: "Close" }), _jsx("video", { src: activeReel.post.media_url, controls: true, autoPlay: true, muted: reelMuted, playsInline: true }), _jsx("button", { className: "secondary", onClick: () => setReelMuted((prev) => !prev), children: reelMuted ? "Sound off" : "Sound on" })] }) }))] })), !showSettings && activeView === "chat-feed" && mainSection === "messages" && (_jsxs("div", { className: "chat-feed-panel", children: [_jsx("div", { className: "thread-header", children: _jsxs("div", { children: [_jsx("h2", { children: "Chat feed" }), _jsx("p", { className: "muted", children: "Media shared in your chats." })] }) }), chatMediaFeed.length === 0 && (_jsx("p", { className: "muted", children: "No media yet." })), _jsx("div", { className: "chat-media-grid", children: chatMediaFeed.map((item) => (_jsxs("div", { className: "chat-media-card", children: [(() => {
                                                    const mediaUrl = resolveChatMediaUrl(item);
                                                    if (!mediaUrl && item.storageKey) {
                                                        return (_jsx("button", { className: "secondary", onClick: () => ensureAttachmentUrl({
                                                                kind: item.kind,
                                                                name: item.id,
                                                                data: item.url,
                                                                storageKey: item.storageKey,
                                                                contentType: item.contentType
                                                            }), children: "Load media" }));
                                                    }
                                                    if (!mediaUrl) {
                                                        return _jsx("div", { className: "muted", children: "Media unavailable" });
                                                    }
                                                    if (item.kind === "image") {
                                                        return _jsx("img", { src: mediaUrl, alt: "chat media" });
                                                    }
                                                    if (item.kind === "video") {
                                                        return _jsx("video", { src: mediaUrl, controls: true });
                                                    }
                                                    if (item.kind === "audio") {
                                                        return _jsx("audio", { src: mediaUrl, controls: true });
                                                    }
                                                    return (_jsx("a", { href: mediaUrl, target: "_blank", rel: "noreferrer", children: "Download file" }));
                                                })(), _jsxs("div", { className: "muted", children: [item.sender, " - ", formatTime(item.createdAt, displayTimeZone)] })] }, item.id))) })] })), !showSettings && activeView === "saved" && mainSection === "messages" && (_jsxs("div", { className: "saved-panel", children: [_jsx("div", { className: "thread-header", children: _jsxs("div", { children: [_jsx("h2", { children: "Saved messages" }), _jsx("p", { className: "muted", children: "Starred messages saved on this device." })] }) }), _jsxs("div", { className: "search-panel", children: [_jsx("input", { className: "search", value: messageQuery, onChange: (event) => setMessageQuery(event.target.value), placeholder: "Search saved messages" }), _jsxs("div", { className: "filter-row", children: [_jsxs("select", { value: messageFilters.type, onChange: (event) => setMessageFilters((prev) => ({
                                                            ...prev,
                                                            type: event.target.value
                                                        })), children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "text", children: "Text" }), _jsx("option", { value: "link", children: "Links" }), _jsx("option", { value: "image", children: "Images" }), _jsx("option", { value: "video", children: "Videos" }), _jsx("option", { value: "audio", children: "Audio" }), _jsx("option", { value: "file", children: "Files" }), _jsx("option", { value: "location", children: "Locations" })] }), _jsx("input", { value: messageFilters.sender, onChange: (event) => setMessageFilters((prev) => ({
                                                            ...prev,
                                                            sender: event.target.value
                                                        })), placeholder: "Sender" }), _jsx("input", { type: "date", value: messageFilters.from, onChange: (event) => setMessageFilters((prev) => ({
                                                            ...prev,
                                                            from: event.target.value
                                                        })) }), _jsx("input", { type: "date", value: messageFilters.to, onChange: (event) => setMessageFilters((prev) => ({
                                                            ...prev,
                                                            to: event.target.value
                                                        })) })] })] }), _jsxs("div", { className: "messages", children: [savedFilteredMessages.length === 0 && (_jsx("p", { className: "muted", children: "No saved messages yet." })), savedFilteredMessages.map((item) => (_jsxs("div", { className: "message", children: [_jsxs("div", { className: "meta", children: [_jsx("span", { className: "sender", children: item.sender }), _jsx("span", { className: "meta-right", children: _jsxs("span", { children: [formatTime(item.createdAt, displayTimeZone), " -", " ", formatDateLabel(item.createdAt, displayTimeZone)] }) })] }), item.payload.text && (_jsx("div", { className: "text", children: renderMessageText(item.payload.text, messageQuery) })), item.payload.linkPreview && (_jsxs("div", { className: "link-preview", children: [item.payload.linkPreview.image && (_jsx("img", { src: item.payload.linkPreview.image, alt: item.payload.linkPreview.title || "preview" })), _jsxs("div", { children: [_jsx("strong", { children: item.payload.linkPreview.title ||
                                                                            item.payload.linkPreview.siteName ||
                                                                            "Link preview" }), item.payload.linkPreview.description && (_jsx("div", { className: "muted", children: item.payload.linkPreview.description })), _jsx("a", { href: item.payload.linkPreview.url, target: "_blank", rel: "noreferrer", children: item.payload.linkPreview.url })] })] }))] }, `saved-${item.id}`)))] })] })), !showSettings &&
                                activeView === "chat" &&
                                mainSection === "messages" &&
                                !selectedConversation && (_jsx("div", { className: "empty", children: "Select a conversation to start." })), !showSettings &&
                                activeView === "chat" &&
                                mainSection === "messages" &&
                                selectedConversation && (_jsx(_Fragment, { children: _jsxs("div", { className: "chat-stage", children: [_jsxs("section", { className: "chat-center-column", children: [_jsxs("div", { className: "thread-header thread-header-chat", children: [_jsxs("div", { children: [_jsx("h2", { children: getConversationTitle(selectedConversation, sessionUsername) }), !encryptionReady && (_jsx("p", { className: "note", children: "Encryption keys missing on this device. Import backup or reset encryption to read old messages." })), directStatus && (_jsxs("p", { className: "presence", children: [_jsx("span", { className: directStatus.online ? "dot online" : "dot offline" }), directStatus.online
                                                                            ? "Online"
                                                                            : formatLastSeen(directStatus.lastSeen)] })), quietHoursActive && (_jsx("p", { className: "presence quiet-hours", children: "Quiet hours active \u2014 notifications are muted." })), !focusActive && typingUsers.length > 0 && (_jsxs("p", { className: "typing", children: [typingUsers.join(", "), " typing..."] })), focusActive && (_jsxs("p", { className: "presence", children: ["Focus mode on - muted until ", focusUntilLabel] }))] }), _jsxs("div", { className: "thread-actions", children: [selectedConversation.type === "direct" && (_jsxs("button", { className: "secondary", onClick: () => setShowContactPrivacy((prev) => !prev), children: [_jsx("span", { className: "icon-label", children: _jsx(UiIcon, { name: "privacy" }) }), _jsx("span", { children: "Privacy" })] })), selectedConversation.type !== "direct" && (_jsxs("button", { className: "secondary", onClick: () => setShowManagePanel((prev) => !prev), children: [_jsx("span", { className: "icon-label", children: _jsx(UiIcon, { name: "manage" }) }), showManagePanel ? "Close" : "Manage"] })), _jsxs("select", { value: focusMinutes, onChange: (event) => setFocusMinutes(Number(event.target.value)), children: [_jsx("option", { value: 15, children: "15m" }), _jsx("option", { value: 30, children: "30m" }), _jsx("option", { value: 60, children: "1h" }), _jsx("option", { value: 180, children: "3h" })] }), _jsxs("button", { className: "secondary", onClick: handleToggleFocus, children: [_jsx("span", { className: "icon-label", children: _jsx(UiIcon, { name: "focus" }) }), focusActive ? "Disable focus" : "Enable focus"] }), selectedConversation.type === "direct" && (_jsxs(_Fragment, { children: [_jsxs("button", { className: "secondary", onClick: () => handleStartCall("audio"), disabled: callState.status !== "idle", children: [_jsx("span", { className: "icon-label", children: _jsx(UiIcon, { name: "call" }) }), "Call"] }), _jsxs("button", { className: "secondary", onClick: () => handleStartCall("video"), disabled: callState.status !== "idle", children: [_jsx("span", { className: "icon-label", children: _jsx(UiIcon, { name: "video" }) }), "Video"] })] })), _jsxs("button", { className: "secondary", onClick: () => setShowConversationInfo((prev) => !prev), children: [_jsx("span", { className: "icon-label", children: _jsx(UiIcon, { name: "info" }) }), showConversationInfo ? "Hide info" : "Info"] }), _jsx("span", { className: "thread-type", children: selectedConversation.type })] })] }), callState.status !== "idle" && (_jsxs("div", { className: "call-panel card", children: [_jsxs("div", { className: "call-header", children: [_jsxs("div", { children: [_jsx("strong", { children: callState.peerUsername
                                                                                ? `Call with ${callState.peerUsername}`
                                                                                : "Call" }), _jsxs("p", { className: "muted", children: [callState.media, " - ", callState.status] })] }), _jsxs("div", { className: "row", children: [callState.status === "incoming" && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: handleAcceptCall, children: "Accept" }), _jsx("button", { className: "secondary", onClick: handleDeclineCall, children: "Decline" })] })), _jsx("button", { className: "secondary", onClick: handleToggleMic, children: micMuted ? "Mic off" : "Mic on" }), _jsx("button", { className: "danger", onClick: handleEndCall, children: "End call" })] })] }), callError && _jsx("p", { className: "note", children: callError }), _jsxs("div", { className: callState.media === "video"
                                                                ? "call-videos"
                                                                : "call-audio", children: [_jsx("video", { ref: remoteVideoRef, autoPlay: true, playsInline: true }), _jsx("video", { ref: localVideoRef, autoPlay: true, playsInline: true, muted: true })] })] })), showContactPrivacy && selectedConversation.type === "direct" && (_jsxs("div", { className: "contact-privacy card", children: [_jsx("h4", { children: "Per-contact privacy" }), _jsxs("label", { className: "toggle", children: [_jsx("input", { type: "checkbox", checked: contactPrivacy.hide_online, onChange: (event) => setContactPrivacy((prev) => ({
                                                                        ...prev,
                                                                        hide_online: event.target.checked
                                                                    })) }), _jsx("span", { children: "Hide online status" })] }), _jsxs("label", { className: "toggle", children: [_jsx("input", { type: "checkbox", checked: contactPrivacy.hide_last_seen, onChange: (event) => setContactPrivacy((prev) => ({
                                                                        ...prev,
                                                                        hide_last_seen: event.target.checked
                                                                    })) }), _jsx("span", { children: "Hide last seen" })] }), _jsxs("label", { className: "toggle", children: [_jsx("input", { type: "checkbox", checked: contactPrivacy.hide_profile_photo, onChange: (event) => setContactPrivacy((prev) => ({
                                                                        ...prev,
                                                                        hide_profile_photo: event.target.checked
                                                                    })) }), _jsx("span", { children: "Hide profile photo" })] }), _jsxs("label", { className: "toggle", children: [_jsx("input", { type: "checkbox", checked: contactPrivacy.disable_read_receipts, onChange: (event) => setContactPrivacy((prev) => ({
                                                                        ...prev,
                                                                        disable_read_receipts: event.target.checked
                                                                    })) }), _jsx("span", { children: "Disable read receipts" })] }), _jsxs("label", { className: "toggle", children: [_jsx("input", { type: "checkbox", checked: contactPrivacy.disable_typing_indicator, onChange: (event) => setContactPrivacy((prev) => ({
                                                                        ...prev,
                                                                        disable_typing_indicator: event.target.checked
                                                                    })) }), _jsx("span", { children: "Disable typing indicator" })] }), directPartner && fingerprintsByUser[directPartner] && (_jsxs("div", { className: "security-section", children: [_jsx("h5", { children: "Security" }), _jsxs("div", { className: "muted", children: ["Key fingerprint: ", fingerprintsByUser[directPartner]] }), verifiedKeysByUser[directPartner] ? (_jsxs("div", { className: "note", children: ["Verified", " ", new Date(verifiedKeysByUser[directPartner].verifiedAt).toLocaleDateString(), _jsx("button", { className: "ghost small", onClick: () => handleClearVerifiedKey(directPartner, 1), children: "Clear verification" })] })) : (_jsx("button", { className: "secondary", onClick: () => handleVerifyKey(directPartner, 1), children: "Mark key verified" }))] })), _jsxs("div", { className: "row", children: [_jsx("button", { onClick: handleContactPrivacySave, children: "Save" }), _jsx("button", { className: "secondary", onClick: () => setShowContactPrivacy(false), children: "Cancel" })] })] })), showManagePanel && selectedConversation.type !== "direct" && (_jsxs("div", { className: "manage-panel card", children: [_jsxs("div", { className: "manage-header", children: [_jsxs("div", { children: [_jsxs("h4", { children: ["Manage ", selectedConversation.type] }), _jsxs("p", { className: "muted", children: ["Visibility: ", selectedConversation.visibility] })] }), _jsx("button", { className: "secondary", onClick: () => refreshRoster(selectedConversation.id).catch(() => undefined), children: "Refresh" })] }), _jsxs("div", { className: "manage-grid", children: [_jsxs("div", { children: [_jsx("h5", { children: "Local controls" }), _jsxs("label", { className: "toggle", children: [_jsx("input", { type: "checkbox", checked: forwardRulesByConversation[selectedConversation.id] ??
                                                                                        true, onChange: (event) => setForwardRulesByConversation((prev) => ({
                                                                                        ...prev,
                                                                                        [selectedConversation.id]: event.target.checked
                                                                                    })) }), _jsx("span", { children: "Allow forwarding" })] }), _jsxs("label", { className: "toggle", children: [_jsx("input", { type: "checkbox", checked: quietHoursByConversation[selectedConversation.id]
                                                                                        ?.enabled || false, onChange: (event) => setQuietHoursByConversation((prev) => ({
                                                                                        ...prev,
                                                                                        [selectedConversation.id]: {
                                                                                            enabled: event.target.checked,
                                                                                            start: prev[selectedConversation.id]?.start || "22:00",
                                                                                            end: prev[selectedConversation.id]?.end || "08:00"
                                                                                        }
                                                                                    })) }), _jsx("span", { children: "Quiet hours" })] }), _jsxs("div", { className: "row", children: [_jsx("input", { type: "time", value: quietHoursByConversation[selectedConversation.id]
                                                                                        ?.start || "22:00", onChange: (event) => setQuietHoursByConversation((prev) => ({
                                                                                        ...prev,
                                                                                        [selectedConversation.id]: {
                                                                                            enabled: prev[selectedConversation.id]?.enabled || false,
                                                                                            start: event.target.value,
                                                                                            end: prev[selectedConversation.id]?.end || "08:00"
                                                                                        }
                                                                                    })) }), _jsx("input", { type: "time", value: quietHoursByConversation[selectedConversation.id]
                                                                                        ?.end || "08:00", onChange: (event) => setQuietHoursByConversation((prev) => ({
                                                                                        ...prev,
                                                                                        [selectedConversation.id]: {
                                                                                            enabled: prev[selectedConversation.id]?.enabled || false,
                                                                                            start: prev[selectedConversation.id]?.start || "22:00",
                                                                                            end: event.target.value
                                                                                        }
                                                                                    })) })] }), _jsx("div", { className: "muted", children: "Server rules apply when you save settings." }), _jsx("button", { className: "secondary", onClick: handleSaveConversationSettings, disabled: !canManageConversation, children: "Save settings" })] }), _jsxs("div", { children: [_jsx("h5", { children: "Members" }), selectedConversation.visibility === "public" ? (_jsxs("div", { className: "row", children: [_jsx("input", { value: manageUsername, onChange: (event) => setManageUsername(event.target.value), placeholder: "username" }), _jsx("button", { onClick: handleAddMember, children: "Add" })] })) : (_jsx("p", { className: "note", children: "Private chats accept members via invite links." })), _jsx("div", { className: "manage-list", children: roster.map((member) => (_jsxs("div", { className: "manage-item", children: [_jsxs("div", { children: [_jsx("strong", { children: member.username }), _jsx("span", { className: "muted", children: member.role })] }), _jsxs("div", { className: "manage-actions", children: [member.role === "member" && (_jsx("button", { className: "secondary", onClick: () => handlePromoteMember(member.username), children: "Make admin" })), member.role === "admin" && (_jsxs(_Fragment, { children: [_jsx("button", { className: "secondary", onClick: () => handleDemoteMember(member.username), children: "Remove admin" }), _jsxs("label", { className: "toggle inline", children: [_jsx("input", { type: "checkbox", checked: Boolean(member.permissions?.manage_members), onChange: (event) => handleUpdateAdminPerms(member.username, {
                                                                                                                    manage_members: event.target.checked,
                                                                                                                    manage_invites: member.permissions?.manage_invites
                                                                                                                }) }), _jsx("span", { children: "Manage members" })] }), _jsxs("label", { className: "toggle inline", children: [_jsx("input", { type: "checkbox", checked: Boolean(member.permissions?.manage_invites), onChange: (event) => handleUpdateAdminPerms(member.username, {
                                                                                                                    manage_members: member.permissions?.manage_members,
                                                                                                                    manage_invites: event.target.checked
                                                                                                                }) }), _jsx("span", { children: "Manage invites" })] })] })), member.role !== "owner" && (_jsx("button", { className: "danger", onClick: () => handleRemoveMember(member.username), children: "Remove" }))] })] }, member.id))) })] }), selectedConversation.visibility === "private" && (_jsxs("div", { children: [_jsx("h5", { children: "Invite links" }), _jsxs("div", { className: "row", children: [_jsx("input", { type: "number", value: inviteMaxUses, min: 1, onChange: (event) => setInviteMaxUses(Number(event.target.value)), placeholder: "max uses" }), _jsx("input", { type: "number", value: inviteExpiresMinutes, min: 1, onChange: (event) => setInviteExpiresMinutes(Number(event.target.value)), placeholder: "expires (minutes)" }), _jsx("button", { onClick: handleCreateInvite, children: "Create link" })] }), _jsx("div", { className: "manage-list", children: inviteLinks.map((invite) => (_jsxs("div", { className: "manage-item", children: [_jsxs("div", { children: [_jsx("strong", { children: `${window.location.origin}/#invite=${invite.token}` }), _jsxs("span", { className: "muted", children: ["Uses ", invite.uses, "/", invite.maxUses] }), _jsxs("span", { className: "muted", children: ["Expires", " ", invite.expiresAt
                                                                                                        ? new Date(invite.expiresAt).toLocaleString()
                                                                                                        : "never"] })] }), _jsxs("div", { className: "manage-actions", children: [_jsx("button", { className: "secondary", onClick: () => navigator.clipboard
                                                                                                    .writeText(`${window.location.origin}/#invite=${invite.token}`)
                                                                                                    .catch(() => undefined), children: "Copy" }), _jsx("button", { className: "danger", onClick: () => handleRevokeInvite(invite.token), children: "Revoke" })] })] }, invite.token))) })] }))] })] })), _jsxs("div", { className: "search-panel", children: [_jsx("input", { className: "search", value: messageQuery, onChange: (event) => setMessageQuery(event.target.value), placeholder: "Search in messages" }), _jsxs("div", { className: "filter-row", children: [_jsxs("select", { value: messageFilters.type, onChange: (event) => setMessageFilters((prev) => ({
                                                                        ...prev,
                                                                        type: event.target.value
                                                                    })), children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "text", children: "Text" }), _jsx("option", { value: "link", children: "Links" }), _jsx("option", { value: "image", children: "Images" }), _jsx("option", { value: "video", children: "Videos" }), _jsx("option", { value: "audio", children: "Audio" }), _jsx("option", { value: "file", children: "Files" }), _jsx("option", { value: "location", children: "Locations" })] }), _jsx("input", { value: messageFilters.sender, onChange: (event) => setMessageFilters((prev) => ({
                                                                        ...prev,
                                                                        sender: event.target.value
                                                                    })), placeholder: "Sender" }), _jsx("input", { type: "date", value: messageFilters.from, onChange: (event) => setMessageFilters((prev) => ({
                                                                        ...prev,
                                                                        from: event.target.value
                                                                    })) }), _jsx("input", { type: "date", value: messageFilters.to, onChange: (event) => setMessageFilters((prev) => ({
                                                                        ...prev,
                                                                        to: event.target.value
                                                                    })) })] })] }), pinnedMessages.length > 0 && (_jsxs("div", { className: "pinned", children: [_jsx("h4", { children: "Pinned" }), pinnedMessages.map((msg) => (_jsxs("div", { className: "pinned-item", children: [_jsxs("span", { children: [msg.sender, ":"] }), _jsx("span", { children: getPreview(msg.payload) })] }, `pin-${msg.id}`)))] })), quietHoursActive && (_jsx("div", { className: "quiet-hours-banner", children: "Quiet hours are active for this chat. Messages will be muted." })), pinnedMediaItems.length > 0 && (_jsxs("div", { className: "pinned-media", children: [_jsx("h4", { children: "Pinned media" }), _jsx("div", { className: "pinned-media-list", children: pinnedMediaItems.map((item) => {
                                                                const url = resolveAttachmentUrl(item.attachment);
                                                                return (_jsxs("div", { className: "pinned-media-item", children: [item.attachment.kind === "image" && url && (_jsx("img", { src: url, alt: item.attachment.name, onClick: () => setLightboxSrc(url) })), item.attachment.kind === "video" && url && (_jsx("video", { src: url, controls: true })), item.attachment.kind === "audio" && url && (_jsx("audio", { src: url, controls: true })), item.attachment.kind === "file" && url && (_jsx("a", { href: url, target: "_blank", rel: "noreferrer", children: item.attachment.name })), !url && item.attachment.storageKey && (_jsx("button", { className: "secondary", onClick: () => ensureAttachmentUrl(item.attachment), children: "Load" })), _jsx("button", { className: "secondary", onClick: () => handleTogglePinnedMedia(item.message, item.index), children: "Unpin" })] }, item.key));
                                                            }) })] })), _jsxs("div", { className: "messages", ref: messageListRef, children: [selectedConversationId &&
                                                            !historyExhausted[selectedConversationId] && (_jsx("button", { className: "load-older", onClick: loadOlderMessages, disabled: historyLoading, children: historyLoading ? "Loading..." : "Load older messages" })), messageItems.length === 0 && (_jsx("p", { className: "muted", children: "No messages yet." })), messageItems.map((item) => item.kind === "date" ? (_jsx("div", { className: "date-separator", children: _jsx("span", { children: item.label }) }, item.id)) : (_jsxs("div", { className: item.message.sender === sessionUsername
                                                                ? "message own"
                                                                : "message", children: [_jsxs("div", { className: "meta", children: [_jsxs("span", { className: "sender", children: [item.message.sender, item.message.sender === "system" && (_jsx("span", { className: "verified-badge", title: "Verified system", children: "ok" }))] }), _jsxs("span", { className: "meta-right", children: [_jsxs("span", { title: new Date(item.message.createdAt).toLocaleString(), children: [formatTime(item.message.createdAt, displayTimeZone), " - ", formatDateLabel(item.message.createdAt, displayTimeZone)] }), item.message.sender === sessionUsername && (_jsx("span", { className: "tick", children: getStatusMark(item.message.groupId) }))] })] }), item.message.payload.oneTime && (_jsx("div", { className: "one-time-badge", children: "One-time message" })), item.message.payload.forwardedFrom && (_jsxs("div", { className: "one-time-badge", children: ["Forwarded from ", item.message.payload.forwardedFrom] })), item.message.payload.text && (_jsx("div", { className: "text", children: renderMessageText(item.message.payload.text, messageQuery) })), settingsPrefs.advanced.autoTranslate &&
                                                                    item.message.payload.text &&
                                                                    translationCache[`${item.message.id}:${item.message.payload.text}`] && (_jsx("div", { className: "translation", children: translationCache[`${item.message.id}:${item.message.payload.text}`] })), item.message.payload.linkPreview && (_jsxs("div", { className: "link-preview", children: [item.message.payload.linkPreview.image && (_jsx("img", { src: item.message.payload.linkPreview.image, alt: item.message.payload.linkPreview.title || "preview" })), _jsxs("div", { children: [_jsx("strong", { children: item.message.payload.linkPreview.title ||
                                                                                        item.message.payload.linkPreview.siteName ||
                                                                                        "Link preview" }), item.message.payload.linkPreview.description && (_jsx("div", { className: "muted", children: item.message.payload.linkPreview.description })), _jsx("a", { href: item.message.payload.linkPreview.url, target: "_blank", rel: "noreferrer", children: item.message.payload.linkPreview.url })] })] })), item.message.payload.attachments.map((attachment, index) => {
                                                                    const attachmentUrl = resolveAttachmentUrl(attachment);
                                                                    const needsLoad = !attachmentUrl && attachment.storageKey;
                                                                    const isPinnedMedia = selectedConversationId &&
                                                                        (pinnedMediaByConversation[selectedConversationId] || []).includes(attachmentKey(item.message.id, index));
                                                                    const location = attachment.kind === "location"
                                                                        ? parseLocationData(attachment.data)
                                                                        : null;
                                                                    const mapUrl = location
                                                                        ? `https://www.openstreetmap.org/?mlat=${encodeURIComponent(String(location.lat))}&mlon=${encodeURIComponent(String(location.lng))}#map=16/${encodeURIComponent(String(location.lat))}/${encodeURIComponent(String(location.lng))}`
                                                                        : null;
                                                                    return (_jsxs("div", { className: "attachment", children: [needsLoad && (_jsx("button", { className: "secondary", onClick: () => ensureAttachmentUrl(attachment), children: "Load attachment" })), attachment.kind === "image" && attachmentUrl && (_jsx("img", { src: attachmentUrl, alt: attachment.name, onClick: () => setLightboxSrc(attachmentUrl) })), attachment.kind === "audio" && attachmentUrl && (_jsx("audio", { controls: true, src: attachmentUrl, onLoadedMetadata: (event) => {
                                                                                    const key = `${item.message.id}-${index}`;
                                                                                    setAudioDurations((prev) => ({
                                                                                        ...prev,
                                                                                        [key]: event.currentTarget.duration
                                                                                    }));
                                                                                } })), attachment.kind === "video" && attachmentUrl && (_jsx("video", { controls: true, src: attachmentUrl })), attachment.kind === "file" && attachmentUrl && (_jsx("a", { className: "file-link", href: attachmentUrl, download: attachment.name, children: attachment.name })), attachment.kind === "location" && (_jsxs("div", { className: "location-card", children: [_jsxs("div", { className: "location-title", children: [location?.live ? "Live location" : "Location", location?.live && (_jsx("span", { className: "live-pill", children: "LIVE" }))] }), _jsxs("div", { className: "location-meta", children: [location
                                                                                                ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                                                                                                : "Location data unavailable", location?.accuracy &&
                                                                                                ` · ±${Math.round(location.accuracy)}m`] }), location?.expiresAt && (_jsxs("div", { className: "location-meta", children: ["Updates until", " ", new Date(location.expiresAt).toLocaleTimeString()] })), mapUrl && (_jsx("div", { className: "location-actions", children: _jsx("a", { href: mapUrl, target: "_blank", rel: "noreferrer", children: "Open map" }) }))] })), attachment.kind === "audio" &&
                                                                                audioDurations[`${item.message.id}-${index}`] && (_jsxs("div", { className: "file-name", children: [attachment.name, " - ", audioDurations[`${item.message.id}-${index}`].toFixed(1), "s"] })), attachment.kind === "video" && (_jsx("div", { className: "file-name", children: attachment.name })), attachment.kind === "file" && (_jsx("div", { className: "file-name", children: attachment.name })), attachment.kind === "image" && (_jsx("div", { className: "file-name", children: attachment.name })), attachment.kind !== "location" && (_jsx("button", { className: "secondary", onClick: () => handleTogglePinnedMedia(item.message, index), children: isPinnedMedia ? "Unpin media" : "Pin media" }))] }, `${item.message.id}-${index}`));
                                                                }), _jsxs("div", { className: "message-actions", children: [_jsx("button", { className: pinnedIds.has(String(item.message.id))
                                                                                ? "action active"
                                                                                : "action", onClick: () => handleTogglePinned(String(item.message.id)), children: "Pin" }), _jsx("button", { className: starredIds.has(String(item.message.id))
                                                                                ? "action active"
                                                                                : "action", onClick: () => handleToggleStarred(item.message), children: "Star" }), _jsx("button", { className: "action", onClick: () => handleForwardSelect(item.message), children: "Forward" }), _jsx("button", { className: "action danger", onClick: () => handleDelete(item.message), children: "Delete" })] })] }, item.message.id))), _jsx("div", { ref: messageEndRef })] }), showJumpToBottom && (_jsx("button", { className: "jump-bottom", onClick: () => messageEndRef.current?.scrollIntoView({ behavior: "smooth" }), children: "Jump to latest" })), selectedConversation?.type === "channel" &&
                                                    selectedConversation.name === "System" ? (_jsx("div", { className: "note", children: "System channel is read-only. You can view announcements here." })) : (_jsxs("div", { className: "composer", children: [_jsxs("div", { className: "composer-bar", children: [_jsxs("label", { className: "file-input", children: ["Add files", _jsx("input", { type: "file", multiple: true, accept: "*/*", onChange: handleAttachmentChange })] }), _jsxs("label", { className: "schedule-input", children: ["Schedule", _jsx("input", { type: "datetime-local", value: scheduledAt, onChange: (event) => setScheduledAt(event.target.value) })] }), scheduledAt && (_jsx("button", { className: "secondary", onClick: () => setScheduledAt(""), children: "Clear schedule" })), _jsx("button", { className: "secondary location-button", onClick: handleSendLocation, disabled: !selectedConversationId || !locationSupported, children: "Send location" }), _jsx("button", { className: liveLocationActive
                                                                        ? "secondary location-button live"
                                                                        : "secondary location-button", onClick: () => liveLocationActive
                                                                        ? stopLiveLocationShare(true)
                                                                        : startLiveLocationShare(), disabled: !selectedConversationId || !locationSupported, children: liveLocationActive ? "Stop live" : "Live location" })] }), quickReplies.length > 0 && (_jsx("div", { className: "quick-replies", children: quickReplies.map((reply, index) => (_jsx("button", { className: "secondary", onClick: () => setMessageText((prev) => prev ? `${prev} ${reply}` : reply), children: reply }, `quick-${index}`))) })), liveLocationActive && liveLocationExpiresAt && (_jsxs("div", { className: "live-location-banner", children: [_jsxs("span", { children: ["Live location active until", " ", new Date(liveLocationExpiresAt).toLocaleTimeString()] }), _jsx("button", { className: "secondary", onClick: () => stopLiveLocationShare(true), children: "Stop" })] })), _jsxs("div", { className: "composer-main", children: [_jsx("textarea", { value: messageText, onChange: (event) => {
                                                                        setMessageText(event.target.value);
                                                                        handleTyping();
                                                                    }, onKeyDown: (event) => {
                                                                        const enterToSend = settingsPrefs.chat.enterToSend;
                                                                        const shouldSend = enterToSend
                                                                            ? event.key === "Enter" && !event.shiftKey
                                                                            : event.key === "Enter" && event.ctrlKey;
                                                                        if (shouldSend) {
                                                                            event.preventDefault();
                                                                            handleSend();
                                                                        }
                                                                    }, placeholder: "Type a message (emoji supported)" }), _jsx("button", { className: "send", onClick: handleSend, disabled: (!messageText && attachments.length === 0) ||
                                                                        uploadQueue.some((item) => item.status === "uploading") ||
                                                                        !selectedConversationId, children: _jsx(UiIcon, { name: "send" }) })] }), selectedConversation &&
                                                            selectedConversation.type !== "direct" &&
                                                            composerSpamScore >= 6 && (_jsx("div", { className: "spam-warning", children: "High spam score detected. Review before sending." })), showKeyBackupWarning && (_jsx("div", { className: "note warning", children: "Export your encryption keys in Settings to keep access to past messages after reinstall or browser reset." })), attachments.length > 0 && (_jsx("div", { className: "attachments-preview", children: attachments.map((file, index) => (_jsx("span", { children: file.name }, `${file.name}-${index}`))) })), uploadQueue.length > 0 && (_jsx("div", { className: "attachments-preview uploads", children: uploadQueue.map((item) => (_jsxs("div", { className: "upload-item", children: [_jsx("span", { children: item.name }), _jsxs("span", { children: [item.status === "uploading" && `${item.progress}%`, item.status === "done" && "Done", item.status === "failed" && "Failed"] }), item.status === "failed" && (_jsx("button", { className: "link", onClick: () => retryUpload(item.id), children: "Retry" }))] }, item.id))) })), scheduledAt && (_jsxs("div", { className: "note", children: ["Scheduled for ", new Date(scheduledAt).toLocaleString()] }))] }))] }), _jsxs("aside", { className: "chat-side-column", children: [_jsxs("div", { className: "chat-profile-card card", children: [_jsxs("div", { className: "chat-profile-art", children: [_jsx("div", { className: "chat-profile-backdrop" }), _jsx("div", { className: "avatar large chat-profile-avatar", children: activeProfileAvatar ? (_jsx("img", { src: activeProfileAvatar, alt: activeProfileName })) : (_jsx("span", { children: getInitials(activeProfileName) })) })] }), _jsxs("div", { className: "chat-profile-copy", children: [_jsx("h3", { children: activeProfileName }), _jsx("span", { className: "chat-profile-handle", children: activeProfileHandle }), _jsx("p", { children: activeProfileBio }), _jsxs("div", { className: "chat-profile-presence", children: [_jsx("span", { className: directStatus?.online ? "dot online" : "dot" }), activeProfileStatus] })] }), _jsxs("div", { className: "chat-profile-actions", children: [_jsxs("button", { className: "secondary", onClick: () => setShowConversationInfo((prev) => !prev), children: [_jsx("span", { className: "icon-label", children: _jsx(UiIcon, { name: "message" }) }), "Message"] }), selectedConversation.type === "direct" && (_jsxs(_Fragment, { children: [_jsxs("button", { className: "secondary", onClick: () => handleStartCall("audio"), disabled: callState.status !== "idle", children: [_jsx("span", { className: "icon-label", children: _jsx(UiIcon, { name: "call" }) }), "Call"] }), _jsxs("button", { className: "secondary", onClick: () => handleStartCall("video"), disabled: callState.status !== "idle", children: [_jsx("span", { className: "icon-label", children: _jsx(UiIcon, { name: "video" }) }), "Video"] })] })), selectedConversation.type !== "direct" && (_jsxs("button", { className: "secondary", onClick: () => setShowManagePanel((prev) => !prev), children: [_jsx("span", { className: "icon-label", children: _jsx(UiIcon, { name: "manage" }) }), "Manage"] }))] })] }), showConversationInfo && (_jsx("div", { className: "conversation-info card conversation-info-side", children: selectedConversation.type === "direct" && directPartner ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "conversation-info-profile", children: [_jsx("div", { className: "avatar large", children: publicProfiles[directPartner]?.avatar ? (_jsx("img", { src: publicProfiles[directPartner].avatar || "", alt: directPartner })) : (_jsx("span", { children: getInitials(directPartner) })) }), _jsxs("div", { children: [_jsxs("h3", { children: ["@", directPartner] }), _jsx("p", { className: "muted", children: directStatus?.online
                                                                                    ? "Online"
                                                                                    : directStatus
                                                                                        ? formatLastSeen(directStatus.lastSeen)
                                                                                        : "Status unavailable" })] })] }), _jsx("p", { children: publicProfiles[directPartner]?.bio || "No bio yet" })] })) : (_jsxs(_Fragment, { children: [_jsx("h3", { children: getConversationTitle(selectedConversation, sessionUsername) }), _jsxs("p", { className: "muted", children: [selectedConversation.type, " \u00B7", " ", selectedConversation.members.length, " members"] }), _jsx("div", { className: "conversation-info-members", children: selectedConversation.members.map((member) => (_jsxs("span", { children: ["@", member.username] }, member.username))) })] })) })), sharedMediaPreviewItems.length > 0 && (_jsxs("div", { className: "chat-side-card card", children: [_jsxs("div", { className: "chat-side-header", children: [_jsx("h4", { children: "Media" }), _jsx("span", { children: "Recent" })] }), _jsx("div", { className: "chat-media-grid", children: sharedMediaPreviewItems.map((item) => {
                                                                const url = resolveAttachmentUrl(item.attachment);
                                                                if (!url && item.attachment.storageKey) {
                                                                    return (_jsx("button", { className: "chat-media-tile loading", onClick: () => ensureAttachmentUrl(item.attachment), children: "Load" }, item.key));
                                                                }
                                                                return (_jsx("button", { className: "chat-media-tile", onClick: () => url && setLightboxSrc(url), children: item.attachment.kind === "video" && url ? (_jsx("video", { src: url, muted: true })) : url ? (_jsx("img", { src: url, alt: item.attachment.name })) : (_jsx("span", { children: item.attachment.name })) }, item.key));
                                                            }) })] })), sharedFilePreviewItems.length > 0 && (_jsxs("div", { className: "chat-side-card card", children: [_jsxs("div", { className: "chat-side-header", children: [_jsx("h4", { children: "Files" }), _jsx("span", { children: "Shared" })] }), _jsx("div", { className: "chat-file-list", children: sharedFilePreviewItems.map((item) => {
                                                                const url = resolveAttachmentUrl(item.attachment);
                                                                return (_jsxs("div", { className: "chat-file-row", children: [_jsxs("div", { children: [_jsx("strong", { children: item.attachment.name }), _jsx("span", { children: item.attachment.kind })] }), url ? (_jsx("a", { href: url, target: "_blank", rel: "noreferrer", children: "Open" })) : item.attachment.storageKey ? (_jsx("button", { className: "secondary", onClick: () => ensureAttachmentUrl(item.attachment), children: "Load" })) : null] }, item.key));
                                                            }) })] }))] })] }) }))] })] })), pendingForwardMessage && (_jsx("div", { className: "forward-modal", onClick: () => setPendingForwardMessage(null), children: _jsxs("div", { className: "forward-card", onClick: (event) => event.stopPropagation(), children: [_jsx("h3", { children: "Forward message" }), _jsx("p", { className: "muted", children: "Choose a conversation to forward to." }), _jsx("div", { className: "forward-list", children: conversations.map((conv) => (_jsxs("button", { className: forwardTargetId === conv.id ? "secondary" : "ghost", onClick: () => setForwardTargetId(conv.id), disabled: conv.forwardEnabled === false, children: [getConversationTitle(conv, sessionUsername), conv.forwardEnabled === false && " (Forwarding disabled)"] }, `forward-${conv.id}`))) }), _jsxs("div", { className: "row", children: [_jsx("button", { onClick: handleForwardSend, disabled: !forwardTargetId, children: "Forward" }), _jsx("button", { className: "secondary", onClick: () => setPendingForwardMessage(null), children: "Cancel" })] })] }) })), status && _jsx("div", { className: "status", children: status }), lightboxSrc && (_jsx("div", { className: "lightbox", onClick: () => setLightboxSrc(null), children: _jsx("img", { src: lightboxSrc, alt: "Preview" }) }))] }));
}
