/// <reference types="astro/client" />
/// <reference path="../.astro-i18n/generated.d.ts" />

import type { User } from "database";

// extend Request and add user
declare global {
  interface Request {
    user?: User | null;
  }
}
