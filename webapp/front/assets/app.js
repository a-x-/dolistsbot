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
    const $deleteButton = document.createElement("button");
    
    $checkbox.type = "checkbox";
    $checkbox.checked = item.completed;
    
    $label.appendChild(document.createTextNode(item.item_text));

    $deleteButton.textContent = "╳";
    $deleteButton.classList.add("delete-button");
    $deleteButton.addEventListener("click", handleDeleteClick);
    
    $li.dataset.id = item.id;
    $li.appendChild($checkbox);
    $li.appendChild($label);
    $li.appendChild($deleteButton);

    $itemsList.appendChild($li);
  });
}

$form.addEventListener("submit", handleNewItemSubmit);

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
    event.target.tagName.toUpperCase() !== "INPUT"
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
