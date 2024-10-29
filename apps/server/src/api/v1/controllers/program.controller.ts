import ApiResponse from '#/common/utils/api-response.util';
import { wrapAsyncMethodsOfClass } from '#/common/utils/async-errors.util';
import { Request, Response } from 'express';
import programService from '../services/logic/program.service';
import { ProgramDTO } from '../entities/dtos/program.dto';

class ProgramController {
  async upload(req: Request, res: Response) {
    const { name, description } = req.body as ProgramDTO.UpdateDetails;

    const fileName = req.fileName as string;
    const serverFileName = req.serverFileName as string;

    const { message, data } =
      (await programService.upload({
        name,
        description,
        fileName,
        serverFileName,
        userId: Number(req.user?.id),
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async updateDetails(req: Request, res: Response) {
    const { name, description } = req.body as ProgramDTO.UpdateDetails;

    // get the program id from the request params
    const programId = req.params.programId as string;

    const { message, data } =
      (await programService.updateDetails({
        name,
        description,
        userId: Number(req.user?.id),
        programId,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async updateFile(req: Request, res: Response) {
    const fileName = req.fileName as string;
    const serverFileName = req.serverFileName as string;
    const userId = Number(req.user?.id);

    // get the program id from the request params
    const programId = req.params.programId as string;

    const { message, data } =
      (await programService.updateFile({
        fileName,
        serverFileName,
        userId,
        programId,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async delete(req: Request, res: Response) {
    // get the program id from the request params
    const programId = req.params.programId as string;

    const { message, data } =
      (await programService.delete({
        programId,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async get(req: Request, res: Response) {
    // get the program id from the request params
    const programId = req.params.programId as string;

    const { message, data } =
      (await programService.get({
        programId,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async getDetails(req: Request, res: Response) {
    // get the program id from the request params
    const programId = req.params.programId as string;

    const { message, data } =
      (await programService.getDetails({
        programId,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async getPrograms(req: Request, res: Response) {
    const { page, limit, sortBy, sortOrder, query } =
      req.query as ProgramDTO.GetPrograms;

    const { message, data } =
      (await programService.getPrograms({
        page,
        limit,
        sortBy,
        sortOrder,
        query,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }
}

const programController = wrapAsyncMethodsOfClass(new ProgramController());
export default programController;
