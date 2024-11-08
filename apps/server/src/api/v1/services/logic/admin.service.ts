import cipherService from '../helper/cipher.service';
import prisma from '#/common/db/prisma/prisma.client';
import { Role } from '@prisma/client';
import ApiError from '#/common/utils/api-error.util';
import { AdminDTO } from '../../entities/dtos/admin.dto';
import ct from '#/common/constants';

class AdminService {
  async changeRole({ userId, role, currentUserId }: AdminDTO.ChangeRole) {
    // check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw ApiError.notFound('User not found');

    // check if role is valid
    if (!Object.values(Role).includes(role))
      throw ApiError.badRequest('Invalid role');

    // check if user is already same role
    if (user.role === role)
      throw ApiError.badRequest('User is already same role');

    // update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        ...(role === Role.admin && {
          promotedBy: currentUserId,
          promotedAt: new Date(),
        }),
        ...(role === Role.user && {
          demotedBy: currentUserId,
          demotedAt: new Date(),
        }),
      },
    });

    if (!updatedUser) throw ApiError.internal('Failed to update user role');

    return {
      data: {
        user: {
          ...updatedUser,
          id: cipherService.encodeId(updatedUser.id),
        },
      },
      message: 'User role updated successfully',
    };
  }

  async getRoles() {
    return {
      data: {
        roles: Object.values(Role),
      },
      message: 'Roles fetched successfully',
    };
  }

  async disableUser({
    userId,
    currentUserId,
    disabledReason,
  }: AdminDTO.DisableUser) {
    // check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw ApiError.notFound('User not found');

    // check if user is already disabled
    if (user.disabled) throw ApiError.badRequest('User is already disabled');

    // disable user
    const disabledUser = await prisma.user.update({
      where: { id: userId },
      data: {
        disabled: true,
        disabledBy: currentUserId,
        disabledAt: new Date(),
        disabledReason: disabledReason || ct.defaultMessages.disabledReason,
      },
    });

    if (!disabledUser) throw ApiError.internal('Failed to disable user');

    return {
      data: {
        user: {
          ...disabledUser,
          id: cipherService.encodeId(disabledUser.id),
        },
      },
      message: 'User disabled successfully',
    };
  }

  async enableUser({
    userId,
    currentUserId,
    enabledReason,
  }: AdminDTO.EnableUser) {
    // check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw ApiError.notFound('User not found');

    // check if user is already enabled
    if (!user.disabled) throw ApiError.badRequest('User is already enabled');

    // enable user
    const enabledUser = await prisma.user.update({
      where: { id: userId },
      data: {
        disabled: false,
        enabledBy: currentUserId,
        enabledAt: new Date(),
        enabledReason: enabledReason || ct.defaultMessages.enabledReason,
      },
    });

    if (!enabledUser) throw ApiError.internal('Failed to enable user');

    return {
      data: {
        user: {
          ...enabledUser,
          id: cipherService.encodeId(enabledUser.id),
        },
      },
      message: 'User enabled successfully',
    };
  }

  async getUsers() {
    const users = await prisma.user.findMany();

    return {
      data: {
        users: users.map((user) => ({
          ...user,
          id: cipherService.encodeId(user.id),
        })),
      },
      message: 'Users fetched successfully',
    };
  }

  async getPaginatedUsers({
    query,
    sortType,
    sortBy,
    page,
    limit,
  }: AdminDTO.GetPaginatedUsers) {
    const users = await prisma.user.findMany({
      where: query
        ? {
            OR: [
              {
                name: {
                  contains: query.trim(),
                  // mode: 'insensitive', // not supported in mysql, use ci collation instead like utf8mb4_0900_ai_ci
                },
              },
              {
                email: {
                  contains: query.trim(),
                  // mode: 'insensitive', // not supported in mysql, use ci collation instead like utf8mb4_0900_ai_ci
                },
              },
            ],
          }
        : {},
      orderBy: {
        [sortBy || 'createdAt']: sortType || 'desc',
      },
      skip: ((page || 1) - 1) * (limit || 10),
      take: limit,
    });

    if (!users.length) throw ApiError.notFound('No users found');

    return {
      data: {
        users: users.map((user) => ({
          ...user,
          id: cipherService.encodeId(user.id),
        })),
      },
      message: 'Users fetched successfully',
    };
  }

  async getUser({ userId }: { userId: number }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw ApiError.notFound('User not found');

    return {
      data: {
        user: {
          ...user,
          id: cipherService.encodeId(user.id),
        },
      },
      message: 'User fetched successfully',
    };
  }
}

const adminService = new AdminService();
export default adminService;
