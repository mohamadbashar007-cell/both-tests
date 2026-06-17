import React, { useEffect, useState } from "react";
import { ArrowLeft, Brain, Grid2X2, Layers3 } from "lucide-react";
import { AdminRecords } from "./components/AdminRecords";
import { TestWelcome } from "./components/TestWelcome";
import { TestSession } from "./components/TestSession";
import { TestResults } from "./components/TestResults";
import { publicAsset } from "./utils/publicAsset";
import RogersApp from "./rogers/RogersApp";

type QuizStage = "welcome" | "session" | "results";
type SelectedExam = "dashboard" | "raven" | "rogers";
export type AppLang = "ar" | "en";

export interface ParticipantInfo {
  fullName: string;
  age: number;
}

function RavenApp({
  lang,
  setLang,
  onBack,
}: {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  onBack: () => void;
}) {
  const [stage, setStage] = useState<QuizStage>("welcome");
  const [participant, setParticipant] = useState<ParticipantInfo>({ fullName: "", age: 18 });
  const [testMode, setTestMode] = useState<"standard" | "learning">("standard");
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeSpent, setTimeSpent] = useState<number>(0);

  const handleStartTest = (
    participantInfo: ParticipantInfo,
    mode: "standard" | "learning",
    selectedLang: AppLang,
  ) => {
    localStorage.removeItem("raven_spm_active_answers");
    setParticipant(participantInfo);
    setTestMode(mode);
    setLang(selectedLang);
    setUserAnswers({});
    setTimeSpent(0);
    setStage("session");
  };

  const handleFinishTest = (answers: Record<string, number>, elapsedSeconds: number) => {
    setUserAnswers(answers);
    setTimeSpent(elapsedSeconds);
    setStage("results");
  };

  const handleResetTest = () => {
    setUserAnswers({});
    setTimeSpent(0);
    setStage("welcome");
  };

  const isAr = lang === "ar";

  return (
    <div className="min-h-screen bg-[#F6F8FB] pb-16 font-sans text-[#1F2937] antialiased selection:bg-indigo-100">
      <header
        className="print:hidden sticky top-0 z-10 border-b border-gray-200 bg-white px-4 py-3 shadow-sm md:px-10"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-start text-right">
            <img
              src={publicAsset("logo.jpg")}
              alt={isAr ? "شعار المؤسسة" : "Foundation logo"}
              className={`${stage === "session" ? "h-9 md:h-14" : "h-14 md:h-20"} w-auto object-contain`}
              draggable={false}
            />
            <p className={`${stage === "session" ? "hidden md:block mt-1 text-sm" : "mt-2 text-sm md:text-lg"} font-extrabold leading-tight text-gray-800`}>
              {isAr ? "مؤسسة الإمام أحمد بن حنبل" : "Imam Ahmad ibn Hanbal Foundation"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs font-bold text-gray-700 shadow-sm transition hover:border-slate-700 hover:bg-gray-50"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {isAr ? "لوحة الاختبارات" : "Dashboard"}
            </button>
            {stage === "session" && (
              <span className="hidden text-xs font-bold text-gray-500 sm:block">
                {isAr ? "جاري إجراء الاختبار" : "Session in progress"}
              </span>
            )}
            {stage === "results" && (
              <button
                onClick={handleResetTest}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs font-bold text-gray-700 shadow-sm transition hover:border-slate-700 hover:bg-gray-50"
              >
                {isAr ? "اختبار جديد" : "New Test"}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto mt-4 px-2">
        {stage === "welcome" && <TestWelcome lang={lang} setLang={setLang} onStart={handleStartTest} />}

        {stage === "session" && (
          <TestSession
            participant={participant}
            mode={testMode}
            lang={lang}
            onQuit={handleResetTest}
            onFinish={handleFinishTest}
          />
        )}

        {stage === "results" && (
          <TestResults
            answers={userAnswers}
            timeSpentSeconds={timeSpent}
            participant={participant}
            mode={testMode}
            lang={lang}
            onRestart={handleResetTest}
          />
        )}
      </main>
    </div>
  );
}

function ExamShell({ children, onBack, lang }: { children: React.ReactNode; onBack: () => void; lang: AppLang }) {
  const isAr = lang === "ar";

  return (
    <div className="relative">
      <button
        onClick={onBack}
        className="no-print fixed left-4 top-20 z-50 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-700 shadow-lg transition hover:border-slate-400 hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        {isAr ? "لوحة الاختبارات" : "Dashboard"}
      </button>
      {children}
    </div>
  );
}

function Dashboard({
  lang,
  setLang,
  onSelect,
}: {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  onSelect: (exam: Exclude<SelectedExam, "dashboard">) => void;
}) {
  const isAr = lang === "ar";

  return (
    <main className="min-h-screen bg-[#F6F8FB] px-4 py-8 text-slate-900" dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col">
        <header className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img src={publicAsset("logo.jpg")} alt={isAr ? "شعار المؤسسة" : "Foundation logo"} className="h-16 w-auto object-contain" draggable={false} />
            <div>
              <p className="text-sm font-extrabold text-slate-500">
                {isAr ? "مؤسسة الإمام أحمد بن حنبل" : "Imam Ahmad ibn Hanbal Foundation"}
              </p>
              <h1 className="text-2xl font-black text-slate-950 md:text-4xl">
                {isAr ? "لوحة الاختبارات" : "Tests Dashboard"}
              </h1>
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <button
              onClick={() => setLang(isAr ? "en" : "ar")}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              {isAr ? "English" : "العربية"}
            </button>
            <p className="max-w-xl text-sm font-semibold leading-7 text-slate-600">
              {isAr
                ? "اختر الاختبار المطلوب للبدء. كل اختبار يحتفظ بتجربته ونتائجه بشكل مستقل."
                : "Choose the assessment to begin. Each test keeps its own session and results."}
            </p>
          </div>
        </header>

        <section className="grid flex-1 content-center gap-5 md:grid-cols-2">
          <button
            onClick={() => onSelect("raven")}
            className="group min-h-72 rounded-lg border border-slate-200 bg-white p-6 text-start shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Grid2X2 className="h-7 w-7" />
            </div>
            <h2 className="mb-3 text-2xl font-black text-slate-950">{isAr ? "اختبار رافن SPM" : "Raven SPM Test"}</h2>
            <p className="mb-8 text-sm font-semibold leading-7 text-slate-600">
              {isAr
                ? "اختبار المصفوفات المتتابعة لقياس القدرة على الاستدلال غير اللفظي."
                : "Standard Progressive Matrices assessment for non-verbal reasoning."}
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-black text-indigo-700">
              {isAr ? "دخول الاختبار" : "Start test"}
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
            </span>
          </button>

          <button
            onClick={() => onSelect("rogers")}
            className="group min-h-72 rounded-lg border border-slate-200 bg-white p-6 text-start shadow-sm transition hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Brain className="h-7 w-7" />
            </div>
            <h2 className="mb-3 text-2xl font-black text-slate-950">{isAr ? "مقياس روجرز" : "Rogers Scale"}</h2>
            <p className="mb-8 text-sm font-semibold leading-7 text-slate-600">
              {isAr
                ? "مقياس الذكاءات المتعددة مع تقرير تفصيلي قابل للطباعة والحفظ كـ PDF."
                : "Multiple intelligences scale with a detailed printable report."}
            </p>
            <span className="inline-flex items-center gap-2 text-sm font-black text-emerald-700">
              {isAr ? "دخول الاختبار" : "Start test"}
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
            </span>
          </button>
        </section>

        <footer className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
          <Layers3 className="h-4 w-4" />
          {isAr ? "منصة موحدة للاختبارات" : "Unified assessment platform"}
        </footer>
      </div>
    </main>
  );
}

export default function App() {
  const [lang, setLang] = useState<AppLang>(() => (localStorage.getItem("tests_language") === "en" ? "en" : "ar"));
  const [hashPath, setHashPath] = useState(() => window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setHashPath(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem("tests_language", lang);
  }, [lang]);

  if (hashPath === "#/records-vault") {
    return <AdminRecords />;
  }

  const selectedExam: SelectedExam = hashPath === "#/raven" ? "raven" : hashPath === "#/rogers" ? "rogers" : "dashboard";
  const goDashboard = () => {
    window.location.hash = "";
    setHashPath("");
  };

  if (selectedExam === "raven") {
    return <RavenApp lang={lang} setLang={setLang} onBack={goDashboard} />;
  }

  if (selectedExam === "rogers") {
    return (
      <ExamShell lang={lang} onBack={goDashboard}>
        <RogersApp lang={lang} />
      </ExamShell>
    );
  }

  return (
    <Dashboard
      lang={lang}
      setLang={setLang}
      onSelect={(exam) => {
        window.location.hash = `#/${exam}`;
        setHashPath(window.location.hash);
      }}
    />
  );
}
