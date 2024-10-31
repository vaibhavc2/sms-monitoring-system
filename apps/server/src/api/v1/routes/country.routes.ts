import { Router } from 'express';
import countryController from '../controllers/country.controller';
import validation from '#/common/middlewares/validation.middleware';
import { Name } from '../schema/common/index.schema';
import auth from '#/common/middlewares/auth.middleware';

const router = Router();

/**
 * @openapi
 * /countries/:
 *   post:
 *     tags:
 *       - Country
 *     summary: Create a country
 *     description: Adds a new country to the system
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
 *         description: Country created successfully
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
  validation.zod(Name),
  countryController.create,
);

/**
 * @openapi
 * /countries/{id}:
 *   patch:
 *     tags:
 *       - Country
 *     summary: Update a country
 *     description: Updates an existing country by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Country ID
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
 *         description: Country updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Country not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/:id',
  auth.admin(),
  validation.zod(Name),
  countryController.update,
);

/**
 * @openapi
 * /countries/{id}:
 *   delete:
 *     tags:
 *       - Country
 *     summary: Delete a country
 *     description: Deletes a country by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Country ID
 *     responses:
 *       200:
 *         description: Country deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Country not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth.admin(), countryController.delete);

/**
 * @openapi
 * /countries/{id}:
 *   get:
 *     tags:
 *       - Country
 *     summary: Get a country
 *     description: Retrieves details of a country by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Country ID
 *     responses:
 *       200:
 *         description: Country details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Country not found
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', auth.user(), countryController.get);

/**
 * @openapi
 * /countries/:
 *   get:
 *     tags:
 *       - Country
 *     summary: List all countries
 *     description: Retrieves a list of all countries
 *     responses:
 *       200:
 *         description: List of countries retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/', auth.user(), countryController.getAll);

/**
 * @openapi
 * /countries/search:
 *   get:
 *     tags:
 *       - Country
 *     summary: Search countries
 *     description: Searches for countries based on specific criteria
 *     parameters:
 *       - name: query
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Countries retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/search', auth.user(), countryController.search);

/**
 * @openapi
 * /countries/paginated:
 *   get:
 *     tags:
 *       - Country
 *     summary: Get paginated list of countries
 *     description: Retrieves a paginated list of countries
 *     parameters:
 *       - name: query
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search query to filter countries
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
 *         description: Paginated countries retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 *     security:
 *       - bearerAuth: []
 */
router.get('/paginated', auth.user(), countryController.getPaginatedResults);

export default router;
