export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost"
    ? ""
    : "http://localhost:3001");

let authToken: string | null = null;
let accessExpiresAt: number | null = null;
let adminToken: string | null = null;

export function setAuthSession(
  token: string | null,
  _refresh: string | null,
  expiresAt: number | null
): void {
  authToken = token;
  accessExpiresAt = expiresAt;
}

export function setAdminToken(token: string | null): void {
  adminToken = token;
}

export function getAuthSessionState(): {
  token: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
} {
  return { token: authToken, refreshToken: null, expiresAt: accessExpiresAt };
}

function withCredentials(init: RequestInit = {}): RequestInit {
  return {
    ...init,
    credentials: "include"
  };
}

function authHeaders(): HeadersInit {
  if (!authToken) {
    return {};
  }
  return { Authorization: `Bearer ${authToken}` };
}

function adminHeaders(): HeadersInit {
  if (!adminToken) {
    return {};
  }
  return { Authorization: `Bearer ${adminToken}` };
}

export async function signup(
  phone: string,
  firstName: string,
  lastName: string,
  username: string,
  password: string | null,
  publicKey: string,
  deviceId: string,
  deviceName: string,
  deviceInfo: {
    userAgent?: string;
    platform?: string;
    language?: string;
    deviceModel?: string;
  }
) {
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

export async function login(
  phone: string,
  password: string,
  deviceId: string,
  deviceName: string,
  deviceInfo: {
    userAgent?: string;
    platform?: string;
    language?: string;
    deviceModel?: string;
  }
) {
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

export async function refreshSession(deviceId: string) {
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
  return response.json() as Promise<{ ticket: string; expiresAt: number }>;
}

export async function reportDecryptFailure(details?: {
  error?: string;
  sender?: string;
  senderDeviceId?: number;
  messageId?: number | string;
  nonce?: string;
}) {
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

export async function fetchPublicKey(username: string) {
  const response = await fetch(`${API_BASE}/api/users/${username}/public-key`);
  if (!response.ok) {
    throw new Error((await response.json()).error || "User not found");
  }
  return response.json();
}

export async function fetchPublicProfile(username: string) {
  const response = await fetch(
    `${API_BASE}/api/users/${username}/profile-private`,
    {
      headers: {
        ...authHeaders()
      }
    }
  );
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

export async function updateProfile(payload: {
  firstName?: string;
  lastName?: string;
  avatar?: string | null;
  bio?: string;
  profilePublic?: boolean;
  allowDirect?: boolean;
  allowGroupInvite?: boolean;
  privacy?: Partial<{
    hide_online: boolean;
    hide_last_seen: boolean;
    hide_profile_photo: boolean;
    disable_read_receipts: boolean;
    disable_typing_indicator: boolean;
  }>;
}) {
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

export async function publishKeyBundle(payload: {
  identityKey: string;
  registrationId: number;
  deviceId: number;
  sessionDeviceId: string;
  signedPreKeyId: number;
  signedPreKey: string;
  signedPreKeySig: string;
  fallbackPublicKey: string;
  oneTimePreKeys: Array<{ id: number; key: string }>;
}) {
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

export async function fetchKeyBundle(username: string) {
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

export async function createConversation(
  type: "direct" | "group" | "channel",
  name: string | null,
  members: string[],
  visibility: "public" | "private" | null = null
) {
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

export async function fetchRoster(conversationId: number) {
  const response = await fetch(
    `${API_BASE}/api/conversations/${conversationId}/roster`,
    {
      headers: {
        ...authHeaders()
      }
    }
  );
  if (!response.ok) {
    throw new Error((await response.json()).error || "Roster load failed");
  }
  return response.json();
}

export async function addConversationMember(
  conversationId: number,
  username: string
) {
  const response = await fetch(
    `${API_BASE}/api/conversations/${conversationId}/members/add`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify({ username })
    }
  );
  if (!response.ok) {
    throw new Error((await response.json()).error || "Add member failed");
  }
  return response.json();
}

export async function removeConversationMember(
  conversationId: number,
  username: string
) {
  const response = await fetch(
    `${API_BASE}/api/conversations/${conversationId}/members/remove`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify({ username })
    }
  );
  if (!response.ok) {
    throw new Error((await response.json()).error || "Remove member failed");
  }
  return response.json();
}

export async function updateConversationRole(
  conversationId: number,
  username: string,
  role: "admin" | "member",
  permissions?: { manage_members?: boolean; manage_invites?: boolean }
) {
  const response = await fetch(
    `${API_BASE}/api/conversations/${conversationId}/role`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify({ username, role, permissions })
    }
  );
  if (!response.ok) {
    throw new Error((await response.json()).error || "Role update failed");
  }
  return response.json();
}

export async function createInviteLink(
  conversationId: number,
  maxUses: number,
  expiresInMinutes: number
) {
  const response = await fetch(
    `${API_BASE}/api/conversations/${conversationId}/invites`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify({ maxUses, expiresInMinutes })
    }
  );
  if (!response.ok) {
    throw new Error((await response.json()).error || "Invite create failed");
  }
  return response.json();
}

export async function listInviteLinks(conversationId: number) {
  const response = await fetch(
    `${API_BASE}/api/conversations/${conversationId}/invites`,
    {
      headers: {
        ...authHeaders()
      }
    }
  );
  if (!response.ok) {
    throw new Error((await response.json()).error || "Invite list failed");
  }
  return response.json();
}

export async function revokeInviteLink(token: string) {
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

export async function redeemInviteLink(token: string) {
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

export async function fetchMembers(conversationId: number) {
  const response = await fetch(
    `${API_BASE}/api/conversations/${conversationId}/members`,
    {
      headers: {
        ...authHeaders()
      }
    }
  );

  if (!response.ok) {
    throw new Error((await response.json()).error || "Load members failed");
  }

  return response.json();
}

export async function fetchConversationSettings(conversationId: number) {
  const response = await fetch(
    `${API_BASE}/api/conversations/${conversationId}/settings`,
    {
      headers: {
        ...authHeaders()
      }
    }
  );

  if (!response.ok) {
    throw new Error((await response.json()).error || "Load settings failed");
  }

  return response.json();
}

export async function updateConversationSettings(
  conversationId: number,
  payload: {
    forwardEnabled?: boolean;
    quietHours?: { enabled: boolean; start: string; end: string } | null;
  }
) {
  const response = await fetch(
    `${API_BASE}/api/conversations/${conversationId}/settings`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders()
      },
      body: JSON.stringify(payload)
    }
  );

  if (!response.ok) {
    throw new Error((await response.json()).error || "Update settings failed");
  }

  return response.json();
}

export async function sendMessage(
  conversationId: number,
  payloads: Array<{
    messageId: string;
    toUsername: string;
    toDeviceId: string;
    ciphertext: string;
    nonce: string;
  }>,
  forwarded = false
) {
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

export async function scheduleMessage(
  conversationId: number,
  scheduledFor: number,
  payloads: Array<{
    messageId: string;
    toUsername: string;
    toDeviceId: string;
    ciphertext: string;
    nonce: string;
  }>,
  forwarded = false
) {
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

export async function fetchLinkPreview(url: string) {
  const response = await fetch(
    `${API_BASE}/api/link-preview?url=${encodeURIComponent(url)}`,
    {
      headers: {
        ...authHeaders()
      }
    }
  );

  if (!response.ok) {
    throw new Error((await response.json()).error || "Preview failed");
  }

  return response.json();
}

export async function pollMessages(since: number, sinceId = 0, limit = 50) {
  const response = await fetch(
    `${API_BASE}/api/messages/poll?since=${since}&sinceId=${sinceId}&limit=${limit}`,
    {
      headers: {
        ...authHeaders()
      }
    }
  );

  if (!response.ok) {
    throw new Error((await response.json()).error || "Poll failed");
  }

  return response.json();
}

export async function pollSentStatuses(since: number, limit = 50) {
  const response = await fetch(
    `${API_BASE}/api/messages/sent?since=${since}&limit=${limit}`,
    {
      headers: {
        ...authHeaders()
      }
    }
  );

  if (!response.ok) {
    throw new Error((await response.json()).error || "Status poll failed");
  }

  return response.json();
}

export async function fetchMessageHistory(
  conversationId: number,
  before: number,
  limit = 50
) {
  const response = await fetch(
    `${API_BASE}/api/messages/history?conversationId=${conversationId}&before=${before}&limit=${limit}`,
    {
      headers: {
        ...authHeaders()
      }
    }
  );
  if (!response.ok) {
    throw new Error((await response.json()).error || "History load failed");
  }
  return response.json();
}

export async function markRead(conversationId: number) {
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

export async function deleteMessage(payload: {
  scope: "self" | "all";
  messageId?: number;
  groupId?: string;
}) {
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

export async function reportMessage(payload: {
  conversationId: number;
  reportedUsername: string;
  reason: "porn" | "dangerous_link" | "threat" | "abuse";
  messageId?: number;
  groupId?: string;
  evidence?: { text?: string; attachments?: Array<{ name: string; kind: string }> };
}) {
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

export async function adminSendSystemMessage(payload: {
  text: string;
  attachments: Array<{
    kind: "image" | "audio" | "video" | "file";
    name: string;
    data: string;
    storageKey?: string;
    contentType?: string;
  }>;
}) {
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

export async function adminUploadDirect(file: File): Promise<{
  publicUrl: string;
  contentType: string;
  key: string;
}> {
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

export async function createUpload(payload: {
  filename: string;
  contentType: string;
  size: number;
}): Promise<{
  url: string;
  method?: string;
  headers?: Record<string, string>;
  key: string;
  publicUrl: string;
}> {
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

export async function createDownloadUrl(key: string): Promise<{
  url: string;
  expiresIn: number;
}> {
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

export async function uploadDirect(file: File): Promise<{
  publicUrl: string;
  contentType: string;
  key: string;
}> {
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

export async function setTyping(conversationId: number, isTyping: boolean) {
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

export async function fetchTyping(conversationId: number) {
  const response = await fetch(
    `${API_BASE}/api/typing?conversationId=${conversationId}`,
    {
      headers: {
        ...authHeaders()
      }
    }
  );

  if (!response.ok) {
    throw new Error((await response.json()).error || "Typing load failed");
  }

  return response.json();
}

export async function fetchUserStatus(username: string) {
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

export async function updateContactPrivacy(payload: {
  username: string;
  privacy: Partial<{
    hide_online: boolean;
    hide_last_seen: boolean;
    hide_profile_photo: boolean;
    disable_read_receipts: boolean;
    disable_typing_indicator: boolean;
  }>;
}) {
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

export async function fetchSocialFeed(params?: {
  kind?: "post" | "reel";
  before?: number;
  limit?: number;
  sort?: "latest" | "trending";
}) {
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
  const response = await fetch(
    `${API_BASE}/api/social/feed${query.toString() ? `?${query}` : ""}`,
    {
      headers: {
        ...authHeaders()
      }
    }
  );
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

export async function createSocialPost(payload: {
  kind: "post" | "reel" | "story";
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  visibility?: "public" | "private";
  allowedUsers?: string[];
  commentVisibility?: "public" | "friends";
  expiresInMinutes?: number;
  publishAt?: number;
}) {
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

export async function toggleSocialLike(postId: number) {
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

export async function toggleSocialSave(postId: number) {
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

export async function addSocialView(postId: number) {
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

export async function fetchSocialComments(postId: number) {
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

export async function createSocialComment(postId: number, text: string) {
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

export async function followSocialUser(username: string) {
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

export async function unfollowSocialUser(username: string) {
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

export async function enableTwoFactor(password: string) {
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

export async function disableTwoFactor(password: string) {
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

export async function logoutDevice(deviceId: string) {
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

export async function adminLogin(username: string, password: string) {
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

export async function adminCreateAdmin(payload: {
  username: string;
  password: string;
  role?: "super" | "standard";
  permissions?: string[];
}) {
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

export async function adminUpdateAdminPermissions(payload: {
  adminId: number;
  permissions: string[];
}) {
  const response = await fetch(
    `${API_BASE}/api/admin/admins/${payload.adminId}/permissions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...adminHeaders()
      },
      body: JSON.stringify({ permissions: payload.permissions })
    }
  );

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

export async function adminSetLockdown(payload: {
  enabled: boolean;
  allowConversationIds?: number[];
}) {
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

export async function adminUpdatePassword(password: string) {
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

export async function adminUpdateUserFlags(
  userId: number,
  payload: {
    banned?: boolean;
    canSend?: boolean;
    canCreate?: boolean;
    allowDirect?: boolean;
    allowGroupInvite?: boolean;
  }
) {
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

export async function adminResetUserPassword(userId: number, password: string) {
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

export async function adminDeleteUser(userId: number) {
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
  const response = await fetch(
    `${API_BASE}/api/admin/blocked?limit=${limit}`,
    {
      headers: {
        ...adminHeaders()
      }
    }
  );

  if (!response.ok) {
    throw new Error((await response.json()).error || "Blocked list failed");
  }

  return response.json();
}

export async function adminDownloadUserMetadata(userId: number) {
  const response = await fetch(
    `${API_BASE}/api/admin/users/${userId}/profile-json`,
    {
      headers: {
        ...adminHeaders()
      }
    }
  );
  if (!response.ok) {
    throw new Error((await response.json()).error || "Download failed");
  }
  return response.blob();
}

export async function startCall(payload: {
  callId: string;
  conversationId: number;
  toUsername: string;
  toDeviceId: string;
  media: "audio" | "video";
  offer: string;
}) {
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

export async function answerCall(payload: { callId: string; answer: string }) {
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

export async function sendIceCandidate(payload: {
  callId: string;
  candidate: string;
  target: "caller" | "callee";
}) {
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

export async function endCall(payload: { callId: string }) {
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

export async function pollCalls(since: number) {
  const response = await fetch(
    `${API_BASE}/api/calls/poll?since=${since}`,
    {
      headers: {
        ...authHeaders()
      }
    }
  );
  if (!response.ok) {
    throw new Error((await response.json()).error || "Call poll failed");
  }
  return response.json();
}

export async function adminDeleteConversation(conversationId: number) {
  const response = await fetch(
    `${API_BASE}/api/admin/conversations/${conversationId}/delete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...adminHeaders()
      }
    }
  );

  if (!response.ok) {
    throw new Error((await response.json()).error || "Delete failed");
  }

  return response.json();
}
