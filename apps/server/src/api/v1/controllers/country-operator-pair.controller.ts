import ApiResponse from '#/common/utils/api-response.util';
import { Request, Response } from 'express';
import { wrapAsyncMethodsOfClass } from '#/common/utils/async-errors.util';
import { CountryOperatorPairDTO } from '../entities/dtos/country-operator-pair.dto';
import countryOperatorPairService from '../services/logic/country-operator-pair.service';
import ApiError from '#/common/utils/api-error.util';

class CountryOperatorPairController {
  async create(req: Request, res: Response) {
    const { programId, countryId, operatorId } =
      req.body as CountryOperatorPairDTO.Create;

    const { message, data } =
      (await countryOperatorPairService.create({
        programId,
        countryId,
        operatorId,
        userId: Number(req.user?.id),
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const { programId, countryId, operatorId, disabled, highPriority } =
      req.body as CountryOperatorPairDTO.Update;

    const { message, data } =
      (await countryOperatorPairService.update({
        id,
        userId: Number(req.user?.id),
        programId,
        countryId,
        operatorId,
        disabled,
        highPriority,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as { id: string };

    const { message, data } =
      (await countryOperatorPairService.delete({ id })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async get(req: Request, res: Response) {
    const { id } = req.params as { id: string };

    const { message, data } =
      (await countryOperatorPairService.get({ id })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async getDesiredPairs(req: Request, res: Response) {
    const { programId } = req.params as { programId: string };
    const { disabled, highPriority } = req.body as {
      disabled: boolean;
      highPriority: boolean;
    };

    const { message, data } =
      (await countryOperatorPairService.getDesiredPairs({
        programId,
        disabled,
        highPriority,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async searchById(req: Request, res: Response) {
    const { programId, userId, countryId, operatorId } = req.query as {
      programId?: string;
      userId?: string;
      countryId?: string;
      operatorId?: string;
    };

    if (!programId || !userId || !countryId || !operatorId) {
      throw ApiError.badRequest('Invalid or no query parameters');
    }

    const { message, data } =
      (await countryOperatorPairService.searchById({
        query: { programId, userId, countryId, operatorId },
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async getPaginatedResults(req: Request, res: Response) {
    const { sortOrder, limit, sortBy, page } = req.query as {
      page: string;
      limit: string;
      sortBy: string;
      sortOrder: string;
    };

    const { message, data } =
      (await countryOperatorPairService.getPaginatedResults({
        page,
        limit,
        sortBy,
        sortOrder,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }
}

const countryOperatorPairController = wrapAsyncMethodsOfClass(
  new CountryOperatorPairController(),
);
export default countryOperatorPairController;
