export type MergeableMessage = {
  id: number | string;
  groupId: string;
  sender: string;
  createdAt: number;
};

function compareIds(a: number | string, b: number | string): number {
  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }
  return String(a).localeCompare(String(b));
}

export function mergeMessages<T extends MergeableMessage>(
  existing: T[],
  incoming: T[]
): T[] {
  const next = existing.slice();
  const idIndex = new Map<string | number, number>();
  const localIndex = new Map<string, number>();
  next.forEach((message, index) => {
    idIndex.set(message.id, index);
    if (typeof message.id === "string" && message.id.startsWith("local-")) {
      localIndex.set(`${message.groupId}:${message.sender}`, index);
    }
  });

  let needsSort = false;
  for (const message of incoming) {
    const localKey = `${message.groupId}:${message.sender}`;
    const existingIndex =
      idIndex.get(message.id) ??
      (typeof message.id === "number" ? localIndex.get(localKey) : undefined);
    if (existingIndex !== undefined) {
      next[existingIndex] = { ...next[existingIndex], ...message };
      continue;
    }
    next.push(message);
    idIndex.set(message.id, next.length - 1);
    if (typeof message.id === "string" && message.id.startsWith("local-")) {
      localIndex.set(localKey, next.length - 1);
    }
    needsSort = true;
  }
  if (needsSort) {
    next.sort((a, b) => {
      const timeDiff = a.createdAt - b.createdAt;
      if (timeDiff !== 0) {
        return timeDiff;
      }
      return compareIds(a.id, b.id);
    });
  }
  return next;
}
