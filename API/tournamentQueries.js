// queries.js
const { get } = require('react-native/Libraries/TurboModule/TurboModuleRegistry');
const pool = require('./pooling'); // Import the database pool

// List Tournaments
const getTournaments = async (request, response) => {
    try {
        const sportCategory = request.query.sport_category;
        const { rows } = await pool.query(
            `SELECT
                *
            FROM
                tournaments t
            JOIN sport_category sc ON t.category_id = sc.id
            WHERE
                sc.category_name = $1`, [sportCategory]
        );

        if (rows.length === 0) {
            return response.status(404).json({ message: "Tournaments are empty" });
        }

        response.status(200).json(rows); // Return all tournaments, not just the first one
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};

// Get Info by tournament ID
const getTournamentInfo = async (request, response) => {
    try {
        const tournamentID = request.params.id;
        const { rows } = await pool.query(
            `SELECT
                *
            FROM
                tournaments t
            JOIN sport_category sc ON t.category_id = sc.id
            WHERE
                t.id = $1`, [tournamentID]
        );

        if (rows.length === 0) {
            return response.status(404).json({ message: "Tournament not found" });
        }

        response.status(200).json(rows[0]);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

module.exports = {
    getTournaments,
    getTournamentInfo
};