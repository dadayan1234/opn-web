"use client";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { ClientAuthCheck } from "@/components/auth/client-auth-check";
import { HydrationProvider } from "@/components/providers/hydration-provider";

export default function Layout({ children }) {
  return (
    <HydrationProvider>
      <ClientAuthCheck>
        <DashboardLayout>{children}</DashboardLayout>
      </ClientAuthCheck>
    </HydrationProvider>
  );
}
