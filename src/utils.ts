import { Message } from "telegraf/types";
import { Ctx } from "../telegraf.js";

export function parseItemCommandText(command: string): {
  command: string;
  listId: number;
  itemId: number;
  itemText?: string;
} {
  const match = command.match(/^\/([a-z])([0-9]+)(?:\s* (.+)$)/);
  if (!match) throw new Error("INVALID_COMMAND");
  return {
    command: match[0],
    listId: match[1].charCodeAt(0) - 97 + 1,
    itemId: parseInt(match[2]),
    itemText: match[3],
  };
}

export function isTextMessage(
  ctx: Ctx<Message>
): ctx is Ctx<Message.TextMessage> {
  return Boolean(ctx.message && "text" in ctx.message);
}
