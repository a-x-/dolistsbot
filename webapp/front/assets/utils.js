/**
 * @template T extends HTMLElement
 * @param {new () => T} type
 * @param {string} id
 * @returns {T | null}
 */
function $(type, id) {
  const $e = document.getElementById(id);
  if ($e instanceof type) return $e;
  return null;
}

/**
 * @param {HTMLElement} $e
 * @param {(el: HTMLElement) => boolean} condition
 * @returns {HTMLElement | null}
 */
function findParentByCondition($e, condition) {
  if (condition($e)) return $e;
  if ($e.parentNode == null || !($e.parentNode instanceof HTMLElement)) {
    return null;
  }
  return findParentByCondition($e.parentNode, condition);
}
/**
 * @param {HTMLElement} $e
 * @param {(el: HTMLElement) => boolean} condition
 * @returns {HTMLElement | null}
 */
function findChildByCondition($e, condition) {
  if (condition($e)) return $e;

  for (let i = 0; i < $e.childNodes.length; i++) {
    const $child = $e.childNodes[i];
    if (!$child || !($child instanceof HTMLElement)) continue;
    if (condition($child)) return $child;
    const $found = findChildByCondition($child, condition);
    if ($found) return $found;
  }

  return null;
}

function animate($e, className) {
  $e.classList.add(className);
  "Telegram" in window && Telegram.WebApp.HapticFeedback?.selectionChanged?.();
  $e.addEventListener(
    "animationend",
    createRemoveClassListener($e, className),
    { once: true }
  );
}

function createRemoveClassListener($el, className) {
  return () => {
    $el.classList.remove(className);
    setTimeout(
      () =>
        requestAnimationFrame(() => {
          const $focusable = findChildByCondition($el, (el) => {
            return (
              el instanceof HTMLInputElement || el instanceof HTMLButtonElement
            );
          });
          console.log("focusing", $focusable);
          if (!($focusable instanceof HTMLElement)) return;
          $focusable.focus();
        }),
      233
    );
  };
}

function ensureNumber(value) {
  return value === '' || isNaN(value) ? null : Number(value);
}

function debug(value) {
  console.log(value);
  if (typeof value === "string") {
    value = decodeURIComponent(value);
  } else if (typeof value === "object") {
    value = JSON.stringify(value, null, 2);
  }
  const $log = document.createElement("div");
  // $log.style.whiteSpace = "pre-wrap";
  // $log.style.wordBreak = "auto-phrase";
  $log.style.width = "100%";
  $log.textContent = value;
  document.body.appendChild($log);
}

function showUndoToast(text, onUndo) {
  const $toast = document.createElement("div");
  const $toastText = document.createElement("div");
  $toast.classList.add("undo-toast");
  $toastText.textContent = `«${titleize(text)}» deleted`;
  $toast.appendChild($toastText);
  const $undo = document.createElement("button");
  $undo.textContent = "UNDO";
  $undo.classList.add("undo-button");
  $toast.addEventListener("click", () => {
    $toast.remove();
    onUndo();
  });
  $toast.appendChild($undo);
  document.body.appendChild($toast);
  setTimeout(() => $toast.remove(), 10000);
}

function titleize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
