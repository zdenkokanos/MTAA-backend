// Importing required libraries
const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000

const checkUserIdentity = require('./middleware/checkUserIdentity')
const verifyToken = require('./middleware/authMiddleware');
app.get('/protected', verifyToken, (request, response) => {
  response.json({ message: `Hello user ${request.user.userId}` });
});

// Import other modules
const dbUser = require('./userQueries')
const dbTournament = require('./tournamentQueries')
const dbCategories = require('./sportCategoryQueries')
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

// For each protected endpoint verify token
app.use('/protected', verifyToken);
//TODO: Pridat mazanie je to v podmienkach
//// ## GETs ##
// Users
app.get('/users', verifyToken, dbUser.getUsers); //?
app.get('/users/:id/info', verifyToken, checkUserIdentity, dbUser.getUserInfo);
app.get('/users/:email/id', dbUser.getUserId); //?
app.get('/users/:id/tournaments', verifyToken, checkUserIdentity, dbUser.getUsersTournaments);
app.get('/users/:id/tournaments/history', verifyToken, checkUserIdentity, dbUser.getUsersTournamentsHistory);
app.get('/users/:id/tournaments/owned', verifyToken, checkUserIdentity, dbUser.getUsersOwnedTournaments);
app.get('/users/:id/top-picks', dbUser.getTopPicks);
app.get('/users/:id/tickets', verifyToken, checkUserIdentity, dbUser.getUserTickets);
app.get('/users/:id/tickets/:ticket_id/qr', verifyToken, checkUserIdentity, dbUser.getTicketQR);
// Tournaments
app.get('/tournaments', dbTournament.getTournaments);
app.get('/tournaments/:id/info', dbTournament.getTournamentInfo);
app.get('/tournaments/:id/leaderboard', dbTournament.getLeaderboardByTournament);
app.get('/tournaments/:id/enrolled', dbTournament.getEnrolledTeams);
app.get('/tournaments/categories', dbCategories.getAllCategories);
app.get('/tournaments/:id/teams/count', dbTournament.getTeamCount);
// Tickets

//// ## POSTs ##
// Users
app.post('/auth/register', dbAuth.insertUser);
app.post('/auth/login', dbAuth.login); 
//Tournaments
app.post('/tournaments', verifyToken, dbTournament.createTournament);
app.post('/tournaments/:id/register', verifyToken, dbTournament.addTeamToTournament);
app.post('/tournaments/:id/join_team', verifyToken, dbTournament.joinTeamAtTournament);
app.post('/tournaments/leaderboard/add', verifyToken, dbTournament.addRecordToLeaderboard);
app.post('/tournaments/:id/check-tickets', verifyToken, dbTournament.checkTickets);

//// ## PUTs ##
// Users
app.put('/users/changePassword', verifyToken, dbUser.changePassword); //!
app.put('/users/editProfile', verifyToken, dbUser.editProfile); //!
app.put('/users/editPreferences', verifyToken, dbUser.editPreferences); //!
// Tournaments
app.put('/tournaments/edit', verifyToken, dbTournament.editTournament);
app.put('/tournaments/:id/start', verifyToken, dbTournament.startTournament);
app.put('/tournaments/:id/stop', verifyToken, dbTournament.stopTournament);

//// ## DELETEs ##
app.delete('/tournaments/leaderboard/remove', verifyToken, dbTournament.removeFromLeaderboard);

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