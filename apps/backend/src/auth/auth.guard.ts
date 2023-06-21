import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Reflector } from "@nestjs/core";
import { Role } from "database";
import { COOKIE_ID } from "src/util/cookie";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(AuthService) private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const roles = this.reflector.get<Role[]>("roles", context.getHandler());

    if (!roles) {
      console.error("No roles defined for this route");
      return true;
    }

    const http = context.switchToHttp();
    const req: Request = http.getRequest();

    if (!req.signedCookies[COOKIE_ID.SESSION]) return false;
    console.log(req.signedCookies[COOKIE_ID.SESSION]);
    const session = await this.authService.getSession(
      req.signedCookies[COOKIE_ID.SESSION],
    );

    if (roles) {
      return session !== null &&
        (roles.includes(session.user.role) ||
          session.user.role === "ADMIN");
    }

    return session !== null;
  }
}
