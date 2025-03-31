//// queries.js
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
      `select
      id,
      first_name,
      last_name,
      gender,
      age,
      email,
      preferred_longitude,
      preferred_latitude,
      created_at
    from
      users
    where
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

// Export the function so it can be used in other files
module.exports = {
    getUsers,
    getUserInfo,
    getUserId
};