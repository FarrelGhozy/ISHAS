// Router sederhana berbasis segmen path + konteks request (aktor, params).
// Tidak memakai framework agar mudah diuji dengan dependensi disuntik.

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type RouteContext = {
  request: Request;
  url: URL;
  params: Record<string, string>;
  actor: Actor | null;
};

export type Actor = {
  id: string;
  name: string;
  email: string;
  roleId: "admin" | "validator" | "pesantren";
  role: "Super Admin" | "Validator" | "Pesantren";
  status: "Aktif" | "Menunggu" | "Nonaktif";
  institutionCodes: string[];
};

export type Handler = (ctx: RouteContext) => Promise<Response> | Response;

export type Route = {
  method: HttpMethod;
  pattern: string;
  handler: Handler;
};

export type MatchResult = { route: Route; params: Record<string, string> } | null;

function split(pathname: string): string[] {
  return pathname.split("/").filter((part) => part.length > 0);
}

export function matchRoute(method: string, pathname: string, routes: Route[]): MatchResult {
  const parts = split(pathname);
  for (const route of routes) {
    if (route.method !== method) continue;
    const routeParts = split(route.pattern);
    if (routeParts.length !== parts.length) continue;
    const params: Record<string, string> = {};
    let matched = true;
    for (let i = 0; i < routeParts.length; i += 1) {
      const rp = routeParts[i];
      const actual = parts[i];
      if (rp.startsWith(":")) {
        params[rp.slice(1)] = decodeURIComponent(actual);
      } else if (rp !== actual) {
        matched = false;
        break;
      }
    }
    if (matched) return { route, params };
  }
  return null;
}
