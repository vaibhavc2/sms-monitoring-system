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

/**
 * @openapi
 * /program-sessions/{id}:
 *   get:
 *     tags:
 *       - ProgramSession
 *     summary: Get a program session
 *     description: Get a program session by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Program session fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Program session not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', auth.user(), programSessionController.get);

/**
 * @openapi
 * /program-sessions/run:
 *   patch:
 *     tags:
 *       - ProgramSession
 *     summary: Run a program session
 *     description: Run a program session by session ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *             required:
 *               - sessionId
 *     responses:
 *       200:
 *         description: Program session started successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Program session not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/run',
  auth.admin(),
  validation.requiredFields(['sessionId']),
  programSessionController.run,
);

/**
 * @openapi
 * /program-sessions/stop:
 *   patch:
 *     tags:
 *       - ProgramSession
 *     summary: Stop a program session
 *     description: Stop a program session by session ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *             required:
 *               - sessionId
 *     responses:
 *       200:
 *         description: Program session stopped successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Program session not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/stop',
  auth.admin(),
  validation.requiredFields(['sessionId']),
  programSessionController.stop,
);

/**
 * @openapi
 * /program-sessions/restart:
 *   patch:
 *     tags:
 *       - ProgramSession
 *     summary: Restart a program session
 *     description: Restart a program session by session ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *             required:
 *               - sessionId
 *     responses:
 *       200:
 *         description: Program session restarted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Program session not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/restart',
  auth.admin(),
  validation.requiredFields(['sessionId']),
  programSessionController.restart,
);

/**
 * @openapi
 * /program-sessions:
 *   get:
 *     tags:
 *       - ProgramSession
 *     summary: Get paginated program sessions
 *     description: Get paginated program sessions with filters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: lastAction
 *         schema:
 *           type: string
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: updatedBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: programId
 *         schema:
 *           type: string
 *       - in: query
 *         name: countryOperatorPairId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Program sessions fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: No program sessions found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/',
  auth.user(),
  programSessionController.getPaginatedProgramSessions,
);

/**
 * @openapi
 * /program-sessions/{id}:
 *   delete:
 *     tags:
 *       - ProgramSession
 *     summary: Delete a program session
 *     description: Delete a program session by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Program session deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Program session not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth.admin(), programSessionController.delete);

export default router;
