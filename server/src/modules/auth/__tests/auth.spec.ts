import { HttpStatus, INestApplication } from '@nestjs/common';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, Model } from 'mongoose';
import * as request from 'supertest';

import { SignInDto } from '../../../module-contracts/auth/dto/sign-in.dto';
import { SignUpDto } from '../../../module-contracts/auth/dto/sign-up.dto';
import { RefreshToken } from '../token/refresh-token.schema';
import { testModule } from './fixtures/test-module.fixture';
const extractRefreshTokenFromCookie = (refreshTokenCookie: string): string => {
  const cookiePairs = refreshTokenCookie.split('; ');

  let refreshToken;

  for (const cookiePair of cookiePairs) {
    const [key, value] = cookiePair.split('=');
    if (key === 'refreshToken') {
      refreshToken = value;
      break;
    }
  }

  return refreshToken;
};

const signupUser = async (
  app: INestApplication,
  { email, password, name }: { email: string; name: string; password: string },
) => {
  const signUpDto = new SignUpDto();

  signUpDto.email = email;
  signUpDto.name = name;
  signUpDto.password = password;

  return request(app.getHttpServer()).post('/auth/sign-up').send(signUpDto);
};

const signIn = async (
  app: INestApplication,
  { email, password }: { email: string; password: string },
) => {
  const signUpDto = new SignInDto();

  signUpDto.email = email;
  signUpDto.password = password;

  return request(app.getHttpServer()).post('/auth/sign-in').send(signUpDto);
};

const getCurrentUserData = async (app: INestApplication) => {
  await signupUser(app, {
    email: 'test@test.com',
    password: '@bcd1234',
    name: 'test-user',
  });
  const loginResponse = await signIn(app, {
    email: 'test@test.com',
    password: '@bcd1234',
  });
  const cookies: string[] = loginResponse.headers[
    'set-cookie'
  ] as unknown as string[];

  return request(app.getHttpServer())
    .get('/auth/me')
    .set('Cookie', cookies)
    .send();
};

const signOut = async (app: INestApplication, loginCookies: string[]) => {
  return request(app.getHttpServer())
    .post('/auth/sign-out')
    .set('Cookie', loginCookies)
    .send();
};

describe('Auth Service integration tests', () => {
  let refreshTokenModel: Model<RefreshToken>;
  let dbServer: MongoMemoryServer;
  let db: Connection;

  let app: INestApplication;

  beforeAll(async () => {
    const testModuleRef = await testModule();
    app = testModuleRef.app;
    db = testModuleRef.db;
    dbServer = testModuleRef.dbServer;
    refreshTokenModel = testModuleRef.refreshTokenModel;
    await app.init();
  });

  afterAll(async () => {
    await db.dropDatabase();
    await db.close();
    await dbServer.stop();
  });

  afterEach(async () => {
    const collections = db.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  });

  describe('SignUp API validations', () => {
    it.each`
      email              | password        | message
      ${''}              | ${'@bcde12345'} | ${'email should not be empty'}
      ${'invalidEmail'}  | ${'@bcde12345'} | ${'email must be an email'}
      ${'test'}          | ${'@bcde12345'} | ${'email must be an email'}
      ${'test.com'}      | ${'@bcde12345'} | ${'email must be an email'}
      ${'test@test'}     | ${'@bcde12345'} | ${'email must be an email'}
      ${'test@test.com'} | ${'87654321'}   | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'abcdefgh'}   | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'12345678'}   | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'!@#$%^&*'}   | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'987654'}     | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'abcdef'}     | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'12345'}      | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'^&*$%'}      | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'av334521'}   | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'short'}      | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'1234'}       | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
    `(
      'should throw "$message" when email is: "$email" and password is: "$password"',
      async ({ email, password, message }) => {
        const response = await signupUser(app, {
          email,
          password,
          name: 'John Doe',
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(message);
      },
    );
  });

  describe('SignUp User flow', () => {
    it('should successfully sign in and return 200 with valid user details', async () => {
      const response = await signupUser(app, {
        email: 'test@test.com',
        password: '@bcd1234',
        name: 'test-user',
      });
      expect(response.status).toBe(200);
    });

    it('should throw "User already exists!" with status:  409 when user already exists.', async () => {
      const user = {
        email: 'test@test.com',
        password: '@bcd1234',
        name: 'test-user',
      };
      // create the user first time!
      await signupUser(app, user);

      // create same user again
      const response = await signupUser(app, user);

      expect(response.status).toBe(HttpStatus.CONFLICT);
      expect(response.body.message).toContain('User already exists!');
    });

    it('should successfully set accessToken & refreshToken in the cookies after successful signup', async () => {
      const response = await signupUser(app, {
        email: 'test@test.com',
        password: '@bcd1234',
        name: 'test-user',
      });
      const cookies: string[] = response.headers[
        'set-cookie'
      ] as unknown as string[];
      const accessTokenExist = cookies.some((c) => c.includes('accessToken'));
      const refreshTokenExists = cookies.some((c) =>
        c.includes('refreshToken'),
      );

      expect(accessTokenExist).toBeTruthy();
      expect(refreshTokenExists).toBeTruthy();
    });
  });

  describe('SignIn API validations', () => {
    it.each`
      email              | password        | message
      ${''}              | ${'@bcde12345'} | ${'email should not be empty'}
      ${'invalidEmail'}  | ${'@bcde12345'} | ${'email must be an email'}
      ${'test'}          | ${'@bcde12345'} | ${'email must be an email'}
      ${'test.com'}      | ${'@bcde12345'} | ${'email must be an email'}
      ${'test@test'}     | ${'@bcde12345'} | ${'email must be an email'}
      ${'test@test.com'} | ${'87654321'}   | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'abcdefgh'}   | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'12345678'}   | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'!@#$%^&*'}   | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'987654'}     | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'abcdef'}     | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'12345'}      | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'^&*$%'}      | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'av334521'}   | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'short'}      | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
      ${'test@test.com'} | ${'1234'}       | ${'Password should contain atleast 1 letter, 1 number and 1 special character'}
    `(
      'should throw "$message" when email is: "$email" and password is: "$password"',
      async ({ email, password, message }) => {
        const response = await signIn(app, {
          email,
          password,
        });
        expect(response.status).toBe(400);
        expect(response.body.message).toContain(message);
      },
    );
  });

  describe('Signin User flow', () => {
    const testUserCreds = {
      email: 'test@test.com',
      password: '@bcd1234',
      name: 'test-user',
    };

    beforeEach(async () => {
      await signupUser(app, testUserCreds);
    });

    it('should successfully login in and return 200 with valid user details', async () => {
      const response = await signIn(app, {
        email: testUserCreds.email,
        password: testUserCreds.password,
      });
      expect(response.status).toBe(200);
    });

    it('should throw 401 with message "Invalid credentials!', async () => {
      const response = await signIn(app, {
        email: 'unknowuser@mail.com',
        password: '@bcd1234',
      });
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid credentials!');
    });

    it('should successfully set the accessToken & refreshToken when the user is signing in with correct details', async () => {
      const response = await signIn(app, {
        email: testUserCreds.email,
        password: testUserCreds.password,
      });
      const cookies: string[] = response.headers[
        'set-cookie'
      ] as unknown as string[];
      const accessTokenExist = cookies.some((c) => c.includes('accessToken'));
      const refreshTokenExists = cookies.some((c) =>
        c.includes('refreshToken'),
      );

      expect(accessTokenExist).toBeTruthy();
      expect(refreshTokenExists).toBeTruthy();
    });
  });

  describe('Api Authorization & Sanitization', () => {
    it('should throw 403 -  Unauthorized when calling `me` route without auth.', async () => {
      const response = await request(app.getHttpServer()).get('/auth/me');
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return 200 when calling `me` route after successful auth', async () => {
      const response = await getCurrentUserData(app);
      expect(response.status).toBe(200);
    });

    it('should not contain password & secret when calling `me` route after successful auth', async () => {
      const response = await getCurrentUserData(app);
      expect(response.status).toBe(200);

      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('secret');
    });

    it('should contain email & name when calling `me` after successful auth', async () => {
      const response = await getCurrentUserData(app);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('email');
    });
  });

  describe('Refresh Token Mechanism', () => {
    it('should add a valid refreshToken in the database after successful auth', async () => {
      const testUserCreds = {
        email: 'test@test.com',
        password: '@bcd1234',
        name: 'test-user',
      };
      const signupResponse = await signupUser(app, testUserCreds);
      const cookies: string[] = signupResponse.headers[
        'set-cookie'
      ] as unknown as string[];

      const refreshTokenCookie = cookies.find((c) =>
        c.includes('refreshToken'),
      );
      if (refreshTokenCookie) {
        const token = extractRefreshTokenFromCookie(refreshTokenCookie);
        const refreshTokenExists = await refreshTokenModel.findOne({
          refreshToken: token,
        });

        expect(refreshTokenExists).not.toBe(null);
      }
    });
  });

  describe('Sign Out Process', () => {
    it('should successfully clear accessToken & refreshToken after signing out', async () => {
      const testUserCreds = {
        email: 'test@test.com',
        password: '@bcd1234',
        name: 'test-user',
      };

      await signupUser(app, testUserCreds);
      const loginResponse = await signIn(app, {
        email: testUserCreds.email,
        password: testUserCreds.password,
      });
      const loginCookies: string[] = loginResponse.headers[
        'set-cookie'
      ] as unknown as string[];

      const response = await signOut(app, loginCookies);
      const responseCookies: string[] = response.headers[
        'set-cookie'
      ] as unknown as string[];
      expect(response.status).toBe(200);
      expect(responseCookies.some((c) => c.includes('accessToken=;'))).toBe(
        true,
      );
      expect(responseCookies.some((c) => c.includes('refreshToken=;'))).toBe(
        true,
      );
      expect(responseCookies.some((c) => c.includes('session-id=;'))).toBe(
        true,
      );
    });
  });
});
