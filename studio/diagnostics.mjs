import fs from "node:fs/promises";
import path from "node:path";

// Deliberately exclude article text, titles, request bodies and credentials.
export function diagnostics(root) {
  let pending = Promise.resolve();
  return (event, details = {}) => {
    const record = {
      time: new Date().toISOString(),
      event,
      rss: process.memoryUsage().rss,
    };
    for (const key of [
      "id",
      "key",
      "stage",
      "durationMs",
      "markdownBytes",
      "htmlBytes",
      "nodes",
      "pages",
      "code",
    ])
      if (details[key] !== undefined) record[key] = details[key];
    pending = pending
      .then(async () => {
        const file = path.join(root, "preview-diagnostics.jsonl");
        if ((await fs.stat(file).catch(() => null))?.size > 1024 * 1024)
          await fs.rename(file, file + ".1");
        await fs.appendFile(file, JSON.stringify(record) + "\n", {
          mode: 0o600,
        });
      })
      .catch(() => {});
    return pending;
  };
}
