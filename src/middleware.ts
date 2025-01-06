import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "./lib/stateless-session";
import RouteConfig from "./constrants/RouteConfig";

// 1. Specify protected and public routes
const protectedRoutes = Object.values(RouteConfig.protectedRoute);
const publicRoutes = Object.values(RouteConfig.authScreens);

export default async function middleware(req: NextRequest) {
  //   // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  // // 3. Decrypt the session from the cookie
  const cookiesStore = await cookies();
  const cookie = cookiesStore.get("session")?.value;
  const session = cookie ? await decrypt(cookie) : null;
  // console.log({
  //   cookie,
  //   isProtectedRoute,
  //   isPublicRoute,
  //   userId: session?.userId,
  //   path,
  // });

  // // 4. Redirect
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(
      new URL(RouteConfig.authScreens.SIGN_IN, req.nextUrl)
    );
  }

  if (
    isPublicRoute &&
    session?.userId &&
    path !== RouteConfig.protectedRoute.MAIN_SCREEN
  ) {
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
