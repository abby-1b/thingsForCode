
import { GameEvent } from "./events.ts"
import { Team, TeamNames, color } from "./teams.ts"

const SwordDamage = {
	wood: 0.1,
	stone: 0.2,
	iron: 0.4,
	diamond: 0.6
}

const ArmorMultiplier = [
	1.0, // Leather
	1.7, // Iron
	2.2, // Diamond
]

class Resources {
	irn = 0
	gld = 0
	dia = 0
	ems = 0

	blocks = 0
	gapple = 0
	fireball = 0
	pearl = 0
	bow = 0

	stoneSword = 0
	ironSword = 0
	diamondSword = 0

	constructor() {}
	getBestAttack(): number {
		if (this.diamondSword > 0) return SwordDamage.diamond
		if (this.ironSword    > 0) return SwordDamage.iron
		if (this.stoneSword   > 0) return SwordDamage.stone
		return SwordDamage.wood
	}
}

export class Player {
	static bridgeTime = 30
	static bridgeFail = 0.3

	static godChance = 0.1

	static fightTime = 10
	
	static thinkChance = 0.05
	static thinkTime = 2

	doing!: Event

	inventory = new Resources()
	chest = new Resources()
	health = 1
	armor = 0

	godLevel = 0
	level = 1
	team: Team
	constructor(team: Team) {
		this.team = team
		this.level = Math.floor(Math.random() * 200) + 5
		if (Math.random() < Player.godChance) this.godLevel += Math.floor(Math.random() * 40)
	}

	toString(full = true): string {
		return color(`[${TeamNames[this.team]} ♡${Math.floor(this.health * 20)}]` + (full ? " { }" : ""), this.team)
	}

	getFightLevel(): number {
		return ArmorMultiplier[this.armor] * this.health * (this.level + this.godLevel + this.inventory.getBestAttack() * 20)
	}

	fight(player: Player): GameEvent {
		const selfLevel = this.getFightLevel()
		const otherLevel = player.getFightLevel()
		const winChance = selfLevel <= otherLevel
			? (selfLevel / (2 * otherLevel))
			: (1 - (otherLevel / (2 * selfLevel)))
		return {
			time: Player.fightTime,
			end: () => {
				if (Math.random() < winChance) player.die(), this.health = winChance
				if (Math.random() < winChance) this.die(), player.health = winChance
			}
		}
	}

	die() {
		this.health = 1
		// this.doing = 
	}
}
