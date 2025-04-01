const pool = require('./pooling'); // Import the database pool

/**
 * @swagger
 * /tournaments:
 *   get:
 *     summary: Get all tournaments with sport category filter
 *     description: Returns a list of tournaments, filtered by sport category.
 *     parameters:
 *       - in: query
 *         name: sport_category
 *         schema:
 *           type: string
 *         required: false
 *         description: The name of the sport category to filter tournaments.
 *         example: Basketball
 *     responses:
 *       200:
 *         description: List of tournaments retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tournament_id:
 *                     type: integer
 *                     example: 1
 *                   owner_id:
 *                     type: integer
 *                     example: 5
 *                   tournament_name:
 *                     type: string
 *                     example: Summer Basketball Championship
 *                   category_id:
 *                     type: integer
 *                     example: 2
 *                   location_name:
 *                     type: string
 *                     example: Los Angeles Sports Arena
 *                   latitude:
 *                     type: number
 *                     format: float
 *                     example: 34.0522
 *                   longitude:
 *                     type: number
 *                     format: float
 *                     example: -118.2437
 *                   level:
 *                     type: string
 *                     example: Amateur
 *                   max_team_size:
 *                     type: integer
 *                     example: 5
 *                   game_setting:
 *                     type: string
 *                     example: Outdoor
 *                   entry_fee:
 *                     type: number
 *                     format: float
 *                     example: 20.00
 *                   prize_description:
 *                     type: string
 *                     example: Trophy and cash prize
 *                   is_public:
 *                     type: boolean
 *                     example: true
 *                   additional_info:
 *                     type: string
 *                     example: Bring your own jerseys
 *                   status:
 *                     type: string
 *                     example: Upcoming
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-07-10T10:00:00Z"
 *                   category_name:
 *                     type: string
 *                     example: Basketball
 *       404:
 *         description: No tournaments found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tournaments are empty
 *       500:
 *         description: Internal server error.
 */
const getTournaments = async (request, response) => { 
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

/**
 * @swagger
 * /tournaments/{id}:
 *   get:
 *     summary: Get tournament info by ID
 *     description: Returns detailed information about a specific tournament based on its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The unique ID of the tournament.
 *         example: 1
 *     responses:
 *       200:
 *         description: Tournament details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 owner_id:
 *                   type: integer
 *                   example: 5
 *                 tournament_name:
 *                   type: string
 *                   example: Summer Basketball Championship
 *                 category_id:
 *                   type: integer
 *                   example: 2
 *                 location_name:
 *                   type: string
 *                   example: Los Angeles Sports Arena
 *                 latitude:
 *                   type: number
 *                   format: float
 *                   example: 34.0522
 *                 longitude:
 *                   type: number
 *                   format: float
 *                   example: -118.2437
 *                 level:
 *                   type: string
 *                   example: Amateur
 *                 max_team_size:
 *                   type: integer
 *                   example: 5
 *                 game_setting:
 *                   type: string
 *                   example: Outdoor
 *                 entry_fee:
 *                   type: number
 *                   format: float
 *                   example: 20.00
 *                 prize_description:
 *                   type: string
 *                   example: Trophy and cash prize
 *                 is_public:
 *                   type: boolean
 *                   example: true
 *                 additional_info:
 *                   type: string
 *                   example: Bring your own jerseys
 *                 status:
 *                   type: string
 *                   example: Upcoming
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-10T10:00:00Z"
 *                 category_name:
 *                   type: string
 *                   example: Basketball
 *       404:
 *         description: Tournament not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tournament not found
 *       500:
 *         description: Internal server error.
 */
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

/**
 * @swagger
 * /tournaments:
 *   post:
 *     summary: Create a new tournament
 *     description: Adds a new tournament to the database and returns its ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - owner_id
 *               - tournament_name
 *               - category_id
 *               - location_name
 *               - latitude
 *               - longitude
 *               - level
 *               - max_team_size
 *               - game_setting
 *               - entry_fee
 *               - prize_description
 *               - is_public
 *               - additional_info
 *               - status
 *               - date
 *             properties:
 *               owner_id:
 *                 type: integer
 *                 description: ID of the tournament owner.
 *                 example: 5
 *               tournament_name:
 *                 type: string
 *                 example: Summer Basketball Championship
 *               category_id:
 *                 type: integer
 *                 description: ID of the sport category.
 *                 example: 2
 *               location_name:
 *                 type: string
 *                 example: Los Angeles Sports Arena
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 34.0522
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: -118.2437
 *               level:
 *                 type: string
 *                 example: Amateur
 *               max_team_size:
 *                 type: integer
 *                 example: 5
 *               game_setting:
 *                 type: string
 *                 example: Outdoor
 *               entry_fee:
 *                 type: number
 *                 format: float
 *                 example: 20.00
 *               prize_description:
 *                 type: string
 *                 example: Trophy and cash prize
 *               is_public:
 *                 type: boolean
 *                 example: true
 *               additional_info:
 *                 type: string
 *                 example: Bring your own jerseys
 *               status:
 *                 type: string
 *                 example: Upcoming
 *               date:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-10T10:00:00Z"
 *     responses:
 *       201:
 *         description: Tournament created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Internal server error.
 */
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

/**
 * @swagger
 * /tournaments:
 *   put:
 *     summary: Edit an existing tournament
 *     description: Updates the information of an existing tournament.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tournament_id
 *               - tournament_name
 *               - category_id
 *               - location_name
 *               - latitude
 *               - longitude
 *               - level
 *               - max_team_size
 *               - game_setting
 *               - entry_fee
 *               - prize_description
 *               - is_public
 *               - additional_info
 *               - status
 *             properties:
 *               tournament_id:
 *                 type: integer
 *                 description: ID of the tournament to be updated.
 *                 example: 1
 *               tournament_name:
 *                 type: string
 *                 example: Summer Basketball Championship
 *               category_id:
 *                 type: integer
 *                 description: ID of the sport category.
 *                 example: 2
 *               location_name:
 *                 type: string
 *                 example: Los Angeles Sports Arena
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: 34.0522
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: -118.2437
 *               level:
 *                 type: string
 *                 example: Amateur
 *               max_team_size:
 *                 type: integer
 *                 example: 5
 *               game_setting:
 *                 type: string
 *                 example: Outdoor
 *               entry_fee:
 *                 type: number
 *                 format: float
 *                 example: 20.00
 *               prize_description:
 *                 type: string
 *                 example: Trophy and cash prize
 *               is_public:
 *                 type: boolean
 *                 example: true
 *               additional_info:
 *                 type: string
 *                 example: Bring your own jerseys
 *               status:
 *                 type: string
 *                 example: Upcoming
 *     responses:
 *       200:
 *         description: Tournament updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tournament updated successfully
 *       400:
 *         description: Bad request, missing required fields.
 *       404:
 *         description: Tournament not found.
 *       500:
 *         description: Internal server error.
 */
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

/**
 * @swagger
 * /tournaments/start/{id}:
 *   put:
 *     summary: Start a tournament
 *     description: Updates the status of a tournament to "Ongoing" based on the tournament ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the tournament to start
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Tournament started successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tournament started successfully
 *       400:
 *         description: Bad request, missing or invalid tournament ID.
 *       404:
 *         description: Tournament not found.
 *       500:
 *         description: Internal server error.
 */
const startTournament = async (request, response) => {
    const tournament_id = request.params.id;

    try {
        const result = await pool.query(
            `UPDATE tournaments
             SET status = 'Ongoing'
             WHERE id = $1`,
            [tournament_id]
        );

        if (result.rowCount === 0) {
            return response.status(404).json({ message: "Tournament not found" });
        }

        response.status(200).json({ message: "Tournament started successfully" });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};

/**
 * @swagger
 * /tournaments/start/{id}:
 *   put:
 *     summary: Stop a tournament
 *     description: Updates the status of a tournament to "Closed" based on the tournament ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the tournament to stop
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Tournament stopped successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tournament stopped successfully
 *       400:
 *         description: Bad request, missing or invalid tournament ID.
 *       404:
 *         description: Tournament not found.
 *       500:
 *         description: Internal server error.
 */
const stopTournament = async (request, response) => {
    const tournament_id = request.params.id;

    try {
        const result = await pool.query(
            `UPDATE tournaments
             SET status = 'Closed'
             WHERE id = $1`,
            [tournament_id]
        );

        if (result.rowCount === 0) {
            return response.status(404).json({ message: "Tournament not found" });
        }

        response.status(200).json({ message: "Tournament stopped successfully" });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};

const addRecordToLeaderboard = async (request, response) => {
    const { tournament_id, team_id, position} = request.body;

    try {
        await pool.query(
            `INSERT INTO
                leaderboard (tournament_id, team_id, position) 
            VALUES
                ($1, $2, $3)
            `, [tournament_id, team_id, position]
        );

        response.status(200).json({ message: "Record added to leaderboard" })
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

module.exports = {
    getTournaments,
    getTournamentInfo,
    createTournament,
    editTournament,
    startTournament,
    stopTournament,
    addRecordToLeaderboard
};