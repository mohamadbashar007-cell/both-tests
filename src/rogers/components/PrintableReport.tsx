import React from "react";
import { IntelligenceDetail, intelligences } from "../data/intelligenceData";
import { InstitutionLogo } from "./InstitutionLogo";

interface PrintableReportProps {
  scores: Record<string, number>;
  username: string;
  gradeOrSchool: string;
  isPreview?: boolean;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  scores,
  username,
  gradeOrSchool,
  isPreview = false,
}) => {
  const currentDate = new Date().toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Sort intelligences by score to find dominant ones
  const sortedIntelligences = [...intelligences]
    .map((intel) => ({
      ...intel,
      score: scores[intel.id] || 0,
    }))
    .sort((a, b) => b.score - a.score);

  const getLevelDescription = (score: number) => {
    if (score >= 27) {
      return {
        label: "مرتفع جداً (ذكاء قيادي وسائد)",
        color: "text-emerald-700 font-bold",
        bg: "bg-emerald-50",
        interpretation:
          "أنت تفضل استخدام هذا النوع من الذكاءات، وتشعر براحة ومتعة وسرور عند تطبيقه، بل حتى الآخرين يعرفون مدى تفوقك وتميزك فيه. ننصحك بقوة بتركيز مستقبلك وتخصصك الأكاديمي والمهني في نشاطات تدعم هذا المجال.",
      };
    } else if (score >= 16) {
      return {
        label: "متوسط (ذكاء مائل للقبول والتطوير)",
        color: "text-blue-700 font-semibold",
        bg: "bg-blue-50",
        interpretation:
          "أنت تميل إلى قبول استخدام هذا الذكاء وتشعر بارتياح مناسب عند توظيفه، ولكنه ليس الخيار الأول التلقائي لديك. يحتاج منك هذا النمط إلى قليل من الجهد والاهتمام الموجه لشحذه وتطويره بشكل أكبر.",
      };
    } else {
      return {
        label: "منخفض (ذكاء يحتاج لجهد مكثف)",
        color: "text-neutral-600",
        bg: "bg-neutral-50",
        interpretation:
          "هذا النمط لا يمثل منطقة الراحة الطبيعية بالنسبة لك حالياً وقد تتفادى استخدامه تفادياً للجهد الزائد. تذكر أن التدريب الواعي والمدرب المناسب كفيلان بمضاعفة قدراتك في هذا النمط بمرور الوقت.",
      };
    }
  };

  return (
    <div 
      id={isPreview ? "report-preview-area" : "printable-area"} 
      className={
        isPreview 
          ? "w-full bg-white text-neutral-900 p-4 md:p-8 relative font-sans leading-relaxed"
          : "print-only print-container p-8 font-sans text-neutral-900 bg-white"
      } 
      dir="rtl"
    >
      {/* Foundation Header Style Banner */}
      <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4 mb-6">
        <div className="text-right text-xs space-y-1">
          <p className="font-extrabold text-sm text-amber-700">مؤسسة الإمام أحمد ابن حنبل</p>
          <p className="text-slate-600 font-medium">الشؤون العلمية والتعليمية</p>
          <p className="text-slate-500 font-bold">مقياس روجرز للذكاءات المتعددة</p>
        </div>
        
        {/* Foundation Crest Custom Representation */}
        <div className="flex flex-col items-center justify-center text-center">
          <InstitutionLogo className="h-16" />
        </div>

        <div className="text-left text-xs space-y-1">
          <p><span className="font-semibold">تاريخ التقرير:</span> {currentDate}</p>
          <p><span className="font-semibold">رمز التقييم:</span> RS-{Math.floor(100000 + Math.random() * 900000)}</p>
          <p><span className="font-semibold">نوع الوثيقة:</span> تقرير تشخيصي رسمي</p>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="text-center bg-slate-100 py-3 rounded-lg mb-6 border border-slate-300">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-wide">
          وثيقة تحليل نتائج مقياس روجرز للذكاءات المتعددة
        </h1>
        <p className="text-xs text-amber-800 mt-1 font-bold">
          مؤسسة الإمام أحمد ابن حنبل
        </p>
      </div>

      {/* Candidate Data Info */}
      <div className="grid grid-cols-2 gap-4 mb-6 border border-slate-200 rounded-lg p-3 bg-slate-50 text-xs">
        <div>
          <p className="mb-1"><span className="font-bold text-slate-700">اسم المرشح الكامل:</span> <span className="text-sm font-medium">{username || "غير مسجل"}</span></p>
          <p><span className="font-bold text-slate-700">اسم نادي الطفل:</span> <span className="text-sm font-medium">{gradeOrSchool || "إدارة التقييم العام"}</span></p>
        </div>
        <div className="text-left border-r border-slate-200 pr-4">
          <p className="mb-1"><span className="font-bold text-slate-700">النمط المهيمن الأساسي:</span> <span className="text-sm font-bold text-slate-900">{sortedIntelligences[0]?.name}</span></p>
          <p><span className="font-bold text-slate-700">النمط الثانوي المساعد:</span> <span className="text-sm font-semibold text-slate-800">{sortedIntelligences[1]?.name}</span></p>
        </div>
      </div>

      {/* Introduction */}
      <div className="text-xs text-slate-700 leading-relaxed mb-6">
        <p>
          تم إعداد هذا التقرير العلمي للوقيعة والتشخيص الدقيق وتحديد القدرات الذهنية الكامنة للمرشح المذكور أعلاه وفقاً لاستجابته على الـ 56 عبارة المصنفة علمياً على نظرية الذكاءات المتعددة. تعكس النتائج المذكورة أدناه البنيات الإدراكية الفعالة ومكامن التميز السلوكي، والتي ننصح باتخاذها دليلاً استرشادياً بمسارات الإبداع الأكاديمي والتوجه المهني.
        </p>
      </div>

      {/* Summary Score Table */}
      <div className="mb-6">
        <h2 className="text-sm font-extrabold text-slate-900 mb-3 border-r-4 border-slate-800 pr-2">
          جدول توزيع الدرجات والمعدلات على الأنماط الثمانية:
        </h2>
        
        <table className="w-full text-xs text-right border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white border border-slate-800">
              <th className="p-2 border border-slate-800 text-center w-12">م</th>
              <th className="p-2 border border-slate-800">نوع الذكاء (Intelligence Type)</th>
              <th className="p-2 border border-slate-800 text-center w-24">الدرجة (من 35)</th>
              <th className="p-2 border border-slate-800 text-center w-32">المعدل النسبي</th>
              <th className="p-2 border border-slate-800 text-center w-52">التصنيف والتمكن</th>
            </tr>
          </thead>
          <tbody>
            {sortedIntelligences.map((meta, index) => {
              const score = scores[meta.id] || 0;
              const percentage = Math.round((score / 35) * 100);
              const level = getLevelDescription(score);
              return (
                <tr key={meta.id} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="p-2 border border-slate-200 text-center font-mono">{index + 1}</td>
                  <td className="p-2 border border-slate-200 font-bold">
                    {meta.name} <span className="text-[10px] text-slate-500 font-normal">({meta.englishName})</span>
                  </td>
                  <td className="p-2 border border-slate-200 text-center font-mono font-bold text-sm">
                    {score}
                  </td>
                  <td className="p-2 border border-slate-200 text-center font-mono font-semibold">
                    {percentage}%
                  </td>
                  <td className={`p-2 border border-slate-200 text-center text-[11px] ${level.color} font-medium`}>
                    {level.label}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SVG Simple Beautiful Progress Chart for PDF */}
      <div className="mb-8 p-4 border border-slate-200 rounded-lg bg-slate-50">
        <h3 className="text-xs font-bold text-slate-700 mb-3 text-center">المخطط البياني النسبي للقدرات الذهنية للمرشح</h3>
        <div className="space-y-2">
          {sortedIntelligences.map((meta) => {
            const score = scores[meta.id] || 0;
            const percentage = Math.round((score / 35) * 100);
            return (
              <div key={meta.id} className="flex items-center text-xs">
                <span className="w-24 text-right font-semibold truncate text-[11px]">{meta.name}</span>
                <span className="w-10 text-center font-mono text-[10px] text-slate-500">{score}/35</span>
                <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden mr-2">
                  <div 
                    className="bg-slate-700 h-full rounded-full" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="w-8 text-left font-mono text-[10px] mr-2">{percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Analysis of Top Intelligences */}
      <div className="print-page-break"></div>

      <div className="mt-4">
        <h2 className="text-base font-extrabold text-slate-900 mb-4 border-b-2 border-slate-800 pb-2">
          تحليل وتفصيل ذكاءات المرشح السائدة والمهيمنة:
        </h2>

        <div className="space-y-6">
          {/* Show the top 3 dominant intelligences in full analytical detail */}
          {sortedIntelligences.slice(0, 3).map((item, index) => {
            const score = scores[item.id] || 0;
            const percentage = Math.round((score / 35) * 100);
            const level = getLevelDescription(score);

            return (
              <div key={item.id} className="border border-slate-300 rounded-lg p-4 bg-white print-no-break">
                <div className="flex justify-between items-center bg-slate-100 p-2 rounded mb-3 border-r-4 border-slate-700">
                  <h3 className="text-sm font-bold text-slate-900">
                    المركز {index + 1}: {item.name} ({item.englishName})
                  </h3>
                  <span className="text-xs font-mono font-bold bg-slate-800 text-white px-2 py-0.5 rounded">
                    الدرجة: {score} من 35 | {percentage}%
                  </span>
                </div>

                <div className="text-xs space-y-3 leading-relaxed text-slate-800">
                  <p>
                    <span className="font-extrabold text-slate-900 border-b border-dashed border-slate-400">الوصف التشخيصي:</span> {item.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1 text-[11px] bg-slate-50 p-1 rounded">السمات البارزة لديك:</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 mr-2 pr-1 text-[11px]">
                        {item.characteristics.map((char, cId) => (
                          <li key={cId}>{char}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1 text-[11px] bg-slate-50 p-1 rounded">المهن الموصى بها والمناسبة:</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 mr-2 pr-1 text-[11px]">
                        {item.careers.map((career, crId) => (
                          <li key={crId}>{career}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-200 mt-2">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1 text-[11px] bg-slate-50 p-1 rounded">كيف تكتسب وتتعلم بكفاءة:</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 mr-2 pr-1 text-[11px]">
                        {item.howTheyLearn.map((learn, lId) => (
                          <li key={lId}>{learn}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1 text-[11px] bg-slate-50 p-1 rounded">تمارين يومية موصى بها للتنمية:</h4>
                      <ul className="list-disc list-inside space-y-1 text-slate-700 mr-2 pr-1 text-[11px]">
                        {item.exercises.map((ex, exId) => (
                          <li key={exId}>{ex}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
