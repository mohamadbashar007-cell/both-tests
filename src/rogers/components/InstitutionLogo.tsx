import React, { useState } from "react";

export function InstitutionLogo({ className = "" }: { className?: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`relative flex items-stretch gap-1.5 border-2 border-amber-550 bg-white px-2 py-1 rounded-md shadow-sm select-none h-11 shrink-0 ${className}`} dir="rtl">
        <div className="flex flex-col justify-center text-center px-1">
          <span className="font-extrabold text-[12px] text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 leading-none whitespace-nowrap font-sans">
            الإمـام أحـمـد
          </span>
          <span className="text-[9px] text-amber-800 font-bold leading-none mt-0.5 whitespace-nowrap font-sans">
            ابن حـنـبـل
          </span>
        </div>
        <div className="border-r border-amber-400/80 pr-1 pl-0 py-0.5 flex items-center justify-center">
          <span className="text-[8px] font-black text-amber-800 block text-center leading-none tracking-tight font-sans" style={{ writingMode: "vertical-rl" }}>
            مـؤسـسـة
          </span>
        </div>
      </div>
    );
  }

  return (
    <img 
      src={`${import.meta.env.BASE_URL}rogers-logo.png`} 
      alt="مؤسسة الإمام أحمد بن حنبل" 
      referrerPolicy="no-referrer"
      className={`h-11 w-auto object-contain shrink-0 rounded-md ${className}`}
      onError={() => setHasError(true)}
    />
  );
}

export function InstitutionLogoLarge({ className = "" }: { className?: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`relative px-6 py-4 bg-slate-50 border border-amber-200 rounded-2xl flex items-center justify-center shadow-inner select-none overflow-hidden max-w-sm sm:max-w-md w-full ${className}`} dir="rtl">
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none rounded-2xl" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 0l5.85 11.7L47.55 12l.3 11.7L59.55 30l-11.7 5.85-.3 11.7-11.7.3L30 59.55l-5.85-11.7L12.45 47.5l-.3-11.7L.45 30l11.7-5.85.3-11.7 11.7-.3L30 0z' fill='%23b45309'/%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px"
          }} 
        />
        <div className="relative z-10 flex items-stretch gap-3 border-2 border-amber-500/80 p-2 sm:p-2.5 rounded-lg bg-white shadow-sm">
          <div className="text-center px-3 sm:px-5 py-1.5 flex flex-col justify-center">
            <span className="font-extrabold text-lg sm:text-xl text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 tracking-wide block">
              الإمـام أحـمـد ابن حـنـبـل
            </span>
            <span className="text-[9px] text-amber-700 font-bold block mt-1 tracking-wider leading-none font-sans">مـؤسـسـة تـعـلـيـمـيـة وأكـاديـمـيـة</span>
          </div>
          <div className="border-r border-amber-400/85 pr-2 pl-0.5 flex items-center justify-center">
            <span className="text-[11px] font-black text-amber-800 tracking-wide block p-0.5 text-center font-sans" style={{ writingMode: "vertical-rl" }}>
              مـؤسـسـة
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative p-2 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm max-w-sm sm:max-w-md w-full flex justify-center items-center ${className}`}>
      <img 
        src={`${import.meta.env.BASE_URL}rogers-logo.png`} 
        alt="مؤسسة الإمام أحمد بن حنبل" 
        referrerPolicy="no-referrer"
        className="max-h-48 w-full object-contain rounded-2xl"
        onError={() => setHasError(true)}
      />
    </div>
  );
}
