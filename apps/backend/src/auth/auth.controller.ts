import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";
import { z } from "nestjs-zod/z";
import { createZodDto } from "nestjs-zod/dto";
import { COOKIE_ID, Cookies } from "src/util/cookie";
import { Session } from "database";
import { Authorization } from "src/util/authoriaztion";
import { MAIN_DOMAIN } from "src/util/base-url";

export const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const sessinoSchema = z.object({
  session_token: z.string(),
});

export class UserDto extends createZodDto(UserSchema) {}

@Controller("auth")
export class AuthController {
  constructor(private AuthService: AuthService) {}

  @Post("sign-in")
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: UserDto,
  ) {
    const { email, password } = body;
    const user = await this.AuthService.validateUserWithLocal(email, password);
    console.log(user);
    if (user) {
      const cookie = await this.AuthService.createSession(user, {
        ip: req.ip,
        userAgent: req.headers["user-agent"] ?? "not known",
      });

      return this.generateCookie(res, cookie).status(201).json({
        ok: true,
      });
    }
    return res.json({ ok: false });
  }

  @Get("session")
  async getBasicInfo(
    @Cookies(COOKIE_ID.SESSION) cookie?: string,
    @Authorization("Session") auth?: string,
  ) {
    if (cookie) {
      const session = await this.AuthService.getSession(cookie);
      if (session) {
        return {
          ok: true,
          user: session.user,
        };
      }
      throw new UnauthorizedException("Invalid session token");
    } else if (auth) {
      const session = await this.AuthService.getSession(auth);
      if (session) {
        return {
          ok: true,
          user: session.user,
        };
      }
      throw new UnauthorizedException("Invalid session token");
    }
    throw new UnauthorizedException("No cookie/authorization provided");
  }

  @Post("sign-out")
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    if (req.signedCookies[COOKIE_ID.SESSION]) {
      await this.AuthService.deleteSession(
        req.signedCookies[COOKIE_ID.SESSION],
      );
      res.clearCookie(COOKIE_ID.SESSION);
      return {
        ok: true,
      };
    }
    return {
      ok: false,
    };
  }

  generateCookie(res: Response, session: Session): Response {
    return res.cookie(COOKIE_ID.SESSION, session.session_token, {
      signed: true,
      secure: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7,
      domain: MAIN_DOMAIN,
    });
  }

  @Post("sign-up-local")
  async createUser(
    @Req() req: Request,
    @Res() res: Response,
    @Body() credentials,
  ) {
    const user = await this.AuthService.createUsersWithLocal(
      {
        email: credentials.email,
      },
      credentials.password,
    );

    if (user) {
      console.log("User created");
      const session = await this.AuthService.createSession(user, {
        ip: req.ip,
        userAgent: req.headers["user-agent"] ?? "not known",
      });

      return this.generateCookie(res, session).status(201).json({
        ok: true,
      });
    } else {
      res
        .json({
          ok: false,
          error: "User already exists",
        })
        .status(409);
    }
  }
}
