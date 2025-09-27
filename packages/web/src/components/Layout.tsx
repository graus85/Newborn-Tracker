import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { Header } from "@components/Header";
import { BottomNavigation } from "@/components/BottomNavigation";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { EventModal } from "@/components/modals/EventModal";
import { useAuthStore } from "@/stores/authStore'";
import { useModalStore } from "@/stores/modalStore";

export function Layout() {
  const { isAuthenticated } = useAuthStore();
  const { isEventModalOpen } = useModalStore();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="layout">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNavigation />
      <FloatingActionButton />
      {isEventModalOpen && <EventModal />}
    </div>
  );
}
