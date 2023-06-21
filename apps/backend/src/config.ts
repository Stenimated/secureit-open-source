import zod from "zod";
import * as Dotenv from "dotenv";

Dotenv.config();

const config = zod.object({
  google: zod.object({
    clientID: zod.string(),
    clientSecret: zod.string(),
    callbackURL: zod.string(),
  }),
  GCP: zod.object({
    projectId: zod.string(),
    projectNumber: zod.string(),
  }),
  ENV: zod.union([
    zod.literal("development"),
    zod.literal("production"),
    zod.literal("test"),
  ]),
  PORT: zod.number(),
});

export type Config = zod.infer<typeof config>;

const PORT = zod.number().parse(Number(process.env.PORT ?? 4000) ?? 4000);

export const ConfigService = config.parse({
  google: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  GCP: {
    projectId: process.env.GCP_PROJECT_ID,
    projectNumber: process.env.GCP_PROJECT_NUMBER,
  },
  ENV: process.env.NODE_ENV ?? "development",
  PORT: PORT,
});
