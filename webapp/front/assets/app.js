// let chatId = window.Telegram.WebApp.initDataUnsafe?.chat?.id;
let [chatId,messageId] = window.Telegram.WebApp.initDataUnsafe?.start_param?.split("_").map(ensureNumber);

const query = new URLSearchParams(window.location.search);
chatId ||= ensureNumber(query.get("chatId"));
messageId ||= ensureNumber(query.get("messageId"));

// debug({chatId, messageId});
const state = {
  items: [],
};

const $itemsList = document.getElementById("items-list");
$itemsList.addEventListener("change", handleCheckboxChange);
$itemsList.addEventListener("click", handleEditClick);

// Fetch items from API endpoint
fetch(`/api/items?chatId=${chatId}&messageId=${messageId}`)
  .then((response) => response.json())
  .then((data) => {
    state.items = data.items;
    renderItems(data);
  });

const $form = $(HTMLFormElement, "add-item-form");
const $input = $(HTMLInputElement, "add-item-input");
const $button = $(HTMLButtonElement, "add-item-button");

toggleButton();

$input.addEventListener("animationend", () => {
  $input.classList.remove("request-error");
});
// disable/enable button based on input field
$input.addEventListener("input", toggleButton);

function toggleButton() {
  $button.disabled = !$input.value.length;
}

function renderItems(data) {
  $itemsList.innerHTML = "";
  data.items.forEach((item) => {
    const $li = document.createElement("li");
    const $checkbox = document.createElement("input");
    const $label = document.createElement("label");
    
    $checkbox.type = "checkbox";
    $checkbox.checked = item.completed;
    
    $label.appendChild(document.createTextNode(item.item_text));
    
    const $deleteButton = createDeleteButton();
    
    $li.dataset.id = item.id;
    $li.appendChild($checkbox);
    $li.appendChild($label);
    $li.appendChild($deleteButton);

    $itemsList.appendChild($li);
  });
}

$form.addEventListener("submit", handleNewItemSubmit);

function createDeleteButton() {
  const $deleteButton = document.createElement("button");
  $deleteButton.textContent = "╳";
  $deleteButton.classList.add("delete-button");
  $deleteButton.addEventListener("click", handleDeleteClick);
  return $deleteButton;
}

/**
 * @param {Event} event
 * @returns {Promise<void>}
 */
function handleNewItemSubmit(event) {
  event.preventDefault();
  const itemText = $input.value;
  if (!itemText) return;
  // Add item to list
  fetch(`/api/items?chatId=${chatId}&messageId=${messageId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      item_text: itemText,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }
      return response;
    })
    .then((response) => response.json())
    .then((response) => {
      $input.value = "";
      renderItems(response); // Update list
    })
    .catch(() => {
      $input.classList.add("request-error");
      $input.focus();
    })
    .finally(() => {
      toggleButton();
    });
}

/**
 * @param {Event} event
 */
async function handleCheckboxChange(event) {
  if (
    !(event.target instanceof HTMLInputElement) ||
    event.target.tagName.toUpperCase() !== "INPUT" ||
    event.target.type !== "checkbox"
  ) {
    return;
  }
  const $li = findParentByCondition(
    event.target,
    (el) => el.tagName.toUpperCase() === "LI"
  );
  try {
    const itemId = findParentByCondition(event.target, (el) =>
      Boolean(el.dataset.id)
    )?.dataset.id;
    if (itemId == null) {
      throw new Error("Item ID not found");
    }
    // Update item
    await fetch(
      `/api/items/${itemId}?chatId=${chatId}&messageId=${messageId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: event.target.checked,
        }),
      }
    );
    animate($li, "request-success");
  } catch (e) {
    console.error(e);
    event.target.checked = !event.target.checked;
    animate($li, "request-error");
  }
}

/**
 * @param {Event} event
 */
async function handleDeleteClick(event) {
  if (!(event.target instanceof HTMLButtonElement)) return;

  const $li = findParentByCondition(
    event.target,
    (el) => el.tagName.toUpperCase() === "LI"
  );
  const itemId = $li.dataset.id;
  const itemText = $li.querySelector("label").textContent;
  try {
    const res = await fetch(`/api/items/${itemId}?chatId=${chatId}&messageId=${messageId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    if (data.success) {
      $li.remove();
    } else {
      throw new Error("Item not deleted");
    }
    state.items = state.items.filter((item) => item.id !== itemId);
    showUndoToast(itemText, () => {
      fetch(`/api/items?chatId=${chatId}&messageId=${messageId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          item_text: itemText,
          completed: false,
        }),
      })
        .then((response) => response.json())
        .then((response) => {
          state.items = response.items;
          renderItems(response);
        });
    });
  } catch (error) {
    console.error(error);
    animate($li, "request-error");
  }
}

function handleEditClick(event) {
  if (!(event.target instanceof HTMLLabelElement)) return;
  const $li = findParentByCondition(
    event.target,
    (el) => el.tagName.toUpperCase() === "LI"
  );
  const $label = event.target;
  const $input = document.createElement("input");
  $input.type = "text";
  $input.value = $label.textContent;
  $input.classList.add("edit-input");
  $input.addEventListener("blur", handleEditSubmit);
  $li.replaceChild($input, $label);
  const $submitButton = document.createElement("button");
  $submitButton.textContent = "✓";
  $submitButton.classList.add("edit-submit");
  $submitButton.addEventListener("click", handleEditSubmit);  
  const $deleteButton = $li.querySelector(".delete-button");
  $li.replaceChild($submitButton, $deleteButton);
  $input.focus();
}

async function handleEditSubmit(event) {
  if (!(event.target instanceof HTMLInputElement)) return;
  const $li = findParentByCondition(
    event.target,
    (el) => el.tagName.toUpperCase() === "LI"
  );
  const $input = event.target;
  const $label = document.createElement("label");
  $label.textContent = $input.value;
  $li.replaceChild($label, $input);
  const $submitButton = document.querySelector(".edit-submit");
  const $deleteButton = createDeleteButton();
  $li.replaceChild($deleteButton, $submitButton);
  const itemId = $li.dataset.id;
  try {
    const res = await fetch(`/api/items/${itemId}?chatId=${chatId}&messageId=${messageId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item_text: $label.textContent,
      }),
    });
    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }
    animate($li, "request-success");
  } catch (error) {
    console.error(error);
    animate($li, "request-error");
  }
}

if ("Telegram" in window) {
  Telegram.WebApp.MainButton?.setParams({
    color: "#34afed",
    is_active: true,
    is_visible: true,
    text: "Готово",
  }).onClick(() => {
    Telegram.WebApp.close();
  });
}
// Initialize TDLib
// const TDWebApp = window.Telegram.WebApp;
// TDWebApp.init({
//   onLoad: () => {
//     // Set app title
//     TDWebApp.setTitle("Todo List");

//     // Add back button
//     TDWebApp.setLeftButtons([
//       {
//         type: "back",
//         onClick: () => {
//           TDWebApp.close();
//         },
//       },
//     ]);
//   },
// });
