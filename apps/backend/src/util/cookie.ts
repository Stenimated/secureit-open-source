import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Cookies = createParamDecorator(
  (
    data: (typeof COOKIE_ID)[keyof typeof COOKIE_ID] | undefined | void,
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest();
    return data ? request.cookies?.[data as string] : request.cookies;
  },
);

export const COOKIE_ID = {
  CSRF: '.secureitub.com.x.csrf-token',
  SESSION: '.secureitub.com.x.session-token',
};
