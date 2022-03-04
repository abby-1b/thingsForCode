
let saveLog = [false]
const _logs = []

function log(...args) {
	args = args.join(" ").split("\n")
	if (saveLog[0]) {
		this._logs.push(...args)
	} else {
		console.log(...args)
	}
}

module.exports = {
	_logs: _logs,
	saveLog: saveLog,
	log: log
}
