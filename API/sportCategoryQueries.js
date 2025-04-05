const pool = require('./pooling'); // Import the database pool

/**
 * @swagger
 * /categories/{sportName}:
 *   get:
 *     summary: Get category ID by sport name
 *     description: Retrieves the ID of the sport category based on the sport name.
 *     parameters:
 *       - name: sportName
 *         in: path
 *         required: true
 *         description: The name of the sport category.
 *         schema:
 *           type: string
 *           example: Basketball
 *     responses:
 *       200:
 *         description: Category found successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 2
 *       404:
 *         description: Sport category does not exist.
 *       500:
 *         description: Internal server error.
 */
const getCategoriesId = async (request, response) => {
    try {
        const sportName = request.params.sportName;

        const { rows } = await pool.query(
            `SELECT
                id
            FROM
                sport_category
            WHERE
                category_name = $1`, [sportName]
        );

        if (rows.length === 0) {
            return response.status(404).json({ message: `Sport category ${sportName} does not exist` });
        }

        response.status(200).json(rows[0]);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}


/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Retrieve all sport categories
 *     description: Fetches a list of all available sport categories, including their names and associated images.
 *     operationId: getAllCategories
 *     responses:
 *       '200':
 *         description: A list of sport categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   category_name:
 *                     type: string
 *                     example: "Football"
 *                   category_image:
 *                     type: string
 *                     example: "football.png"
 *       '404':
 *         description: No sport categories found.
 *       '500':
 *         description: Internal Server Error - Something went wrong with the server.
 */
const getAllCategories = async (request, response) => {
    try {
        const { rows } = await pool.query(
            `SELECT
                *
            FROM
                sport_category`
        );

        if (rows.length === 0) {
            return response.status(404).json({ message: "Sport categories not found" });
        }

        response.status(200).json(rows);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}


module.exports = {
    getCategoriesId,
    getAllCategories
};