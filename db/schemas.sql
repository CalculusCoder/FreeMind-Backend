ALTER TABLE "Freemind".users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE "Freemind".users ADD COLUMN verification_token TEXT;

UPDATE "Freemind".users SET is_verified = TRUE;
