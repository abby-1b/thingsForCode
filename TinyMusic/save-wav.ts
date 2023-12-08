
/** The default sample rate */
export const SAMPLE_RATE = 44100;

function numAsUint32(n: number): [ number, number, number, number ] {
	return [ n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255 ];
}

function numAsUint16(n: number): [ number, number ] {
	return [ n & 255, (n >> 8) & 255 ];
}

function stringAsBytes(s: string): number[] {
	return s.split("").map(e => e.charCodeAt(0))
}

/**
 * Generates a wave file from samples a set of samples
 * @param filename The name of the output file
 * @param samples The samples (in the range -1 to 1)
 * @param sampleRate The samples per second
 */
export async function save(
	filename: string, samples: number[], sampleRate: number
) {
	const SAMPLE_SIZE = 16; // Bits per sample

	// How many samples exist per chunk
	const CHUNK_SIZE = Math.ceil(samples.length / 2) * 2;

	const bytesPerSample = SAMPLE_SIZE / 8;

	const bytes = [
		...stringAsBytes("RIFF"), // "RIFF"
		 0,  0,  0,  0, // Size bytes (they're set later!)
		...stringAsBytes("WAVE"), // "WAVE"
		...stringAsBytes("fmt "), // "fmt "
		...numAsUint32(16), // Subchunk size (size of the following data)
		 1,  0,  1,  0, // Audio format, Channel count
		...numAsUint32(sampleRate), // Sample rate
		...numAsUint32(sampleRate * SAMPLE_SIZE / 8), // Byte rate
		...numAsUint16(SAMPLE_SIZE / 8), // Some math... (indices 33-34)
		...numAsUint16(SAMPLE_SIZE), // Bits per sample
	];

	let sampleIndex = 0;
	let chunkLeft = 0;

	let chunkCount = 0;
	while (sampleIndex < samples.length) {
		if (chunkLeft == 0) {
			// Chunk header
			bytes.push(...stringAsBytes("data"));
			bytes.push(...numAsUint32(CHUNK_SIZE * bytesPerSample)); // Size
			chunkLeft = CHUNK_SIZE + 1;
			chunkCount += 1;
		}

		// Push the byte
		const s = samples[sampleIndex];
		const n = (~~(s * 0x7FFF)) & 0xFFFF;
		bytes.push(...numAsUint16(n));

		chunkLeft -= 1;
		sampleIndex += 1;
	}

	while (chunkLeft != 0) {
		const s = 0;
		const n = (~~(s * 0x7FFF)) & 0xFFFF;
		bytes.push(...numAsUint16(n));
		chunkLeft -= 1;
	}

	console.log("Wrote", chunkCount, "chunks.")

	// Output the file
	await Deno.writeFile(filename, new Uint8Array(bytes));
}

const samples = new Array(44100);

const TWO_PI = Math.PI * 2;
for (let i = 0; i < samples.length; i++) {
	samples[i] = Math.sin((i * TWO_PI / 44100) * 440);
}

// save("out.wav", samples);
