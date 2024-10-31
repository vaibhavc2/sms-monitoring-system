import auth from '#/common/middlewares/auth.middleware';
import { Router } from 'express';
import programSessionController from '../controllers/program-session.controller';
import validation from '#/common/middlewares/validation.middleware';
import { ProgramSessionSchema } from '../schema/program-session.schema';

const router = Router();

/**
 * @openapi
 * /program-sessions:
 *   post:
 *     tags:
 *       - ProgramSession
 *     summary: Create a program session
 *     description: Create a program session
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProgramSessionCreate'
 *     responses:
 *       200:
 *         description: Program session created successfully
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
 * components:
 *   schemas:
 *     ProgramSessionCreate:
 *       type: object
 *       properties:
 *         programId:
 *           type: string
 *         countryOperatorPairId:
 *           type: string
 *         sessionName:
 *           type: string
 *       required:
 *         - programId
 *         - countryOperatorPairId
 *         - sessionName
 */
router.post(
  '/',
  auth.admin(),
  validation.zod(ProgramSessionSchema.Create),
  programSessionController.create,
);

export default router;
