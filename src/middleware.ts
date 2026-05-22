import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Verificar se o usuário está tentando acessar rotas de Personal Trainer
    if (
      path.startsWith("/trainer") &&
      token?.role !== "TRAINER" &&
      token?.role !== "ADMIN"
    ) {
      // Se não for treinador, redireciona para a home de aluno
      return NextResponse.redirect(new URL("/student/dashboard", req.url));
    }

    // Verificar se o usuário está tentando acessar rotas de Aluno
    if (
      path.startsWith("/student") &&
      token?.role !== "STUDENT" &&
      token?.role !== "ADMIN"
    ) {
      // Se não for aluno, redireciona para a home de personal trainer
      return NextResponse.redirect(new URL("/trainer/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/trainer/:path*", "/student/:path*"],
};
