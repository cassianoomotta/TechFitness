import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    if (!path || path.length === 0) {
      return NextResponse.json({ error: "Caminho não fornecido" }, { status: 400 });
    }

    const filePath = path.join("/");
    const targetUrl = `https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/${filePath}`;

    const response = await fetch(targetUrl, {
      next: { revalidate: 86400 }, // Cache de 24 horas no Next.js
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Mídia não encontrada" }, { status: 404 });
    }

    const contentType = response.headers.get("content-type") || "image/gif";
    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: unknown) {
    console.error("Erro no proxy de mídia:", error);
    return NextResponse.json({ error: "Erro ao carregar mídia" }, { status: 500 });
  }
}
