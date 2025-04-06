const pool = require('./pooling'); // Import the database pool
const crypto = require('crypto');

/**
 * @swagger
 * /tournaments: 
 *   get:
 *     summary: Get all tournaments with sport category filter excluding user’s assigned tournaments
 *     description: Returns a list of tournaments filtered by sport category, excluding tournaments the user is already part of.
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the sport category to filter tournaments.
 *         example: 2
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user to exclude tournaments they are already assigned to.
 *         example: 7
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
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   tournament_name:
 *                     type: string
 *                     example: Summer Basketball Championship
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-07-10T10:00:00Z"
 *                   latitude:
 *                     type: number
 *                     format: float
 *                     example: 34.0522
 *                   longitude:
 *                     type: number
 *                     format: float
 *                     example: -118.2437
 *                   category_image:
 *                     type: string
 *                     example: /images/basketball.png
 *       404:
 *         description: No tournaments found.
 *       500:
 *         description: Internal server error.
 */
const getTournaments = async (request, response) => {
    try {
        const {category_id, user_id} = request.query;
        const { rows } = await pool.query(
            `SELECT
                t.id,
                t.tournament_name,
                t.date,
                t.latitude,
                t.longitude,
                sc.category_image
            FROM
                tournaments t
            JOIN sport_category sc ON t.category_id = sc.id
            WHERE
                t.category_id = $1
                AND t.id NOT IN (
                    SELECT tm.tournament_id
                    FROM team_members tm
                    WHERE tm.user_id = $2
                )`, [category_id, user_id]
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
 * /tournaments/{id}/info: 
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
 *                 tournament_name:
 *                   type: string
 *                   example: Summer Basketball Championship
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
 *       500:
 *         description: Internal server error.
 */
const getTournamentInfo = async (request, response) => {
    try {
        const tournamentID = request.params.id;
        const { rows } = await pool.query(
            `SELECT
                t.id,
                t.tournament_name,
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
                sc.category_image
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
 *       404:
 *         description: Tournament not found.
 *       500:
 *         description: Internal server error.
 */
const editTournament = async (request, response) => {
    const { tournament_id, tournament_name, category_id, location_name, latitude, longitude, level, max_team_size, game_setting, entry_fee, prize_description, is_public, additional_info, status } = request.body;

    try {
        const { rowCount } = await pool.query(
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
        
        if (rowCount === 0) {
            return response.status(404).json({ message: "Tournament not found." });
        }

        response.status(200).json({ message: "Tournament updated successfully" });
        
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

/**
 * @swagger
 * /tournaments/{id}/start:
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
 * /tournaments/{id}/stop:
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

/**
 * @swagger
 * /tournaments/leaderboard/add:
 *   post:
 *     summary: Add a new record to the leaderboard
 *     description: Adds a new team record to the leaderboard for a specific tournament and position.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tournament_id
 *               - team_id
 *               - position
 *             properties:
 *               tournament_id:
 *                 type: integer
 *                 description: The ID of the tournament.
 *                 example: 1
 *               team_id:
 *                 type: integer
 *                 description: The ID of the team.
 *                 example: 3
 *               position:
 *                 type: integer
 *                 description: The position of the team in the tournament.
 *                 example: 2
 *     responses:
 *       200:
 *         description: Record added to the leaderboard.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Record added to leaderboard
 *       400:
 *         description: Invalid input, missing required fields or invalid data.
 *       500:
 *         description: Internal server error, failed to add record.
 */
const addRecordToLeaderboard = async (request, response) => {
    const { tournament_id, team_id, position} = request.body;

    try {
        const result = await pool.query(
            `INSERT INTO
                leaderboard (tournament_id, team_id, position) 
            VALUES
                ($1, $2, $3)
            `, [tournament_id, team_id, position]
        );

        if (result.rowCount === 0) {
            return response.status(400).json({ message: "Invalid input, missing required fields or invalid data" });
        }

        response.status(200).json({ message: "Record added to leaderboard" })
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

/**
 * @swagger
 * /tournaments/{id}/leaderboard:
 *   get:
 *     summary: Get leaderboard for a specific tournament
 *     description: Retrieves all leaderboard records for a given tournament by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the tournament whose leaderboard records are to be fetched.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved leaderboard records for the tournament
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   tournament_id:
 *                     type: integer
 *                     description: ID of the tournament
 *                   team_id:
 *                     type: integer
 *                     description: ID of the team
 *                   position:
 *                     type: integer
 *                     description: Position of the team in the leaderboard
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */
const getLeaderboardByTournament = async (request, response) =>{
    const tournament_id = request.params.id;

    try {
        const result = await pool.query(
            `SELECT
                *
            FROM
                leaderboard
            WHERE
                tournament_id = $1
            `,[tournament_id]
        );
        
        if (result.rowCount === 0){
            return response.status(404).json({ message: "Tournament not found" });
        }
        response.status(200).json( result.rows )
    } catch (error) {
        response.status(500).json({ error: error.message })
    }
}


/**
 * @swagger
 * /tournaments/{id}/leaderboard/remove:
 *   delete:
 *     summary: Remove a team from the leaderboard
 *     description: Removes a team from the leaderboard for a specific tournament by the provided tournament ID and team ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tournament_id
 *               - team_id
 *             properties:
 *               tournament_id:
 *                 type: integer
 *                 description: The ID of the tournament.
 *                 example: 1
 *               team_id:
 *                 type: integer
 *                 description: The ID of the team to be removed.
 *                 example: 5
 *     responses:
 *       200:
 *         description: Record removed from leaderboard
 *       404:
 *         description: Leaderboard record not found
 *       500:
 *         description: Internal server error, failed to remove record.
 */
const removeFromLeaderboard = async (request, response) => {
    const { tournament_id, team_id } = request.body;
    try {
        const result = await pool.query(
            `DELETE FROM leaderboard
                WHERE tournament_id = $1 AND team_id = $2`,
            [tournament_id, team_id]
        );

        if (result.rowCount === 0) {
            return response.status(404).json({ message: "Leaderboard record not found." });
        }

        response.status(200).json({ message: "Record removed from leaderboard" });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

// this function generates random codes
const generateCode = (byte_length) => {
    return crypto.randomBytes(byte_length).toString('hex').toUpperCase();
};

/**
 * @swagger
 * /tournaments/{id}/register:
 *   post:
 *     summary: Register a team for a tournament
 *     description: Registers a team with a name and a user for a specific tournament. Generates a unique team code and a ticket for the user.
 *     parameters:
 *       - name: id  # Path parameter for tournament ID
 *         in: path
 *         required: true
 *         type: integer
 *         description: The ID of the tournament.
 *     requestBody:
 *       required: true  # Body parameters are required
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - team_name  # Required parameter for team name
 *               - user_id  # Required parameter for user ID
 *             properties:
 *               team_name:
 *                 type: string
 *                 description: The name of the team.
 *                 example: "Team A"
 *               user_id:
 *                 type: integer
 *                 description: The ID of the user registering the team.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Successfully registered team and user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Team and member registered"
 *                 team_code:
 *                   type: string
 *                   description: The unique code generated for the team
 *                   example: "U8ED45NH"
 *                 ticket:
 *                   type: string
 *                   description: The unique ticket hash for the user
 *                   example: "TICKET123456"
 *       400:
 *         description: Invalid input, missing required fields or invalid data.
 *       500:
 *         description: Internal server error, failed to register team.
 */
const addTeamToTournament = async (request, response) => {
    const { team_name, user_id } = request.body;
    const tournament_id = request.params.id;
    const code = generateCode(4);
    const ticket_hash = generateCode(6);

    try {
        // 1. Insert team and return its id
        const teamResult = await pool.query(
            `INSERT INTO teams (team_name, code, tournament_id) 
             VALUES ($1, $2, $3)
             RETURNING id`, 
            [team_name, code, tournament_id]
        );

        const team_id = teamResult.rows[0].id;

        // 2. Insert into team_members
        await pool.query(
            `INSERT INTO team_members (user_id, team_id, tournament_id, ticket) 
             VALUES ($1, $2, $3, $4)`,
            [user_id, team_id, tournament_id, ticket_hash]
        );

        response.status(200).json({ 
            message: "Team and member registered",
            team_code: code,
            ticket: ticket_hash
        });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};


/**
 * @swagger
 * /tournaments/{id}/join_team:
 *   post:
 *     summary: Join a team at a tournament
 *     description: Adds a user to an existing team in a tournament by providing the team code.
 *     parameters:
 *       - name: id  # Path parameter for tournament ID
 *         in: path
 *         required: true
 *         type: integer
 *         description: The ID of the tournament.
 *     requestBody:
 *       required: true  # Body parameters are required
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id  # Required parameter for user ID
 *               - code     # Required parameter for team code
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: The ID of the user joining the team.
 *                 example: 1
 *               code:
 *                 type: string
 *                 description: The code of the team the user wants to join.
 *                 example: "ABCD123"
 *     responses:
 *       200:
 *         description: Successfully added user to the team
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User added to the team"
 *       400:
 *         description: The team is already full
 *       404:
 *         description: Team or tournament not found
 *       500:
 *         description: Internal server error, failed to add user to the team.
 */
const joinTeamAtTournament = async (request, response) => {
    const { user_id, code } = request.body;
    const tournament_id = request.params.id;
    const ticket_hash = generateCode(6);

    try {
        // 1. Check if the team code exists
        const teamResult = await pool.query(
            `SELECT id FROM teams WHERE code = $1 AND tournament_id = $2`, 
            [code, tournament_id]
        );

        if (teamResult.rowCount === 0) {
            return response.status(404).json({ message: "Team not found" });
        }

        const team_id = teamResult.rows[0].id;

        // 2. Get the max team size from the tournaments table
        const tournamentResult = await pool.query(
            `SELECT max_team_size FROM tournaments WHERE id = $1`,
            [tournament_id]
        );

        if (tournamentResult.rowCount === 0) {
            return response.status(404).json({ message: "Tournament not found" });
        }

        const maxTeamSize = tournamentResult.rows[0].max_team_size;

        // 3. Count the current number of members in the team
        const membersCountResult = await pool.query(
            `SELECT COUNT(*) FROM team_members WHERE team_id = $1`,
            [team_id]
        );

        const currentMembersCount = parseInt(membersCountResult.rows[0].count, 10);

        // 4. Check if the team is already full
        if (currentMembersCount >= maxTeamSize) {
            return response.status(400).json({ message: "Team is already full" });
        }

        // 5. Insert the new member into the team_members table
        await pool.query(
            `INSERT INTO team_members (user_id, team_id, tournament_id, ticket) 
             VALUES ($1, $2, $3, $4)`,
            [user_id, team_id, tournament_id, ticket_hash]
        );

        response.status(200).json({ message: "User added to the team" });
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}; // Chat GPT generated



/**
 * @swagger
 * /tournaments/{id}/enrolled:
 *   get:
 *     summary: Get a list of teams enrolled in a tournament
 *     description: Retrieves a list of teams enrolled in a specific tournament, along with the number of members in each team.
 *     parameters:
 *       - name: id  # Path parameter for tournament ID
 *         in: path
 *         required: true
 *         type: integer
 *         description: The ID of the tournament.
 *     responses:
 *       200:
 *         description: Successfully retrieved list of teams and their members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   team_name:
 *                     type: string
 *                     description: The name of the team
 *                     example: "Team A"
 *                   number_of_members:
 *                     type: integer
 *                     description: The number of members in the team
 *                     example: 5
 *       404:
 *         description: No teams found for this tournament
 *       500:
 *         description: Internal server error, failed to retrieve data.
 */
const getEnrolledTeams = async (request, response) => {
    const tournament_id = request.params.id;

    try {
        const result = await pool.query(
            `SELECT
                t.team_name,
                COUNT(*) AS number_of_members
            FROM
                teams t
                JOIN team_members tm ON t.id = tm.team_id
            WHERE
                t.tournament_id = $1
            GROUP BY t.team_name`, [tournament_id]
        );

        if (result.rowCount === 0) {
            return response.status(404).json({ message: "No teams found for this tournament" });
        }

        response.status(200).json(result.rows);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

/**
 * @swagger
 * /tournaments/{id}/check-tickets:
 *   post:
 *     summary: "Check if a ticket exists for a tournament"
 *     description: "This endpoint checks whether a ticket exists for the provided tournament."
 *     parameters:
 *       - name: id
 *         in: path
 *         description: "The tournament ID to check against."
 *         required: true
 *         type: string
 *       - name: ticket
 *         in: body
 *         description: "The ticket code to check."
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             ticket:
 *               type: string
 *               example: 9HFBDAS24
 *     responses:
 *       200:
 *         description: "Ticket found"
*         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 11
 *                 user_id:
 *                   type: integer
 *                   example: 60
 *                 team_id:
 *                   type: integer
 *                   example: 14
 *                 tournament_id:
 *                   type: integer
 *                   example: 62
 *                 name:
 *                   type: string
 *                   description: "Name of the team member"
 *                 ticket:
 *                   type: string
 *                   example: 9HFBDAS24
 *       404:
 *         description: "Ticket not found"
 *       500:
 *         description: "Internal server error"
 */
const checkTickets = async (request, response) => {
    const tournament_id = request.params.id;
    const { code } = request.body;

    try {
        const result = await pool.query(
            `SELECT
                *
            FROM
                team_members
            WHERE
                tournament_id = $1 AND ticket = $2`, [tournament_id, code]
        );

        if (result.rowCount === 0) {
            return response.status(404).json({ message: "Ticket not found" });
        }

        response.status(200).json(result.rows[0]);
    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}

/**
 * @swagger
 * /tournaments/{id}/teams/count: 
 *   get:
 *     summary: Get the count of teams enrolled in a tournament
 *     description: Retrieves the total number of teams that are enrolled in a specific tournament.
 *     parameters:
 *       - name: id  # Path parameter for tournament ID
 *         in: path
 *         required: true
 *         type: integer
 *         description: The ID of the tournament.
 *     responses:
 *       200:
 *         description: Successfully retrieved the number of teams for the tournament
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   team_count:
 *                     type: integer
 *                     description: The total number of teams in the tournament
 *                     example: 10
 *       404:
 *         description: No teams found for the specified tournament
 *       500:
 *         description: Internal server error, failed to retrieve data.
 */
const getTeamCount = async (request, response) => {
    const tournament_id = request.params.id;
    try {
        const result = await pool.query(
            `SELECT
                COUNT(*) AS team_count
            FROM
                teams t
            WHERE
                t.tournament_id = $1
            GROUP BY t.tournament_id`, [tournament_id]
        );

        if (result.rowCount === 0) {
            return response.status(404).json({ message: "No teams found for this tournament" });
        }

        response.status(200).json(result.rows);
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
    addRecordToLeaderboard,
    getLeaderboardByTournament,
    removeFromLeaderboard,
    addTeamToTournament,
    joinTeamAtTournament,
    getEnrolledTeams,
    checkTickets,
    getTeamCount
};