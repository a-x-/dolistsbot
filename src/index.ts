//
// BOT
//

import { pool, psqlQuery } from "./db.js";
import { Telegraf } from "telegraf";
import { Ctx, Message } from "../telegraf.js";
import { handle } from "./handlers.js";
import { isTextMessage } from "./utils.js";
import dotenv from "dotenv";
dotenv.config();

// TODO: nested items
// TODO: re-index items on edit

if (!process.env.BOT_TOKEN) throw new Error("SET_BOT_TOKEN");
if (!process.env.DATABASE_URL) throw new Error("SET_DATABASE_URL");
if (!process.env.WEBHOOK_DOMAIN) throw new Error("SET_WEBHOOK_DOMAIN");

const bot = new Telegraf(process.env.BOT_TOKEN);

globalThis.bot = bot;

// migration
psqlQuery(`
CREATE TABLE IF NOT EXISTS lists (
  message_id INTEGER NOT NULL,
  chat_id INTEGER NOT NULL,
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

// Handle messages starting with "#todo"
bot.on("message", async (ctx: Ctx<Message>) => {
  if (!isTextMessage(ctx)) return;
  const { message } = ctx;

  // #todo
  if (message.text.startsWith("#todo")) {
    await handle.newList(ctx);
  }
  // slash-command
  else if (message.text.startsWith("/")) {
    await handle.slashCommand(ctx);
  }
});

// Start the bot
bot.launch({
  // webhook: {
  //   domain: process.env.WEBHOOK_DOMAIN,
  // },
});

// graceful shutdown
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  pool.end();
});
