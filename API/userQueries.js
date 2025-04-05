// queries.js
const pool = require('./pooling'); // Import the database pool
const bcrypt = require('bcrypt');
const saltRounds = 10;
const JWT_SECRET = 'jwt_secret';  // For JWT tokenization, it should typically be stored in an environment variable for security reasons. 
// However, in this example, it is hardcoded to make it easier for supervisors to test and verify the functionality during development.

/**
* @swagger
* /users:
*    get:
*      summary: Retrieve all users
*      description: Returns a list of users with their details.
*      responses:
*        '200':
*          description: A list of users.
*          content:
*            application/json:
*              schema:
*                type: array
*                items:
*                  type: object
*                  properties:
*                    id:
*                      type: integer
*                      example: 2
*                    first_name:
*                      type: string
*                      example: Jane
*                    last_name:
*                      type: string
*                      example: Smith
*                    gender:
*                      type: string
*                      example: Female
*                    age:
*                      type: integer
*                      example: 28
*                    email:
*                      type: string
*                      example: jane.smith@email.com
*                    password:
*                      type: string
*                      description: Hashed user password
*                      example: hashed_password2
*                    preferred_location:
*                      type: string
*                      example: Los Angeles
*                    preferred_longitude:
*                      type: number
*                      format: float
*                      example: -118.2437
*                    preferred_latitude:
*                      type: number
*                      format: float
*                      example: 34.0522
*                    created_at:
*                      type: string
*                      format: date-time
*                      example: "2025-03-29T15:42:37.099Z"
*        '500':
*          description: Internal server error
 */
const getUsers = (request, response) => {
    pool.query('SELECT * FROM users', (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
};

/**
 * @swagger
 * /users/{id}/info:
 *   get:
 *     summary: Get user info by user ID
 *     description: Retrieves detailed information of a user based on their ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user to retrieve information for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 2
 *                 first_name:
 *                   type: string
 *                   example: Jane
 *                 last_name:
 *                   type: string
 *                   example: Smith
 *                 gender:
 *                   type: string
 *                   example: Female
 *                 age:
 *                   type: integer
 *                   example: 28
 *                 email:
 *                   type: string
 *                   example: jane.smith@gmail.com
 *                 preferred_longitude:
 *                   type: number
 *                   example: -118.2437
 *                 preferred_latitude:
 *                   type: number
 *                   example: 24.0522
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                   example: 2025-03-29T15:42:37.099Z
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
const getUserInfo = async (request, response) => {
  try{
    const userID = request.params.id;
    const { rows } = await pool.query(
      `SELECT
        id,
        first_name,
        last_name,
        email,
        preferred_longitude,
        preferred_latitude,
        created_at,
        image_path
      FROM
        users
      WHERE
        users.id = $1;`, [userID]
    );

    if (rows.length === 0){
      return response.status(404).json({ message: "User not found" });
    }

    response.status(200).json(rows[0]);
  }catch(error){
    response.status(500).json({error: error.message});
  }
};

/**
 * @swagger
 * /users/{email}/id:
 *   get:
 *     summary: Retrieve user ID by email
 *     description: Returns the user ID based on their unique email address.
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The email of the user.
 *         example: jane.smith@email.com
 *     responses:
 *       200:
 *         description: User ID retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 2
 *       404:
 *         description: User not found.
 *       500:
 *         description: Internal server error.
 */
const getUserId = async (request, response) => {
  try{
    const userEmail = request.params.email;
    const { rows } = await pool.query(
      `SELECT id FROM users WHERE trim(email) = $1;`, [userEmail]
    );

    if (rows.length === 0){
      return response.status(404).json({ message: "User not found" });
    }

    response.status(200).json(rows[0]);
  }catch(error){
    response.status(500).json({error: error.message});
  }
}

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Insert a new user into the database
 *     description: Adds a new user and returns their unique ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - first_name
 *               - last_name
 *               - gender
 *               - age
 *               - email
 *               - password
 *               - preferred_location
 *               - preferred_longitude
 *               - preferred_latitude
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: Jane
 *               last_name:
 *                 type: string
 *                 example: Smith
 *               gender:
 *                 type: string
 *                 example: Female
 *               age:
 *                 type: integer
 *                 example: 28
 *               email:
 *                 type: string
 *                 example: jane.smith@email.com
 *               password:
 *                 type: string
 *                 description: Hashed user password
 *                 example: hashed_password2
 *               preferred_location:
 *                 type: string
 *                 example: Los Angeles
 *               preferred_longitude:
 *                 type: number
 *                 format: float
 *                 example: -118.2437
 *               preferred_latitude:
 *                 type: number
 *                 format: float
 *                 example: 34.0522
 *               preferences:
 *                 type: array
 *                 items:
 *                   type: integer
 *                   example: 1
 *                 description: List of sport IDs the user prefers
 *                 example: [1, 2, 3]
 *     responses:
 *       201:
 *         description: User successfully created.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 2
 *       400:
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Internal server error.
 */
const insertUser = async (request, response) => {
  try {
    const { first_name, last_name, email, password, preferred_location, preferred_longitude, preferred_latitude, preferences, image_path } = request.body;

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, saltRounds); 

    const { rows } = await pool.query(
      `INSERT INTO
        users (
          first_name,
          last_name,
          email,
          password,
          preferred_location,
          preferred_longitude,
          preferred_latitude,
          image_path
        )
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id;`,
      [first_name, last_name, email, hashedPassword, preferred_location, preferred_longitude, preferred_latitude, image_path]
    );

    const userId = rows[0].id;
    
    if (Array.isArray(preferences) && preferences.length > 0) {
      const preferenceQueries = preferences.map(sportId => {  // map loops over each item in array
        return pool.query(
          `INSERT INTO preferences (user_id, sport_id) VALUES ($1, $2);`,
          [userId, sportId]
        );
      });

      await Promise.all(preferenceQueries);
    }

    response.status(201).json({ id: userId }); // Return the inserted user ID
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

// POST user login creditials and receive their id as sign of successfull login; WILL BE CHANGEG - TOKENIZATION
const loginUser = async (request, response) => {
  try {
    const { email, password } = request.body;

    const { rows } = await pool.query(
      `SELECT id FROM users WHERE email = $1 AND password = $2;`,
      [email, password]
    );

    if (rows.length === 0) {
      return response.status(401).json({ message: "Invalid credentials" });
    }

    response.status(200).json({ id: rows[0].id }); // Return the logged-in user ID
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /users/password:
 *   put:
 *     summary: Change user password
 *     description: Updates the password for a specific user based on their ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - newPassword
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Unique user ID.
 *                 example: 1
 *               newPassword:
 *                 type: string
 *                 description: The new plain password (will be hashed by the server).
 *                 example: newPlainPassword123
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password changed successfully
 *       400:
 *         description: Bad request, missing required fields or invalid data.
 *       500:
 *         description: Internal server error.
 */
const changePassword = async (request, response) => {
  try {
    const { id, newPassword } = request.body;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the password in the database
    await pool.query(
      `UPDATE users SET password = $1 WHERE id = $2;`,
      [hashedPassword, id]
    );

    response.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Edit user profile
 *     description: Updates the user's profile information based on their ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - first_name
 *               - last_name
 *               - age
 *               - gender
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Unique user ID.
 *                 example: 1
 *               first_name:
 *                 type: string
 *                 example: John
 *               last_name:
 *                 type: string
 *                 example: Doe
 *               age:
 *                 type: integer
 *                 example: 30
 *               gender:
 *                 type: string
 *                 example: Male
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *       400:
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Internal server error.
 */
const editProfile = async (request, response) => {
  try {
    const { id, first_name, last_name, age, gender } = request.body;

    await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, age = $3, gender = $4
       WHERE id = $5`,
      [first_name, last_name, age, gender, id]
    );

    response.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /users/preferences:
 *   put:
 *     summary: Edit user preferences
 *     description: Updates the user's location preferences based on their ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - preferred_location
 *               - preferred_longitude
 *               - preferred_latitude
 *             properties:
 *               id:
 *                 type: integer
 *                 description: Unique user ID.
 *                 example: 1
 *               preferred_location:
 *                 type: string
 *                 example: Los Angeles
 *               preferred_longitude:
 *                 type: number
 *                 format: float
 *                 example: -118.2437
 *               preferred_latitude:
 *                 type: number
 *                 format: float
 *                 example: 34.0522
 *     responses:
 *       200:
 *         description: Preferences updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Preferences updated successfully
 *       400:
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Internal server error.
 */
const editPreferences = async (request, response) => {
  try {
    const { id, preferred_location, preferred_longitude, preferred_latitude } = request.body;

    await pool.query(
      `UPDATE users 
       SET preferred_location = $1, preferred_longitude = $2, preferred_latitude = $3
       WHERE id = $4`,
      [preferred_location, preferred_longitude, preferred_latitude, id]
    );

    response.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /users/{id}/tournaments:
 *   get:
 *     summary: Get all tournaments a user is registered for
 *     description: Retrieves all tournaments where a specific user is registered.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user whose tournaments you want to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the tournaments the user is registered for
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the tournament
 *                   tournament_name:
 *                     type: string
 *                     description: The name of the tournament
 *                   category_id:
 *                     type: integer
 *                     description: The ID of the sport category
 *                   location_name:
 *                     type: string
 *                     description: The name of the tournament location
 *                   latitude:
 *                     type: number
 *                     format: float
 *                     description: The latitude of the tournament location
 *                   longitude:
 *                     type: number
 *                     format: float
 *                     description: The longitude of the tournament location
 *                   level:
 *                     type: string
 *                     description: The level of the tournament (e.g., "Amateur", "Professional")
 *                   max_team_size:
 *                     type: integer
 *                     description: The maximum size of a team
 *                   game_setting:
 *                     type: string
 *                     description: The setting of the game (e.g., "Indoor", "Outdoor")
 *                   entry_fee:
 *                     type: number
 *                     format: float
 *                     description: The entry fee for the tournament
 *                   prize_description:
 *                     type: string
 *                     description: The prize for the tournament
 *                   is_public:
 *                     type: boolean
 *                     description: Whether the tournament is public or not
 *                   additional_info:
 *                     type: string
 *                     description: Additional information about the tournament
 *                   status:
 *                     type: string
 *                     description: The status of the tournament (e.g., "Upcoming", "Ongoing", "Closed")
 *       404:
 *         description: No tournaments found for the user
 *       500:
 *         description: Internal server error
 */
const getUsersTournaments = async (request, response) =>{
  const user_id = request.params.id;

  try {
      const result = await pool.query(
          `SELECT
            t.id,
            t.tournament_name,
            t.date,
            t.latitude,
            t.longitude,
            c.category_image
          FROM
            tournaments t
            JOIN team_members tm ON t.id = tm.tournament_id
            JOIN sport_category c on c.id = t.category_id
          WHERE
            tm.user_id = $1 AND t.status='Upcoming'`,[user_id]
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
 * /users/{id}/tournaments/owned:
 *   get:
 *     summary: Get a user's owned tournaments
 *     description: Retrieves a list of tournaments that are owned by the specified user, including details like tournament name, date, location, and category image.
 *     parameters:
 *       - name: id  # Path parameter for user ID
 *         in: path
 *         required: true
 *         type: integer
 *         description: The ID of the user who owns the tournaments.
 *     responses:
 *       200:
 *         description: Successfully retrieved user's owned tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the tournament
 *                     example: 1
 *                   tournament_name:
 *                     type: string
 *                     description: The name of the tournament
 *                     example: "Championship 2025"
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: The date the tournament is scheduled to take place
 *                     example: "2025-05-01"
 *                   latitude:
 *                     type: number
 *                     format: float
 *                     description: The latitude of the tournament location
 *                     example: 40.7128
 *                   longitude:
 *                     type: number
 *                     format: float
 *                     description: The longitude of the tournament location
 *                     example: -74.0060
 *                   category_image:
 *                     type: string
 *                     description: The image associated with the tournament category
 *                     example: "category_image_url.jpg"
 *       404:
 *         description: No tournaments found for the user
 *       500:
 *         description: Internal server error, failed to retrieve data.
 */
const getUsersOwnedTournaments = async (request, response) =>{
  const user_id = request.params.id;

  try {
      const result = await pool.query(
          `SELECT
            t.id,
            t.tournament_name,
            t.date,
            t.latitude,
            t.longitude,
            c.category_image
          FROM
            tournaments t
            JOIN sport_category c on c.id = t.category_id
          WHERE
            t.owner_id = $1`,[user_id]
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
 * /users/{id}/tournaments/history:
 *   get:
 *     summary: Get a user's tournament history
 *     description: Retrieves a list of tournaments the user has participated in, along with their position and category image, for closed tournaments.
 *     parameters:
 *       - name: id  # Path parameter for user ID
 *         in: path
 *         required: true
 *         type: integer
 *         description: The ID of the user.
 *     responses:
 *       200:
 *         description: Successfully retrieved user's tournament history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the tournament
 *                     example: 1
 *                   tournament_name:
 *                     type: string
 *                     description: The name of the tournament
 *                     example: "Tournament A"
 *                   date:
 *                     type: string
 *                     format: date
 *                     description: The date the tournament took place
 *                     example: "2025-04-01"
 *                   position:
 *                     type: integer
 *                     description: The user's position in the tournament
 *                     example: 2
 *                   category_image:
 *                     type: string
 *                     description: The image associated with the tournament category
 *                     example: "image_url.jpg"
 *       404:
 *         description: No tournaments found for the user
 *       500:
 *         description: Internal server error, failed to retrieve data.
 */
const getUsersTournamentsHistory = async (request, response) =>{
  const user_id = request.params.id;

  try {
      const result = await pool.query(
          `SELECT
            t.id,
            t.tournament_name,
            t.date,
            l."position",
            c.category_image
          FROM
            tournaments t
            JOIN team_members ti ON t.id = ti.tournament_id
            LEFT JOIN leaderboard l on t.id = l.tournament_id
            JOIN sport_category c on c.id = t.category_id
          WHERE
            ti.user_id = $1
            AND t.status = 'Closed'`,[user_id]
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
 * /users/{id}/top-picks:
 *   get:
 *     summary: Retrieve top upcoming tournaments based on user preferences
 *     description: Returns up to 5 upcoming public tournaments that match the user's sport preferences and in which the user is not already participating.
 *     operationId: getTopPicks
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user whose preferences will be used to filter tournaments.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       '200':
 *         description: A list of up to 5 upcoming tournaments matching the user's preferences.
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
 *                     example: "NYC Football Cup"
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: "2025-06-30T22:00:00.000Z"
 *                   latitude:
 *                     type: number
 *                     format: float
 *                     example: 40.7128
 *                   longitude:
 *                     type: number
 *                     format: float
 *                     example: -74.006
 *                   category_image:
 *                     type: string
 *                     example: "football.png"
 *       '404':
 *         description: No upcoming tournaments found for this user.
 *       '500':
 *         description: Internal Server Error - Something went wrong on the server.
 */
const getTopPicks = async (request, response) => { 
  try {
      const userID = request.params.id;
      
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
              JOIN preferences p ON t.category_id = p.sport_id
              AND $1 = p.user_id
          WHERE
              t.is_public = TRUE
              AND t.status = 'Upcoming'
              AND t.date > NOW()
              AND t.id NOT IN (
                    SELECT tm.tournament_id
                    FROM team_members tm
                    WHERE tm.user_id = $1
                )
          ORDER BY
              t.date ASC
          LIMIT
              5;`, [userID] // Pass the userID as parameter for query
      );

      if (rows.length === 0) {
        return response.status(404).json({ message: "No upcoming tournaments found for this user" });
    }
      // Send response with the retrieved rows
      response.status(200).json(rows);
  } catch (error) {
      // Handle errors and send a 500 response
      response.status(500).json({ error: error.message });
  }
}; 


// Tickets

/**
 * @swagger
 * /users/{id}/tickets:
 *   get:
 *     summary: Get all tickets for a specific user
 *     description: Retrieves all tickets that belong to a specific user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user whose tickets you want to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the ticket
 *                   user_id:
 *                     type: integer
 *                     description: The ID of the user who purchased the ticket
 *                   tournament_id:
 *                     type: integer
 *                     description: The ID of the tournament for which the ticket is issued
 *                   ticket_hash:
 *                     type: string
 *                     description: A unique identifier (hash) for the ticket
 *       404:
 *         description: No tickets found for the user
 *       500:
 *         description: Internal server error
 */
const getUserTickets = async (request, response) =>{
  const user_id = request.params.id;

  try {
      const result = await pool.query(
          `SELECT
              tm.id,
              t.date,
              sc.category_image
          FROM
              team_members tm
              JOIN tournaments t ON tm.tournament_id = t.id
              JOIN sport_category sc ON t.category_id = sc.id
          WHERE
              user_id = $1`,[user_id]
      );
      
      if (result.rowCount === 0){
          return response.status(404).json({ message: "Tickets not found" });
      }
      response.status(200).json( result.rows )
  } catch (error) {
      response.status(500).json({ error: error.message })
  }
}  

// const getUserQR = async (request, response) => {
//   const user_id = request.params.id;
//   const tournament_id = request.params.tournament_id;

//   try {
//     const result = await pool.query(
//         `SELECT
//             tm.id,
//             t.date,
//             sc.category_image
//         FROM
//             team_members tm
//             JOIN tournaments t ON tm.tournament_id = t.id
//             JOIN sport_category sc ON t.category_id = sc.id
//         WHERE
//             user_id = $1`,[user_id]
//     );



//   }


// }

module.exports = {
    getUsers,
    getUserInfo,
    getUserId,
    insertUser,
    loginUser,
    changePassword,
    editProfile,
    editPreferences,
    getUsersTournaments,
    getUsersTournamentsHistory,
    getTopPicks,
    getUserTickets,
    getUsersOwnedTournaments
};