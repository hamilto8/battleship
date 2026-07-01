import { Gameboard } from "./Gameboard";
import { ComputerAI } from "./ComputerAI";

/**
 * A participant in the game. Each player owns their own board (their fleet).
 * Computer players additionally carry an AI to choose targets on the opponent.
 */
export class Player {
  readonly name: string;
  readonly isComputer: boolean;
  readonly gameboard: Gameboard;
  readonly ai: ComputerAI | null;

  constructor(name: string, isComputer = false) {
    this.name = name;
    this.isComputer = isComputer;
    this.gameboard = new Gameboard();
    this.ai = isComputer ? new ComputerAI() : null;
  }
}
