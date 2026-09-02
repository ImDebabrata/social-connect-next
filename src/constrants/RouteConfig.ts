// Auth screens
const authScreens = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
} as const;

// App Screens
const protectedRoute = {
  MAIN_SCREEN: "/",
  PROFILE: "/users/:username",
  POST: "/posts/:postId",
  BOOKMARKS: "/bookmarks",
  NOTIFICATIONS: "/notifications",
  MESSAGES: "/messages",
  FIND_FRIENDS: "/find-friends",
  SEARCH: "/search",
} as const;

/**
 * Checks whether a requested pathname matches a configured route pattern
 * supporting exact paths (e.g. "/", "/bookmarks") and dynamic parameters (e.g. "/users/:username").
 */
export function isRouteMatch(pattern: string, pathname: string): boolean {
  if (pattern === pathname) return true;
  if (pattern === "/" && pathname !== "/") return false;

  const patternSegments = pattern.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);

  if (patternSegments.length === 0) return pathSegments.length === 0;
  if (pathSegments.length < patternSegments.length) return false;

  return patternSegments.every((segment, index) => {
    if (segment.startsWith(":")) return true;
    return segment === pathSegments[index];
  });
}

const RouteConfig = {
  // Auth Screens
  authScreens,
  // App Screens
  protectedRoute,
  // Helper
  isRouteMatch,
};

export default RouteConfig;
