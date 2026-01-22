import React, { useState } from "react";
import { BottomNavigationBar } from "./BottomNavigationBar";
import { HeaderMobile } from "./HeaderMobile";
import { Drawer } from "./Drawer";
import { useAuth } from "@/hooks/useAuth";

interface PWALayoutProps {
  children: React.ReactNode;
  notificationCount?: number;
  messageCount?: number;
}

/**
 * PWALayout - Main layout component for PWA
 * Includes:
 * - Optimized Mobile Header (Logo + Search + Notifications)
 * - Bottom Navigation Bar with Glassmorphism
 * - Drawer Menu for secondary features
 * - Responsive layout for desktop fallback
 */
export const PWALayout: React.FC<PWALayoutProps> = ({
  children,
  notificationCount = 0,
  messageCount = 0,
}) => {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <HeaderMobile
        notificationCount={notificationCount}
        onDrawerOpen={() => setIsDrawerOpen(true)}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Bottom Navigation Bar - Mobile Only */}
      {user && (
        <>
          <BottomNavigationBar
            notificationCount={notificationCount}
            messageCount={messageCount}
            onDrawerOpen={() => setIsDrawerOpen(true)}
          />

          {/* Drawer Menu */}
          <Drawer
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          />
        </>
      )}
    </div>
  );
};
