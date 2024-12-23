import { UserDTO, UserWithoutPassword } from '#/api/v1/entities/dtos/user.dto';
import { JWT_TOKENS } from '#/api/v1/entities/enums/jwt.tokens';
import envConfig from '#/common/config/env.config';
import prisma from '#/common/db/prisma/prisma.client';
import cacheService from '#/api/v1/services/helper/cache.service';
import jwtService from '#/api/v1/services/helper/jwt.service';
import otpService from '#/api/v1/services/helper/otp.service';
import pwdService from '#/api/v1/services/helper/password.service';
import redisService, { redis } from '#/api/v1/services/helper/redis.service';
import ApiError from '#/common/utils/api-error.util';
import { convertTimeStr } from '#/common/utils/time.util';
import { StandardResponseDTO } from '#/types';
import emailService from '../helper/email.service';
import { v4 as uuidv4 } from 'uuid';
import cipherService from '../helper/cipher.service';

const { ACCESS_TOKEN_EXPIRY } = envConfig;

class UserService {
  private async generateActivationTokenAndSendEmail(email: string) {
    // Generate OTP code
    const otpCode = otpService.generateSecureOTP(6).string;

    // Generate activation token and upload to Redis
    const activationToken = await jwtService.generateActivationToken(
      {
        email,
        otpCode,
      },
      { upload: true },
    );

    if (!activationToken) throw ApiError.internal('Failed to generate token!');

    // Send verification email
    const emailResponse = await emailService.sendVerificationEmail({
      email,
      verificationCode: otpCode,
    });

    if (!emailResponse)
      throw ApiError.internal('Failed to send email! Please try again.');

    return true;
  }

  async register({ name, email, password }: UserDTO.Register) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Check if user already exists
    if (existingUser)
      throw ApiError.badRequest('User already exists! Please login.');

    // generate activation token and send email
    if (!(await this.generateActivationTokenAndSendEmail(email)))
      throw ApiError.internal('Internal Error! Please try again.');

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password, // password is hashed by middleware
      },
    });

    if (!user)
      throw ApiError.internal('Failed to create user. Please try again.');

    // Omit password from response
    const { password: _, ...userData } = user;

    // Set cache for password
    await cacheService.set(
      redisService.createKey('PASSWORD', user.id, uuidv4()),
      password, // password is hashed by middleware
      3600 * 24 * 7, // 7 days
    );

    return {
      message:
        'Registration successful! Please check your email to activate your account.',
      data: {
        user: {
          ...userData,
          id: cipherService.encodeId(user.id),
        },
      },
    };
  }

  async login({ email, password, deviceId }: UserDTO.Login) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) throw ApiError.badRequest('User not found! Please register.');

    // Check if password is correct
    const isPasswordCorrect = await pwdService.verify(user.password, password);

    if (!isPasswordCorrect)
      throw ApiError.badRequest('Invalid password! Please try again.');

    // Check if user is verified
    if (!user.isVerified)
      throw ApiError.forbidden('Please verify your email first!');

    // Generate access and refresh tokens, and upload refresh token
    const { accessToken, refreshToken } =
      await jwtService.generateAccessAndRefreshTokens(
        {
          userId: user.id,
          deviceId,
        },
        { upload: true },
      );

    const { password: _, ...userData } = user;

    return {
      message: 'User logged in successfully!',
      data: {
        user: {
          ...userData,
          id: cipherService.encodeId(user.id),
        },
        tokens: { accessToken, refreshToken },
      },
    };
  }

  async sendVerificationEmail({ email }: UserDTO.SendVerificationEmail) {
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        email: true,
        isVerified: true,
      },
    });

    if (!user) throw ApiError.badRequest('User not found! Please register.');

    // Check if user is already verified
    if (user.isVerified)
      throw ApiError.badRequest('User already verified! Please login.');

    // generate activation token and send email
    if (!(await this.generateActivationTokenAndSendEmail(email)))
      throw ApiError.internal('Internal Error! Please try again.');

    return {
      message: 'Verification email sent successfully!',
      data: { email: user.email },
    };
  }

  async verify({ email, otpCode }: UserDTO.Verify) {
    // Get activation token from Redis
    const activationTokenKey = redisService.createKey('ACTIVATION', email);
    const activationToken = await redis.get(activationTokenKey);

    if (!activationToken)
      throw ApiError.badRequest('Activation token expired! Please try again.');

    // Verify activation token
    const {
      email: tokenEmail,
      otpCode: tokenOtpCode,
      type,
    } = (await jwtService.verifyActivationToken(activationToken)) ?? {};

    if (!tokenEmail || !tokenOtpCode || type !== JWT_TOKENS.ACTIVATION)
      throw ApiError.badRequest('Invalid activation token! Please try again.');

    // Check if email and OTP code match
    if (email !== tokenEmail) throw ApiError.badRequest('Invalid email!');
    if (otpCode !== String(tokenOtpCode))
      throw ApiError.badRequest('Invalid OTP code! Please try again.');

    // Update user verification status
    const user = await prisma.user.update({
      where: {
        email,
      },
      data: {
        isVerified: true,
      },
    });

    if (!user)
      throw ApiError.internal('Failed to verify user! Please try again.');

    // Delete activation token from Redis
    await redis.del(activationTokenKey);

    // Omit password from response
    const { password: _, ...userData } = user;

    return {
      message: 'User verified successfully!',
      data: {
        user: {
          ...userData,
          id: cipherService.encodeId(user.id),
        },
      },
    };
  }

  async refresh({ deviceId, refreshToken }: UserDTO.Refresh) {
    // Verify refresh token
    const { userId, type } =
      (await jwtService.verifyRefreshToken(refreshToken)) ?? {};

    if (!userId || type !== JWT_TOKENS.REFRESH)
      throw ApiError.unauthorized('Invalid token! Please login.');

    // Check if session exists in Redis
    const token = await redis.get(
      redisService.createKey('REFRESH_TOKEN', userId, deviceId),
    );

    if (!token) throw ApiError.unauthorized('Invalid session! Please login.');

    // Check if refresh token matches
    if (token !== refreshToken)
      throw ApiError.unauthorized('Invalid token! Please login.');

    // Generate new access token, refresh token, and upload refresh token
    const { accessToken, refreshToken: newRefreshToken } =
      await jwtService.generateAccessAndRefreshTokens(
        { userId, deviceId },
        { upload: true },
      );

    return {
      message: 'Token refreshed successfully!',
      data: { tokens: { accessToken, refreshToken: newRefreshToken } },
    };
  }

  async getUserInfo({ user }: UserDTO.GetUserInfo) {
    // Return cached data if exists
    return {
      message: 'User Info fetched successfully!',
      data: {
        user: {
          ...user,
          id: cipherService.encodeId(Number(user.id)),
        },
      },
    };
  }

  async updateUserInfo({
    userId,
    name,
    email,
    prevEmail,
    prevName,
  }: UserDTO.UpdateUserInfo) {
    // basic validation
    if (!name && !email)
      throw ApiError.badRequest('No data provided to update user info!');

    if (email && email === prevEmail) {
      // update only name
      if (!name || name === prevName)
        throw ApiError.badRequest('Already up to date!');

      // Update user info
      const user = await prisma.user.update({
        where: {
          id: Number(userId),
        },
        data: {
          name,
        },
      });

      if (!user)
        throw ApiError.internal(
          'Failed to update user info! Please try again.',
        );

      // Omit password from response
      const { password, ...userData } = user;

      return {
        message: 'User info updated successfully!',
        data: {
          user: {
            ...userData,
            id: cipherService.encodeId(user.id),
          },
        },
      };
    }

    // update name or email
    // check if name sent is same as previous name
    if (name && name === prevName)
      throw ApiError.badRequest('Name already up to date!');

    // check if email already exists in db
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser)
      throw ApiError.badRequest('User with this email already exists!');

    // Update user info
    const user = await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        name,
        email,
      },
    });

    if (!user)
      throw ApiError.internal('Failed to update user info. Please try again.');

    // Omit password from response
    const { password, ...userData } = user;

    return {
      message: 'User info updated successfully!',
      data: {
        user: {
          ...userData,
          id: cipherService.encodeId(user.id),
        },
      },
    };
  }

  async changePassword({
    userId,
    currentPassword,
    newPassword,
  }: UserDTO.ChangePassword) {
    // find user
    const user = await prisma.user.findUnique({
      where: {
        id: Number(userId),
      },
      select: { password: true },
    });

    if (!user) throw ApiError.notFound('User not found!');

    // Check if current password is correct
    const isPasswordCorrect = await pwdService.verify(
      user.password,
      currentPassword,
    );

    if (!isPasswordCorrect)
      throw ApiError.badRequest('Invalid current password! Please try again.');

    // Check against the cache-stored passwords
    const prevPasswords = await redis.mget(
      redisService.createKey('PASSWORD', userId, '*'),
    );

    if (prevPasswords && prevPasswords.length) {
      // match all against the current password
      prevPasswords.forEach(async (pwd) => {
        const isMatch = await pwdService.verify(String(pwd), currentPassword);
        if (isMatch)
          throw ApiError.badRequest(
            'Password already used recently! Please try a different one.',
          );
      });
    }

    // Update user password
    const updatedUser = await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        password: newPassword, // password is hashed by Prisma hook
      },
    });

    if (!updatedUser)
      throw ApiError.internal('Failed to update password. Please try again.');

    // Set cache for password
    await cacheService.set(
      redisService.createKey('PASSWORD', userId, uuidv4()),
      await pwdService.hash(newPassword),
      3600 * 24 * 7, // 7 days
    );

    return {
      message: 'Password updated successfully!',
      data: null,
    };
  }

  async logout({ deviceId, userId }: UserDTO.Logout) {
    // Delete refresh token from Redis
    await redis.del(redisService.createKey('REFRESH_TOKEN', userId, deviceId));

    return {
      message: 'Logged out successfully!',
      data: null,
    };
  }

  async logoutAllDevices({ userId }: UserDTO.LogoutAllDevices) {
    // Delete all sessions of user from Redis
    await redisService.deleteKeysByPattern(
      redisService.createKeyPattern('REFRESH_TOKEN', userId, '*'),
    );

    // Store the current timestamp in Redis (to invalidate access tokens)
    await redis.setex(
      redisService.createKey('INVALIDATED', userId),
      convertTimeStr(ACCESS_TOKEN_EXPIRY), // expiry time
      (Date.now() / 1000).toString(), // value
    );

    return {
      message: 'Logged out from all devices successfully!',
      data: null,
    };
  }
}

const userService = new UserService();
export default userService;
