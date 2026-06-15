import React, { useEffect, useRef, useState } from "react";
import type { ParticipantInfo } from "../App";
import { QUESTIONS } from "../data/questions";
import { MatrixRenderer } from "./MatrixRenderer";
import { AlertTriangle, ArrowLeft, ArrowRight, Timer } from "lucide-react";

interface TestSessionProps {
  participant: ParticipantInfo;
  mode: "standard" | "learning";
  lang: "ar" | "en";
  onFinish: (answers: Record<string, number>, timeSpentSeconds: number) => void;
  onQuit: () => void;
}

const EXAM_SECONDS = 40 * 60;

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export const TestSession: React.FC<TestSessionProps> = ({ participant, lang, onFinish, onQuit }) => {
  const isAr = lang === "ar";
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("raven_spm_active_answers");
    return saved ? JSON.parse(saved) : {};
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(EXAM_SECONDS);
  const [timeSpent, setTimeSpent] = useState(0);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const submittedRef = useRef(false);
  const answersRef = useRef(answers);
  const timeSpentRef = useRef(timeSpent);

  const currentQuestion = QUESTIONS[currentIndex];
  const isLastQuestion = currentIndex === QUESTIONS.length - 1;
  const totalAnswered = Object.keys(answers).length;

  const submit = () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    localStorage.removeItem("raven_spm_active_answers");
    onFinish(answersRef.current, timeSpentRef.current);
  };

  useEffect(() => {
    answersRef.current = answers;
    localStorage.setItem("raven_spm_active_answers", JSON.stringify(answers));
  }, [answers]);

  useEffect(() => {
    timeSpentRef.current = timeSpent;
  }, [timeSpent]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          timeSpentRef.current = EXAM_SECONDS;
          submit();
          return 0;
        }
        return previous - 1;
      });
      setTimeSpent((previous) => Math.min(EXAM_SECONDS, previous + 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const selectOption = (optionIndex: number) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: optionIndex,
    }));

    if (!isLastQuestion) {
      window.setTimeout(() => setCurrentIndex((previous) => Math.min(QUESTIONS.length - 1, previous + 1)), 250);
    }
  };

  const jumpToQuestion = (index: number) => setCurrentIndex(index);
  const goPrevious = () => setCurrentIndex((previous) => Math.max(0, previous - 1));
  const goNext = () => setCurrentIndex((previous) => Math.min(QUESTIONS.length - 1, previous + 1));

  return (
    <div className="max-w-7xl mx-auto py-2 md:py-4 px-2 md:px-4" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col md:flex-row justify-between items-stretch gap-2 md:gap-4 border-b border-gray-200 pb-2 md:pb-4 mb-3 md:mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onQuit}
            className="text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-200 bg-white hover:bg-gray-50 px-3 py-2 rounded-lg transition shadow-sm cursor-pointer"
          >
            {isAr ? "خروج وإلغاء" : "Cancel and Exit"}
          </button>
          <span className="text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg">
            {isAr ? `المتقدم: ${participant.fullName}` : `Participant: ${participant.fullName}`}
          </span>
          <span className="text-xs font-bold text-gray-600 bg-gray-100 border border-gray-200 px-3 py-2 rounded-lg">
            {isAr ? `العمر: ${participant.age}` : `Age: ${participant.age}`}
          </span>
        </div>

        <div className="flex items-center gap-3 justify-between md:justify-end">
          <div className="flex items-center gap-2 text-gray-800 font-bold bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
            <Timer className="w-5 h-5 text-slate-900" />
            <span className="font-mono text-lg tracking-wider text-slate-900">{formatTime(timeLeft)}</span>
            <span className="text-[10px] text-gray-500 font-bold">{isAr ? "متبقٍ" : "left"}</span>
          </div>
          <button
            onClick={() => setConfirmSubmitOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2 rounded-lg shadow transition cursor-pointer text-sm"
          >
            {isAr ? "إنهاء الاختبار" : "Finish"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6 items-start">
        <aside className="hidden lg:block lg:col-span-3 bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-900 text-sm">
              {isAr ? `التقدم: ${totalAnswered} من 60` : `Progress: ${totalAnswered} / 60`}
            </h4>
            <span className="text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded font-bold">
              {Math.round((totalAnswered / QUESTIONS.length) * 100)}%
            </span>
          </div>

          <div className="w-full bg-gray-100 h-2 rounded overflow-hidden mb-5 border border-gray-200">
            <div className="bg-slate-900 h-full transition-all duration-300" style={{ width: `${(totalAnswered / QUESTIONS.length) * 100}%` }} />
          </div>

          {(["A", "B", "C", "D", "E"] as const).map((setKey) => {
            const setQuestions = QUESTIONS.filter((question) => question.set === setKey);
            return (
              <div key={setKey} className="mb-4">
                <div className="text-xs font-bold text-gray-500 mb-2 flex justify-between">
                  <span>{isAr ? `المجموعة ${setKey}` : `Set ${setKey}`}</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {setQuestions.filter((question) => answers[question.id]).length} / 12
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {setQuestions.map((question) => {
                    const absIdx = QUESTIONS.findIndex((item) => item.id === question.id);
                    const isCurrent = absIdx === currentIndex;
                    const isAnswered = Boolean(answers[question.id]);
                    return (
                      <button
                        key={question.id}
                        onClick={() => jumpToQuestion(absIdx)}
                        className={`text-xs p-2 rounded font-bold transition flex items-center justify-center cursor-pointer ${
                          isCurrent
                            ? "bg-slate-900 text-white shadow"
                            : isAnswered
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                            : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {question.num}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </aside>

        <section
          className="lg:col-span-9 space-y-3 md:space-y-5"
          style={
            {
              "--matrix-main-width": "clamp(300px, 42vw, 520px)",
              "--matrix-option-width": "clamp(86px, 12vw, 148px)",
            } as React.CSSProperties
          }
        >
          <div className="lg:hidden bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold text-gray-700">
                {isAr ? `السؤال ${currentIndex + 1} من 60` : `Item ${currentIndex + 1} of 60`}
              </span>
              <span className="text-xs text-slate-700 bg-slate-100 px-2 py-1 rounded font-bold">
                {Math.round((totalAnswered / QUESTIONS.length) * 100)}%
              </span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {QUESTIONS.map((question, index) => {
                const isCurrent = index === currentIndex;
                const isAnswered = Boolean(answers[question.id]);
                return (
                  <button
                    key={question.id}
                    onClick={() => jumpToQuestion(index)}
                    className={`h-8 min-w-8 rounded text-[11px] font-bold border ${
                      isCurrent
                        ? "bg-slate-900 text-white border-slate-900"
                        : isAnswered
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-3 md:p-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded bg-slate-100 border border-slate-200 text-slate-900 flex items-center justify-center font-extrabold text-lg">
              {currentQuestion.set}
            </span>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">
                {isAr ? "السؤال الحالي" : "Current item"}
              </p>
              <h3 className="text-sm font-bold text-gray-900">
                {isAr ? `مصفوفة رقم ${currentQuestion.num} - المجموعة ${currentQuestion.set}` : `Matrix #${currentQuestion.num} - Set ${currentQuestion.set}`}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[minmax(300px,var(--matrix-main-width))_minmax(280px,1fr)] gap-3 md:gap-5 items-start">
            <div className="space-y-2 md:space-y-3">
              <div className="flex justify-between items-center px-1">
                <h3 className="font-extrabold text-gray-950 text-base md:text-xl">
                  {isAr ? "صورة السؤال" : "Question Image"}
                </h3>
                <span className="text-[10px] text-gray-500 font-bold bg-gray-100 border border-gray-200 px-2.5 py-1 rounded">
                  ID: {currentQuestion.id}
                </span>
              </div>
              <div className="bg-gray-100 rounded-lg border border-gray-200 p-2 md:p-4 flex items-center justify-center shadow-inner relative overflow-hidden h-[calc(var(--matrix-main-width)*0.67)] min-h-[190px] max-h-[360px] md:max-h-[420px]">
                <MatrixRenderer question={currentQuestion} type="main" />
              </div>
            </div>

            <div className="space-y-2 md:space-y-3">
              <h3 className="text-[11px] md:text-xs font-bold text-gray-600 uppercase px-1">
                {isAr ? "اختر الجزء الذي يكمل النمط:" : "Select the piece that completes the pattern:"}
              </h3>
              <div className="grid grid-cols-2 gap-2 md:gap-3 justify-items-center">
                {Array.from({ length: currentQuestion.optionsCount }).map((_, index) => {
                  const optIdx = index + 1;
                  const isSelected = answers[currentQuestion.id] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => selectOption(optIdx)}
                      style={{
                        width: "calc(var(--matrix-option-width) + 34px)",
                        height: "calc(var(--matrix-option-width) * 0.72 + 28px)",
                      }}
                      className={`relative rounded-lg p-1.5 md:p-2 border transition text-center group cursor-pointer min-w-[120px] max-w-full min-h-[90px] ${
                        isSelected
                          ? "border-slate-900 bg-slate-50 ring-2 ring-slate-200"
                          : "border-gray-200 bg-gray-50 hover:bg-white hover:border-slate-800 hover:shadow-sm"
                      }`}
                    >
                      <span className={`absolute top-2 left-2 text-[10px] font-bold ${isSelected ? "text-slate-900" : "text-gray-400"}`}>
                        {optIdx}
                      </span>
                      <div className="pt-4 pb-1 h-full">
                        <MatrixRenderer question={currentQuestion} type="option" optionIndex={optIdx} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-2 md:gap-4 pt-3 md:pt-5 border-t border-gray-200">
            <button
              onClick={goPrevious}
              disabled={currentIndex === 0}
              className={`flex-1 py-3 md:py-4 font-bold rounded-lg transition flex items-center justify-center gap-2 border text-sm ${
                currentIndex === 0
                  ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200 cursor-pointer"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isAr ? "السابق" : "Previous"}</span>
            </button>

            {isLastQuestion ? (
              <button
                onClick={() => setConfirmSubmitOpen(true)}
                className="flex-[2] py-3 md:py-4 bg-slate-900 text-white font-bold rounded-lg shadow hover:bg-slate-800 transition flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {isAr ? "إنهاء وعرض النتيجة" : "Finish and View Result"}
              </button>
            ) : (
              <button
                onClick={goNext}
                className="flex-[2] py-3 md:py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isAr ? "السؤال التالي" : "Next Question"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </section>
      </div>

      {confirmSubmitOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl border border-slate-100" dir={isAr ? "rtl" : "ltr"}>
            <div className="flex items-center gap-3 text-amber-700 mb-4 bg-amber-50 p-3 rounded-lg">
              <AlertTriangle className="w-7 h-7 flex-shrink-0" />
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {isAr ? "تأكيد إنهاء الاختبار" : "Confirm submission"}
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  {isAr ? "سيتم حساب النتيجة حسب جدول التحويل العمري." : "The result will be computed using the age-norm conversion table."}
                </p>
              </div>
            </div>

            {totalAnswered < QUESTIONS.length && (
              <p className="text-xs text-rose-700 font-medium mb-4 leading-relaxed bg-rose-50 p-3 rounded-lg border border-rose-100">
                {isAr
                  ? `تنبيه: أجبت عن ${totalAnswered} سؤالاً من أصل 60.`
                  : `Warning: You answered ${totalAnswered} out of 60 items.`}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={submit}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg shadow transition cursor-pointer text-sm"
              >
                {isAr ? "تأكيد وعرض النتيجة" : "Submit"}
              </button>
              <button
                onClick={() => setConfirmSubmitOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-lg transition cursor-pointer text-sm"
              >
                {isAr ? "متابعة الحل" : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
