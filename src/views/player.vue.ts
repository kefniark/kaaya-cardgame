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
		},
		skill() {
			var player = this.servplayer() as Player
			player.skill()
		}
	},
	template: `<div class="Player">
    <div style="float:right">
        <b>Mana</b>: {{player.mana }}<br>
        <b>HP</b>: {{player.hp }} / 16<br>
        XP: {{player.xp }}<br>
        Deck: {{ player.deckCardIds.length }}<br>
        Graveyard: {{ player.graveyardCardIds.length }}
        <br><br>
        <button v-if="player.playing" v-on:click="endTurn" class="button is-primary">End turn</button>
        <button v-if="player.playing && player.xp >= 10" v-on:click="skill" class="button is-primary">Use skill</button>
    </div>
    
    <h3 class="title is-3">
        <b>{{ player.name }}</b> ({{ player.id }})
        <label v-if="player.playing" class="label">Playing</label>
        <label v-if="player.winning" class="label">Win !!!</label>
        <label v-if="player.losing" class="label">Lose !!!</label>
    </h3>
    <h4 class="title is-4">Hand: {{ player.handCardIds.length }}</h4>
    <div>
        <div v-for="(card, id) in getplayer().hand" v-bind:key="card.id" class="Card">
            <span class="CardLabel">
                {{ card.name }} (Lv.{{ card.level }})<br>
                Atk: {{ card.modifiedAtk }}
                <span v-if="card.atk !== card.modifiedAtk">({{card.modifiedAtk - card.atk}})</span>
                <br>
                Def: {{ card.modifiedDef }}
                <span v-if="card.def !== card.modifiedDef">({{card.modifiedDef - card.def}})</span>
                <br>
                <small>{{ card.id }}</small> | Cost:{{ card.cost }}<br>
                <button v-if="player.playing && player.mana >= card.cost" v-on:click="placeCard(card.id)" class="button is-info">Place</button>
            </span>
            <img :src="getImg(card)" style="height: 210px"/>
        </div>
    </div>

    <hr>

    <h4 class="title is-4">Board: {{ player.boardCardIds.length }}</h4>
    <div>
        <div v-for="(card, id) in getplayer().board" v-bind:key="card.id" class="Card">
            <span class="CardLabel">
                {{ card.name }} (Lv.{{ card.level }})<br>
                Atk: {{ card.modifiedAtk }}
                <span v-if="card.atk !== card.modifiedAtk">({{card.atk}}{{(card.modifiedAtk - card.atk >= 0) ? '+' : '' }}{{card.modifiedAtk - card.atk}})</span>
                <br>
                Def: {{ card.modifiedDef }}
                <span v-if="card.def !== card.modifiedDef">({{card.def}}{{(card.modifiedDef - card.def >= 0) ? '+' : '' }}{{card.modifiedDef - card.def}})</span>
                <br>
                <small>{{ card.id }}</small> | Cost:{{ card.cost }}<br>
                <!-- <label v-if="card.tap" class="label">Tap !</label> -->
                <button v-if="player.playing && !card.tap && card.modifiedAtk > 0" v-on:click="attackCard(card.id)" class="button is-info">Attack</button>
            </span>
            <img :src="getImg(card)" style="height: 210px"/>
        </div>
    </div>

    {{data}}
    </div>`
})
