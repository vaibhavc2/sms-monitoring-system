import envConfig from '#/common/config/env.config';

const { isDev } = envConfig;

class ZodError {
  required = (fieldName: string | string[], detailedError: boolean = false) => {
    const errString = 'Please fill in all the required fields!';

    if (isDev || detailedError) {
      if (typeof fieldName === 'string') {
        return `Field '${fieldName}' can't be empty! ${errString}`;
      } else {
        const fields = fieldName.map((field) => {
          field = "'" + field + "'";
          return field;
        });
        return `Fields: ${fields.join(', ')} can't be empty! ${errString}`;
      }
    } else return errString;
  };

  largeString = (fieldName: string, max: number) => {
    return `Field '${fieldName}' must be less than ${max} characters.`;
  };

  minString = (fieldName: string, min: number) => {
    return `Field '${fieldName}' must be atleast ${min} characters.`;
  };
}

const zodErrors = new ZodError();
export default zodErrors;
