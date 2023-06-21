import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PrismaService } from "src/prisma.service";
import { UserService } from "src/user/user.service";
import { AuthGuard } from "./auth.guard";
import { UserModule } from "src/user/user.module";

@Module({
  providers: [AuthService, PrismaService, AuthGuard],
  controllers: [AuthController],
  exports: [AuthGuard, AuthService],
  imports: [UserModule],
})
export class AuthModule {}
