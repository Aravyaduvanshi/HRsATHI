import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * All routes under /dashboard require the HR user to be signed in.
 * /apply/:jobId and /api/resumes are intentionally public.
 * /api/jobs and /api/webhooks are protected separately via Clerk auth() in the handler.
 */
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - Any file with an extension (e.g. .png, .svg)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
