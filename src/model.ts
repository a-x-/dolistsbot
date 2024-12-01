import { PartialMsg } from "../telegraf.js";
import { TodoItem } from "../types.js";
import { psqlQuery } from "./db/setup.js";

export async function createList(chatId: number, message: PartialMsg) {
  await upsertList(chatId, message);
}
export async function upsertList(chatId: number, message: PartialMsg) {
  console.log("Upsert List", { chatId, message });

  const query = `INSERT INTO lists (chat_id, message_id, chat_type, list_text) VALUES ($1, $2, $3, $4) 
    ON CONFLICT (chat_id, message_id) DO UPDATE SET chat_type=$3, list_text=$4
    RETURNING *`;
  const result = await psqlQuery(query, [chatId, message.id, message.chatType, message.text]);
  return result.rows[0];
}

export async function updateList(chatId: number, message: PartialMsg) {
  await upsertList(chatId, message);
}

export async function createListItems(chatId: number, messageId: number, items: TodoItem[]) {
  const values = items.map(({ completed, text }) => [chatId, messageId, text, completed]);
  const query =
    "INSERT INTO items (chat_id, message_id, item_text, completed) VALUES " +
    values.map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`).join(", ");
  await psqlQuery(query, values.flat());
}

export async function deleteListItems(chatId: number, messageId: number) {
  const query = "DELETE FROM items WHERE chat_id=$1 AND message_id=$2";
  await psqlQuery(query, [chatId, messageId]);
}

export async function markItemComplete(listId: number, itemId: number) {
  if (!listId || !itemId) return;
  const query = "UPDATE items SET completed=true WHERE list_id=$1 AND item_id=$2";
  await psqlQuery(query, [listId, itemId]);
}

export async function findMessageId(chatId: number, listId: number): Promise<number | undefined> {
  const query = "SELECT message_id FROM lists WHERE chat_id=$1 AND list_id=$2";
  const result = await psqlQuery(query, [chatId, listId]);
  return result.rows[0]?.[0];
}

const GET_ITEMS_SQL = {
  SELECT_COLUMNS: ["id", "completed", "item_text"],
  POST_PROCESS: ["ORDER BY id"],
};
export async function getItems(chatId: number, messageId: number) {
  const cols = GET_ITEMS_SQL.SELECT_COLUMNS.join(", ");
  const order = GET_ITEMS_SQL.POST_PROCESS.join(" ");
  const query = `SELECT ${cols} FROM items WHERE chat_id = $1 AND message_id = $2 ${order}`;
  const result = await psqlQuery(query, [chatId, messageId]);
  return result.rows;
}
export async function getItem(id: number) {
  const query = `SELECT * FROM items WHERE id = $1`;
  const result = await psqlQuery(query, [id]);
  return result.rows[0];
}
