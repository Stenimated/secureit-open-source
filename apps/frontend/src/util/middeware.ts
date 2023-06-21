import type { AstroGlobal } from "astro";
import { COOKIE_ID } from "./cookie";
import { API_URL } from "./base-url";

export const Middleware = async (
  Astro: AstroGlobal,
): Promise<Response | undefined> => {
  if (Astro.cookies.has(COOKIE_ID.SESSION)) {
    const session = Astro.cookies.get(COOKIE_ID.SESSION);
    try {
      const request = await fetch(`${API_URL}/auth/session`, {
        method: "GET",
        headers: {
          Authorization: `Session ${session.value}`,
        },
        // cache: "no-cache",
      }).then((res) => res.json());

      if (request.ok === true) {
        Astro.request.user = request.user;
      }
    } catch {
      // Do nothing
    }
  }

  if (
    Astro.request.url.includes("employee") && (!Astro.request.user ||
      (Astro.request.user.role !== "ADMIN" &&
        Astro.request.user.role !== "EMPLOYEE"))
  ) {
    console.log("Unauthorized", Astro.request.user);
    return new Response("Unauthorized", {
      status: 401,
      statusText: "Unauthorized",
    });
  }
  return undefined;
};
