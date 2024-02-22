import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { UserIdentity } from '../interface/user-identity.interface';
import { USER_KEY } from '../constants/auth.constants';

export const BasicUserIdentity = createParamDecorator(
  (key, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user: UserIdentity | undefined = request[USER_KEY];
    return user;
  },
);
