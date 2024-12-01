// TODO: nested sub-items
// TODO: re-index items on edit
// TODO: delete, edit, reorder,
// TODO: add button to source message, w/o "^" fake messge (in the channel only)
// TODO: work in personal chats with tdl

// EPIC: sync with notion databases and inside tasks todo-lists by #todo #topic tags
// EPIC: use inline mode to find tasks in notion and link them to todo items
// EPIC: Быстрый набор фокуса дня из несколькоих тудулистов из разных #топиков

//
// BOT
//

import { pool } from "./db/setup.js"; // MUST be imported first!
import { Telegraf, Context } from "telegraf";
import { AnyCtx, Message } from "../telegraf.js";
import { handle } from "./handlers.js";
import { isAnyTextMessageCtx, getAnyMessage } from "./utils/utils.js";
import server from "./server.js";
//import "./utils/fix-crypto.js";
import "./db/migrations.js";

if (!process.env.BOT_TOKEN) throw new Error("SET_BOT_TOKEN");
if (!process.env.PG_URL) throw new Error("SET_DATABASE_URL");
if (!process.env.BOT_WEBHOOK_DOMAIN) throw new Error("SET_WEBHOOK_DOMAIN");

const bot = new Telegraf(process.env.BOT_TOKEN);

globalThis.bot = bot;

// Handle messages starting with "#todo"
bot.on("message", handleMessage);
bot.on("channel_post", handleMessage);
bot.on("edited_message", handleEdit);
bot.on("edited_channel_post", handleEdit);
bot.catch((err, ctx) => {
  console.error("Catched error", err);
  ctx.reply("💩 Нишмагла: " + (err instanceof Error ? err.message : err));
});

async function handleMessage(ctx: Context) {
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
async function handleEdit(ctx: Context) {
  if (!isAnyTextMessageCtx(ctx)) return;
  const message = getAnyMessage(ctx);
  if (!message) return;
  console.log("on edit", message.text);

  // #todo
  if (message.text.startsWith("#todo")) {
    await handle.reindexList(ctx);
  }
}

const webhook = {
  domain: process.env.BOT_WEBHOOK_DOMAIN,
  port: Number(process.env.BOT_PORT) || 4000,
};

console.log("starting bot...", webhook);

// Start the bot
bot.launch();//({ webhook });

console.log("bot started! " + process.env.BOT_NICK?.replace("@", "https://t.me/"));

// Enable graceful stop
// SIGTERM: politely ask a process to terminate
process.once("SIGTERM", () => bot.stop("SIGTERM"));

// SIGINT: CRTL+C
process.once("SIGINT", () => {
  bot.stop("SIGINT");
  pool.end();
});

export default server; // init bun.sh rest api
