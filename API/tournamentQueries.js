// queries.js
const pool = require('./pooling'); // Import the database pool

// List Tournaments
const getTournaments = async (request, response) => { // ? notation (http://localhost:3000/tournaments?sport_category=Basketball)
    try {
        const sportCategory = request.query.sport_category;
        const { rows } = await pool.query(
            `SELECT
                t.id AS tournament_id,  
                t.owner_id,
                t.tournament_name,
                t.category_id,
                t.location_name,
                t.latitude,
                t.longitude,
                t.level,
                t.max_team_size,
                t.game_setting,
                t.entry_fee,
                t.prize_description,
                t.is_public,
                t.additional_info,
                t.status,
                t.date,
                sc.id AS category_id, 
                sc.category_name
            FROM
                tournaments t
            JOIN sport_category sc ON t.category_id = sc.id
            WHERE
                sc.category_name = $1`, [sportCategory]
        );

        if (rows.length === 0) {
            return response.status(404).json({ message: "Tournaments are empty" });
        }

        response.status(200).json(rows); // Return all tournaments
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

const createTournament = async (request, response) => {
    const { owner_id, tournament_name, category_id, location_name, latitude, longitude, level, max_team_size, game_setting, entry_fee, prize_description, is_public, additional_info, status, date } = request.body;

    try {
        const { rows } = await pool.query(
            `INSERT INTO
                tournaments (
                    owner_id,
                    tournament_name,
                    category_id,
                    location_name,
                    latitude,
                    longitude,
                    level,
                    max_team_size,
                    game_setting,
                    entry_fee,
                    prize_description,
                    is_public,
                    additional_info,
                    status,
                    date
                )
            VALUES
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING
                id`, [owner_id, tournament_name, category_id, location_name, latitude, longitude, level, max_team_size, game_setting, entry_fee, prize_description, is_public, additional_info, status, date]
        );

        response.status(201).json(rows[0]);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

const editTournament = async (request, response) => {
    const { tournament_id, tournament_name, category_id, location_name, latitude, longitude, level, max_team_size, game_setting, entry_fee, prize_description, is_public, additional_info, status } = request.body;

    try {
        await pool.query(
        `UPDATE tournaments 
        SET
            tournament_name = $2,
            category_id = $3,
            location_name = $4,
            latitude = $5,
            longitude = $6,
            level = $7,
            max_team_size = $8,
            game_setting = $9,
            entry_fee = $10,
            prize_description = $11,
            is_public = $12,
            additional_info = $13,
            status = $14
        WHERE id = $1
            `, [tournament_id, tournament_name, category_id, location_name, latitude, longitude, level, max_team_size, game_setting, entry_fee, prize_description, is_public, additional_info, status]
        );
        
        response.status(200).json({ message: "Tournament updated successfully" });
        
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

module.exports = {
    getTournaments,
    getTournamentInfo,
    createTournament,
    editTournament
};