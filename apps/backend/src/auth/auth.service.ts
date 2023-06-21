import { BadRequestException, Injectable } from "@nestjs/common";
import { UserService } from "src/user/user.service";
import { Prisma, User } from "database";
import { PrismaService } from "src/prisma.service";
import { createId, isCuid } from "@paralleldrive/cuid2";
import { genSalt, hash } from "bcrypt";
import { compare } from "bcrypt";

const ENCRYPTION = "sha512";
const ITERATIONS = 10;

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private prismaService: PrismaService,
  ) {}

  async validateUserWithLocal(email: string, password: string) {
    const user = await this.userService.user(
      {
        email,
      },
      {
        local_auth: true,
      },
    );
    if (!user) {
      return null;
    }

    const salt = user.local_auth.salt;
    const genHash = await this.hashPassword(password, salt);

    if (compare(genHash, user.local_auth.password)) {
      return user;
    } else {
      return null;
    }
  }

  async createSession(
    user: User,
    metaData: {
      ip: string;
      userAgent: string;
    },
  ) {
    // Expires in 1 week
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    const id = `${user.id}-${createId()}`;

    return this.prismaService.session.create({
      data: {
        expires,
        session_token: id,
        meta: `${metaData.ip} - ${metaData.userAgent}`,
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  getSession(id: string) {
    return this.prismaService.session.findUnique({
      where: {
        session_token: id,
      },
      include: {
        user: true,
      },
    });
  }

  deleteSession(id: string) {
    const [userId, sessionId] = id.split("-");

    if (!userId || !sessionId) {
      throw new BadRequestException("Invalid session id");
    }

    if (!isCuid(sessionId)) {
      throw new BadRequestException("Invalid session id");
    }

    return this.prismaService.session.delete({
      where: {
        session_token: id,
      },
    });
  }

  hashPassword(password: string, salt: string) {
    return hash(password, salt);
  }

  async createUsersWithLocal(
    data: Exclude<Prisma.UserCreateInput, "">,
    password: string,
  ) {
    if (await this.userService.user({ email: data.email })) {
      throw new BadRequestException("User already exists");
    }

    const salt = await genSalt(ITERATIONS, "b");
    const genHash = await this.hashPassword(password, salt);

    return this.userService.createUser({
      ...data,
      local_auth: {
        create: {
          encryption: ENCRYPTION,
          password: genHash,
          salt: salt,
        },
      },
    });
  }
}
