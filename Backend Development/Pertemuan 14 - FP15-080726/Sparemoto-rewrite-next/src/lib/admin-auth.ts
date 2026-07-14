export const ADMIN_SESSION_COOKIE = "sparemoto_admin";
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export function getAdminSessionToken() {
  return process.env.ADMIN_SESSION_TOKEN || "sparemoto-demo-admin";
}

export function isAdminCookieValue(value?: string | null) {
  return Boolean(value) && value === getAdminSessionToken();
}

export function isAdminRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookies = new Map(
    cookieHeader
      .split(";")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const separatorIndex = entry.indexOf("=");
        if (separatorIndex === -1) {
          return [entry, ""];
        }

        return [
          decodeURIComponent(entry.slice(0, separatorIndex)),
          decodeURIComponent(entry.slice(separatorIndex + 1)),
        ];
      })
  );

  return isAdminCookieValue(cookies.get(ADMIN_SESSION_COOKIE));
}

export function buildAdminSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(
    getAdminSessionToken()
  )}; Path=/; Max-Age=${ADMIN_SESSION_MAX_AGE}; HttpOnly; SameSite=Lax${secure}`;
}

export function buildExpiredAdminSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}
