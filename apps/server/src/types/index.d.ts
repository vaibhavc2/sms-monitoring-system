import { Prisma, User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<User, 'password'>;
      token?: string;
      deviceId?: string;
      // body: {
      //   // Include other properties from req.body you want to type here
      // } & Request['body']; // This ensures we extend the existing body type rather than overwrite it
    }
  }
}

// Other global types
interface StandardResponseDTO<T> {
  message: string;
  status?: number;
  data?: T | null;
}

type RequestCookie = { [key: string]: string };

export { RequestCookie, StandardResponseDTO };
