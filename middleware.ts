import { withAuth } from "next-auth/middleware";

// This code exports the default configuration for the withAuth middleware. It sets the pages property, which specifies the page to redirect to when a user is not authenticated and attempts to access a protected route. In this case, if the user is not authenticated, they will be redirected to the root ("/") page.
export default withAuth({
  pages: {
    signIn: "/",
  },
});

//This code exports an additional configuration object called config. It contains a matcher property, which specifies the patterns of the routes that should be protected by the withAuth middleware. In this case, any routes that match the patterns "/conversations/:path*" and "/users/:path*" will be protected and require authentication.
export const config = { 
  matcher: [
    "/conversations/:path*",
    "/users/:path*",
  ]
};