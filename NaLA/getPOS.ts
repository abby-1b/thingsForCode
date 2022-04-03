
// A sentence has words and their corresponding types.
type POSSentence = { words: string, types: string[] }

// Read sentences from `sentences.json`
const sentences: POSSentence[] = (() => {
	const sentenceString = Deno.readTextFileSync("BasePOS.json")
	return JSON.parse(sentenceString)
})()

// Stores all word types
const wordTypes: {[key: string]: string} = {}

function dealWithWord(words: string[], types: string[], idx: number) {
	// If this is a new word, put it in the dict and return
	if (!(words[idx] in wordTypes))
		return wordTypes[words[idx]] = types[idx]
	
	// If the the word exists, we need to check it's the same type
	if (types[idx] == wordTypes[words[idx]]) return

	// If it's not the same type, then yikes
	console.log("Mismatch\t",
		`"${words[idx]}"   ${wordTypes[words[idx]]}`,
		"->", types[idx])

	if (idx == 0) {
		// The index is zero, so just tag it as the first word.
		return wordTypes["[0]" + words[idx]]
	} else {
		// The index is not zero, so tag it with the previous tag.
		return wordTypes[`{${types[idx - 1]}}` + words[idx]] = types[idx]
	}
}

for (let s in sentences) {
	// Tokenizes words, taking punctuation into account
	const words = sentences[s].words
		.split(/( |(?=[!?,.'])|(?<=[!?,.]))/g)
		.filter(e => e != ' ' && e != '')
	
	// If there's more/less words than types, then either tokenization
	// failed or the sentence is written wrong. It's usually the sentence
	if (words.length != sentences[s].types.length)
		console.log("Length mismatch in:", words.join(" "))

	// Go through each sentence tokenizing its words accordingly
	for (let w = 0; w < words.length; w++)
		dealWithWord(words, sentences[s].types, w)
}

// Compress dictionary into array
const compWords = []
for (let w in wordTypes)
	compWords.push(w, wordTypes[w])
const out = compWords.join('|')

console.log(out.length)

// 274 JSON length > 168 BSV length
// BSV is Bar Separated Values, just like CSV lmao
// I just think it's less likely for me to need a bar over a comma.
Deno.writeTextFileSync("POS.bsv", out)
