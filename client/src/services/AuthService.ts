import { AxiosError } from 'axios';
import HttpClient from '../HttpClient';

export interface SignUpDto {
  name: string;
  email: string;
  password: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface MeResponse {
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

class AuthService {
  private readonly baseUrl = '/auth';
  async signUp(body: SignUpDto): Promise<void> {
    try {
      await HttpClient.post(`${this.baseUrl}/sign-up`, body, {
        headers: {
          noAuth: true,
        },
      });
    } catch (error) {
      throw (error as AxiosError).response?.data;
    }
  }

  async signIn(body: SignInDto): Promise<void> {
    try {
      await HttpClient.post(`${this.baseUrl}/sign-in`, body, {
        headers: {
          noAuth: true,
        },
      });
    } catch (error) {
      throw (error as AxiosError).response?.data;
    }
  }

  async signOut(): Promise<void> {
    try {
      await HttpClient.post(`${this.baseUrl}/sign-out`);
    } catch (error) {
      throw (error as AxiosError).response?.data;
    }
  }

  async me(): Promise<MeResponse> {
    try {
      const response = await HttpClient.get<MeResponse>(`${this.baseUrl}/me`);

      return response.data;
    } catch (error) {
      throw (error as AxiosError).response?.data;
    }
  }
}

export const authService = new AuthService();
