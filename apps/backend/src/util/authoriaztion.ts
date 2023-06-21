import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

const SECRET = process.env.COOKIE_SECRET;

if (!SECRET) throw new Error('No secret for cookies');

const parseFunctions: Record<
  HeaderAuthorization,
  (str: string) => string | false
> = {
  Session: (str) => cookieParser.signedCookie(str, SECRET),
  Basic: (str) => Buffer.from(str, 'base64').toString('utf-8'),
};

export type HeaderAuthorization = 'Session' | 'Basic';

export const Authorization = createParamDecorator(
  (data: 'Basic' | 'Session' | undefined | void, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (typeof request.headers.authorization !== 'string') {
      return undefined;
    }

    const authentication = request.headers.authorization.split(' ');

    if (data) {
      if (authentication[0] === data && typeof authentication[1] === 'string') {
        const parsed = parseFunctions[data](authentication[1]);
        if (typeof parsed === 'string') {
          return parsed;
        }
      }
      return undefined;
    }
    return authentication[1];
  },
);
