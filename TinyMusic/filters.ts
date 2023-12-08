import { Sound } from "./sounds.ts";

export type FilterReturn = {
	time: number,
	sample: number,
};

export interface Filter {
	type: "presample" | "normal" | "volonly"
	fn: (time: number, sample: number, sound: Sound) => FilterReturn,
}

const VOL_CHANGE_TIME = 0.1; // How long to change the volume (in seconds)
export const FadeInOut: Filter = {
	type: "volonly",
	fn: function fn(time: number, sample: number, sound: Sound): FilterReturn {
		if (time < sound.timeStart || time > sound.timeEnd) return { time, sample };
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

export const Vibrato: Filter = {
	type: "presample",
	fn: function fn(time: number, sample: number, sound: Sound): FilterReturn {
		const dst = 1 / (5 * (time - sound.timeEnd) ** 2 + 1); // Distance to end
		return { time: time + Math.sin(time * 40) * 0.0029 * dst, sample };
	}
};
