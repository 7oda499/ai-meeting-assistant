"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, LayoutDashboard, LogOut } from "lucide-react";

interface AppShellProps {
  userEmail?: string | null;
  children: React.ReactNode;
}

export function AppShell({ userEmail, children }: AppShellProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-indigo-600 font-bold">
            <Sparkles className="w-5 h-5" />
            <span className="hidden sm:inline">AI Meeting Assistant</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            {userEmail && (
              <span className="text-sm text-muted hidden md:inline">{userEmail}</span>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </nav>
        </div>
      </header>
      <main className="px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
