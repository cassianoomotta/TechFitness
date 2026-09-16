"use client";

import React, { useState } from "react";
import UserAvatar from "@/components/UserAvatar";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";

export interface WeeklyCheckinFeedItem {
  id: string;
  date: string;
  dayOfWeek: string;
  dayOfWeekFull: string;
  formattedDate: string;
  photoUrl: string;
  durationMinutes: number;
  studentId: string;
  studentName: string;
  studentImage?: string | null;
}

export interface StudentGroupedFeed {
  studentId: string;
  studentName: string;
  studentImage?: string | null;
  photos: WeeklyCheckinFeedItem[];
}

interface StudentWorkoutInstagramCardProps {
  studentGroup: StudentGroupedFeed;
  onOpenZoom: (photo: WeeklyCheckinFeedItem, allStudentPhotos: WeeklyCheckinFeedItem[], initialIndex: number) => void;
}

export default function StudentWorkoutInstagramCard({
  studentGroup,
  onOpenZoom,
}: StudentWorkoutInstagramCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { photos, studentName, studentImage } = studentGroup;
  const totalPhotos = photos.length;
  const currentPhoto = photos[currentIndex] || photos[0];

  if (!currentPhoto) return null;

  const isToday =
    new Date(currentPhoto.date).toDateString() === new Date().toDateString();

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < totalPhotos - 1 ? prev + 1 : prev));
  };

  return (
    <div
      onClick={() => onOpenZoom(currentPhoto, photos, currentIndex)}
      className="w-32 sm:w-44 shrink-0 aspect-[3/4] rounded-2xl overflow-hidden relative group cursor-pointer border border-[#E2E8F0] shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all bg-slate-950 select-none"
      title={`Ver check-ins de ${studentName} (${totalPhotos} ${totalPhotos === 1 ? "foto" : "fotos"})`}
    >
      {/* Imagem do Treino (com transição suave) */}
      <img
        key={currentPhoto.id}
        src={currentPhoto.photoUrl}
        alt={`Check-in de ${studentName}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />

      {/* Tag do Dia da Semana (Canto Superior Esquerdo) */}
      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-sm z-10">
        {isToday ? (
          <span className="text-emerald-400 font-black">HOJE</span>
        ) : (
          <span>{currentPhoto.dayOfWeek}</span>
        )}
        <span className="text-white/60">•</span>
        <span>{currentPhoto.formattedDate}</span>
      </div>

      {/* Badge Múltiplas Fotos estilo Instagram (Canto Superior Direito) */}
      {totalPhotos > 1 && (
        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-white text-[9px] font-bold flex items-center gap-1 shadow-sm z-10 border border-white/10">
          <Layers className="w-3 h-3 text-white" />
          <span>
            {currentIndex + 1}/{totalPhotos}
          </span>
        </div>
      )}

      {/* Botões de Navegação Carrossel (Visíveis em hover ou telas touch) */}
      {totalPhotos > 1 && (
        <>
          {currentIndex > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/65 hover:bg-black/90 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20 hover:scale-110 shadow-md"
              title="Foto anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {currentIndex < totalPhotos - 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/65 hover:bg-black/90 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20 hover:scale-110 shadow-md"
              title="Próxima foto"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </>
      )}

      {/* Dots / Bolinhas de Paginação do Carrossel estilo Instagram */}
      {totalPhotos > 1 && (
        <div className="absolute bottom-11 inset-x-0 flex justify-center items-center gap-1 z-10 pointer-events-none">
          {photos.map((_, idx) => (
            <div
              key={idx}
              className={`rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? "w-2 h-2 bg-white shadow-md scale-110"
                  : "w-1.5 h-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Barra Inferior com Avatar do Concorrente e Nome */}
      <div className="absolute inset-x-0 bottom-0 p-2 sm:p-2.5 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex items-center justify-between gap-1.5 z-10">
        <div className="flex items-center gap-1.5 min-w-0">
          <UserAvatar
            name={studentName}
            image={studentImage}
            size="xs"
            className="border border-white/60 shrink-0"
          />
          <div className="truncate">
            <span className="text-[10px] sm:text-[11px] font-bold text-white block truncate leading-tight">
              {studentName.split(" ")[0]}
            </span>
            {totalPhotos > 1 && (
              <span className="text-[8px] text-zinc-300 font-medium block leading-none">
                {totalPhotos} treinos na semana
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
