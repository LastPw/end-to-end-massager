import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { readEncryptedJson } from "../src/storage.js";

type DbShape = {
  users: any[];
  sessions: any[];
  conversations: any[];
  memberships: any[];
  messages: any[];
  scheduled_messages: any[];
  reports: any[];
  key_bundles: any[];
  invites: any[];
  social_posts: any[];
  social_likes: any[];
  social_saves: any[];
  social_views: any[];
  social_comments: any[];
  social_follows: any[];
  social_notifications: any[];
  admin_credentials: any | null;
  admin_sessions: any[];
};

type LegacyProfile = {
  username: string;
  last_ip: string;
  last_user_agent: string;
  last_platform: string;
  last_language: string;
  last_device_model: string;
  last_seen_at: number;
  history: Array<{
    ip: string;
    userAgent: string;
    platform: string;
    language: string;
    deviceModel: string;
    at: number;
  }>;
};

async function main() {
  const dbPath = path.join(process.cwd(), "data.json");
  const source = readEncryptedJson<DbShape>(dbPath);
  if (!source) {
    console.log("No data.json found or file is empty.");
    return;
  }

  const prisma = new PrismaClient();

  await prisma.users.createMany({ data: source.users || [], skipDuplicates: true });
  await prisma.sessions.createMany({ data: source.sessions || [], skipDuplicates: true });
  await prisma.conversations.createMany({
    data: source.conversations || [],
    skipDuplicates: true
  });
  await prisma.memberships.createMany({
    data: source.memberships || [],
    skipDuplicates: true
  });
  await prisma.messages.createMany({ data: source.messages || [], skipDuplicates: true });
  await prisma.scheduled_messages.createMany({
    data: source.scheduled_messages || [],
    skipDuplicates: true
  });
  await prisma.reports.createMany({ data: source.reports || [], skipDuplicates: true });
  await prisma.user_key_bundles.createMany({
    data: source.key_bundles || [],
    skipDuplicates: true
  });
  await prisma.invites.createMany({ data: source.invites || [], skipDuplicates: true });
  await prisma.social_posts.createMany({
    data: source.social_posts || [],
    skipDuplicates: true
  });
  await prisma.social_likes.createMany({
    data: source.social_likes || [],
    skipDuplicates: true
  });
  await prisma.social_saves.createMany({
    data: source.social_saves || [],
    skipDuplicates: true
  });
  await prisma.social_views.createMany({
    data: source.social_views || [],
    skipDuplicates: true
  });
  await prisma.social_comments.createMany({
    data: source.social_comments || [],
    skipDuplicates: true
  });
  await prisma.social_follows.createMany({
    data: source.social_follows || [],
    skipDuplicates: true
  });
  await prisma.social_notifications.createMany({
    data: source.social_notifications || [],
    skipDuplicates: true
  });

  const profileDir = path.join(process.cwd(), "profiles");
  if (fs.existsSync(profileDir)) {
    const usernameToId = new Map<string, number>();
    for (const user of source.users || []) {
      if (user?.username && user?.id) {
        usernameToId.set(String(user.username), Number(user.id));
      }
    }
    const profileRows = fs
      .readdirSync(profileDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) => readEncryptedJson<LegacyProfile>(path.join(profileDir, file)))
      .filter((profile): profile is LegacyProfile => Boolean(profile))
      .map((profile) => {
        const userId = usernameToId.get(profile.username);
        if (!userId) {
          return null;
        }
        return {
          user_id: userId,
          username: profile.username,
          last_ip: profile.last_ip,
          last_user_agent: profile.last_user_agent,
          last_platform: profile.last_platform,
          last_language: profile.last_language,
          last_device_model: profile.last_device_model,
          last_seen_at: profile.last_seen_at,
          history: profile.history || []
        };
      })
      .filter((row) => row !== null);

    if (profileRows.length) {
      await prisma.user_profiles.createMany({
        data: profileRows,
        skipDuplicates: true
      });
    }
  }

  if (source.admin_credentials) {
    await prisma.admin_credentials.createMany({
      data: [source.admin_credentials],
      skipDuplicates: true
    });
  }
  await prisma.admin_sessions.createMany({
    data: source.admin_sessions || [],
    skipDuplicates: true
  });

  console.log("Migration complete.");
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
