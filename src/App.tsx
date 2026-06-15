import React, { useState } from "react";
import { TestWelcome } from "./components/TestWelcome";
import { TestSession } from "./components/TestSession";
import { TestResults } from "./components/TestResults";
import { publicAsset } from "./utils/publicAsset";

type QuizStage = "welcome" | "session" | "results";

export interface ParticipantInfo {
  fullName: string;
  age: number;
}

export default function App() {
  const [stage, setStage] = useState<QuizStage>("welcome");
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [participant, setParticipant] = useState<ParticipantInfo>({ fullName: "", age: 18 });
  const [testMode, setTestMode] = useState<"standard" | "learning">("standard");
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeSpent, setTimeSpent] = useState<number>(0);

  const handleStartTest = (
    participantInfo: ParticipantInfo,
    mode: "standard" | "learning",
    selectedLang: "ar" | "en"
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
    <div className="min-h-screen bg-[#F6F8FB] text-[#1F2937] font-sans antialiased selection:bg-indigo-100 pb-16">
      <header
        className="print:hidden bg-white border-b border-gray-200 px-4 md:px-10 py-3 shadow-sm sticky top-0 z-10"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-start text-right">
            <img
              src={publicAsset("logo.jpg")}
              alt={isAr ? "شعار مؤسسة الإمام أحمد بن حنبل" : "Imam Ahmad ibn Hanbal Foundation logo"}
              className={`${stage === "session" ? "h-9 md:h-14" : "h-14 md:h-20"} w-auto object-contain`}
              draggable={false}
            />
            <p className={`${stage === "session" ? "hidden md:block mt-1 text-sm" : "mt-2 text-sm md:text-lg"} text-gray-800 font-extrabold leading-tight`}>
              {isAr ? "مؤسسة الإمام أحمد بن حنبل" : "Imam Ahmad ibn Hanbal Foundation"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {stage === "welcome" && (
              <button
                onClick={() => setLang(isAr ? "en" : "ar")}
                className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:border-slate-700 transition cursor-pointer shadow-sm"
              >
                {isAr ? "English" : "العربية"}
              </button>
            )}
            {stage === "session" && (
              <span className="text-xs text-gray-500 font-bold hidden sm:block">
                {isAr ? "جاري إجراء الاختبار" : "Session in progress"}
              </span>
            )}
            {stage === "results" && (
              <button
                onClick={handleResetTest}
                className="border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-1.5 rounded-lg text-xs font-bold hover:border-slate-700 transition cursor-pointer shadow-sm"
              >
                {isAr ? "الرئيسية" : "Reset Test"}
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
