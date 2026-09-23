import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer
      style={{
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #E2E8F0",
        padding: "1.25rem 1rem",
        fontSize: "0.825rem",
        color: "#64748B",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <Link href="/about" style={{ color: "#64748B", textDecoration: "none" }}>
            About Us
          </Link>
          <span>|</span>
          <Link href="/about" style={{ color: "#64748B", textDecoration: "none" }}>
            Terms & Conditions
          </Link>
          <span>|</span>
          <Link href="/about" style={{ color: "#64748B", textDecoration: "none" }}>
            Privacy Policy
          </Link>
          <span>|</span>
          <Link href="/about" style={{ color: "#64748B", textDecoration: "none" }}>
            Contact Us
          </Link>
        </div>

        <div>
          © 2026 MockNepal Examveda. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
