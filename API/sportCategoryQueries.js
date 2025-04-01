const pool = require('./pooling'); // Import the database pool

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


module.exports = {
    getCategoriesId
};