import React, { useState, useEffect } from "react";
import { 
  Brain, 
  Award, 
  Download, 
  User, 
  School, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  Briefcase, 
  HelpCircle, 
  Activity, 
  Info,
  Layers,
  Heart
} from "lucide-react";
import { intelligences, questions, IntelligenceDetail } from "./data/intelligenceData";
import { IntelligenceChart } from "./components/IntelligenceChart";
import { PrintableReport } from "./components/PrintableReport";
import { InstitutionLogo, InstitutionLogoLarge } from "./components/InstitutionLogo";

type ScreenState = "welcome" | "quiz" | "results";

const STORAGE_KEY_STATE = "multiple_intelligences_quiz_state";

export default function App() {
  const [screen, setScreen] = useState<ScreenState>("welcome");
  const [username, setUsername] = useState<string>("");
  const [gradeOrSchool, setGradeOrSchool] = useState<string>("");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentPage, setCurrentPage] = useState<number>(0); // 0 to 7 (8 pages, each is 7 questions)
  const [selectedResultIntelligenceId, setSelectedResultIntelligenceId] = useState<string>("linguistic");
  
  // Safety confirmation modal state for reset
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  const QUESTIONS_PER_PAGE = 7;
  const TOTAL_PAGES = 8; // 56 questions total / 7 = 8 pages

  // Load state from localStorage on init
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY_STATE);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.username) setUsername(parsed.username);
        if (parsed.gradeOrSchool) setGradeOrSchool(parsed.gradeOrSchool);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.currentPage !== undefined) setCurrentPage(parsed.currentPage);
        if (parsed.screen) setScreen(parsed.screen);
      }
    } catch (e) {
      console.error("Failed to load saved state", e);
    }
  }, []);

  // Save progress dynamically
  const saveStateToStorage = (
    currentScreen: ScreenState = screen, 
    currentAnswers: Record<number, number> = answers,
    currPage: number = currentPage
  ) => {
    try {
      const stateToSave = {
        username,
        gradeOrSchool,
        answers: currentAnswers,
        currentPage: currPage,
        screen: currentScreen,
      };
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(stateToSave));
    } catch (e) {
      console.error("Failed to save state to localStorage", e);
    }
  };

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage("لطفاً، قم بإدخال اسمك الكريم للمتابعة.");
      return;
    }
    setErrorMessage(null);
    setScreen("quiz");
    saveStateToStorage("quiz", answers, currentPage);
  };

  const handleChoiceSelect = (questionId: number, value: number) => {
    const updatedAnswers = { ...answers, [questionId]: value };
    setAnswers(updatedAnswers);
    saveStateToStorage(screen, updatedAnswers, currentPage);
  };

  const currentPageQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  const isCurrentPageFullyAnswered = () => {
    return currentPageQuestions.every((q) => answers[q.id] !== undefined);
  };

  const handleNextPage = () => {
    if (!isCurrentPageFullyAnswered()) {
      setErrorMessage("لطفاً، أجب على جميع أسئلة الصفحة الحالية للانتقال.");
      return;
    }
    setErrorMessage(null);

    if (currentPage < TOTAL_PAGES - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      saveStateToStorage(screen, answers, nextPage);
      // Scroll smoothly to top of card container
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Calculate scores and transition to results
      setScreen("results");
      // Find highest score and set as default viewed intelligence
      const computed = computeScores();
      const topIntel = [...intelligences].sort((a, b) => (computed[b.id] || 0) - (computed[a.id] || 0))[0];
      if (topIntel) {
        setSelectedResultIntelligenceId(topIntel.id);
      }
      saveStateToStorage("results", answers, currentPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      saveStateToStorage(screen, answers, prevPage);
      setErrorMessage(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleResetQuiz = () => {
    localStorage.removeItem(STORAGE_KEY_STATE);
    setAnswers({});
    setCurrentPage(0);
    setScreen("welcome");
    setShowResetConfirm(false);
    setErrorMessage(null);
    setSelectedResultIntelligenceId("linguistic");
  };

  const computeScores = (): Record<string, number> => {
    const scores: Record<string, number> = {};
    
    // Initialize
    intelligences.forEach((intel) => {
      scores[intel.id] = 0;
    });

    // Sum answers
    questions.forEach((q) => {
      const answerVal = answers[q.id] || 0;
      scores[q.intelligenceId] = (scores[q.intelligenceId] || 0) + answerVal;
    });

    return scores;
  };

  const scores = computeScores();

  // Find dominant intelligences
  const sortedUserIntelligences = [...intelligences]
    .map((intel) => ({
      ...intel,
      score: scores[intel.id] || 0,
    }))
    .sort((a, b) => b.score - a.score);

  const topIntelligence = sortedUserIntelligences[0];
  const secondIntelligence = sortedUserIntelligences[1];

  const handlePrintReport = async () => {
    const html2pdf = (window as any).html2pdf;
    if (html2pdf) {
      setIsGeneratingPdf(true);
      try {
        const element = document.getElementById("report-preview-area");
        if (!element) {
          throw new Error("Report element not found");
        }
        
        const opt = {
          margin:       [0.4, 0.4, 0.4, 0.4], // standard clean margins in inches
          filename:     `مقياس_روجرز_${username || 'طالب'}.pdf`,
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { 
            scale: 2.2, 
            useCORS: true,
            logging: false,
            letterRendering: true
          },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        await html2pdf().set(opt).from(element).save();
      } catch (err) {
        console.error("PDF generation failed, falling back to printer:", err);
        window.print();
      } finally {
        setIsGeneratingPdf(false);
      }
    } else {
      window.print();
    }
  };

  // Get score level info (7-15: Low, 16-26: Med, 27-35: High)
  const getLevelInfo = (score: number) => {
    if (score >= 27) {
      return {
        label: "مرتفع جداً (ذكاء سائد)",
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        barColor: "bg-emerald-600",
        percentage: Math.round((score / 35) * 100),
        desc: "أنت تتميز بقدرات استثنائية وسائدة تماماً في هذا النمط، وتشعر بمتعة بالغة وارتياح دائم عند تشغيله."
      };
    } else if (score >= 16) {
      return {
        label: "متوسط (مستعد وجاهز)",
        color: "bg-blue-50 text-blue-800 border-blue-200",
        barColor: "bg-blue-600",
        percentage: Math.round((score / 35) * 100),
        desc: "أنت تميل لقبول استخدام هذا النمط وتشعر براحة كافية لديه، وهو جاهز تماماً لكي يتكامل لمستويات أعلى مع قليل من الاهتمام."
      };
    } else {
      return {
        label: "منخفض (منطقة تطوير إضافية)",
        color: "bg-slate-50 text-slate-700 border-slate-200",
        barColor: "bg-slate-400",
        percentage: Math.round((score / 35) * 100),
        desc: "هذا النمط يقع خارج نقاط تفضيلك الفورية؛ ويحتاج لبذل وعي ومجهود منظم للارتقاء بمهاراته بمرور الأيام."
      };
    }
  };

  const selectedIntelDetail = intelligences.find((i) => i.id === selectedResultIntelligenceId) || intelligences[0];
  const selectedIntelScore = scores[selectedIntelDetail.id] || 0;
  const selectedIntelLevel = getLevelInfo(selectedIntelScore);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-100 flex flex-col antialiased relative" dir="rtl">
      
      {/* Dynamic interactive background gradient bubbles */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-indigo-100/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* 1. Header (Screen Web layout, hidden in printer) */}
      <header className="no-print bg-white/85 backdrop-blur-md border-b border-slate-250 sticky top-0 z-40 px-4 md:px-8 py-3.5 transition-all">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          
          <div className="flex items-center gap-2">
            <InstitutionLogo />
            <div>
              <h1 className="font-extrabold text-base md:text-lg text-slate-900 tracking-tight leading-tight flex items-center gap-2">
                منصة مقياس روجرز التقييمية
                <span className="text-[10px] bg-amber-150 bg-amber-50 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">مؤسسة الإمام أحمد ابن حنبل</span>
              </h1>
              <p className="text-[11px] text-slate-500 font-medium">إعداد الأستاذة عبير قويدر</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {username && (
              <div className="bg-slate-100 border border-slate-200 rounded-full px-3.5 py-1 text-xs text-slate-700 flex items-center gap-1.5 font-medium shadow-inner">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>{username}</span>
                {gradeOrSchool && <span className="opacity-40">|</span>}
                {gradeOrSchool && <span className="text-slate-500 truncate max-w-[120px]">{gradeOrSchool}</span>}
              </div>
            )}
            
            {(screen === "quiz" || screen === "results") && (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-1 px-3 text-xs font-semibold text-rose-600 hover:text-white border border-rose-200 hover:bg-rose-600 rounded-full transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة الاختبار</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Content Web Stage (Hidden in printing mode) */}
      <main className="no-print flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 flex flex-col justify-center items-center z-10">
        
        {/* Welcome Screen */}
        {screen === "welcome" && (
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-100/50 flex flex-col">
            
            {/* Foundation Logo representation */}
            <div className="flex flex-col items-center text-center mb-6">
              <InstitutionLogoLarge />

              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
                مقياس روجرز
              </h2>
              <p className="text-xs md:text-sm font-bold text-indigo-600 mt-1">
                
              </p>
              <div className="h-1 w-24 bg-indigo-600 rounded-full mt-3.5" />
            </div>

            <p className="text-slate-600 text-xs md:text-sm leading-relaxed text-center mb-8 max-w-2xl mx-auto">
              مرحباً بك في أحدث منصة إلكترونية لتحديد أنماط وخبايا الذكاء الذاتي والقدرات العصبية للمرشحين. يعتمد هذا الاختبار على تدوين <span className="font-extrabold text-indigo-700">56 معياراً سلوكياً دقيقاً</span> ومقسماً بالتساوي عبر ثمانية نطاقات للذكاء البشري. سيقوم التقييم بحساب درجاتك وتزويدك بنوافذ تفصيلية مناسبة لتوجيه مساراتك الدراسية وحياتك المهنيه، مع إتاحة <span className="font-extrabold text-indigo-600">تنزيل تقرير PDF معتمد</span> لنتائجك.
            </p>

            {/* Instruction block */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8">
              <h3 className="text-xs font-black text-slate-800 mb-2.5 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                كيف تجيب على الأسئلة؟
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-3">
                اقرأ كل عبارة بتمعن، ثم حدد الإجابة الأكثر موافقة لأسلوب عيشك وواقعك الفعلي بناءً على المقياس الخماسي التالي:
              </p>
              <div className="grid grid-cols-5 gap-1 text-center font-bold text-[10px] md:text-xs">
                <div className="p-2 rounded-lg bg-rose-50 text-rose-850 border border-rose-100">
                  <p className="font-mono text-sm leading-none mb-1">1</p>
                  <p>نادر جداً</p>
                </div>
                <div className="p-2 rounded-lg bg-orange-50 text-orange-850 border border-orange-100">
                  <p className="font-mono text-sm leading-none mb-1">2</p>
                  <p>أحياناً قليلة</p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-50/70 text-yellow-850 border border-yellow-100">
                  <p className="font-mono text-sm leading-none mb-1">3</p>
                  <p>أحياناً</p>
                </div>
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-850 border border-indigo-100 animate-pulse">
                  <p className="font-mono text-sm leading-none mb-1">4</p>
                  <p>عادةً</p>
                </div>
                <div className="p-2 rounded-lg bg-indigo-600 text-white border border-indigo-700 shadow-sm shadow-indigo-600/10">
                  <p className="font-mono text-sm leading-none mb-1">5</p>
                  <p>دائماً</p>
                </div>
              </div>
            </div>

            {/* Form Name & Credentials entry */}
            <form onSubmit={handleStartQuiz} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    اسم المرشح الكامل: <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: عبد الرحمن علي  "
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 leading-tight focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1">
                    <School className="w-3.5 h-3.5 text-emerald-600" />
                   اسم نادي الطفل:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: نادي كلمة لرعاية الموهوبين"
                    value={gradeOrSchool}
                    onChange={(e) => setGradeOrSchool(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 leading-tight focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all text-sm font-medium"
                  />
                </div>

              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-3 items-center justify-center">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-slate-900 text-white font-extrabold px-8 py-3.5 rounded-2xl hover:bg-emerald-700 transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <span>بدء الاختبار المعتمد ونظام التقييم</span>
                  <ArrowRight className="w-4 h-4 text-white rotate-180" />
                </button>

                {Object.keys(answers).length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setScreen("quiz");
                      setErrorMessage(null);
                    }}
                    className="w-full sm:w-auto text-slate-700 border border-slate-300 font-bold px-6 py-3.5 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <span>استكمال الجلسة السابقة ({Object.keys(answers).length} سؤالاً تمت الإجابة عليها)</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Quiz Form Screen */}
        {screen === "quiz" && (
          <div className="w-full max-w-4xl flex flex-col gap-6">
            
            {/* Header info & progress */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
              
              <div className="text-right w-full md:w-auto">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] bg-slate-100 text-slate-800 border border-slate-200 uppercase tracking-widest font-bold px-2 py-0.5 rounded">
                    الصفحة {currentPage + 1} من {TOTAL_PAGES}
                  </span>
                  <span className="text-xs font-semibold text-indigo-700">
                    تمت الإجابة على {Object.keys(answers).length} من 56 عبارة
                  </span>
                </div>
                <h3 className="font-extrabold text-sm md:text-base text-slate-800">
                  يرجى قراءة بنود الصفحة بكل أمانة ومراجعة الاختيار الأنسب لك
                </h3>
              </div>

              {/* Progress Bar container */}
              <div className="w-full md:w-64 space-y-1.5 flex flex-col">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 font-mono">
                  <span>المعدل الإجمالي:</span>
                  <span>{Math.round((Object.keys(answers).length / 56) * 100)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${(Object.keys(answers).length / 56) * 100}%` }}
                  />
                </div>
              </div>

            </div>

            {/* Questions list container */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-8 shadow-xl shadow-slate-100/50 space-y-6">
              
              {currentPageQuestions.map((q, idx) => {
                const questionNum = q.id;
                const chosenVal = answers[questionNum];

                return (
                  <div 
                    key={q.id} 
                    className={`p-4 md:p-5 rounded-2xl border transition-all duration-300 text-right ${
                      chosenVal !== undefined
                        ? "bg-indigo-50/25 border-indigo-100 shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 flex-shrink-0 text-center font-mono font-bold text-xs bg-slate-100 border border-slate-200 text-slate-600 rounded-lg flex items-center justify-center mt-0.5 shadow-sm">
                        {questionNum}
                      </div>
                      <div className="flex-1 space-y-4">
                        <p className="font-extrabold text-sm md:text-base text-slate-900 leading-relaxed">
                           {q.text}
                        </p>
                        
                        {/* 5-scale choice row */}
                        <div className="grid grid-cols-5 gap-2 md:gap-4 max-w-2xl">
                          {[1, 2, 3, 4, 5].map((val) => {
                            const isSelected = chosenVal === val;

                            const getActiveStyles = () => {
                              switch(val) {
                                case 1: return isSelected ? "bg-red-500 text-white border-red-500 scale-105 shadow-md shadow-red-500/20" : "hover:bg-red-50 border-slate-200 text-slate-700 hover:border-red-300";
                                case 2: return isSelected ? "bg-orange-500 text-white border-orange-500 scale-105 shadow-md shadow-orange-500/20" : "hover:bg-orange-50 border-slate-200 text-slate-700 hover:border-orange-300";
                                case 3: return isSelected ? "bg-yellow-500 text-white border-yellow-500 scale-105 shadow-md shadow-yellow-500/10" : "hover:bg-yellow-50 border-slate-200 text-slate-700 hover:border-yellow-300";
                                case 4: return isSelected ? "bg-indigo-500 text-white border-indigo-500 scale-105 shadow-md shadow-indigo-500/20" : "hover:bg-indigo-50 border-slate-200 text-slate-700 hover:border-indigo-300";
                                case 5: return isSelected ? "bg-indigo-700 text-white border-indigo-700 scale-105 shadow-md shadow-indigo-700/30" : "hover:bg-indigo-50/70 border-slate-200 text-indigo-900 hover:border-indigo-500";
                                default: return "";
                              }
                            };

                            const getChoiceLabel = () => {
                              switch(val) {
                                case 1: return "نادر";
                                case 2: return "أحياناً قليلة";
                                case 3: return "أحياناً";
                                case 4: return "عادةً";
                                case 5: return "دائماً";
                                default: return "";
                              }
                            };

                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => handleChoiceSelect(questionNum, val)}
                                className={`rounded-xl border py-2 px-1 text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer focus:outline-none ${getActiveStyles()}`}
                              >
                                <span className="font-mono font-extrabold text-sm md:text-base leading-none">
                                  {val}
                                </span>
                                <span className="text-[9px] md:text-[11px] font-bold tracking-tight">
                                  {getChoiceLabel()}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Page Controls */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-4">
                
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className={`px-5 py-3 rounded-xl border border-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer transition-all ${
                    currentPage === 0
                      ? "opacity-30 cursor-not-allowed text-slate-400 bg-slate-50 border-slate-100"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>الصفحة السابقة</span>
                </button>

                <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-slate-400">
                  {Array.from({ length: TOTAL_PAGES }).map((_, pIdx) => (
                    <div 
                      key={pIdx} 
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center font-mono text-[9px] ${
                        pIdx === currentPage 
                          ? "bg-indigo-600 text-white" 
                          : pIdx < currentPage 
                          ? "bg-indigo-100 text-indigo-700 cursor-pointer border border-indigo-200" 
                          : "bg-slate-100 text-slate-400"
                      }`}
                      onClick={() => {
                        if (pIdx < currentPage || (pIdx > currentPage && isCurrentPageFullyAnswered())) {
                          setCurrentPage(pIdx);
                          saveStateToStorage(screen, answers, pIdx);
                          setErrorMessage(null);
                        }
                      }}
                    >
                      {pIdx + 1}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNextPage}
                  className="px-6 py-3 rounded-xl bg-indigo-600 border border-indigo-600 font-extrabold text-xs text-white hover:bg-indigo-700 hover:border-indigo-700 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/10 font-sans"
                >
                  <span>{currentPage === TOTAL_PAGES - 1 ? "حساب واستعراض النتائج" : "الصفحة التالية"}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

              </div>

            </div>
          </div>
        )}

        {/* Results Screen */}
        {screen === "results" && (
          <div className="w-full flex flex-col gap-6 font-sans">
            
            {/* Header info bar */}
            <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-3xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-right space-y-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 font-sans">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 animate-bounce" />
                  <span>تهانينا! لقد أتممت مقياس الذكاءات بنجاح</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900">
                  لوحة تشخيص وتفسير الذكاء السلوكي
                </h2>
                <p className="text-xs md:text-sm text-slate-600 max-w-xl">
                  توضح المخططات والقراءات أدناه تفصيلاً دقيقاً لمجموع درجات الأنماط الثمانية للمرشح <span className="font-bold text-slate-900">{username}</span>. اضغط على أي ذكاء في المخطط أو القائمة الجانبية لتصفح تحليله التفصيلي.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handlePrintReport}
                  disabled={isGeneratingPdf}
                  className={`font-extrabold text-xs px-6 py-4 rounded-xl flex items-center gap-2.5 transition-all shadow-md cursor-pointer ${
                    isGeneratingPdf 
                      ? "bg-indigo-400 text-indigo-50 cursor-not-allowed" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري إعداد وتحميل مستند الـ PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>تنزيل تقرير PDF المعتمد المطبوع</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Main grid configuration: Right: chart, Left: details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Column Right (4 cols): Web Dynamic Interactive Chart and List */}
              <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-3xl shadow-xl flex flex-col gap-4">
                <div>
                  <h3 className="font-extrabold text-sm md:text-base border-r-4 border-indigo-600 pr-2 pb-0.5">
                    البروفايل الهندسي للذكاءات
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 font-sans">اضغط على النطاقات لقراءة تحليل كامل عنها</p>
                </div>

                <IntelligenceChart
                  scores={scores}
                  activeId={selectedResultIntelligenceId}
                  onSelect={(id) => setSelectedResultIntelligenceId(id)}
                />

                {/* Domination highlights */}
                <div className="border-t border-slate-100 pt-4 flex flex-col gap-2 text-xs">
                  <div className="flex justify-between items-center bg-indigo-50/60 p-2.5 text-right rounded-xl border border-indigo-100/55">
                    <span className="font-black text-[12px] text-indigo-950">الذكاء الأول السائد:</span>
                    <span className="font-bold text-indigo-805 text-indigo-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> {topIntelligence.name} ({topIntelligence.score} درجة)
                    </span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-50 p-2.5 text-right rounded-xl border border-slate-200">
                    <span className="font-black text-[12px] text-slate-700">الذكاء المساعد الثانوي:</span>
                    <span className="font-bold text-slate-900">
                      {secondIntelligence.name} ({secondIntelligence.score} درجة)
                    </span>
                  </div>
                </div>
              </div>

              {/* Column Left (7 cols): Deep Detailed Inspection Area */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Specific Intelligence Display Card */}
                <div className="bg-white border-2 border-slate-200 rounded-3xl overflow-hidden shadow-xl">
                  
                  {/* Card Banner */}
                  <div className="bg-slate-150 p-6 border-b border-slate-200 text-slate-900">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">الذكاء المحدد للتصفح:</span>
                        <h3 className="font-black text-lg md:text-xl text-neutral-900 mt-0.5">{selectedIntelDetail.name}</h3>
                        <p className="text-xs text-neutral-600 font-mono italic">{selectedIntelDetail.englishName}</p>
                      </div>
                      
                      {/* Score Badge */}
                      <div className="flex flex-col items-center justify-center text-center bg-slate-900 text-white rounded-2xl p-2 px-4 shadow-md">
                        <span className="text-[9px] font-bold text-slate-400">الدرجة المحققة</span>
                        <span className="font-bold text-lg leading-tight">{selectedIntelScore} <span className="text-xs text-slate-400">/ 35</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 space-y-6">
                    
                    {/* Progression bar for selected intelligence */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-extrabold text-neutral-800 items-center">
                        <span className="flex items-center gap-1.5 select-none">
                          <Activity className="w-4 h-4 text-slate-600 animate-pulse" />
                          مستوى التمكن:
                        </span>
                        <span className={`px-2 py-0.5 rounded border ${selectedIntelLevel.color} text-[11px] font-bold`}>
                          {selectedIntelLevel.label}
                        </span>
                      </div>
                      
                      <div className="w-full h-3 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="bg-slate-800 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${selectedIntelLevel.percentage}%` }}
                        />
                      </div>
                      
                      <p className="text-[11px] leading-relaxed text-slate-550 select-none">
                        {selectedIntelLevel.desc}
                      </p>
                    </div>

                    {/* Description Paragraph */}
                    <div className="space-y-1.5 text-right border-r-4 border-slate-700 pr-3.5 py-1">
                      <h4 className="text-xs font-black text-neutral-900">الوصف العام والمفهوم:</h4>
                      <p className="text-neutral-700 text-xs md:text-sm leading-relaxed font-medium">
                        {selectedIntelDetail.description}
                      </p>
                    </div>

                    {/* Characteristics & Careers (Two Columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Characteristics */}
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col gap-2">
                        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                          <CheckCircle2 className="w-4 h-4 text-slate-800" />
                          السمات البارزة المميزة لك:
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {selectedIntelDetail.characteristics.map((char, cId) => (
                            <li key={cId} className="flex gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-800 mt-1.5 flex-shrink-0" />
                              <span className="leading-tight">{char}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Best Careers */}
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col gap-2">
                        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                          <Briefcase className="w-4 h-4 text-slate-800" />
                          المهن والمسارات الأنسب:
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {selectedIntelDetail.careers.map((career, crId) => (
                            <li key={crId} className="flex gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-800 mt-1.5 flex-shrink-0" />
                              <span className="leading-tight">{career}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    {/* How they learn & exercises */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      
                      {/* Learning preferences */}
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col gap-2">
                        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                          <BookOpen className="w-4 h-4 text-slate-800" />
                          استراتيجية التعلم الفعالة:
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {selectedIntelDetail.howTheyLearn.map((learn, lId) => (
                            <li key={lId} className="flex gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-800 mt-1.5 flex-shrink-0" />
                              <span className="leading-tight">{learn}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Training Exercises */}
                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex flex-col gap-2">
                        <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2">
                          <Activity className="w-4 h-4 text-slate-800" />
                          تمارين لتنمية وتطوير الذكاء:
                        </h4>
                        <ul className="space-y-2 text-xs text-slate-700">
                          {selectedIntelDetail.exercises.map((ex, exId) => (
                            <li key={exId} className="flex gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-800 mt-1.5 flex-shrink-0" />
                              <span className="leading-tight">{ex}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                  </div>
                </div>

                {/* Score Advice description and breakdown panel */}
                <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-lg text-right text-xs">
                  <h4 className="font-extrabold text-slate-900 mb-2 flex items-center gap-1.5 text-sm">
                    <Info className="w-4 h-4 text-slate-700" />
                    توجيه عام بمسارات تنمية الذكاء:
                  </h4>
                  <p className="text-slate-600 leading-relaxed font-semibold">
                    وفقاً لخبراء الذكاءات المعتمدين، فإن الأنماط السلوكية التي حصلت بها على مجموع درجات أقل هي ببساطة مجالات مهارية في طور الخمول؛ ويُمكن بصفة يقينية مضاعفة تمكنك منها باستثمار الوعي والتدريب التدريجي عبر أداء الأنشطة والتمارين اليومية المقترحة لكل تخصص.
                  </p>
                </div>

              </div>
            </div>

            {/* Live interactive Document Preview Frame */}
            <div className="bg-slate-100 border border-slate-200 rounded-3xl p-4 md:p-8 flex flex-col gap-5 items-center shadow-inner mt-4 no-print select-none">
              <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="text-right">
                  <h3 className="font-extrabold text-sm md:text-base text-slate-800 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-600 animate-pulse" />
                    <span>📄 معاينة وثيقة التقرير المطبوع الرسمية (مقياس A4)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">توضح هذه المعاينة التفاعلية الترتيب النهائي للتقرير المعتمد كملف PDF مطبوع.</p>
                </div>
                
                <button
                  onClick={handlePrintReport}
                  disabled={isGeneratingPdf}
                  className={`font-extrabold text-xs px-5 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0 ${
                    isGeneratingPdf 
                      ? "bg-emerald-400 text-emerald-50 cursor-not-allowed" 
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {isGeneratingPdf ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري الحفظ كـ PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>تنفيذ الحفظ والطباعة كـ PDF</span>
                    </>
                  )}
                </button>
              </div>

              {/* The Mock Paper sheet effect */}
              <div className="w-full max-w-[800px] bg-white border border-slate-300 shadow-2xl rounded-2xl overflow-hidden min-h-[1000px] border-amber-200/40 p-2 sm:p-4">
                <PrintableReport
                  scores={scores}
                  username={username}
                  gradeOrSchool={gradeOrSchool}
                  isPreview={true}
                />
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 3. PRINT ONLY AREA (Standard A4 document with high-quality styling) */}
      <PrintableReport
        scores={scores}
        username={username}
        gradeOrSchool={gradeOrSchool}
      />

      {/* 4. Footer credits bar (Hidden in printer) */}
      <footer className="no-print bg-slate-900 text-slate-400 py-6 text-center border-t border-slate-850 mt-auto text-xs">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="font-bold text-slate-300">نظام تقييم الذكاءات المتعددة الشامل © {new Date().getFullYear()}</p>
          <p className="text-[10px] text-slate-500">تم تطوير البرنامج بالكامل بالتكامل مع إدارة التعليم ورعاية الموهوبين لدعم قدرات الطلاب والشباب.</p>
        </div>
      </footer>

      {/* 5. Confirmation Reset overlay dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-right shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <h3 className="font-extrabold text-base text-slate-900 mb-2">إعادة إجراء اختبار الذكاءات المتعددة</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              هل أنت متأكد من رغبتك في مسح الجلسة والبدء من جديد؟ سيؤدي ذلك لمسح جميع إجاباتك الحالية والعودة لصفحة الترحيب.
            </p>
            <div className="flex gap-3 justify-end items-center">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-xl transition"
              >
                تراجع وإلغاء
              </button>
              <button
                onClick={handleResetQuiz}
                className="px-5 py-2.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-md shadow-rose-600/15"
              >
                نعم، ابدأ من جديد
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
