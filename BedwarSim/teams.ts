import * as colors from "https://deno.land/std@0.149.0/fmt/colors.ts"

export enum Team {
	RED,
	BLUE,
	GREEN,
	YELLOW,
	AQUA,
	WHITE,
	PINK,
	GRAY
}

export const TeamNames = [
	"RED   ",
	"BLUE  ",
	"GREEN ",
	"YELLOW",
	"AQUA  ",
	"WHITE ",
	"PINK  ",
	"GRAY  ",
]

export function color(str: string, team: Team) {
	if (team == Team.RED	) return colors.red(str)
	if (team == Team.BLUE	) return colors.blue(str)
	if (team == Team.GREEN	) return colors.green(str)
	if (team == Team.YELLOW	) return colors.yellow(str)
	if (team == Team.AQUA	) return colors.cyan(str)
	if (team == Team.WHITE	) return colors.white(str)
	if (team == Team.PINK	) return colors.magenta(str)
	if (team == Team.GRAY	) return colors.gray(str)
	return str
}
