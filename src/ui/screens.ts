import { sound } from "../audio/SoundManager";
import type { AttackEvent, GameController } from "../core/GameController";
import type { Player } from "../core/Player";
import type { GameMode, Coord } from "../core/types";
import { BoardView } from "./BoardView";
import { button, el } from "./dom";

const COMPUTER_DELAY_MS = 750;

/* ------------------------------------------------------------------ Menu -- */

export function buildMenu(
  onStart: (mode: GameMode, name1: string, name2: string) => void
): HTMLElement {
  const root = el("div", "menu screen");
  root.innerHTML = `
    <div class="menu-card">
      <h1 class="menu-title"><span class="brand-mark">⚓</span> Battleship</h1>
      <p class="menu-sub">Sink the enemy fleet before they sink yours.</p>
    </div>`;

  const card = root.querySelector(".menu-card") as HTMLElement;

  let mode: GameMode = "pvc";
  const modeRow = el("div", "mode-row");
  const pvcBtn = el("button", "mode-btn is-active");
  pvcBtn.type = "button";
  pvcBtn.innerHTML = `<span class="mode-icon">🤖</span><span>vs Computer</span>`;
  const pvpBtn = el("button", "mode-btn");
  pvpBtn.type = "button";
  pvpBtn.innerHTML = `<span class="mode-icon">👥</span><span>vs Player</span>`;
  modeRow.append(pvcBtn, pvpBtn);
  card.appendChild(modeRow);

  const names = el("div", "name-fields");
  const name1 = el("input", "name-input") as HTMLInputElement;
  name1.type = "text";
  name1.value = "You";
  name1.maxLength = 16;
  name1.setAttribute("aria-label", "Player 1 name");
  const name2 = el("input", "name-input") as HTMLInputElement;
  name2.type = "text";
  name2.value = "Player 2";
  name2.maxLength = 16;
  name2.setAttribute("aria-label", "Player 2 name");
  const name2Wrap = el("label", "name-wrap");
  name2Wrap.append(el("span", "", "Player 2"), name2);
  const name1Wrap = el("label", "name-wrap");
  name1Wrap.append(el("span", "", "Player 1"), name1);
  names.append(name1Wrap, name2Wrap);
  card.appendChild(names);

  const applyMode = (next: GameMode) => {
    mode = next;
    pvcBtn.classList.toggle("is-active", next === "pvc");
    pvpBtn.classList.toggle("is-active", next === "pvp");
    name2Wrap.style.display = next === "pvp" ? "" : "none";
    (name1Wrap.querySelector("span") as HTMLElement).textContent =
      next === "pvp" ? "Player 1" : "Your name";
    // Swap the untouched default so PvP doesn't read "You's turn".
    if (next === "pvp" && name1.value === "You") name1.value = "Player 1";
    if (next === "pvc" && name1.value === "Player 1") name1.value = "You";
    sound.play("uiClick");
  };
  pvcBtn.addEventListener("click", () => applyMode("pvc"));
  pvpBtn.addEventListener("click", () => applyMode("pvp"));
  applyMode("pvc");

  const start = button(
    "Start Game",
    () => {
      const n1 = name1.value.trim() || "Player 1";
      const n2 = mode === "pvp" ? name2.value.trim() || "Player 2" : "Computer";
      onStart(mode, n1, n2);
    },
    "btn btn--primary btn--large"
  );
  card.appendChild(start);
  return root;
}

/* ---------------------------------------------------------- Pass device -- */

export function buildPassDevice(
  nextName: string,
  onContinue: () => void
): HTMLElement {
  const root = el("div", "pass screen");
  root.innerHTML = `
    <div class="pass-card">
      <div class="pass-icon">📱➡️</div>
      <h2>Pass the device</h2>
      <p>Hand it to <strong>${escapeHtml(nextName)}</strong>.</p>
      <p class="hint">No peeking — the boards are hidden until you continue.</p>
    </div>`;
  const card = root.querySelector(".pass-card") as HTMLElement;
  card.appendChild(
    button(`I'm ${nextName} — Continue`, onContinue, "btn btn--primary btn--large")
  );
  return root;
}

/* -------------------------------------------------------------- Game over -- */

export function buildGameOver(
  winner: Player,
  humanLost: boolean,
  onPlayAgain: () => void
): HTMLElement {
  const root = el("div", "gameover screen");
  const title = humanLost ? "Defeat" : "Victory!";
  root.innerHTML = `
    <div class="gameover-card ${humanLost ? "is-loss" : "is-win"}">
      <div class="gameover-emblem">${humanLost ? "💥" : "🏆"}</div>
      <h1>${title}</h1>
      <p><strong>${escapeHtml(winner.name)}</strong> wins the battle.</p>
    </div>`;
  const card = root.querySelector(".gameover-card") as HTMLElement;
  card.appendChild(
    button("Play Again", onPlayAgain, "btn btn--primary btn--large")
  );
  return root;
}

/* ---------------------------------------------------------- Battle screen -- */

/**
 * Owns the battle phase for both PvC and PvP. In PvC the human's perspective is
 * fixed and the computer takes its turn automatically; in PvP the perspective
 * flips each turn behind a "pass the device" overlay.
 */
export class BattleScreen {
  readonly el: HTMLElement;
  private readonly controller: GameController;
  private readonly boardArea: HTMLElement;
  private readonly banner: HTMLElement;
  private readonly log: HTMLElement;

  private ownView: BoardView | null = null;
  private enemyView: BoardView | null = null;
  private ownBoardOwner: Player | null = null;
  private enemyBoardOwner: Player | null = null;

  private readonly unsubs: Array<() => void> = [];
  private timer: number | null = null;

  constructor(controller: GameController) {
    this.controller = controller;
    this.el = el("div", "battle screen");

    this.banner = el("div", "turn-banner");
    this.el.appendChild(this.banner);

    this.boardArea = el("div", "battle-boards");
    this.el.appendChild(this.boardArea);

    const logWrap = el("div", "log-wrap");
    logWrap.appendChild(el("h3", "log-title", "Battle log"));
    this.log = el("ul", "message-log");
    logWrap.appendChild(this.log);
    this.el.appendChild(logWrap);

    this.unsubs.push(controller.on("attack", (e) => this.onAttack(e)));
    this.unsubs.push(controller.on("turnChange", ({ current }) => this.onTurnChange(current)));
    this.unsubs.push(controller.on("gameOver", ({ winner }) => this.onGameOver(winner)));
  }

  start(): void {
    this.renderPerspective(this.controller.current);
    this.updateBanner();
  }

  destroy(): void {
    this.unsubs.forEach((u) => u());
    if (this.timer !== null) window.clearTimeout(this.timer);
  }

  private opponentOf(player: Player): Player {
    const [a, b] = this.controller.players;
    return player === a ? b : a;
  }

  private renderPerspective(viewer: Player): void {
    const opponent = this.opponentOf(viewer);
    this.boardArea.innerHTML = "";

    const ownCol = el("div", "board-col");
    ownCol.appendChild(el("h3", "board-heading", `${viewer.name} — your fleet`));
    this.ownView = new BoardView(viewer.gameboard, { revealShips: true });
    this.ownBoardOwner = viewer;
    ownCol.appendChild(this.ownView.el);

    const enemyCol = el("div", "board-col");
    enemyCol.appendChild(el("h3", "board-heading", `${opponent.name}'s waters`));
    this.enemyView = new BoardView(opponent.gameboard, {
      revealShips: false,
      onFire: (coord) => this.fire(viewer, coord),
    });
    this.enemyBoardOwner = opponent;
    enemyCol.appendChild(this.enemyView.el);

    this.boardArea.append(ownCol, enemyCol);

    const myTurn =
      this.controller.current === viewer &&
      !viewer.isComputer &&
      !this.controller.isOver;
    this.enemyView.setLocked(!myTurn);
    this.updateBanner();
  }

  private fire(viewer: Player, coord: Coord): void {
    if (this.controller.isOver) return;
    if (this.controller.current !== viewer || viewer.isComputer) return;
    sound.play("fire");
    this.controller.fire(coord);
  }

  private onAttack({ attacker, defender, coord, result }: AttackEvent): void {
    this.viewForBoardOwner(defender)?.refresh();
    this.playImpact(result.outcome);
    this.logAttack(attacker, defender, coord, result.outcome, result.ship?.type);
    if (result.outcome === "sunk") this.shake();
  }

  private onTurnChange(current: Player): void {
    this.updateBanner();
    if (this.controller.mode === "pvc") {
      const enemyLocked = current.isComputer;
      this.enemyView?.setLocked(enemyLocked);
      if (current.isComputer) {
        this.timer = window.setTimeout(() => {
          this.controller.computerMove();
        }, COMPUTER_DELAY_MS);
      }
    } else {
      this.showPassOverlay(current.name, () => this.renderPerspective(current));
    }
  }

  private onGameOver(winner: Player): void {
    this.enemyView?.setLocked(true);
    this.ownView?.refresh();
    this.enemyView?.refresh();
    sound.play(winner.isComputer ? "lose" : "win");
    this.banner.textContent = `${winner.name} wins!`;
    this.banner.classList.add("turn-banner--over");
  }

  private viewForBoardOwner(owner: Player): BoardView | null {
    if (owner === this.ownBoardOwner) return this.ownView;
    if (owner === this.enemyBoardOwner) return this.enemyView;
    return null;
  }

  private playImpact(outcome: string): void {
    if (outcome === "hit") sound.play("hit");
    else if (outcome === "sunk") sound.play("sink");
    else if (outcome === "miss") sound.play("miss");
  }

  private updateBanner(): void {
    if (this.controller.isOver) return;
    const current = this.controller.current;
    let text: string;
    if (this.controller.mode === "pvc") {
      text = current.isComputer
        ? "Computer is taking aim…"
        : "Your move — fire at will!";
    } else {
      text = `${current.name}'s turn`;
    }
    this.banner.textContent = text;
    this.banner.classList.toggle("turn-banner--waiting", current.isComputer);
  }

  private logAttack(
    attacker: Player,
    defender: Player,
    coord: Coord,
    outcome: string,
    shipType?: string
  ): void {
    const cell = `${"ABCDEFGHIJ"[coord.col]}${coord.row + 1}`;
    let text: string;
    if (outcome === "miss") text = `${attacker.name} fired at ${cell} — splash, miss.`;
    else if (outcome === "sunk")
      text = `${attacker.name} sank ${defender.name}'s ${shipType} at ${cell}!`;
    else text = `${attacker.name} hit a ship at ${cell}!`;

    const li = el("li", `log-entry log-entry--${outcome}`, text);
    this.log.prepend(li);
    while (this.log.children.length > 40) this.log.lastChild?.remove();
  }

  private shake(): void {
    this.boardArea.classList.remove("shake");
    void this.boardArea.offsetWidth; // reflow to restart animation
    this.boardArea.classList.add("shake");
  }

  private showPassOverlay(nextName: string, onContinue: () => void): void {
    const overlay = el("div", "pass-overlay");
    overlay.innerHTML = `
      <div class="pass-card">
        <div class="pass-icon">📱➡️</div>
        <h2>Pass the device</h2>
        <p>Hand it to <strong>${escapeHtml(nextName)}</strong>.</p>
      </div>`;
    const card = overlay.querySelector(".pass-card") as HTMLElement;
    card.appendChild(
      button(
        `I'm ${nextName} — Continue`,
        () => {
          overlay.remove();
          onContinue();
        },
        "btn btn--primary btn--large"
      )
    );
    this.el.appendChild(overlay);
  }
}

function escapeHtml(s: string): string {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
