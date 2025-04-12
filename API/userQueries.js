// queries.js
const pool = require('./pooling'); // Import the database pool
const bcrypt = require('bcrypt');
const geolib = require('geolib');
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
*                    email:
*                      type: string
*                      example: jane.smith@email.com
*                    password:
*                      type: string
*                      description: Hashed user password
*                      example: $2b$10$NHCkUIUr7M35glDvYIyNj.qbvOSQ11akitOFrYGP6mhhzhIqS52pe
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
*                    image_path:
*                      type: string
*                      example: imgs/2.png
*        '404':
*          description: User not found
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
 *                 image_path:
 *                   type: string
 *                   example: user/images/img.png
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
 * /users/:email/id:
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
 * /users/changePassword:
 *   put:
 *     summary: Change user password
 *     description: Updates the password for a specific user based on their ID, after validating the old password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: The new plain password (will be hashed by the server).
 *                 example: newPlainPassword123
 *               oldPassword:
 *                 type: string
 *                 example: oldPlainPassword123
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
 *         description: Old password is incorrect
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error.
 */
const changePassword = async (request, response) => {
  
  const userId = request.user.userId; // from token
  const { newPassword, oldPassword } = request.body;

  try {

    const { rows } = await pool.query(
      `SELECT password FROM users WHERE id = $1`,
      [userId]
    );

    if (rows.length === 0){
      return response.status(404).json({ message: 'User not found, invalid user ID.' });
    }

    const currentHashedPassword = rows[0].password;

    const isMatch = await bcrypt.compare(oldPassword, currentHashedPassword);
    if (!isMatch) {
      return response.status(400).json({ message: 'Old password is incorrect' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await pool.query(
      `UPDATE users SET password = $1 WHERE id = $2`,
      [hashedPassword, userId]
    );


    response.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /users/editProfile:
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
 *         description: Bad request
 *       500:
 *         description: Internal server error.
 */
const editProfile = async (request, response) => {
  try {
    const { first_name, last_name, age, gender } = request.body;
    const userId = request.user.userId; // from token

    await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, age = $3, gender = $4
       WHERE id = $5`,
      [first_name, last_name, age, gender, userId]
    );

    response.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /users/editPreferences:
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
    const { preferred_location, preferred_longitude, preferred_latitude } = request.body;
    const userId = request.user.userId; // from token

    await pool.query(
      `UPDATE users 
       SET preferred_location = $1, preferred_longitude = $2, preferred_latitude = $3
       WHERE id = $4`,
      [preferred_location, preferred_longitude, preferred_latitude, userId]
    );

    response.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
};

/**
 * @swagger
 * /users/:id/tournaments:
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
 *                     example: 11
 *                   tournament_name:
 *                     type: string
 *                     example: Rugby Battle Cup
 *                   date:
 *                     type: date
 *                     example: 2025-10-19T22:00:00.000Z
 *                   latitude:
 *                     type: number
 *                     format: float
 *                     example: 51.5074
 *                   longitude:
 *                     type: number
 *                     format: float
 *                     example: -0.1278
 *                   category_image:
 *                     type: string
 *                     example: rugby.png
 *       404:
 *         description: Tournament not found
 *       500:
 *         description: Internal server error
 */
const getUsersTournaments = async (request, response) =>{
  const user_id = request.params.id;

  try {
      const result = await pool.query(
          `SELECT
            tm.id,
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
 *     description: Retrieves a list of tournaments that are owned by the specified user.
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
 *         description: Tournament not found
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
 *         description: Tournament not found
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
 *     description: Returns up to 5 upcoming public tournaments that match the user's sport preferences and in which the user is not already participating in.
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
 *                     example: 11
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-03-29T15:42:37.099Z
 *                   category_image:
 *                     type: string
 *                     example: rugby.png
 *       404:
 *         description: Tickets not found
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

/**
 * @swagger
 * /users/{id}/tickets/{ticket_id}/qr: 
 *   get:
 *     summary: Get ticket details for QR generation
 *     description: Retrieves ticket information, including the associated team name and code, based on the provided ticket ID for a specific user.
 *     parameters:
 *       - name: id  # Path parameter for user ID
 *         in: path
 *         required: true
 *         type: integer
 *         description: The ID of the user associated with the ticket.
 *       - name: ticket_id  # Path parameter for ticket ID
 *         in: path
 *         required: true
 *         type: integer
 *         description: The ID of the ticket.
 *     responses:
 *       200:
 *         description: Successfully retrieved ticket details for QR generation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ticket:
 *                     type: string
 *                     description: The ticket code
 *                     example: "TICKET123456"
 *                   team_name:
 *                     type: string
 *                     description: The name of the team associated with the ticket
 *                     example: "Team A"
 *                   code:
 *                     type: string
 *                     description: The unique code for the team
 *                     example: "TEAMCODE789"
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Internal server error, failed to retrieve data.
 */
const getTicketQR = async (request, response) => {
  const ticket_id = request.params.ticket_id;  
  const user_id = request.params.id;

  try {
    const result = await pool.query(
        `SELECT
            tm.ticket,
            t.team_name,
            t.code
        FROM
            team_members tm
            JOIN teams t ON tm.team_id = t.id
        WHERE
           tm.user_id = $1 AND tm.id = $2`, [user_id, ticket_id]
    );
    
    if (result.rowCount === 0) {
        return response.status(404).json({ message: "Ticket not found" });
    }
    
    response.status(200).json(result.rows);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}


/**
 * @swagger
 * /users/check-email:
 *   get:
 *     summary: Check if an email already exists in the system
 *     description: This endpoint checks if the provided email address is already registered in the system.
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *         description: The email address to check
 *     responses:
 *       200:
 *         description: Email exists or is available
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 exists:
 *                   type: boolean
 *                   description: Indicates whether the email is already registered
 *                   example: true
 *       500:
 *         description: Internal Server Error - something went wrong with the server
 */
const checkEmailExists = async (request, response) => {
  const { email } = request.body;

  try {
    const { rows } = await pool.query(
      `SELECT id FROM users WHERE email = $1;`, [email]
    );

    if (rows.length > 0) {
      return response.status(200).json({ exists: true });
    } else {
      return response.status(200).json({ exists: false });
    }
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /users/{id}/tournaments-reccomendations:
 *   get:
 *     summary: Get recommended tournaments for a user
 *     description: Returns a list of up to 5 upcoming tournaments based on the user's preferred sport categories and closest geographical location. Results are first filtered by distance and then sorted by the soonest date.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user whose tournament recommendations are being requested.
 *     responses:
 *       200:
 *         description: Successfully retrieved a list of recommended tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Tournament ID
 *                     example: 12
 *                   tournament_name:
 *                     type: string
 *                     description: Name of the tournament
 *                     example: Streetball Open 2025
 *                   date:
 *                     type: string
 *                     format: date-time
 *                     description: Date of the tournament
 *                     example: 2025-12-01T00:00:00.000Z
 *                   latitude:
 *                     type: number
 *                     format: float
 *                     description: Latitude of the tournament location
 *                   longitude:
 *                     type: number
 *                     format: float
 *                     description: Longitude of the tournament location
 *                   category_image:
 *                     type: string
 *                   distance:
 *                     type: string
 *                     description: Distance in kilometers from the user's preferred location
 *                     example: "15.72"
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error, failed to retrieve recommended tournaments.
 */
const getRecommendedTournaments = async (request, response) => {

  const userId = request.params.id;
  
  try{
      // 1. load users coordinates
      const userResult = await pool.query(
          `SELECT preferred_longitude, preferred_latitude FROM users WHERE id = $1`,
          [userId]
      )
      if (userResult.rows.length === 0){
          return response.status(404).json({ message: 'User not found' });
      }
      const userLat = userResult.rows[0].preferred_latitude;
      const userLong = userResult.rows[0].preferred_longitude;
      
      
      // 2. load tournaments
      const tournamentResult = await pool.query(
          `WITH userPreferedCategories as (
              SELECT
                  sc.id,
                  sc.category_image
              FROM
                  preferences pp
              JOIN sport_category sc ON sc.id = pp.sport_id
              WHERE user_id = $1
          )
          SELECT
              tt.id,
              tt.tournament_name,
              tt.date,
              tt.latitude,
              tt.longitude,
              upc.category_image
          FROM
              tournaments tt
          JOIN userPreferedCategories upc on upc.id = tt.category_id
          WHERE status = 'Upcoming';`,
          [userId]
      );
      const tournaments = tournamentResult.rows;

      
      // 3. Calculate distance for each tournament
      const tournamentsWithDistance = tournaments.map(t => {
          const tournamentLat = parseFloat(t.latitude); 
          const tournamentLong = parseFloat(t.longitude); 

          const distance = geolib.getDistance(
              { latitude: userLat, longitude: userLong },
              { latitude: tournamentLat, longitude: tournamentLong }
          );

          return {
              ...t, // include all tournament data
              distance: (distance / 1000).toFixed(2) // convert to kilometers
          };
      });

      
  
      // 4. Sort by distance and take top 5
      const top5Closest = tournamentsWithDistance
          .filter(t => t.date) // vyhodí null/undefined dátumy
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5);

      // 5. Sort those 5 by date (soonest first)
      const sortedByDate = top5Closest.sort(
          (a, b) => new Date(a.date) - new Date(b.date)
      );
      
      response.status(200).json(sortedByDate);


  }catch(error){
      response.status(500).json({ error: error.message });
  }
};
module.exports = {
    getUsers,
    getUserInfo,
    getUserId,
    loginUser,
    changePassword,
    editProfile,
    editPreferences,
    getUsersTournaments,
    getUsersTournamentsHistory,
    getTopPicks,
    getUserTickets,
    getUsersOwnedTournaments,
    getTicketQR,
    checkEmailExists,
    getRecommendedTournaments
};