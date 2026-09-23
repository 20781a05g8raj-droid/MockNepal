"use client";

import { useEffect } from "react";

/**
 * Suppresses uncaught errors originating from third-party browser extensions
 * (such as ad blockers, Urban VPN proxy "M_ID", etc.) so they do not trigger
 * the Next.js development error overlay.
 */
export default function ExtensionErrorSuppressor() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const filename = event.filename || "";
      const message = event.message || "";
      const stack = event.error?.stack || "";

      // Check if error originated from a browser extension or known extension bugs
      if (
        filename.includes("chrome-extension://") ||
        filename.includes("moz-extension://") ||
        filename.includes("safari-extension://") ||
        stack.includes("chrome-extension://") ||
        stack.includes("moz-extension://") ||
        message.includes("reading 'M_ID'") ||
        message.includes("reading 'M_ID')")
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
        return true;
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const stack = event.reason?.stack || "";
      const message = event.reason?.message || "";
      if (
        stack.includes("chrome-extension://") ||
        stack.includes("moz-extension://") ||
        message.includes("reading 'M_ID'")
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };

    window.addEventListener("error", handleError, true);
    window.addEventListener("unhandledrejection", handleRejection, true);

    return () => {
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleRejection, true);
    };
  }, []);

  return null;
}
