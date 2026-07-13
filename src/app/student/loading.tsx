import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-[#2563EB] blur-xl opacity-20 rounded-full animate-pulse" />
        <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin relative z-10" />
      </div>
      <p className="text-[#94A3B8] font-medium text-sm animate-pulse">
        Carregando dados...
      </p>
    </div>
  );
}
