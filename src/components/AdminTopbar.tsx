import Link from "next/link";
import { Plus, Upload, Menu } from "lucide-react";

interface AdminTopbarProps {
  user: { name: string; role: string };
  onToggleMobileSidebar?: () => void;
}

export default function AdminTopbar({ user, onToggleMobileSidebar }: AdminTopbarProps) {
  return (
    <header className="admin-topbar">
      <div className="flex items-center gap-2">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="btn btn-ghost btn-sm admin-hamburger-btn"
            title="Toggle Navigation Menu"
            style={{ padding: "0.25rem 0.5rem" }}
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        )}
        <span className="badge badge-primary hide-on-mobile">Curriculum Control Console</span>
        <span className="text-xs text-muted">Role: {user.role}</span>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/admin/questions/new" className="btn btn-primary btn-sm" style={{ padding: "0.25rem 0.65rem", fontSize: "0.8rem" }}>
          <Plus className="w-3.5 h-3.5" />
          <span className="hide-on-mobile">Add Question</span>
          <span className="show-on-mobile">Add</span>
        </Link>
        <Link href="/admin/questions/import" className="btn btn-secondary btn-sm hide-on-mobile" style={{ padding: "0.25rem 0.65rem", fontSize: "0.8rem" }}>
          <Upload className="w-3.5 h-3.5" />
          <span>Import Excel</span>
        </Link>
        <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text-subheading)" }}>
          {user.name.split(" ")[0]}
        </div>
      </div>
    </header>
  );
}

