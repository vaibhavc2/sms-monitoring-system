import zodErrors from '#/common/utils/zod-errors.util';
import * as z from 'zod';

const Create = z.object({
  body: z.object({
    programId: z.string({ required_error: zodErrors.required('programId') }),
    countryOperatorPairId: z.string({
      required_error: zodErrors.required('countryOperatorPairId'),
    }),
    name: z
      .string({ required_error: zodErrors.required('name') })
      .min(3, { message: zodErrors.minString('name', 3) }),
  }),
});

export const ProgramSessionSchema = {
  Create,
};
