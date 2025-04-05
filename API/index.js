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
const dbAuth = require('./authQueries')

// Import Swagger and setup
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

// Middleware that parses incoming requests with JSON payloads
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// Swagger definition
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Tournament API',
      version: '1.0.0',
      description: 'API for managing tournaments and users',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Localhost
      },
    ],
  },
  apis: ['*.js'], 
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
// Serve Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Define a simple route for the root of the application
app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' })
})

//TODO: Pridat mazanie je to v podmienkach
//// ## GETs ##
// Users
app.get('/users', dbUser.getUsers);
app.get('/users/:id/info', dbUser.getUserInfo);
app.get('/users/:email/id', dbUser.getUserId);
app.get('/users/:id/tournaments', dbUser.getUsersTournaments);
app.get('/users/:id/tournaments/history', dbUser.getUsersTournamentsHistory);
app.get('/users/:id/tournaments/owned', dbUser.getUsersOwnedTournaments);
app.get('/users/:id/top-picks', dbUser.getTopPicks);
app.get('/users/:id/tickets', dbUser.getUserTickets)
// Tournaments
app.get('/tournaments', dbTournament.getTournaments);
app.get('/tournaments/:id/info', dbTournament.getTournamentInfo);
app.get('/tournaments/:id/leaderboard', dbTournament.getLeaderboardByTournament);
// Sport categories
app.get('/categories/:sportName', dbCategories.getCategoriesId)  // TODO: neviem ci treba
app.get('/categories', dbCategories.getAllCategories) // TODO: dal by som tournaments/categories
// Tickets

//// ## POSTs ##
// Users
app.post('/users', dbUser.insertUser);
app.post('/users/login', dbUser.loginUser); // not in documentation, rewrite probably // zmenit na REST
//Tournaments
app.post('/tournaments', dbTournament.createTournament);
app.post('/tournaments/:id/register', dbTournament.addTeamToTournament);
app.post('/tournaments/:id/join_team', dbTournament.joinTeamAtTournament);
app.post('/tournaments/leaderboard/add', dbTournament.addRecordToLeaderboard);


//// ## PUTs ##
// Users
app.put('/users/changePassword', dbUser.changePassword)
app.put('/users/editProfile', dbUser.editProfile)
app.put('/users/editPreferences', dbUser.editPreferences)
// Tournaments
app.put('/tournaments/edit', dbTournament.editTournament)
app.put('/tournaments/:id/start', dbTournament.startTournament)
app.put('/tournaments/:id/stop', dbTournament.stopTournament)

// Start the server and listen on specified port
app.listen(port, () => {
  console.log(`App running on port ${port}. Have fun.`)
})


// swagger boilerplate
// /**
//  * @swagger
//  * <url>:
//  *  get:
//  *    summary:
//  *    description:
//  *    parameters:
//  *    responses: 
//  */