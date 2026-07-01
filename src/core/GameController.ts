import type { AttackResult } from "./Gameboard";
import { Player } from "./Player";
import type { Coord, GameMode } from "./types";

export type GameState =
  | "menu"
  | "placement"
  | "passDevice"
  | "playing"
  | "gameOver";

export interface AttackEvent {
  attacker: Player;
  defender: Player;
  coord: Coord;
  result: AttackResult;
}

type ControllerEvents = {
  attack: AttackEvent;
  turnChange: { current: Player; opponent: Player };
  gameOver: { winner: Player; loser: Player };
};

type Handler<T> = (payload: T) => void;

/** Minimal typed pub/sub so the UI can react without the core knowing the DOM. */
class Emitter<E extends Record<string, unknown>> {
  private handlers: { [K in keyof E]?: Set<Handler<E[K]>> } = {};

  on<K extends keyof E>(event: K, handler: Handler<E[K]>): () => void {
    (this.handlers[event] ??= new Set<Handler<E[K]>>()).add(handler);
    return () => this.handlers[event]?.delete(handler);
  }

  emit<K extends keyof E>(event: K, payload: E[K]): void {
    this.handlers[event]?.forEach((h) => h(payload));
  }
}

/**
 * Owns turn order and win detection. Deliberately free of timers and DOM so it
 * stays unit-testable; the UI handles suspense delays and screen transitions by
 * subscribing to events and calling `computerMove()` when appropriate.
 */
export class GameController {
  readonly mode: GameMode;
  readonly players: readonly [Player, Player];
  private currentIndex: 0 | 1 = 0;
  private _state: GameState = "menu";
  private over = false;
  private readonly emitter = new Emitter<ControllerEvents>();

  constructor(mode: GameMode, player1: Player, player2: Player) {
    this.mode = mode;
    this.players = [player1, player2];
  }

  get current(): Player {
    return this.players[this.currentIndex];
  }

  get opponent(): Player {
    return this.players[this.currentIndex === 0 ? 1 : 0];
  }

  get state(): GameState {
    return this._state;
  }

  get isOver(): boolean {
    return this.over;
  }

  setState(state: GameState): void {
    this._state = state;
  }

  on<K extends keyof ControllerEvents>(
    event: K,
    handler: Handler<ControllerEvents[K]>
  ): () => void {
    return this.emitter.on(event, handler);
  }

  /** Begin the battle phase with player 1 to move. */
  startBattle(): void {
    this.currentIndex = 0;
    this.over = false;
    this._state = "playing";
  }

  isComputerTurn(): boolean {
    return !this.over && this.current.isComputer;
  }

  /**
   * The current player fires at the opponent's board.
   * Returns the result, or null if the shot was illegal (out of bounds / repeat
   * / game already over).
   */
  fire(coord: Coord): AttackResult | null {
    if (this.over) return null;
    const defender = this.opponent;
    if (defender.gameboard.isShot(coord.row, coord.col)) return null;

    const attacker = this.current;
    const result = defender.gameboard.receiveAttack(coord.row, coord.col);
    if (result.outcome === "already") return null;

    this.emitter.emit("attack", { attacker, defender, coord, result });

    if (defender.gameboard.allSunk()) {
      this.over = true;
      this._state = "gameOver";
      this.emitter.emit("gameOver", { winner: attacker, loser: defender });
      return result;
    }

    this.currentIndex = this.currentIndex === 0 ? 1 : 0;
    this.emitter.emit("turnChange", {
      current: this.current,
      opponent: this.opponent,
    });
    return result;
  }

  /** Have the current computer player choose and execute a shot. */
  computerMove(): AttackResult | null {
    if (!this.isComputerTurn()) return null;
    const ai = this.current.ai!;
    const enemy = this.opponent.gameboard;
    const target = ai.nextTarget(enemy);
    const result = this.fire(target);
    if (result) ai.registerResult(target, result);
    return result;
  }
}
