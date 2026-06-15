import React, { useState } from "react";
import type { ParticipantInfo } from "../App";
import { QUESTIONS } from "../data/questions";
import { lookupPercentileAndGrade } from "../data/norms";
import { MatrixRenderer } from "./MatrixRenderer";
import { Award, Check, FileText, RefreshCw, X } from "lucide-react";

interface TestResultsProps {
  answers: Record<string, number>;
  timeSpentSeconds: number;
  participant: ParticipantInfo;
  mode: "standard" | "learning";
  lang: "ar" | "en";
  onRestart: () => void;
}

type SetKey = "A" | "B" | "C" | "D" | "E";

const FACTORS: Record<SetKey, { ar: string; en: string }> = {
  A: { ar: "التمييز الإدراكي", en: "Perceptual Discrimination" },
  B: { ar: "مقارنة التشابه", en: "Similarity Comparison" },
  C: { ar: "الاستدلال المقارن", en: "Comparative Reasoning" },
  D: { ar: "علاقات السلاسل", en: "Series Relations" },
  E: { ar: "الاستدلال المجرد", en: "Abstract Reasoning" },
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const getPercentileText = (percentile: number, isAr: boolean) => {
  if (percentile >= 95) return isAr ? "≥95" : ">=95";
  if (percentile < 5) return isAr ? "أقل من 5" : "<5";
  return `${percentile}`;
};

const getIqValue = (percentile: number, isAr: boolean) => {
  if (percentile >= 95) return isAr ? "أعلى من 130" : "Above 130";
  if (percentile >= 75) return "115 - 129";
  if (percentile >= 25) return "85 - 114";
  if (percentile >= 5) return "70 - 84";
  return isAr ? "أقل من 70" : "Below 70";
};

const getNarrative = (percentile: number, isAr: boolean) => {
  if (isAr) {
    if (percentile >= 95) {
      return {
        interpretation:
          "تظهر نتيجة الاختبار أن المستوى الفكري يقع ضمن المستوى الممتاز، متجاوزاً 95% من الأقران في الفئة العمرية المقارنة. يشير ذلك إلى قدرة عالية جداً على إدراك العلاقات البصرية، التقاط الأنماط المركبة، حل المشكلات المجردة، والانتقال السريع بين قواعد الاستدلال.",
        suggestions: [
          "ارتفاع القدرة العقلية لا يعني الاستغناء عن الجهد المنظم؛ يوصى بوضع أهداف عالية ومستمرة.",
          "توفير بيئة تعلم غنية بالتحديات يساعد على استثمار القدرة الاستدلالية بشكل أفضل.",
          "الاهتمام بتنمية الصفات النفسية الداعمة مثل المثابرة، تحمل المسؤولية، وتنظيم الانتباه.",
        ],
      };
    }
    if (percentile >= 75) {
      return {
        interpretation:
          "تشير النتيجة إلى مستوى أعلى من المتوسط في الاستدلال غير اللفظي. يمتلك المتقدم قدرة جيدة على تحليل العلاقات الشكلية وفهم التدرج بين العناصر، مع قابلية واضحة للتعامل مع مسائل جديدة تتطلب تنظيماً بصرياً ومنطقياً.",
        suggestions: [
          "التدريب المنتظم على مسائل التفكير المجرد يمكن أن يرفع الأداء في المجموعات الأصعب.",
          "يفضل تنويع أنشطة التعلم بين التحليل البصري، المنطق، وحل المشكلات.",
          "المحافظة على الهدوء والتركيز أثناء الاختبار تؤثر إيجابياً في دقة الأداء.",
        ],
      };
    }
    if (percentile >= 25) {
      return {
        interpretation:
          "تقع النتيجة ضمن المستوى المتوسط المتوقع للفئة العمرية. يدل ذلك على قدرة مناسبة في فهم الأنماط والعلاقات البصرية، مع وجود مساحة للتطوير من خلال التدريب المتدرج وتنظيم طريقة الحل.",
        suggestions: [
          "ينصح بالتدرب على اكتشاف القاعدة قبل النظر إلى الاختيارات.",
          "تجزئة المسألة إلى صفوف وأعمدة يساعد على تقليل الأخطاء.",
          "الاستمرار في تمارين الانتباه البصري والمنطق المتدرج مفيد لتحسين الأداء.",
        ],
      };
    }
    return {
      interpretation:
        "تشير النتيجة إلى أداء دون المتوسط في هذا الاختبار غير اللفظي. قد يتأثر الأداء بعوامل متعددة مثل التركيز، القلق، سرعة الإجابة، أو عدم الاعتياد على نمط المصفوفات، لذلك لا ينبغي اعتبار النتيجة حكماً نهائياً على القدرة العامة.",
      suggestions: [
        "يفضل إعادة التدريب على أمثلة بسيطة ثم التدرج نحو الأسئلة الأكثر تعقيداً.",
        "ينصح بتقليل المشتتات وتحسين ظروف الاختبار عند إعادة المحاولة.",
        "يمكن الاستفادة من إرشاد مختص إذا كانت النتيجة ستستخدم لاتخاذ قرار تعليمي أو مهني.",
      ],
    };
  }

  if (percentile >= 95) {
    return {
      interpretation:
        "Your test result shows that your intellectual level is at the excellent level, surpassing over 95% of peers in the comparison age group. You demonstrate strong visual discrimination, rapid pattern capture, abstract problem solving, and flexible logical reasoning.",
      suggestions: [
        "High ability does not replace structured effort; maintain high standards and sustained practice.",
        "A rich learning environment with challenging tasks can help convert ability into achievement.",
        "Continue developing supporting traits such as persistence, responsibility, and focused attention.",
      ],
    };
  }
  if (percentile >= 75) {
    return {
      interpretation:
        "Your result indicates above-average non-verbal reasoning. You show good capacity for analyzing visual relationships, understanding progression rules, and solving novel problems that require visual and logical organization.",
      suggestions: [
        "Regular practice with abstract reasoning can strengthen performance on harder items.",
        "Use a variety of learning activities involving visual analysis, logic, and problem solving.",
        "Calm attention and controlled pacing can improve accuracy during testing.",
      ],
    };
  }
  if (percentile >= 25) {
    return {
      interpretation:
        "Your result falls within the average range for the comparison age group. This suggests appropriate ability to understand visual patterns and relationships, with room for improvement through structured practice.",
      suggestions: [
        "Practice identifying the rule before checking the answer options.",
        "Break each matrix into rows and columns to reduce errors.",
        "Continue exercises in visual attention and progressive logic.",
      ],
    };
  }
  return {
    interpretation:
      "Your result is below the average range on this non-verbal test. Performance may be affected by focus, anxiety, speed, or unfamiliarity with matrix-style problems, so the score should not be treated as a final judgment of overall ability.",
    suggestions: [
      "Start with simpler examples, then gradually move to more complex items.",
      "Reduce distractions and improve testing conditions before retesting.",
      "Seek professional guidance if the result will be used for educational or career decisions.",
    ],
  };
};

export const TestResults: React.FC<TestResultsProps> = ({
  answers,
  timeSpentSeconds,
  participant,
  lang,
  onRestart,
}) => {
  const isAr = lang === "ar";
  const [selectedReviewSet, setSelectedReviewSet] = useState<SetKey>("A");
  const [activeReviewIndex, setActiveReviewIndex] = useState<number | null>(null);

  let scoreOf60 = 0;
  const setCorrectScores: Record<SetKey, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const setTotals: Record<SetKey, number> = { A: 12, B: 12, C: 12, D: 12, E: 12 };

  QUESTIONS.forEach((question) => {
    if (answers[question.id] === question.correct) {
      scoreOf60 += 1;
      setCorrectScores[question.set] += 1;
    }
  });

  const answeredCount = Object.keys(answers).length;
  const result = lookupPercentileAndGrade(participant.age, scoreOf60);
  const narrative = getNarrative(result.percentile, isAr);
  const reportDate = new Intl.DateTimeFormat(isAr ? "ar-EG" : "en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  const handlePrint = () => window.print();

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="report-section-title">
      <span className="report-leaf">◒</span>
      <span>{children}</span>
    </h2>
  );

  const ReportPreview = () => (
    <article className="report-sheet bg-white text-[#2b2b2b]" dir={isAr ? "rtl" : "ltr"}>
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold mb-5">{isAr ? "تقرير الاختبار" : "Test Report"}</h1>
        <p className="text-2xl leading-snug">
          {isAr
            ? "اختبار رافن للذكاء (60 بنداً)، المصفوفات المتتابعة القياسية (SPM)"
            : "Raven IQ Test (60 Items), Standard Progressive Matrices (SPM)"}
        </p>
        <p className="text-sm text-gray-500 mt-3">
          {isAr ? "مؤسسة الإمام أحمد بن حنبل" : "Imam Ahmad ibn Hanbal Foundation"}
        </p>
      </header>

      <SectionTitle>{isAr ? "المعلومات الأساسية" : "Basic Information"}</SectionTitle>
      <table className="report-table mb-8">
        <tbody>
          <tr>
            <th>{isAr ? "الاسم الكامل" : "Full Name"}</th>
            <td>{participant.fullName}</td>
          </tr>
          <tr>
            <th>{isAr ? "العمر" : "Age"}</th>
            <td>{participant.age}</td>
          </tr>
          <tr>
            <th>{isAr ? "الفئة العمرية المعيارية" : "Norm Group"}</th>
            <td>{isAr ? result.ageLabelAr : result.ageLabelEn}</td>
          </tr>
          <tr>
            <th>{isAr ? "المدة" : "Duration"}</th>
            <td>{formatTime(timeSpentSeconds)}</td>
          </tr>
          <tr>
            <th>{isAr ? "وقت الاختبار" : "Test Time"}</th>
            <td>{reportDate}</td>
          </tr>
        </tbody>
      </table>

      <SectionTitle>{isAr ? "الدرجات الخام" : "Raw Scores"}</SectionTitle>
      <table className="report-table report-score-table mb-8">
        <thead>
          <tr>
            <th>{isAr ? "العامل" : "Factor"}</th>
            <th>{isAr ? "الدرجة" : "Score"}</th>
            <th>{isAr ? "الدرجة القصوى" : "Max Score"}</th>
            <th>{isAr ? "نسبة الدقة" : "Accuracy Rate"}</th>
          </tr>
        </thead>
        <tbody>
          {(["A", "B", "C", "D", "E"] as const).map((setKey) => {
            const score = setCorrectScores[setKey];
            const max = setTotals[setKey];
            return (
              <tr key={setKey}>
                <td>{isAr ? FACTORS[setKey].ar : FACTORS[setKey].en}</td>
                <td>{score}</td>
                <td>{max}</td>
                <td>{Math.round((score / max) * 100)}%</td>
              </tr>
            );
          })}
          <tr>
            <td>{isAr ? "المجموع" : "Total"}</td>
            <td>{scoreOf60}</td>
            <td>60</td>
            <td>{Math.round((scoreOf60 / 60) * 100)}%</td>
          </tr>
        </tbody>
      </table>

      <SectionTitle>{isAr ? "المستوى الفكري" : "Intellectual Level"}</SectionTitle>
      <div className="report-level mb-8">
        <p>
          {isAr ? "الدرجة المعيارية للتقييم: " : "Your Assessment Standard Score: "}
          <strong>{getPercentileText(result.percentile, isAr)}</strong>
        </p>
        <p>
          {isAr ? "المستوى الفكري: " : "Your Intellectual Level: "}
          <strong>{isAr ? result.labelAr : result.labelEn}</strong>
        </p>
        <p>
          {isAr ? "قيمة الذكاء التقريبية: " : "Your IQ Value: "}
          <strong>{getIqValue(result.percentile, isAr)}</strong>
        </p>
      </div>

      <SectionTitle>{isAr ? "تفسير النتيجة واقتراحات التطوير" : "Result Interpretation and Development Suggestions"}</SectionTitle>
      <section className="report-text-block">
        <h3>{isAr ? "تفسير النتيجة" : "Result Interpretation"}</h3>
        <p>{narrative.interpretation}</p>

        <h3>{isAr ? "اقتراحات إرشادية" : "Guidance Suggestions"}</h3>
        <p>
          {isAr
            ? "تساعد النقاط الآتية على فهم النتيجة واستثمارها بصورة عملية:"
            : "The following points may help interpret and use the result constructively:"}
        </p>
        <ul>
          {narrative.suggestions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <SectionTitle>{isAr ? "تنبيهات التقييم" : "Assessment Reminders"}</SectionTitle>
      <section className="report-reminder">
        <p>
          {isAr
            ? "اختبار رافن للمصفوفات المتتابعة يقيس جانباً أساسياً من الذكاء السائل مثل التفكير المنطقي والاستدلال المجرد، ولا يغطي كل أبعاد الذكاء مثل التعبير اللفظي، الذاكرة، الذكاء الانفعالي، القدرة العملية، والإبداع."
            : "Raven's Standard Progressive Matrices primarily measures fluid intelligence, such as logical reasoning and abstract thinking. It does not cover all intelligence dimensions such as verbal expression, memory, emotional intelligence, practical ability, and creativity."}
        </p>
        <p>
          {isAr
            ? "تتأثر نتائج الاختبار ببيئة الاختبار، الحالة الشخصية، مستوى التركيز، وطريقة الإجابة؛ لذلك تستخدم النتيجة كمرجع مساعد وليست حكماً نهائياً منفرداً."
            : "Test results are influenced by testing environment, personal state, focus level, and answering attitude; a single result is for reference only."}
        </p>
        <p>
          {isAr
            ? "يمكن تنمية القدرات المعرفية بالتدريب العلمي المستمر، ويفضل فهم النتائج ضمن مجموعة من المؤشرات لا من خلال مقياس واحد فقط."
            : "Cognitive abilities can be continuously developed through scientific training, and results should be understood together with multiple indicators."}
        </p>
      </section>

      <ul className="report-footer-notes">
        <li>
          {isAr
            ? "ينبغي فهم نتائج التقييم بصورة شاملة مع مراعاة عوامل متعددة."
            : "All assessment results should be comprehensively understood by combining multiple factors."}
        </li>
        <li>
          {isAr
            ? "لكل شخص تركيبته الخاصة من المواهب ونقاط القوة."
            : "Everyone has a unique combination of talents."}
        </li>
        <li>
          {isAr
            ? "يوصى بوضع خطط تطوير شخصية بإرشاد مختصين عند الحاجة."
            : "It is recommended to formulate personalized development plans under professional guidance when needed."}
        </li>
      </ul>
      <p className="text-center text-lg mt-8 border-t border-gray-200 pt-5">
        {isAr
          ? "*المقياس أداة مساعدة للفحص، وتبقى النتائج للاسترشاد فقط."
          : "*As the scale is only an auxiliary screening tool, the test results are for reference only."}
      </p>
    </article>
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-4" dir={isAr ? "rtl" : "ltr"}>
      <style>{`
        .report-sheet {
          width: 100%;
          max-width: 980px;
          margin: 0 auto;
          padding: 42px 36px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
          font-family: Arial, "Tahoma", sans-serif;
        }
        .report-section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 24px;
          font-weight: 800;
          margin: 30px 0 16px;
          color: #2d2d2d;
        }
        [dir="rtl"] .report-section-title {
          flex-direction: row-reverse;
          justify-content: flex-end;
        }
        .report-leaf {
          width: 30px;
          height: 30px;
          border: 1.5px solid #35a36e;
          color: #35a36e;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex: 0 0 auto;
        }
        .report-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          font-size: 18px;
        }
        .report-table th,
        .report-table td {
          border: 1px solid #d9d9d9;
          padding: 14px 12px;
          text-align: start;
          vertical-align: middle;
        }
        .report-table th {
          background: #f5f5f5;
          font-weight: 800;
        }
        .report-table tbody th {
          width: 26%;
          font-weight: 400;
        }
        .report-score-table thead th {
          text-align: center;
        }
        .report-score-table td:not(:first-child) {
          text-align: center;
        }
        .report-level {
          font-size: 19px;
          line-height: 1.9;
        }
        .report-level strong {
          color: #35a36e;
          font-weight: 900;
        }
        .report-text-block {
          font-size: 18px;
          line-height: 2;
        }
        .report-text-block h3 {
          font-size: 20px;
          font-weight: 800;
          margin: 14px 0 8px;
        }
        .report-text-block ul,
        .report-footer-notes {
          padding-inline-start: 28px;
          margin-top: 10px;
        }
        .report-text-block li,
        .report-footer-notes li {
          margin: 8px 0;
        }
        .report-reminder {
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 10px;
          padding: 18px 22px;
          font-size: 18px;
          line-height: 2;
        }
        .report-footer-notes {
          font-size: 18px;
          line-height: 1.9;
          margin-top: 18px;
        }
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }
          body {
            background: #fff !important;
          }
          .report-sheet {
            max-width: none;
            width: 100%;
            padding: 0;
            border: 0;
            border-radius: 0;
            box-shadow: none;
          }
          .report-table,
          .report-text-block,
          .report-reminder,
          .report-footer-notes {
            font-size: 13px;
          }
          .report-section-title {
            font-size: 18px;
            margin: 20px 0 10px;
          }
          .report-sheet header h1 {
            font-size: 28px;
          }
          .report-sheet header p {
            font-size: 18px;
          }
          .report-table th,
          .report-table td {
            padding: 9px 8px;
          }
          .report-level {
            font-size: 14px;
            line-height: 1.7;
          }
          .report-text-block {
            line-height: 1.7;
          }
          .report-reminder {
            line-height: 1.7;
            padding: 12px 14px;
          }
        }
      `}</style>

      <div className="print:hidden flex flex-col md:flex-row justify-between gap-4 items-start md:items-center border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <Award className="w-8 h-8 text-slate-900" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isAr ? "معاينة التقرير قبل الطباعة" : "Print Preview"}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {isAr
                ? "هذا هو التقرير الذي سيظهر عند الطباعة."
                : "This is the report that will be printed."}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{isAr ? "طباعة التقرير" : "Print Report"}</span>
          </button>
          <button
            onClick={onRestart}
            className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isAr ? "اختبار جديد" : "New Test"}</span>
          </button>
        </div>
      </div>

      <ReportPreview />

      <div className="print:hidden mt-8 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="border-b border-gray-200 pb-4 mb-5">
          <h3 className="text-lg font-bold text-gray-950">
            {isAr ? "مراجعة الأسئلة والإجابات" : "Item Review"}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {isAr
              ? "اختر مجموعة ثم افتح أي سؤال لمراجعة الاختيار الصحيح وإجابة المتقدم."
              : "Choose a set and open any item to review the correct and submitted answers."}
          </p>
        </div>

        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {(["A", "B", "C", "D", "E"] as const).map((setKey) => (
            <button
              key={setKey}
              onClick={() => {
                setSelectedReviewSet(setKey);
                setActiveReviewIndex(null);
              }}
              className={`px-5 py-2 rounded-lg font-bold text-sm transition cursor-pointer flex-1 text-center ${
                selectedReviewSet === setKey
                  ? "bg-slate-900 text-white shadow"
                  : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {isAr ? `المجموعة ${setKey}` : `Set ${setKey}`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {QUESTIONS.filter((question) => question.set === selectedReviewSet).map((question) => {
            const isCorrect = answers[question.id] === question.correct;
            const absIdx = QUESTIONS.findIndex((item) => item.id === question.id);
            const isFocused = activeReviewIndex === absIdx;
            return (
              <button
                key={question.id}
                onClick={() => setActiveReviewIndex(isFocused ? null : absIdx)}
                className={`p-3 rounded-lg border text-center transition cursor-pointer ${
                  isFocused
                    ? "border-slate-900 bg-slate-50"
                    : isCorrect
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-800"
                }`}
              >
                <span className="text-xs text-gray-500 font-bold">#{question.num}</span>
                <div className="mt-2 flex justify-center">
                  {isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </div>
              </button>
            );
          })}
        </div>

        {activeReviewIndex !== null && (
          <div className="mt-6 border border-gray-200 rounded-lg p-5 bg-gray-50">
            {(() => {
              const question = QUESTIONS[activeReviewIndex];
              const userChoice = answers[question.id] || 0;
              return (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                  <div className="md:col-span-5 bg-white p-4 border border-gray-200 rounded-lg">
                    <MatrixRenderer question={question} type="main" />
                  </div>
                  <div className="md:col-span-7 space-y-3">
                    <h4 className="font-extrabold text-gray-900 text-lg">
                      {isAr ? `السؤال ${question.id}` : `Item ${question.id}`}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm font-bold">
                      <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800">
                        {isAr ? `الإجابة الصحيحة: ${question.correct}` : `Correct: ${question.correct}`}
                      </div>
                      <div className="p-3 bg-white border border-gray-200 rounded-lg text-gray-800">
                        {isAr ? `إجابة المتقدم: ${userChoice || "لم يجب"}` : `Participant answer: ${userChoice || "Skipped"}`}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {isAr ? question.explanationAr : question.explanationEn}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
