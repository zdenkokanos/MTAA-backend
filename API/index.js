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


//// ## GETs ##
// Users
app.get('/users', dbUser.getUsers);
app.get('/users/info/:id', dbUser.getUserInfo);
app.get('/users/id/:email', dbUser.getUserId);
// Tournaments
app.get('/tournaments', dbTournament.getTournaments);
app.get('/tournaments/info/:id', dbTournament.getTournamentInfo);
// Sport categories
app.get('/categories/:sportName', dbCategories.getCategoriesId)

//// ## POSTs ##
// Users
app.post('/users', dbUser.insertUser);
app.post('/users/login', dbUser.loginUser); // not in documentation, rewrite probably
//Tournaments
app.post('/tournaments', dbTournament.createTournament);
app.post('/tournaments/leaderboard/add', dbTournament.addRecordToLeaderboard);


//// ## PUTs ##
// Users
app.put('/users/changePassword', dbUser.changePassword)
app.put('/users/editProfile', dbUser.editProfile)
app.put('/users/editPreferences', dbUser.editPreferences)
// Tournaments
app.put('/tournaments/edit', dbTournament.editTournament)
app.put('/tournaments/start/:id', dbTournament.startTournament)
app.put('/tournaments/stop/:id', dbTournament.stopTournament)

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