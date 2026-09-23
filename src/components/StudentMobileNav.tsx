"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, Clock, RotateCcw, Menu } from "lucide-react";

export default function StudentMobileNav({ onOpenMenu }: { onOpenMenu?: () => void }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard, color: "#1D4ED8" },
    { label: "Practice", href: "/student/practice", icon: CheckSquare, color: "#2563EB" },
    { label: "Mocks", href: "/student/mock-tests", icon: Clock, color: "#E11D48" },
    { label: "Mistakes", href: "/student/mistakes", icon: RotateCcw, color: "#D97706" },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/student/dashboard" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`mobile-bottom-nav-item ${isActive ? "active" : ""}`}
            style={isActive ? { color: item.color, fontWeight: 700 } : undefined}
          >
            <Icon className="w-5 h-5" style={isActive ? { stroke: item.color } : undefined} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {/* 5th Tab: All Sections Drawer Trigger */}
      <button
        type="button"
        onClick={() => onOpenMenu?.()}
        className="mobile-bottom-nav-item"
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        title="Open all courses, notes, syllabus & settings"
      >
        <Menu className="w-5 h-5 text-indigo-600" />
        <span style={{ fontWeight: 600 }}>All (सबै)</span>
      </button>
    </nav>
  );
}

