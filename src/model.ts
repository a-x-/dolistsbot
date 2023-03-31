import { psqlQuery } from "./db.js";

export async function createList(
  chatId: number,
  messageId: number,
  text: string
) {
  console.log("createList", { chatId, messageId, text });
  try {
    const query =
      "INSERT INTO lists (chat_id, message_id, list_text) VALUES ($1, $2, $3) RETURNING *";
    const result = await psqlQuery(query, [chatId, messageId, text]);
    return result.rows[0];
  } catch (e) {
    console.error(e);
    // TODO: Handle error
  }
}

export async function createListItem(
  chatId: number,
  messageId: number,
  itemText: string
) {
  const query =
    "INSERT INTO items (chat_id, message_id, item_text) VALUES ($1, $2, $3) RETURNING *";
  const result = await psqlQuery(query, [chatId, messageId, itemText]);
  return result.rows[0];
}

export async function markItemComplete(listId: number, itemId: number) {
  if (!listId || !itemId) return;
  const query =
    "UPDATE items SET completed=true WHERE list_id=$1 AND item_id=$2";
  await psqlQuery(query, [listId, itemId]);
}

export async function findMessageId(
  chatId: number,
  listId: number
): Promise<number | undefined> {
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
