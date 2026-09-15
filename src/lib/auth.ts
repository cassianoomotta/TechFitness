import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Validação de segurança de inicialização do NextAuth
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  console.error("ALERTA CRÍTICO DE SEGURANÇA: NEXTAUTH_SECRET não está configurada no ambiente.");
}

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Senha", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Credenciais inválidas");
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase().trim() },
      });

      if (!user || !user.password) {
        throw new Error("Usuário não encontrado ou senha não configurada");
      }

      const isPasswordValid = await bcrypt.compare(
        credentials.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error("Senha incorreta");
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      };
    },
  }),
];

// Adicionar GoogleProvider apenas quando as chaves estiverem configuradas
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
