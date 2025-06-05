import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const binRoutes = [
  "/idle-video",
  "/disposal-confirmation",
  "/disposal-qr",
  "/detect-material",
  "/bin-capacity",
  "/leaderboard",
];
// This function can be marked `async` if using `await` inside
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isLoggedIn = cookies().get("token") != undefined;
  const isBinRoute = binRoutes.some((route) => path.startsWith(route));
  if (!isLoggedIn && isBinRoute) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }
  // redirect user back to home page if logged in

  if (isLoggedIn && path.includes("/login")) {
    return NextResponse.redirect(new URL("/", req.nextUrl)); 
  }
}

// middleware is invoked all on paths
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp3)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
