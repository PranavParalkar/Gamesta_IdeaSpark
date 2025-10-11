-- Migration: initial schema for Gamesta
-- Tables: users (optional), ideas, votes

CREATE DATABASE IF NOT EXISTS gamesta;
USE gamesta;

-- Optional users table (for future auth). For now, allow anonymous submissions with a name/email.
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NULL,
  email VARCHAR(255) NULL,
  password VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
);

-- Ideas table
CREATE TABLE IF NOT EXISTS ideas (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_public TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  KEY idx_ideas_user (user_id),
  CONSTRAINT fk_ideas_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Votes table: store one vote per (idea, voter_id or anonymous_token)
CREATE TABLE IF NOT EXISTS votes (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  idea_id BIGINT UNSIGNED NOT NULL,
  voter_token VARCHAR(255) NULL,
  voter_user_id BIGINT UNSIGNED NULL,
  vote TINYINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vote_per_voter (idea_id, voter_token, voter_user_id),
  KEY idx_votes_idea (idea_id),
  CONSTRAINT fk_votes_idea FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE
);

-- Materialized leaderboard view (can be refreshed by query)
CREATE OR REPLACE VIEW idea_scores AS
SELECT
  i.id as idea_id,
  i.title,
  i.description,
  i.created_at,
  COALESCE(SUM(v.vote),0) as score,
  COUNT(v.id) as vote_count
FROM ideas i
LEFT JOIN votes v ON v.idea_id = i.id
GROUP BY i.id
ORDER BY score DESC, vote_count DESC;


-- -- Sample seed data
-- INSERT INTO users (name, email) VALUES
-- ('Alice','alice@example.com'),
-- ('Bob','bob@example.com')
-- ON DUPLICATE KEY UPDATE email=email;

-- INSERT INTO ideas (user_id, title, description) VALUES
-- (1, 'Recycled Art Competition', 'Create art from recycled materials'),
-- (2, 'Hackathon 24h', '24-hour hackathon event for college students')
-- ON DUPLICATE KEY UPDATE title=VALUES(title);

-- INSERT INTO votes (idea_id, voter_user_id, vote) VALUES
-- (1, 2, 1),
-- (2, 1, 1),
-- (2, 2, -1)
-- ON DUPLICATE KEY UPDATE vote=VALUES(vote);
