"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useState } from "react";
import AuthModal from "./AuthModal";
import { supabase } from "@/lib/supabaseClient";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const { user, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const pathname = usePathname();

  const handleOpenAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <>
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-focus-ring rounded-lg">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-xs shadow-sm">
                QL
              </div>
              <span className="font-semibold tracking-tight text-text-primary">QueryLab</span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link 
              href="/roadmap"
              className={`text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring rounded-md px-1 ${pathname === '/roadmap' ? 'text-primary' : 'text-text-secondary hover:text-primary-hover'}`}
            >
              Curriculum
            </Link>
            <ThemeToggle />
            {!loading && (
              user ? (
                <div className="flex items-center gap-4 pl-6 border-l border-border">
                  <span className="text-sm font-medium text-text-primary">{user.email}</span>
                  <button onClick={handleLogout} className="text-sm font-medium text-text-secondary hover:text-error transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring rounded-md px-1">
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 pl-6 border-l border-border">
                  <button onClick={() => handleOpenAuth("login")} className="text-sm font-medium text-text-secondary hover:text-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring rounded-md px-1">
                    Log In
                  </button>
                  <button onClick={() => handleOpenAuth("signup")} className="text-sm font-medium bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-hover transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-focus-ring">
                    Sign Up
                  </button>
                </div>
              )
            )}
          </nav>
        </div>
      </header>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} initialMode={authMode} />
    </>
  );
}
