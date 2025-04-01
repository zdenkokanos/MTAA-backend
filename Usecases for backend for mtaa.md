# Usecases for backend for mtaa
T:Z
12:5 from 32

# 1. User operations
✔T get all users ✔
✔T get information about user () -> (first_name, last_name, email, age, gender, prefSports, city(longtitude/latitude)) ✔
✔T get user ID based on email (email) -> id ✔
✔Z user registration (first_name, last_name, email, password, age, gender, prefSports, city(longtitude/latitude)) -> successfull registration ✔
✔Z user login (email, password) -> successfull login ✔
✔T change password (email, password) -> new password ✔
✔T edit profile (new first_name, new_lastname, new_email, age, gender) -> //v profile edit-profile //// Frontend pošle JSON so vsetkymi hodnotami na ktore sa ma zmenit - nemalo by byt tazke v reactNative, lebo si zoberies get/users/info/id a zmenis co treba ✔
✔T edit preferences (new prefSport, new city) ✔
✔T getUsersTournament (userId) -> ✔

# 2. Tickets
- generate ticket (userid, tournamentid) -> hash // generate randomly
- getTicketID () -> hash
- get allTickets (userID) -> {tickets}
- validateTicket (hash) -> validate(yes/no) // hash received from frontend from qr code

# 3. Tournaments 
✔Z list tournaments (category) -> {tournaments} ✔
✔Z createTournament(name, sport, level, place, date&time, teamsize, setting, entryFee, prizeDescription, mode, additionalInfo) ✔
✔Z getInfo (toruanmentID) -> tournament info ✔
✔T editTournament parameters (user_id, NEW: name, sport, level, place, date&time, teamsize, setting, entryFee, prizeDescription, mode, additionalInfo) -> ✔
✔T startTournament (userID, tournamenID) -> change 'ongoling' state ✔
✔T stopTournament (userID, tournamenID) -> change 'ongoling' state ✔
✔T editLeaderboard (teamID, position) -> ✔
✔T getLeaderboardByTournament (tournament_id) -> ✔


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

# 6. Notifications
- createNotification (userID, text) ->
- getNotifications (userID) -> {notifications}
- markNotificationAsRead (userID, notificationID) ->

# 7. challanges and considerations
- reset password 
- premenit age na birthyear
- tournamentDeletion (userID, tournamentID) ->
- deletion () -> delete user
- shareTournament (tournamentID) -> link?