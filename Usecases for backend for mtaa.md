# Usecases for backend for mtaa

# 1. User operations
- user registration (first_name, last_name, email, password, age, gender, prefSports, city(longtitude/latitude)) -> successfull registration
- user login (email, password) -> successfull login
- forgot password (email, password) -> new password
- edit profile (new first_name, new_lastname, new_email, age, gender) ->
- edit preferences (new prefSport, new city) 
- deletion () -> delete user
- get information about user () -> (first_name, last_name, email, age, gender, prefSports, city(longtitude/latitude))

# 2. Tickets
- generate ticket (userid, tournamentid) -> hash // hash from (userid * tournamentid)??
- getTicketID () -> hash
- get allTickets (userID) -> {tickets}
- validateTicket (hash) -> validate(yes/no) // hash received from frontend from qr code

# 3. Tournaments 
- list tournaments (all/category) -> {tournaments}
- getInfo (toruanmentID) -> tournament info
- createTournament(name, sport, level, place, date&time, teamsize, setting, entryFee, prizeDescription, mode, additionalInfo) -> 
- editTournament parameters (user_id, NEW: name, sport, level, place, date&time, teamsize, setting, entryFee, prizeDescription, mode, additionalInfo) ->
- tournamentDeletion (userID, tournamentID) ->
- startTournament (userID, tournamenID) -> change 'ongoling' state
- stopTournament (userID, tournamenID) -> change 'ongoling' state
- editLeaderboard (teamID, position) ->
- shareTournament (tournamentID) -> link?

# 4. Tournament Participants
- registerTeam(teamname) -> id?
- registerOnTournament (toruanmentID, userID, teamID)
- unregisterTeam (teamID)  ->
- unregisterMember (teamID, userID) ->
- getTeams () -> {teamIDs} // to find if team exists or is new
- getTeamsMembers (teamID) -> {userIDs}
- getLeaderboard() -> {leaderboard}

# 5. Matches
- getUserPosition (userID, tournamentID) -> users position in leaderboard
- getTournaments (userID)

# 6. Notifications
createNotification (userID, text) ->
getNotifications (userID) -> {notifications}
markNotificationAsRead (userID, notificationID) ->