import { Request, Response } from 'express';
import adminService from '../services/logic/admin.service';
import ApiResponse from '#/common/utils/api-response.util';
import { AdminDTO } from '../entities/dtos/admin.dto';

class AdminController {
  async changeRole(req: Request, res: Response) {
    const { userId, role } = req.body as AdminDTO.ChangeRole;

    const { message, data } =
      (await adminService.changeRole({
        userId: Number(userId),
        role,
        currentUserId: Number(req.user?.id),
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async getRoles(req: Request, res: Response) {
    const { message, data } = (await adminService.getRoles()) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async disableUser(req: Request, res: Response) {
    const { userId, disabledReason } = req.body as AdminDTO.DisableUser;

    const { message, data } =
      (await adminService.disableUser({
        userId: Number(userId),
        currentUserId: Number(req.user?.id),
        disabledReason,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async enableUser(req: Request, res: Response) {
    const { userId, enabledReason } = req.body as AdminDTO.EnableUser;

    const { message, data } =
      (await adminService.enableUser({
        userId: Number(userId),
        currentUserId: Number(req.user?.id),
        enabledReason,
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async getUsers(req: Request, res: Response) {
    const { message, data } = (await adminService.getUsers()) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async getPaginatedUsers(req: Request, res: Response) {
    const { query, page, limit, sortBy, sortType } = req.query;

    const { message, data } =
      (await adminService.getPaginatedUsers({
        query: query as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: sortBy as string,
        sortType: sortType as 'asc' | 'desc',
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }

  async getUser(req: Request, res: Response) {
    const { userId } = req.params;

    const { message, data } =
      (await adminService.getUser({
        userId: parseInt(userId as string),
      })) ?? {};

    return new ApiResponse(res).success(message, data);
  }
}

const adminController = new AdminController();
export default adminController;
