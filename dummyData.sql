-- 1) Dummy data pre SPORT_CATEGORY
INSERT INTO "sport_category" ("category_name", "category_image") VALUES
('Football', 'football.png'),
('Basketball', 'basketball.png');

-- 2) Dummy data pre USERS
INSERT INTO "users" ("first_name", "last_name", "gender", "age", "email", "password", "prefered_location", "prefered_longitude", "prefered_latitude") VALUES
('John', 'Doe', 'Male', 25, 'john.doe@email.com', 'hashed_password1', 'New York', -74.006, 40.7128),
('Jane', 'Smith', 'Female', 28, 'jane.smith@email.com', 'hashed_password2', 'Los Angeles', -118.2437, 34.0522);

-- 3) Dummy data pre PREFERENCES
INSERT INTO "preferences" ("user_id", "sport_id", "status") VALUES
(1, 1, 'Active'),
(2, 2, 'Inactive');

-- 4) Dummy data pre TOURNAMENTS
INSERT INTO "tournaments" ("owner_id", "tournament_name", "category_id", "location_name", "latitude", "longitude", "level", "max_team_size", "game_setting", "entry_fee", "prize_description", "is_public", "additional_info", "status", "date") VALUES
(1, 'NYC Football Cup', 1, 'New York Stadium', 40.7128, -74.0060, 'Amateur', 11, 'Outdoor', 100.00, 'Trophy + $500', TRUE, 'Bring your own gear', 'Upcoming', '2024-06-15'),
(2, 'LA Basketball Open', 2, 'LA Sports Arena', 34.0522, -118.2437, 'Professional', 5, 'Indoor', 50.00, 'Medals & Cash Prize', FALSE, 'Entry only for members', 'Closed', '2024-05-20');

-- 5) Dummy data pre TEAMS
INSERT INTO "teams" ("team_name") VALUES
('NYC Warriors'),
('LA Lakers');

-- 6) Dummy data pre TEAM_MEMBERS
INSERT INTO "team_members" ("user_id", "team_id") VALUES
(1, 1),
(2, 2);

-- 7) Dummy data pre TICKETS
INSERT INTO "tickets" ("user_id", "tournament_id", "ticket_hash") VALUES
(1, 1, 'ABCD1234'),
(2, 2, 'XYZ9876');

-- 8) Dummy data pre LEADERBOARD
INSERT INTO "leaderboard" ("tournament_id", "team_id", "position") VALUES
(1, 1, 1),
(2, 2, 2);

-- 9) Dummy data pre NOTIFICATIONS
INSERT INTO "notifications" ("from_id", "to_id") VALUES
(1, 2),
(2, 1);

select * from users;
