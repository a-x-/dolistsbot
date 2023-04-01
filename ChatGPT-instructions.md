# ChatGPT task

You should use telegraf.js as usual. Bot should have following functionality:
It works in the chat with single user.
When user sends a message started with #todo, bot handle and index it.
Indexing: store all the slash-commands, in the start of every lines. 
Slash-command have following format in regexp: /\/([a-z])([0-9]+), where $1 is todo-list id, $2 is todo-item number. 
Todo-item have format: <slash-command>" "<message>
Storing: Use Postgres with pg library. Use at least 2 tables: lists, items. Suggests sql structure pls. Every todo item should be stored by its id and todo list id it belongs. Store also message link in the lists table.
When user taps on slash-command, you know, telegram sends message containing this command. Bot should handle it: find todolist and todoitem this command belongs and mark this item complete. Update message: replace that command by "✅" sign.

----
