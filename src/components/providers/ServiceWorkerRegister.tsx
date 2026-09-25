"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/sw-utils";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return null;
}
