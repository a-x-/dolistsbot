import { Markup } from "telegraf";
import { PartialMsg } from "../../telegraf.js";

export async function addPopupButton(
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
    // `https://dolistbot.invntrm.ru/?chatId=${chatId}&messageId=${message.id}`
    `https://t.me/todo_list_helper_bot/edit?startapp=${chatId},${message.id}`
  );
  if (isChannel) { 
    try {
      return await bot.telegram.editMessageText(
        chatId,
        message.id,
        undefined,
        message.text,
        Markup.inlineKeyboard([button])
      );
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.includes("specified new message content and reply markup are exactly the same")
      ) {
        return;
      }
      console.error("FAIL: addPopupButton", e, typeof e, e instanceof Error && e.message);
      throw e;
    }
  } else if (aim === "create") {
    return await bot.telegram.sendMessage(chatId, "⌨️", Markup.inlineKeyboard([button]));
  }
}

export async function updateMessageKeepButton(chatId: number, message: PartialMsg) {
  await addPopupButton(chatId, message, { aim: "update" });
}
