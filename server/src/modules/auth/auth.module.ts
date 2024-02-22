import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule, JwtService } from '@nestjs/jwt';

import jwtConfig from './token/jwt.config';
import { TokenService } from './token/token.service';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RefreshToken, RefreshTokenSchema } from './token/refresh-token.schema';
import { User, UserSchema } from '../user/schemas/user.schema';
import { HashingService } from './helper/hashing.service';

@Module({
  imports: [
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [HashingService, AuthService, JwtService, TokenService],
})
export class AuthModule {}
