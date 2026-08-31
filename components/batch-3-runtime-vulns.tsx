"use client";

import { useEffect } from "react";

// Batch 3 runtime vulnerabilities in one place.
// Fires JS errors, failed fetches, and hydration mismatches when this component mounts.
// Safe to remove for a clean testbed; deliberately noisy for scanner testing.

// Row 37 - hydration-errors-detected. Server renders one timestamp, client renders another.
// React logs a hydration mismatch warning that the scanner catches.
function HydrationMismatch() {
  return <span aria-hidden style={{ display: "none" }}>Server timestamp: {Date.now()}</span>;
}

// Row 36 - failed-network-requests. Fetches a URL that returns 404 on page load.
// Scanner's browser collector sees the failed network call.
function FailedFetch() {
  useEffect(() => {
    // Fire-and-forget; ignore rejection so it doesn't become an unhandled promise.
    fetch("/api/does-not-exist-batch-3").catch(() => {});
  }, []);
  return null;
}

// Rows 34 + 35 - js-exceptions-detected + js-exception-regression.
// Throws asynchronously so React doesn't unmount the tree; browser logs "Uncaught Error"
// which the scanner catches via console.error.
function ThrowsAsyncError() {
  useEffect(() => {
    const t = setTimeout(() => {
      throw new Error("Intentional test error - Batch 3 (safe to ignore)");
    }, 100);
    return () => clearTimeout(t);
  }, []);
  return null;
}

export function Batch3RuntimeVulns() {
  return (
    <>
      <HydrationMismatch />
      <FailedFetch />
      <ThrowsAsyncError />
    </>
  );
}
