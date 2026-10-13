"use client";

import { useState } from "react";
import { StickyNote, X } from "lucide-react";

interface PersonalExerciseNoteProps {
  exerciseId: string;
  exerciseName: string;
  note: string | null;
  onSaved: (note: string | null) => void;
}

export default function PersonalExerciseNote({
  exerciseId,
  exerciseName,
  note,
  onSaved,
}: PersonalExerciseNoteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");

  const openEditor = () => {
    setDraft(note || "");
    setStatus("idle");
    setIsOpen(true);
  };

  const saveNote = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      const response = await fetch(`/api/student/exercise-notes/${exerciseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: draft }),
      });
      const data: { note?: string | null; error?: string } = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível salvar a observação.");

      onSaved(data.note ?? null);
      setStatus("saved");
    } catch (error) {
      console.error("Erro ao salvar observação do exercício:", error instanceof Error ? error.message : "falha desconhecida");
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={openEditor}
        className={`relative min-h-[44px] min-w-[44px] -my-3 flex items-center justify-center rounded-md transition-colors cursor-pointer ${note ? "text-[#2563EB] dark:text-[#38BDF8]" : "text-slate-400 hover:text-[#2563EB] dark:hover:text-[#38BDF8]"}`}
        title={note ? "Editar observação pessoal" : "Adicionar observação pessoal"}
        aria-label={note ? "Editar observação pessoal" : "Adicionar observação pessoal"}
      >
        <StickyNote className="w-4 h-4" />
        {note && <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-[#38BDF8]" aria-label="Possui observação salva" />}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" role="presentation">
          <div className="bg-white dark:bg-[#151D2F] rounded-2xl p-6 w-full max-w-md border border-[#E2E8F0] dark:border-slate-800 shadow-2xl space-y-4" role="dialog" aria-modal="true" aria-labelledby="personal-note-title">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 id="personal-note-title" className="text-base font-bold text-[#0F172A] dark:text-white">Minha observação</h3>
                <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">{exerciseName}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-slate-800 text-[#94A3B8] dark:text-slate-400"
                aria-label="Fechar observação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                setStatus("idle");
              }}
              maxLength={1000}
              rows={5}
              placeholder="Ex.: ajustar a posição do banco na próxima sessão."
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-[#0B0F19] text-base md:text-sm text-[#0F172A] dark:text-white focus:border-[#2563EB] dark:focus:border-[#00C2FF] outline-none transition-all resize-y"
            />
            <div className="flex items-center justify-between gap-3">
              <span className={`text-xs ${status === "error" ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`} aria-live="polite">
                {status === "saved" ? "Observação salva" : status === "error" ? "Não foi possível salvar. Tente novamente." : `${draft.length}/1000`}
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsOpen(false)} className="min-h-[44px] px-4 rounded-xl border border-[#E2E8F0] dark:border-slate-700 text-[#0F172A] dark:text-slate-300 text-sm font-semibold hover:bg-zinc-50 dark:hover:bg-slate-800 transition-colors">Fechar</button>
                <button type="button" onClick={() => void saveNote()} disabled={saving} className="min-h-[44px] px-4 rounded-xl bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1E40AF] disabled:opacity-50 transition-colors">{saving ? "Salvando..." : "Salvar"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
