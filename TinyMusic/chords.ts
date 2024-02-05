import { Vibrato } from "./filters.ts";
import { SEMITONE_RATIO } from "./note-data.ts";
import { SAMPLE_RATE, save } from "./save-wav.ts";
import { Noise, Sawtooth, Sine, Sound, Square, mixSounds } from "./sounds.ts";

interface Scale {
	name: string,
	relativeNotes: number[],
}
const scales = {
	major:         { name: "major"        , relativeNotes: [ 0, 2, 4, 5, 7, 9, 11 ] },
	minorNatural:  { name: "minorNatural" , relativeNotes: [ 0, 2, 3, 5, 7, 8, 10 ] },
	minorHarmonic: { name: "minorHarmonic", relativeNotes: [ 0, 2, 3, 5, 7, 8, 11 ] },
	pentatonic:    { name: "pentatonic"   , relativeNotes: [ 0, 2, 4, 7, 9 ] },
};

interface Key {
	tone: number, // The starting tone of the key
	modality: Scale,
}

let time = 0;
let length = 0.5;
let noteType = Sine;
function playNote(
	note: number | undefined,
	key: Key,
	vibrato = false,
	timeOffset?: number
) {
	if (note != undefined) {
		let multiplier = 1;
		while (note >= key.modality.relativeNotes.length) {
			multiplier *= 2;
			note -= key.modality.relativeNotes.length;
		}
		while (note < 0) {
			multiplier /= 2;
			note += key.modality.relativeNotes.length;
		}
		const n = new noteType(
			key.tone * multiplier *
			(SEMITONE_RATIO ** key.modality.relativeNotes[note])
		);
		if (vibrato) n.addFilter(new Vibrato());
		n.setTime(time + (timeOffset ?? 0), time + length + (timeOffset ?? 0));
		sounds.push(n);
	}
	if (!timeOffset) time += length;
}

const sounds: Sound[] = [];

const key: Key = {
	tone: 523.251,
	modality: scales.pentatonic
};


// Melody
noteType = Square;

playNote(0, key);
playNote(0, key);
playNote(4, key);
playNote(4, key);
playNote(5, key);
playNote(5, key);
playNote(4, key, true);
playNote(undefined, key);

playNote(3, key);
playNote(3, key);
playNote(2, key);
playNote(2, key);
playNote(1, key);
playNote(1, key);

// Major 7th chord (beautiful)
playNote(0, key, true, 0.001);
playNote(2, key, true, 0.05);
playNote(4, key, true, 0.10);
playNote(6, key, true, 0.15);

// Sub-melody
time = 0;
length /= 2;
noteType = Sine;

playNote(0, key);
playNote(4, key);
playNote(2, key);
playNote(4, key);
playNote(0, key);
playNote(4, key);
playNote(2, key);
playNote(4, key);

playNote(0, key);
playNote(5, key);
playNote(3, key);
playNote(5, key);
playNote(0, key);
playNote(4, key);
playNote(2, key);
playNote(4, key);

playNote(-1, key);
playNote(4, key);
playNote(1, key);
playNote(4, key);
playNote(0, key);
playNote(4, key);
playNote(2, key);
playNote(4, key);

playNote(-1, key);
playNote(4, key);
playNote(1, key);
playNote(4, key);

// "Drums"
time = 0;
length /= 4;
noteType = Noise;

for (let i = 0; i < 14; i++) {
	playNote(undefined, key);
	playNote(undefined, key);
	playNote(undefined, key);
	playNote(undefined, key);
	playNote(0, key, false);
	playNote(undefined, key);
	playNote(undefined, key);
	playNote(undefined, key);
}

const samples = mixSounds(sounds);
save("out.wav", samples, SAMPLE_RATE);
