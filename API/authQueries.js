const pool = require('./pooling'); // Import the database pool
const bcrypt = require('bcrypt');
const saltRounds = 10;
const JWT_SECRET = 'jwt_secret';  // For JWT tokenization, it should typically be stored in an environment variable for security reasons. 
// However, in this example, it is hardcoded to make it easier for supervisors to test and verify the functionality during development.