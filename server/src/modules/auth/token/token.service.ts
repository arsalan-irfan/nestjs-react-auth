import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import { Inject, Injectable, Logger } from '@nestjs/common';

import jwtConfig from './jwt.config';
import { RefreshToken } from './refresh-token.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TokenPayload } from '../../../module-contracts/auth/interface/token-payload.interface';

@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  @InjectModel(RefreshToken.name)
  private refreshTokenModel: Model<RefreshToken>;

  @Inject(jwtConfig.KEY)
  private readonly jwtConfiguration: ConfigType<typeof jwtConfig>;

  constructor(private readonly jwtService: JwtService) {}

  async createToken(
    payload: TokenPayload,
    userSecret: string,
    tokenType: 'access' | 'refresh',
  ): Promise<string> {
    const { secret, accessTokenTtl, refreshTokenTtl } = this.jwtConfiguration;

    const tokenOptions = {
      secret: secret + userSecret,
      expiresIn: tokenType === 'access' ? accessTokenTtl : refreshTokenTtl,
    };

    const token = await this.jwtService.signAsync(payload, tokenOptions);
    if (tokenType === 'refresh') {
      await this.refreshTokenModel.deleteOne({ userId: payload.sub });
      const refreshTokenModel = await new this.refreshTokenModel({
        userId: payload.sub,
        refreshToken: token,
      });
      await refreshTokenModel.save();
    }

    return token;
  }

  async invalidateRefreshToken(userId: string): Promise<void> {
    await this.refreshTokenModel.deleteMany({ userId });
  }

  async isRefreshTokenValid(
    refreshToken: string,
    userId: string,
    userSecret: string,
  ): Promise<boolean> {
    const tokenExists = await this.refreshTokenModel.findOne({
      refreshToken,
      userId,
    });

    if (!tokenExists) return false;

    try {
      await this.verifyToken(refreshToken, userSecret);
    } catch (error) {
      return false;
    }

    return true;
  }

  async verifyToken(token: string, userSecret: string): Promise<void> {
    try {
      const { secret } = this.jwtConfiguration;
      await this.jwtService.verifyAsync(token, {
        secret: secret + userSecret,
      });
    } catch (error) {
      this.logger.error(error, 'Token verification - Failed');
      throw error;
    }
  }

  extractTokenPayload(token: string): TokenPayload {
    const payload = this.jwtService.decode(token) as TokenPayload;

    return payload;
  }
}
