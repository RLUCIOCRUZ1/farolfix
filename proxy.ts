import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const session = request.cookies.get("farolfix_admin_session")?.value;
  const authenticated = session === "authenticated";
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginRoute = request.nextUrl.pathname.startsWith("/admin/login");

  if (isAdminRoute && !isLoginRoute && !authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && authenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/admin/:path*"]
};
