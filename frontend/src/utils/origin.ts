import { type NextRequest } from "next/server";

/**
 * Safely resolves the current app origin on the client or server.
 * Guarantees that the returned origin string is never "null", "undefined", or invalid.
 */
export function getAppOrigin(): string {
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin && origin !== "null" && origin !== "undefined" && !origin.includes("null")) {
      return origin;
    }
    if (window.location.host && !window.location.host.includes("null")) {
      const protocol = window.location.protocol || "http:";
      return `${protocol}//${window.location.host}`;
    }
  }

  const envUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && envUrl !== "null" && envUrl !== "undefined" && !envUrl.includes("null")) {
    return envUrl.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

/**
 * Safely resolves origin from an incoming Next.js Request or NextRequest.
 */
export function getRequestOrigin(request: Request | NextRequest): string {
  const headers = request.headers;
  const host = headers.get("x-forwarded-host") || headers.get("host");
  const proto = headers.get("x-forwarded-proto") || "http";

  if (host && !host.includes("null")) {
    return `${proto}://${host}`;
  }

  try {
    const url = new URL(request.url);
    if (url.origin && url.origin !== "null" && !url.origin.includes("null")) {
      return url.origin;
    }
  } catch {
    // Ignore invalid URL parse
  }

  return getAppOrigin();
}
