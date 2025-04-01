const pool = require('./pooling'); // Import the database pool

/**
 * @swagger
 * /tickets/byuser/{id}:
 *   get:
 *     summary: Get all tickets for a user
 *     description: Retrieves all tickets associated with a specific user.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the user whose tickets you want to retrieve
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the ticket
 *                   user_id:
 *                     type: integer
 *                     description: The ID of the user who purchased the ticket
 *                   tournament_id:
 *                     type: integer
 *                     description: The ID of the tournament for which the ticket is issued
 *                   ticket_hash:
 *                     type: string
 *                     description: A unique identifier (hash) for the ticket
 *       404:
 *         description: No tickets found for the user
 *       500:
 *         description: Internal server error
 */
const getUserTickets = async (request, response) =>{
    const user_id = request.params.id;

    try {
        const result = await pool.query(
            `SELECT
                *
            FROM
                tickets
            WHERE
                user_id= $1
            `,[user_id]
        );
        
        if (result.rowCount === 0){
            return response.status(404).json({ message: "Tickets not found" });
        }
        response.status(200).json( result.rows )
    } catch (error) {
        response.status(500).json({ erro: error.message })
    }
}

module.exports = {
    getUserTickets
};