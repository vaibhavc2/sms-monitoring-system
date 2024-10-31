import { Router } from 'express';
import operatorController from '../controllers/operator.controller';
import validation from '#/common/middlewares/validation.middleware';
import { Name } from '../schema/common/index.schema';
import auth from '#/common/middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /operators/:
 *   post:
 *     tags:
 *       - Operator
 *     summary: Create an operator
 *     description: Adds a new operator to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Operator created successfully
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
 */
router.post(
  '/',
  auth.admin(),
  validation.requiredFields(['name']),
  operatorController.create,
);

/**
 * @openapi
 * /operators/{id}:
 *   patch:
 *     tags:
 *       - Operator
 *     summary: Update an operator
 *     description: Updates an existing operator by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Operator ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Operator updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Operator not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  auth.admin(),
  validation.zod(Name),
  operatorController.update,
);

/**
 * @openapi
 * /operators/{id}:
 *   delete:
 *     tags:
 *       - Operator
 *     summary: Delete an operator
 *     description: Deletes an operator by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Operator ID
 *     responses:
 *       200:
 *         description: Operator deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Operator not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth.admin(), operatorController.delete);

/**
 * @openapi
 * /operators/{id}:
 *   get:
 *     tags:
 *       - Operator
 *     summary: Get an operator
 *     description: Retrieves details of an operator by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Operator ID
 *     responses:
 *       200:
 *         description: Operator details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Operator not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', auth.user(), operatorController.get);

/**
 * @openapi
 * /operators/:
 *   get:
 *     tags:
 *       - Operator
 *     summary: List all operators
 *     description: Retrieves a list of all operators
 *     responses:
 *       200:
 *         description: List of operators retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth.user(), operatorController.getAll);

/**
 * @openapi
 * /operators/search:
 *   get:
 *     tags:
 *       - Operator
 *     summary: Search operators
 *     description: Searches for operators based on specific criteria
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Operators retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/search', auth.user(), operatorController.search);

/**
 * @openapi
 * /operators/paginated:
 *   get:
 *     tags:
 *       - Operator
 *     summary: Get paginated list of operators
 *     description: Retrieves a paginated list of operators
 *     parameters:
 *       - name: query
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search query to filter operators
 *       - name: sortOrder
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order of the results
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Paginated operators retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/paginated', auth.user(), operatorController.getPaginatedResults);

export default router;
