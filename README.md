# Chess Royale

Chess Royale is a small **game design experiment** that adds a **pre-game "army building" phase** to classic chess: both players build their own set of pieces under shared constraints, then play **standard chess** from a custom setup.

## Play online

**[Play Chess Royale](https://surgiker.github.io/Chess-Royale/)** — no download required.

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

The built-in AI is intentionally simple: a lightweight minimax with alpha-beta pruning and a material-based evaluation. It's designed for quick experimentation and testing, not for engine-level play.

## Controls during the match

* **New Game** starts over.
* If AI speed is **Step-by-step**, a **Next Move** button appears to advance the AI turn.

## Language support

The game supports **English**, **Italian**, and **Chinese**. Use the language selector on the main screen to switch. Your preference is saved in local storage.

## Run locally

Clone the repository and serve the files:

```bash
git clone https://github.com/surgiker/Chess-Royale.git
cd Chess-Royale
python -m http.server 8000
```

Then open `http://localhost:8000`

## Project structure

```
Chess-Royale/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── constants.js
│   ├── state.js
│   ├── utils.js
│   ├── i18n.js          # translations (EN/IT/ZH)
│   ├── ai.js
│   ├── ui-setup.js
│   ├── army-selection.js
│   ├── positioning.js
│   ├── game.js
│   └── main.js
└── README.md
```

## Previous versions

* **[v1](https://github.com/surgiker/Chess-Royale/tree/v1)** — original single-file version (archived)

## License

Add your preferred license here (MIT / Apache-2.0 / GPL / etc.).
