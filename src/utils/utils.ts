import { Message } from "telegraf/types";
import { AnyCtx, ChannelCtx, Ctx, EditChannelCtx, EditCtx } from "../../telegraf.js";

export function retrieveItems(text: string): string[] {
  return text
    .replace(/^(- \[ \]|- \[x\]|[-✅✔✓])\s*/gm, "") // todo: sub-lists
    .split("\n")
    .slice(1); // Ignore the first line starting with #todo
}

export function isTextMessageCtx(ctx: AnyCtx<Message>): ctx is Ctx<Message.TextMessage> {
  return Boolean(ctx.message && "text" in ctx.message);
}
export function isChannelTextMessageCtx(ctx: AnyCtx<Message>): ctx is ChannelCtx<Message.TextMessage> {
  return Boolean(ctx.channelPost && "text" in ctx.channelPost);
}
export function isEditedTextMessageCtx(ctx: AnyCtx<Message>): ctx is EditCtx<Message.TextMessage> {
  return Boolean(ctx.editedMessage && "text" in ctx.editedMessage);
}
export function isEditedChannelTextMessageCtx(ctx: AnyCtx<Message>): ctx is EditChannelCtx<Message.TextMessage> {
  return Boolean(ctx.editedChannelPost && "text" in ctx.editedChannelPost);
}
export function isAnyTextMessageCtx(ctx: AnyCtx<Message>): ctx is Ctx<Message.TextMessage> {
  return (
    isTextMessageCtx(ctx) ||
    isChannelTextMessageCtx(ctx) ||
    isEditedTextMessageCtx(ctx) ||
    isEditedChannelTextMessageCtx(ctx)
  );
}
/**
 * Both Ctx (from groups) and ChannelCtx have identical Message
 */
export function getAnyMessage(ctx: AnyCtx<Message>): Message.TextMessage | null {
  if (isTextMessageCtx(ctx)) return ctx.message;
  if (isChannelTextMessageCtx(ctx)) return ctx.channelPost;
  if (isEditedTextMessageCtx(ctx)) return ctx.editedMessage;
  if (isEditedChannelTextMessageCtx(ctx)) return ctx.editedChannelPost;
  return null;
}
const CorsPreflightRes = Symbol("CORS");

export function res(txtOrJson: string | Record<string, any> | Symbol, status?: number): Response | undefined {
  if (txtOrJson == null) return undefined;
  const isString = typeof txtOrJson === "string";
  const isCorsPreflight = txtOrJson === CorsPreflightRes;
  const isJson = !isString && !isCorsPreflight;
  return new Response(isString ? txtOrJson : isCorsPreflight ? "" : JSON.stringify(txtOrJson), {
    ...(status ? { status } : undefined),
    headers: {
      ...(isJson ? { "Content-Type": "application/json;charset=utf-8" } : undefined),
      "Access-Control-Allow-Origin": "https://doistbot.invntrm.ru",
      "Access-Control-Allow-Headers": "authorization",
    },
  });
}
