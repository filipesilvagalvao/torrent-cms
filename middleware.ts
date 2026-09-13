import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./src/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;

  const isLoginRoute = nextUrl.pathname === "/login";
  const isAdminPath = nextUrl.pathname.startsWith("/admin");
  const isProtectedApi = nextUrl.pathname.startsWith("/api/admin");

  // /login é público (passa direto)
  if (isLoginRoute) {
    return NextResponse.next();
  }

  if (!session) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    if (isAdminPath) {
      const loginUrl = new URL("/login", nextUrl);
      if (nextUrl.pathname !== "/admin") {
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
