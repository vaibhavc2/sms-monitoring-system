import { Prisma, User } from '@prisma/client';

export namespace UserDTO {
  export interface Register {
    email: string;
    password: string;
    name: string;
  }

  export interface Login {
    email: string;
    password: string;
    deviceId: string;
  }

  export interface SendVerificationEmail {
    email: string;
  }

  export interface Verify {
    email: string;
    otpCode: string;
  }

  export interface Logout {
    userId: string | number;
    deviceId: string;
  }

  export interface LogoutAllDevices {
    userId: string | number;
  }

  export interface Refresh {
    deviceId: string;
    refreshToken: string;
  }

  export interface GetProfile {
    userId: string | number;
  }

  export interface UpdateUserInfo {
    userId: string | number;
    name?: string;
    email?: string;
    prevEmail: string;
    prevName: string;
  }

  export interface ChangePassword {
    userId: string | number;
    currentPassword: string;
    newPassword: string;
  }
}

export type UserWithoutPassword = Omit<User, 'password'>;
