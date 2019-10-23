import { EntityStore } from "kaaya"
import nanoid = require("nanoid/non-secure")
import { Game } from "./game"
import { Card } from "./card"

export interface IPlayerData {
	id: string
	gameId: string
	name: string
	hp: number
	mana: number
	playing: boolean
	deckCardIds: string[]
	handCardIds: string[]
	boardCardIds: string[]
	graveyardCardIds: string[]
	attackCardIds: string[]
}

export class Player {
	get id() {
		return this.data.id
	}

	get game(): Game {
		return this.store.getEntity<Game>(this.data.gameId)
	}
	get enemy(): Player {
		var enemyId = this.game.playerIds[0] === this.id ? this.game.playerIds[1] : this.game.playerIds[0]
		return this.store.getEntity<Player>(enemyId)
	}

	get deck() {
		return this.deckIds.map(x => this.game.getCard(x))
	}
	get deckIds() {
		return this.data.deckCardIds
	}
	set deckIds(val: string[]) {
		this.watchedData.deckCardIds = val
	}

	get hand() {
		return this.handIds.map(x => this.game.getCard(x))
	}
	get handIds() {
		return this.data.handCardIds
	}
	set handIds(val: string[]) {
		this.watchedData.handCardIds = val
	}

	get board() {
		return this.boardIds.map(x => this.game.getCard(x))
	}
	get boardIds() {
		return this.data.boardCardIds
	}
	set boardIds(val: string[]) {
		this.watchedData.boardCardIds = val
	}

	get playing(): boolean {
		return this.data.playing
	}
	set playing(val: boolean) {
		this.watchedData.playing = val
	}

	get mana(): number {
		return this.data.mana
	}
	set mana(val: number) {
		this.watchedData.mana = val
	}

	get hp(): number {
		return this.data.hp
	}
	set hp(val: number) {
		this.watchedData.hp = val
	}

	protected data: IPlayerData
	protected get watchedData(): IPlayerData {
		return this.store.getData(this.data.id)
	}

	private store: EntityStore

	dataDefault: IPlayerData = {
		id: nanoid(),
		gameId: "",
		name: "",
		mana: 0,
		hp: 10,
		playing: false,
		deckCardIds: [],
		handCardIds: [],
		boardCardIds: [],
		graveyardCardIds: [],
		attackCardIds: []
	}

	constructor(store: EntityStore, data: IPlayerData) {
		this.store = store
		this.data = Object.assign({}, this.dataDefault, data)
	}

	public init() {
		for (var i = 0; i < 4; i++) {
			this.draw(false)
		}
	}

	public reset() {
		this.mana = this.game.turn.round
		for (var cardId of this.boardIds) {
			var card = this.store.getEntity<Card>(cardId)
			card.reset()
		}
		this.watchedData.attackCardIds = []
	}

	public draw(valid: boolean = true): string {
		if (valid && this.game.turnPlayerId !== this.id) throw new Error("Not your turn")
		var cardId = this.watchedData.deckCardIds.pop()
		if (!cardId) throw new Error("Run out of card")
		this.watchedData.handCardIds.push(cardId)

		if (cardId) {
			var card = this.game.getCardEntity(cardId)
			card.visibility = "private"
		}

		return cardId
	}

	public place(cardId: string, valid: boolean = true) {
		if (valid && this.game.turnPlayerId !== this.id) throw new Error("Not your turn")
		var card = this.game.getCardEntity(cardId)
		if (valid && card.player !== this.id) throw new Error(`Not your card ${card.player} / ${this.id}`)
		if (valid && card.cost > this.mana) throw new Error(`Not enough mana ${card.cost} > ${this.mana}`)
		var pos = this.watchedData.handCardIds.indexOf(cardId)
		if (pos === -1) throw new Error("Cant find this card in your hand")

		this.mana -= card.cost
		this.watchedData.handCardIds.splice(pos, 1)
		this.watchedData.boardCardIds.push(cardId)

		if (cardId) {
			var card = this.game.getCardEntity(cardId)
			card.visibility = "public"
		}
	}

	public attack(cardId: string, valid: boolean = true) {
		if (valid && this.game.turnPlayerId !== this.id) throw new Error("Not your turn")
		var card = this.game.getCardEntity(cardId)
		if (valid && card.player !== this.id) throw new Error(`Not your card ${card.player} / ${this.id}`)
		if (card.engaged) throw new Error(`Already engaged`)

		card.engaged = true
		this.watchedData.attackCardIds.push(card.id)
	}

	public killCard(cardId: string) {
		var pos = this.watchedData.boardCardIds.indexOf(cardId)
		if (pos !== -1) {
			this.watchedData.boardCardIds.splice(pos, 1)
			this.watchedData.graveyardCardIds.push(cardId)
		}
	}

	public endTurn() {
		if (this.data.attackCardIds.length > 0) {
			const defendIds = this.enemy.board.filter(x => !x.engaged).map(x => x.id)
			for (var i = 0; i < this.data.attackCardIds.length; i++) {
				var cardAtk = this.game.getCardEntity(this.data.attackCardIds[i])
				if (!defendIds[i]) {
					this.enemy.hp -= cardAtk.atk
				} else {
					var cardDef = this.game.getCardEntity(defendIds[i])
					if (cardAtk.atk >= cardDef.def) {
						this.enemy.killCard(cardDef.id)
					}
					if (cardDef.atk >= cardAtk.def) {
						this.killCard(cardAtk.id)
					}
				}
			}
		}
		this.game.nextTurn()
	}

	public getJSON() {
		const data = JSON.parse(JSON.stringify(this.data))
		data.deck = JSON.parse(JSON.stringify(this.deck))
		data.hand = JSON.parse(JSON.stringify(this.hand))
		data.board = JSON.parse(JSON.stringify(this.board))
		return data
	}
}
