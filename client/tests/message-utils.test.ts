import { describe, expect, it } from "vitest";
import { mergeMessages } from "../src/messageUtils";

describe("mergeMessages", () => {
  it("deduplicates by id and keeps ordering", () => {
    const existing = [
      { id: 1, groupId: "g1", sender: "a", createdAt: 100 }
    ];
    const incoming = [
      { id: 2, groupId: "g1", sender: "b", createdAt: 120 },
      { id: 1, groupId: "g1", sender: "a", createdAt: 100 }
    ];
    const merged = mergeMessages(existing, incoming);
    expect(merged).toHaveLength(2);
    expect(merged[0].id).toBe(1);
    expect(merged[1].id).toBe(2);
  });

  it("sorts by time then id", () => {
    const existing = [
      { id: 3, groupId: "g1", sender: "a", createdAt: 100 }
    ];
    const incoming = [
      { id: 2, groupId: "g1", sender: "b", createdAt: 100 },
      { id: 1, groupId: "g1", sender: "c", createdAt: 90 }
    ];
    const merged = mergeMessages(existing, incoming);
    expect(merged.map((item) => item.id)).toEqual([1, 2, 3]);
  });
});
