import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const addMemberSchema = z.object({
  studentId: z.string().min(1, "ID do atleta é obrigatório."),
});

const removeMemberSchema = z.object({
  studentId: z.string().min(1, "ID do atleta é obrigatório."),
});

// GET /api/student/groups/[id]/members
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Perfil de aluno não encontrado." }, { status: 404 });
    }

    const { id } = await params;

    const group = await prisma.workoutGroup.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Grupo não encontrado." }, { status: 404 });
    }

    // Verificar se o aluno logado é membro
    const isMember = group.members.some((m) => m.studentId === studentProfile.id);
    if (!isMember) {
      return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
    }

    const members = group.members.map((m) => ({
      id: m.id,
      studentId: m.studentId,
      name: m.student.user.name || "Atleta",
      email: m.student.user.email,
      image: m.student.user.image,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      isCreator: m.studentId === group.creatorId,
      isMe: m.studentId === studentProfile.id,
    }));

    return NextResponse.json({ members });
  } catch (error) {
    console.error("ERRO AO LISTAR MEMBROS DO GRUPO:", error);
    return NextResponse.json({ error: "Erro interno ao listar membros." }, { status: 500 });
  }
}

// POST /api/student/groups/[id]/members -> Adicionar membro diretamente
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Perfil de aluno não encontrado." }, { status: 404 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parseResult = addMemberSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json({ error: issue?.message || "Dados inválidos." }, { status: 400 });
    }

    const { studentId: targetStudentId } = parseResult.data;

    const group = await prisma.workoutGroup.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Grupo não encontrado." }, { status: 404 });
    }

    // Apenas membros do grupo podem convidar/adicionar amigos
    const isMember = group.members.some((m) => m.studentId === studentProfile.id);
    if (!isMember) {
      return NextResponse.json({ error: "Você precisa fazer parte do grupo para adicionar membros." }, { status: 403 });
    }

    // Verificar se o aluno a ser adicionado existe
    const targetStudent = await prisma.studentProfile.findUnique({
      where: { id: targetStudentId },
      include: { user: { select: { name: true } } },
    });

    if (!targetStudent) {
      return NextResponse.json({ error: "Atleta não encontrado." }, { status: 404 });
    }

    // Verificar se já é membro
    const alreadyMember = group.members.some((m) => m.studentId === targetStudentId);
    if (alreadyMember) {
      return NextResponse.json({ error: "Este atleta já faz parte do grupo." }, { status: 400 });
    }

    const newMembership = await prisma.groupMember.create({
      data: {
        groupId: group.id,
        studentId: targetStudentId,
        role: "MEMBER",
      },
    });

    return NextResponse.json({
      success: true,
      message: `${targetStudent.user.name || "Atleta"} foi adicionado ao grupo!`,
      membership: newMembership,
    });
  } catch (error) {
    console.error("ERRO AO ADICIONAR MEMBRO:", error);
    return NextResponse.json({ error: "Erro interno ao adicionar membro." }, { status: 500 });
  }
}

// DELETE /api/student/groups/[id]/members -> Remover membro (moderação pelo criador ou saída)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const studentProfile = await prisma.studentProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json({ error: "Perfil de aluno não encontrado." }, { status: 404 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => null);
    const parseResult = removeMemberSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json({ error: issue?.message || "Dados inválidos." }, { status: 400 });
    }

    const { studentId: targetStudentId } = parseResult.data;

    const group = await prisma.workoutGroup.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!group) {
      return NextResponse.json({ error: "Grupo não encontrado." }, { status: 404 });
    }

    const isCreator = group.creatorId === studentProfile.id;
    const isSelf = targetStudentId === studentProfile.id;

    // Apenas o criador pode remover outros membros; ou o próprio membro pode remover a si mesmo
    if (!isCreator && !isSelf) {
      return NextResponse.json(
        { error: "Apenas o criador do grupo pode remover outros membros." },
        { status: 403 }
      );
    }

    // Não pode remover o criador por esta rota
    if (targetStudentId === group.creatorId) {
      return NextResponse.json(
        { error: "O criador não pode ser removido do grupo. Use a opção de sair para transferir ou excluir o grupo." },
        { status: 400 }
      );
    }

    const targetMembership = group.members.find((m) => m.studentId === targetStudentId);
    if (!targetMembership) {
      return NextResponse.json({ error: "Membro não encontrado no grupo." }, { status: 404 });
    }

    await prisma.groupMember.delete({
      where: { id: targetMembership.id },
    });

    return NextResponse.json({
      success: true,
      message: "Membro removido do grupo com sucesso.",
    });
  } catch (error) {
    console.error("ERRO AO REMOVER MEMBRO:", error);
    return NextResponse.json({ error: "Erro interno ao remover membro." }, { status: 500 });
  }
}
