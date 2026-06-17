export type TestRecordPayload = Record<string, unknown>;

export async function saveTestRecord(record: {
  testType: string;
  participantName?: string;
  payload: TestRecordPayload;
}) {
  const response = await fetch("/api/records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error("Unable to save test record");
  }

  return response.json() as Promise<{ id: string }>;
}

export async function adminLogin(password: string) {
  const response = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    throw new Error(response.status === 503 ? "Admin password is not configured" : "Invalid password");
  }
}

export async function adminLogout() {
  await fetch("/api/admin/logout", { method: "POST" });
}

export async function fetchAdminRecords() {
  const response = await fetch("/api/admin/records");

  if (!response.ok) {
    throw new Error("Unauthorized");
  }

  return response.json() as Promise<{
    records: Array<{
      id: string;
      createdAt: string;
      testType: string;
      participantName?: string;
      payload: TestRecordPayload;
    }>;
  }>;
}
