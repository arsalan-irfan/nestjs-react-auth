import { Request, Response } from 'express';
import * as crypto from 'crypto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { SanitizeMongooseModelInterceptor } from 'nestjs-mongoose-exclude';
import { AuthService } from './auth.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { SignInDto } from '../../module-contracts/auth/dto/sign-in.dto';
import { SignUpDto } from '../../module-contracts/auth/dto/sign-up.dto';
import {
  ACCESS_TOKEN,
  REFRESH_TOKEN,
  SESSION_ID,
} from '../../module-contracts/auth/constants/auth.constants';
import { BasicUserIdentity } from '../../module-contracts/auth/decorators/user-identity.decorator';
import { UserIdentity } from '../../module-contracts/auth/interface/user-identity.interface';
import { TokenResponse } from '../../module-contracts/auth/interface/token-response.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private readonly cookieOptions = {
    secure: true,
    httpOnly: true,
    sameSite: true,
  };
  private clearCookiesInResponse(response: Response) {
    response
      .clearCookie(ACCESS_TOKEN)
      .clearCookie(REFRESH_TOKEN)
      .clearCookie(SESSION_ID)
      .send();
  }

  private setTokenInResponseCookies(
    response: Response,
    { accessToken, refreshToken }: TokenResponse,
  ) {
    response
      .cookie(ACCESS_TOKEN, accessToken, this.cookieOptions)
      .cookie(REFRESH_TOKEN, refreshToken, this.cookieOptions)
      .cookie(SESSION_ID, crypto.randomBytes(20).toString('hex'))
      .send();
  }

  @Post('/sign-up')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new SanitizeMongooseModelInterceptor())
  async signUp(
    @Res({ passthrough: true }) response: Response,
    @Body() signUpDto: SignUpDto,
  ) {
    const { accessToken, refreshToken } = await this.authService.signUp(
      signUpDto,
    );

    return this.setTokenInResponseCookies(response, {
      accessToken,
      refreshToken,
    });
  }

  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new SanitizeMongooseModelInterceptor())
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() signInDto: SignInDto,
  ) {
    const tokens = await this.authService.signIn(signInDto);

    return this.setTokenInResponseCookies(response, tokens);
  }

  @Post('/sign-out')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new SanitizeMongooseModelInterceptor())
  async signOut(
    @Res({ passthrough: true }) response: Response,
    @BasicUserIdentity() userIdentity: UserIdentity,
  ) {
    if (userIdentity) {
      await this.authService.signOut(userIdentity.id);
    }
    return this.clearCookiesInResponse(response);
  }
  @Post('/clear-session')
  @HttpCode(HttpStatus.OK)
  async clearSession(@Res({ passthrough: true }) response: Response) {
    return this.clearCookiesInResponse(response);
  }

  @Post('/refresh-tokens')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(new SanitizeMongooseModelInterceptor())
  async refreshTokens(
    @Res({ passthrough: true }) response: Response,
    @Req() request: Request,
  ) {
    const refreshToken = request.cookies[REFRESH_TOKEN];

    if (!refreshToken) throw new UnauthorizedException();
    try {
      const tokens = await this.authService.refreshTokens(refreshToken);
      return this.setTokenInResponseCookies(response, tokens);
    } catch (error) {
      response.status(403);
      return this.clearCookiesInResponse(response);
    }
  }

  @Get('/me')
  @UseGuards(AuthGuard)
  @UseInterceptors(new SanitizeMongooseModelInterceptor())
  async me(@BasicUserIdentity() userIdentity: UserIdentity) {
    return this.authService.me(userIdentity.id);
  }
}
