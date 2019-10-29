import { EntityStore } from "kaaya"
import { ICardData, cardDataDefault, Card } from "./card"
import { Player, PlayerStatus } from "./player"
import { uid } from "coopa"

export const enum GameStatus {
	Init = 0,
	Playing = 1,
	Finished = 2
}
export interface IGameData {
	id: string
	status: GameStatus
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
		id: uid(),
		status: 0,
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

	public start() {
		this.store.transactionStart()
		for (var player of this.players) {
			player.init()
		}
		this.players[0].status = 1
		this.players[0].reset()
		this.watchedData.status = GameStatus.Playing
		this.store.transactionEnd("gameStart")
	}

	public finish() {
		this.watchedData.status = GameStatus.Finished
	}

	public nextTurn() {
		if (this.watchedData.status === GameStatus.Finished) return
		if (this.players[0].hp <= 0) {
			this.players[0].status = PlayerStatus.losing
			this.players[1].status = PlayerStatus.winning
			this.finish()
			return
		}
		if (this.players[1].hp <= 0) {
			this.players[1].status = PlayerStatus.losing
			this.players[0].status = PlayerStatus.winning
			this.finish()
			return
		}
		if (this.data.turn.round >= 20) {
			this.players[0].status = PlayerStatus.losing
			this.players[1].status = PlayerStatus.losing
			this.finish()
			return
		}
		this.store.transactionStart()
		if (this.watchedData.turn.player === 0) {
			this.watchedData.turn.player = 1
		} else {
			this.watchedData.turn.player = 0
			this.watchedData.turn.round += 1
		}
		this.players[0].status = this.watchedData.turn.player === 0 ? 1 : 0
		this.players[1].status = this.watchedData.turn.player === 1 ? 1 : 0
		this.players[this.watchedData.turn.player].reset()
		this.store.transactionEnd("endTurn")
		this.store.transactionStart()
		this.players[this.watchedData.turn.player].draw()
		if (this.data.turn.round >= 6) {
			this.players[this.watchedData.turn.player].draw()
		}
		this.store.transactionEnd("turnDraw")
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

	public getJSON() {
		const data = JSON.parse(JSON.stringify(this.data))
		return data
	}
}
