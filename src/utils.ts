import { Message } from "telegraf/types";
import { ChannelCtx, Ctx } from "../telegraf.js";

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

export function isTextMessageCtx(
  ctx: Ctx<Message> | ChannelCtx<Message>
): ctx is Ctx<Message.TextMessage> {
  return Boolean(ctx.message && "text" in ctx.message);
}
export function isChannelTextMessageCtx(
  ctx: Ctx<Message> | ChannelCtx<Message>
): ctx is ChannelCtx<Message.TextMessage> {
  return Boolean(ctx.channelPost && "text" in ctx.channelPost);
}
export function isAnyTextMessageCtx(
  ctx: Ctx<Message> | ChannelCtx<Message>
): ctx is Ctx<Message.TextMessage> {
  return isTextMessageCtx(ctx) || isChannelTextMessageCtx(ctx);
}
/**
 * Both Ctx (from groups) and ChannelCtx have identical Message
 */
export function getAnyMessage(
  ctx: Ctx<Message> | ChannelCtx<Message>
): Message.TextMessage | null {
  if (isTextMessageCtx(ctx)) return ctx.message;
  if (isChannelTextMessageCtx(ctx)) return ctx.channelPost;
  return null;
}
const CorsPreflightRes = Symbol("CORS");

export function res(
  txtOrJson: string | Record<string, any> | Symbol,
  status?: number
): Response | undefined {
  if (txtOrJson == null) return undefined;
  const isString = typeof txtOrJson === "string";
  const isCorsPreflight = txtOrJson === CorsPreflightRes;
  const isJson = !isString && !isCorsPreflight;
  return new Response(
    isString ? txtOrJson : isCorsPreflight ? "" : JSON.stringify(txtOrJson),
    {
      ...(status ? { status } : undefined),
      headers: {
        ...(isJson
          ? { "Content-Type": "application/json;charset=utf-8" }
          : undefined),
        "Access-Control-Allow-Origin": "https://doistbot.invntrm.ru",
        "Access-Control-Allow-Headers": "authorization",
      },
    }
  );
}
