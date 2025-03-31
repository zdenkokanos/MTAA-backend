// queries.js
const pool = require('./pooling'); // Import the database pool

// Query to get all users from the database
const getUsers = (request, response) => {
    pool.query('SELECT * FROM users', (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
};

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

// Query to insert a new user into the database
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

// Login
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

// Export the function so it can be used in other files
module.exports = {
    getUsers,
    getUserInfo,
    getUserId,
    insertUser,
    loginUser
};