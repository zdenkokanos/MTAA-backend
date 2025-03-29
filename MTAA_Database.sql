-- 1) table SPORT_CATEGORY (firstly create this because TOURNAMENTS reference to this)
CREATE TABLE "sport_category" (
  "id" SERIAL PRIMARY KEY,
  "category_name" VARCHAR(100),
  "category_image" VARCHAR(255)
);

-- 2) table USERS
CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "first_name" VARCHAR(100),
  "last_name" VARCHAR(100),
  "gender" VARCHAR(20),
  "age" INTEGER,
  "email" VARCHAR(100) NOT NULL UNIQUE,
  "password" VARCHAR(150) NOT NULL,
  "prefered_location" VARCHAR(100),
  "prefered_longitude" FLOAT,
  "prefered_latitude" FLOAT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN "users"."prefered_location" IS 'In case of not approving GPS';
COMMENT ON COLUMN "users"."created_at" IS 'Date of registration';

-- 3) table PREFERENCES
CREATE TABLE "preferences" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "sport_id" INTEGER NOT NULL,
  "status" VARCHAR(20),
  CONSTRAINT fk_preferences_user FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT fk_preferences_sport FOREIGN KEY ("sport_id") REFERENCES "sport_category" ("id") ON DELETE CASCADE
);

-- 4) table TOURNAMENTS
CREATE TABLE "tournaments" (
  "id" SERIAL PRIMARY KEY,
  "owner_id" INTEGER NOT NULL,
  "tournament_name" VARCHAR(100),
  "category_id" INTEGER NOT NULL,
  "location_name" VARCHAR(100),
  "latitude" FLOAT,
  "longitude" FLOAT,
  "level" VARCHAR(20),
  "max_team_size" INTEGER,
  "game_setting" VARCHAR(20),
  "entry_fee" FLOAT,
  "prize_description" VARCHAR(100),
  "is_public" BOOLEAN,
  "additional_info" VARCHAR(100),
  "status" VARCHAR(20),
  "date" DATE,
  CONSTRAINT fk_tournaments_owner FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT fk_tournaments_category FOREIGN KEY ("category_id") REFERENCES "sport_category" ("id") ON DELETE CASCADE
);

-- 5) table TEAMS
CREATE TABLE "teams" (
  "id" SERIAL PRIMARY KEY,
  "team_name" VARCHAR(100) NOT NULL
);

-- 6) table TEAM_MEMBERS
CREATE TABLE "team_members" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "team_id" INTEGER NOT NULL,
  CONSTRAINT fk_team_members_user FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT fk_team_members_team FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE
);

-- 7) table TICKETS
CREATE TABLE "tickets" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "tournament_id" INTEGER NOT NULL,
  "ticket_hash" VARCHAR(20) UNIQUE,
  CONSTRAINT fk_tickets_user FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT fk_tickets_tournament FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") ON DELETE CASCADE
);

-- 8) table LEADERBOARD
CREATE TABLE "leaderboard" (
  "tournament_id" INTEGER NOT NULL,
  "team_id" INTEGER NOT NULL,
  "position" INTEGER,
  PRIMARY KEY ("tournament_id", "team_id"),
  CONSTRAINT fk_leaderboard_tournament FOREIGN KEY ("tournament_id") REFERENCES "tournaments" ("id") ON DELETE CASCADE,
  CONSTRAINT fk_leaderboard_team FOREIGN KEY ("team_id") REFERENCES "teams" ("id") ON DELETE CASCADE
);

-- 9) table NOTIFICATIONS
CREATE TABLE "notifications" (
  "id" SERIAL PRIMARY KEY,
  "from_id" INTEGER NOT NULL,
  "to_id" INTEGER NOT NULL,
  CONSTRAINT fk_notifications_from FOREIGN KEY ("from_id") REFERENCES "users" ("id") ON DELETE CASCADE,
  CONSTRAINT fk_notifications_to FOREIGN KEY ("to_id") REFERENCES "users" ("id") ON DELETE CASCADE
);
