import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createGroupSchema = z.object({
  name: z.string().trim().min(3, "O nome do grupo deve ter pelo menos 3 caracteres.").max(40, "O nome do grupo pode ter no máximo 40 caracteres."),
  description: z.string().trim().max(250, "A descrição pode ter no máximo 250 caracteres.").optional().default(""),
  icon: z.string().trim().max(10, "Ícone inválido.").optional().default("🏋️"),
});

function generateGroupCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "TF-";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function GET() {
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

    // Buscar todos os grupos dos quais o aluno é membro
    const memberships = await prisma.groupMember.findMany({
      where: { studentId: studentProfile.id },
      include: {
        group: {
          include: {
            creator: {
              include: {
                user: {
                  select: {
                    name: true,
                    image: true,
                  },
                },
              },
            },
            members: {
              include: {
                student: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        image: true,
                      },
                    },
                    sessions: {
                      select: {
                        id: true,
                      },
                    },
                  },
                },
              },
              orderBy: {
                joinedAt: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });

    const groups = memberships.map((m) => {
      const g = m.group;
      const isCreator = g.creatorId === studentProfile.id;

      // Ordenar membros por total de treinos para prévia
      const topMembers = g.members
        .slice()
        .sort((a, b) => b.student.sessions.length - a.student.sessions.length)
        .slice(0, 4)
        .map((member) => ({
          studentId: member.studentId,
          name: member.student.user.name || "Atleta",
          image: member.student.user.image,
          sessionsCount: member.student.sessions.length,
          isCreator: member.role === "CREATOR",
        }));

      return {
        id: g.id,
        name: g.name,
        description: g.description,
        icon: g.icon || "🏋️",
        code: g.code,
        creatorName: g.creator.user.name || "Atleta",
        creatorImage: g.creator.user.image,
        isCreator,
        myRole: m.role,
        joinedAt: m.joinedAt.toISOString(),
        membersCount: g.members.length,
        totalMembers: g.members.length,
        membersPreview: topMembers,
        topMembers,
      };
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("ERRO AO LISTAR GRUPOS:", error);
    return NextResponse.json({ error: "Erro interno ao listar grupos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json().catch(() => null);
    const parseResult = createGroupSchema.safeParse(body);

    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return NextResponse.json({ error: issue?.message || "Dados inválidos." }, { status: 400 });
    }

    const { name, description, icon } = parseResult.data;

    // Gerar código único garantido
    let code = generateGroupCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      const existing = await prisma.workoutGroup.findUnique({ where: { code } });
      if (!existing) {
        isUnique = true;
      } else {
        code = generateGroupCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return NextResponse.json({ error: "Falha ao gerar código único. Tente novamente." }, { status: 500 });
    }

    // Criar grupo e associar criador como membro com papel CREATOR
    const newGroup = await prisma.$transaction(async (tx) => {
      const group = await tx.workoutGroup.create({
        data: {
          name,
          description: description || null,
          icon: icon || "🏋️",
          code,
          creatorId: studentProfile.id,
        },
      });

      await tx.groupMember.create({
        data: {
          groupId: group.id,
          studentId: studentProfile.id,
          role: "CREATOR",
        },
      });

      return group;
    });

    return NextResponse.json({
      success: true,
      group: {
        id: newGroup.id,
        name: newGroup.name,
        description: newGroup.description,
        icon: newGroup.icon,
        code: newGroup.code,
      },
    });
  } catch (error) {
    console.error("ERRO AO CRIAR GRUPO:", error);
    return NextResponse.json({ error: "Erro ao criar grupo." }, { status: 500 });
  }
}
