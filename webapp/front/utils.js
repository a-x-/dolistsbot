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
function toggleButton() {
  $button.disabled = !$input.value.length;
}
