import { EntityStore } from "kaaya"
import nanoid = require("nanoid/non-secure")
import { ICardData, cardDataDefault, Card } from "./card"
import { Player } from "./player"

export interface IGameData {
	id: string
	playerIds: string[]
	turn: {
		round: number
		player: number
	}
}

export class Game {
	get id() {
		return this.data.id
	}

	get turn() {
		return this.data.turn
	}
	get turnPlayerId() {
		return this.playerIds[this.data.turn.player]
	}
	get players() {
		return this.playerIds.map(x => this.store.getEntity<Player>(x))
	}
	get playerIds() {
		return this.data.playerIds
	}
	set playerIds(value: string[]) {
		this.watchedData.playerIds = value
	}

	protected data: IGameData
	protected get watchedData(): IGameData {
		return this.store.getData(this.data.id)
	}

	private store: EntityStore

	dataDefault: IGameData = {
		id: nanoid(),
		playerIds: [],
		turn: {
			round: 1,
			player: 0
		}
	}

	constructor(store: EntityStore, data: any) {
		this.store = store
		this.data = Object.assign({}, this.dataDefault, data)
	}

	public init() {
		for (var player of this.players) {
			player.init()
		}
		this.players[0].playing = true
		this.players[0].reset()
	}

	public nextTurn() {
		if (this.watchedData.turn.player === 0) {
			this.watchedData.turn.player = 1
		} else {
			this.watchedData.turn.player = 0
			this.watchedData.turn.round += 1
		}
		this.players[0].playing = this.watchedData.turn.player === 0
		this.players[1].playing = this.watchedData.turn.player === 1
		this.players[this.watchedData.turn.player].reset()
		this.players[this.watchedData.turn.player].draw()
	}

	public getCardEntity(id: string): Card {
		return this.store.getEntity<Card>(id)
	}

	public getCard(id: string): ICardData {
		var card = this.store.getData(id)
		if (!card) {
			card = JSON.parse(JSON.stringify(cardDataDefault))
			card.id = id
		}
		return card
	}
}
