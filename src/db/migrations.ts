import { psqlQuery } from "./setup.js";

psqlQuery(`
CREATE TABLE IF NOT EXISTS lists (
  message_id INTEGER NOT NULL,
  chat_id INTEGER NOT NULL,
  list_text TEXT NOT NULL,
  chat_type character varying(128) NOT NULL DEFAULT 'channel',
  PRIMARY KEY (message_id, chat_id)
);

CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  message_id INTEGER NOT NULL,
  chat_id INTEGER NOT NULL,
  item_text TEXT,
  completed BOOLEAN DEFAULT false,
  FOREIGN KEY (message_id, chat_id) REFERENCES lists (message_id, chat_id)
);
`);
