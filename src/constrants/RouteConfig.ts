// Auth screens
const authScreens = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
};

// App Screens
const protectedRoute = {
  MAIN_SCREEN: "/",
  PROFILE: "/users/:username",
  POST: "/posts/:postId",
  BOOKMARKS: "/bookmarks",
};

const RouteConfig = {
  //Auth Screens
  authScreens,
  //App Screens
  protectedRoute,
};

export default RouteConfig;
