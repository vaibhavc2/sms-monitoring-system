import ApiResponse from '#/common/utils/api-response.util';
import { wrapAsyncMethodsOfClass } from '#/common/utils/async-errors.util';
import { Request, Response } from 'express';
import programService from '../services/program.service';
import { ProgramDTO } from '../entities/dtos/program.dto';

class ProgramController {
  async upload(req: Request, res: Response) {
    const { name, description } = req.body as {
      name: string;
      description: string;
    };

    const fileName = req.originalFileName as string;

    const { message, data } =
      (await programService.upload({
        name,
        description,
        fileName,
        userId: Number(req.user?.id),
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }
}

const programController = wrapAsyncMethodsOfClass(new ProgramController());
export default programController;
