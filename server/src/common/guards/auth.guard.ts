import { Model } from 'mongoose';
import { Request } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';

import { User } from '../../modules/user/schemas/user.schema';
import {
  ACCESS_TOKEN,
  USER_KEY,
} from '../../module-contracts/auth/constants/auth.constants';
import { TokenService } from '../../modules/auth/token/token.service';

@Injectable()
export class AuthGuard implements CanActivate {
  @InjectModel(User.name) private userModel: Model<User>;
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const token = request.cookies[ACCESS_TOKEN];

      if (!token) {
        this.logger.error('Token is missing in the request.');
        throw new UnauthorizedException();
      }

      const { sub: userId } = this.tokenService.extractTokenPayload(token);

      const user = await this.userModel.findById(userId);
      if (!user) {
        this.logger.error(
          'User does not exists with respect to the incoming token.',
        );
        throw new UnauthorizedException();
      }

      await this.tokenService.verifyToken(token, user.secret);
      request[USER_KEY] = { id: userId, email: user.email };

      return true;
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}
