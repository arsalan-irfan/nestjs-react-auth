import * as crypto from 'crypto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { SignInDto } from '../../module-contracts/auth/dto/sign-in.dto';
import { SignUpDto } from '../../module-contracts/auth/dto/sign-up.dto';
import { User } from '../user/schemas/user.schema';
import { TokenService } from './token/token.service';
import { TokenResponse } from '../../module-contracts/auth/interface/token-response.interface';
import { HashingService } from './helper/hashing.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  @InjectModel(User.name) private userModel: Model<User>;

  constructor(
    private readonly tokenService: TokenService,
    private readonly hashingService: HashingService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<TokenResponse> {
    this.logger.log('Signup process started.');
    const { name, email, password } = signUpDto;

    const userExists = await this.userModel.findOne({ email });
    if (userExists) {
      this.logger.error('User already exists.');
      throw new HttpException('Invalid credentials!', HttpStatus.UNAUTHORIZED);
    }

    const secret = this.generateSecret();
    const salt = await this.hashingService.getSalt();
    const hashedPassword = await this.hashingService.hash(password, salt);
    const user = await new this.userModel({
      name,
      email,
      secret,
      password: hashedPassword,
    });

    await user.save();

    this.logger.log(`User successfully created with id: ${user.id}.`);

    return this.generateTokens(user.id, user.email, user.secret);
  }

  async signIn(signInDto: SignInDto): Promise<TokenResponse> {
    this.logger.log('Sign In process started.');

    const { email, password } = signInDto;

    const user = await this.userModel.findOne({ email });
    if (!user) {
      this.logger.error('Email verification failed.');

      throw new HttpException('Invalid credentials!', HttpStatus.UNAUTHORIZED);
    }

    const isEqual = await this.hashingService.compare(password, user.password);
    if (!isEqual) {
      this.logger.error('Password verification failed.');

      throw new HttpException('Invalid credentials!', HttpStatus.UNAUTHORIZED);
    }

    this.logger.log(`User successfully sign in with id: ${user.id}.`);

    return this.generateTokens(user.id, user.email, user.secret);
  }

  async signOut(userId: string) {
    await this.tokenService.invalidateRefreshToken(userId);
  }

  async refreshTokens(refreshToken: string): Promise<TokenResponse> {
    const { sub } = this.tokenService.extractTokenPayload(refreshToken);

    const user = await this.userModel.findById(sub);

    if (!user) {
      this.logger.error('User verification failed.');

      throw new BadRequestException();
    }

    const isValid = await this.tokenService.isRefreshTokenValid(
      refreshToken,
      user.id,
      user.secret,
    );

    if (!isValid) {
      this.logger.error('Existing Refresh Token verification failed.');
      throw new BadRequestException();
    }

    this.logger.log(`Tokens successfully created.`);

    return this.generateTokens(user.id, user.email, user.secret);
  }

  me(activeUserId: string) {
    return this.userModel.findById(activeUserId);
  }

  private async generateTokens(
    userId: string,
    email: string,
    secret: string,
  ): Promise<TokenResponse> {
    const tokenPayload = { sub: userId, email };
    const accessToken = await this.tokenService.createToken(
      tokenPayload,
      secret,
      'access',
    );
    const refreshToken = await this.tokenService.createToken(
      tokenPayload,
      secret,
      'refresh',
    );

    return { accessToken, refreshToken };
  }

  private generateSecret() {
    const secretBytes = crypto.randomBytes(32);
    const secret = secretBytes.toString('base64');

    return secret;
  }
}
