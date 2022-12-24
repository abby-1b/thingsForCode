
// This was previously used (relying on `testStack.ts`) to append a value at many arbitrary positions.
// In the end, it's more efficient to use a queue system (FIFO), although the final method used is
// a growing/stretching system.

const val = 0 // The value we'll be inserting
const data = [1.5, 2.5, 3.5, 4.5, 5.5]
const arr = [1, 3, 5, 7]

/// Insert values (old)
// for (let i = 0; i < arr.length; i++) {
// 	data.splice(arr[i], 0, val)
// }

/// Insert values (new)

// Allocate more space (may be faster to push multiple times, or even splice an n-length array to the end)
// Initialize circular stack
const els = arr.length
const stack = new Array(els).fill(0) as number[]
let idx = els - 1, cnt = 0, arrIdx = 0

// const mod = (n: number, m: number) => { return ((n % m) + m) % m }

data.length += els
for (let i = 0; i < data.length; i++) {
	if (data[i] !== undefined) idx = (idx + 1) % els, stack[idx] = data[i], cnt++ // push
	if (i == arr[arrIdx]) {
		// Old: stack[mod(idx - cnt++, els)] = val
		stack[(idx - cnt++ + els) % els] = val // unshift
		arrIdx++
	}
	// Old: data[i] = stack[mod(idx - --cnt, els)]
	data[i] = stack[(idx - --cnt + els) % els] // shift
}

// Print
console.log(data)
