import Vue from "vue"
import { Player } from "../models/player"

export const PlayerComponent = Vue.extend({
	props: ["data", "player", "getStore", "getplayer", "servplayer"],
	methods: {
		getImg(card: any) {
			return card.visibility === "hidden" ? "assets/card_back.png" : "assets/card_template.jpg"
		},
		placeCard(cardId: string) {
			var player = this.servplayer() as Player
			player.place(cardId)
		},
		attackCard(cardId: string) {
			var player = this.servplayer() as Player
			player.attack(cardId)
		},
		endTurn() {
			var player = this.servplayer() as Player
			player.endTurn()
		}
	},
	template: `<div class="Player">
    <div style="float:right">
        <h3>{{ player.name }} ({{ player.id }})</h3>

        <label v-if="player.playing" class="label">Playing</label>
        Mana: {{player.mana }}<br>
        HP: {{player.hp }} / 10<br>
        Deck: {{ player.deckCardIds.length }}<br>
        Graveyard: {{ player.graveyardCardIds.length }}<br>
        <button v-if="player.playing" v-on:click="endTurn" class="button is-primary">End turn</button>
    </div>
    
    <h5>Hand: {{ player.handCardIds.length }}</h5>
    <div>
        <div v-for="(card, id) in getplayer().hand" v-bind:key="card.id" class="Card">
            <span class="CardLabel">
                {{ card.id }}<br>
                {{ card.name }}<br>
                Atk: {{ card.atk }} Def: {{ card.def }}<br>
                Cost: {{ card.cost }}<br>
                <button v-if="player.playing && player.mana >= card.cost" v-on:click="placeCard(card.id)" class="button is-info">Place</button>
            </span>
            <img :src="getImg(card)" style="height: 200px"/>
        </div>
    </div>

    <hr>

    <h5>Board: {{ player.boardCardIds.length }}</h5>
    <div>
        <div v-for="(card, id) in getplayer().board" v-bind:key="card.id" class="Card">
            <span class="CardLabel">
                {{ card.id }}<br>
                {{ card.name }}<br>
                Atk: {{ card.atk }} Def: {{ card.def }}<br>
                Cost: {{ card.cost }}<br>
                <label v-if="card.engaged" class="label">Engaged !</label>
                <button v-if="player.playing && !card.engaged && card.atk > 0" v-on:click="attackCard(card.id)" class="button is-info">Attack</button>
            </span>
            <img :src="getImg(card)" style="height: 200px"/>
        </div>
    </div>

    {{data}}
    </div>`
})
