import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { APP_PIPE } from "@nestjs/core";
import { ZodValidationPipe } from "nestjs-zod";
import { ProductService } from "./product/product.service";
import { ProductModule } from "./product/product.module";
import { CompanyService } from "./company/company.service";
import { CompanyModule } from "./company/company.module";
import { StorageModule } from "./storage/storage.module";
import { PrismaService } from "./prisma.service";

@Module({
  imports: [
    UserModule,
    AuthModule,
    ProductModule,
    CompanyModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    ProductService,
    CompanyService,
    PrismaService,
  ],
})
export class AppModule {}
