"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  BookOpen, LayoutDashboard, Users, CreditCard, LogOut,
  Settings, BarChart3, ChevronRight
} from "lucide-react";

interface NavUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
];

export function AdminSidebar({ user }: { user: NavUser }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-primary-950 text-white min-h-screen flex flex-col flex-shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-lg leading-tight">Teching</div>
            <div className="text-primary-400 text-xs">Admin Panel</div>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-xs font-semibold text-primary-400 uppercase tracking-wider px-3 mb-3">
          Management
        </div>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-primary-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-primary-400" : "text-primary-500 group-hover:text-primary-400"}`} />
                {label}
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-primary-500" />}
            </Link>
          );
        })}

        <div className="pt-4">
          <div className="text-xs font-semibold text-primary-400 uppercase tracking-wider px-3 mb-3">
            Quick Links
          </div>
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-primary-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <BarChart3 className="w-4 h-4 text-primary-500" />
            View Site
          </Link>
        </div>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-700 flex items-center justify-center flex-shrink-0">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-sm font-semibold">{user.name?.[0] ?? "A"}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user.name}</div>
            <div className="text-xs text-primary-400 truncate">{user.email}</div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
