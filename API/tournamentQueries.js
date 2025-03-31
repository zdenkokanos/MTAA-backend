// queries.js
const pool = require('./pooling'); // Import the database pool

// List Tournaments
const getTournaments = async (request, response) => {
    try {
        const { rows } = await pool.query(
            `SELECT
                *
            FROM
                tournaments t
            JOIN sport_category sc ON t.category_id = sc.id`
        );

        if (rows.length === 0) {
            return response.status(404).json({ message: "Tournaments are empty" });
        }

        response.status(200).json(rows); // Return all tournaments, not just the first one
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};

module.exports = {
    getTournaments,
};