import { z } from "zod";

const usernameRe = /^[a-zA-Z0-9_]+$/;
const phoneRe = /^\+?\d{10,15}$/;
const fileNameRe = /^[\w.\- ]+$/;
const deviceIdRe = /^[\w.\-:]+$/;
const uploadKeyRe = /^[\w.\-\/]+$/;

const collapseWhitespace = (value: string) =>
  value.replace(/\s+/g, " ").trim();

export const zUsername = z
  .string()
  .min(5)
  .max(32)
  .regex(usernameRe)
  .transform((value) => value.trim().toLowerCase());

export const zPhone = z.string().min(10).max(16).regex(phoneRe).transform((v) => v.trim());

export const zName = z
  .string()
  .min(1)
  .max(40)
  .transform(collapseWhitespace);

export const zGroupName = z
  .string()
  .min(1)
  .max(40)
  .transform(collapseWhitespace);

export const zBio = z.string().max(160).transform(collapseWhitespace);

export const zDeviceId = z
  .string()
  .min(2)
  .max(120)
  .regex(deviceIdRe)
  .transform((v) => v.trim());

export const zDeviceName = z
  .string()
  .min(1)
  .max(80)
  .transform(collapseWhitespace);

export const zFileName = z
  .string()
  .min(1)
  .max(120)
  .regex(fileNameRe)
  .transform(collapseWhitespace);

export const zUploadKey = z
  .string()
  .min(8)
  .max(512)
  .regex(uploadKeyRe)
  .refine((value) => value.startsWith("uploads/"), {
    message: "invalid upload key"
  });

export const zUrl = z.string().url().max(2048);

export const zMessageId = z.string().min(1).max(64);
export const zCiphertext = z.string().min(1).max(1024 * 1024 * 1024);
export const zNonce = z.string().min(1).max(512);

export const zConversationId = z.coerce.number().int().positive();

export const zLimit = z.coerce.number().int().min(1).max(100).default(50);
export const zSince = z.coerce.number().int().min(0).default(0);

export function parseBody<T>(schema: z.ZodType<T>, body: unknown): T {
  return schema.parse(body);
}

export function parseParams<T>(schema: z.ZodType<T>, params: unknown): T {
  return schema.parse(params);
}

export function parseQuery<T>(schema: z.ZodType<T>, query: unknown): T {
  return schema.parse(query);
}

export const zOptionalBoolean = z.boolean().optional();
export const zOptionalString = z.string().optional();
export const zOptionalNumber = z.number().optional();

export const zDeviceInfo = z
  .object({
    userAgent: z.string().max(256).optional(),
    platform: z.string().max(80).optional(),
    language: z.string().max(40).optional(),
    deviceModel: z.string().max(120).optional()
  })
  .strict()
  .optional();

export const zVisibility = z.enum(["public", "private"]).optional();

export const zReason = z.enum(["porn", "dangerous_link", "threat", "abuse"]);
