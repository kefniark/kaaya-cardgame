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
	for (var i = 1; i <= 25; i++) {
		var cardId = genId()
		var cost = Math.ceil(i / 3.5)
		var atk = Math.round(0.25 + Math.random() * cost)
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
			attack: null,
			game: player1Store.getEntity<Game>(gameId).getJSON(),
			player1: player1Store.getEntity<Player>(playerIds[0]).getJSON(),
			player2: player2Store.getEntity<Player>(playerIds[1]).getJSON()
		}
	},
	methods: {
		getModalClass() {
			return `modal ${this.attack ? "is-active" : ""}`
		},
		closeModal() {
			this.attack = null
		},
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
			this.game = player1Store.getEntity<Game>(gameId).getJSON()
			this.player1 = player1Store.getEntity<Player>(this.player1.id).getJSON()
			this.player2 = player2Store.getEntity<Player>(this.player2.id).getJSON()
			// console.log(this.player1, this.player2)
		}
	},
	template: `<div>
		<div v-if="this.attack" :class="getModalClass()">
			<div class="modal-background"></div>
			<div class="modal-content">
				<article class="message">
				<div class="message-header">
					<p>Attack !</p>
				</div>
				<div class="message-body">
					<p>
						<b>{{store1().getEntity(attack.attacker).data.name}}</b> ({{ attack.attacker }})
						=>
						<b>{{store2().getEntity(attack.defender).data.name}}</b> ({{ attack.defender }})
					</p>
					<br>
					<p>
						<h3>Card Attack:</h3>
						<ul type="1">
							<li v-for="cardId of attack.atk" v-bind:key="cardId" style="margin-left: 25px;">
								<b>{{ store1().getEntity(cardId).data.name }}</b> : {{ store1().getEntity(cardId).modifiedAtk }}/{{ store1().getEntity(cardId).modifiedDef }} {{ store1().getEntity(cardId).modifiedDef <= 0 ? '-> Dead' : '' }}
							</li>
						</ul>
					</p>
					<br>
					<p>
						<h3>Card Defend:</h3>
						<ul type="1">
							<li v-for="cardId of attack.def" v-bind:key="cardId" style="margin-left: 25px;">
								<b>{{ store1().getEntity(cardId).data.name }}</b> : {{ store1().getEntity(cardId).modifiedAtk }}/{{ store1().getEntity(cardId).modifiedDef }}  {{ store1().getEntity(cardId).modifiedDef <= 0 ? '-> Dead' : '' }}
							</li>
						</ul>
					</p>
				</div>
				</article>
			</div>
			<button class="modal-close is-large" aria-label="close" v-on:click="closeModal()"></button>
		</div>

		<div>
			<h1 class="title" style="text-align: center; margin-left: -120px">Game ({{ game.id }}) - Turn: {{ game.turn.round }}</h1>
			<progress class="progress is-danger" :value="100 * player1.hp / (player1.hp + player2.hp)" max="100" style="width: 91%;margin: 0 20px;"></progress>
		</div>

		<PlayerComponent :player="player1" :getplayer="proxyPlayer1" :servplayer="servPlayer1" style="background-color: #f6edcf"></PlayerComponent>
		<PlayerComponent :player="player2" :getplayer="proxyPlayer2" :servplayer="servPlayer2" style="background-color: #daf1f9"></PlayerComponent>

	</div>`,
	mounted() {
		gameStore.observe(mut => {
			if (mut.name === "transaction" && mut.data.meta.id === "attack") {
				this.attack = mut.data.meta
			}
			player1Store.sync(gameStore.history)
			player2Store.sync(gameStore.history)
			this.refreshPlayers()
		})
	}
})
