import { EntityStore } from "kaaya"

export interface IModifier {
	key: string
	value: number
	type: string
}

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
	tap: boolean
	modifiers: IModifier[]
}

export const cardDataDefault: ICardData = {
	id: "",
	gameId: "",
	playerId: "",
	name: "Card",
	desc: "Description",
	visibility: "hidden",
	cost: 0,
	atk: 0,
	def: 0,
	level: 1,
	tap: false,
	modifiers: []
}

export class Card {
	get id() {
		return this.data.id
	}
	get level() {
		return this.data.level
	}
	set level(value: number) {
		this.watchedData.level = value <= 4 ? value : 4
	}
	get atk() {
		return this.data.atk
	}
	get def() {
		return this.data.def
	}
	get modifiers() {
		return this.data.modifiers
	}
	get modifiedAtk() {
		return this.atk + this.getModifiers("atk")
	}
	get modifiedDef() {
		return this.def + this.getModifiers("def")
	}
	get player() {
		return this.data.playerId
	}
	get cost() {
		return this.data.cost
	}
	get tap() {
		return this.data.tap
	}
	set tap(val: boolean) {
		this.watchedData.tap = val
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
		if (!data.modifiers) data.modifiers = []
		this.data = Object.assign({}, cardDataDefault, data)
	}

	public addModifier(key: string, value: number, type: string) {
		const modifier = { key, value, type }
		this.watchedData.modifiers.push(modifier)
		// console.log(
		// 	"addModifier",
		// 	this.id,
		// 	modifier,
		// 	`Atk: ${this.atk}->${this.modifiedAtk}, Def: ${this.def}->${this.modifiedDef}`
		// )
	}
	public getModifiers(key: string): number {
		return this.data.modifiers.filter(x => x.key === key).reduce((a, b) => a + b.value, 0)
	}

	public reset() {
		this.watchedData.tap = false
		var data = []
		if (this.level > 1) {
			data.push({ key: "atk", value: this.level - 1, type: "level" })
			data.push({ key: "def", value: this.level - 1, type: "level" })
		}
		this.watchedData.modifiers = data
	}

	public getJSON() {
		const data = JSON.parse(JSON.stringify(this.data))
		data.modifiedAtk = this.modifiedAtk
		data.modifiedDef = this.modifiedDef
		return data
	}
}
