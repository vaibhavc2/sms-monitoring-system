import prisma from '#/common/db/prisma/prisma.client';

class UserRepository {
  async getUsersByIds(
    userIds: number[],
    {
      id = true,
      name = true,
      email = true,
      role = true,
      isVerified,
      disabled,
      disabledAt,
    }: {
      id?: boolean;
      name?: boolean;
      email?: boolean;
      role?: boolean;
      isVerified?: boolean;
      disabled?: boolean;
      disabledAt?: boolean;
    } = {},
  ) {
    return await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id,
        name,
        email,
        role,
        isVerified,
        disabled,
        disabledAt,
      },
    });
  }
}

const userRepository = new UserRepository();
export default userRepository;
