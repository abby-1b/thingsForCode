
const arr = new Array(100000).fill(0).map((_e, _i, a) => Math.round(Math.random() * a.length))

function quicksort(arr: number[]): number[] {
	if (arr.length < 2) return arr
	const less: number[] = []
	let eq = 0
	const more: number[] = []
	const i = ~~(arr.length / 2)
	for (let e = 0; e < arr.length; e++) {
		if (arr[e] < arr[i])
			less.push(arr[e])
		else if (arr[e] > arr[i])
			more.push(arr[e])
		else eq++
	}
	return [...quicksort(less), ...new Array(eq).fill(arr[i]), ...quicksort(more)]
}

function quicksort2(arr: number[]): number[] {
	if (arr.length < 2) return arr
	const less: number[] = []
	let eq = 0
	const more: number[] = []
	const i = arr.length - 1
	for (let e = 0; e < arr.length; e++) {
		if (arr[e] < arr[i])
			less.push(arr[e])
		else if (arr[e] > arr[i])
			more.push(arr[e])
		else eq++
	}
	return [...quicksort2(less), ...new Array(eq).fill(arr[i]), ...quicksort2(more)]
}

function time(arr: number[], fn: (arr: number[]) => number[]) {
	const t = performance.now()
	for (let g = 0; g < 50; g++) fn(arr)
	console.log(performance.now() - t)
}

time(arr, quicksort)
time(arr, quicksort2)
