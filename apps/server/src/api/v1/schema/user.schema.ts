import zodErrors from '#/common/utils/zod-errors.util';
import * as z from 'zod';

const Register = z.object({
  body: z.object({
    name: z
      .string({ required_error: zodErrors.required('Name') })
      .min(3, { message: zodErrors.minString('Name', 3) })
      .max(30, { message: zodErrors.largeString('Name', 30) })
      .regex(/^[a-zA-Z\s]*$/, {
        message: 'Name can only contain: letters and spaces.',
      }),
    email: z
      .string({ required_error: zodErrors.required('Email') })
      .max(255, { message: zodErrors.largeString('Email', 255) })
      .email({ message: 'Enter a valid email.' }),
    password: z
      .string({ required_error: zodErrors.required('Password') })
      .min(6, { message: zodErrors.minString('Password', 6) })
      .max(30, { message: zodErrors.largeString('Password', 30) })
      .regex(/^(?=.*\d)(?=.*\W).*$/, {
        message: 'Password must contain at least a digit, and a symbol.',
      }),
  }),
});

const Login = z.object({
  body: z.object({
    email: Register.shape.body.shape.email,
    password: Register.shape.body.shape.password,
  }),
});

const SendVerificationEmail = z.object({
  body: z.object({
    email: Register.shape.body.shape.email,
  }),
});

const Verify = z.object({
  body: z.object({
    email: Register.shape.body.shape.email,
    otpCode: z
      .string({ required_error: zodErrors.required('OTP Code') })
      .length(6, { message: 'OTP Code must be 6 characters long.' }),
  }),
});

const UpdateUserInfo = z.object({
  body: z.object({
    name: Register.shape.body.shape.name.optional(),
    email: Register.shape.body.shape.email.optional(),
  }),
});

const ChangePassword = z.object({
  body: z.object({
    currentPassword: Register.shape.body.shape.password,
    newPassword: Register.shape.body.shape.password,
  }),
});

export const UserSchema = {
  Register,
  Login,
  SendVerificationEmail,
  Verify,
  UpdateUserInfo,
  ChangePassword,
};
