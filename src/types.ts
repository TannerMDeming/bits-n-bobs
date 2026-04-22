export interface Round {
  answer: string;          // e.g. "ecological"
  tiles: string[];         // correct tiles in order, e.g. ["e","co","log","i","cal"]
  clue: string;            // e.g. "Deductive, environmentally"
}

export interface Puzzle {
  id: number;
  date: string;            // "YYYY-MM-DD"
  tileset: string[];       // all 12 available tiles
  rounds: Round[];         // 5 rounds
}

// Which tile in the grid is in which tray slot (null = not placed)
export type TraySlot = string | null;

export type GamePhase =
  | 'start'       // splash screen
  | 'playing'     // active gameplay
  | 'roundWin'    // brief celebration before next round
  | 'results';    // final results screen
