# Chess Royale

Chess Royale is a small **game design experiment** that adds a **pre-game “army building” phase** to classic chess: both players build their own set of pieces under shared constraints, then play **standard chess** from a custom setup.

## Play (no install)

This project is a single HTML file.

1. Download the repository (or just `scacchi-reali.html`).
2. Open the HTML file in your browser:

   * double-click it, **or**
   * (recommended) run a tiny local server to avoid any browser restrictions:

     ```bash
     # Python 3
     python -m http.server 8000
     ```

     then open `http://localhost:8000/scacchi-reali.html`

That’s it.

## How the game works

A match has four phases:

### 1) Setup

* Choose **Human** or **AI** for White and Black.
* Choose AI speed:

  * **Instant** (plays immediately)
  * **Step-by-step** (you advance AI moves manually)
  * **Timed** (about 1 second per move)

### 2) Army selection (deckbuilding)

Each player secretly builds an army within these constraints:

* **Budget:** 39 points
* **Slots:** up to 15 pieces (**King is free and mandatory**)
* **Piece costs:**

  * Queen: 9
  * Rook: 5
  * Bishop: 3
  * Knight: 3
  * Pawn: 1

UI tips:

* Use **Classic** to load the standard chess set.
* Use **Clear** to reset.
* **Confirm** locks your army.

### 3) Positioning

After both armies are confirmed, each player places their pieces:

* You can place pieces **freely** in the **first two ranks** on your side.
* The **King can be placed anywhere** in those two ranks.

Controls:

* **Auto**: auto-place pieces (useful for quick tests / AI players).
* **Confirm**: lock the placement.

### 4) Play (standard chess rules)

Once placement is confirmed, the game proceeds like normal chess:

* Standard movement and captures
* **Checkmate** ends the game
* Pawns can advance two squares from their initial placed rank (if clear)
* Promotion works normally
* Castling is not available (free placement makes it undefined)

## AI notes

The built-in AI is intentionally simple: a lightweight minimax with alpha-beta pruning and a material-based evaluation. It’s designed for quick experimentation and testing, not for engine-level play.

## Controls during the match

* **New Game** starts over.
* If AI speed is **Step-by-step**, a **Next Move** button appears to advance the AI turn.

## License

Add your preferred license here (MIT / Apache-2.0 / GPL / etc.).
