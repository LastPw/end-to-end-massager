import test from "node:test";
import assert from "node:assert/strict";
import {
  zUsername,
  zPhone,
  zFileName,
  zDeviceId,
  zUploadKey
} from "../src/validation.js";

test("username normalization", () => {
  const value = zUsername.parse("  Test_User  ");
  assert.equal(value, "test_user");
});

test("phone validation", () => {
  const value = zPhone.parse(" +989121234567 ");
  assert.equal(value, "+989121234567");
});

test("filename validation", () => {
  const value = zFileName.parse("my-file.png");
  assert.equal(value, "my-file.png");
});

test("device id validation", () => {
  const value = zDeviceId.parse("web:device-1");
  assert.equal(value, "web:device-1");
});

test("upload key validation", () => {
  const value = zUploadKey.parse("uploads/2025/01/01/abc-file.png");
  assert.equal(value, "uploads/2025/01/01/abc-file.png");
});

test("upload key rejects unsafe prefix", () => {
  assert.throws(() => zUploadKey.parse("bad/2025/file.png"));
});
