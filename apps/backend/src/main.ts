import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "./config";
import * as cookieParser from "cookie-parser";
import helmet from "helmet";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.use(helmet({}));
  app.use(cookieParser(process.env.COOKIE_SECRET));
  app.enableCors({
    origin: ["http://localhost:3000", "https://secureitub.com"],
    credentials: true,
  });
  app.use((req, res, next) => {
    console.log(req.url);
    next();
  });

  await app.listen(ConfigService.PORT ?? 4000);
}
bootstrap();
