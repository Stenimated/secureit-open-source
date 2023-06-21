import { Injectable } from "@nestjs/common";
import { Prisma, User } from "database";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async toJSON(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
    };
  }

  async user(
    userWhereUnqiueInput: Prisma.UserWhereUniqueInput,
    include?: Prisma.UserInclude,
  ) {
    return this.prismaService.user.findUnique({
      where: userWhereUnqiueInput,
      include,
    });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return this.prismaService.user.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prismaService.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prismaService.user.delete({
      where,
    });
  }
}
