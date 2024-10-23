import ct from '#/common/constants';
import { convertTimeStr } from './time.util';

export const getCookieOptions = (expiresIn: string) => {
  const expiry = convertTimeStr(expiresIn, true);

  return {
    ...ct.cookieOptions,
    maxAge: expiry,
    expires: new Date(Date.now() + expiry),
  };
};
