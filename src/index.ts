import Kaaya from "kaaya"
import { Game } from "./models/game"
import { Player } from "./models/player"
import { Card } from "./models/card"
// import { PlayerComponent } from "./views/player.vue"
import { genId, shuffle } from "./helpers"
import { initialize } from "jil"
import { SceneComponent } from "jil/build/declarations/components/ui"
import { PlayerView } from "./views/playerView"
import { GameView } from "./views/gameView"
import { CardView } from "./views/cardView"

var gameStore = Kaaya.createEntityStore()
gameStore.observe(mut => console.log(`New mutation`, mut))
gameStore.register("Card", (store, data) => new Card(store, data))
gameStore.register("Game", (store, data) => new Game(store, data))
gameStore.register("Player", (store, data) => new Player(store, data))

const gameId = genId()
const playerIds = [genId(), genId()]

gameStore.transactionStart()
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
gameStore.transactionEnd("init")

var game = gameStore.getEntity<Game>(gameId)

var viewStore = Kaaya.createEntityStore()
viewStore.register("Card", (store, data) => new CardView(store, data))
viewStore.register("Game", (store, data) => new GameView(store, data))
viewStore.register("Player", (store, data) => new PlayerView(store, data))

viewStore.sync(gameStore.history)

const window = initialize(document.getElementById("app") as HTMLElement)
const scene = window.createScene("game")

function createBoard(scene: SceneComponent) {
	const p1Board = scene.gameobject.createPanel()
	p1Board.transform.scale.set(0.8, 0.5)
	p1Board.transform.anchor.set(0, 1)
	p1Board.transform.pivot.set(0, 1)

	const p1Deck = scene.gameobject.createPanel()
	p1Deck.transform.scale.set(0.2, 0.5)
	p1Deck.transform.anchor.set(1, 1)
	p1Deck.transform.pivot.set(1, 1)

	const p1Hand = scene.gameobject.createPanel()
	p1Hand.transform.scale.set(0.5, 0.3)
	p1Hand.transform.anchor.set(0, 1)
	p1Hand.transform.pivot.set(0, 1)

	const p2Board = scene.gameobject.createPanel()
	p2Board.transform.scale.set(0.8, 0.5)
	p2Board.transform.anchor.set(1, 0)
	p2Board.transform.pivot.set(1, 0)

	const p2Deck = scene.gameobject.createPanel()
	p2Deck.transform.scale.set(0.2, 0.5)
	p2Deck.transform.anchor.set(0, 0)
	p2Deck.transform.pivot.set(0, 0)

	const p2Hand = scene.gameobject.createPanel()
	p2Hand.transform.scale.set(0.5, 0.3)
	p2Hand.transform.anchor.set(1, 0)
	p2Hand.transform.pivot.set(1, 0)

	p1Board.gameobject.createImage({
		src: "https://hdqwalls.com/download/gradient-geometry-background-abstract-lu-1280x720.jpg"
	})
	p1Deck.gameobject.createImage({
		src: "https://hdqwalls.com/download/gradient-geometry-background-abstract-lu-1280x720.jpg"
	})
	p1Hand.gameobject.createImage({
		src: "https://hdqwalls.com/download/gradient-geometry-background-abstract-lu-1280x720.jpg"
	})

	p2Board.gameobject.createImage({
		src: "https://hdqwalls.com/download/gradient-geometry-background-abstract-lu-1280x720.jpg"
	})
	p2Deck.gameobject.createImage({
		src: "https://hdqwalls.com/download/gradient-geometry-background-abstract-lu-1280x720.jpg"
	})
	p2Hand.gameobject.createImage({
		src: "https://hdqwalls.com/download/gradient-geometry-background-abstract-lu-1280x720.jpg"
	})

	return {
		players: [{ board: p1Board, hand: p1Hand, deck: p1Deck }, { board: p2Board, hand: p2Hand, deck: p2Deck }]
	}
}

createBoard(scene)

// scene.gameobject.createPanel("player1_hand")

console.log(window, game, scene)
// new Vue({
// 	el: "#app",
// 	components: {
// 		PlayerComponent: PlayerComponent
// 	},
// 	data() {
// 		return {
// 			attack: null,
// 			waitCallback: undefined as { (): void } | undefined,
// 			game: viewStore.getEntity<Game>(gameId).getJSON(),
// 			player1: viewStore.getEntity<Player>(playerIds[0]).getJSON(),
// 			player2: viewStore.getEntity<Player>(playerIds[1]).getJSON()
// 		}
// 	},
// 	methods: {
// 		getModalClass() {
// 			return `modal ${this.attack ? "is-active" : ""}`
// 		},
// 		next() {
// 			if (!this.waitCallback) return
// 			this.waitCallback()
// 			this.waitCallback = undefined
// 		},
// 		store() {
// 			return viewStore
// 		},
// 		servPlayer1() {
// 			return gameStore.getEntity<Player>(playerIds[0])
// 		},
// 		servPlayer2() {
// 			return gameStore.getEntity<Player>(playerIds[1])
// 		},
// 		proxyPlayer1() {
// 			return viewStore.getEntity<Player>(playerIds[0])
// 		},
// 		proxyPlayer2() {
// 			return viewStore.getEntity<Player>(playerIds[1])
// 		},
// 		refreshPlayers() {
// 			this.game = viewStore.getEntity<Game>(gameId).getJSON()
// 			this.player1 = viewStore.getEntity<Player>(this.player1.id).getJSON()
// 			this.player2 = viewStore.getEntity<Player>(this.player2.id).getJSON()
// 			// console.log(this.player1, this.player2)
// 		}
// 	},
// 	template: `<div>
// 		<div v-if="this.attack" :class="getModalClass()">
// 			<div class="modal-background"></div>
// 			<div class="modal-content">
// 				<article class="message">
// 				<div class="message-header">
// 					<p>Attack !</p>
// 				</div>
// 				<div class="message-body">
// 					<p>
// 						<b>{{store().getEntity(attack.attacker).data.name}}</b> ({{ attack.attacker }})
// 						=>
// 						<b>{{store().getEntity(attack.defender).data.name}}</b> ({{ attack.defender }})
// 					</p>
// 					<br>
// 					<p>
// 						<h3>Card Attack:</h3>
// 						<ul type="1">
// 							<li v-for="cardId of attack.atk" v-bind:key="cardId" style="margin-left: 25px;">
// 								<b>{{ store().getEntity(cardId).data.name }}</b> : {{ store().getEntity(cardId).modifiedAtk }}/{{ store().getEntity(cardId).modifiedDef }}
// 								<b v-if="attack.damages[cardId]">-> received {{ Math.abs(attack.damages[cardId]) }} dmg {{ (store().getEntity(cardId).modifiedDef + attack.damages[cardId] <= 0) ? '=> DEAD !' : '' }}</b>
// 								<b v-if="attack.levelup[cardId]">-> Level UP !!!</b>
// 							</li>
// 						</ul>
// 					</p>
// 					<div v-if="this.attack.def && this.attack.def.length > 0">
// 						<br>
// 						<h3>Card Defend:</h3>
// 						<ul type="1">
// 							<li v-for="cardId of attack.def" v-bind:key="cardId" style="margin-left: 25px;">
// 								<b>{{ store().getEntity(cardId).data.name }}</b> : {{ store().getEntity(cardId).modifiedAtk }}/{{ store().getEntity(cardId).modifiedDef }}
// 								<b v-if="attack.damages[cardId]">-> received {{ Math.abs(attack.damages[cardId]) }} dmg {{ (store().getEntity(cardId).modifiedDef + attack.damages[cardId] <= 0) ? '=> DEAD !' : '' }}</b>
// 								<b v-if="attack.levelup[cardId]">-> Level UP !!!</b>
// 							</li>
// 						</ul>
// 					</div>
// 					<div v-if="this.attack.hp > 0">
// 						<br>
// 						<h3>Defender loss <b>{{attack.hp}}</b> HP !</h3>
// 					</div>
// 					<p style="text-align: center; margin-top: 25px">
// 						<button class="button is-link" aria-label="close" v-on:click="next()">Close</button>
// 					</p>
// 				</div>
// 				</article>
// 			</div>
// 			<button class="modal-close is-large" aria-label="close" v-on:click="next()"></button>
// 		</div>

// 		<div>
// 			<h1 class="title" style="text-align: center; margin-left: -120px">Game ({{ game.id }}) - Turn: {{ game.turn.round }}</h1>
// 			<progress class="progress is-danger" :value="100 * player1.hp / (player1.hp + player2.hp)" max="100" style="width: 91%;margin: 0 20px;"></progress>
// 		</div>

// 		<PlayerComponent :player="player1" :getplayer="proxyPlayer1" :servplayer="servPlayer1" style="background-color: #f6edcf"></PlayerComponent>
// 		<PlayerComponent :player="player2" :getplayer="proxyPlayer2" :servplayer="servPlayer2" style="background-color: #daf1f9"></PlayerComponent>

// 	</div>`,
// 	mounted() {
// 		viewStore.addHookBefore("transaction", "attack", (_obj, mut) => {
// 			return new Promise(resolve => {
// 				console.log("Start waiting attack !", mut.id, mut.name, mut.path, mut.data)
// 				this.attack = mut.data.meta
// 				this.waitCallback = () => {
// 					console.log("Stop waiting attack !", mut.id, mut.name, mut.path, mut.data)
// 					this.attack = null
// 					resolve()
// 				}
// 			})
// 		})

// 		gameStore.observe(mut => {
// 			if (mut.name !== "transaction") return
// 			viewStore.syncAsync(gameStore.history).then(() => this.refreshPlayers())
// 		})

// 		game.start()
// 	}
// })
