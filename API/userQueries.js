// queries.js
const pool = require('./pooling'); // Import the database pool

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
 * /users/info/{id}:
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
        gender,
        age,
        email,
        preferred_longitude,
        preferred_latitude,
        created_at
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
 * /users/id/{email}:
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
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
    const { first_name, last_name, gender, age, email, password, preferred_location, preferred_longitude, preferred_latitude } = request.body;

    const { rows } = await pool.query(
      `INSERT INTO
        users (
          first_name,
          last_name,
          gender,
          age,
          email,
          password,
          preferred_location,
          preferred_longitude,
          preferred_latitude
        )
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id;`,
      [first_name, last_name, gender, age, email, password, preferred_location, preferred_longitude, preferred_latitude]
    );

    response.status(201).json({ id: rows[0].id }); // Return the inserted user ID
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
 *                 description: The new hashed password.
 *                 example: hashedPassword1
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
 *         description: Bad request, missing required fields.
 *       500:
 *         description: Internal server error.
 */
const changePassword = async (request, response) => {
  try {
    const { id, newPassword } = request.body;

    await pool.query(
      `UPDATE users SET password = $1 WHERE id = $2;`,
      [newPassword, id]
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

module.exports = {
    getUsers,
    getUserInfo,
    getUserId,
    insertUser,
    loginUser,
    changePassword,
    editProfile,
    editPreferences
};