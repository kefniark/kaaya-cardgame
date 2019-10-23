import { EntityStore } from "kaaya"
import nanoid = require("nanoid/non-secure")

export interface ICardData {
	id: string
	gameId: string
	playerId: string
	visibility: string

	name: string
	desc: string
	cost: number
	atk: number
	def: number
	level: number
	engaged: boolean
}

export const cardDataDefault: ICardData = {
	id: nanoid(),
	gameId: "",
	playerId: "",
	name: "Card",
	desc: "Description",
	visibility: "hidden",
	cost: 0,
	atk: 0,
	def: 0,
	level: 1,
	engaged: false
}

export class Card {
	get id() {
		return this.data.id
	}
	get atk() {
		return this.data.atk
	}
	get def() {
		return this.data.def
	}
	get player() {
		return this.data.playerId
	}
	get cost() {
		return this.data.cost
	}
	get engaged() {
		return this.data.engaged
	}
	set engaged(val: boolean) {
		this.watchedData.engaged = val
	}
	get visibility() {
		return this.data.visibility
	}
	set visibility(val: string) {
		this.watchedData.visibility = val
	}

	protected data: ICardData
	protected get watchedData(): ICardData {
		return this.store.getData(this.data.id)
	}

	private store: EntityStore

	constructor(store: EntityStore, data: ICardData) {
		this.store = store
		this.data = Object.assign({}, cardDataDefault, data)
	}

	public reset() {
		this.watchedData.engaged = false
	}
}
