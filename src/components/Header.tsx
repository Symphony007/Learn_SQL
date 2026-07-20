"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useState } from "react";
import AuthModal from "./AuthModal";
import { supabase } from "@/lib/supabaseClient";

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
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                SQL
              </div>
              <span className="font-semibold tracking-tight text-slate-900">Practice Platform</span>
            </Link>
          </div>
          <nav className="flex items-center gap-6">
            <Link 
              href="/roadmap"
              className={`text-sm font-medium transition-colors ${pathname === '/roadmap' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
            >
              Curriculum
            </Link>
            {!loading && (
              user ? (
                <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                  <span className="text-sm font-medium text-slate-700">{user.email}</span>
                  <button onClick={handleLogout} className="text-sm font-medium text-slate-600 hover:text-red-600 transition-colors">
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
                  <button onClick={() => handleOpenAuth("login")} className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
                    Log In
                  </button>
                  <button onClick={() => handleOpenAuth("signup")} className="text-sm font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
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
