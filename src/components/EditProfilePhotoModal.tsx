"use client";

import React, { useState, useRef } from "react";
import { X, Camera, Upload, Loader2, Check, User } from "lucide-react";
import UserAvatar from "./UserAvatar";

interface EditProfilePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImage?: string | null;
  userName?: string | null;
  onPhotoUpdated: (newPhotoUrl: string) => void;
}

export default function EditProfilePhotoModal({
  isOpen,
  onClose,
  currentImage,
  userName,
  onPhotoUpdated,
}: EditProfilePhotoModalProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação básica de tipo
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione um arquivo de imagem válido (JPG, PNG ou WEBP).");
      return;
    }

    // Leitura e compressão via Canvas no navegador
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setError("Não foi possível processar a imagem.");
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Formato JPEG a 85% de qualidade para alta fidelidade e tamanho mínimo
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
        setPreview(compressedBase64);
      };
      img.onerror = () => {
        setError("Erro ao carregar a imagem selecionada.");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!preview) {
      setError("Selecione uma foto antes de salvar.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/profile-photo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: preview }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Falha ao atualizar foto de perfil.");
      }

      setSuccess(true);
      onPhotoUpdated(preview);

      setTimeout(() => {
        setSuccess(false);
        setPreview(null);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Erro de conexão ao salvar a foto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl relative border border-[#E2E8F0] text-center">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-display font-bold text-lg text-[#0F172A] mb-1">
          Foto de Perfil
        </h3>
        <p className="text-xs text-[#94A3B8] mb-6">
          Sua foto ficará visível no ranking, treinos e no seu perfil.
        </p>

        {/* Visualizador de Foto */}
        <div className="relative inline-block mx-auto mb-6">
          <div className="w-28 h-28 rounded-full overflow-hidden ring-4 ring-[#2563EB]/20 shadow-lg mx-auto flex items-center justify-center bg-slate-50">
            {preview ? (
              <img
                src={preview}
                alt="Nova Foto"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <UserAvatar
                name={userName}
                image={currentImage}
                size="xl"
                className="!w-28 !h-28 !text-3xl"
              />
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="absolute bottom-0 right-0 p-2.5 rounded-full bg-[#2563EB] hover:bg-[#1E40AF] text-white shadow-md border-2 border-white transition-all cursor-pointer hover:scale-105 active:scale-95"
            title="Escolher nova foto"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" /> Foto atualizada com sucesso!
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB]/40 bg-slate-50 hover:bg-white text-xs font-bold text-[#334155] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-[#2563EB]" />
            {preview ? "Escolher outra imagem" : "Carregar Foto da Galeria / Câmera"}
          </button>

          {preview && (
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || success}
              className="w-full py-3 px-4 rounded-xl bg-[#2563EB] hover:bg-[#1E40AF] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Salvando foto...
                </>
              ) : (
                "Confirmar e Salvar Foto"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
