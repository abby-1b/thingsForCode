import { Filter, FadeInOut, Vibrato } from "./filters.ts";
import { save } from "./save-wav.ts";

const SAMPLE_RATE = 44100;

export class Sound {
	public timeStart = 0; // Start time (in seconds)
	public timeEnd = 0; // End time (in seconds)

	private filters: Filter[] = [ FadeInOut ];

	public addFilter(filter: Filter) {
		this.filters.push(filter);
	}

	public setTime(start: number, end: number): this {
		this.timeStart = start;
		this.timeEnd = end;
		return this;
	}

	public getSample(time: number): number {
		time;
		return 0;
	}

	public getFinalSample(time: number): number {
		// Get sample
		let sample = this.getSample(time);

		// Adjust volume
		for (const filter of this.filters) {
			if (filter.type != "volonly") continue;
			sample *= filter.fn(time, 1, this).sample;
		}

		// Run time warp
		for (const filter of this.filters) {
			if (filter.type != "presample") continue;
			time = filter.fn(time, 1, this).time;
		}

		// Run remaining filters
		for (const filter of this.filters) {
			if (
				filter.type == "presample" || filter.type == "volonly"
			) continue;
			const out = filter.fn(time, sample, this);
			time = out.time;
			sample = out.sample;
		}
		return sample;
	}
}

export class Sine extends Sound {
	public frequency = 1;
	constructor(freq: number) {
		super();
		this.frequency = freq;
	}

	public getSample(time: number) {
		return Math.sin((time * Math.PI * 2) * this.frequency);
	}
}

export class Square extends Sound {
	public frequency = 1;
	constructor(freq: number) {
		super();
		this.frequency = freq;
	}

	public getSample(time: number) {
		return (time % (1 / this.frequency)) * this.frequency < 0.5 ? -1 : 1;
	}
}

export class Triangle extends Sound {
	public frequency = 1;
	constructor(freq: number) {
		super();
		this.frequency = freq;
	}

	public getSample(time: number) {
		return (time % (1 / this.frequency)) * this.frequency * 2 - 1;
	}
}

/**
 * Mixes sounds together
 * @param s The sounds to be mixed
 */
function mixSounds(sounds: Sound[]): number[] {
	let lengthInSeconds = 0;
	for (const sound of sounds) {
		sound.addFilter(Vibrato);
		if (sound.timeEnd > lengthInSeconds) {
			lengthInSeconds = sound.timeEnd;
		}
	}
	const sampleCount = Math.ceil(lengthInSeconds * SAMPLE_RATE);
	const samples: number[] = new Array(sampleCount).fill(0);

	// Add the sounds in!
	for (const sound of sounds) {
		const endSample = Math.ceil(sound.timeEnd * SAMPLE_RATE);
		for (let s = ~~(sound.timeStart * SAMPLE_RATE); s < endSample; s++) {
			const time = s / SAMPLE_RATE;
			samples[s] += sound.getFinalSample(time);
		}
	}

	// Get the max value (abs)
	let max = 0;
	for (let s = 0; s < sampleCount; s++) {
		if (Math.abs(samples[s]) > max) {
			max = Math.abs(samples[s]);
		}
	}
	max += 0.005;

	// Normalize the volume
	for (let s = 0; s < sampleCount; s++) {
		samples[s] /= max;
	}

	return samples;
}

const sounds: Sound[] = [];

const NOTE = Math.pow(2, 1 / 12);

sounds.push(new Sine(440 * (NOTE **  0)).setTime(0.00, 2));
sounds.push(new Sine(440 * (NOTE **  4)).setTime(0.05, 2));
sounds.push(new Sine(440 * (NOTE **  7)).setTime(0.10, 2));
sounds.push(new Sine(440 * (NOTE ** 11)).setTime(0.15, 2));

sounds.push(new Sine(440 * (NOTE **  0)).setTime(2.00 + 0.15, 4));
sounds.push(new Sine(440 * (NOTE **  4)).setTime(2.05 + 0.15, 4));
sounds.push(new Sine(440 * (NOTE **  7)).setTime(2.10 + 0.15, 4));
sounds.push(new Sine(440 * (NOTE ** 10)).setTime(2.15 + 0.15, 4));

// sounds.push(new Square(440 * (1.05946309436 **  0)).setTime(4.00, 6.00));

// sounds.push(new Sine(440 * (1.05946309436 **  0)).setTime(4.00, 4.20 + 0.08));
// sounds.push(new Sine(440 * (1.05946309436 **  1)).setTime(4.20, 4.40 + 0.08));
// sounds.push(new Sine(440 * (1.05946309436 **  0)).setTime(4.40, 4.60 + 0.08));
// sounds.push(new Sine(440 * (1.05946309436 **  1)).setTime(4.60, 4.80 + 0.08));

// sounds.push(new Vibrato(new Square(440 * (1.05946309436 **  0)).setTime(4.80, 5.00 + 0.08)));
// sounds.push(new Vibrato(new Square(440 * (1.05946309436 **  1)).setTime(5.00, 5.20 + 0.08)));
// sounds.push(new Vibrato(new Square(440 * (1.05946309436 **  0)).setTime(5.20, 5.40 + 0.08)));
// sounds.push(new Vibrato(new Square(440 * (1.05946309436 **  1)).setTime(5.40, 5.60 + 0.08)));

const samples = mixSounds(sounds);
save("out.wav", samples, SAMPLE_RATE);
