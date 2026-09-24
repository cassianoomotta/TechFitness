import React from "react";
import DumbbellLoading from "@/components/DumbbellLoading";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh]">
      <DumbbellLoading text="Carregando painel do treinador..." subtext="Sincronizando alunos e prescrições" />
    </div>
  );
}
