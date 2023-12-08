import { SEMITONE_RATIO } from "./note-data.ts";
import { Sound } from "./sounds.ts";

export type FilterReturn = {
	time: number,
	sample: number,
};

export abstract class Filter {
	public static type: "presample" | "normal" | "volonly"
	get type() { return (this.constructor as typeof Filter).type; }
	abstract fn(time: number, sample: number, sound: Sound): FilterReturn;
}

const VOL_CHANGE_TIME = 0.05; // How long to change the volume (in seconds)
export class FadeInOut extends Filter {
	public static type = "volonly" as const;
	fn(time: number, sample: number, sound: Sound): FilterReturn {
		if (time < sound.timeStart || time > sound.timeEnd) return { time, sample: 0 };
		const startEnvelope = time >= (sound.timeStart + VOL_CHANGE_TIME) ? 1 :
			1 - ((1 / VOL_CHANGE_TIME) * time - (sound.timeStart + VOL_CHANGE_TIME) / VOL_CHANGE_TIME) ** 2;
		const endEnvelope = time <= (sound.timeEnd - VOL_CHANGE_TIME) ? 1 :
			1 - ((1 / VOL_CHANGE_TIME) * time - (sound.timeEnd - VOL_CHANGE_TIME) / VOL_CHANGE_TIME) ** 2;
		return {
			time,
			sample: sample * startEnvelope * endEnvelope
		};
	}
};

export class FadeOut extends Filter {
	public static type = "volonly" as const;
	fn(time: number,sample: number,sound: Sound): FilterReturn {
		if (time < sound.timeStart || time > sound.timeEnd) return { time, sample: 0 };
		const timeScaled = (time - sound.timeStart) / (sound.timeEnd - sound.timeStart);
		return {
			time,
			sample: sample * ((timeScaled - 1) ** 2) // Parabola
		}
	}
}

export class Vibrato extends Filter {
	public static type = "presample" as const;

	private amplitude: number;
	private multiplier: number;

	/**
	 * Creates a new vibrato filter
	 * @param shiftAmount How many semitones to pitch-shift when doing vibrato
	 * @param perSecond How many times to do vibrato per second
	 */
	constructor(
		shiftAmount: number = 0.5,
		perSecond: number = 7,
	) {
		super();
		this.amplitude = ((SEMITONE_RATIO ** shiftAmount) - (1 / (SEMITONE_RATIO ** shiftAmount))) / 2;
		this.multiplier = perSecond * Math.PI * 2;
		this.amplitude /= this.multiplier;
	}

	fn(time: number, sample: number, sound: Sound): FilterReturn {
		const dst = 1 / (3 * (time - sound.timeEnd) ** 2 + 1); // Distance to end
		return { time: time + Math.cos(time * this.multiplier) * this.amplitude * dst, sample };
	}
};
