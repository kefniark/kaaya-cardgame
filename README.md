# Card game

Simple card game design mostly for AI testing and ML experimentation (not designed to be real card game).

[Play Here !!!](https://kefniark.github.io/kaaya-cardgame/dist/)

Based on:

-   [Kaaya](https://github.com/kefniark/kaaya) : Data management
-   [Vuejs](https://github.com/vuejs) : For templating
-   [Bulma](https://bulma.io) : Css framework
-   [Typescript](https://www.typescriptlang.org/) : because I need types :D

---

## Rules

-   each player start with:
    -   a deck of 25 cards
    -   16 hp
    -   and draw 4 card as his hand
-   at the beginning of each turn:
    -   the player first reset his board cards (remove damages, tap, ...)
    -   draw a new card
-   and from here can do few actions
    -   use some mana to pay a card cost and **place** it on the board
    -   **attack** with a card on the board
    -   **end the turn** if there is nothing else to do

Card are dumb simple and have only 4 properties:

-   atk
-   def
-   cost
-   level (which provides +1/+1 at each levelup)

Main difference with a normal card games

-   No card abilities
-   No event or counter/trap card
-   No deck building (randomly generated)
-   No hero with abilities
-   The main strategy is only based on the order or attack

---

## Development

### Getting Started

If you want to take a look at the code or help, it's quite easy to get started

```sh
npm install
npm run dev
```

This will start a server on http://localhost:8080/ where you can test few samples with the current version

### Build

To make a build (generated in `build/`)

```sh
npm run build
```
