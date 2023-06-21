import {
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Body,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // @Get(':id')
  // async getUserById(@Param('id') id: string) {
  //   const result = await this.userService.user({
  //     id: id,
  //   });

  //   if (result) return this.userService.toJSON(result);

  //   throw new HttpException('User not found', 404);
  // }
}
