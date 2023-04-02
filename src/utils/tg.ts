import { Markup } from "telegraf";
import { PartialMsg } from "../../telegraf.js";

export function addPopupButton(
  chatId: number,
  message: PartialMsg,
  { aim = "create" }: { aim?: "create" | "update" } = {}
) {
  // const username = ctx.from?.username || ctx.chat.id;
  // const messageLink = `https://t.me/${username}/${messageId}`;
  const isChannel = message.chatType === "channel";
  const kind = isChannel ? "url" : "webApp";
  const button = Markup.button[kind](
    "Tick items",
    `https://dolistbot.invntrm.ru/?chatId=${chatId}&messageId=${message.id}`
  );
  if (isChannel) {
    return bot.telegram.editMessageText(chatId, message.id, undefined, message.text, Markup.inlineKeyboard([button]));
  } else if (aim === "create") {
    return bot.telegram.sendMessage(chatId, "⌨️", Markup.inlineKeyboard([button]));
  }
}

export async function updateMessageKeepButton(chatId: number, message: PartialMsg) {
  await addPopupButton(chatId, message, { aim: "update" });
}
