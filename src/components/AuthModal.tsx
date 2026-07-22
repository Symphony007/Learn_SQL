"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: "login" | "signup";
}

export default function AuthModal({ isOpen, onClose, initialMode }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMsg(null);
      setEmail("");
      setPassword("");
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        
        // Supabase returns an empty identities array if the user already exists
        // (this is a security feature to prevent email enumeration).
        if (data?.user?.identities != null && data.user.identities.length === 0) {
          setError("An account with this email already exists. Please log in instead.");
          setSuccessMsg(null);
          return;
        }

        setSuccessMsg("Check your email for the confirmation link.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose(); // Close on successful login
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-2xl p-6 w-full max-w-md shadow-2xl relative border border-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring rounded-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl font-bold text-text-primary mb-6">
          {mode === "login" ? "Log In" : "Sign Up"}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-error/10 text-error text-sm border border-error/20">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-secondary/10 text-secondary-text text-sm border border-secondary/20">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-shadow"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-shadow"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-primary text-surface rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-surface transition-colors disabled:bg-disabled disabled:text-text-secondary disabled:cursor-not-allowed mt-2"
          >
            {loading ? "Processing..." : mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          {mode === "login" ? (
            <>
              Don't have an account?{" "}
              <button
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-primary font-medium hover:text-primary-hover hover:underline focus:outline-none focus:ring-2 focus:ring-focus-ring rounded-sm px-1 transition-colors"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                  setSuccessMsg(null);
                }}
                className="text-primary font-medium hover:text-primary-hover hover:underline focus:outline-none focus:ring-2 focus:ring-focus-ring rounded-sm px-1 transition-colors"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
