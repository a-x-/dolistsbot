//
// SERVER
//

import { pool, psqlQuery } from "./db.js";
import { res } from "./utils.js";
import dotenv from "dotenv";
dotenv.config();

console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);
const port = process.env.SERVER_PORT || 3000;
console.log("starting server on port :", port);

export default {
  port,
  async fetch(req: Request) {
    try {
      const urlObj = new URL(req.url);
      if (!urlObj.pathname.startsWith("/api/items")) {
        const error = "Invalid endpoint path";
        console.log(error, urlObj.pathname);
        return res({ error }, 404);
      }
      const chatId = urlObj.searchParams.get("chatId");
      const messageId = urlObj.searchParams.get("messageId");

      switch (req.method) {
        case "GET": {
          const items = await getItems(Number(chatId), Number(messageId));
          return res({ items });
        }
        case "PUT": {
          const itemId = Number(urlObj.pathname.replace("/api/items/", ""));
          const body = await req.json<TodoItem>();
          const { completed } = body;
          const query = "UPDATE items SET completed = $1 WHERE id = $2";
          await psqlQuery(query, [completed, itemId]);
          return res({ success: true });
        }
        case "POST": {
          const body = await req.json<TodoItem>();
          const { item_text } = body;
          const query = `INSERT INTO items (chat_id, message_id, item_text) VALUES ($1, $2, $3)`;
          await psqlQuery(query, [chatId, messageId, item_text]);
          const items = await getItems(Number(chatId), Number(messageId));
          return res({ items });
        }
        default:
          return res({ error: "Invalid method" }, 405);
      }
    } catch (e) {
      console.error(e);
      return res(
        { error: e instanceof Error ? e.message : "Internal server error" },
        500
      );
    }
  },
};

const GET_ITEMS_SQL = {
  SELECT_COLUMNS: ["id", "completed", "item_text"],
  POST_PROCESS: ["ORDER BY id"],
};

async function getItems(chatId: number, messageId: number) {
  const cols = GET_ITEMS_SQL.SELECT_COLUMNS.join(", ");
  const order = GET_ITEMS_SQL.POST_PROCESS.join(" ");
  const query = `SELECT ${cols} FROM items WHERE chat_id = $1 AND message_id = $2 ${order}`;
  const result = await psqlQuery(query, [chatId, messageId]);
  return result.rows;
}

type TodoItem = {
  id: number;
  completed: boolean;
  item_id: number;
  message_id: number;
  item_text: number;
};

// graceful shutdown
process.on("SIGTERM", () => {
  pool.end();
  process.exit(0);
});
