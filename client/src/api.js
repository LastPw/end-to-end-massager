export const API_BASE = import.meta.env.VITE_API_BASE ||
    (typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? ""
        : "http://localhost:3001");
let authToken = null;
let accessExpiresAt = null;
let adminToken = null;
export function setAuthSession(token, _refresh, expiresAt) {
    authToken = token;
    accessExpiresAt = expiresAt;
}
export function setAdminToken(token) {
    adminToken = token;
}
export function getAuthSessionState() {
    return { token: authToken, refreshToken: null, expiresAt: accessExpiresAt };
}
function withCredentials(init = {}) {
    return {
        ...init,
        credentials: "include"
    };
}
function authHeaders() {
    if (!authToken) {
        return {};
    }
    return { Authorization: `Bearer ${authToken}` };
}
function adminHeaders() {
    if (!adminToken) {
        return {};
    }
    return { Authorization: `Bearer ${adminToken}` };
}
export async function signup(phone, firstName, lastName, username, password, publicKey, deviceId, deviceName, deviceInfo) {
    const response = await fetch(`${API_BASE}/api/auth/signup`, {
        ...withCredentials({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone,
                firstName,
                lastName,
                username,
                password,
                publicKey,
                deviceId,
                deviceName,
                deviceInfo
            })
        })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Signup failed");
    }
    return response.json();
}
export async function login(phone, password, deviceId, deviceName, deviceInfo) {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
        ...withCredentials({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                phone,
                password,
                deviceId,
                deviceName,
                deviceInfo
            })
        })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Login failed");
    }
    return response.json();
}
export async function refreshSession(deviceId) {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        ...withCredentials({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deviceId })
        })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Refresh failed");
    }
    const data = await response.json();
    setAuthSession(data.token, null, data.expiresAt);
    return data;
}
export async function requestWsTicket() {
    const response = await fetch(`${API_BASE}/api/auth/ws-ticket`, {
        ...withCredentials({
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            }
        })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "WS ticket failed");
    }
    return response.json();
}
export async function reportDecryptFailure(details) {
    const response = await fetch(`${API_BASE}/api/metrics/decrypt-failed`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(details || {})
    });
    if (!response.ok) {
        return;
    }
}
export async function fetchPublicKey(username) {
    const response = await fetch(`${API_BASE}/api/users/${username}/public-key`);
    if (!response.ok) {
        throw new Error((await response.json()).error || "User not found");
    }
    return response.json();
}
export async function fetchPublicProfile(username) {
    const response = await fetch(`${API_BASE}/api/users/${username}/profile-private`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Profile not available");
    }
    return response.json();
}
export async function fetchProfile() {
    const response = await fetch(`${API_BASE}/api/profile`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Profile load failed");
    }
    return response.json();
}
export async function updateProfile(payload) {
    const response = await fetch(`${API_BASE}/api/profile`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Profile update failed");
    }
    return response.json();
}
export async function publishKeyBundle(payload) {
    const response = await fetch(`${API_BASE}/api/keys/publish`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Key publish failed");
    }
    return response.json();
}
export async function fetchKeyBundle(username) {
    const response = await fetch(`${API_BASE}/api/keys/bundle/${username}`);
    if (!response.ok) {
        throw new Error((await response.json()).error || "Key bundle unavailable");
    }
    return response.json();
}
export async function listConversations() {
    const response = await fetch(`${API_BASE}/api/conversations`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Load conversations failed");
    }
    return response.json();
}
export async function createConversation(type, name, members, visibility = null) {
    const response = await fetch(`${API_BASE}/api/conversations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({
            type,
            name,
            members,
            ...(visibility ? { visibility } : {})
        })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Create failed");
    }
    return response.json();
}
export async function fetchRoster(conversationId) {
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/roster`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Roster load failed");
    }
    return response.json();
}
export async function addConversationMember(conversationId, username) {
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/members/add`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ username })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Add member failed");
    }
    return response.json();
}
export async function removeConversationMember(conversationId, username) {
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/members/remove`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ username })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Remove member failed");
    }
    return response.json();
}
export async function updateConversationRole(conversationId, username, role, permissions) {
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/role`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ username, role, permissions })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Role update failed");
    }
    return response.json();
}
export async function createInviteLink(conversationId, maxUses, expiresInMinutes) {
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/invites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ maxUses, expiresInMinutes })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Invite create failed");
    }
    return response.json();
}
export async function listInviteLinks(conversationId) {
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/invites`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Invite list failed");
    }
    return response.json();
}
export async function revokeInviteLink(token) {
    const response = await fetch(`${API_BASE}/api/conversations/invites/revoke`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ token })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Invite revoke failed");
    }
    return response.json();
}
export async function redeemInviteLink(token) {
    const response = await fetch(`${API_BASE}/api/invites/redeem`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ token })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Invite redeem failed");
    }
    return response.json();
}
export async function fetchMembers(conversationId) {
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/members`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Load members failed");
    }
    return response.json();
}
export async function fetchConversationSettings(conversationId) {
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/settings`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Load settings failed");
    }
    return response.json();
}
export async function updateConversationSettings(conversationId, payload) {
    const response = await fetch(`${API_BASE}/api/conversations/${conversationId}/settings`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Update settings failed");
    }
    return response.json();
}
export async function sendMessage(conversationId, payloads, forwarded = false) {
    const response = await fetch(`${API_BASE}/api/messages/send`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ conversationId, payloads, forwarded })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Send failed");
    }
    return response.json();
}
export async function scheduleMessage(conversationId, scheduledFor, payloads, forwarded = false) {
    const response = await fetch(`${API_BASE}/api/messages/schedule`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ conversationId, scheduledFor, payloads, forwarded })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Schedule failed");
    }
    return response.json();
}
export async function fetchLinkPreview(url) {
    const response = await fetch(`${API_BASE}/api/link-preview?url=${encodeURIComponent(url)}`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Preview failed");
    }
    return response.json();
}
export async function pollMessages(since, sinceId = 0, limit = 50) {
    const response = await fetch(`${API_BASE}/api/messages/poll?since=${since}&sinceId=${sinceId}&limit=${limit}`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Poll failed");
    }
    return response.json();
}
export async function pollSentStatuses(since, limit = 50) {
    const response = await fetch(`${API_BASE}/api/messages/sent?since=${since}&limit=${limit}`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Status poll failed");
    }
    return response.json();
}
export async function fetchMessageHistory(conversationId, before, limit = 50) {
    const response = await fetch(`${API_BASE}/api/messages/history?conversationId=${conversationId}&before=${before}&limit=${limit}`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "History load failed");
    }
    return response.json();
}
export async function markRead(conversationId) {
    const response = await fetch(`${API_BASE}/api/messages/read`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ conversationId })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Read update failed");
    }
    return response.json();
}
export async function deleteMessage(payload) {
    const response = await fetch(`${API_BASE}/api/messages/delete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Delete failed");
    }
    return response.json();
}
export async function reportMessage(payload) {
    const response = await fetch(`${API_BASE}/api/reports/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Report failed");
    }
    return response.json();
}
export async function adminSendSystemMessage(payload) {
    const response = await fetch(`${API_BASE}/api/admin/system-message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...adminHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "System message failed");
    }
    return response.json();
}
export async function adminUploadDirect(file) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${API_BASE}/api/admin/uploads/direct`, {
        method: "POST",
        headers: {
            ...adminHeaders()
        },
        body: form
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Admin upload failed");
    }
    return response.json();
}
export async function createUpload(payload) {
    const response = await fetch(`${API_BASE}/api/uploads/presign`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Upload init failed");
    }
    return response.json();
}
export async function createDownloadUrl(key) {
    const response = await fetch(`${API_BASE}/api/uploads/presign-download`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ key })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Download init failed");
    }
    return response.json();
}
export async function uploadDirect(file) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${API_BASE}/api/uploads/direct`, {
        method: "POST",
        headers: {
            ...authHeaders()
        },
        body: form
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Direct upload failed");
    }
    return response.json();
}
export async function setTyping(conversationId, isTyping) {
    const response = await fetch(`${API_BASE}/api/typing`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ conversationId, isTyping })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Typing update failed");
    }
    return response.json();
}
export async function fetchTyping(conversationId) {
    const response = await fetch(`${API_BASE}/api/typing?conversationId=${conversationId}`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Typing load failed");
    }
    return response.json();
}
export async function fetchUserStatus(username) {
    const response = await fetch(`${API_BASE}/api/users/${username}/status`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Status load failed");
    }
    return response.json();
}
export async function updateContactPrivacy(payload) {
    const response = await fetch(`${API_BASE}/api/privacy/contact`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Privacy update failed");
    }
    return response.json();
}
export async function fetchSocialFeed(params) {
    const query = new URLSearchParams();
    if (params?.kind) {
        query.set("kind", params.kind);
    }
    if (params?.before) {
        query.set("before", String(params.before));
    }
    if (params?.limit) {
        query.set("limit", String(params.limit));
    }
    if (params?.sort) {
        query.set("sort", params.sort);
    }
    const response = await fetch(`${API_BASE}/api/social/feed${query.toString() ? `?${query}` : ""}`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Feed load failed");
    }
    return response.json();
}
export async function fetchSocialStories(limit = 20) {
    const response = await fetch(`${API_BASE}/api/social/stories?limit=${limit}`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Stories load failed");
    }
    return response.json();
}
export async function createSocialPost(payload) {
    const response = await fetch(`${API_BASE}/api/social/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Create post failed");
    }
    return response.json();
}
export async function fetchSocialInsights() {
    const response = await fetch(`${API_BASE}/api/social/insights`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Insights load failed");
    }
    return response.json();
}
export async function fetchSocialNotifications() {
    const response = await fetch(`${API_BASE}/api/social/notifications`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Notifications load failed");
    }
    return response.json();
}
export async function toggleSocialLike(postId) {
    const response = await fetch(`${API_BASE}/api/social/posts/${postId}/like`, {
        method: "POST",
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Like failed");
    }
    return response.json();
}
export async function toggleSocialSave(postId) {
    const response = await fetch(`${API_BASE}/api/social/posts/${postId}/save`, {
        method: "POST",
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Save failed");
    }
    return response.json();
}
export async function addSocialView(postId) {
    const response = await fetch(`${API_BASE}/api/social/posts/${postId}/view`, {
        method: "POST",
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "View failed");
    }
    return response.json();
}
export async function fetchSocialComments(postId) {
    const response = await fetch(`${API_BASE}/api/social/posts/${postId}/comments`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Comments load failed");
    }
    return response.json();
}
export async function createSocialComment(postId, text) {
    const response = await fetch(`${API_BASE}/api/social/posts/${postId}/comments`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ text })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Comment failed");
    }
    return response.json();
}
export async function followSocialUser(username) {
    const response = await fetch(`${API_BASE}/api/social/follow`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ username })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Follow failed");
    }
    return response.json();
}
export async function unfollowSocialUser(username) {
    const response = await fetch(`${API_BASE}/api/social/unfollow`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify({ username })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Unfollow failed");
    }
    return response.json();
}
export async function fetchSocialFollows() {
    const response = await fetch(`${API_BASE}/api/social/follows`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Follows load failed");
    }
    return response.json();
}
export async function enableTwoFactor(password) {
    const response = await fetch(`${API_BASE}/api/auth/2fa/enable`, {
        ...withCredentials({
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify({ password })
        })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Enable 2FA failed");
    }
    return response.json();
}
export async function disableTwoFactor(password) {
    const response = await fetch(`${API_BASE}/api/auth/2fa/disable`, {
        ...withCredentials({
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            },
            body: JSON.stringify({ password })
        })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Disable 2FA failed");
    }
    return response.json();
}
export async function listDevices() {
    const response = await fetch(`${API_BASE}/api/devices`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Device list failed");
    }
    return response.json();
}
export async function logoutDevice(deviceId) {
    const response = await fetch(`${API_BASE}/api/devices/${deviceId}/logout`, {
        ...withCredentials({
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            }
        })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Device logout failed");
    }
    return response.json();
}
export async function logoutAllDevices() {
    const response = await fetch(`${API_BASE}/api/devices/logout-all`, {
        ...withCredentials({
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            }
        })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Logout all failed");
    }
    return response.json();
}
export async function adminLogin(username, password) {
    const response = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Admin login failed");
    }
    return response.json();
}
export async function adminListAdmins() {
    const response = await fetch(`${API_BASE}/api/admin/admins`, {
        headers: {
            ...adminHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Admin list failed");
    }
    return response.json();
}
export async function adminCreateAdmin(payload) {
    const response = await fetch(`${API_BASE}/api/admin/admins`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...adminHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Admin create failed");
    }
    return response.json();
}
export async function adminUpdateAdminPermissions(payload) {
    const response = await fetch(`${API_BASE}/api/admin/admins/${payload.adminId}/permissions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...adminHeaders()
        },
        body: JSON.stringify({ permissions: payload.permissions })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Admin update failed");
    }
    return response.json();
}
export async function adminGetLockdown() {
    const response = await fetch(`${API_BASE}/api/admin/settings/lockdown`, {
        headers: {
            ...adminHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Lockdown fetch failed");
    }
    return response.json();
}
export async function adminSetLockdown(payload) {
    const response = await fetch(`${API_BASE}/api/admin/settings/lockdown`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...adminHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Lockdown update failed");
    }
    return response.json();
}
export async function adminUpdatePassword(password) {
    const response = await fetch(`${API_BASE}/api/admin/password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...adminHeaders()
        },
        body: JSON.stringify({ password })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Admin update failed");
    }
    return response.json();
}
export async function adminListUsers() {
    const response = await fetch(`${API_BASE}/api/admin/users`, {
        headers: {
            ...adminHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Admin list users failed");
    }
    return response.json();
}
export async function adminUpdateUserFlags(userId, payload) {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/flags`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...adminHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Admin update failed");
    }
    return response.json();
}
export async function adminResetUserPassword(userId, password) {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...adminHeaders()
        },
        body: JSON.stringify({ password })
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Reset failed");
    }
    return response.json();
}
export async function adminDeleteUser(userId) {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/delete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...adminHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Delete failed");
    }
    return response.json();
}
export async function adminListConversations() {
    const response = await fetch(`${API_BASE}/api/admin/conversations`, {
        headers: {
            ...adminHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "List conversations failed");
    }
    return response.json();
}
export async function adminListBlockedEvents(limit = 200) {
    const response = await fetch(`${API_BASE}/api/admin/blocked?limit=${limit}`, {
        headers: {
            ...adminHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Blocked list failed");
    }
    return response.json();
}
export async function adminDownloadUserMetadata(userId) {
    const response = await fetch(`${API_BASE}/api/admin/users/${userId}/profile-json`, {
        headers: {
            ...adminHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Download failed");
    }
    return response.blob();
}
export async function startCall(payload) {
    const response = await fetch(`${API_BASE}/api/calls/start`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Call start failed");
    }
    return response.json();
}
export async function answerCall(payload) {
    const response = await fetch(`${API_BASE}/api/calls/answer`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Call answer failed");
    }
    return response.json();
}
export async function sendIceCandidate(payload) {
    const response = await fetch(`${API_BASE}/api/calls/ice`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "ICE send failed");
    }
    return response.json();
}
export async function endCall(payload) {
    const response = await fetch(`${API_BASE}/api/calls/end`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...authHeaders()
        },
        body: JSON.stringify(payload)
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Call end failed");
    }
    return response.json();
}
export async function pollCalls(since) {
    const response = await fetch(`${API_BASE}/api/calls/poll?since=${since}`, {
        headers: {
            ...authHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Call poll failed");
    }
    return response.json();
}
export async function adminDeleteConversation(conversationId) {
    const response = await fetch(`${API_BASE}/api/admin/conversations/${conversationId}/delete`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...adminHeaders()
        }
    });
    if (!response.ok) {
        throw new Error((await response.json()).error || "Delete failed");
    }
    return response.json();
}
