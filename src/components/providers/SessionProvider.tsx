"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import ServiceWorkerRegister from "./ServiceWorkerRegister";

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthSessionProvider>
      <ServiceWorkerRegister />
      {children}
    </NextAuthSessionProvider>
  );
}
