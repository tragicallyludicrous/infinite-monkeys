/**
 * @param {string} id
 * @returns {HTMLButtonElement | null}
 */
export function getButton(id) {
  return /** @type {HTMLButtonElement | null} */ (document.getElementById(id));
}

/**
 * @param {string} id
 * @returns {HTMLInputElement | null}
 */
export function getInput(id) {
  return /** @type {HTMLInputElement | null} */ (document.getElementById(id));
}
