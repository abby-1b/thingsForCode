
const allowedLetters = "qwertyuiopasdfghjklzxcvbnm";

const allWords = new Set(
		(await Deno.readTextFile("./all-words.txt"))
		.toLowerCase()
		.split("\n")
);

const words = [...allWords]
	.map(w => w.trim())
	.filter(w => w.length == 5)
	.filter(w => {
		return allowedLetters.includes(w[0])
			&& allowedLetters.includes(w[1])
			&& allowedLetters.includes(w[2])
			&& allowedLetters.includes(w[3])
			&& allowedLetters.includes(w[4])
	});

await Deno.writeTextFile("words.txt", words.join("\n"));
