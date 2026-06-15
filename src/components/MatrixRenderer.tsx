import React from "react";
import { QuestionData } from "../data/questions";
import { publicAsset } from "../utils/publicAsset";

interface RendererProps {
  question: QuestionData;
  type: "main" | "option";
  optionIndex?: number;
}

const getImageFileName = (question: QuestionData, type: "main" | "option", optionIndex?: number) => {
  const prefix = question.num.toString().padStart(2, "0");
  const baseName = `${prefix} ${question.set}${question.num}`;
  return type === "main" ? `${baseName}.png` : `${baseName}_${optionIndex ?? 1}.png`;
};

const getImageSrc = (question: QuestionData, type: "main" | "option", optionIndex?: number) => {
  return publicAsset(getImageFileName(question, type, optionIndex));
};

export const MatrixRenderer: React.FC<RendererProps> = ({ question, type, optionIndex }) => {
  const isMain = type === "main";
  const fileName = getImageFileName(question, type, optionIndex);
  const src = getImageSrc(question, type, optionIndex);

  return (
    <div
      className={
        isMain
          ? "w-full h-full min-h-0 flex items-center justify-center"
          : "w-full h-full min-h-0 flex items-center justify-center"
      }
    >
      <img
        src={src}
        alt={isMain ? `Matrix ${question.id}` : `Matrix ${question.id} option ${optionIndex}`}
        title={fileName}
        loading="lazy"
        draggable={false}
        className={
          isMain
            ? "max-w-full max-h-full object-contain bg-white border border-slate-200 rounded-lg shadow-inner"
            : "max-w-full max-h-full object-contain pointer-events-none select-none"
        }
      />
    </div>
  );
};
