import prisma from '#/common/db/prisma/prisma.client';
import lookup from '../services/helper/lookup-creator.service';

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

  async getUserLookup(arr: any[]) {
    // Extract unique user IDs from createdBy and updatedBy fields
    const userIds = new Set<number>();
    arr.forEach((el) => {
      // Add unique user IDs to the set: createdBy, updatedBy, disabledBy, userId
      if (el.createdBy) userIds.add(el.createdBy);
      if (el.updatedBy) userIds.add(el.updatedBy);
      if (el.disabledBy) userIds.add(el.disabledBy);
      if (el.userId) userIds.add(el.userId);
    });

    // Fetch user details from Prisma based on the unique IDs
    const users = await this.getUsersByIds(Array.from(userIds));

    // Create a lookup object for user details
    const userLookup = lookup.createById(users);

    return userLookup;
  }
}

const userRepository = new UserRepository();
export default userRepository;
