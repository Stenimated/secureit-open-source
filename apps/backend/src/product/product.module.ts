import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { PrismaService } from "src/prisma.service";
import { AuthModule } from "src/auth/auth.module";
import { StorageService } from "src/storage/storage.service";

@Module({
  controllers: [ProductController],
  providers: [ProductService, PrismaService, StorageService],
  exports: [ProductService],
  imports: [
    AuthModule,
  ],
})
export class ProductModule {}
