import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "./lib/stateless-session";
import RouteConfig, { isRouteMatch } from "./constrants/RouteConfig";
import Misc from "./constrants/Misc";

// 1. Specify protected and public routes from RouteConfig
const publicRoutes = Object.values(RouteConfig.authScreens);
const protectedRoutes = Object.values(RouteConfig.protectedRoute);

export default async function middleware(req: NextRequest) {
  // 2. Dynamic route matching using RouteConfig patterns
  const path = req.nextUrl.pathname;
  const isPublicRoute = publicRoutes.some((route) => isRouteMatch(route, path));
  const isProtectedRoute = protectedRoutes.some((route) =>
    isRouteMatch(route, path)
  );

  // 3. Decrypt the session from the cookie
  const cookiesStore = await cookies();
  const cookie = cookiesStore.get(Misc.SESSION_COOKIE)?.value;
  const session = cookie ? await decrypt(cookie) : null;

  // 4. Redirect unauthenticated users away from protected routes
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(
      new URL(RouteConfig.authScreens.SIGN_IN, req.nextUrl)
    );
  }

  // 5. Redirect authenticated users away from auth screens
  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(
      new URL(RouteConfig.protectedRoute.MAIN_SCREEN, req.nextUrl)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
