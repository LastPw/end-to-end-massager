import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { GetObjectCommand, S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { fileTypeFromFile } from "file-type";

const bucket = process.env.S3_BUCKET || "";
const region = process.env.S3_REGION || "us-east-1";
const endpoint = process.env.S3_ENDPOINT || "";
const accessKeyId = process.env.S3_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || "";
const publicBase = process.env.S3_PUBLIC_BASE || "";
const clamPath = process.env.CLAMAV_PATH || "clamscan";
const clamEnabled = process.env.CLAMAV_ENABLED === "1";

const client = new S3Client({
  region,
  credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
  endpoint: endpoint || undefined,
  forcePathStyle: Boolean(endpoint)
});

function safeSegment(value: string): string {
  return value.replace(/[^\w.\-]/g, "_").slice(0, 120) || "file";
}

function buildPublicUrl(key: string): string {
  const base = publicBase.replace(/\/+$/, "");
  return `${base}/${key}`;
}

function normalizeContentType(value: string | undefined): string {
  if (!value || value === "image/svg+xml") {
    return "application/octet-stream";
  }
  return value;
}

async function scanWithClamAV(filePath: string): Promise<void> {
  if (!clamEnabled) {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const child = spawn(clamPath, ["--no-summary", filePath], {
      stdio: "ignore"
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error("malicious_file"));
      }
    });
  });
}

export async function createPresignedUpload(input: {
  filename: string;
  contentType: string;
  size: number;
}): Promise<{
  url: string;
  method: string;
  headers: Record<string, string>;
  key: string;
  publicUrl: string;
}> {
  if (!bucket || !accessKeyId || !secretAccessKey || !publicBase) {
    throw new Error("uploads_not_configured");
  }
  const now = new Date();
  const y = String(now.getUTCFullYear());
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const safeName = safeSegment(input.filename || "file");
  const token = crypto.randomBytes(12).toString("hex");
  const key = `uploads/${y}/${m}/${d}/${token}-${safeName}`;
  const contentType = input.contentType || "application/octet-stream";
  const contentDisposition = `attachment; filename="${safeName}"`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ContentDisposition: contentDisposition
  });
  const url = await getSignedUrl(client, command, { expiresIn: 600 });
  return {
    url,
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": contentDisposition
    },
    key,
    publicUrl: buildPublicUrl(key)
  };
}

export async function uploadAndScanFile(input: {
  filename: string;
  contentType?: string;
  tmpPath: string;
}): Promise<{ key: string; publicUrl: string; contentType: string }> {
  if (!bucket || !accessKeyId || !secretAccessKey || !publicBase) {
    throw new Error("uploads_not_configured");
  }

  await scanWithClamAV(input.tmpPath);

  const detected = await fileTypeFromFile(input.tmpPath);
  const contentType = normalizeContentType(detected?.mime || input.contentType);
  const safeName = safeSegment(input.filename || "file");
  const token = crypto.randomBytes(12).toString("hex");
  const now = new Date();
  const y = String(now.getUTCFullYear());
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const key = `uploads/${y}/${m}/${d}/${token}-${safeName}`;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ContentDisposition: `attachment; filename="${safeName}"`,
      Body: fs.createReadStream(input.tmpPath)
    })
  );

  return { key, publicUrl: buildPublicUrl(key), contentType };
}

export async function createPresignedDownload(key: string): Promise<{
  url: string;
  expiresIn: number;
}> {
  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("uploads_not_configured");
  }
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key
  });
  const expiresIn = 600;
  const url = await getSignedUrl(client, command, { expiresIn });
  return { url, expiresIn };
}
