import { NextRequest, NextResponse } from "next/server";

// Extensões de arquivos de mídia estritamente permitidas
const ALLOWED_EXTENSIONS = [".gif", ".jpg", ".jpeg", ".png", ".webp", ".mp4"];

// MIME types seguros permitidos para resposta
const ALLOWED_MIME_TYPES = new Set([
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    if (!path || path.length === 0) {
      return NextResponse.json({ error: "Caminho não fornecido" }, { status: 400 });
    }

    // Validação estrita contra Path Traversal e injeção de caracteres
    for (const segment of path) {
      if (
        segment.includes("..") ||
        segment.includes("\\") ||
        segment.includes("%") ||
        !/^[a-zA-Z0-9_\-\.]+$/.test(segment)
      ) {
        return NextResponse.json(
          { error: "Caminho de mídia inválido ou suspeito." },
          { status: 400 }
        );
      }
    }

    const filePath = path.join("/");
    const lowerPath = filePath.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) => lowerPath.endsWith(ext));

    if (!hasValidExtension) {
      return NextResponse.json(
        { error: "Extensão de mídia não suportada. Apenas imagens e vídeos seguros são permitidos." },
        { status: 400 }
      );
    }

    const targetUrl = `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${filePath}`;

    const response = await fetch(targetUrl, {
      next: { revalidate: 86400 }, // Cache de 24 horas no Next.js
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Mídia não encontrada" }, { status: 404 });
    }

    const rawContentType = (response.headers.get("content-type") || "image/gif").split(";")[0].trim().toLowerCase();

    // Bloquear estritamente SVGs (potencial vetor XSS) e HTML
    if (!ALLOWED_MIME_TYPES.has(rawContentType)) {
      return NextResponse.json(
        { error: "Tipo de mídia não permitido para entrega." },
        { status: 415 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": rawContentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch (error: unknown) {
    console.error("Erro no proxy de mídia:", error);
    return NextResponse.json({ error: "Erro ao carregar mídia" }, { status: 500 });
  }
}
