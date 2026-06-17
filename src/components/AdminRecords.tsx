import React, { useEffect, useMemo, useState } from "react";
import { Download, Lock, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { adminLogin, adminLogout, fetchAdminRecords } from "../services/testRecords";

type AdminRecord = Awaited<ReturnType<typeof fetchAdminRecords>>["records"][number];
type Payload = Record<string, unknown>;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getObject(value: unknown): Payload {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Payload) : {};
}

function getPrintableHtml(record: AdminRecord) {
  const payload = getObject(record.payload);
  if (typeof payload.reportHtml === "string" && payload.reportHtml.trim()) {
    return payload.reportHtml;
  }

  const participant = getObject(payload.participant);
  const isRaven = record.testType === "raven-spm";
  const title = isRaven ? "تقرير اختبار رافن SPM" : "تقرير مقياس روجرز";
  const scores = getObject(payload.scores);
  const setScores = getObject(payload.setCorrectScores);

  const scoreRows = isRaven
    ? Object.entries(setScores)
        .map(([key, value]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(value)}</td><td>12</td></tr>`)
        .join("")
    : Object.entries(scores)
        .map(([key, value]) => `<tr><td>${escapeHtml(key)}</td><td>${escapeHtml(value)}</td><td>35</td></tr>`)
        .join("");

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Arial, Tahoma, sans-serif; margin: 0; background: #f8fafc; color: #0f172a; }
    .page { max-width: 900px; margin: 24px auto; background: white; padding: 36px; border: 1px solid #e2e8f0; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    h2 { margin: 28px 0 12px; font-size: 18px; border-bottom: 2px solid #0f172a; padding-bottom: 8px; }
    .meta { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 14px; }
    th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: right; }
    th { background: #f1f5f9; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .box { border: 1px solid #e2e8f0; background: #f8fafc; padding: 12px; border-radius: 8px; }
    .actions { max-width: 900px; margin: 18px auto 0; text-align: left; }
    button { background: #0f172a; color: white; border: 0; border-radius: 8px; padding: 10px 16px; font-weight: 700; cursor: pointer; }
    @media print {
      body { background: white; }
      .page { margin: 0; max-width: none; border: 0; }
      .actions { display: none; }
    }
  </style>
</head>
<body>
  <div class="actions"><button onclick="window.print()">تحميل / حفظ PDF</button></div>
  <main class="page">
    <h1>${escapeHtml(title)}</h1>
    <div class="meta">تاريخ التقرير: ${escapeHtml(formatDate(record.createdAt))} | رقم السجل: ${escapeHtml(record.id)}</div>
    <section class="grid">
      <div class="box"><strong>الاسم:</strong> ${escapeHtml(record.participantName || participant.fullName)}</div>
      <div class="box"><strong>الاختبار:</strong> ${escapeHtml(record.testType)}</div>
      ${
        isRaven
          ? `<div class="box"><strong>العمر:</strong> ${escapeHtml(participant.age)}</div>
             <div class="box"><strong>الدرجة:</strong> ${escapeHtml(payload.scoreOf60)} / 60</div>
             <div class="box"><strong>النسبة المئينية:</strong> ${escapeHtml(payload.percentile)}</div>
             <div class="box"><strong>التصنيف:</strong> ${escapeHtml(payload.grade)}</div>`
          : `<div class="box"><strong>النمط الأول:</strong> ${escapeHtml(payload.topIntelligence)}</div>
             <div class="box"><strong>النمط الثاني:</strong> ${escapeHtml(payload.secondIntelligence)}</div>
             <div class="box"><strong>عدد الإجابات:</strong> ${escapeHtml(payload.answerCount)}</div>
             <div class="box"><strong>النادي / المدرسة:</strong> ${escapeHtml(participant.gradeOrSchool)}</div>`
      }
    </section>
    <h2>تفاصيل الدرجات</h2>
    <table>
      <thead><tr><th>البند</th><th>الدرجة</th><th>الحد الأعلى</th></tr></thead>
      <tbody>${scoreRows || `<tr><td colspan="3">لا توجد تفاصيل درجات محفوظة.</td></tr>`}</tbody>
    </table>
  </main>
</body>
</html>`;
}

function openPrintableReport(record: AdminRecord) {
  const reportWindow = window.open("", "_blank", "width=900,height=1000");

  if (!reportWindow) {
    return;
  }

  reportWindow.document.open();
  reportWindow.document.write(getPrintableHtml(record));
  reportWindow.document.close();
  reportWindow.focus();
}

function getSummary(record: AdminRecord) {
  const payload = getObject(record.payload);

  if (record.testType === "raven-spm") {
    return `الدرجة: ${payload.scoreOf60 ?? "-"} / 60، النسبة المئينية: ${payload.percentile ?? "-"}`;
  }

  return `النمط الأول: ${payload.topIntelligence ?? "-"}، عدد الإجابات: ${payload.answerCount ?? "-"}`;
}

function RecordsTable({ title, records }: { title: string; records: AdminRecord[] }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h2 className="text-base font-black text-slate-900">{title}</h2>
        <span className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm">{records.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-right text-sm">
          <thead className="bg-slate-100 text-xs font-black text-slate-600">
            <tr>
              <th className="px-4 py-3">التاريخ</th>
              <th className="px-4 py-3">الاسم</th>
              <th className="px-4 py-3">الملخص</th>
              <th className="px-4 py-3">رقم السجل</th>
              <th className="px-4 py-3">التقرير</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">لا توجد نتائج محفوظة بعد.</td>
              </tr>
            )}
            {records.map((record) => (
              <tr key={record.id} className="border-t border-slate-100 align-top">
                <td className="px-4 py-3 font-semibold text-slate-700">{formatDate(record.createdAt)}</td>
                <td className="px-4 py-3 font-bold">{record.participantName || "-"}</td>
                <td className="px-4 py-3 text-slate-600">{getSummary(record)}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{record.id}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openPrintableReport(record)}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800"
                  >
                    <Download className="h-4 w-4" />
                    تحميل PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function AdminRecords() {
  const [password, setPassword] = useState("");
  const [records, setRecords] = useState<AdminRecord[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const { ravenRecords, rogersRecords } = useMemo(
    () => ({
      ravenRecords: records.filter((record) => record.testType === "raven-spm"),
      rogersRecords: records.filter((record) => record.testType === "rogers-multiple-intelligences"),
    }),
    [records],
  );

  const loadRecords = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const data = await fetchAdminRecords();
      setRecords(data.records);
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRecords();
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");

    try {
      await adminLogin(password);
      setPassword("");
      await loadRecords();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر تسجيل الدخول");
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setIsAuthenticated(false);
    setRecords([]);
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-10 text-white" dir="rtl">
        <form onSubmit={handleLogin} className="mx-auto mt-16 max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-2xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-300">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black">سجل نتائج الاختبارات</h1>
              <p className="text-xs font-semibold text-slate-400">صفحة داخلية محمية بكلمة سر</p>
            </div>
          </div>

          <label className="mb-2 block text-xs font-bold text-slate-300">كلمة السر</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
            autoFocus
          />

          {message && <p className="mb-4 rounded-lg border border-red-900 bg-red-950/60 px-3 py-2 text-xs text-red-200">{message}</p>}

          <button className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-400">
            دخول
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F8FB] px-4 py-8 text-slate-900" dir="rtl">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black">سجل نتائج الاختبارات</h1>
              <p className="text-sm font-semibold text-slate-500">نتائج رافن وروجرز مفصولة مع تقارير قابلة للحفظ كـ PDF</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button onClick={loadRecords} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold shadow-sm hover:bg-slate-50">
              <RefreshCw className="h-4 w-4" />
              تحديث
            </button>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800">
              <LogOut className="h-4 w-4" />
              خروج
            </button>
          </div>
        </header>

        <section className="mb-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500">الإجمالي</p>
            <p className="text-3xl font-black">{records.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500">Raven SPM</p>
            <p className="text-3xl font-black">{ravenRecords.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-500">Rogers</p>
            <p className="text-3xl font-black">{rogersRecords.length}</p>
          </div>
        </section>

        {isLoading ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-8 text-center text-slate-500 shadow-sm">جاري التحميل...</div>
        ) : (
          <div className="space-y-6">
            <RecordsTable title="نتائج اختبار رافن SPM" records={ravenRecords} />
            <RecordsTable title="نتائج مقياس روجرز" records={rogersRecords} />
          </div>
        )}
      </div>
    </main>
  );
}
