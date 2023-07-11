
function timeToMillis(time: string): number {
	const split = time.split(":")
	return parseInt(split[split.length - 1])
		+ (split.length > 1 ? parseInt(split[split.length - 2]) : 0) * 60
		+ (split.length > 2 ? parseInt(split[split.length - 3]) : 0) * 3600
}
