import { EntityStore } from "kaaya"
import { uid } from "coopa"
import { Game } from "./game"

export const enum PlayerStatus {
	waiting = 0,
	playing = 1,
	winning = 2,
	losing = 3
}

export interface IPlayerData {
	id: string
	gameId: string
	name: string
	hp: number
	xp: number
	mana: number
	status: PlayerStatus
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
		return this.deckIds.map(x => this.game.getCardEntity(x).getJSON())
	}
	get deckCards() {
		return this.deckIds.map(x => this.game.getCardEntity(x))
	}
	get deckIds() {
		return this.data.deckCardIds
	}
	set deckIds(val: string[]) {
		this.watchedData.deckCardIds = val
	}

	get hand() {
		return this.handIds.map(x => this.game.getCardEntity(x).getJSON())
	}
	get handCards() {
		return this.handIds.map(x => this.game.getCardEntity(x))
	}
	get handIds() {
		return this.data.handCardIds
	}
	set handIds(val: string[]) {
		this.watchedData.handCardIds = val
	}

	get board() {
		return this.boardIds.map(x => this.game.getCardEntity(x).getJSON())
	}
	get boardCards() {
		return this.boardIds.map(x => this.game.getCardEntity(x))
	}
	get boardIds() {
		return this.data.boardCardIds
	}
	set boardIds(val: string[]) {
		this.watchedData.boardCardIds = val
	}

	get playing(): boolean {
		return this.data.status === PlayerStatus.playing
	}

	get winning(): boolean {
		return this.data.status === PlayerStatus.winning
	}

	get losing(): boolean {
		return this.data.status === PlayerStatus.losing
	}

	get status() {
		return this.data.status
	}
	set status(val) {
		this.watchedData.status = val
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
		id: uid(),
		gameId: "",
		name: "",
		mana: 0,
		hp: 16,
		xp: 0,
		status: PlayerStatus.waiting,
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
		if (this.game.turn.round === 1 && this.game.turn.player === 0) {
			this.mana = this.game.turn.round
		} else {
			this.mana = this.game.turn.round + 1
		}
		for (var card of this.boardCards) {
			card.reset()
		}
		this.watchedData.attackCardIds = []
	}

	public getXP(val: number) {
		this.watchedData.xp += val
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

		this.store.transactionStart()
		this.mana -= card.cost
		this.watchedData.handCardIds.splice(pos, 1)
		this.watchedData.boardCardIds.push(cardId)

		if (cardId) {
			var card = this.game.getCardEntity(cardId)
			card.visibility = "public"
		}
		this.store.transactionEnd("placeCard", { cardId })
	}

	public attack(cardId: string, valid: boolean = true) {
		if (valid && this.game.turnPlayerId !== this.id) throw new Error("Not your turn")
		var card = this.game.getCardEntity(cardId)
		if (valid && card.player !== this.id) throw new Error(`Not your card ${card.player} / ${this.id}`)
		if (card.tap) throw new Error(`Already tapped`)
		this.store.transactionStart()
		card.tap = true
		this.watchedData.attackCardIds.push(card.id)
		this.store.transactionEnd("prepareAtk", { cardId: card.id })
	}

	public killCard(cardId: string) {
		var pos = this.watchedData.boardCardIds.indexOf(cardId)
		if (pos !== -1) {
			this.watchedData.boardCardIds.splice(pos, 1)
			this.watchedData.graveyardCardIds.push(cardId)
		}
		this.getXP(1)
	}

	public skill() {
		if (this.game.turnPlayerId !== this.id) throw new Error("Not your turn")
		if (this.watchedData.xp < 10) return
		this.store.transactionStart()
		this.getXP(-10)
		if (this.hp < 6) {
			for (var card of this.enemy.boardCards) {
				this.enemy.killCard(card.id)
			}
		} else {
			for (var card of this.enemy.boardCards) {
				card.addModifier("atk", 1 - card.modifiedAtk, "skill")
				card.addModifier("def", 1 - card.modifiedDef, "skill")
			}
		}
		this.store.transactionEnd("useSkill", {})
	}

	public endTurn() {
		if (this.data.attackCardIds.length > 0) {
			const defendIds = this.enemy.board.map(x => x.id)
			this.store.transactionStart({
				id: "attack",
				attacker: this.id,
				defender: this.enemy.id,
				atk: this.data.attackCardIds,
				def: defendIds
			})

			const levelup: { [id: string]: number } = {}
			const damages: { [id: string]: number } = {}
			let hp = 0
			for (var i = 0; i < this.data.attackCardIds.length; i++) {
				var cardAtk = this.game.getCardEntity(this.data.attackCardIds[i])
				if (!defendIds[i]) {
					this.enemy.hp -= cardAtk.modifiedAtk
					hp += cardAtk.modifiedAtk
					this.enemy.getXP(cardAtk.modifiedAtk)
					if (cardAtk.level < 2) {
						levelup[cardAtk.id] = 1
						cardAtk.level += 1
					}
				} else {
					var cardDef = this.game.getCardEntity(defendIds[i])
					cardDef.addModifier("def", -cardAtk.modifiedAtk, "damage")
					cardAtk.addModifier("def", -cardDef.modifiedAtk, "damage")
					damages[cardDef.id] = -cardAtk.modifiedAtk
					damages[cardAtk.id] = -cardDef.modifiedAtk
					if (cardDef.modifiedDef <= 0 && cardAtk.modifiedDef > 0) {
						cardAtk.level += 1
						levelup[cardAtk.id] = 1
					}
					if (cardAtk.modifiedDef <= 0 && cardDef.modifiedDef > 0) {
						cardDef.level += 1
						levelup[cardDef.id] = 1
					}
				}
			}

			for (var player of [this, this.enemy]) {
				for (var card of player.boardCards) {
					if (card.modifiedDef <= 0) {
						delete levelup[card.id]
						player.killCard(card.id)
					}
				}
			}

			this.store.transactionEnd("attack", {
				damages,
				levelup,
				hp
			})
		}
		this.game.nextTurn()
	}

	public getJSON() {
		const data = JSON.parse(JSON.stringify(this.data))
		data.deck = JSON.parse(JSON.stringify(this.deck))
		data.hand = JSON.parse(JSON.stringify(this.hand))
		data.board = JSON.parse(JSON.stringify(this.board))
		data.playing = this.playing
		data.winning = this.winning
		data.losing = this.losing
		return data
	}
}
