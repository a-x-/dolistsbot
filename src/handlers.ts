import { Message } from "telegraf/types";
import { Ctx, TextMessageCtx } from "../telegraf.js";
import * as model from "./model.js";
import { getAnyMessage, retrieveItems } from "./utils/utils.js";
import { addPopupButton } from "./utils/tg.js";

export async function handleNewList(ctx: TextMessageCtx) {
  const message = getAnyMessage(ctx);
  if (!message) return;

  const items = retrieveItems(message.text);
  const msgObj = { id: message.message_id, text: message.text, chatType: ctx.chat.type };
  await model.createList(ctx.chat.id, msgObj);
  await model.createListItems(ctx.chat.id, message.message_id, items);
  await addPopupButton(ctx.chat.id, msgObj);
}

export async function handleReindex(ctx: Ctx<Message.TextMessage>) {
  const message = getAnyMessage(ctx);
  if (!message) return;

  const items = retrieveItems(message.text);
  const msgObj = { id: message.message_id, text: message.text, chatType: ctx.chat.type };
  await model.updateList(ctx.chat.id, msgObj);
  await model.deleteListItems(ctx.chat.id, message.message_id);
  await model.createListItems(ctx.chat.id, message.message_id, items);
  await addPopupButton(ctx.chat.id, msgObj, { aim: "update" });
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

export const handle = {
  newList: handleNewList,
  reindexList: handleReindex,
  slashCommand: handleSlashCommand,
  startCommand: handleStartCommand,
  // itemCompletion: handleItemCompletion,
};
