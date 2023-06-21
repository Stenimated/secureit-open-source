import { defineConfig } from "astro/config";
import solidJs from "@astrojs/solid-js";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercelServerless from "@astrojs/vercel/serverless";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercelServerless({
    analytics: true
  }),
  // adapter: node({
  //   mode: "standalone",
  // }),
  integrations: [
    solidJs(),
    tailwind(),
    sitemap({
      customPages: [
        "https://secureitub.com/",
        "https://secureitub.com/search",
        "https://secureitub.com/branch/bygg",
        "https://secureitub.com/branch/helse",
        "https://secureitub.com/branch/login",
        "https://secureitub.com/branch/signup",
      ]
    }),
    partytown({
      config: {
      }
    }),
  ],
  site: "https://secureitub.com"
});