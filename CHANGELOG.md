# Changelog

All notable changes to Chess Royale will be documented in this file.

## [2.0.0] - 2025-01-18

### Added
- **Chinese language support (中文)** — full translation of all game text
- **Move animation** — pieces now visually slide from origin to destination square
- **Replay last move button** — watch the last move animation again at any time
- **Last move highlighting** — origin and destination squares of the last move are highlighted on the board

### Changed
- **Centered AI speed options** — the Instant/Step-by-step/Timed radio buttons are now centered in the setup panel
- **Fixed-size turn indicator** — the turn display box no longer shifts when the AI "thinking" spinner appears or disappears
- **Repository renamed** — project URL updated to `https://surgiker.github.io/Chess-Royale/`

### Fixed
- Turn indicator layout stability during AI computation

---

## [1.0.0] - Initial Release

### Features
- Army building phase with 39-point budget and 15-slot limit
- Free piece positioning in the first two ranks
- Standard chess rules (no castling due to free positioning)
- Human vs Human, Human vs AI, AI vs AI modes
- Three AI speed settings: Instant, Step-by-step, Timed
- Bilingual support: English and Italian
- Simple minimax AI with alpha-beta pruning
