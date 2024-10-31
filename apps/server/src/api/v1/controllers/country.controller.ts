import ApiResponse from '#/common/utils/api-response.util';
import { Request, Response } from 'express';
import { wrapAsyncMethodsOfClass } from '#/common/utils/async-errors.util';
import countryService from '../services/logic/country.service';

class CountryController {
  async create(req: Request, res: Response) {
    const { name } = req.body as { name: string };

    const { message, data } = (await countryService.create({ name })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params as { id: string };
    const { name } = req.body as { name: string };

    const { message, data } = (await countryService.update({ id, name })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params as { id: string };

    const { message, data } = (await countryService.delete({ id })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async get(req: Request, res: Response) {
    const { id } = req.params as { id: string };

    const { message, data } = (await countryService.get({ id })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async getAll(req: Request, res: Response) {
    const { message, data } = (await countryService.getAll()) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async search(req: Request, res: Response) {
    const { query } = req.query as { query: string };

    const { message, data } = (await countryService.search({ query })) ?? {};

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
      (await countryService.getPaginatedResults({
        page,
        limit,
        sortBy: 'name',
        sortOrder,
        query,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }
}

const countryController = wrapAsyncMethodsOfClass(new CountryController());
export default countryController;
