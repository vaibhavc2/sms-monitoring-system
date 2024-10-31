import zodErrors from '#/common/utils/zod-errors.util';
import { z } from 'zod';

export const Name = z.object({
  body: z.object({
    name: z
      .string({ required_error: zodErrors.required('name') })
      .min(3, { message: zodErrors.minString('name', 3) })
      .max(30, { message: zodErrors.largeString('name', 30) }),
  }),
});
