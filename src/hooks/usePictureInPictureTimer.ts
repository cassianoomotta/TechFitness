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

  // Verificar se o navegador suporta Picture-in-Picture (Android Chrome ou iOS WebKit)
  useEffect(() => {
    if (typeof document !== "undefined") {
      const supported = Boolean(
        ("pictureInPictureEnabled" in document && document.pictureInPictureEnabled) ||
        (typeof HTMLVideoElement !== "undefined" && "webkitSupportsPresentationMode" in HTMLVideoElement.prototype)
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
    if (canvas.width !== size || canvas.height !== size) {
      canvas.width = size;
      canvas.height = size;
    }

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

  // Ativar ou desativar o Picture-in-Picture nativo (Mobile Android & Desktop)
  const togglePictureInPicture = useCallback(async () => {
    if (typeof document === "undefined") return;

    try {
      // Se já estiver em PiP no padrão W3C, encerra
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
        isPipActiveRef.current = false;
        return;
      }

      // Preparar canvas se necessário
      if (!canvasRef.current) {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        canvasRef.current = canvas;
      }

      drawTimerOnCanvas(restTime, initialRestTime);

      // No Android Chrome, o vídeo DEVE estar anexado ao DOM e ter dimensões não-nulas
      if (!videoRef.current) {
        const video = document.createElement("video");
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;

        // Inserir no DOM com tamanho mínimo e invisível (exigência estrita do Android Chrome)
        video.style.position = "fixed";
        video.style.bottom = "-200px";
        video.style.right = "-200px";
        video.style.width = "40px";
        video.style.height = "40px";
        video.style.opacity = "0.01";
        video.style.pointerEvents = "none";
        video.style.zIndex = "-9999";
        document.body.appendChild(video);

        const canvasWithCapture = canvasRef.current as HTMLCanvasElement & {
          captureStream?: (fps?: number) => MediaStream;
        };

        if (typeof canvasWithCapture.captureStream === "function") {
          const stream = canvasWithCapture.captureStream(24);
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
      await video.play().catch(() => {});

      // Aguardar o primeiro frame ser renderizado no stream de vídeo (essencial no mobile)
      if (video.readyState < 2) {
        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            video.removeEventListener("loadeddata", onLoaded);
            resolve();
          };
          video.addEventListener("loadeddata", onLoaded);
          setTimeout(resolve, 250);
        });
      }

      // 1. Tentar API padrão W3C (Chrome Android, Edge, Desktop)
      if ("requestPictureInPicture" in video && typeof video.requestPictureInPicture === "function") {
        await video.requestPictureInPicture();
        setIsPipActive(true);
        isPipActiveRef.current = true;
        return;
      }

      // 2. Tentar API WebKit legada (iOS Safari)
      const webkitVideo = video as unknown as {
        webkitSupportsPresentationMode?: (mode: string) => boolean;
        webkitSetPresentationMode?: (mode: string) => void;
      };

      if (
        typeof webkitVideo.webkitSupportsPresentationMode === "function" &&
        webkitVideo.webkitSupportsPresentationMode("picture-in-picture") &&
        typeof webkitVideo.webkitSetPresentationMode === "function"
      ) {
        webkitVideo.webkitSetPresentationMode("picture-in-picture");
        setIsPipActive(true);
        isPipActiveRef.current = true;
      }
    } catch (err) {
      console.warn("Aviso ao inicializar Janela Flutuante (PiP) no dispositivo móvel:", err);
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

  // Limpeza ao desmontar
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.parentNode) {
        try {
          videoRef.current.parentNode.removeChild(videoRef.current);
        } catch {}
      }
    };
  }, []);

  return {
    isPipActive,
    isPipSupported,
    togglePictureInPicture,
  };
}
