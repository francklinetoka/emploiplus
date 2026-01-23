import React, { useState } from "react";
import { BottomNavigationBar } from "./BottomNavigationBar";
import { BottomNavigationGuest } from "./BottomNavigationGuest";
import { HeaderMobile } from "./HeaderMobile";
import { HeaderMobileGuest } from "./HeaderMobileGuest";
import { Drawer } from "./Drawer";
import { useAuth } from "@/hooks/useAuth";

interface PWALayoutProps {
  children: React.ReactNode;
  notificationCount?: number;
  messageCount?: number;
}

/**
 * PWALayout - Main layout component for PWA
 * Responsive layout:
 * - Mobile: Shows HeaderMobile/HeaderMobileGuest + BottomNavigationBar/BottomNavigationGuest
 * - Desktop: Only shows children
 */
export const PWALayout: React.FC<PWALayoutProps> = ({
  children,
  notificationCount = 0,
  messageCount = 0,
}) => {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isAuthenticated = !!user;

  return (
    <>
      {/* Mobile PWA Components - Hidden on desktop */}
      <div className="md:hidden">
        {/* Header - Different for authenticated vs guest users */}
        {isAuthenticated ? (
          <HeaderMobile
            notificationCount={notificationCount}
            onDrawerOpen={() => setIsDrawerOpen(true)}
          />
        ) : (
          <HeaderMobileGuest />
        )}
      </div>

      {/* Main Content - Add padding bottom for mobile to avoid overlap with bottom nav */}
      <main className="md:container md:mx-auto md:px-4 md:py-6 pb-24 md:pb-0">
        {children}
      </main>

      {/* Bottom Navigation - Mobile only */}
      <div className="md:hidden">
        {isAuthenticated ? (
          <BottomNavigationBar
            notificationCount={notificationCount}
            messageCount={messageCount}
          />
        ) : (
          <BottomNavigationGuest />
        )}
      </div>

      {/* Drawer - Mobile only, only for authenticated users */}
      {isAuthenticated && (
        <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      )}
    </>
  );
};
