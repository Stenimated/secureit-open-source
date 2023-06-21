import { ConfigService } from "src/config";

export const FRONT_END = ConfigService.ENV === "production"
  ? "https://secureitub.com"
  : "http://localhost:3000";

//no port
export const FRONT_END_NO_PROTOCOL = FRONT_END.replace(/https?:\/\//, "")
  .replace(/:\d+/, "");
export const MAIN_DOMAIN = `${
  ConfigService.ENV === "production" ? "secureitub.com" : "localhost"
}`;
