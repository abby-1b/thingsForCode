
const letterScores = "etaoinshrdlcumwfgypbvkjxqz";
function getWordScore(w: string): number {
	let score = 0;
	let idx = 0;
	for (const l of w) {
		score += 1 + letterScores.indexOf(l) * 0.05;
		if (w.indexOf(l) != idx) score += 1;
		idx += 1;
	}
	return score;
}

const words = (await Deno.readTextFile("./words.txt")).split("\n");

const lNegative: string[] = "oatnhi".split("");
const lPositive: string[] = "ers".split("");
const lCorrect : string[] = [ "", "", "", "", "" ];
const lWrong   : string[] = [ "", "e", "", "re", "s" ];

const possible: string[] = [];
for (const w of words) {
	let shouldSkip = false;
	for (const l of lNegative) {
		if (w.includes(l)) {
			shouldSkip = true;
			break;
		}
	}
	if (shouldSkip) continue;

	for (const l of lPositive) {
		if (!w.includes(l)) {
			shouldSkip = true;
			break;
		}
	}
	if (shouldSkip) continue;

	let idx = -1;
	for (const l of lCorrect) {
		idx += 1;
		if (l.length == 0) { continue; }
		if (w[idx] != l) {
			shouldSkip = true;
			break;
		}
	}
	if (shouldSkip) continue;

	idx = -1;
	for (const l of lWrong) {
		idx += 1;
		if (l.length == 0) { continue; }
		if (l.includes(w[idx])) {
			shouldSkip = true;
			break;
		}
	}
	if (shouldSkip) continue;

	possible.push(w);
}

const sortedPossible: [string, number][] = possible.map(w => [w, getWordScore(w)])

sortedPossible.sort((a, b) => a[1] - b[1])

for (const w of sortedPossible.slice(0, 20)) {
	console.log(w)
}
console.log("...")
