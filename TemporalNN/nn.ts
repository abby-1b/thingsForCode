
type Neuron = [
	number, // current activation
	number[], // other neuron weights
	number, // Activation threshold
	number, // Next activation
]

type TrainingData = number[][][]

const actFn = (n: number) => 1 / (1 + Math.exp(n))//Math.tanh(n)

export class NN {
	activation = 0.5
	steps = 10

	num: number // The number of neurons.
	neurons: Neuron[]

	inputs: number[] = []
	outputs: number[] = []

	/**
	 * @param num The number of neurons that are present in the network.
	 */
	constructor(inputs: number, outputs: number, num?: number) {
		num = num ?? (inputs + outputs) * 2
		this.num = num
		this.neurons = new Array(num)
		for (let n = 0; n < num; n++) {
			this.neurons[n] = [0, new Array(num), this.activation, 0]
			for (let w = 0; w < num; w++) {
				this.neurons[n][1][w] = Math.random() * 2 - 1
			}
		}

		// Pick input and output neurons
		for (let i = 0; i < inputs; i++)
			this.inputs.push(i)
		for (let o = 0; o < outputs; o++)
			this.outputs.push(o + inputs)
	}

	clear() {
		for (let i = 0; i < this.num; i++)
			this.neurons[i][0] = 0, this.neurons[i][3] = 0
	}
	setInputs(vals: number[]) {
		for (let i = 0; i < vals.length; i++)
			this.neurons[this.inputs[i]][0] = vals[i]
	}

	input(vals: number[]): number[] {
		if (vals.length != this.inputs.length) { console.log("Not the same number of inputs!") }

		// Clear
		this.clear()

		// Do steps
		for (let s = 0; s < this.steps; s++) {
			this.setInputs(vals)
			this.step()
		}

		// Get outputs
		const ret: number[] = []
		for (let o = 0; o < this.outputs.length; o++)
			ret.push(this.neurons[this.outputs[o]][0])
		return ret
	}

	step() {
		/// A step has two phases.

		/// First, add the weighted sums to every neuron's "future" activation.
		for (let i = 0; i < this.num; i++) {
			// If this neuron's activation reaches the threshold
			if (this.neurons[i][0] >= this.neurons[i][2]) {
				// Reset its activation and propagate to others.

				// TODO: (if neccessary for non-linearity) use a non-linear function on the weighted sum.
				for (let n = 0; n < this.num; n++)
					this.neurons[n][3] += this.neurons[i][1][n]
					// this.neurons[n][3] += this.neurons[i][0] * this.neurons[i][1][n]
			}
		}

		/// Then, set each neuron's activation to its future activation, and set the future activations to zero.
		for (let i = 0; i < this.num; i++) {
			const didActivate = this.neurons[i][0] >= this.neurons[i][2]
			this.neurons[i][0] += this.neurons[i][3]
			this.neurons[i][3] = 0
			if (didActivate) {
				this.neurons[i][0] = actFn(this.neurons[i][0])
			}
		}
	}

	loss(dat: TrainingData): number {
		// if (given.length != expected.length) console.log("Error: data set size doesn't match output size!")
		let ret = 0
		for (let d = 0; d < dat.length; d++) {
			const given = this.input(dat[d][0])
			const expected = dat[d][1]
			for (let i = 0; i < given.length; i++)
				ret += (given[i] - expected[i]) ** 2
		}
		return ret
	}

	train(dat: TrainingData, epochs: number) {
		const amt = 10

		let oldLoss = this.loss(dat)
		for (let e = 0; e < epochs; e++) {
			// Get a random neuron and a random weight to mutate
			const i = Math.floor((Math.random() * 10) % this.num)
			const w = Math.floor((Math.random() * 10) % this.num)

			const a = (Math.random() * 2 - 1) * amt
			this.neurons[i][1][w] += a
			const newLoss = this.loss(dat)
			if (newLoss <= oldLoss)
				oldLoss = newLoss
			else
				this.neurons[i][1][w] -= a
		}
	}

	trainTo(dat: TrainingData, desiredLoss: number) {
		const amt = 10

		let epochs = 0
		let oldLoss = this.loss(dat)
		while (oldLoss > desiredLoss) {
			// Get a random neuron and a random weight to mutate
			const i = Math.floor((Math.random() * 10) % this.num)
			const w = Math.floor((Math.random() * 10) % this.num)

			const a = (Math.random() * 2 - 1) * amt
			this.neurons[i][1][w] += a
			const newLoss = this.loss(dat)
			if (newLoss <= oldLoss)
				oldLoss = newLoss
			else
				this.neurons[i][1][w] -= a
			epochs++
		}
		return epochs
	}
}
