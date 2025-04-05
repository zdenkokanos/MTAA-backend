const pool = require('./pooling'); // Import the database pool
const bcrypt = require('bcrypt');
const saltRounds = 10;
const JWT_SECRET = 'fbce145f629cbac3bf16fd7fe6d28cb96246396da7f20ca58293f397a04decab7746cd06afe308f71166dba2977eb9d6f1c059a7eee285f27060b408d36a6948';  // For JWT tokenization, it should typically be stored in an environment variable for security reasons. 
// However, in this example, it is hardcoded to make it easier for supervisors to test and verify the functionality during development.

const jwt = require('jsonwebtoken')


/**
 * @swagger
 * /auth/register:
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
    
        const newUser = rows[0];
        const userId = rows[0].id;
        
        if (Array.isArray(preferences) && preferences.length > 0) {
            const preferenceQueries = preferences.map(sportId => {  // map loops over each item in array
            return pool.query(
                `INSERT INTO preferences (user_id, sport_id) VALUES ($1, $2);`,
                [userId, sportId]
            );
            });

            
            await Promise.all(preferenceQueries);
            
            //generate token
            const token = jwt.sign({ userId: newUser.id }, JWT_SECRET);
            
            response.status(201).json({ token, user: newUser });
        }
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
};

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