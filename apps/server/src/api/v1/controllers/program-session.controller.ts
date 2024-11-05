import ApiResponse from '#/common/utils/api-response.util';
import { Request, Response } from 'express';
import { ProgramSessionDTO } from '../entities/dtos/program-session.dto';
import programSessionService from '../services/logic/program-session.service';
import { wrapAsyncMethodsOfClass } from '#/common/utils/async-errors.util';

class ProgramSessionController {
  async create(req: Request, res: Response) {
    const { programId, countryOperatorPairId, name } =
      req.body as ProgramSessionDTO.Create;

    const { message, data } =
      (await programSessionService.create({
        programId,
        name,
        countryOperatorPairId,
        userId: Number(req.user?.id),
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async get(req: Request, res: Response) {
    const { message, data } =
      (await programSessionService.get(String(req.params.id))) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async run(req: Request, res: Response) {
    const { sessionId } = req.body as { sessionId: string };

    const { message, data } =
      (await programSessionService.run({
        sessionId,
        userId: Number(req.user?.id),
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async stop(req: Request, res: Response) {
    const { sessionId } = req.body as { sessionId: string };

    const { message, data } =
      (await programSessionService.stop({
        sessionId,
        userId: Number(req.user?.id),
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async restart(req: Request, res: Response) {
    const { sessionId } = req.body as { sessionId: string };

    const { message, data } =
      (await programSessionService.restart({
        sessionId,
        userId: Number(req.user?.id),
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async getPaginatedProgramSessions(req: Request, res: Response) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      query,
      status,
      lastAction,
      createdBy,
      updatedBy,
      programId,
      countryOperaterPairId,
    } = req.query;

    const { message, data } =
      (await programSessionService.getPaginatedProgramSessions({
        page: String(page),
        limit: String(limit),
        sortBy: String(sortBy),
        sortOrder: String(sortOrder),
        query: String(query),
        filter: {
          status: String(status),
          lastAction: String(lastAction),
          createdBy: String(createdBy),
          updatedBy: String(updatedBy),
          programId: String(programId),
          countryOperatorPairId: String(countryOperaterPairId),
        },
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async delete(req: Request, res: Response) {
    const { sessionId } = req.body as { sessionId: string };

    const { message } = (await programSessionService.delete(sessionId)) ?? {};

    return new ApiResponse(res).success(message, {});
  }
}

const programSessionController = wrapAsyncMethodsOfClass(
  new ProgramSessionController(),
);
export default programSessionController;
