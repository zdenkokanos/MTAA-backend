// Importing required libraries
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
// Import other modules
const dbUser = require('./userQueries')
const dbTournament = require('./tournamentQueries')
const dbCategories = require('./sportCategoryQueries')
const dbTicket = require('./ticketQueries')

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
//Get
app.get('/tournaments', dbTournament.getTournaments);
app.get('/tournaments/info/:id', dbTournament.getTournamentInfo);
// Define routes, endpoints for functionality
app.get('/users', dbUser.getUsers);
app.get('/users/info/:id', dbUser.getUserInfo);
app.get('/users/id/:email', dbUser.getUserId);

//Post
//Tournaments
app.post('/tournaments', dbTournament.createTournament);
//Users
app.post('/users', dbUser.insertUser);
app.post('/users/login', dbUser.loginUser);

// Put
app.put('/users/changePassword', dbUser.changePassword)
app.put('/users/editProfile', dbUser.editProfile)
app.put('/users/editPreferences', dbUser.editPreferences)
app.put('/tournaments/edit', dbTournament.editTournament)

app.get('/categories/:sportName', dbCategories.getCategoriesId)

// Start the server and listen on specified port
app.listen(port, () => {
  console.log(`App running on port ${port}. Have fun.`)
})