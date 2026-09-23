"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  HelpCircle,
  Upload,
  FileText,
  AlertTriangle,
  Clock,
  CreditCard,
  LogOut,
  ExternalLink,
  ShieldAlert,
  BookOpen,
  Layers,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  user: { name: string; email: string; role: string };
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ user, mobileOpen = false, onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  };

  const navItems = [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Courses & Exam Tracks", href: "/admin/courses", icon: Layers },
    { label: "Question Bank", href: "/admin/questions", icon: HelpCircle },
    { label: "Excel Bulk Upload", href: "/admin/questions/import", icon: Upload },
    { label: "Syllabus & Topics", href: "/admin/syllabus", icon: BookOpen },
    { label: "Study Notes", href: "/admin/notes", icon: FileText },
    { label: "Mock Test Builder", href: "/admin/mock-tests", icon: Clock },
    { label: "Content Reports", href: "/admin/reports", icon: AlertTriangle },
    { label: "Orders & Entitlements", href: "/admin/orders", icon: CreditCard },
  ];

  return (
    <aside className={`admin-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
      {/* Brand */}
      <div className="admin-sidebar-header flex justify-between items-center">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-teal-400" />
          <div style={{ fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
            नेपाल परीक्षा
            <span style={{ fontSize: "0.65rem", background: "#334155", color: "#94A3B8", padding: "2px 6px", borderRadius: 4, marginLeft: 6 }}>
              ADMIN
            </span>
          </div>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="btn btn-ghost btn-sm show-on-mobile"
            style={{ color: "#94A3B8", padding: "4px" }}
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="admin-sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onCloseMobile?.()}
              className={`admin-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: "1rem", borderTop: "1px solid #1E293B", backgroundColor: "#0B1120" }}>
        <div className="flex items-center justify-between">
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#F8FAFC", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#64748B" }}>
              {user.role} Access
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: "4px" }}
            title="Sign out"
          >
            <LogOut className="w-4 h-4 hover:text-white" />
          </button>
        </div>

        <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid #1E293B" }}>
          <Link
            href="/student/dashboard"
            style={{ color: "#38BDF8", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }}
          >
            <span>Switch to Student View</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
