import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { HashingService } from '../../helper/hashing.service';
import jwtConfig from '../../token/jwt.config';
import {
  RefreshToken,
  RefreshTokenSchema,
} from '../../token/refresh-token.schema';
import { TokenService } from '../../token/token.service';
import { User, UserSchema } from '../../../user/schemas/user.schema';
import { AuthController } from '../../auth.controller';
import { AuthService } from '../../auth.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model, connect } from 'mongoose';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

export const testModule = async (): Promise<{
  app: INestApplication;
  db: Connection;
  dbServer: MongoMemoryServer;
  refreshTokenModel: Model<RefreshToken>;
}> => {
  const dbServer = await MongoMemoryServer.create();
  const uri = dbServer.getUri();
  const db = (await connect(uri)).connection;
  const userModel = db.model(User.name, UserSchema);
  const refreshTokenModel = db.model(RefreshToken.name, RefreshTokenSchema);
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forFeature(jwtConfig),
      JwtModule.registerAsync(jwtConfig.asProvider()),
      ConfigModule.forRoot({ isGlobal: true, envFilePath: `.env.test` }),
    ],
    controllers: [AuthController],
    providers: [
      JwtService,
      TokenService,
      HashingService,
      AuthService,
      { provide: getModelToken(User.name), useValue: userModel },
      {
        provide: getModelToken(RefreshToken.name),
        useValue: refreshTokenModel,
      },
    ],
  }).compile();
  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  return { app, db, dbServer, refreshTokenModel };
};
