import ApiError from '#/common/utils/api-error.util';
import { asyncErrorHandler } from '#/common/utils/async-errors.util';
import { getErrorMessage } from '#/common/utils/error-extras.util';
import zodErrors from '#/common/utils/zod-errors.util';
import { NextFunction, Request, Response } from 'express';
import { AnyZodObject, ZodError } from 'zod';

class ValidationMiddleware {
  requiredFields = (fields: string[]) =>
    asyncErrorHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        const missingFields = [];
        const keys = Object.keys(req.body); // Included fields

        // Checks if every required field is in the body
        for (const field of fields)
          if (!keys.includes(field)) missingFields.push(field);

        // If there are missing fields then run next error middleware
        if (missingFields.length) {
          return next(ApiError.badRequest(zodErrors.required(missingFields)));
        }

        // If no missing fields then run router code
        return next();
      },
    );

  zod = (schema: AnyZodObject) =>
    // validate the request body, query, params, and headers against the schema
    asyncErrorHandler(
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
            headers: req.headers,
          });

          return next();
        } catch (error: unknown) {
          if (error instanceof ZodError) {
            next(
              ApiError.custom(
                400,
                `${error.issues.map((issue) => issue.message).join(' ')}`,
              ),
            );
          } else {
            next(ApiError.custom(400, `${getErrorMessage(error)}`));
          }
        }
      },
    );
}

const validation = new ValidationMiddleware();
export default validation;
