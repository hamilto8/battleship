import { sound } from "../audio/SoundManager";

/** Create a button that plays the UI click and runs the handler. */
export function button(
  label: string,
  onClick: () => void,
  className = "btn"
): HTMLButtonElement {
  const b = document.createElement("button");
  b.className = className;
  b.type = "button";
  b.textContent = label;
  b.addEventListener("click", () => {
    sound.resume();
    sound.play("uiClick");
    onClick();
  });
  return b;
}

/** Terse element factory. */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = "",
  text = ""
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
