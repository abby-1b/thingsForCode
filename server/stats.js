
function tc(n) { return ((n + '').length == 1 ? "0" + n : n) }

function getTime() {
	let d = new Date()
	return tc(d.getHours()) + ':' + tc(d.getMinutes()) + ':' + tc(d.getSeconds())
}

module.exports = {
	getTime
}
