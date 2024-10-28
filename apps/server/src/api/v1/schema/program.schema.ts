import zodErrors from '#/common/utils/zod-errors.util';
import { z } from 'zod';

const Upload = z.object({
  body: z.object({
    name: z
      .string({ required_error: zodErrors.required('Name') })
      .min(3, { message: zodErrors.minString('Name', 3) })
      .max(30, { message: zodErrors.largeString('Name', 30) })
      .regex(/^[a-zA-Z\s]*$/, {
        message: 'Name can only contain: letters and spaces.',
      }),
  }),
});

export const ProgramSchema = {
  Upload,
};