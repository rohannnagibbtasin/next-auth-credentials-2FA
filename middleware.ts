import authConfig from "./auth.config"
import NextAuth from "next-auth"
import { apiAuthPrefix, authRoutes, DEFAULT_LOGIN_REDIRECT, errorRoute, publicRoutes, resetRoute } from "./routes";
 
const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { nextUrl } = req;

    const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
    const isErrorRoute = nextUrl.pathname.startsWith(errorRoute);
    const isResetRoute = nextUrl.pathname.startsWith(resetRoute);
    const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
    const isAuthRoute = authRoutes.includes(nextUrl.pathname)
    if(isApiAuthRoute){
        return;
    }
    if(isErrorRoute){
        return
    }
    if(isResetRoute){
        return
    }
    if(isAuthRoute){
        if(isLoggedIn){
            return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
        }
        return;
    }
    if(!isLoggedIn && !isPublicRoute){
        let callbackUrl = nextUrl.pathname;
        if(nextUrl.search){
            callbackUrl+=nextUrl.search
        }
        const encodedCallbackUrl = encodeURIComponent(callbackUrl);

        return Response.redirect(new URL(`/auth/login?callbackUrl=${encodedCallbackUrl}`,nextUrl));
    }
    return;
})
 

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}