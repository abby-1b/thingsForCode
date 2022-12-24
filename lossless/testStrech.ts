
// A stretching array. When we need to insert values, we append [all the necessary elements needed
// to fit the final array] to the original array. Next, we go from the end of the array and move
// each element to the position closest to the end. When a new element needs to be inserted, we
// put it the closest to the ending we can and continue putting the following elements after it.

const val = 0 // The value we'll be inserting
const data = [1.5, 2.5, 3.5, 4.5] // The data we'll be inserting to
const arr = [1, 4, 4] // The array of position we need to insert at

// First, expand the array
data.length += arr.length

let gap = arr.length, i = 1, arrIdx = arr.length - 1
while (arr[arrIdx] == data.length - arr.length) data[data.length - i] = val, gap--, arrIdx--, i++
for (i = data.length - i; i >= 0; i--) {
	data[i] = data[i - gap]

	if (i - gap == arr[arrIdx]) {
		data[i - gap--] = val
		arrIdx--
	}
}

console.log(data)
