import { sound } from "../audio/SoundManager";
import { el } from "./dom";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  return (document.documentElement.dataset.theme as Theme) ?? "dark";
}

function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
}

/** Set the initial theme from the OS preference. */
export function initTheme(): void {
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
  applyTheme(prefersLight ? "light" : "dark");
}

/** The persistent top bar: title + theme and mute toggles. */
export function createTopBar(): HTMLElement {
  const bar = el("header", "topbar");

  const brand = el("div", "brand");
  brand.innerHTML = `<span class="brand-mark">⚓</span> BATTLESHIP`;
  bar.appendChild(brand);

  const actions = el("div", "topbar-actions");

  const themeBtn = el("button", "icon-btn");
  themeBtn.type = "button";
  const syncTheme = () => {
    themeBtn.textContent = currentTheme() === "dark" ? "☀️" : "🌙";
    themeBtn.title =
      currentTheme() === "dark" ? "Switch to light theme" : "Switch to dark theme";
  };
  themeBtn.addEventListener("click", () => {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
    syncTheme();
    sound.play("uiClick");
  });
  syncTheme();

  const muteBtn = el("button", "icon-btn");
  muteBtn.type = "button";
  const syncMute = () => {
    muteBtn.textContent = sound.muted ? "🔇" : "🔊";
    muteBtn.title = sound.muted ? "Unmute" : "Mute";
  };
  muteBtn.addEventListener("click", () => {
    sound.resume();
    const muted = sound.toggleMute();
    if (!muted) sound.play("uiClick");
    syncMute();
  });
  syncMute();

  actions.append(themeBtn, muteBtn);
  bar.appendChild(actions);
  return bar;
}
