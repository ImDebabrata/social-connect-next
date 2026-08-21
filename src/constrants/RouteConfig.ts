// Auth screens
const authScreens = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
};

// App Screens
const protectedRoute = {
  MAIN_SCREEN: "/",
  PROFILE: "/users/:username",
  POST: "/posts/:postId",
  BOOKMARKS: "/bookmarks",
  NOTIFICATIONS: "/notifications",
  MESSAGES: "/messages",
};

const RouteConfig = {
  //Auth Screens
  authScreens,
  //App Screens
  protectedRoute,
};

export default RouteConfig;
