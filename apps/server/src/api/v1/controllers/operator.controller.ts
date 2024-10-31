import ApiResponse from '#/common/utils/api-response.util';
import { Request, Response } from 'express';
import { wrapAsyncMethodsOfClass } from '#/common/utils/async-errors.util';
import operatorService from '../services/logic/operator.service';

class OperatorController {
  async create(req: Request, res: Response) {
    const { name } = req.body as { name: string };

    const { message, data } = (await operatorService.create({ name })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const { name } = req.body as { name: string };

    const { message, data } =
      (await operatorService.update({ id, name })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as { id: string };

    const { message, data } = (await operatorService.delete({ id })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async get(req: Request, res: Response) {
    const { id } = req.params as { id: string };

    const { message, data } = (await operatorService.get({ id })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async getAll(req: Request, res: Response) {
    const { message, data } = (await operatorService.getAll()) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async search(req: Request, res: Response) {
    const { query } = req.query as { query: string };

    const { message, data } = (await operatorService.search({ query })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async getPaginatedResults(req: Request, res: Response) {
    const { sortOrder, page, limit, query } = req.query as {
      page: string;
      limit: string;
      sortBy: string;
      sortOrder: string;
      query: string;
    };

    const { message, data } =
      (await operatorService.getPaginatedResults({
        page: page,
        limit: limit,
        sortBy: 'name',
        sortOrder,
        query,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }
}

const operatorController = wrapAsyncMethodsOfClass(new OperatorController());
export default operatorController;
