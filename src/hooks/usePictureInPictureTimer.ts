"use client";

import { useEffect, useRef, useCallback, useState } from "react";

interface UsePictureInPictureTimerProps {
  restTime: number;
  initialRestTime: number;
  isResting: boolean;
}

export function usePictureInPictureTimer({
  restTime,
  initialRestTime,
  isResting,
}: UsePictureInPictureTimerProps) {
  const [isPipActive, setIsPipActive] = useState(false);
  const [isPipSupported, setIsPipSupported] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isPipActiveRef = useRef(false);

  // Verificar se o navegador suporta Picture-in-Picture
  useEffect(() => {
    if (typeof document !== "undefined") {
      const supported = Boolean(
        "pictureInPictureEnabled" in document &&
        document.pictureInPictureEnabled
      );
      setIsPipSupported(supported);
    }
  }, []);

  // Desenhar o cronômetro no canvas com visual premium de alta resolução
  const drawTimerOnCanvas = useCallback((seconds: number, initialSeconds: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 512;
    canvas.width = size;
    canvas.height = size;

    // Fundo escuro premium
    ctx.fillStyle = "#090D16";
    ctx.fillRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = 190;
    const lineWidth = 24;

    // Trilha inativa de fundo
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Arco de progresso ativo
    const progress = initialSeconds > 0 ? Math.max(0, Math.min(1, seconds / initialSeconds)) : 0;
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (2 * Math.PI * progress);

    if (progress > 0) {
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      if (seconds <= 5) {
        gradient.addColorStop(0, "#F59E0B");
        gradient.addColorStop(1, "#EF4444");
      } else {
        gradient.addColorStop(0, "#00C2FF");
        gradient.addColorStop(1, "#2563EB");
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // Marca d'água / Título
    ctx.fillStyle = "#00C2FF";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("TECHFITNESS", centerX, centerY - 85);

    // Tempo Digital
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeText = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    ctx.fillStyle = seconds <= 5 ? "#F59E0B" : "#FFFFFF";
    ctx.font = "bold 88px monospace";
    ctx.textAlign = "center";
    ctx.fillText(timeText, centerX, centerY + 24);

    // Subtítulo
    ctx.fillStyle = seconds <= 0 ? "#10B981" : "#94A3B8";
    ctx.font = "bold 28px sans-serif";
    ctx.fillText(seconds <= 0 ? "BORA TREINAR!" : "DESCANSO", centerX, centerY + 95);
  }, []);

  // Redesenhar a cada segundo enquanto PiP estiver ativo
  useEffect(() => {
    if (isPipActive) {
      drawTimerOnCanvas(restTime, initialRestTime);
    }
  }, [restTime, initialRestTime, isPipActive, drawTimerOnCanvas]);

  // Ativar ou desativar o Picture-in-Picture nativo
  const togglePictureInPicture = useCallback(async () => {
    if (typeof document === "undefined") return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
        isPipActiveRef.current = false;
        return;
      }

      if (!canvasRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        canvasRef.current = canvas;
      }

      drawTimerOnCanvas(restTime, initialRestTime);

      if (!videoRef.current) {
        const video = document.createElement("video");
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;

        const canvasWithCapture = canvasRef.current as HTMLCanvasElement & {
          captureStream?: (fps?: number) => MediaStream;
        };

        if (typeof canvasWithCapture.captureStream === "function") {
          const stream = canvasWithCapture.captureStream(15);
          streamRef.current = stream;
          video.srcObject = stream;
        }

        video.addEventListener("enterpictureinpicture", () => {
          setIsPipActive(true);
          isPipActiveRef.current = true;
        });

        video.addEventListener("leavepictureinpicture", () => {
          setIsPipActive(false);
          isPipActiveRef.current = false;
        });

        videoRef.current = video;
      }

      const video = videoRef.current;
      await video.play();
      await video.requestPictureInPicture();
    } catch (err) {
      console.warn("Não foi possível iniciar Janela Flutuante (PiP):", err);
    }
  }, [drawTimerOnCanvas, restTime, initialRestTime]);

  // Fechar PiP automaticamente quando o descanso terminar
  useEffect(() => {
    if (!isResting && isPipActive) {
      if (typeof document !== "undefined" && document.pictureInPictureElement) {
        document.exitPictureInPicture().catch(() => {});
      }
      setIsPipActive(false);
      isPipActiveRef.current = false;
    }
  }, [isResting, isPipActive]);

  return {
    isPipActive,
    isPipSupported,
    togglePictureInPicture,
  };
}
