import { Message } from "telegraf/types";
import { Ctx } from "../telegraf.js";
// import { findMessageId, markItemComplete } from "./model.js";
// import { parseItemCommandText } from "./utils.js";
import { createList, createListItem } from "./model.js";
import { Markup } from "telegraf";

export async function handleNewList(ctx: Ctx<Message.TextMessage>) {
  const { message } = ctx;
  const items = message.text.split("\n").slice(1); // Ignore the first line starting with #todo
  // const { listId } = parseItemCommandText(items[0]);
  // if (listId == null) throw new Error("MISSED_LIST_ID");
  await createList(ctx.chat.id, message.message_id);
  // TODO: bulk insert
  for (const item of items) {
    await createListItem(
      ctx.chat.id,
      message.message_id,
      item.replace(/^[-✅✔✓]\s*/, "") // todo: sub-lists
    );
  }
  const chatId = message.chat.id;
  const messageId = message.message_id;
  const username = ctx.from?.username || ctx.chat.id;
  const messageLink = `https://t.me/${username}/${messageId}`;
  const button = Markup.button.webApp(
    "Tick items",
    `https://dolistbot.invntrm.ru/?chatId=${chatId}&messageId=${messageId}&messageLink=${messageLink}`
  );
  ctx.reply(`^`, Markup.inlineKeyboard([button]));
}
export async function handleSlashCommand(ctx: Ctx<Message.TextMessage>) {
  const command = ctx.message.text;
  if (command === "/start") {
    await handleStartCommand(ctx);
  }
  // // /<list_id><item_id>
  // else if (command.match(/^\/[a-z][0-9]+$/)) {
  //   await handleItemCompletion(ctx);
  // }
}
export async function handleStartCommand(ctx: Ctx<Message.TextMessage>) {
  // say hello, write instructions
  await bot.telegram.sendMessage(
    ctx.message.chat.id,
    `Hello, ${
      ctx.message.from?.first_name || "Friend"
    }! I'm a bot that helps you manage your todo lists. Send me a message starting with "#todo" to create a new list`
  );
}
// export async function handleItemCompletion(ctx: Ctx<Message.TextMessage>) {
//   const { listId, itemId, command } = parseItemCommandText(ctx.message.text);
//   await markItemComplete(listId, itemId);
//   const messageId = await findMessageId(ctx.chat.id, listId);
//   if (!messageId) throw new Error("MESSAGE_LOST");
//   const newText = ctx.message.text.replace(command, "✅");
//   bot.telegram.editMessageText(
//     ctx.chat.id,
//     messageId,
//     undefined,
//     ctx.message.text.replace(command, "✅")
//   );

//   await ctx.editMessageText(newText);
// }

export const handle = {
  newList: handleNewList,
  slashCommand: handleSlashCommand,
  startCommand: handleStartCommand,
  // itemCompletion: handleItemCompletion,
};
