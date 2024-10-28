import { Router } from 'express';
import programController from '../controllers/program.controller';
import validation from '#/common/middlewares/validation.middleware';
import auth from '#/common/middlewares/auth.middleware';
import { ProgramSchema } from '../schema/program.schema';
import filesMiddleware from '#/common/middlewares/files.middleware';

const router = Router();

// All routes are protected
// router.use(auth.admin())

/**
 * @openapi
 * /programs/upload:
 *   post:
 *     tags:
 *       - Program
 *     summary: Upload a program
 *     description: Upload a program
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Program uploaded successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 *     x-role: admin
 *     x-access: admin
 *     x-visibility: public
 * components:
 *   schemas:
 *     ProgramUpload:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *       required:
 *         - name
 */
router.post(
  '/upload',
  auth.admin(),
  filesMiddleware.upload,
  validation.zod(ProgramSchema.Upload),
  programController.upload,
);

export default router;
