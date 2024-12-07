// const query = new URLSearchParams(window.location.search);
alert('Hello from app.js');
const [chatId, messageId] = window.Telegram.WebApp.initDataUnsafe.start_param?.split(",");
// const [chatId, messageId] = [query.get("chatId"), query.get("messageId")];
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

function renderItems(data) {
  $itemsList.innerHTML = "";
  data.items.forEach((item) => {
    const $li = document.createElement("li");
    const $checkbox = document.createElement("input");
    $checkbox.type = "checkbox";
    $checkbox.checked = item.completed;
    const $label = document.createElement("label");
    $label.appendChild(document.createTextNode(item.item_text));
    $li.dataset.id = item.id;
    $li.appendChild($checkbox);
    $li.appendChild($label);
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
  if (!(event.target instanceof HTMLInputElement)) return;

  const $li = findParentByCondition(
    event.target,
    (el) => el.tagName.toUpperCase() === "LI"
  );
  const itemId = $li.dataset.id;
  try {
    await fetch(`/api/items/${itemId}`, {
      method: "DELETE",
    });
    $li.remove();
    state.items = state.items.filter((item) => item.id !== itemId);
  } catch (error) {
    console.error(error);
    animate($li, "request-error");
  }
}

if ("Telegram" in window) {
  Telegram.WebApp.MainButton?.setParams({
    color: "#0000ff",
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
