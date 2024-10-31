import auth from '#/common/middlewares/auth.middleware';
import validation from '#/common/middlewares/validation.middleware';
import { Router } from 'express';
import countryOperatorPairController from '../controllers/country-operator-pair.controller';
import { Name } from '../schema/common/index.schema';

const router = Router();

/**
 * @openapi
 * /country-operator-pairs/:
 *   post:
 *     tags:
 *       - CountryOperatorPair
 *     summary: Create a country-operator pair
 *     description: Adds a new country-operator pair to the system
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               programId:
 *                 type: string
 *               countryId:
 *                 type: string
 *               operatorId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Country-operator pair created successfully
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
  validation.requiredFields(['programId', 'countryId', 'operatorId']),
  validation.zod(Name),
  countryOperatorPairController.create,
);

/**
 * @openapi
 * /country-operator-pairs/{id}:
 *   patch:
 *     tags:
 *       - CountryOperatorPair
 *     summary: Update a country-operator pair
 *     description: Updates an existing country-operator pair by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Country-operator pair ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               programId:
 *                 type: string
 *               countryId:
 *                 type: string
 *               operatorId:
 *                 type: string
 *               disabled:
 *                 type: boolean
 *               highPriority:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Country-operator pair updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Country-operator pair not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:id', auth.admin(), countryOperatorPairController.update);

/**
 * @openapi
 * /country-operator-pairs/{id}:
 *   delete:
 *     tags:
 *       - CountryOperatorPair
 *     summary: Delete a country-operator pair
 *     description: Deletes a country-operator pair by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Country-operator pair ID
 *     responses:
 *       200:
 *         description: Country-operator pair deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Country-operator pair not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth.admin(), countryOperatorPairController.delete);

/**
 * @openapi
 * /country-operator-pairs/{id}:
 *   get:
 *     tags:
 *       - CountryOperatorPair
 *     summary: Get a country-operator pair
 *     description: Retrieves details of a country-operator pair by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Country-operator pair ID
 *     responses:
 *       200:
 *         description: Country-operator pair details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Country-operator pair not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', auth.admin(), countryOperatorPairController.get);

/**
 * @openapi
 * /country-operator-pairs/{programId}:
 *   get:
 *     tags:
 *       - CountryOperatorPair
 *     summary: Get desired country-operator pairs
 *     description: Retrieves desired country-operator pairs by program ID
 *     parameters:
 *       - name: programId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Program ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               disabled:
 *                 type: boolean
 *               highPriority:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Desired country-operator pairs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Country-operator pairs not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/:programId',
  auth.admin(),
  countryOperatorPairController.getDesiredPairs,
);

/**
 * @openapi
 * /country-operator-pairs/search:
 *   get:
 *     tags:
 *       - CountryOperatorPair
 *     summary: Search country-operator pairs
 *     description: Searches for country-operator pairs based on specific criteria
 *     parameters:
 *       - name: programId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: userId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: countryId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *       - name: operatorId
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Country-operator pairs retrieved successfully
 *       400:
 *         description: Invalid or no query parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/search', auth.admin(), countryOperatorPairController.searchById);

/**
 * @openapi
 * /country-operator-pairs/paginated-results:
 *   get:
 *     tags:
 *       - CountryOperatorPair
 *     summary: Get paginated list of country-operator pairs
 *     description: Retrieves a paginated list of country-operator pairs
 *     parameters:
 *       - name: sortBy
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search query to filter country-operator pairs
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
 *         description: Paginated country-operator pairs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get(
  '/paginated-results',
  auth.admin(),
  countryOperatorPairController.getPaginatedResults,
);

export default router;
