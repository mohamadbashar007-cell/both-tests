import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";

type StoredRecord = {
  id: string;
  createdAt: string;
  testType: string;
  participantName?: string;
  payload: unknown;
};

type RecordsFile = {
  records: StoredRecord[];
};

const sessionCookieName = "test_records_admin";
const maxBodyBytes = 1024 * 1024;

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolveBody, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > maxBodyBytes) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      if (!body) {
        resolveBody({});
        return;
      }

      try {
        resolveBody(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    req.on("error", reject);
  });
}

function sendJson(res: ServerResponse, statusCode: number, body: unknown, headers: Record<string, string> = {}) {
  res.statusCode = statusCode;
  Object.entries({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers,
  }).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(body));
}

function getCookie(req: IncomingMessage, name: string) {
  const cookieHeader = req.headers.cookie ?? "";
  const cookies = cookieHeader.split(";").map((item) => item.trim());
  const match = cookies.find((item) => item.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

function sign(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

function createSession(secret: string) {
  const payload = Buffer.from(
    JSON.stringify({
      id: randomBytes(16).toString("hex"),
      exp: Date.now() + 1000 * 60 * 60 * 8,
    }),
    "utf8",
  ).toString("base64url");

  return `${payload}.${sign(payload, secret)}`;
}

function isSessionValid(req: IncomingMessage, secret: string) {
  const token = getCookie(req, sessionCookieName);
  const [payload, signature] = token.split(".");

  if (!payload || !signature || sign(payload, secret) !== signature) {
    return false;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { exp?: number };
    return typeof session.exp === "number" && session.exp > Date.now();
  } catch {
    return false;
  }
}

function verifyPassword(password: string, storedHash: string) {
  const [salt, expectedHash] = storedHash.split(":");

  if (!salt || !expectedHash) {
    return false;
  }

  const actual = Buffer.from(scryptSync(password, salt, 64).toString("hex"), "hex");
  const expected = Buffer.from(expectedHash, "hex");

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function readRecords(dbPath: string): RecordsFile {
  if (!existsSync(dbPath)) {
    return { records: [] };
  }

  const parsed = JSON.parse(readFileSync(dbPath, "utf8")) as Partial<RecordsFile>;
  return { records: Array.isArray(parsed.records) ? parsed.records : [] };
}

function writeRecords(dbPath: string, data: RecordsFile) {
  mkdirSync(dirname(dbPath), { recursive: true });
  writeFileSync(dbPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function testRecordsPlugin(options: {
  rootDir: string;
  adminPasswordHash?: string;
  sessionSecret?: string;
}): Plugin {
  const dbPath = resolve(options.rootDir, "data/test-records.json");
  const sessionSecret = options.sessionSecret || randomBytes(32).toString("hex");

  return {
    name: "local-test-records-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const method = req.method ?? "GET";
        const url = new URL(req.url ?? "/", "http://localhost");

        if (!url.pathname.startsWith("/api/")) {
          next();
          return;
        }

        try {
          if (method === "POST" && url.pathname === "/api/records") {
            const body = (await readBody(req)) as {
              testType?: string;
              participantName?: string;
              payload?: unknown;
            };

            if (!body.testType || typeof body.testType !== "string") {
              sendJson(res, 400, { error: "testType is required" });
              return;
            }

            const database = readRecords(dbPath);
            const record: StoredRecord = {
              id: randomBytes(12).toString("hex"),
              createdAt: new Date().toISOString(),
              testType: body.testType,
              participantName: typeof body.participantName === "string" ? body.participantName : "",
              payload: body.payload ?? {},
            };

            database.records.unshift(record);
            writeRecords(dbPath, database);
            sendJson(res, 201, { id: record.id });
            return;
          }

          if (method === "POST" && url.pathname === "/api/admin/login") {
            const body = (await readBody(req)) as { password?: string };

            if (!options.adminPasswordHash) {
              sendJson(res, 503, { error: "Admin password hash is not configured" });
              return;
            }

            if (!body.password || !verifyPassword(body.password, options.adminPasswordHash)) {
              sendJson(res, 401, { error: "Invalid password" });
              return;
            }

            const token = createSession(sessionSecret);
            sendJson(res, 200, { ok: true }, {
              "Set-Cookie": `${sessionCookieName}=${encodeURIComponent(token)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`,
            });
            return;
          }

          if (method === "POST" && url.pathname === "/api/admin/logout") {
            sendJson(res, 200, { ok: true }, {
              "Set-Cookie": `${sessionCookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`,
            });
            return;
          }

          if (method === "GET" && url.pathname === "/api/admin/records") {
            if (!isSessionValid(req, sessionSecret)) {
              sendJson(res, 401, { error: "Unauthorized" });
              return;
            }

            sendJson(res, 200, readRecords(dbPath));
            return;
          }

          sendJson(res, 404, { error: "Not found" });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unexpected server error";
          sendJson(res, 500, { error: message });
        }
      });
    },
  };
}
