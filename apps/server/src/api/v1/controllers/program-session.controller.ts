import ApiResponse from '#/common/utils/api-response.util';
import { Request, Response } from 'express';
import { ProgramSessionDTO } from '../entities/dtos/program-session.dto';
import programSessionService from '../services/logic/program-session.service';
import { wrapAsyncMethodsOfClass } from '#/common/utils/async-errors.util';

class ProgramSessionController {
  async create(req: Request, res: Response) {
    const { programId, countryOperatorPairId, sessionName } =
      req.body as ProgramSessionDTO.Create;

    const { message, data } =
      (await programSessionService.create({
        programId,
        sessionName,
        countryOperatorPairId,
        userId: Number(req.user?.id),
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }
}

const programSessionController = wrapAsyncMethodsOfClass(
  new ProgramSessionController(),
);
export default programSessionController;
