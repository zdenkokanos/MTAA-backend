const pool = require('./pooling'); // Import the database pool
const bcrypt = require('bcrypt');
const path = require('path');
const saltRounds = 10;
const JWT_SECRET = 'fbce145f629cbac3bf16fd7fe6d28cb96246396da7f20ca58293f397a04decab7746cd06afe308f71166dba2977eb9d6f1c059a7eee285f27060b408d36a6948';  // For JWT tokenization, it should typically be stored in an environment variable for security reasons. 
// However, in this example, it is hardcoded to make it easier for supervisors to test and verify the functionality during development.

const jwt = require('jsonwebtoken')


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user, stores their preferences, and returns a JWT token along with the user ID.
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
 *                 format: email
 *                 example: jane.smith@email.com
 *               password:
 *                 type: string
 *                 description: User's plain text password (will be hashed before saving)
 *                 example: myStrongPassword123
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
 *                 description: List of sport IDs the user prefers
 *                 example: [1, 2, 3]
 *               image_path:
 *                 type: string
 *                 description: Optional path to the user's profile image
 *                 example: /uploads/profile123.jpg
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *                   description: JWT token for authentication
 *                 user:
 *                   type: object
 *                   description: Created user object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Bad request – Missing or invalid fields
 *       500:
 *         description: Internal server error
 */
const insertUser = async (request, response) => {
    try {
        // Extracting individual fields
        const { first_name, last_name, email, password, preferred_location, preferred_longitude, preferred_latitude, preferences } = request.body;
        const image_path = request.file ? path.basename(request.file.path) : null;

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user data into the database
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

        const newUser = rows[0];
        const userId = rows[0].id;

        // Insert user preferences if they exist
        if (Array.isArray(preferences) && preferences.length > 0) {
            const preferenceQueries = preferences.map(sportId => {
                return pool.query(
                    `INSERT INTO preferences (user_id, sport_id) VALUES ($1, $2);`,
                    [userId, sportId]
                );
            });

            await Promise.all(preferenceQueries);

            // Generate JWT token
            const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);

            response.status(201).json({ token, user: newUser });
        } else {
            // If there are no preferences, just return user data
            const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);
            response.status(201).json({ token, user: newUser });
        }

    } catch (error) {
        response.status(500).json({ error: error.message });
    }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user using email and password, and returns a JWT token if valid.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jane.smith@email.com
 *               password:
 *                 type: string
 *                 description: User's password (plaintext)
 *                 example: myStrongPassword123
 *     responses:
 *       200:
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token for authenticated user
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 2
 *                     email:
 *                       type: string
 *                       example: jane.smith@email.com
 *       401:
 *         description: Unauthorized – Invalid email or password
 *       500:
 *         description: Internal server error
 */
const login = async (request, response) => {
    const { email, password } = request.body;

    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (rows.length === 0) {
          return response.status(401).json({ message: 'Invalid email or password' });
        }
    
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
    
        if (!passwordMatch) {
          return response.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, JWT_SECRET);

        response.status(200).json({ token, user: { id: user.id, email: user.email } });

    } catch (error) {
        response.status(500).json({ error: error.message });
    }
}



module.exports = {
    insertUser,
    login
};