import type { Pool } from "pg";

import type { Context, NarrowedContext, Telegraf } from "telegraf";
import type { Update } from "typegram";
import type { Message, Document, Voice } from "telegraf/types";

export type Ctx<T> = NarrowedContext<Context<Update>, Update.MessageUpdate<T>>;
export type ChannelCtx<T> = NarrowedContext<Context<Update>, Update.ChannelPostUpdate<T>>;
export type EditCtx<T> = NarrowedContext<Context<Update>, Update.EditedMessageUpdate<T>>;
export type EditChannelCtx<T> = NarrowedContext<Context<Update>, Update.EditedChannelPostUpdate<T>>;
export type AnyCtx<T> = Ctx<T> | ChannelCtx<T> | EditCtx<T> | EditChannelCtx<T>;
export type TextMessageCtx = AnyCtx<Message.TextMessage>;

export type ChatType = "channel" | "private" | "group" | "supergroup";
export type PartialMsg = { id: number; text: string; chatType: ChatType };

// import * as tt from "telegraf/typings/telegram-types";
// import type { Context, Middleware, NarrowedContext, Telegraf } from "telegraf";
// import type { Update } from "typegram";
// export declare type MatchedContext<
//   C extends Context,
//   T extends tt.UpdateType | tt.MessageSubType
// > = NarrowedContext<C, tt.MountMap[T]>;

export { Update, Context, Message, Document, Voice };

// export type Ctx<T> = MatchedContext<Context<Update>, T>;
// export type Ctx<T> = Middleware<
//   NarrowedContext<Context<Update>, Update.MessageUpdate<T>>
// >;

export type Bot = Telegraf<Context<Update>>;

declare global {
  var bot: Bot;
  var teslaConfigJson;
  var recordTypesMapByCodeKey;
  var pgPool: Pool;
}
