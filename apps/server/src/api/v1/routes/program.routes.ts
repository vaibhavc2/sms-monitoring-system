import { Router } from 'express';
import programController from '../controllers/program.controller';
import validation from '#/common/middlewares/validation.middleware';
import auth from '#/common/middlewares/auth.middleware';
import fileMiddleware from '#/common/middlewares/file.middleware';
import { Name } from '../schema/common/index.schema';

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
  fileMiddleware.upload,
  validation.zod(Name),
  programController.upload,
);

/**
 * @openapi
 * /programs/details/{programId}:
 *   patch:
 *     tags:
 *       - Program
 *     summary: Update program details
 *     description: Update program details
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Program details updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Program not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 * components:
 *   schemas:
 *     ProgramUpdateDetails:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *       required:
 *         - name
 */
router.patch(
  '/details/:programId',
  auth.admin(),
  validation.zod(Name),
  programController.updateDetails,
);

/**
 * @openapi
 * /programs/file/{programId}:
 *   patch:
 *     tags:
 *       - Program
 *     summary: Update program file
 *     description: Update program file
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Program file updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Program not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 * components:
 *   schemas:
 *     ProgramUpdateFile:
 *       type: object
 *       properties:
 *         file:
 *           type: string
 *       required:
 *         - file
 */
router.patch(
  '/file/:programId',
  auth.admin(),
  fileMiddleware.upload,
  programController.updateFile,
);

/**
 * @openapi
 * /programs/{programId}:
 *   delete:
 *     tags:
 *       - Program
 *     summary: Delete a program
 *     description: Delete a program
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Program deleted successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Program not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:programId', auth.admin(), programController.delete);

/**
 * @openapi
 * /programs/details/{programId}:
 *   get:
 *     tags:
 *       - Program
 *     summary: Get program details
 *     description: Get program details
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Program fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/details/:programId', auth.admin(), programController.getDetails);

/**
 * @openapi
 * /programs/{programId}:
 *   get:
 *     tags:
 *       - Program
 *     summary: Get a program
 *     description: Get a program
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Program fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/:programId', auth.user(), programController.get);

/**
 * @openapi
 * /programs:
 *   get:
 *     tags:
 *       - Program
 *     summary: Get programs
 *     description: Get programs
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
 *     responses:
 *       200:
 *         description: Programs fetched successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth.user(), programController.getPrograms);

export default router;
