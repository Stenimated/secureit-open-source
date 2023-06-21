import { Module } from "@nestjs/common";
import { CompanyService } from "./company.service";
import { CompanyController } from "./company.controller";
import { PrismaService } from "src/prisma.service";
import { AuthModule } from "src/auth/auth.module";
import { StorageModule } from "src/storage/storage.module";

@Module({
  providers: [
    CompanyService,
    PrismaService,
  ],
  controllers: [CompanyController],
  imports: [AuthModule, StorageModule],
})
export class CompanyModule {}
