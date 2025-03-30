# 🛠 How to setup express backend

## 1. Create database (I used pgamin for that)
This is an example:
```sql
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "first_name" VARCHAR(100),
  "last_name" VARCHAR(100),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
You can enter also dummy data:
```sql
INSERT INTO "users" ("first_name", "last_name") VALUES
('John', 'Doe'),
('Jane', 'Smith');

```
## 2. Setup express server
- create folder for the project `mkdir folder_name`
- enter this folder `cd folder_name`
- run npm `init -y` to create a `package.json` file
- add node modules and install Express `npm i express pg` (for the server and node-postgres to connect to PostgreSQL)
- create `index.js` which is the entry point for the server
- insert this code to `index.js`:
```
// Importing required libraries
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
// Import other modules
// const db = require('./example') // in this file we use ./queries

// Middleware that parses incoming requests with JSON payloads
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// Define a simple route for the root of the application
app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

// Define routes, endpoints for functionality here

// Start the server and listen on specified port
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
```
- start the server with `node index.js`
- go to `http://localhost:3000` to validate connection

# 3. Connecting to postgres database
- create new file `pooling.js` and add it to the `.gitignore` so that it is not accessible from version control
- add this code to the file (change {} to your data):
```
const Pool = require('pg').Pool
const pool = new Pool({
  user: '{db_username}',
  host: '{localhost}',
  database: '{db_name}',
  password: '{db_password}',
  port: 5432, // which is well-know port for postgre
});
module.exports = pool;  // Export the pool for use in queries.js
```
- you can view databse users after entering postgre in terminal `psql` and then `\du`, you can quit with `\q`

# 4. Connecting files together and finishing setup
- create file `queries.js`, here you will write actual queries
- dont forget to link this file to `index.js` by adding this line to `index.js`:
```const db = require('./queries')``` in the beggining of the `index.js` file
- add this line to the `queries.js`: 
```const pool = require('./pooling'); // Import the database pool```
- now you can write actual queries in `queries.js`

# 5. Queries completion
- write a function in `queries.js`, for example:
```javascript
const getUsers = (request, response) => {
  pool.query('SELECT * FROM users', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};
```
- dont forget to add to `index.js` the routes for queries functions:
```
app.get('/users', db.getUsers); // for example
```
- in the end of this file, export the functions
```
// Export the function so it can be used in other files
module.exports = {
  getUsers
};
```

# 6. Test and bulid in Postman
- ensure `pooling.js` is correctly set with your login creditials
- ensure server is running (`node index.js`)
- open `postman` app
- enter localhost or IP based on `node index.js` output (for example: `http://localhost:3000/`)


# 7. Potentital problems
### 1. Permission denied:
You should manipulate with the database from user that created the database. You do have 2 options how to solve this problem.
1.  Change `polling.js` to superuser and restart the server with `node index.js`
2.  Or grant permission from superuser to the user you would like to user for this DB with `psql -U <superuser name> -d <database name>` and for example `GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO <database name>;`

### 2. Changes do not work 
You have to restart the server after each change.
`control+c` and `node index.js` over and over

# 8. Completed example code 
## index.js
```javascript
//// index.js
// Importing required libraries
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
// Import other modules
const db = require('./queries')

// Middleware that parses incoming requests with JSON payloads
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// Define a simple route for the root of the application
app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

// Define routes, endpoints for functionality
app.get('/users', db.getUsers);

// Start the server and listen on specified port
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
```
## pooling.js
```javascript
//// polling.js
const Pool = require('pg').Pool
const pool = new Pool({
  user: '{username}',
  host: '{localhost}',
  database: '{db_name}',
  password: '{username password}',
  port: 5432,
});
module.exports = pool;  // Export the pool for use in queries.js
```
## queries.js
```javascript
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

// Export the function so it can be used in other files
module.exports = {
    getUsers
};
```
## .gitignore
```
FOLDER_NAME/node_modules/
pooling.js
```
# 9. Test, study and play along with backend
If you've done everything correctly, you should see this after entering `http://localhost:3000/users` to postman
``` json
[
    {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe"
    },
    {
        "id": 2,
        "first_name": "Jane",
        "last_name": "Smith"
    }
]
```
# 10. THE END
Now, write down every usecase for databse calls and code api call for each usecase. Test it in the postman.