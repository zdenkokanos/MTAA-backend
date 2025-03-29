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