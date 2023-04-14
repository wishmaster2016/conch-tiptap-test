import { useState, useEffect, ReactNode, ReactElement } from "react";
import { useRouter } from "next/router";
import { isLoggedInFirebase } from "../../firebase-utils/user";
import { ONBOARDING_PATH, SIGNUP_PATH, URL_AFTER_AUTH } from "utils/constants";
type Props = {
  children: ReactElement;
};

function RouteGuard({ children }: Props): ReactElement {
  const [authorized, setAuthorized] = useState(false);

  const router = useRouter();

  useEffect(() => {
    // on initial load - run auth check
    authCheck(router.asPath);

    // on route change start - hide page content by setting authorized to false
    const hideContent = () => setAuthorized(false);
    router.events.on("routeChangeStart", hideContent);

    // on route change complete - run auth check
    router.events.on("routeChangeComplete", authCheck);

    // unsubscribe from events in useEffect return function
    return () => {
      router.events.off("routeChangeStart", hideContent);
      router.events.off("routeChangeComplete", authCheck);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function authCheck(url: string) {
    // redirect to login page if accessing a private page and not logged in
    const publicPaths = ["/login"];
    const securedUrls = ["/check", "/app", "/onboarding"];

    const path = url.split("?")[0];

    if (path == '/bypass') {
      router.push('/check');
    }
    
    const isLoggedIn = await isLoggedInFirebase();
    const isAuthUrl = path.endsWith("login") || path.endsWith("sign-up");
    const isSecuredUrl = securedUrls.some((securedUrl) =>
      path.startsWith(securedUrl),
    );

    if (path.includes("pricing")) {
      router.push({
        pathname: "/upgrade",
      });
    }

    // if not logged in and auth page, stay here
    if (!isLoggedIn && isAuthUrl) {
      setAuthorized(true);
    } else if (!isLoggedIn && isSecuredUrl) {
      // if secured url and not logged in, redirect
      setAuthorized(false);
      router.push({
        pathname: SIGNUP_PATH,
      });
    } else if (isAuthUrl && isLoggedIn) {
      // if alreday logged in and auth page, redirect
      setAuthorized(false);
      router.push({
        pathname: ONBOARDING_PATH,
      });
    } else {
      if (isLoggedIn) {
        if (path.length < 2) {
          console.log("path is: ", path);
          // router.push({ pathname: "/app" });
        }
      }
      setAuthorized(true);
    }
  }

  return authorized ? children : <></>;
}

export { RouteGuard };
