import Kaaya from "kaaya"
import { Game } from "./models/game"
import { Player } from "./models/player"
import { Card } from "./models/card"
import Vue from "vue"
import { PlayerComponent } from "./views/player.vue"
import { genId, shuffle } from "./helpers"

var gameStore = Kaaya.createEntityStore()
gameStore.register("Card", (store, data) => new Card(store, data))
gameStore.register("Game", (store, data) => new Game(store, data))
gameStore.register("Player", (store, data) => new Player(store, data))

const gameId = genId()
const playerIds = [genId(), genId()]

gameStore.create("Game", { id: gameId, playerIds })
var playerNum = 1
for (var playerId of playerIds) {
	gameStore.create("Player", { id: playerId, name: `Player ${playerNum}`, gameId })
	playerNum++

	const deck: string[] = []
	for (var i = 1; i <= 20; i++) {
		var cardId = genId()
		var cost = Math.ceil(i / 3.5)
		var atk = Math.round(Math.random() * cost)
		var def = cost - atk + 1
		gameStore.create("Card", { id: cardId, playerId, gameId, name: `Card ${i}`, cost, atk, def })

		deck.push(cardId)
	}

	shuffle(deck)
	var player = gameStore.getEntity<Player>(playerId)
	player.deckIds = deck
}

var game = gameStore.getEntity<Game>(gameId)
game.init()

var player1Store = Kaaya.createEntityStore()
player1Store.register("Card", (store, data) => new Card(store, data))
player1Store.register("Game", (store, data) => new Game(store, data))
player1Store.register("Player", (store, data) => new Player(store, data))

var player2Store = Kaaya.createEntityStore()
player2Store.register("Card", (store, data) => new Card(store, data))
player2Store.register("Game", (store, data) => new Game(store, data))
player2Store.register("Player", (store, data) => new Player(store, data))

player1Store.sync(gameStore.history)
player2Store.sync(gameStore.history)

new Vue({
	el: "#app",
	components: {
		PlayerComponent: PlayerComponent
	},
	data() {
		return {
			player1: player1Store.getEntity<Player>(playerIds[0]).getJSON(),
			player2: player2Store.getEntity<Player>(playerIds[1]).getJSON()
		}
	},
	methods: {
		store1() {
			return player1Store
		},
		store2() {
			return player2Store
		},
		servPlayer1() {
			return gameStore.getEntity<Player>(playerIds[0])
		},
		servPlayer2() {
			return gameStore.getEntity<Player>(playerIds[1])
		},
		proxyPlayer1() {
			return player1Store.getEntity<Player>(playerIds[0])
		},
		proxyPlayer2() {
			return player2Store.getEntity<Player>(playerIds[1])
		},
		refreshPlayers() {
			this.player1 = player1Store.getEntity<Player>(this.player1.id).getJSON()
			this.player2 = player2Store.getEntity<Player>(this.player2.id).getJSON()
			console.log(this.player1, this.player2)
		}
	},
	template: `<div>
		<PlayerComponent :player="player1" :getplayer="proxyPlayer1" :servplayer="servPlayer1"></PlayerComponent>
		<PlayerComponent :player="player2" :getplayer="proxyPlayer2" :servplayer="servPlayer2"></PlayerComponent>
	</div>`,
	mounted() {
		gameStore.observe(() => {
			player1Store.sync(gameStore.history)
			player2Store.sync(gameStore.history)
			this.refreshPlayers()
		})
	}
})
