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

// Query to insert a new user into the database
const insertUser = (request, response) => {
    const { first_name, last_name, gender, age, email, password, prefered_location, prefered_longitude, prefered_latitude } = request.body;

    // Insert data into the 'users' table
    pool.query(
        'INSERT INTO users (first_name, last_name, gender, age, email, password, prefered_location, prefered_longitude, prefered_latitude) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
        [first_name, last_name, gender, age, email, password, prefered_location, prefered_longitude, prefered_latitude],
        (error, results) => {
            if (error) {
                throw error;
            }
            response.status(201).json({ id: results.rows[0].id }); // Return the inserted user ID
        }
    );
};

// Export the functions so they can be used in other files
module.exports = {
    getUsers,
    insertUser
};