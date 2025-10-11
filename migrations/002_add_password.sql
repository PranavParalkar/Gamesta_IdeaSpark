-- Migration: add password column to users (if missing)
USE gamesta;

-- Some MySQL versions don't support ADD COLUMN IF NOT EXISTS. Use INFORMATION_SCHEMA check + dynamic ALTER.
SET @col_count = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password');
SET @stmt = IF(@col_count = 0, 'ALTER TABLE users ADD COLUMN password VARCHAR(255) NULL', 'SELECT "password_column_exists"');
PREPARE s FROM @stmt;
EXECUTE s;
DEALLOCATE PREPARE s;
