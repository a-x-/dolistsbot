// TODO: nested sub-items
// TODO: re-index items on edit
// TODO: delete, edit, reorder
// TODO: work in personal chats with tdl

//
// BOT
//

import { pool, psqlQuery } from "./db.js";
import { Telegraf } from "telegraf";
import { ChannelCtx, Ctx, Message } from "../telegraf.js";
import { handle } from "./handlers.js";
import { isAnyTextMessageCtx, getAnyMessage } from "./utils.js";
import nodeCrypto from "crypto";
import server from "./server.js";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const cryptoCreateHash = nodeCrypto.createHash;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
nodeCrypto.createHash = (_algo: string, ...args: any[]) => {
  console.log(
    "HACK(crypto.createHash): sha3-256 -> sha256. Fix TypeError: Unsupported algorithm sha3-256"
  );
  const algo = _algo === "sha3-256" ? "sha256" : _algo;
  return cryptoCreateHash(algo, ...args);
};

if (!process.env.BOT_TOKEN) throw new Error("SET_BOT_TOKEN");
if (!process.env.PG_URL) throw new Error("SET_DATABASE_URL");
if (!process.env.BOT_WEBHOOK_DOMAIN) throw new Error("SET_WEBHOOK_DOMAIN");

const bot = new Telegraf(process.env.BOT_TOKEN);

globalThis.bot = bot;

// migration
psqlQuery(`
CREATE TABLE IF NOT EXISTS lists (
  message_id INTEGER NOT NULL,
  chat_id INTEGER NOT NULL,
  list_text TEXT NOT NULL,
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
bot.on("message", handleMessage);
bot.on("channel_post", handleMessage);

async function handleMessage(ctx: Ctx<Message> | ChannelCtx<Message>) {
  console.log("on message", ctx.message);
  if (!isAnyTextMessageCtx(ctx)) return;
  const message = getAnyMessage(ctx);
  if (!message) return;

  // #todo
  if (message.text.startsWith("#todo")) {
    await handle.newList(ctx);
  }
  // slash-command
  else if (message.text.startsWith("/")) {
    await handle.slashCommand(ctx);
  }
}

const webhook = {
  domain: process.env.BOT_WEBHOOK_DOMAIN,
  port: Number(process.env.BOT_PORT) || 4000,
};

console.log("starting bot...", webhook);

// Start the bot
bot.launch({ webhook });

console.log(
  "bot started! " + process.env.BOT_NICK?.replace("@", "https://t.me/")
);

// Enable graceful stop
// SIGTERM: politely ask a process to terminate
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// SIGINT: CRTL+C
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  pool.end();
});

export default server; // init bun.sh rest api
