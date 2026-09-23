"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";

export default function AdminShellWrapper({
  user,
  children,
}: {
  user: { name: string; email: string; role: string };
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <div className="admin-shell">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            zIndex: 999,
            backdropFilter: "blur(2px)",
          }}
          aria-hidden="true"
        />
      )}

      <AdminSidebar
        user={user}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0, width: "100%" }}>
        <AdminTopbar
          user={user}
          onToggleMobileSidebar={() => setMobileOpen(!mobileOpen)}
        />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
